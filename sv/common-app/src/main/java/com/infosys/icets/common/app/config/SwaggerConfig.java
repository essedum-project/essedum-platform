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

import org.springdoc.core.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;

// 
/**
 * The Class SwaggerConfig.
 *
 * @author icets
 */
@Configuration
public class SwaggerConfig {

	/**
	 * Api.
	 *
	 * @return the docket
	 */

	@Bean
	public OpenAPI LeapOpenAPI() {
		return new OpenAPI().info(new Info().title("Leap API").description("Leap application").version("v2.0")
				.license(new License().name("Infosys").url("http://infosys.com")));
	}

	@Bean
	public GroupedOpenApi leapApi() {
		return GroupedOpenApi.builder().group("leap-apis").packagesToScan("com.infosys.icets").build();
	}

	@Bean
	public GroupedOpenApi btfApi() {
		return GroupedOpenApi.builder().group("bot-factory-apis").packagesToScan("com.infosys.impact").build();
	}
}