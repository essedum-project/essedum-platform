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

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.io.IOException;
import java.util.Properties;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.EnumerablePropertySource;
import org.springframework.core.env.MutablePropertySources;

import com.infosys.icets.common.app.config.DecryptPropertyConfigurer;

/**
* @author icets
*/
class DecryptPropertyConfigurerTest {
	static DecryptPropertyConfigurer configurer;
	static ConfigurableEnvironment env;
	
	@BeforeAll
	static void setup() {
		configurer = new DecryptPropertyConfigurer();
		env = Mockito.mock(ConfigurableEnvironment.class);
		configurer.setEnvironment(env);
		MutablePropertySources propSource = new MutablePropertySources();
		EnumerablePropertySource<Properties> propertySource = new EnumerablePropertySource<Properties>("test") {

			@Override
			public String[] getPropertyNames() {
				return new String[]{"password"};
			}

			@Override
			public String getProperty(String name) {
				return "enchLvH61gsc25I2fetv9ylVHv0HA4=";
			}			
		};
		
		propSource.addFirst(propertySource);		
		Mockito.when(env.getPropertySources()).thenReturn(propSource);       		
	}
	
//	@Test
//	void test() throws IOException {
//		System.setProperty("encryption.key","leap$123##");
//		System.setProperty("encryption.salt","NB9+lv0guQXYrZYbTmcS20Vd5FxW1h75b8CaI8r+nnPvYrIIHfYu05JVQf9qtJNCS0Vznh692VhUW9HeCPd2IA==");
//		Properties props = new Properties();
//		configurer.loadProperties(props);
//		assertEquals("root",props.getProperty("password"));
//	}

}
