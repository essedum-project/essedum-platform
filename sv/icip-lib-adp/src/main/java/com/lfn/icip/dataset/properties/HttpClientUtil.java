/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

package com.lfn.icip.dataset.properties;

import java.io.InputStream;
import java.net.URI;
import java.security.KeyManagementException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;

import javax.net.ssl.SSLContext;

import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.conn.ssl.NoopHostnameVerifier;
import org.apache.http.conn.ssl.TrustAllStrategy;
import org.apache.http.conn.ssl.TrustStrategy;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.conn.DefaultProxyRoutePlanner;
import org.apache.http.ssl.SSLContextBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.lfn.icip.dataset.properties.ProxyProperties.HttpProxyConfiguration;
 
/**
 * The Class HttpClientUtil.
 *
 * @author essedum
 */
public class HttpClientUtil {
	
	/** The logger. */
	private static Logger logger = LoggerFactory.getLogger(HttpClientUtil.class);

	/**
	 * Instantiates a new http client util.
	 */
	public HttpClientUtil() {
		super();
	}

	/**
	 * Wild card match.
	 *
	 * @param text the text
	 * @param patterns the patterns
	 * @return true, if successful
	 */
	private static boolean wildCardMatch(String text, String[] patterns) {
		boolean flag = false;
		for (String pattern : patterns) {
			flag = wildCardMatch(text.toCharArray(), pattern.toCharArray(), text.length(), pattern.length());
			if (flag)
				break;
		}
		return flag;
	}

	/**
	 * Wild card match.
	 *
	 * @param txt the txt
	 * @param pat the pat
	 * @param n the n
	 * @param m the m
	 * @return true, if successful
	 */
	private static boolean wildCardMatch(char txt[], char pat[], int n, int m) {
		if (m == 0)
			return (n == 0);
		int i = 0, j = 0, index_txt = -1, index_pat = -1;
		while (i < n) {
			if (j < m && txt[i] == pat[j]) {
				i++;
				j++;
			} else if (j < m && pat[j] == '?') {
				i++;
				j++;
			} else if (j < m && pat[j] == '*') {
				index_txt = i;
				index_pat = j;
				j++;
			} else if (index_pat != -1) {
				j = index_pat + 1;
				i = index_txt + 1;
				index_txt++;
			} else {
				return false;
			}
		}
		while (j < m && pat[j] == '*') {
			j++;
		}
		if (j == m) {
			return true;
		}
		return false;
	}

	/**
	 * Sets the proxy properties.
	 *
	 * @param uri                 the uri
	 * @param builder             the builder
	 * @param credentialsProvider the credentials provider
	 * @param proxyProperties     the proxy properties
	 */
	public static void setProxyProperties(URI uri, HttpClientBuilder builder, CredentialsProvider credentialsProvider,
			ProxyProperties proxyProperties) {
		if (proxyProperties.getHttpProxyConfiguration() != null) {
			final HttpProxyConfiguration httpProxyConfiguration = proxyProperties.getHttpProxyConfiguration();
			if (wildCardMatch(uri.toString(), httpProxyConfiguration.getNoProxyHost())) {
				logger.info("{} uri does not require proxy", uri.toString());
				return;
			}
			HttpHost proxy = new HttpHost(httpProxyConfiguration.getProxyHost(), httpProxyConfiguration.getProxyPort());
			builder.setRoutePlanner(new DefaultProxyRoutePlanner(proxy));
			if (httpProxyConfiguration.getProxyUser() != null) {
				credentialsProvider.setCredentials(
						new AuthScope(httpProxyConfiguration.getProxyHost(), httpProxyConfiguration.getProxyPort()),
						new UsernamePasswordCredentials(httpProxyConfiguration.getProxyUser(),
								httpProxyConfiguration.getProxyPassword()));
			}
			logger.info("Applied proxy {} to url {}", proxy.toURI(), uri.toString());
		}
	}


	/**
	 * Gets the http client.
	 *
	 * @param authType        the auth type
	 * @param username        the username
	 * @param pwd             the pwd
	 * @param uri             the uri
	 * @param proxyProperties the proxy properties
	 * @param sslContext 
	 * @return the http client
	 * @throws KeyStoreException 
	 * @throws NoSuchAlgorithmException 
	 * @throws KeyManagementException 
	 * @throws Exception 
	 */
	public static CloseableHttpClient getHttpClient(String authType, String username, String pwd, URI uri,
			ProxyProperties proxyProperties, SSLContext sslContext) throws KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
		
		HttpClientBuilder builder = HttpClients.custom();
		if(sslContext!=null) {
			logger.info("Adding keystore with SSL");
			builder.setSSLContext(sslContext);
			logger.info("MTLS Authentication added");
		}
		else
//			builder.setSSLContext(new SSLContextBuilder().loadTrustMaterial(null, new TrustStrategy() {
//				public boolean isTrusted(X509Certificate[] arg0, String arg1) throws CertificateException {
//					return true;
//				}
//			}).build());
			builder.setSSLContext(new SSLContextBuilder().loadTrustMaterial(null, new TrustAllStrategy()).build())
			.setSSLHostnameVerifier(NoopHostnameVerifier.INSTANCE)
			.build();
		logger.info("Client Builder Created");
		

		CredentialsProvider credentialsProvider = new BasicCredentialsProvider();
		if (authType.equalsIgnoreCase("BasicAuth")) {
			credentialsProvider.setCredentials(new AuthScope(uri.getHost(), AuthScope.ANY_PORT),
					new UsernamePasswordCredentials(username, pwd));
		}
		setProxyProperties(uri, builder, credentialsProvider, proxyProperties);
		builder.setDefaultCredentialsProvider(credentialsProvider);

		return builder.build();
	}

}
