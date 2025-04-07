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

import java.util.ArrayList;
import java.util.Collection;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import com.infosys.icets.iamp.usm.service.UsmAccessTokensService;
// 
/**
 * The Class TokenProvider.
 *
 * @author icets
 */
@Component
public class CustomAccessTokenProvider {
	/** The log. */
	private final Logger logger = LoggerFactory.getLogger(CustomAccessTokenProvider.class);
	
	@Value("${config.service-auth.access-token}") 
	String accessToken;
	
	@Value("${config.service-auth.proxy-user}") 
	String proxyUser;
	
	@Autowired
	private UsmAccessTokensService usmAccessTokensService;

	public boolean validateToken(String accessToken) {
		if (this.accessToken.equals(accessToken))
			return true;
		else
			return this.isValidPersonalAccessToken(accessToken);
	}

	public Authentication getAuthentication(String accessToken) {
		Collection<? extends GrantedAuthority> authorities = new ArrayList<GrantedAuthority>();
		return new UsernamePasswordAuthenticationToken(proxyUser, accessToken, authorities);
	}
	
	private boolean isValidPersonalAccessToken(String principal) {
		return usmAccessTokensService.isPersonalAccessTokenValid(principal);
	}
	
	
}
