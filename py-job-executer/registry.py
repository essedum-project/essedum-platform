"""Model Registry and Agent Registry writers.

Model Registry  -> `mlfederatedmodels`, the table the Models UI reads.
Agent Registry  -> `agent_directory` plus its 12 child tables, and
                   `tool_parameters` nested under `tools`.

Payload field names follow the Java DTOs so a record written here is shaped the
way the rest of the platform expects:
  * models -> ICIPMLFederatedModelDTO (name, organisation, dataSource, type, ...)
  * agents -> AgentDirectoryDTO (snake_case: alias, interface_type, extras_json, ...)

Common snake_case spellings are accepted as aliases, because the two registries
disagree on one word -- models use the British `organisation` (that is the
column name) while agents use `organization`. Silently writing NULL because a
caller guessed the other spelling is a worse failure than accepting both.
"""

import json
import logging
from datetime import datetime

from registry_db import (
    AGENT_TABLE,
    MODEL_TABLE,
    PIPELINE_TABLE,
    RegistryConflict,
    RegistryNotFound,
    RegistryValidationError,
    qualify,
    quote_ident,
    registry_cursor,
    require_enabled,
)

# Gets or creates a logger
logger = logging.getLogger(__name__)

# set log level
logger.setLevel(logging.INFO)

# define file handler and set formatter
file_handler = logging.FileHandler('logfile.log')
formatter    = logging.Formatter('%(asctime)s : %(levelname)s : %(name)s : %(message)s')
file_handler.setFormatter(formatter)

# add file handler to logger
logger.addHandler(file_handler)

# Audit columns are stamped with this when the caller does not say who it is.
DEFAULT_ACTOR = 'py-job-executer'


# ---------------------------------------------------------------------------
# payload helpers
# ---------------------------------------------------------------------------

def _as_dict(payload):
    if not isinstance(payload, dict):
        raise RegistryValidationError("Request body must be a JSON object")
    return payload


def _normalise(payload, aliases):
    """Copy the payload, folding alias keys onto their canonical names."""
    data = dict(payload)
    for alias, canonical in aliases.items():
        if alias in data and canonical not in data:
            data[canonical] = data[alias]
    return data


def _to_text(value):
    """Render a value for a string column, JSON-encoding dicts and lists.

    Java holds `attributes`, `connection_details` and `extras_json` as Strings,
    but a Python caller will naturally pass a dict. Encoding it here saves every
    pipeline script from remembering to call json.dumps.
    """
    if value is None:
        return None
    if isinstance(value, (dict, list)):
        return json.dumps(value)
    if isinstance(value, bool):
        return 'true' if value else 'false'
    return str(value)


def _required(data, key, max_length=None):
    value = _to_text(data.get(key))
    if value is None or not value.strip():
        raise RegistryValidationError(
            "'{0}' is required and cannot be blank".format(key), field=key
        )
    value = value.strip()
    return _length_checked(value, key, max_length)


def _optional(data, key, max_length=None):
    value = _to_text(data.get(key))
    if value is None:
        return None
    value = value.strip()
    if not value:
        return None
    return _length_checked(value, key, max_length)


def _length_checked(value, key, max_length):
    """Reject over-long values instead of letting MySQL truncate or throw.

    MySQL in non-strict mode silently truncates, which would put a corrupted
    record in front of the UI; in strict mode it raises a DataError that reads
    as a server fault rather than a bad request.
    """
    if max_length is not None and len(value) > max_length:
        raise RegistryValidationError(
            "'{0}' is {1} characters but the column allows at most {2}".format(
                key, len(value), max_length
            ),
            field=key,
        )
    return value


def _passthrough(data, key):
    """Return a DATETIME-ish value untouched for MySQL to validate.

    Accepting only pre-parsed datetimes would force every caller to parse, and
    re-implementing MySQL's date parsing here would just disagree with it in new
    ways. An unparseable value fails the transaction and rolls back cleanly.
    """
    value = data.get(key)
    if value is None:
        return None
    if isinstance(value, str) and not value.strip():
        return None
    return value


# ---------------------------------------------------------------------------
# Model Registry -> mlfederatedmodels
# ---------------------------------------------------------------------------

# Every string column in mlfederatedmodels is VARCHAR(255) -- including
# `attributes`, which is expected to hold JSON. That is a pre-existing schema
# constraint (cip_2v13to300.xml changeSet 3v0-cip-18), not one this module adds.
MODEL_COLUMN_MAX = 255

_MODEL_ALIASES = {
    'model_name': 'name',
    'modelName': 'name',
    'organization': 'organisation',
    'data_source': 'dataSource',
    'datasource': 'dataSource',
    'model_type': 'type',
    'modelType': 'type',
    'created_by': 'createdBy',
}


