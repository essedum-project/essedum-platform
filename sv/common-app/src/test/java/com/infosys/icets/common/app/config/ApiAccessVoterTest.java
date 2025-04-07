/**
// * @ 2021 - 2022 Infosys Limited, Bangalore, India. All Rights Reserved.
// * Version: 1.0
// * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
// * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
// * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
// * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
// * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
// * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
// */
//package com.infosys.icets.common.app.config;
//
//import static org.junit.jupiter.api.Assertions.assertEquals;
//import static org.junit.jupiter.api.Assertions.assertTrue;
//import static org.mockito.Mockito.mock;
//
//import java.util.ArrayList;
//import java.util.Arrays;
//import java.util.Collection;
//
//import org.junit.jupiter.api.BeforeAll;
//import org.junit.jupiter.api.Test;
//import org.mockito.Mockito;
//import org.springframework.security.access.ConfigAttribute;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.GrantedAuthority;
//import org.springframework.security.web.FilterInvocation;
//import org.springframework.test.util.ReflectionTestUtils;
//
//import com.infosys.icets.common.app.config.ApiAccessVoter;
//import com.infosys.icets.common.app.security.jwt.TokenProvider;
//import com.infosys.icets.iamp.usm.service.ProjectService;
//import com.infosys.icets.iamp.usm.service.UserApiPermissionsService;
//import com.infosys.icets.iamp.usm.service.UserProjectRoleService;
//import com.infosys.icets.iamp.usm.service.UsersService;
//import com.infosys.icets.iamp.usm.service.configApis.support.ConfigurationApisService;
//
//public class ApiAccessVoterTest {
//	private static UserApiPermissionsService userApiPermissionsService = mock(UserApiPermissionsService.class);
//	private static UserProjectRoleService userProjectRoleService = mock(UserProjectRoleService.class);
//	private static UsersService usersService = mock(UsersService.class);
//	private static ApiAccessVoter apiAccessVoter;
//	private static FilterInvocation filterInvocation = mock(FilterInvocation.class);
//	
//	private static ProjectService projectService  = mock(ProjectService.class);
//	private static TokenProvider tokenProvider=mock(TokenProvider.class);
//	private static ConfigurationApisService configurationApisService=mock(ConfigurationApisService.class);
//
//	@BeforeAll
//	public static void createApiAccessVoter() throws Exception {
//		apiAccessVoter = new ApiAccessVoter(userApiPermissionsService, userProjectRoleService,projectService,tokenProvider,configurationApisService);
//		Mockito.when(userProjectRoleService.getMappedRoles("test")).thenReturn(Arrays.asList(new Integer[] {1,2}));
//		Mockito.when(userApiPermissionsService.getRoleforApi("/api/*")).thenReturn(Arrays.asList(new Integer[] {1,2}));
//		ReflectionTestUtils.setField(apiAccessVoter, "activeProfiles", "true");
//	}
//
//	@Test
//	public void testSupportsConfigAttribute() throws Exception {
//		ConfigAttribute attribute = mock(ConfigAttribute.class);
//		assertTrue(apiAccessVoter.supports(attribute));
//	}
//
//	@Test
//	public void testVote() throws Exception {
//		Authentication authentication = new Authentication() {
//			
//			@Override
//			public String getName() {
//				return "test";
//			}
//			
//			@Override
//			public void setAuthenticated(boolean isAuthenticated) throws IllegalArgumentException {
//				
//			}
//			
//			@Override
//			public boolean isAuthenticated() {
//				return true;
//			}
//			
//			@Override
//			public Object getPrincipal() {
//				return null;
//			}
//			
//			@Override
//			public Object getDetails() {
//				return null;
//			}
//			
//			@Override
//			public Object getCredentials() {
//				return null;
//			}
//			
//			@Override
//			public Collection<? extends GrantedAuthority> getAuthorities() {
//				return null;
//			}
//		};
//		Mockito.when(userApiPermissionsService.getRoleforApi("/api/*")).thenReturn(Arrays.asList(new Integer[] {1,2}));
//		Mockito.when(filterInvocation.getRequestUrl()).thenReturn("/api/*");
//		assertEquals(-1,apiAccessVoter.vote(authentication, filterInvocation, new ArrayList()));
//
//		Mockito.when(userApiPermissionsService.getRoleforApi("/negativeapi/*")).thenReturn(Arrays.asList(new Integer[] {3,4}));
//		Mockito.when(filterInvocation.getRequestUrl()).thenReturn("/negativeapi/*");
//		assertEquals(-1, apiAccessVoter.vote(authentication, filterInvocation, new ArrayList()));
//		
//		Mockito.when(userApiPermissionsService.getRoleforApi("/api/*")).thenReturn(Arrays.asList(new Integer[] {}));
//		assertEquals(-1,apiAccessVoter.vote(authentication, filterInvocation, new ArrayList()));
//		
//		
//
//	}
//
//	@Test
//	public void testSupportsClass() throws Exception {
//		apiAccessVoter.supports(this.getClass());
//	}
//
//}
