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

// import java.util.HashMap;
// import java.util.Map;

// import org.junit.jupiter.api.BeforeAll;
// import org.junit.jupiter.api.Test;
// import org.mockito.Mockito;
// import org.springframework.security.config.annotation.ObjectPostProcessor;
// import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity;

// import com.infosys.icets.common.app.security.jwt.JWTConfigurer;
// import com.infosys.icets.common.app.security.jwt.CustomJWTTokenProvider;

// public class JWTConfigurerTest {

// 	static JWTConfigurer configurer;
// 	private static ObjectPostProcessor<Object> objectPostProcessor = mock(ObjectPostProcessor.class);
	
// 	@BeforeAll
// 	static void setup() {
// 		CustomJWTTokenProvider tokenProvider = Mockito.mock(CustomJWTTokenProvider.class);
// 		configurer = new JWTConfigurer(tokenProvider);
// 	}
	
// 	@Test
// 	public void testConfigure() throws Exception {
// 		Map<Class<?>, Object> sharedObjects = new HashMap();
// 		AuthenticationManagerBuilder authenticationBuilder = new AuthenticationManagerBuilder(objectPostProcessor);
// 		HttpSecurity http = new HttpSecurity(objectPostProcessor, authenticationBuilder, sharedObjects);
// 		configurer.configure(http);
// 	}

// }