def create_model(payload):
    """Insert a row into `mlfederatedmodels`.

    Returns ``{"id", "model_name", "organisation"}``.

    A duplicate ``(model_name, organisation)`` raises RegistryConflict -> HTTP
    409. The equivalent Java check (ICIPMlopsController.registerModels) answers
    400; 409 is the more useful answer here because the caller is a pipeline
    script that may be retrying, not a form.
    """
    require_enabled()
    data = _normalise(_as_dict(payload), _MODEL_ALIASES)

    name = _required(data, 'name', MODEL_COLUMN_MAX)
    organisation = _required(data, 'organisation', MODEL_COLUMN_MAX)
    description = _optional(data, 'description', MODEL_COLUMN_MAX)
    version = _optional(data, 'version', MODEL_COLUMN_MAX)
    data_source = _optional(data, 'dataSource', MODEL_COLUMN_MAX)
    attributes = _optional(data, 'attributes', MODEL_COLUMN_MAX)
    model_type = _optional(data, 'type', MODEL_COLUMN_MAX)
    created_by = _optional(data, 'createdBy', MODEL_COLUMN_MAX) or DEFAULT_ACTOR

    table = quote_ident(MODEL_TABLE)
    now = datetime.now()

    with registry_cursor() as (_, cursor):
        cursor.execute(
            "SELECT id FROM {0} WHERE model_name = %s AND organisation = %s "
            "LIMIT 1".format(table),
            (name, organisation),
        )
        if cursor.fetchone():
            raise RegistryConflict(
                "Model with name '{0}' already exists".format(name)
            )

        cursor.execute(
            "INSERT INTO {0} (model_name, description, version, data_source, "
            "attributes, organisation, model_type, created_on, created_by) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)".format(table),
            (name, description, version, data_source, attributes,
             organisation, model_type, now, created_by),
        )
        model_id = cursor.lastrowid

    logger.info("Registered model id=%s name=%s org=%s", model_id, name, organisation)
    return {"id": model_id, "model_name": name, "organisation": organisation}


def get_model(name, organisation):
    """Look a model up by its natural key. Raises RegistryNotFound if absent."""
    require_enabled()
    if not (name or '').strip():
        raise RegistryValidationError("'name' query parameter is required", field='name')
    if not (organisation or '').strip():
        raise RegistryValidationError(
            "'organisation' query parameter is required", field='organisation'
        )

    with registry_cursor() as (_, cursor):
        cursor.execute(
            "SELECT id, model_name, description, version, data_source, attributes, "
            "organisation, model_type, created_on, created_by, app_modified_date, "
            "app_modified_by FROM {0} WHERE model_name = %s AND organisation = %s "
            "LIMIT 1".format(quote_ident(MODEL_TABLE)),
            (name.strip(), organisation.strip()),
        )
        row = cursor.fetchone()

    if row is None:
        raise RegistryNotFound(
            "No model named '{0}' in organisation '{1}'".format(name, organisation)
        )
    return row


# ---------------------------------------------------------------------------
# Agent Registry -> agent_directory (+ children)
# ---------------------------------------------------------------------------

# Column widths from cip.xml changeSet 3v0-cip-147. `description` and
# `connection_details` are TEXT, so they carry no limit here.
_AGENT_ALIASES = {
    'interfaceType': 'interface_type',
    'connectionDetails': 'connection_details',
    'extrasJson': 'extras_json',
    'pipelineId': 'pipeline_id',
    'pipelineName': 'pipeline_name',
    'lastModifiedBy': 'last_modified_by',
    'organisation': 'organization',
}

