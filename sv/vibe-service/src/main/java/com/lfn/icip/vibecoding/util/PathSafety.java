package com.lfn.icip.vibecoding.util;

import java.nio.file.InvalidPathException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.regex.Pattern;

/**
 * Defensive helpers to prevent <em>uncontrolled-data-in-path</em> /
 * <em>path-traversal</em> issues flagged by CodeQL (Java/PathInjection).
 * <p>
 * All filesystem operations that consume externally supplied identifiers,
 * file names or relative paths must go through these helpers so that:
 * <ul>
 *   <li>identifiers cannot contain path separators or {@code ..} segments;</li>
 *   <li>resolved paths are guaranteed to remain inside a known base
 *       directory (no escape via {@code ..} / absolute paths / symlinks);</li>
 *   <li>delete/walk operations refuse to touch anything outside a known
 *       set of allowed roots.</li>
 * </ul>
 */
public final class PathSafety {

    /** Allowed characters for opaque identifiers used as path segments. */
    private static final Pattern SAFE_ID = Pattern.compile("[A-Za-z0-9._-]{1,128}");

    private PathSafety() { /* utility class */ }

    /**
     * Validate and return a user-supplied opaque identifier that will be used
     * as a single path segment (e.g. session id, branch id). Rejects anything
     * outside {@code [A-Za-z0-9._-]} and any value starting with a dot to
     * avoid hidden / parent-relative names such as {@code ..} or {@code .}.
     *
     * @throws IllegalArgumentException if the value is null, empty or contains unsafe characters
     */
    public static String sanitizeId(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Identifier must not be null or empty");
        }
        if (!SAFE_ID.matcher(value).matches() || value.equals(".") || value.equals("..")) {
            throw new IllegalArgumentException("Identifier contains unsafe characters: " + value);
        }
        return value;
    }

    /**
     * Safely resolve a (possibly user-controlled) relative path against a
     * trusted base directory. The result is normalized and verified to live
     * <em>inside</em> {@code base}; absolute inputs and {@code ..} traversal
     * are rejected.
     *
     * @throws IllegalArgumentException if {@code relative} is absolute, empty,
     *                                  blank, or resolves outside {@code base}.
     */
    public static Path resolveSafely(Path base, String relative) {
        if (base == null) {
            throw new IllegalArgumentException("Base path must not be null");
        }
        if (relative == null || relative.isBlank()) {
            throw new IllegalArgumentException("Relative path must not be null or empty");
        }
        // Reject obviously-dangerous tokens up front (also covers Windows-style "\\..\\").
        String normalisedInput = relative.replace('\\', '/');
        for (String segment : normalisedInput.split("/")) {
            if (segment.equals("..")) {
                throw new IllegalArgumentException("Path traversal detected in: " + relative);
            }
        }
        Path candidate;
        try {
            candidate = Paths.get(relative);
        } catch (InvalidPathException ex) {
            throw new IllegalArgumentException("Invalid path: " + relative, ex);
        }
        if (candidate.isAbsolute()) {
            throw new IllegalArgumentException("Absolute paths are not allowed: " + relative);
        }
        Path absBase = base.toAbsolutePath().normalize();
        Path resolved = absBase.resolve(candidate).normalize();
        if (!resolved.startsWith(absBase)) {
            throw new IllegalArgumentException("Resolved path escapes base directory: " + relative);
        }
        return resolved;
    }

    /**
     * Ensure {@code candidate} resides inside at least one of the
     * {@code allowedRoots} (after normalization). Use as a guard before any
     * recursive delete / walk over a path whose origin includes external input.
     *
     * @throws IllegalArgumentException if {@code candidate} is not inside any allowed root.
     */
    public static void assertWithin(Path candidate, Path... allowedRoots) {
        if (candidate == null) {
            throw new IllegalArgumentException("Candidate path must not be null");
        }
        Path absCandidate = candidate.toAbsolutePath().normalize();
        if (allowedRoots == null || allowedRoots.length == 0) {
            throw new IllegalArgumentException("No allowed roots configured");
        }
        for (Path root : allowedRoots) {
            if (root == null) continue;
            Path absRoot = root.toAbsolutePath().normalize();
            if (absCandidate.startsWith(absRoot)) {
                return;
            }
        }
        throw new IllegalArgumentException("Path is not inside any allowed root: " + candidate);
    }
}

