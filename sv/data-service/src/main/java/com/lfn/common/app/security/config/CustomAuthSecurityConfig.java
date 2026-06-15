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
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer.FrameOptionsConfig;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer.XXssConfig;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.FilterChainProxy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;

import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.common.app.security.jwt.CustomAuthFilter;

import jakarta.servlet.Filter;
import jakarta.servlet.http.HttpServletRequest;

import static org.springframework.security.config.Customizer.withDefaults;

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

	private final PasswordEncoder passwordEncoder;

	/** The active profile */
	@Value("${spring.profiles.active}")
	private String activeProfile;

	/** The ignore csrf urls. */
	@Value("${csrf.ignore.urls}")
	private String ignoreCsrfUrls;

	private final CustomUserDetailsService userDetailsServiceCommon;

	private final CustomAuthorizationManager customAuthorizationManager;

	private static final String DBJWT = "dbjwt";
	private static final String OAUTH2 = "oauth2";
	private static final String ACTUATOR_PATTERN = "/actuator/**";
	private static final String API_PATTERN = "/api/**";
	private static final String LANGFLOW_AGENT_EXPORT = "/api/aip/langflow/langflow_agent_export";

	/** Shared builder for path-pattern based request matchers. */
	private static final PathPatternRequestMatcher.Builder PATH_MATCHERS = PathPatternRequestMatcher.withDefaults();

	public CustomAuthSecurityConfig(PasswordEncoder passwordEncoder,
			CustomUserDetailsService userDetailsServiceCommon, CustomAuthorizationManager customAuthorizationManager) {
		this.passwordEncoder = passwordEncoder;
		this.userDetailsServiceCommon = userDetailsServiceCommon;
		this.customAuthorizationManager = customAuthorizationManager;
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
	public SecurityFilterChain securityFilterChain(HttpSecurity http)
			throws Exception {
		if (activeProfile.contains(DBJWT))
			http.authorizeHttpRequests(authorizationManagerRequestMatcherRegistry -> authorizationManagerRequestMatcherRegistry
					.requestMatchers(PATH_MATCHERS.matcher(ACTUATOR_PATTERN)).permitAll()
					.requestMatchers(PATH_MATCHERS.matcher("/error/**")).permitAll()
					.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
					.requestMatchers(PATH_MATCHERS.matcher(LANGFLOW_AGENT_EXPORT)).permitAll()
					.requestMatchers(PATH_MATCHERS.matcher("/api/aip/langflow/get_langflow_agent_export")).permitAll()
					.requestMatchers(PATH_MATCHERS.matcher("/api/aip/langflow/langflow_export_file_details")).permitAll()
					.requestMatchers(PATH_MATCHERS.matcher("/api/aip/langflow/get_langflow_agent_file")).permitAll()
					.requestMatchers(PATH_MATCHERS.matcher("/api/aip/file/create/**")).permitAll()
					.requestMatchers(PATH_MATCHERS.matcher("/api/aip/service/v1/streamingServices/update")).permitAll()
					.requestMatchers(PATH_MATCHERS.matcher(API_PATTERN)).access(customAuthorizationManager)
					.requestMatchers(PATH_MATCHERS.matcher("/camunda/**")).access(customAuthorizationManager)
					.anyRequest().authenticated());
		else if (activeProfile.contains(OAUTH2))
			http.authorizeHttpRequests(authorizationManagerRequestMatcherRegistry -> {
				authorizationManagerRequestMatcherRegistry
						.requestMatchers(PATH_MATCHERS.matcher(ACTUATOR_PATTERN)).permitAll()
						.requestMatchers(PATH_MATCHERS.matcher("/error/**")).permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(PATH_MATCHERS.matcher(LANGFLOW_AGENT_EXPORT)).permitAll()
                        .requestMatchers(PATH_MATCHERS.matcher("/api/aip/langflow/get_langflow_agent_export")).permitAll()
                        .requestMatchers(PATH_MATCHERS.matcher("/api/aip/langflow/langflow_export_file_details")).permitAll()
                        .requestMatchers(PATH_MATCHERS.matcher("/api/aip/langflow/get_langflow_agent_file")).permitAll()
						.requestMatchers(PATH_MATCHERS.matcher(API_PATTERN)).access(customAuthorizationManager)
						.requestMatchers(PATH_MATCHERS.matcher("/camunda/**")).access(customAuthorizationManager)
                        .anyRequest().authenticated();
                try {
					http.oauth2ResourceServer(
							oauth2 -> oauth2.jwt(t -> t.jwtAuthenticationConverter(jwtAuthenticationConverter())));
				} catch (Exception e) {
					log.error("Security Error", e);
				}
			});
		else
			throw new EssedumException("The active profile must contain either dbjwt or oauth2");
		
		http.headers(headers -> headers.frameOptions(FrameOptionsConfig::sameOrigin));

		// Enable CSRF protection with cookie-based token repository
		CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
		requestHandler.setCsrfRequestAttributeName(null); // opt into BREACH protection
		http.cors(withDefaults()).csrf(csrf -> {
			csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse());
			csrf.csrfTokenRequestHandler(requestHandler);
			csrf.ignoringRequestMatchers(antMatchers(ignoreCsrfUrls));
			// Ignore CSRF for actuator and WebSocket endpoints
			csrf.ignoringRequestMatchers(
					PATH_MATCHERS.matcher(ACTUATOR_PATTERN),
					PATH_MATCHERS.matcher("/ws/**")
			);
		});
		FilterChainProxy filterChainProxy = new FilterChainProxy(new SecurityFilterChain() {

			@Override
			public boolean matches(HttpServletRequest request) {
				// Exclude the langflow_agent_export, file/create, and streamingServices/update endpoints from authentication filter
				if (request.getRequestURI().contains(LANGFLOW_AGENT_EXPORT) || request.getRequestURI().contains("/api/aip/file/create") || request.getRequestURI().contains("/api/aip/service/v1/streamingServices/update")) {
					return false;
				}
				return PATH_MATCHERS.matcher(API_PATTERN).matches(request);
			}

			@Override
			public List<Filter> getFilters() {
				List<Filter> filters = new ArrayList<>();
				ApplicationContext context = http.getSharedObject(ApplicationContext.class);
				CustomAuthFilter jwtFilter = context.getBean(CustomAuthFilter.class);
				filters.add(jwtFilter);				
				return filters;
			}
		});
		http.addFilterBefore(filterChainProxy, UsernamePasswordAuthenticationFilter.class);
		
		// already handled in nginx
		
		http.headers(headers -> headers.xssProtection(XXssConfig::disable))
		.headers(headers -> headers.cacheControl(cache -> cache.disable()))
		.headers(headers -> headers.frameOptions(frameoption ->frameoption.sameOrigin().disable()));

		return http.build();
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

		final String[] urls = ignoreCsrfUrls.split(",");
		final RequestMatcher[] matchers = new RequestMatcher[urls.length];
		for (int index = 0; index < urls.length; index++) {
			matchers[index] = PATH_MATCHERS.matcher(urls[index]);
		}
		return matchers;
	}
}
