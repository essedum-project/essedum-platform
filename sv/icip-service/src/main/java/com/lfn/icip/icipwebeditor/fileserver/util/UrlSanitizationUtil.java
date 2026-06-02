package com.lfn.icip.icipwebeditor.fileserver.util;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;

/**
 * Utility class for sanitizing user-provided values before embedding them
 * in URL paths or query parameters to prevent URL injection and SSRF.
 */
public final class UrlSanitizationUtil {

    /** Pattern for safe URL path segments: alphanumeric, hyphens, underscores, dots. */
    private static final Pattern SAFE_PATH_SEGMENT = Pattern.compile("^[a-zA-Z0-9._\\-]+$");

    private UrlSanitizationUtil() {
        // Utility class — no instantiation
    }

    /**
     * Encodes a value for safe use as a URL query parameter value.
     *
     * @param value the raw value to encode
     * @return the URL-encoded value
     */
    public static String encodeQueryParam(String value) {
        if (value == null) {
            return "";
        }
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    /**
     * Sanitizes a value for safe use as a URL path segment.
     * Rejects values containing path traversal, query separators, or fragment indicators.
     *
     * @param segment the raw path segment
     * @return the validated segment
     * @throws IllegalArgumentException if the segment contains unsafe characters
     */
    public static String sanitizePathSegment(String segment) {
        if (segment == null || segment.isEmpty()) {
            throw new IllegalArgumentException("URL path segment must not be null or empty");
        }
        // Block path traversal
        if (segment.contains("..") || segment.contains("/") || segment.contains("\\")) {
            throw new IllegalArgumentException("URL path segment contains path traversal characters");
        }
        // Block query/fragment injection
        if (segment.contains("?") || segment.contains("#") || segment.contains("&")) {
            throw new IllegalArgumentException("URL path segment contains query/fragment injection characters");
        }
        // Block null bytes
        if (segment.contains("\0")) {
            throw new IllegalArgumentException("URL path segment contains null bytes");
        }
        return segment;
    }

    /**
     * Encodes a value for safe use as a URL path segment using percent-encoding.
     * This is safer than sanitizePathSegment when the value may legitimately
     * contain special characters.
     *
     * @param segment the raw path segment
     * @return the percent-encoded segment safe for URL path use
     */
    public static String encodePathSegment(String segment) {
        if (segment == null) {
            return "";
        }
        // URL-encode and then convert + back to %20 for path usage
        return URLEncoder.encode(segment, StandardCharsets.UTF_8).replace("+", "%20");
    }
}

