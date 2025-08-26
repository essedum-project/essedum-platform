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
