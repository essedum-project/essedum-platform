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

package com.lfn.common.app.security.config;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.config.annotation.SecurityConfigurerAdapter;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.DefaultSecurityFilterChain;
import org.springframework.security.web.FilterChainProxy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.servlet.util.matcher.MvcRequestMatcher;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.web.servlet.handler.HandlerMappingIntrospector;

import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.common.app.security.jwt.CustomAuthFilter;
import com.lfn.common.app.security.jwt.CustomJWTTokenProvider;

import jakarta.servlet.Filter;
import jakarta.servlet.http.HttpServletRequest;

// 
/**
 * The Class DBJWTSecurityConfig.
 *
 * @author essedum
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
class CustomAuthSecurityConfig {
	private static final Logger log = LoggerFactory.getLogger(CustomAuthSecurityConfig.class);

	private PasswordEncoder passwordEncoder;

	/** The token provider. */
	@Autowired
	private CustomJWTTokenProvider tokenProvider;

	/** The active profile */
	@Value("${spring.profiles.active}")
	private String activeProfile;

	/** The ignore csrf urls. */
	@Value("${csrf.ignore.urls}")
	private String ignoreCsrfUrls;

	@Autowired
	private CustomUserDetailsService userDetailsServiceCommon;

	private final static String DBJWT = "dbjwt";
	private final static String OAUTH2 = "oauth2";

	public CustomAuthSecurityConfig(PasswordEncoder passwordEncoder) {
		super();
		this.passwordEncoder = passwordEncoder;
	}

	@Bean
	MvcRequestMatcher.Builder mvc(HandlerMappingIntrospector introspector) {
		return new MvcRequestMatcher.Builder(introspector);
	}

	/**
	 * Configure global.
	 *
	 * @param auth the auth
	 * @throws Exception the exception
	 */

	@Autowired
	public void initialize(AuthenticationManagerBuilder auth) throws Exception {
		if (activeProfile.contains(DBJWT))
			auth.userDetailsService(this.userDetailsServiceCommon).passwordEncoder(passwordEncoder);
	}

	@Bean
	public AuthorizationManager<RequestAuthorizationContext> customAuthorizationManager() {
		return new CustomAuthorizationManager();
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http, HandlerMappingIntrospector introspector)
			throws Exception {
		if (activeProfile.contains(DBJWT))
			http.authorizeHttpRequests(authorizationManagerRequestMatcherRegistry -> {
				authorizationManagerRequestMatcherRegistry
						.requestMatchers(AntPathRequestMatcher.antMatcher("/api/**")).access(customAuthorizationManager())
						.requestMatchers(AntPathRequestMatcher.antMatcher("/camunda/**")).access(customAuthorizationManager())
						.requestMatchers(AntPathRequestMatcher.antMatcher("/actuator/**")).permitAll()
						.requestMatchers(AntPathRequestMatcher.antMatcher("/error/**")).permitAll();
			});
		else if (activeProfile.contains(OAUTH2))
			http.authorizeHttpRequests(authorizationManagerRequestMatcherRegistry -> {
				authorizationManagerRequestMatcherRegistry
						.requestMatchers(AntPathRequestMatcher.antMatcher("/api/**")).access(customAuthorizationManager())
						.requestMatchers(AntPathRequestMatcher.antMatcher("/camunda/**")).access(customAuthorizationManager())
						.requestMatchers(AntPathRequestMatcher.antMatcher("/actuator/**")).permitAll()
						.requestMatchers(AntPathRequestMatcher.antMatcher("/error/**")).permitAll();
				try {
					http.oauth2ResourceServer(
							oauth2 -> oauth2.jwt(t -> t.jwtAuthenticationConverter(jwtAuthenticationConverter())));
				} catch (Exception e) {
					log.error("Security Error", e);
				}
			});
		else
			throw new EssedumException("The active profile must contain either dbjwt or oauth2");
		
		http.headers((headers) -> headers.frameOptions((frameOptions) -> frameOptions.sameOrigin()));
//		http.csrf(configurer -> {
//			configurer.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse());
//			configurer.ignoringRequestMatchers(antMatchers(ignoreCsrfUrls));
//		});
		http.csrf((csrf) -> csrf.disable());
		FilterChainProxy filterChainProxy = new FilterChainProxy(new SecurityFilterChain() {

			@Override
			public boolean matches(HttpServletRequest request) {
				return AntPathRequestMatcher.antMatcher("/api/**").matches(request);
			}

			@Override
			public List<Filter> getFilters() {
				List<Filter> filters = new ArrayList<Filter>();
				ApplicationContext context = http.getSharedObject(ApplicationContext.class);
				CustomAuthFilter jwtFilter = context.getBean(CustomAuthFilter.class);
				filters.add(jwtFilter);				
				return filters;
			}
		});
		http.addFilterBefore(filterChainProxy, UsernamePasswordAuthenticationFilter.class);
		
		// already handled in nginx
		
		http.headers(headers -> headers.xssProtection(xss -> xss.disable()))
		.headers(headers -> headers.cacheControl(cache -> cache.disable()))
		.headers(headers -> headers.frameOptions(frameoption ->frameoption.sameOrigin().disable()));

		DefaultSecurityFilterChain out = http.build();
		return out;

	}

	/**
	 * Security configurer adapter.
	 *
	 * @return the JWT configurer
	 */

	private JWTConfigurer securityConfigurerAdapter() {
		return new JWTConfigurer(tokenProvider);
	}

	class JWTConfigurer extends SecurityConfigurerAdapter<DefaultSecurityFilterChain, HttpSecurity> {

		/** The Constant AUTHORIZATION_HEADER. */
		public static final String AUTHORIZATION_HEADER = "Authorization";

		/** The token provider. */
		private CustomJWTTokenProvider tokenProvider;

		/**
		 * Instantiates a new JWT configurer.
		 *
		 * @param tokenProvider the token provider
		 */
		public JWTConfigurer(CustomJWTTokenProvider tokenProvider) {
			this.tokenProvider = tokenProvider;
		}

		/**
		 * Configure.
		 *
		 * @param http the http
		 * @throws Exception the exception
		 */
		@Override
		public void configure(HttpSecurity http) throws Exception {
			CustomAuthFilter customFilter = new CustomAuthFilter();
			http.addFilterBefore(customFilter, UsernamePasswordAuthenticationFilter.class);
		}
	}

	@Bean
	public JwtAuthenticationConverter jwtAuthenticationConverter() {
		JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
		grantedAuthoritiesConverter.setAuthoritiesClaimName("authorities");

		JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
		jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
		return jwtAuthenticationConverter;
	}
	
	static RequestMatcher[] antMatchers(final String ignoreCsrfUrls) {

		final RequestMatcher[] matchers = new RequestMatcher[ignoreCsrfUrls.split(",").length];
		for (int index = 0; index < ignoreCsrfUrls.split(",").length; index++) {
			matchers[index] = new AntPathRequestMatcher(ignoreCsrfUrls.split(",")[index]);
		}
		return matchers;
	}
}
