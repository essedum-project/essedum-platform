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
package com.infosys.icets.common.app.security.rest.dto;

import com.infosys.icets.iamp.usm.dto.ProjectDTO;

import lombok.Getter;
import lombok.Setter;

// 
/**
 * The Class ApplicationUIConfigDTO.
 *
 * @author icets
 */

/**
 * Gets the font.
 *
 * @return the font
 */

/**
 * Gets the font.
 *
 * @return the font
 */
@Getter
/**
 * Sets the font.
 *
 * @param font the new font
 */

/**
 * Sets the font.
 *
 * @param font the new font
 */
@Setter
public class ApplicationUIConfigDTO {

	/** The base url. */
	private String baseUrl;
	
	/** The i CAP url. */
	private String iCAPUrl;
	
	/** The spark url. */
	private String sparkUrl;

	/** The active profiles. */
	private String activeProfiles;

	/** The data limit. */
	private Integer data_limit;

	/** The ldap verification. */
	private Boolean ldap_verification;

	/** The auto user creation. */
	private String autoUserCreation;

	/** The auto user project. */
	private ProjectDTO autoUserProject;

	/** The auth url. */
	private String authUrl;

	/** The mlstudio url. */
	private String mlstudioUrl;

	/** The msal client id. */
	private String msalClientId;

	/** The msal authority. */
	private String msalAuthority;

	/** The msal redirect uri. */
	private String msalRedirectUri;

	/** The msal post logout redirect uri. */
	private String msalPostLogoutRedirectUri;

	/** The msal consent scopes. */

	/** The kc url. */
	private String kcUrl;

	/** The kc realm. */
	private String kcRealm;

	/** The kc client id. */
	private String kcClientId;
	
	/** The client logo. */
	private Boolean clientLogo;
	
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

	/** The telemetry url . */
	private String telemetryPdataId;
	
	/** The Epoch Url. */
	private Boolean epoch;
	
	private Boolean notification;
	
	private Boolean calendar;
	
	private String dstFlag;
	
	/** The epoch chat url. */
	private String epochChatUrl;
	
	private String issuerUri;
	private String clientId;
	private String scope;
	private Double silentRefreshTimeoutFactor;
	private String appVersion;
	private String leapAppYear;
	private String showPortfolioHeader;
	private String eventApiUrls;
	private String encDefault;
	private String showProfileIcon;
	private Integer expireTokenTime;
	

}
