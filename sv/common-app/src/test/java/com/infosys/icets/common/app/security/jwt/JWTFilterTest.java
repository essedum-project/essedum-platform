// /**
//  * @ 2021 - 2022 Infosys Limited, Bangalore, India. All Rights Reserved.
//  * Version: 1.0
//  * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
//  * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
//  * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
//  * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
//  * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
//  * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
//  */
// package com.infosys.icets.common.app.security.jwt;

// import static org.mockito.Mockito.mock;

// import jakarta.servlet.FilterChain;
// import jakarta.servlet.ServletContext;
// import jakarta.servlet.ServletResponse;
// import jakarta.servlet.http.HttpServletRequest;

// import org.junit.jupiter.api.BeforeAll;
// import org.junit.jupiter.api.Test;
// import org.springframework.core.env.Environment;

// import com.infosys.icets.common.app.security.jwt.CustomAuthFilter;
// import com.infosys.icets.common.app.security.jwt.CustomJWTTokenProvider;

// public class JWTFilterTest {
// 	private static String beanName = "thisClass";

// 	private static Environment environment = mock(Environment.class);

// 	private static ServletContext servletContext = mock(ServletContext.class);

// 	private static CustomJWTTokenProvider tokenProvider = mock(CustomJWTTokenProvider.class);
// 	private static CustomAuthFilter jWTFilter;

// 	@BeforeAll
// 	public static void createJWTFilter() throws Exception {
// 		jWTFilter = new CustomAuthFilter(tokenProvider);
// 		jWTFilter.setBeanName(beanName);
// 		jWTFilter.setEnvironment(environment);
// 		jWTFilter.setServletContext(servletContext);
// 	}

// 	@Test
// 	public void testDoFilter() throws Exception {
// 		HttpServletRequest servletRequest= mock(HttpServletRequest.class);
// 		ServletResponse servletResponse = mock(ServletResponse.class);
// 		FilterChain filterChain = mock(FilterChain.class);
// 		jWTFilter.doFilter(servletRequest, servletResponse, filterChain);
// 	}

// }
