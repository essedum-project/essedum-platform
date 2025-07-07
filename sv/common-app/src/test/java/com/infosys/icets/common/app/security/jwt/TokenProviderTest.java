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

import org.junit.jupiter.api.BeforeAll;
import static org.mockito.Mockito.mock;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.core.Authentication;

import com.infosys.icets.common.app.security.jwt.CustomJWTTokenProvider;
import com.infosys.icets.iamp.usm.service.UserProjectRoleService;
import com.infosys.icets.iamp.usm.service.configApis.support.ConfigurationApisService;

public class TokenProviderTest {
	private static CustomJWTTokenProvider tokenProvider;

private static ConfigurationApisService configurationApisService=mock(ConfigurationApisService.class);
	
	/** The user project role service. */
	private static UserProjectRoleService userProjectRoleService=mock(UserProjectRoleService.class);
	@BeforeAll
	public static void createTokenProvider() throws Exception {
		tokenProvider = new CustomJWTTokenProvider("ZjY0MDRhOTNlZDdlNDM0ODdlOTQ3MWNjODQwYmRhNWIyYTg5YTBjMzJlYmQ2Y2M4OTc5MGFlZjQ5ZjRkNTk0YTMyN2MyOGIzMWRjM2Y5OTgxNGMyZjk1OThiMTM0NGZhMDkzYjk3ODY2NGViZjVkZWI4YWYxN2YzOWY5YzMzMjk=", 1L, 1L,userProjectRoleService,configurationApisService);
	}

	@Test
	public void testAfterPropertiesSet() throws Exception {
		tokenProvider.afterPropertiesSet();
	}

	@Test
	public void testCreateToken() throws Exception {
		boolean rememberMe = true;
		tokenProvider.afterPropertiesSet();
		Authentication authentication = Mockito.mock(Authentication.class);
		tokenProvider.createToken(authentication, rememberMe);
	}

	@Test
	public void testGetAuthentication() throws Exception {
		tokenProvider.afterPropertiesSet();
		tokenProvider.getAuthentication("eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImF1dGgiOiJVU0VSX1JPTEUiLCJleHAiOjE1OTM3NzIzNDd9.fwxpq4851_qdwqMRVeaucD7TBqsnQyWFv9e5lUME1wCA7TgYWlJvCGG27spTs_266MTRJZErPEMysMdV8CiA4Q");
	}

	@Test
	public void testValidateToken() throws Exception {
		tokenProvider.validateToken(
				"eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImF1dGgiOiJVU0VSX1JPTEUiLCJleHAiOjE1OTM3NzIzNDd9.fwxpq4851_qdwqMRVeaucD7TBqsnQyWFv9e5lUME1wCA7TgYWlJvCGG27spTs_266MTRJZErPEMysMdV8CiA4Q");
	}

}
