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

package com.infosys.icets.common.app.web.rest;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import java.sql.SQLException;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.infosys.icets.ai.comm.lib.util.HeadersUtil;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;
import com.infosys.icets.common.app.security.jwt.CustomAuthFilter;
import com.infosys.icets.common.app.security.jwt.CustomJWTTokenProvider;
import com.infosys.icets.common.app.security.rest.dto.ApplicationUIConfigDTO;
import com.infosys.icets.common.app.security.rest.dto.AuthorizeApiDTO;
import com.infosys.icets.common.app.security.rest.dto.ResponseDTO;
import com.infosys.icets.iamp.usm.domain.Project;
import com.infosys.icets.iamp.usm.domain.UsmAuthToken;
import com.infosys.icets.iamp.usm.dto.ProjectDTO;
import com.infosys.icets.iamp.usm.service.ProjectService;
import com.infosys.icets.iamp.usm.service.UserProjectRoleService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Setter;

// 
/**
 * The Class ApplicationConfigResource.
 *
 * @author icets
 */
@RestController
@RequestMapping("/api")
@Setter
@RefreshScope
@Tag(name= "Common APIs")
public class ApplicationConfigResource {

	/** The logger. */
	private final Logger logger = LoggerFactory.getLogger(ApplicationConfigResource.class);
	/**
	 * for getting hte incoming request
	 */
	@Autowired
    private HttpServletRequest request;


	@Autowired
	private CustomAuthFilter jWTFilter;


	/** The token provider. */
	@Autowired
	private CustomJWTTokenProvider tokenProvider;

	/** The user project role service. */
	@Autowired
	private UserProjectRoleService userProjectRoleService;
	
	/** The project service. */
	@Autowired
	private ProjectService projectService;

	/** The active profiles. */
	@Value("${spring.profiles.active}")
	private String activeProfiles;

	@Value("${security.issuer-uri:#{null}}")
	private String issuerUri;

	@Value("${security.clientId:#{null}}")
	private String clientId;

	@Value("${security.scope:#{null}}")
	private String scope;

	@Value("${security.silentRefreshTimeoutFactor:0.90}")
	private Double silentRefreshTimeoutFactor;

	@LeapProperty("application.uiconfig.font")
	private String font;

	@LeapProperty("application.uiconfig.ldapVerification")
	private String ldapVerification;

	@LeapProperty("application.uiconfig.logoLocation")
	private String logoLocation;

	@LeapProperty("application.uiconfig.telemetry")
	private String telemetry;

	@LeapProperty("application.uiconfig.telemetryUrl")
	private String telemetryUrl;

	@LeapProperty("application.uiconfig.telemetry.pdata.id")
	private String telemetryPdataId;

	@LeapProperty("application.uiconfig.theme")
	private String theme;

	@LeapProperty("application.uiconfig.data_limit")
	private String dataLimit;

	@LeapProperty("application.uiconfig.autoUserProject")
	private String autoUserProject;

	@LeapProperty("application.uiconfig.autoUserCreation")
	private String autoUserCreation;

	@LeapProperty("application.uiconfig.capBaseUrl")
	private String capBaseUrl;

	@LeapProperty("application.uiconfig.epoch")
	private String epoch;
	
	@LeapProperty("application.uiconfig.notification")
	private String notification;
	
	@LeapProperty("application.uiconfig.calendar")
	private String calendar;
	
	@LeapProperty("application.uiconfig.dstFlag")
	private String dstFlag;

	@LeapProperty("application.uiconfig.epochChatUrl")
	private String epochChatUrl;
	@LeapProperty("application.uiconfig.appVersion")
	private String appVersion;
	
	@LeapProperty("application.uiconfig.leapAppYear")
	private String leapAppYear;

	@LeapProperty("application.uiconfig.showPortfolioHeader")
	private String showPortfolioHeader;

	@LeapProperty("application.uiconfig.eventApiUrls")
	private String eventApiUrls;

	@LeapProperty("application.uiconfig.enckeydefault")
	private String encKeydefault;
	
	@LeapProperty("application.uiconfig.enckeydefault")
	private String logoValue;

	@LeapProperty("application.uiconfig.showProfileIcon")
	private String showProfileIcon;

