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