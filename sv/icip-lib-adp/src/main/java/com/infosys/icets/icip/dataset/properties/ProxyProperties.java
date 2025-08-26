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

package com.infosys.icets.icip.dataset.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Getter;
import lombok.Setter;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ProxyProperties.
 *
 * @author icets
 */
@Configuration
@ConfigurationProperties(prefix = "proxy", ignoreInvalidFields = true, ignoreUnknownFields = true)

/**
 * Gets the http proxy configuration.
 *
 * @return the http proxy configuration
 */

/**
 * Gets the http proxy configuration.
 *
 * @return the http proxy configuration
 */

/**
 * Gets the http proxy configuration.
 *
 * @return the http proxy configuration
 */
@Getter	
	/**
	 * Sets the http proxy configuration.
	 *
	 * @param httpProxyConfiguration the new http proxy configuration
	 */
	
	/**
	 * Sets the http proxy configuration.
	 *
	 * @param httpProxyConfiguration the new http proxy configuration
	 */
	
	/**
	 * Sets the http proxy configuration.
	 *
	 * @param httpProxyConfiguration the new http proxy configuration
	 */
	@Setter
public class ProxyProperties {

	/** The http proxy configuration. */
	private HttpProxyConfiguration httpProxyConfiguration = new HttpProxyConfiguration();

	/**
	 * Gets the proxy password.
	 *
	 * @return the proxy password
	 */
	
	/**
	 * Gets the proxy password.
	 *
	 * @return the proxy password
	 */
	
	/**
	 * Gets the proxy password.
	 *
	 * @return the proxy password
	 */
	@Getter	/**
	 * Sets the proxy password.
	 *
	 * @param proxyPassword the new proxy password
	 */
	
	/**
	 * Sets the proxy password.
	 *
	 * @param proxyPassword the new proxy password
	 */
	
	/**
	 * Sets the proxy password.
	 *
	 * @param proxyPassword the new proxy password
	 */
	@Setter
	public class HttpProxyConfiguration {
		
		/** The no proxy host. */
		private String[] noProxyHost;
		
		/** The proxy scheme. */
		private String proxyScheme;
		
		/** The proxy host. */
		private String proxyHost;
		
		/** The proxy port. */
		private Integer proxyPort;
		
		/** The proxy user. */
		private String proxyUser;
		
		/** The proxy password. */
		private String proxyPassword;
	}
}