	@Value("${jwt.token-validity-in-seconds:#{null}}")
	private Integer expireTokenTime;
	
	
	/**
	 * GET /getConfigDetails.
	 *
	 * @return the ResponseEntity with status 200 (OK) and the
	 *         ApplicationUIConfigDTO in body
	 * @throws NumberFormatException the number format exception
	 * @throws SQLException          the SQL exception
	 */
	@GetMapping("/getConfigDetails")
	@Timed
	public ResponseEntity<ApplicationUIConfigDTO> getConfigDetails() throws NumberFormatException, SQLException {
		logger.debug("REST request to get config details ");
		ApplicationUIConfigDTO configDTO = new ApplicationUIConfigDTO();
		configDTO.setAutoUserCreation(autoUserCreation);
		configDTO.setActiveProfiles(activeProfiles);
		configDTO.setLdap_verification(Boolean.valueOf(ldapVerification));
		configDTO.setData_limit(Integer.parseInt(dataLimit));

		configDTO.setLogoLocation(logoLocation);
		Project project = projectService.findOne(Integer.parseInt(autoUserProject));
		ProjectDTO projectDTO = new ProjectDTO();
		projectDTO.setId(project.getId());
		projectDTO.setName(project.getName());
		projectDTO.setDescription(project.getDescription());
		projectDTO.setLogo(project.getLogo());
		if(project.getId() != null) {
			projectDTO.setId(project.getId());
			projectDTO.setName(project.getName());
			projectDTO.setDescription(project.getDescription());
			projectDTO.setLogo(project.getLogo());
		}
		configDTO.setAutoUserProject(projectDTO);
		configDTO.setCapBaseUrl(capBaseUrl);
		configDTO.setTheme(theme);
		configDTO.setFont(font);
		configDTO.setTelemetry(Boolean.valueOf(telemetry));
		configDTO.setTelemetryUrl(telemetryUrl);
		configDTO.setTelemetryPdataId(telemetryPdataId);
		configDTO.setEpoch(Boolean.valueOf(epoch));
		configDTO.setNotification(Boolean.valueOf(notification));
		configDTO.setCalendar(Boolean.valueOf(calendar));
		configDTO.setDstFlag(dstFlag);		
		configDTO.setEpochChatUrl(epochChatUrl);
		configDTO.setIssuerUri(issuerUri);
		configDTO.setClientId(clientId);
		configDTO.setShowProfileIcon(showProfileIcon);
		configDTO.setScope(scope);
		configDTO.setSilentRefreshTimeoutFactor(silentRefreshTimeoutFactor);
		configDTO.setAppVersion(appVersion);
		configDTO.setLeapAppYear(leapAppYear);
		configDTO.setExpireTokenTime(expireTokenTime);
		configDTO.setShowPortfolioHeader(showPortfolioHeader);
		configDTO.setEventApiUrls(eventApiUrls);
		configDTO.setEncDefault(encKeydefault);
		configDTO.setData_limit(Integer.parseInt(dataLimit));
		return new ResponseEntity<>(configDTO, new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * 
	 * @return
	 * @throws JsonProcessingException
	 */
	@Operation(summary = "Logout User")
	@GetMapping("/leap/logout")
	public ResponseEntity<?> createInvalidToken() throws JsonProcessingException {
		if(HeadersUtil.getAuthorizationToken(request)!=null) {
			UsmAuthToken usmAuthToken=new UsmAuthToken();
            
			usmAuthToken.setToken(HeadersUtil.getAuthorizationToken(request));
            usmAuthToken.setExpiry(tokenProvider.getExpiryTime(jWTFilter.resolveToken(request)).getTime());
            usmAuthToken.setUserLogin(ICIPUtils.getUser(null));

			usmAuthToken.setCreatedDate(ZonedDateTime.now());
			userProjectRoleService.addInvalidToken(usmAuthToken);
			
			return new ResponseEntity<>("User logged out successfully",
					new HttpHeaders(),  HttpStatus.OK);
			
		}
		return new ResponseEntity<>("Not able to log out :please try again",
				new HttpHeaders(),  HttpStatus.OK);
		
	}
	

	/**
	 * 
	 * @param AuthorizeApiDTO
	 * @return access permission with description
	 * 
	 */
	@Operation(summary = "authorize a url")
	@PostMapping(value="/leap/authorize", produces = APPLICATION_JSON_VALUE) 
	 public ResponseEntity<ResponseDTO> authorize(@Valid @RequestBody AuthorizeApiDTO authorizeApiDTO){

		return new ResponseEntity<>(this.tokenProvider.authorize(authorizeApiDTO),new HttpHeaders(),HttpStatus.OK);
		
	}

}
