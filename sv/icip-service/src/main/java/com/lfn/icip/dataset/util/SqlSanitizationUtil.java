/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 * and associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
 * LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 */

package com.lfn.icip.dataset.util;

import java.util.regex.Pattern;

/**
 * Utility class to sanitize and validate SQL identifiers (table names, column names)
 * to prevent SQL injection when identifiers must be dynamically included in queries.
 * <p>
 * SQL identifiers cannot be parameterized with PreparedStatement placeholders (?),
 * so this utility provides strict allowlist-based validation.
 */
public final class SqlSanitizationUtil {

    /**
     * Pattern allowing only valid SQL identifier characters:
     * letters, digits, underscores, dots (for schema.table), and backtick-quoted identifiers.
     */
    private static final Pattern VALID_IDENTIFIER = Pattern.compile("^[a-zA-Z0-9_][a-zA-Z0-9_.]*$");

    /**
     * Pattern for a comma-separated list of valid SQL identifiers (for SELECT clause).
     * Allows: col1, col2, schema.col3, col4 AS alias, COUNT(col), etc.
     * Blocks: semicolons, quotes, comments, unions, subqueries.
     */
    private static final Pattern VALID_SELECT_CLAUSE = Pattern.compile(
            "^[a-zA-Z0-9_.*,()\\s]+$");

    /**
     * Dangerous SQL keywords/patterns that should never appear in identifiers.
     */
    private static final Pattern SQL_INJECTION_PATTERN = Pattern.compile(
            "(?i)(--|;|/\\*|\\*/|'|\"" +
            "|\\bUNION\\b|\\bSELECT\\b|\\bINSERT\\b|\\bUPDATE\\b|\\bDELETE\\b|\\bDROP\\b" +
            "|\\bALTER\\b|\\bCREATE\\b|\\bEXEC\\b|\\bEXECUTE\\b|\\bTRUNCATE\\b" +
            "|\\bDECLARE\\b|\\bCAST\\b|\\bCONVERT\\b|\\bXP_\\b|\\bSP_\\b)");

    private SqlSanitizationUtil() {
        // Utility class — no instantiation
    }

    /**
     * Validates that a string is a safe SQL identifier (table name, column name).
     * Only allows alphanumeric characters, underscores, and dots.
     *
     * @param identifier the SQL identifier to validate
     * @return the validated identifier
     * @throws IllegalArgumentException if the identifier is invalid or contains injection patterns
     */
    public static String validateIdentifier(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) {
            throw new IllegalArgumentException("SQL identifier must not be null or empty");
        }
        String trimmed = identifier.trim();
        // Strip backticks if present (MySQL quoting)
        String unquoted = trimmed.replace("`", "");
        if (!VALID_IDENTIFIER.matcher(unquoted).matches()) {
            throw new IllegalArgumentException(
                    "Invalid SQL identifier: contains disallowed characters");
        }
        if (SQL_INJECTION_PATTERN.matcher(unquoted).find()) {
            throw new IllegalArgumentException(
                    "SQL injection detected in identifier");
        }
        return trimmed;
    }

    /**
     * Validates a SELECT clause parameter list (e.g., "col1, col2, col3").
     * Allows column names, commas, spaces, dots, parentheses (for functions), and asterisk.
     * Blocks SQL keywords, quotes, semicolons, and comment sequences.
     *
     * @param selectClause the SELECT clause string to validate
     * @return the validated select clause
     * @throws IllegalArgumentException if the clause contains injection patterns
     */
    public static String validateSelectClause(String selectClause) {
        if (selectClause == null || selectClause.trim().isEmpty()) {
            throw new IllegalArgumentException("SELECT clause must not be null or empty");
        }
        String trimmed = selectClause.trim();
        if (SQL_INJECTION_PATTERN.matcher(trimmed).find()) {
            throw new IllegalArgumentException(
                    "SQL injection detected in SELECT clause");
        }
        // Remove backticks for validation
        String unquoted = trimmed.replace("`", "");
        if (!VALID_SELECT_CLAUSE.matcher(unquoted).matches()) {
            throw new IllegalArgumentException(
                    "Invalid SELECT clause: contains disallowed characters");
        }
        return trimmed;
    }

    /**
     * Escapes a string value for safe inclusion in SQL single-quoted literals.
     * This should only be used as a last resort when PreparedStatement parameters
     * cannot be used. Prefer PreparedStatement placeholders wherever possible.
     *
     * @param value the value to escape
     * @return the escaped value (without surrounding quotes)
     */
    public static String escapeSqlLiteral(String value) {
        if (value == null) {
            return null;
        }
        // Escape single quotes by doubling them, and escape backslashes
        return value.replace("\\", "\\\\").replace("'", "''");
    }
}

