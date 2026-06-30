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

import java.security.KeyStore;

import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;

/**
 * Provides a properly validating {@link TrustManager} backed by the JVM's default trust store.
 * <p>
 * This replaces the previous "trust-all" {@code X509TrustManager} implementations whose
 * {@code checkServerTrusted}/{@code checkClientTrusted} methods were empty (and therefore trusted
 * every certificate, enabling man-in-the-middle attacks). Server certificates are now validated
 * against the platform trust store. To talk to an endpoint that presents a self-signed or private
 * CA certificate, import that certificate into the JVM/container trust store rather than disabling
 * validation.
 */
public final class SecureTrustManagerUtil {

	private SecureTrustManagerUtil() {
		// Utility class
	}

	/**
	 * Returns the default, validating {@link X509TrustManager} from the platform trust store,
	 * wrapped in a single-element array suitable for {@link javax.net.ssl.SSLContext#init}.
	 *
	 * @return validating trust managers
	 * @throws IllegalStateException if no default {@link X509TrustManager} is available
	 */
	public static TrustManager[] getValidatingTrustManagers() {
		try {
			TrustManagerFactory trustManagerFactory = TrustManagerFactory
					.getInstance(TrustManagerFactory.getDefaultAlgorithm());
			trustManagerFactory.init((KeyStore) null);
			for (TrustManager trustManager : trustManagerFactory.getTrustManagers()) {
				if (trustManager instanceof X509TrustManager) {
					return new TrustManager[] { trustManager };
				}
			}
			throw new IllegalStateException(
					"No X509TrustManager found in the default trust store. Install the required certificate in the keystore.");
		} catch (IllegalStateException e) {
			throw e;
		} catch (Exception e) {
			throw new IllegalStateException("Failed to initialize the default TrustManager", e);
		}
	}
}