# Each child table hangs off agent_directory.cid via `entity_id`. `dedupe`
# names the columns covered by that table's unique constraint; duplicates within
# one payload are collapsed rather than being allowed to roll back the whole
# agent. `locators` is the one child table with no unique constraint.
_CHILD_SPECS = (
    {
        "key": "modules", "table": "modules", "dedupe": ("name",),
        "fields": (("name", "name", True, 128),),
    },
    {
        "key": "skills", "table": "skills", "dedupe": ("name",),
        "fields": (("name", "name", True, 128),),
    },
    {
        "key": "domains", "table": "domains", "dedupe": ("name",),
        "fields": (("name", "name", True, 128),
                   ("description", "description", False, None)),
    },
    {
        "key": "locators", "table": "locators", "dedupe": None,
        "fields": (("locator_type", "locator_type", True, 256),
                   ("url", "url", True, 256)),
    },
    {
        "key": "syncs", "table": "syncs", "dedupe": ("target",),
        "fields": (("target", "target", True, 256),
                   ("frequency", "frequency", False, 256),
                   ("last_sync", "last_sync", "datetime", None)),
    },
    {
        "key": "publications", "table": "publications",
        "dedupe": ("channel", "published_date"),
        "fields": (("channel", "channel", True, 128),
                   ("published_date", "published_date", "datetime", None),
                   ("status", "status", False, 128)),
    },
    {
        "key": "extensions", "table": "extensions", "dedupe": ("key",),
        "fields": (("key", "ext_key", True, 128),
                   ("value", "ext_value", False, 1024),
                   ("description", "description", False, None)),
    },
    {
        "key": "selectors", "table": "selectors", "dedupe": ("key",),
        "fields": (("key", "sel_key", True, 128),
                   ("value", "sel_value", False, 1024)),
    },
    {
        "key": "signatures", "table": "signatures",
        "dedupe": ("algorithm", "value"),
        "fields": (("algorithm", "algorithm", True, 64),
                   ("value", "value", False, 512),
                   ("certificate", "certificate", False, 256)),
    },
    {
        "key": "resources", "table": "resources", "dedupe": ("name",),
        "fields": (("name", "name", True, 128),
                   ("description", "description", False, None),
                   ("url", "url", False, 256)),
    },
    {
        "key": "prompts", "table": "prompts", "dedupe": ("name",),
        "fields": (("name", "name", True, 128),
                   ("description", "description", False, None)),
    },
)

# `tools` is handled on its own because each row's id is the FK for its
# tool_parameters, so the rows cannot be written with one executemany.
_TOOL_FIELDS = (("name", "name", True, 128),
                ("description", "description", False, None))
_TOOL_PARAM_FIELDS = (("name", "name", True, 128),
                      ("type", "param_type", False, 64),
                      ("description", "description", False, None))


def _child_rows(spec, payload):
    """Validate and de-duplicate one child array from the payload."""
    items = payload.get(spec["key"]) or []
    if not isinstance(items, list):
        raise RegistryValidationError(
            "'{0}' must be a list".format(spec["key"]), field=spec["key"]
        )

    rows = []
    seen = set()
    for index, item in enumerate(items):
        if not isinstance(item, dict):
            raise RegistryValidationError(
                "'{0}[{1}]' must be a JSON object".format(spec["key"], index),
                field=spec["key"],
            )
        values = _child_values(spec["fields"], item, spec["key"], index)
        if spec["dedupe"]:
            fingerprint = tuple(
                values[_field_position(spec["fields"], key)] for key in spec["dedupe"]
            )
            if fingerprint in seen:
                logger.info(
                    "Skipping duplicate %s entry %s in payload", spec["key"], fingerprint
                )
                continue
            seen.add(fingerprint)
        rows.append(values)
    return rows


def _child_values(fields, item, key, index):
    """Pull one child row's values out, labelling errors with their position."""
    values = []
    for payload_key, _column, requirement, max_length in fields:
        label = "{0}[{1}].{2}".format(key, index, payload_key)
        holder = {label: item.get(payload_key)}
        if requirement == "datetime":
            values.append(_passthrough(item, payload_key))
        elif requirement:
            values.append(_required(holder, label, max_length))
        else:
            values.append(_optional(holder, label, max_length))
    return tuple(values)


def _field_position(fields, payload_key):
    for position, field in enumerate(fields):
        if field[0] == payload_key:
            return position
    raise KeyError(payload_key)


def _insert_children(cursor, spec, cid, rows):
    if not rows:
        return
    columns = [field[1] for field in spec["fields"]]
    placeholders = ", ".join(["%s"] * (len(columns) + 1))
    sql = "INSERT INTO {0} (entity_id, {1}) VALUES ({2})".format(
        qualify(spec["table"]), ", ".join(columns), placeholders
    )
    cursor.executemany(sql, [(cid,) + row for row in rows])


