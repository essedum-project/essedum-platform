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


package com.infosys.icets.common.app.security.config;

//package com.infosys.icets.iamp.app.security.config;
//
//import static org.junit.jupiter.api.Assertions.assertNotNull;
//import static org.mockito.Mockito.mock;
//
//import java.util.HashMap;
//import java.util.Map;
//
//import org.junit.jupiter.api.BeforeAll;
//import org.junit.jupiter.api.Test;
//import org.springframework.context.ApplicationContext;
//import org.springframework.security.config.annotation.ObjectPostProcessor;
//import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.builders.WebSecurity;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.web.filter.CorsFilter;
//
//import com.infosys.icets.iamp.app.security.jwt.TokenProvider;
//import com.infosys.icets.iamp.usm.service.UserApiPermissionsService;
//import com.infosys.icets.iamp.usm.service.UserProjectRoleService;
//import com.infosys.icets.iamp.usm.service.UsersService;
//import com.azure.spring.autoconfigure.aad.AADAppRoleStatelessAuthenticationFilter;
//
//public class DBJWTSecurityConfigTest {
//	private static ApplicationContext applicationContext = mock(ApplicationContext.class);
//	private static DBJWTSecurityConfig dBJWTSecurityConfig;
//	private static ObjectPostProcessor<Object> objectPostProcessor = mock(ObjectPostProcessor.class);
//	private static PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
//	private static TokenProvider tokenProvider = mock(TokenProvider.class);
//	private static CorsFilter corsFilter = mock(CorsFilter.class);
//	private static UserApiPermissionsService userApiPermissionsService = mock(UserApiPermissionsService.class);
//	private static UserProjectRoleService userProjectRoleService = mock(UserProjectRoleService.class);
//	private static UsersService usersService = mock(UsersService.class);
//
//	@BeforeAll
//	public static void createDBJWTSecurityConfig() throws Exception {
//		dBJWTSecurityConfig = new DBJWTSecurityConfig(passwordEncoder, tokenProvider, corsFilter, "/api/*",
//				usersService, userApiPermissionsService, userProjectRoleService);
//	}
//
//	@Test
//	void testUserDetailsService() throws Exception {
//		assertNotNull(dBJWTSecurityConfig.userDetailsService());
//	}
//
//	@Test
//	public void testConfigureGlobal() throws Exception {
//		AuthenticationManagerBuilder auth = new AuthenticationManagerBuilder(objectPostProcessor);
//		dBJWTSecurityConfig.configureGlobal(auth);
//	}
//
//	@Test
//	public void testApiAccessVoter() throws Exception {
//		assertNotNull(dBJWTSecurityConfig.apiAccessVoter());
//	}
//
//	@Test
//	public void testAccessDecisionManager() throws Exception {
//		assertNotNull(dBJWTSecurityConfig.accessDecisionManager());
//	}
//
//	@Test
//	public void testConfigureHttpSecurity() throws Exception {
//		AuthenticationManagerBuilder auth = new AuthenticationManagerBuilder(objectPostProcessor);
//		Map<Class<?>, Object> sharedObjects = new HashMap();
//		HttpSecurity http = new HttpSecurity(objectPostProcessor, auth, sharedObjects);
//		dBJWTSecurityConfig.configure(http);
//	}
//
//	@Test
//	public void testConfigureWebSecurity() throws Exception {
//		WebSecurity web = new WebSecurity(objectPostProcessor);
//		web.setApplicationContext(applicationContext);
//		dBJWTSecurityConfig.configure(web);
//	}
//
//	@Test
//	public void testRegistration() throws Exception {
//		AADAppRoleStatelessAuthenticationFilter appRoleAuthFilter = mock(AADAppRoleStatelessAuthenticationFilter.class);
//		dBJWTSecurityConfig.registration(appRoleAuthFilter);
//	}
//
//}
