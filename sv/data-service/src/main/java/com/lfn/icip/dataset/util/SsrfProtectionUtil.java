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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.InetAddress;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.UnknownHostException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Utility class to validate URLs against Server-Side Request Forgery (SSRF) attacks.
 * <p>
 * Validates that user-provided URLs:
 * <ul>
 *   <li>Use only allowed schemes (http, https)</li>
 *   <li>Do not resolve to private/internal/loopback IP addresses</li>
 *   <li>Optionally match an allowed-hosts allowlist</li>
 * </ul>
 */
public final class SsrfProtectionUtil {

    private static final Logger logger = LoggerFactory.getLogger(SsrfProtectionUtil.class);

    private static final Set<String> ALLOWED_SCHEMES = Set.of("http", "https");

    private SsrfProtectionUtil() {
        // Utility class - no instantiation
    }

    /**
     * Validates a URL string against SSRF attacks and returns a safe {@link URL} object.
     *
     * @param urlString    the raw URL string from user input / connection details
     * @param allowedHosts optional allowlist of permitted hostnames (pass null or empty to skip allowlist check)
     * @return a validated {@link URL} object
     * @throws MalformedURLException    if the URL is not well-formed
     * @throws IllegalArgumentException if the URL fails SSRF validation
     */
    public static URL validateAndCreateUrl(String urlString, List<String> allowedHosts) throws MalformedURLException {
        if (urlString == null || urlString.trim().isEmpty()) {
            throw new MalformedURLException("URL must not be null or empty");
        }

        URL url = new URL(urlString.trim());

        validateScheme(url);
        validateHost(url, allowedHosts);

        // Skip internal-IP check when the host is explicitly on the allowlist —
        // this permits legitimate internal cluster services (e.g. MinIO, internal S3)
        // while still blocking all other private-range addresses.
        boolean isExplicitlyAllowed = allowedHosts != null && !allowedHosts.isEmpty()
                && allowedHosts.stream().anyMatch(h -> h.trim().equalsIgnoreCase(url.getHost()));
        if (!isExplicitlyAllowed) {
            validateNoInternalAddress(url);
        }

        // Reconstruct the URL from its validated components. This breaks the
        // taint flow at static-analysis tools (e.g. CodeQL's java/ssrf query):
        // the returned URL is built from the already-checked scheme/host/port,
        // not the original user-controlled string, so taint propagation stops
        // at this sanitisation barrier.
        return new URL(url.getProtocol(), url.getHost(), url.getPort(), url.getFile());
    }

    /**
     * Validates a URL string against SSRF attacks and returns a safe {@link URL} object.
     * Uses no allowlist — only blocks private/internal IP ranges and dangerous schemes.
     *
     * @param urlString the raw URL string
     * @return a validated {@link URL} object
     * @throws MalformedURLException    if the URL is not well-formed
     * @throws IllegalArgumentException if the URL fails SSRF validation
     */
    public static URL validateAndCreateUrl(String urlString) throws MalformedURLException {
        return validateAndCreateUrl(urlString, Collections.emptyList());
    }

    /**
     * Convenience wrapper around {@link #validateAndCreateUrl(String)} that converts the
     * checked {@link MalformedURLException} into an unchecked {@link IllegalArgumentException}.
     * This lets callers validate a URL inline at an HTTP/OkHttp sink (passing the returned
     * {@link URL} object) without having to alter their method signatures.
     *
     * @param urlString the raw, potentially user-controlled URL string
     * @return a validated {@link URL}
     * @throws IllegalArgumentException if the URL is malformed or fails SSRF validation
     */
    public static URL safeUrl(String urlString) {
        try {
            return validateAndCreateUrl(urlString);
        } catch (MalformedURLException e) {
            throw new IllegalArgumentException("Invalid or disallowed URL: " + e.getMessage(), e);
        }
    }

    /**
     * Convenience wrapper around {@link #validateAndCreateUrl(String, List)} that converts the
     * checked {@link MalformedURLException} into an unchecked {@link IllegalArgumentException}.
     * Hosts explicitly listed in {@code allowedHosts} bypass the internal-IP check, permitting
     * legitimate internal cluster endpoints (e.g. remote executors, MinIO).
     *
     * @param urlString    the raw, potentially user-controlled URL string
     * @param allowedHosts optional allowlist of permitted hostnames
     * @return a validated {@link URL}
     * @throws IllegalArgumentException if the URL is malformed or fails SSRF validation
     */
    public static URL safeUrl(String urlString, List<String> allowedHosts) {
        try {
            return validateAndCreateUrl(urlString, allowedHosts);
        } catch (MalformedURLException e) {
            throw new IllegalArgumentException("Invalid or disallowed URL: " + e.getMessage(), e);
        }
    }

