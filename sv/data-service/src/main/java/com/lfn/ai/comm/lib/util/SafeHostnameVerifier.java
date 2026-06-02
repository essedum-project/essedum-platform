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

package com.lfn.ai.comm.lib.util;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A hostname verifier that uses the JDK default verification logic.
 * This replaces all instances of {@code (hostname, session) -> true} which
 * blindly accept any certificate regardless of hostname mismatch.
 *
 * <p>Usage with OkHttpClient:
 * <pre>
 *     new OkHttpClient.Builder()
 *         .hostnameVerifier(SafeHostnameVerifier.INSTANCE)
 *         .build();
 * </pre>
 *
 * <p>Usage with HttpsURLConnection:
 * <pre>
 *     HttpsURLConnection.setDefaultHostnameVerifier(SafeHostnameVerifier.INSTANCE);
 * </pre>
 */
public final class SafeHostnameVerifier implements HostnameVerifier {

    private static final Logger logger = LoggerFactory.getLogger(SafeHostnameVerifier.class);

    /** Singleton instance. */
    public static final SafeHostnameVerifier INSTANCE = new SafeHostnameVerifier();

    /** The JDK default verifier used as delegate. */
    private final HostnameVerifier defaultVerifier;

    private SafeHostnameVerifier() {
        this.defaultVerifier = HttpsURLConnection.getDefaultHostnameVerifier();
    }

    @Override
    public boolean verify(String hostname, SSLSession session) {
        boolean result = defaultVerifier.verify(hostname, session);
        if (!result) {
            logger.warn("Hostname verification failed for host: {}", hostname);
        }
        return result;
    }
}

