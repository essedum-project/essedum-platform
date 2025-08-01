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

package com.infosys.icets.common.app.security.rest;

import static org.mockito.Mockito.mock;

import java.util.Base64;
import java.util.Optional;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.ObjectPostProcessor;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infosys.icets.common.app.security.jwt.CustomJWTTokenProvider;
import com.infosys.icets.common.app.security.rest.DbJwtAuthController;
import com.infosys.icets.common.app.security.rest.dto.LoginDto;
import com.infosys.icets.iamp.usm.domain.UserProjectRoleSummary;
import com.infosys.icets.iamp.usm.service.UserProjectRoleService;

public class DbJwtAuthControllerTest {
	private static DbJwtAuthController dbJwtAuthController;
	private static ObjectPostProcessor<Object> objectPostProcessor = mock(ObjectPostProcessor.class);
	private static AuthenticationManagerBuilder auth = new AuthenticationManagerBuilder(objectPostProcessor);
	private static UserProjectRoleService userProjectRoleService = Mockito.mock(UserProjectRoleService.class);
	// private static TokenProvider tokenProvider = mock(TokenProvider.class);
	/** ObjectMapper */
	static ObjectMapper Obj = new ObjectMapper();

	@BeforeAll
	public static void createDbJwtAuthController() throws Exception {
		dbJwtAuthController = new DbJwtAuthController();
		dbJwtAuthController.setAuthenticationManagerBuilder(auth);
		dbJwtAuthController.setAutoUserCreation("false");
		// dbJwtAuthController.setTokenProvider(tokenProvider);
		dbJwtAuthController.setUserProjectRoleService(userProjectRoleService);
		UserProjectRoleSummary role = new UserProjectRoleSummary();
		Mockito.when(userProjectRoleService.getUserProjectRoleSummary(Mockito.anyString()))
				.thenReturn(Optional.of(role));

		Authentication authentication = mock(Authentication.class);
		SecurityContext securityContext = mock(SecurityContext.class);
		Mockito.when(securityContext.getAuthentication()).thenReturn(authentication);
		SecurityContextHolder.setContext(securityContext);
		ReflectionTestUtils.setField(dbJwtAuthController, "encKeydefault", "leapAppInfosys12");

	}

	@Test
	public void testAuthorize() throws Exception {
		LoginDto loginDto = new LoginDto();
		loginDto.setUsername("test");
		loginDto.setPassword("password");
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(loginDto).getBytes());
		dbJwtAuthController.authorize(str);

	}

	// @Test
	public void testGetUserInfo() throws Exception {
		dbJwtAuthController.getUserInfo();

		Mockito.when(userProjectRoleService.getUserProjectRoleSummary(Mockito.anyString()))
				.thenReturn(Optional.empty());
		dbJwtAuthController.getUserInfo();

		dbJwtAuthController.setAutoUserCreation("true");
		dbJwtAuthController.getUserInfo();
	}

}
