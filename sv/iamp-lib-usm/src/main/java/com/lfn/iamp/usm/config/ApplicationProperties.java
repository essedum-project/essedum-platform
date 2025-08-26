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

package com.lfn.iamp.usm.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// TODO: Auto-generated Javadoc
/**
 * Properties specific to Rpt.
 * <p>
 * Properties are configured in the application.yml file. See
 * 
 */
/**
 * @author essedum
 */
@Configuration
@ConfigurationProperties(prefix = "application")

/**
 * Gets the mailserver.
 *
 * @return the mailserver
 */

/**
 * Gets the mailserver.
 *
 * @return the mailserver
 */
@Getter
public class ApplicationProperties {

	/** The uiconfig. */
	private final UIConfig uiconfig = new UIConfig();

	/**
	 * The Class UIConfig.
	 *
	 * @author essedum
	 */
	/**
	 * Gets the font.
	 *
	 * @return the font
	 */

	/**
	 * Gets the epoch.
	 *
	 * @return the epoch
	 */
	@Getter

	/**
	 * Sets the font.
	 *
	 * @param font the new font
	 */

	/**
	 * Sets the epoch.
	 *
	 * @param epoch the new epoch
	 */
	@Setter

	/**
	 * Instantiates a new UI config.
	 */

	/**
	 * Instantiates a new UI config.
	 */
	@NoArgsConstructor
	public class UIConfig {

		/** The base url. */
		private String baseUrl;

		/** The i CAP url. */
		private String iCAPUrl;

		/** The spark url. */
		private String sparkUrl;


		/** The data limit. */
		private String data_limit;

		/** The ldap verification. */
		private String ldapVerification;

		/** The auto user creation. */
		private String autoUserCreation;

		/** The auto user project. */
		private String autoUserProject;

		/** The auth url. */
		private String authUrl;

		/** The mlstudio url. */
		private String mlstudioUrl;

		/** The client logo. */
		private String clientLogo;

		/** The logo location. */
		private String logoLocation;

		/** The cap base url. */
		private String capBaseUrl;

		/** The cap auth url. */
		private String capAuthUrl;

		/** The theme. */
		private String theme;

		/** The font. */
		private String font;

		/** The telemetry enable . */
		private Boolean telemetry;

		/** The telemetry url . */
		private String telemetryUrl;

		/** The epoch url. */
		private Boolean epoch;
		
		/** The epoch chat url. */
		private String epochChatUrl;
	}

}
