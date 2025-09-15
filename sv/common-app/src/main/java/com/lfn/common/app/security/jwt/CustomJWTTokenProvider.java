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

package com.lfn.common.app.security.jwt;

import java.security.Key;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Component;

import com.lfn.ai.comm.lib.util.RegularExpressionUtil;
import com.lfn.common.app.security.rest.dto.AuthorizeApiDTO;
import com.lfn.common.app.security.rest.dto.ResponseDTO;
import com.lfn.iamp.usm.service.UserProjectRoleService;
import com.lfn.iamp.usm.service.configApis.support.ConfigurationApisService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.SignatureException;
// 
/**
 * The Class TokenProvider.
 *
 * @author essedum
 */
@Component
public class CustomJWTTokenProvider implements InitializingBean {

	/** The log. */
	private final Logger logger = LoggerFactory.getLogger(CustomJWTTokenProvider.class);

	/** The Constant AUTHORITIES_KEY. */
	private static final String AUTHORITIES_KEY = "auth";

	/** The base 64 secret. */
	private final String base64Secret;

	/** The token validity in milliseconds. */
	private final long tokenValidityInMilliseconds;

	/** The token validity in milliseconds for remember me. */
	private final long tokenValidityInMillisecondsForRememberMe;

	/** The key. */
	private Key key;
	
	/** The user project role service. */
	private UserProjectRoleService userProjectRoleService;
	
	/** The user Configuration service. */
	private ConfigurationApisService configurationApisService;

	/**
	 * Instantiates a new token provider.
	 *
	 * @param base64Secret                        the base 64 secret
	 * @param tokenValidityInSeconds              the token validity in seconds
	 * @param tokenValidityInSecondsForRememberMe the token validity in seconds for
	 *                                            remember me
	 */
	CustomJWTTokenProvider(@Value("${jwt.base64-secret}") String base64Secret,
			@Value("${jwt.token-validity-in-seconds}") long tokenValidityInSeconds,
			@Value("${jwt.token-validity-in-seconds-for-remember-me}") long tokenValidityInSecondsForRememberMe,UserProjectRoleService userProjectRoleService,ConfigurationApisService configurationApisService) {
		this.base64Secret = base64Secret;
		this.tokenValidityInMilliseconds = tokenValidityInSeconds * 1000;
		this.tokenValidityInMillisecondsForRememberMe = tokenValidityInSecondsForRememberMe * 1000;
		this.userProjectRoleService=userProjectRoleService;
		this.configurationApisService=configurationApisService;
	}

	/**
	 * After properties set.
	 */
	@Override
	public void afterPropertiesSet() {
		byte[] keyBytes = Decoders.BASE64.decode(base64Secret);
		this.key = Keys.hmacShaKeyFor(keyBytes);
	}

	/**
	 * Creates the token.
	 *
	 * @param authentication the authentication
	 * @param rememberMe     the remember me
	 * @return the string
	 */
	public String createToken(Authentication authentication, boolean rememberMe) {
		String authorities = authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority)
				.collect(Collectors.joining(","));

		long now = (new Date()).getTime();
		Date validity;
		if (rememberMe) {
			validity = new Date(now + this.tokenValidityInMillisecondsForRememberMe);
		} else {
			validity = new Date(now + this.tokenValidityInMilliseconds);
		}