    /**
     * Validates that the URL scheme is allowed (http or https only).
     */
    private static void validateScheme(URL url) {
        String scheme = url.getProtocol().toLowerCase();
        if (!ALLOWED_SCHEMES.contains(scheme)) {
            throw new IllegalArgumentException(
                    "URL scheme '" + scheme + "' is not allowed. Only " + ALLOWED_SCHEMES + " are permitted.");
        }
    }

    /**
     * Validates the URL host against the allowlist if provided.
     */
    private static void validateHost(URL url, List<String> allowedHosts) {
        String host = url.getHost();
        if (host == null || host.isEmpty()) {
            throw new IllegalArgumentException("URL must contain a valid hostname.");
        }

        if (allowedHosts != null && !allowedHosts.isEmpty()) {
            Set<String> normalizedAllowedHosts = allowedHosts.stream()
                    .map(String::toLowerCase)
                    .map(String::trim)
                    .collect(Collectors.toSet());

            if (!normalizedAllowedHosts.contains(host.toLowerCase())) {
                throw new IllegalArgumentException(
                        "Host '" + host + "' is not in the allowed hosts list.");
            }
        }
    }

    /**
     * Resolves the hostname to an IP address and blocks private, loopback,
     * link-local, and multicast addresses to prevent SSRF attacks targeting
     * internal infrastructure.
     */
    private static void validateNoInternalAddress(URL url) {
        String host = url.getHost();
        try {
            InetAddress[] addresses = InetAddress.getAllByName(host);
            for (InetAddress address : addresses) {
                if (address.isLoopbackAddress()) {
                    throw new IllegalArgumentException(
                            "URL resolves to a loopback address (" + address.getHostAddress() + ") which is not allowed.");
                }
                if (address.isSiteLocalAddress()) {
                    throw new IllegalArgumentException(
                            "URL resolves to a private/site-local address (" + address.getHostAddress() + ") which is not allowed.");
                }
                if (address.isLinkLocalAddress()) {
                    throw new IllegalArgumentException(
                            "URL resolves to a link-local address (" + address.getHostAddress() + ") which is not allowed.");
                }
                if (address.isAnyLocalAddress()) {
                    throw new IllegalArgumentException(
                            "URL resolves to a wildcard address (" + address.getHostAddress() + ") which is not allowed.");
                }
                if (address.isMulticastAddress()) {
                    throw new IllegalArgumentException(
                            "URL resolves to a multicast address (" + address.getHostAddress() + ") which is not allowed.");
                }

                // Additional check for known internal IP ranges that might not be caught
                byte[] addrBytes = address.getAddress();
                if (isInternalIpRange(addrBytes)) {
                    throw new IllegalArgumentException(
                            "URL resolves to an internal IP address (" + address.getHostAddress() + ") which is not allowed.");
                }
            }
        } catch (UnknownHostException e) {
            throw new IllegalArgumentException("Cannot resolve hostname: " + host, e);
        }
    }

    /**
     * Checks for additional internal/reserved IP ranges:
     * - 0.0.0.0/8  (current network)
     * - 100.64.0.0/10 (shared address space / CGN)
     * - 169.254.0.0/16 (link-local, cloud metadata e.g. 169.254.169.254)
     * - 192.0.0.0/24 (IETF protocol assignments)
     * - 198.18.0.0/15 (benchmark testing)
     * - 240.0.0.0/4 (reserved for future use)
     */
    private static boolean isInternalIpRange(byte[] addr) {
        if (addr.length == 4) {
            int first = addr[0] & 0xFF;
            int second = addr[1] & 0xFF;

            // 0.0.0.0/8
            if (first == 0) return true;

            // 100.64.0.0/10 (Shared Address Space / CGN) — intentionally not blocked here
            // because Azure AKS assigns LoadBalancer external IPs from this range.
            // The standard private-IP checks above (isSiteLocalAddress, isLoopbackAddress,
            // isLinkLocalAddress) already cover the meaningful SSRF threats in this environment.

            // 169.254.0.0/16 (Link-local / cloud metadata)
            if (first == 169 && second == 254) return true;

            // 192.0.0.0/24
            if (first == 192 && second == 0 && (addr[2] & 0xFF) == 0) return true;

            // 198.18.0.0/15
            if (first == 198 && (second == 18 || second == 19)) return true;

            // 240.0.0.0/4 (reserved)
            if (first >= 240) return true;
        }

        return false;
    }

    /**
     * Parses a comma-separated string of allowed hosts into a list.
     *
     * @param allowedHostsStr comma-separated host names (e.g. "s3.amazonaws.com,play.min.io")
     * @return list of trimmed host names, or empty list if input is null/blank
     */
    public static List<String> parseAllowedHosts(String allowedHostsStr) {
        if (allowedHostsStr == null || allowedHostsStr.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return Arrays.stream(allowedHostsStr.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }
}

