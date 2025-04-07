/**
 * @ 2020 - 2021 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.icip.icipwebeditor.fileserver.config;

import org.springframework.beans.factory.FactoryBean;
import org.springframework.beans.factory.config.ServiceLocatorFactoryBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

import com.infosys.icets.icip.icipwebeditor.fileserver.factory.FileServerFactory;

// TODO: Auto-generated Javadoc
/**
 * The Class FileServerFactoryConfig.
 */
@Configuration
@ComponentScan(basePackages = { "com.infosys.icets.icip.icipwebeditor.fileserver" })
public class FileServerFactoryConfig {

	/**
	 * File server service locator factory bean.
	 *
	 * @return the factory bean
	 */
	@Bean
	public FactoryBean fileServerServiceLocatorFactoryBean() {
		ServiceLocatorFactoryBean factoryBean = new ServiceLocatorFactoryBean();
		factoryBean.setServiceLocatorInterface(FileServerFactory.class);
		return factoryBean;
	}

}
