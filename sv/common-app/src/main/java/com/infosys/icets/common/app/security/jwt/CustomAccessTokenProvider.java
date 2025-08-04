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
