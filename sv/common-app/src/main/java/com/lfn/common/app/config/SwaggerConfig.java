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

package com.lfn.common.app.config;

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
 * @author essedum
 */
@Configuration
public class SwaggerConfig {

	/**
	 * Api.
	 *
	 * @return the docket
	 */

	@Bean
	public OpenAPI EssedumOpenAPI() {
		return new OpenAPI().info(new Info().title("Essedum API").description("Essedum application").version("v2.0")
				.license(new License().name("LFN").url("https://lfnetworking.org")));
	}

	@Bean
	public GroupedOpenApi essedumApi() {
		return GroupedOpenApi.builder().group("essedum-apis").packagesToScan("com.lfn").build();
	}

	@Bean
	public GroupedOpenApi btfApi() {
		return GroupedOpenApi.builder().group("bot-factory-apis").packagesToScan("com.lfn.impact").build();
	}
}