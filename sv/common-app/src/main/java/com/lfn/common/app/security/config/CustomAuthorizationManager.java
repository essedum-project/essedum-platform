package com.lfn.common.app.security.config;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

import com.lfn.ai.comm.lib.util.HeadersUtil;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.RegularExpressionUtil;
import com.lfn.ai.comm.lib.util.exceptions.InvalidProjectRequestHeader;
import com.lfn.iamp.usm.service.UserProjectRoleService;
import com.lfn.iamp.usm.service.configApis.support.ConfigurationApisService;

public final class CustomAuthorizationManager implements AuthorizationManager<RequestAuthorizationContext> {
	/** The logger. */
	private final Logger log = LoggerFactory.getLogger(CustomAuthorizationManager.class);

	@Value("${apipermission.disable_api_security_validation:#{false}}")
	private String permissionCheck;
	
	@Value("${security.claim:email}")
	private String claim;
	
	@Value("${icip.pathPrefix}")
	private String icipPathPrefix;
	
	@Autowired
	ConfigurationApisService configurationApisService;
	
	@Autowired
	private UserProjectRoleService userProjectRoleService;
	
	@Override
	public AuthorizationDecision check(Supplier<Authentication> authentication,
			RequestAuthorizationContext authorizationContext) {
		//The below URLS - does not require authentication nor authorization  - permitAll
		if(AntPathRequestMatcher.antMatcher("/api/getConfigDetails").matcher(authorizationContext.getRequest()).isMatch() ||
				AntPathRequestMatcher.antMatcher("/api/authenticate").matcher(authorizationContext.getRequest()).isMatch() ||
		   		AntPathRequestMatcher.antMatcher("/actuator/**").matcher(authorizationContext.getRequest()).isMatch() ||
				AntPathRequestMatcher.antMatcher("/api/get-startup-constants**").matcher(authorizationContext.getRequest()).isMatch() ||
				AntPathRequestMatcher.antMatcher("/api/pipelinemodels/**").matcher(authorizationContext.getRequest()).isMatch() ||
				AntPathRequestMatcher.antMatcher("/api/projects/page").matcher(authorizationContext.getRequest()).isMatch() ||
				AntPathRequestMatcher.antMatcher("/api/incidents/**").matcher(authorizationContext.getRequest()).isMatch() ||
				AntPathRequestMatcher.antMatcher("/api/tad/**").matcher(authorizationContext.getRequest()).isMatch() ||
				AntPathRequestMatcher.antMatcher("/api/automation/**").matcher(authorizationContext.getRequest()).isMatch() ||
				AntPathRequestMatcher.antMatcher("/api/file/**").matcher(authorizationContext.getRequest()).isMatch() ||
				AntPathRequestMatcher.antMatcher("/api/batch/client/**").matcher(authorizationContext.getRequest()).isMatch() ||
				AntPathRequestMatcher.antMatcher("/api/batch/generic/**").matcher(authorizationContext.getRequest()).isMatch() ||
				AntPathRequestMatcher.antMatcher("/api/datasets/upload").matcher(authorizationContext.getRequest()).isMatch() ||
				AntPathRequestMatcher.antMatcher("/"+icipPathPrefix.trim()+"/datasets/upload").matcher(authorizationContext.getRequest()).isMatch() ||
				AntPathRequestMatcher.antMatcher("/api/copyblueprint/**").matcher(authorizationContext.getRequest()).isMatch() ||
				AntPathRequestMatcher.antMatcher("/api/datasets/saveChunks/**").matcher(authorizationContext.getRequest()).isMatch() ||
				AntPathRequestMatcher.antMatcher("/api/datasets/attachmentupload/**").matcher(authorizationContext.getRequest()).isMatch() ||
				AntPathRequestMatcher.antMatcher("/"+icipPathPrefix.trim()+"/datasets/saveChunks/**").matcher(authorizationContext.getRequest()).isMatch() ||
				AntPathRequestMatcher.antMatcher("/"+icipPathPrefix.trim()+"/datasets/attachmentupload/**").matcher(authorizationContext.getRequest()).isMatch() ||
				AntPathRequestMatcher.antMatcher("/api/email/**").matcher(authorizationContext.getRequest()).isMatch() ||
				AntPathRequestMatcher.antMatcher("/api/event/trigger/**").matcher(authorizationContext.getRequest()).isMatch() ||
				AntPathRequestMatcher.antMatcher("/api/sre-availability-cal/**").matcher(authorizationContext.getRequest()).isMatch() ||
				AntPathRequestMatcher.antMatcher("/api/usm-notificationss").matcher(authorizationContext.getRequest()).isMatch() ||
				AntPathRequestMatcher.antMatcher("/api/registerUser").matcher(authorizationContext.getRequest()).isMatch() ||
				AntPathRequestMatcher.antMatcher("/api/userss/resetPassword").matcher(authorizationContext.getRequest()).isMatch() ||
				AntPathRequestMatcher.antMatcher("/api/userss/checkemail").matcher(authorizationContext.getRequest()).isMatch() ||
				AntPathRequestMatcher.antMatcher("/api/demo-usecase").matcher(authorizationContext.getRequest()).isMatch() ||
				AntPathRequestMatcher.antMatcher("/api/demo-usecase/**").matcher(authorizationContext.getRequest()).isMatch() ||
				AntPathRequestMatcher.antMatcher("/api/adapter_workflow/**").matcher(authorizationContext.getRequest()).isMatch() ||
				AntPathRequestMatcher.antMatcher("/api/interactiveWorkflow/**").matcher(authorizationContext.getRequest()).isMatch() ||
				AntPathRequestMatcher.antMatcher("/api/RPAExternalTask/**").matcher(authorizationContext.getRequest()).isMatch())
			return new AuthorizationDecision(true);
		
		String urlForValidation=authorizationContext.getRequest().getQueryString() == null ? authorizationContext.getRequest().getRequestURI() :authorizationContext.getRequest().getRequestURI().concat("?".concat(authorizationContext.getRequest().getQueryString()));

		//Fetch the whitelistedURL - does not require authentication nor authorization - permitAll
		List<String> whitelistedURL = configurationApisService.getWhiteListedUrl(); 
		if(!whitelistedURL.isEmpty())
			for (String apiRegex : whitelistedURL) {
				if (RegularExpressionUtil.matchInputForRegex(urlForValidation, apiRegex)) {
					return new AuthorizationDecision(true);
				}
			}	
		
		if (authorizationContext.getRequest().getUserPrincipal() == null) {
			log.debug("Request unauthenticated: ", authorizationContext.getRequest().toString());
			return new AuthorizationDecision(false);
		}
		
		if (permissionCheck.equalsIgnoreCase("true")) {
			log.debug("permissionCheck - ", permissionCheck);
			return new AuthorizationDecision(true);
		}
		// Start of role permission and other access checks, that are bypassed by permissionCheck
		if (authorizationContext.getRequest().getUserPrincipal().getName().equals("anonymousUser")) {
			log.debug("Request assigned Anonymous User: ", authorizationContext.getRequest().toString());
			return new AuthorizationDecision(false);
		}
		
		if (HeadersUtil.getAuthorizationToken(authorizationContext.getRequest())!= null) {
			userProjectRoleService.deleteExpiredToken();
			if (userProjectRoleService
					.isInvalidToken(HeadersUtil.getAuthorizationToken(authorizationContext.getRequest()))) {
				log.debug("Request token expired: ", authorizationContext.getRequest().toString());
				return new AuthorizationDecision(false);
			}
		}
		
		Integer projectId = null;
		Integer roleId = null;
		try {
			projectId = HeadersUtil.getProjectId(authorizationContext.getRequest());
			roleId= HeadersUtil.getRoleId(authorizationContext.getRequest());
		} catch (InvalidProjectRequestHeader e) {
			e.printStackTrace();
		}
		
		if (projectId == null) {
			log.debug("Request does not have project ID: ", authorizationContext.getRequest().toString());
			return new AuthorizationDecision(false);
		}
		
		List<Integer> roleIdList = new ArrayList<Integer>();
		if (roleId == null && HeadersUtil.getRoleName(authorizationContext.getRequest()) == null) {
			roleIdList = userProjectRoleService.getMappedRolesForUserLoginAndProject(ICIPUtils.getUser(claim), projectId);
			log.debug("Role details not available, default mapping the roles for user and project : {} ",roleIdList);
		}
		else if (roleId != null) {
			if (userProjectRoleService.isRoleExistsByUserAndProjectIdAndRoleId(ICIPUtils.getUser(claim), projectId,
					roleId)) {
				roleIdList.add(roleId);
			}
		} else {
			Integer role = userProjectRoleService.getRoleIdByUserAndProjectIdAndRoleName(ICIPUtils.getUser(claim), projectId,
					HeadersUtil.getRoleName(authorizationContext.getRequest()));
			roleIdList.add(role);
		}
		if (roleIdList.isEmpty()) {
			log.debug("Request does not have role on project: ", authorizationContext.getRequest().toString());
			return new AuthorizationDecision(false);
		}

		for (Integer loop_roleid : roleIdList) {
				for (Map.Entry<String, List<String>> apiMap : this.configurationApisService.getRoleMappedApis(loop_roleid).entrySet()) {
					if (RegularExpressionUtil.matchInputForRegex(urlForValidation,apiMap.getKey())
							&& ((apiMap.getValue().contains(authorizationContext.getRequest().getMethod().toUpperCase())) || apiMap.getValue().contains("ALL"))) {
						return new AuthorizationDecision(true);
					}
				}
		}

		return new AuthorizationDecision(false);
	}

}
