package com.lfn.common.app.security.config;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.stereotype.Component;

import com.lfn.ai.comm.lib.util.HeadersUtil;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.RegularExpressionUtil;
import com.lfn.ai.comm.lib.util.exceptions.InvalidProjectRequestHeader;
import com.lfn.iamp.usm.service.UserProjectRoleService;
import com.lfn.iamp.usm.service.configApis.support.ConfigurationApisService;

import jakarta.servlet.http.HttpServletRequest;

@Component
public final class CustomAuthorizationManager implements AuthorizationManager<RequestAuthorizationContext> {
	/** The logger. */
	private final Logger log = LoggerFactory.getLogger(CustomAuthorizationManager.class);

	/** Shared builder for path-pattern based request matchers. */
	private static final PathPatternRequestMatcher.Builder PATH_MATCHERS = PathPatternRequestMatcher.withDefaults();

	@Value("${apipermission.disable_api_security_validation:#{false}}")
	private String permissionCheck;

	@Value("${security.claim:email}")
	private String claim;

	@Value("${icip.pathPrefix}")
	private String icipPathPrefix;

	private final ConfigurationApisService configurationApisService;

	private final UserProjectRoleService userProjectRoleService;

	public CustomAuthorizationManager(ConfigurationApisService configurationApisService,
			UserProjectRoleService userProjectRoleService) {
		this.configurationApisService = configurationApisService;
		this.userProjectRoleService = userProjectRoleService;
	}

	@Override
	public AuthorizationDecision check(Supplier<Authentication> authentication,
			RequestAuthorizationContext authorizationContext) {
		HttpServletRequest request = authorizationContext.getRequest();
		String urlForValidation = request.getRequestURI();

		// The below URLs and the whitelisted URLs do not require authentication nor authorization - permitAll
		if (isPublicEndpoint(request) || isWhitelisted(urlForValidation)) {
			return new AuthorizationDecision(true);
		}

		if (request.getUserPrincipal() == null) {
			log.debug("Request unauthenticated: {}", urlForValidation);
			return new AuthorizationDecision(false);
		}

		if (permissionCheck.equalsIgnoreCase("true")) {
			log.debug("permissionCheck - {}", permissionCheck);
			return new AuthorizationDecision(true);
		}

		// Start of role permission and other access checks, that are bypassed by permissionCheck
		if ("anonymousUser".equals(request.getUserPrincipal().getName())) {
			log.debug("Request assigned Anonymous User: {}", urlForValidation);
			return new AuthorizationDecision(false);
		}

		if (isExpiredToken(request)) {
			log.debug("Request token expired: {}", urlForValidation);
			return new AuthorizationDecision(false);
		}

		Integer projectId = resolveProjectId(request);
		if (projectId == null) {
			log.debug("Request does not have project ID: {}", urlForValidation);
			return new AuthorizationDecision(false);
		}

		List<Integer> roleIdList = resolveRoleIdList(request, projectId);
		if (roleIdList.isEmpty()) {
			log.debug("Request does not have role on project: {}", urlForValidation);
			return new AuthorizationDecision(false);
		}

		return new AuthorizationDecision(hasApiAccess(roleIdList, urlForValidation, request.getMethod()));
	}

	/**
	 * The endpoints that are open to all (no authentication/authorization required).
	 */
	private List<String> publicPatterns() {
		String prefix = icipPathPrefix.trim();
		return List.of("/api/getConfigDetails", "/api/authenticate", "/api/github/**", "/actuator/**",
				"/api/get-startup-constants/**", "/api/pipelinemodels/**", "/api/projects/page", "/api/incidents/**",
				"/api/tad/**", "/api/automation/**", "/api/file/**", "/api/batch/client/**", "/api/batch/generic/**",
				"/api/datasets/upload", "/" + prefix + "/datasets/upload", "/api/copyblueprint/**",
				"/api/datasets/saveChunks/**", "/api/datasets/attachmentupload/**",
				"/" + prefix + "/datasets/saveChunks/**", "/" + prefix + "/datasets/attachmentupload/**",
				"/api/email/**", "/api/event/trigger/**", "/api/sre-availability-cal/**", "/api/usm-notificationss",
				"/api/registerUser", "/api/userss/resetPassword", "/api/userss/checkemail", "/api/demo-usecase",
				"/api/demo-usecase/**", "/api/adapter_workflow/**", "/api/interactiveWorkflow/**",
				"/api/RPAExternalTask/**");
	}

	private boolean isPublicEndpoint(HttpServletRequest request) {
		for (String pattern : publicPatterns()) {
			if (PATH_MATCHERS.matcher(pattern).matcher(request).isMatch()) {
				return true;
			}
		}
		return false;
	}

	private boolean isWhitelisted(String urlForValidation) {
		for (String apiRegex : configurationApisService.getWhiteListedUrl()) {
			if (RegularExpressionUtil.matchInputForRegex(urlForValidation, apiRegex)) {
				return true;
			}
		}
		return false;
	}

	private boolean isExpiredToken(HttpServletRequest request) {
		String token = HeadersUtil.getAuthorizationToken(request);
		if (token == null) {
			return false;
		}
		userProjectRoleService.deleteExpiredToken();
		return userProjectRoleService.isInvalidToken(token);
	}

	private Integer resolveProjectId(HttpServletRequest request) {
		try {
			return HeadersUtil.getProjectId(request);
		} catch (InvalidProjectRequestHeader e) {
			log.error("Invalid project request header", e);
			return null;
		}
	}

	private List<Integer> resolveRoleIdList(HttpServletRequest request, Integer projectId) {
		Integer roleId = null;
		try {
			roleId = HeadersUtil.getRoleId(request);
		} catch (InvalidProjectRequestHeader e) {
			log.error("Invalid project request header", e);
		}
		String user = ICIPUtils.getUser(claim);
		String roleName = HeadersUtil.getRoleName(request);
		List<Integer> roleIdList = new ArrayList<>();
		if (roleId == null && roleName == null) {
			roleIdList = userProjectRoleService.getMappedRolesForUserLoginAndProject(user, projectId);
			log.debug("Role details not available, default mapping the roles for user and project : {} ", roleIdList);
		} else if (roleId != null) {
			if (Boolean.TRUE.equals(userProjectRoleService.isRoleExistsByUserAndProjectIdAndRoleId(user, projectId, roleId))) {
				roleIdList.add(roleId);
			}
		} else {
			roleIdList.add(userProjectRoleService.getRoleIdByUserAndProjectIdAndRoleName(user, projectId, roleName));
		}
		return roleIdList;
	}

	private boolean hasApiAccess(List<Integer> roleIdList, String urlForValidation, String httpMethod) {
		String upperMethod = httpMethod.toUpperCase();
		for (Integer roleId : roleIdList) {
			for (Map.Entry<String, List<String>> apiMap : configurationApisService.getRoleMappedApis(roleId)
					.entrySet()) {
				if (RegularExpressionUtil.matchInputForRegex(urlForValidation, apiMap.getKey())
						&& (apiMap.getValue().contains(upperMethod) || apiMap.getValue().contains("ALL"))) {
					return true;
				}
			}
		}
		return false;
	}

}
