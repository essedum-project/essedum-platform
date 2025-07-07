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
