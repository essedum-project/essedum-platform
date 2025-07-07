package com.infosys.icets.common.app.security.config;
///**
// * @ 2021 - 2022 Infosys Limited, Bangalore, India. All Rights Reserved.
// * Version: 1.0
// * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
// * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
// * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
// * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
// * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
// * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
// */
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
