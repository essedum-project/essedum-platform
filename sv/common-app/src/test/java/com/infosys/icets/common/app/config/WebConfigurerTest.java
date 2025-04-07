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

import jakarta.servlet.ServletContext;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.context.ApplicationContext;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;

public class WebConfigurerTest {
//	static WebConfigurer configurer;
//
//	@BeforeAll
//	static void setup() {
//		configurer = new WebConfigurer();
//	}
//
//	@Test
//	public void testAddCorsMappings() throws Exception {
//		CorsRegistry registry = new CorsRegistry();
//		configurer.addCorsMappings(registry );
//	}
//
//	@Test
//	public void testAddResourceHandlers() throws Exception {
//		ApplicationContext applicationContext = Mockito.mock(ApplicationContext.class);
//		ServletContext servletContext = Mockito.mock(ServletContext.class);
//		ResourceHandlerRegistry registry = new ResourceHandlerRegistry(applicationContext, servletContext);
//		configurer.addResourceHandlers(registry);
//	}
//
//	@Test
//	public void testAddViewControllers() throws Exception {
//		ApplicationContext applicationContext = Mockito.mock(ApplicationContext.class);
//		ViewControllerRegistry registry = new ViewControllerRegistry(applicationContext);
//		configurer.addViewControllers(registry);
//	}
//	
//	
//
}
