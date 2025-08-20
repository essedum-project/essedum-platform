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

package com.lfn.common.app.web.rest;

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
import com.lfn.ai.comm.lib.util.HeadersUtil;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.common.app.security.jwt.CustomAuthFilter;
import com.lfn.common.app.security.jwt.CustomJWTTokenProvider;
import com.lfn.common.app.security.rest.dto.ApplicationUIConfigDTO;
import com.lfn.common.app.security.rest.dto.AuthorizeApiDTO;
import com.lfn.common.app.security.rest.dto.ResponseDTO;
import com.lfn.iamp.usm.domain.Project;
import com.lfn.iamp.usm.domain.UsmAuthToken;
import com.lfn.iamp.usm.dto.ProjectDTO;
import com.lfn.iamp.usm.service.ProjectService;
import com.lfn.iamp.usm.service.UserProjectRoleService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Setter;

// 
/**
 * The Class ApplicationConfigResource.
 *
 * @author essedum
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

	@EssedumProperty("application.uiconfig.font")
	private String font;

	@EssedumProperty("application.uiconfig.ldapVerification")
	private String ldapVerification;

	@EssedumProperty("application.uiconfig.logoLocation")
	private String logoLocation;

	@EssedumProperty("application.uiconfig.telemetry")
	private String telemetry;

	@EssedumProperty("application.uiconfig.telemetryUrl")
	private String telemetryUrl;

	@EssedumProperty("application.uiconfig.telemetry.pdata.id")
	private String telemetryPdataId;

	@EssedumProperty("application.uiconfig.theme")
	private String theme;

	@EssedumProperty("application.uiconfig.data_limit")
	private String dataLimit;

	@EssedumProperty("application.uiconfig.autoUserProject")
	private String autoUserProject;

	@EssedumProperty("application.uiconfig.autoUserCreation")
	private String autoUserCreation;

	@EssedumProperty("application.uiconfig.capBaseUrl")
	private String capBaseUrl;

	@EssedumProperty("application.uiconfig.epoch")
	private String epoch;
	
	@EssedumProperty("application.uiconfig.notification")
	private String notification;
	
	@EssedumProperty("application.uiconfig.calendar")
	private String calendar;
	
	@EssedumProperty("application.uiconfig.dstFlag")
	private String dstFlag;

	@EssedumProperty("application.uiconfig.epochChatUrl")
	private String epochChatUrl;
	@EssedumProperty("application.uiconfig.appVersion")
	private String appVersion;
	
	@EssedumProperty("application.uiconfig.essedumAppYear")
	private String essedumAppYear;

	@EssedumProperty("application.uiconfig.showPortfolioHeader")
	private String showPortfolioHeader;

	@EssedumProperty("application.uiconfig.eventApiUrls")
	private String eventApiUrls;

	@EssedumProperty("application.uiconfig.enckeydefault")
	private String encKeydefault;
	
	@EssedumProperty("application.uiconfig.enckeydefault")
	private String logoValue;

	@EssedumProperty("application.uiconfig.showProfileIcon")
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
		configDTO.setEssedumAppYear(essedumAppYear);
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
	@GetMapping("/essedum/logout")
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
	@PostMapping(value="/essedum/authorize", produces = APPLICATION_JSON_VALUE) 
	 public ResponseEntity<ResponseDTO> authorize(@Valid @RequestBody AuthorizeApiDTO authorizeApiDTO){

		return new ResponseEntity<>(this.tokenProvider.authorize(authorizeApiDTO),new HttpHeaders(),HttpStatus.OK);
		
	}

}