def _resolve_pipeline_id(cursor, data, organization):
    """Resolve `pipeline_id`, accepting a pipeline name as a convenience.

    A pipeline script knows its own name (injected as PIPELINE_NAME) but never
    its cid, so `pipeline_name` is resolved against mlpipeline, which is unique
    on (name, organization). An explicit `pipeline_id` is verified to exist
    because agent_directory.pipeline_id carries a CASCADE foreign key -- without
    the check, a bad id surfaces as an opaque integrity error.
    """
    table = quote_ident(PIPELINE_TABLE)

    pipeline_id = data.get('pipeline_id')
    if pipeline_id is not None and str(pipeline_id).strip():
        try:
            pipeline_id = int(pipeline_id)
        except (TypeError, ValueError):
            raise RegistryValidationError(
                "'pipeline_id' must be an integer", field='pipeline_id'
            )
        cursor.execute(
            "SELECT cid FROM {0} WHERE cid = %s LIMIT 1".format(table), (pipeline_id,)
        )
        if cursor.fetchone() is None:
            raise RegistryValidationError(
                "No pipeline with cid {0}".format(pipeline_id), field='pipeline_id'
            )
        return pipeline_id

    pipeline_name = _optional(data, 'pipeline_name')
    if pipeline_name is None:
        return None

    cursor.execute(
        "SELECT cid FROM {0} WHERE name = %s AND organization = %s LIMIT 1".format(table),
        (pipeline_name, organization),
    )
    row = cursor.fetchone()
    if row is None:
        raise RegistryValidationError(
            "No pipeline named '{0}' in organization '{1}'".format(
                pipeline_name, organization
            ),
            field='pipeline_name',
        )
    return row['cid']


def create_agent(payload):
    """Insert an agent plus all of its child rows in one transaction.

    Returns ``{"cid", "alias", "name", "organization", "pipeline_id", "children"}``.

    This validates two things the Java service does not: `type` and
    `interface_type` are NOT NULL columns that
    ICIPAgentDirectoryService.saveOrUpdateAgentDirectory never checks, so
    omitting them there yields a DataIntegrityViolation surfaced as a 500.

    `name` is required here. Java derives it from `ncs.nameEncoder(organization,
    alias)` when blank; there is no way to call that encoder from Python, and
    inventing a second naming scheme would produce records the Java side would
    never have created.
    """
    require_enabled()
    data = _normalise(_as_dict(payload), _AGENT_ALIASES)

    alias = _required(data, 'alias', 128)
    name = _required(data, 'name', 256)
    agent_type = _required(data, 'type', 128)
    interface_type = _required(data, 'interface_type', 256)
    organization = _required(data, 'organization', 256)

    description = _optional(data, 'description')
    connection_details = _optional(data, 'connection_details')
    category = _optional(data, 'category', 128)
    version = _optional(data, 'version', 64)
    creator = _optional(data, 'creator', 256) or DEFAULT_ACTOR
    last_modified_by = _optional(data, 'last_modified_by', 256) or creator

    extras_json = _optional(data, 'extras_json')
    if extras_json is not None:
        try:
            json.loads(extras_json)
        except (TypeError, ValueError) as err:
            raise RegistryValidationError(
                "'extras_json' must be valid JSON: {0}".format(err), field='extras_json'
            )

    children = {spec["key"]: _child_rows(spec, data) for spec in _CHILD_SPECS}
    tools = _tool_rows(data)

    now = datetime.now()
    agent_table = qualify(AGENT_TABLE)

    with registry_cursor() as (_, cursor):
        pipeline_id = _resolve_pipeline_id(cursor, data, organization)

        # One query covers both uniqueness rules: `alias` is globally unique
        # (uk_agent_directory_alias), which the org-scoped Java check misses.
        cursor.execute(
            "SELECT cid, organization FROM {0} WHERE alias = %s LIMIT 1".format(agent_table),
            (alias,),
        )
        clash = cursor.fetchone()
        if clash is not None:
            if (clash['organization'] or '') == organization:
                raise RegistryConflict("Display name already exists.")
            raise RegistryConflict(
                "Alias '{0}' is already used by organization '{1}'. Agent aliases are "
                "unique across all organizations.".format(alias, clash['organization'])
            )

        cursor.execute(
            "INSERT INTO {0} (pipeline_id, alias, name, type, description, "
            "connection_details, organization, last_modified_by, last_modified_date, "
            "category, interface_type, version, creator, extras_json, created_at, "
            "updated_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, "
            "%s, %s, %s)".format(agent_table),
            (pipeline_id, alias, name, agent_type, description, connection_details,
             organization, last_modified_by, now, category, interface_type, version,
             creator, extras_json, now, now),
        )
        cid = cursor.lastrowid

        for spec in _CHILD_SPECS:
            _insert_children(cursor, spec, cid, children[spec["key"]])

        _insert_tools(cursor, cid, tools)

    counts = {key: len(rows) for key, rows in children.items() if rows}
    if tools:
        counts['tools'] = len(tools)
        parameter_count = sum(len(parameters) for _, parameters in tools)
        if parameter_count:
            counts['tool_parameters'] = parameter_count

    logger.info("Registered agent cid=%s alias=%s org=%s", cid, alias, organization)
    return {
        "cid": cid,
        "alias": alias,
        "name": name,
        "organization": organization,
        "pipeline_id": pipeline_id,
        "children": counts,
    }


