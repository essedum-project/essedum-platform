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

import java.io.IOException;
import java.util.Properties;

import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.EnumerablePropertySource;
import org.springframework.core.env.Environment;
import org.springframework.core.env.PropertySource;
import org.springframework.stereotype.Component;

import com.infosys.icets.common.app.util.DecryptPasswordUtil;
 
/**
 * The Class DecryptPropertyConfigurer.
 *
 * @author icets
 */
@Component
public class DecryptPropertyConfigurer extends PropertySourcesPlaceholderConfigurer {

	/** The environment. */
	private ConfigurableEnvironment environment;

	/**
	 * Sets the environment.
	 *
	 * @param environment the new environment
	 */
	@Override
	public void setEnvironment(Environment environment) {
		super.setEnvironment(environment);
		this.environment = (ConfigurableEnvironment) environment;
	}

	/**
	 * Load properties.
	 *
	 * @param props the props
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	@Override
	protected void loadProperties(Properties props) throws IOException {
		this.localOverride = true;
		for (PropertySource<?> propertySource : environment.getPropertySources()) {
			if (propertySource instanceof EnumerablePropertySource) {
				String[] propertyNames = ((EnumerablePropertySource) propertySource).getPropertyNames();
				for (String propertyName : propertyNames) {
					if (propertyName.endsWith("password")) {
						String propertyValue = environment.getProperty(propertyName).toString();
						if (propertyValue.startsWith("enc")) {
							String decryptedValue = DecryptPasswordUtil.decrypt(propertyValue,
									System.getProperty("encryption.key"));
							props.setProperty(propertyName, decryptedValue);
						}
					}
				}
			}
		}
	}
}