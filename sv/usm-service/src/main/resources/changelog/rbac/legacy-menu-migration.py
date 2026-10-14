#!/usr/bin/env python
"""Flatten legacy usm_constant "<Role> Side" menus into rbac_menu_item rows,
tagged by role + project, preserving parent/child nesting. Emits SQL.

Usage: python -I migrate_menus.py <legacy_menus.json>  > migrate_menus.sql
"""
import json, sys

START_ID = 1000  # migrated rows get explicit ids from here up

def parse_value(v):
    """Legacy values are JSON, sometimes double-encoded or backslash-escaped."""
    if v is None:
        return None
    cur = v
    for _ in range(4):
        if not isinstance(cur, str):
            return cur
        s = cur.strip()
        try:
            cur = json.loads(s)
            continue
        except json.JSONDecodeError:
            # literal backslash-escaped quotes: {\"label\":...}
            s2 = s.replace('\\"', '"')
            try:
                cur = json.loads(s2)
                continue
            except json.JSONDecodeError:
                return None
    return cur if not isinstance(cur, str) else None

def sql_str(s):
    if s is None:
        return "NULL"
    return "'" + str(s).replace("\\", "\\\\").replace("'", "''") + "'"

def route_of(item):
    url = item.get("url")
    if not url:
        return ""          # parent group / no link
    return url[1:] if url.startswith("./") else url

rows = []            # (id, parent_id, label, route, min_rank, order, icon, roles, project)
_next = [START_ID]

def emit(item, parent_id, order, role, project):
    mid = _next[0]; _next[0] += 1
    rows.append((
        mid, parent_id,
        item.get("label") or "(unnamed)",
        route_of(item),
        0, order,
        item.get("icon") or None,
        role, project,
    ))
    children = item.get("children") or []
    for i, ch in enumerate(children):
        if isinstance(ch, dict) and (ch.get("label") or "").strip():
            emit(ch, mid, i, role, project)
    return mid

def main():
    data = json.load(open(sys.argv[1], encoding="utf-8"))
    # group rows per (role, project) to assign a stable top-level order
    groups = {}
    for rec in data:
        item = rec["item"]
        if item.endswith(" SideConfigurations"):
            role = item[: -len(" SideConfigurations")]
        elif item.endswith(" Side"):
            role = item[: -len(" Side")]
        else:
            continue
        # "Admin" already has the new rbac admin-console menu (ids 1-8); don't
        # re-import its legacy /iamp-usm/* items.
        if role.strip().lower() == "admin":
            continue
        project = rec["project"]
        groups.setdefault((role, project), []).append(rec)

    for (role, project), recs in sorted(groups.items()):
        order = 0
        for rec in recs:
            parsed = parse_value(rec["value"])
            if parsed is None:
                sys.stderr.write(f"SKIP unparseable: {role}/{project} id={rec['id']}\n")
                continue
            items = parsed if isinstance(parsed, list) else [parsed]
            for it in items:
                if isinstance(it, dict) and (it.get("label") or "").strip():
                    emit(it, None, order, role, project)
                    order += 1

    # summary to stderr
    from collections import Counter
    byrp = Counter((r[7], r[8]) for r in rows)
    sys.stderr.write(f"TOTAL rbac_menu_item rows to insert: {len(rows)}\n")
    for k, v in sorted(byrp.items()):
        sys.stderr.write(f"  {k[0]} / {k[1]}: {v}\n")

    # SQL
    print("-- Migrated legacy per-role menus into rbac_menu_item (role+project tagged).")
    print("DELETE FROM rbac_menu_item WHERE project IS NOT NULL;")
    for (mid, pid, label, route, rank, order, icon, roles, project) in rows:
        pid_s = "NULL" if pid is None else str(pid)
        print(
            "INSERT INTO rbac_menu_item (id,parent_id,label,route,min_role_rank,display_order,icon,roles,project) VALUES ("
            f"{mid},{pid_s},{sql_str(label)},{sql_str(route)},{rank},{order},{sql_str(icon)},{sql_str(roles)},{sql_str(project)});"
        )

if __name__ == "__main__":
    main()
