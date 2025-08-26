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
