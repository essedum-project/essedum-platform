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
package com.infosys.icets.common.app.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

// 
/**
 * The Class CorsConfig.
 *
 * @author icets
 */
@Configuration
public class CorsConfig {

	@Value("${spring.cors.allowedOriginPatterns}")
	private String allowedOriginPatterns;

	@Value("${spring.cors.allowedHeaders}")
	private String allowedHeader;

	@Value("${spring.cors.allowedMethods}")
	private String allowedMethod;

	/**
	 * Cors filter.
	 *
	 * @return the cors filter
	 */
	@Bean
	public CorsFilter corsFilter() {
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		CorsConfiguration config = new CorsConfiguration();
		config.setAllowCredentials(true);
		config.addAllowedOriginPattern(allowedOriginPatterns);
		config.addAllowedHeader(allowedHeader);
		config.addAllowedMethod(allowedMethod);
		source.registerCorsConfiguration("/api/**", config);
		return new CorsFilter(source);
	}

}