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
package com.lfn.common.app.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

/**
 * Servlet filter to mitigate Spring Framework MVC Path Traversal vulnerability (CVE-2025-41242).
 * Rejects requests containing path traversal sequences in the URI before they reach Spring's resource handling.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class PathTraversalProtectionFilter implements Filter {

    private static final Logger logger = LoggerFactory.getLogger(PathTraversalProtectionFilter.class);

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        if (request instanceof HttpServletRequest httpRequest) {
            String requestUri = httpRequest.getRequestURI();

            if (containsPathTraversal(requestUri)) {
                logger.warn("Blocked path traversal attempt: {}", requestUri);
                ((HttpServletResponse) response).sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid request path");
                return;
            }
        }

        chain.doFilter(request, response);
    }

    /**
     * Checks whether the given URI contains path traversal sequences,
     * including encoded variants.
     */
    private boolean containsPathTraversal(String uri) {
        if (uri == null) {
            return false;
        }

        // Check the raw URI
        if (hasTraversalSequence(uri)) {
            return true;
        }

        // Check single-decoded URI to catch %2e%2e/%2f etc.
        try {
            String decoded = URLDecoder.decode(uri, StandardCharsets.UTF_8);
            if (hasTraversalSequence(decoded)) {
                return true;
            }

            // Check double-decoded URI to catch %252e%252e etc.
            String doubleDecoded = URLDecoder.decode(decoded, StandardCharsets.UTF_8);
            if (hasTraversalSequence(doubleDecoded)) {
                return true;
            }
        } catch (IllegalArgumentException e) {
            // Malformed URI encoding — reject as suspicious
            return true;
        }

        return false;
    }

    private boolean hasTraversalSequence(String path) {
        // Normalize backslashes to forward slashes for Windows compatibility
        String normalized = path.replace('\\', '/');

        return normalized.contains("../")
                || normalized.contains("/..")
                || normalized.equals("..");
    }
}

