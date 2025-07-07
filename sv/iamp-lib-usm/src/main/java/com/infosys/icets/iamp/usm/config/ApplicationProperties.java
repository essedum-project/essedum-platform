/**
 * @ 2023 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.iamp.usm.config;

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
 * @author icets
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
	 * @author icets
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
