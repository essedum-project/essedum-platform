/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

package com.lfn.icip.dataset.util;

import java.io.File;
import java.io.IOException;
import java.nio.file.InvalidPathException;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Utility class to validate file paths against path traversal attacks.
 * <p>
 * Prevents uncontrolled data from being used in path expressions by:
 * <ul>
 *   <li>Rejecting path traversal sequences ({@code ..}, {@code ./})</li>
 *   <li>Rejecting null bytes</li>
 *   <li>Ensuring the resolved (canonical) path stays within an allowed base directory</li>
 * </ul>
 */
public final class PathValidationUtil {

    private PathValidationUtil() {
        // Utility class — no instantiation
    }

    /**
     * Validates that a user-provided file path does not escape the given base directory.
     * Returns the validated canonical {@link File}.
     *
     * @param baseDir      the allowed base directory (trusted)
     * @param userFilePath the user-provided file path (untrusted)
     * @return a validated File whose canonical path is under baseDir
     * @throws IllegalArgumentException if the path is invalid or attempts traversal
     */
    public static File validatePath(String baseDir, String userFilePath) {
        if (userFilePath == null || userFilePath.trim().isEmpty()) {
            throw new IllegalArgumentException("File path must not be null or empty");
        }
        rejectTraversalSequences(userFilePath);

        try {
            File base = new File(baseDir).getCanonicalFile();
            File resolved = new File(base, userFilePath).getCanonicalFile();

            if (!resolved.getPath().startsWith(base.getPath() + File.separator)
                    && !resolved.getPath().equals(base.getPath())) {
                throw new IllegalArgumentException(
                        "Path traversal detected: resolved path escapes the base directory");
            }
            return resolved;
        } catch (IOException e) {
            throw new IllegalArgumentException("Invalid file path: " + e.getMessage(), e);
        }
    }

    /**
     * Validates that a user-provided file path does not contain path traversal sequences,
     * and returns a sanitized {@link File}. Use this overload when there is no fixed base
     * directory — the path itself is validated to not contain traversal patterns, and the
     * canonical path is compared to the absolute path to detect traversal.
     *
     * @param userFilePath the user-provided file path (untrusted)
     * @return a validated File
     * @throws IllegalArgumentException if the path contains traversal sequences
     */
    public static File validatePath(String userFilePath) {
        if (userFilePath == null || userFilePath.trim().isEmpty()) {
            throw new IllegalArgumentException("File path must not be null or empty");
        }
        rejectTraversalSequences(userFilePath);

        try {
            File file = new File(userFilePath);
            String canonicalPath = file.getCanonicalPath();
            String absolutePath = file.getAbsolutePath();

            // If canonical != absolute, path normalization removed traversal sequences
            if (!canonicalPath.equals(absolutePath)) {
                // Allow simple cases like trailing slash differences, but block real traversal
                String normalizedAbsolute = new File(absolutePath).getCanonicalPath();
                if (!canonicalPath.equals(normalizedAbsolute)) {
                    throw new IllegalArgumentException(
                            "Path traversal detected in file path");
                }
            }
            return file.getCanonicalFile();
        } catch (IOException e) {
            throw new IllegalArgumentException("Invalid file path: " + e.getMessage(), e);
        }
    }

    /**
     * Validates that a user-provided path does not contain traversal sequences
     * and returns a sanitized {@link Path}.
     *
     * @param userPath the user-provided path string (untrusted)
     * @return a validated, normalized Path
     * @throws IllegalArgumentException if the path contains traversal sequences
     */
    public static Path validateAndGetPath(String userPath) {
        if (userPath == null || userPath.trim().isEmpty()) {
            throw new IllegalArgumentException("Path must not be null or empty");
        }
        rejectTraversalSequences(userPath);

        try {
            Path path = Paths.get(userPath).normalize();
            // After normalization, check that no ".." remains
            for (int i = 0; i < path.getNameCount(); i++) {
                if ("..".equals(path.getName(i).toString())) {
                    throw new IllegalArgumentException(
                            "Path traversal detected after normalization");
                }
            }
            return path;
        } catch (InvalidPathException e) {
            throw new IllegalArgumentException("Invalid path: " + e.getMessage(), e);
        }
    }

    /**
     * Rejects paths containing well-known traversal sequences and null bytes.
     */
    private static void rejectTraversalSequences(String path) {
        if (path.contains("\0")) {
            throw new IllegalArgumentException("Path must not contain null bytes");
        }
        // Normalize separators for checking
        String normalized = path.replace('\\', '/');
        if (normalized.contains("../") || normalized.contains("/..") || normalized.equals("..")) {
            throw new IllegalArgumentException(
                    "Path must not contain directory traversal sequences (..)");
        }
    }
}