		return Jwts.builder().setSubject(authentication.getName()).claim(AUTHORITIES_KEY, authorities)
				.signWith(SignatureAlgorithm.HS512, key).setExpiration(validity).compact();
	}

	/**
	 * Gets the authentication.
	 *
	 * @param token the token
	 * @return the authentication
	 */
	Authentication getAuthentication(String token) {
		User principal = null;
		Collection<? extends GrantedAuthority> authorities = null;
		try {
			Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
			authorities = Arrays.stream(claims.get(AUTHORITIES_KEY).toString().split(","))
					.map(SimpleGrantedAuthority::new).collect(Collectors.toList());

			principal = new User(claims.getSubject(), "", authorities);
		} catch (Exception e) {
			logger.error("Error During Authetication: {}", e.getMessage());
		}

		return new UsernamePasswordAuthenticationToken(principal, token, authorities);
	}

	/**
	 * Validate token.
	 *
	 * @param authToken the auth token
	 * @return true, if successful
	 */
	boolean validateToken(String authToken) {
		try {
			Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(authToken);
			return true;
		}catch(ExpiredJwtException e) {
			logger.debug("An error occurred while validating the JWT token: {}", e);
			//To Prevent empty SAST empty catch Block
			;
		} catch (MalformedJwtException e) {
			logger.debug("An error occurred while validating the JWT token: {}", e);
			//To Prevent empty SAST empty catch Block
			;
		}catch (UnsupportedJwtException e) {
			logger.debug("An error occurred while validating the JWT token: {}", e);
			//To debug empty SAST empty catch Block
			;
		}catch (SignatureException e) {
			logger.debug("An error occurred while validating the JWT token: {}", e);
			//To Prevent empty SAST empty catch Block
			;
		}catch (IllegalArgumentException e) {
			logger.debug("An error occurred while validating the JWT token: {}", e);
			//To Prevent empty SAST empty catch Block
			;
		}
		return false;
	}

	/**
	 * Gets the expiry time of  authentication token.
	 *
	 * @param authToken the authToken
	 * @return the expirytime
	 */

	 public Date getExpiryTime(String authToken) {
		Claims claims =null;
		try {
			claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(authToken).getBody();
		}catch (Exception ex) {
			logger.error("JWT token getExpiry error: {}", ex.getMessage());
			return new Date(System.currentTimeMillis()+ 86400 * 1000 * 2);
		}
		return claims.getExpiration();

	}
	 
	 /**
	  	 * Gets authorize apies.
		 *
		 * @param AuthorizeApiDTO
		 * @return description with integer value 
		 */
		
		public ResponseDTO authorize(AuthorizeApiDTO authorizeApiDTO) {
			if (authorizeApiDTO.getUser().equals("anonymousUser")) {

				return new ResponseDTO("Fail","access denied,please provide valid user token");
			}
			if (authorizeApiDTO.getToken() != null) {
				userProjectRoleService.deleteExpiredToken();
				if (userProjectRoleService
						.isInvalidToken(authorizeApiDTO.getToken())) {
					
					return new ResponseDTO("Fail","token is already expired, so access denied.");
				}
			}
			if (authorizeApiDTO.getProjectId() == null) {
				return new ResponseDTO("Fail","access denied,please provide project id");
			}
			
			if (authorizeApiDTO.getUser() == null) {
				return new ResponseDTO("Fail","access denied, please provide user");
			}
			
			if(this.configurationApisService.isMapEmpty()) return new ResponseDTO("Success","roles are not mapped with Apis");
			
			List<Integer> roleIdList = new ArrayList<Integer>();
		
			if (authorizeApiDTO.getRoleId() == null && authorizeApiDTO.getRoleName() == null) {
				roleIdList = userProjectRoleService.getMappedRolesForUserLoginAndProject(authorizeApiDTO.getUser(), authorizeApiDTO.getProjectId());
				logger.info("Mapped role for user login and project : {} ",roleIdList);

			}
			else if (authorizeApiDTO.getRoleId() != null) {
				if (userProjectRoleService.isRoleExistsByUserAndProjectIdAndRoleId(authorizeApiDTO.getUser(), authorizeApiDTO.getProjectId(),
						authorizeApiDTO.getRoleId())) {
					roleIdList.add(authorizeApiDTO.getRoleId());
				}
			} else {
				Integer role = userProjectRoleService.getRoleIdByUserAndProjectIdAndRoleName(authorizeApiDTO.getUser(), authorizeApiDTO.getProjectId(), authorizeApiDTO.getRoleName());
				roleIdList.add(role);
			}
			if (roleIdList.isEmpty()) {
				return new ResponseDTO("Fail","roles are not present for project id :"+authorizeApiDTO.getProjectId()+" and user :"+authorizeApiDTO.getUser());
			}
			
			String checkAllRole="Fail";
//			&& authentication.isAuthenticated()
			for (Integer role : roleIdList) {
				if (this.configurationApisService.isContainsRole(role) 
						&& !authorizeApiDTO.getUser().equalsIgnoreCase("anonymousUser")) {
					for (Map.Entry<String, List<String>> apiMap : this.configurationApisService.getRoleMappedApis(role).entrySet()) {
						if (RegularExpressionUtil.matchInputForRegex(authorizeApiDTO.getUrl(),apiMap.getKey())
								&& ((apiMap.getValue().contains(authorizeApiDTO.getMethodType().toUpperCase())) || apiMap.getValue().contains("ALL"))) {
							logger.info("Method values for the upcommingUrl :{} savedUrl :{} ",authorizeApiDTO.getUrl(), apiMap.getKey().toLowerCase());
							return new ResponseDTO("Success","authorization checked for "+ authorizeApiDTO.getUrl());

						}

					}
				}
				else checkAllRole="Success";
			}
//			logger.info("Access {} for {}", checkAllRole=="Success"?"ALLOWED":"BLOCKED",authorizeApiDTO.getUrl());
			logger.info("Access {} for {}", checkAllRole.equals("Success")?"ALLOWED":"BLOCKED",authorizeApiDTO.getUrl());
			return new ResponseDTO(checkAllRole,"authorization checked for "+ authorizeApiDTO.getUrl());
					
		}

}
