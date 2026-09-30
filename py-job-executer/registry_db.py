"""Database plumbing for the Model Registry and Agent Registry APIs.

These endpoints write straight into the platform MySQL database rather than
going through the Java service, because a pipeline subprocess has no JWT or
numeric ``Project`` header to authenticate with. That mirrors what
``task_retriver/MYSQL.py`` already does for job status on ``mljobs``.

Unlike ``db.py`` and ``task_retriver/MYSQL.py``, every statement here is
parameterised. Those modules build SQL with ``.format()``/f-strings, which is
tolerable for internally generated job ids but not for the untrusted request
bodies these endpoints accept. Note also that ``db.py:execute_query`` takes a
``params`` argument and then ignores it -- do not reuse that helper.
"""

import logging
import os
import re
from contextlib import contextmanager

import pymysql
import pymysql.cursors

from utils import config

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover - keeps app startup working without dotenv
    def load_dotenv():
        return False

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

load_dotenv()

SECTION = 'REGISTRY_DB_CONFIGS'

# Tables that live in the main platform database (no schema qualification).
# `mlfederatedmodels` is the Model Registry; `mlpipeline` is only read, to
# resolve a pipeline name to the cid that agent_directory.pipeline_id points at.
MODEL_TABLE = 'mlfederatedmodels'
PIPELINE_TABLE = 'mlpipeline'

# Tables whose JPA entities hardcode `schema = "essedum_coredb"` while the
# Liquibase changesets create them with no schema at all, i.e. in the main
# database. Which one is true depends on the deployment, so the schema is
# configurable via `coredb_schema` and defaults to unqualified.
AGENT_TABLE = 'agent_directory'

_IDENTIFIER = re.compile(r'^[A-Za-z0-9_]+$')


class RegistryDisabled(Exception):
    """Raised when the registry feature has not been enabled in conf.ini."""


class RegistryValidationError(Exception):
    """Raised when the caller's payload is missing or malformed."""

    def __init__(self, message, field=None):
        super().__init__(message)
        self.field = field


class RegistryConflict(Exception):
    """Raised when the record would violate a uniqueness constraint."""


class RegistryNotFound(Exception):
    """Raised when a lookup finds no matching record."""


def _section():
    """Return the registry config section, or None if conf.ini predates it."""
    if not config.has_section(SECTION):
        return None
    return config[SECTION]


def is_enabled():
    """Whether the registry endpoints should serve requests.

    Compared against the literal string because configparser values are always
    strings -- `if value:` would treat "False" as truthy, which is the bug at
    app.py:25.
    """
    db_configs = _section()
    if db_configs is None:
        return False
    return db_configs.get('enabled', 'False').strip() == 'True'


def require_enabled():
    if not is_enabled():
        raise RegistryDisabled(
            "Registry API is disabled. Set [{0}] enabled = True in conf/conf.ini "
            "and configure the database connection.".format(SECTION)
        )


def _checked_identifier(value, what):
    """Reject anything that is not a bare SQL identifier.

    Table names come from module constants and the schema from conf.ini, never
    from a request, but a mistyped or hostile conf.ini should not be able to
    inject SQL through an identifier that cannot be parameterised.
    """
    if not _IDENTIFIER.match(value or ''):
        raise RegistryValidationError("Invalid {0} configured: {1!r}".format(what, value))
    return value


def quote_ident(table):
    """Backtick-quote a table in the main platform database."""
    return '`{0}`'.format(_checked_identifier(table, 'table name'))


def qualify(table):
    """Backtick-quote an agent-registry table, schema-qualified if configured."""
    table = _checked_identifier(table, 'table name')
    db_configs = _section()
    schema = (db_configs.get('coredb_schema', '') if db_configs else '').strip()
    if not schema:
        return '`{0}`'.format(table)
    return '`{0}`.`{1}`'.format(_checked_identifier(schema, 'coredb_schema'), table)


def get_connection():
    """Open a connection to the platform database.

    The password comes from the same `mysql_db_password` environment variable
    the task retriever uses, deliberately -- one secret, not two.
    """
    require_enabled()
    db_configs = _section()
    try:
        connect_timeout = int(db_configs.get('connect_timeout', '10'))
    except ValueError:
        connect_timeout = 10
    return pymysql.connect(
        user=db_configs['username'],
        password=os.getenv("mysql_db_password"),
        host=db_configs['host'],
        database=db_configs['database'],
        port=int(db_configs['port']),
        charset='utf8mb4',
        connect_timeout=connect_timeout,
        cursorclass=pymysql.cursors.DictCursor,
    )


@contextmanager
def registry_cursor():
    """Yield ``(connection, cursor)`` inside a single transaction.

    Commits on clean exit, rolls back and re-raises otherwise. An agent and all
    of its child rows are written through one of these, so a failure part-way
    through leaves no orphaned agent_directory row behind.
    """
    require_enabled()
    connection = get_connection()
    try:
        connection.begin()
        with connection.cursor() as cursor:
            yield connection, cursor
        connection.commit()
    except Exception:
        try:
            connection.rollback()
        except Exception:
            logger.error('Exception occured during rollback', exc_info=True)
        raise
    finally:
        try:
            connection.close()
        except Exception:
            logger.error('Exception occured while closing connection', exc_info=True)


def check_health():
    """Verify the registry database is reachable without submitting a job."""
    with registry_cursor() as (_, cursor):
        cursor.execute("SELECT 1 AS ok")
        cursor.fetchone()
    db_configs = _section()
    return {
        "status": "UP",
        "database": db_configs['database'],
        "host": db_configs['host'],
        "coredb_schema": (db_configs.get('coredb_schema', '') or '').strip() or None,
    }
