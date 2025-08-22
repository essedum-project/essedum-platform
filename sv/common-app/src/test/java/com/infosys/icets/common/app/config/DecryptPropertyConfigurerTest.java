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