def _tool_rows(data):
    """Validate `tools`, returning ``[(tool_values, [param_values, ...]), ...]``."""
    items = data.get('tools') or []
    if not isinstance(items, list):
        raise RegistryValidationError("'tools' must be a list", field='tools')

    rows = []
    seen_tools = set()
    for index, item in enumerate(items):
        if not isinstance(item, dict):
            raise RegistryValidationError(
                "'tools[{0}]' must be a JSON object".format(index), field='tools'
            )
        values = _child_values(_TOOL_FIELDS, item, 'tools', index)
        if values[0] in seen_tools:
            logger.info("Skipping duplicate tool %r in payload", values[0])
            continue
        seen_tools.add(values[0])

        parameters = item.get('parameters') or []
        if not isinstance(parameters, list):
            raise RegistryValidationError(
                "'tools[{0}].parameters' must be a list".format(index), field='tools'
            )
        param_rows = []
        seen_params = set()
        for param_index, parameter in enumerate(parameters):
            if not isinstance(parameter, dict):
                raise RegistryValidationError(
                    "'tools[{0}].parameters[{1}]' must be a JSON object".format(
                        index, param_index
                    ),
                    field='tools',
                )
            param_values = _child_values(
                _TOOL_PARAM_FIELDS, parameter,
                'tools[{0}].parameters'.format(index), param_index
            )
            if param_values[0] in seen_params:
                logger.info("Skipping duplicate tool parameter %r", param_values[0])
                continue
            seen_params.add(param_values[0])
            param_rows.append(param_values)

        rows.append((values, param_rows))
    return rows


def _insert_tools(cursor, cid, tools):
    if not tools:
        return
    tool_columns = ", ".join(field[1] for field in _TOOL_FIELDS)
    tool_sql = "INSERT INTO {0} (entity_id, {1}) VALUES ({2})".format(
        qualify('tools'), tool_columns,
        ", ".join(["%s"] * (len(_TOOL_FIELDS) + 1))
    )
    param_columns = ", ".join(field[1] for field in _TOOL_PARAM_FIELDS)
    param_sql = "INSERT INTO {0} (tool_id, {1}) VALUES ({2})".format(
        qualify('tool_parameters'), param_columns,
        ", ".join(["%s"] * (len(_TOOL_PARAM_FIELDS) + 1))
    )

    for tool_values, param_rows in tools:
        cursor.execute(tool_sql, (cid,) + tool_values)
        tool_id = cursor.lastrowid
        if param_rows:
            cursor.executemany(param_sql, [(tool_id,) + row for row in param_rows])


def get_agent(alias, organization):
    """Look an agent up by alias and organization, with its child collections."""
    require_enabled()
    if not (alias or '').strip():
        raise RegistryValidationError("'alias' query parameter is required", field='alias')
    if not (organization or '').strip():
        raise RegistryValidationError(
            "'organization' query parameter is required", field='organization'
        )

    alias = alias.strip()
    organization = organization.strip()

    with registry_cursor() as (_, cursor):
        cursor.execute(
            "SELECT cid, pipeline_id, alias, name, type, description, "
            "connection_details, organization, last_modified_by, last_modified_date, "
            "category, interface_type, version, creator, extras_json, created_at, "
            "updated_at FROM {0} WHERE alias = %s AND organization = %s "
            "LIMIT 1".format(qualify(AGENT_TABLE)),
            (alias, organization),
        )
        agent = cursor.fetchone()
        if agent is None:
            raise RegistryNotFound(
                "No agent with alias '{0}' in organization '{1}'".format(
                    alias, organization
                )
            )

        cid = agent['cid']
        for spec in _CHILD_SPECS:
            columns = ", ".join(field[1] for field in spec["fields"])
            cursor.execute(
                "SELECT id, {0} FROM {1} WHERE entity_id = %s ORDER BY id".format(
                    columns, qualify(spec["table"])
                ),
                (cid,),
            )
            agent[spec["key"]] = cursor.fetchall()

        cursor.execute(
            "SELECT id, name, description FROM {0} WHERE entity_id = %s "
            "ORDER BY id".format(qualify('tools')),
            (cid,),
        )
        tools = cursor.fetchall()
        for tool in tools:
            cursor.execute(
                "SELECT id, name, param_type, description FROM {0} WHERE tool_id = %s "
                "ORDER BY id".format(qualify('tool_parameters')),
                (tool['id'],),
            )
            tool['parameters'] = cursor.fetchall()
        agent['tools'] = tools

    return agent
