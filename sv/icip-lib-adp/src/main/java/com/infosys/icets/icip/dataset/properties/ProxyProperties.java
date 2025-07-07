/**
 * @ 2021 - 2022 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
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
