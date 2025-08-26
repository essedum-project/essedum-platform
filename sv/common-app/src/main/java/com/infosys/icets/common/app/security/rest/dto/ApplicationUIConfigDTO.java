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
