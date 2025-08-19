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

import org.junit.jupiter.api.BeforeAll;
import static org.mockito.Mockito.mock;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.core.Authentication;

import com.lfn.common.app.security.jwt.CustomJWTTokenProvider;
import com.lfn.iamp.usm.service.UserProjectRoleService;
import com.lfn.iamp.usm.service.configApis.support.ConfigurationApisService;

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
