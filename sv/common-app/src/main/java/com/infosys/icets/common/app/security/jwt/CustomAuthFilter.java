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
package com.infosys.icets.common.app.security.jwt;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.GenericFilterBean;

// 
/**
 * Filters incoming requests and installs a Spring Security principal if a header corresponding to a valid user is
 * found.
 */
/**
 * @author icets
 */
@Service
public class CustomAuthFilter extends GenericFilterBean {

	/** The JWT token provider. */
	@Autowired
	private CustomJWTTokenProvider customJWTTokenProvider;
	
	/** The access token provider. */
	@Autowired
	private CustomAccessTokenProvider customAccessTokenProvider;

	/** The Constant AUTHORIZATION_HEADER. */
	public static final String AUTHORIZATION_HEADER = "Authorization";

	/** The Constant ACCESS_TOKEN_HEADER. */
	public static final String ACCESS_TOKEN_HEADER = "access-token";
	
	@Value("${config.service-auth.access-token}")
	private String accessToken;
	
	@Value("${config.service-auth.proxy-user}")
	private String proxyUser;


	/**
	 * Do filter.
	 *
	 * @param servletRequest  the servlet request
	 * @param servletResponse the servlet response
	 * @param filterChain     the filter chain
	 * @throws IOException      Signals that an I/O exception has occurred.
	 * @throws ServletException the servlet exception
	 */
	@Override
	public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain)
			throws IOException, ServletException {
		HttpServletRequest httpServletRequest = (HttpServletRequest) servletRequest;
		String bearerToken = httpServletRequest.getHeader(AUTHORIZATION_HEADER);
		if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
			String jwt = bearerToken.substring(7, bearerToken.length());
			if (StringUtils.hasText(jwt) && this.customJWTTokenProvider.validateToken(jwt)) {
				Authentication authentication = this.customJWTTokenProvider.getAuthentication(jwt);
				SecurityContextHolder.getContext().setAuthentication(authentication);
			}
		} else {
			String accessToken = httpServletRequest.getHeader(ACCESS_TOKEN_HEADER);
			if (StringUtils.hasText(accessToken) && this.customAccessTokenProvider.validateToken(accessToken)) {
				Authentication authentication = this.customAccessTokenProvider.getAuthentication(accessToken);
				SecurityContextHolder.getContext().setAuthentication(authentication);
			}
		}
		filterChain.doFilter(servletRequest, servletResponse);
	}
	
	/**
	 * Resolve token for JWT request
	 *
	 * @param request the request
	 * @return the string
	 */
	public String resolveToken(HttpServletRequest request) {
		String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
		if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
			return bearerToken.substring(7, bearerToken.length());
		}
		return null;
	}
}
