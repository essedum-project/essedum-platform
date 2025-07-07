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
package com.infosys.icets.icip.dataset.config;

import org.springframework.beans.factory.FactoryBean;
import org.springframework.beans.factory.config.ServiceLocatorFactoryBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

import com.infosys.icets.icip.dataset.factory.IICIPDataSetServiceUtilFactory;
import com.infosys.icets.icip.dataset.factory.IICIPDataSourcePoolUtilFactory;
import com.infosys.icets.icip.dataset.factory.IICIPDataSourceServiceUtilFactory;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class IICIPDataSetServiceUtilConfig.
 *
 * @author icets
 */
@Configuration
@ComponentScan(basePackages = { "com.infosys.icets.icip.dataset.service.util", "com.infosys.icets.icip.plugins.service.util" })
public class IICIPDataSetServiceUtilConfig {

	/**
	 * Data source service locator factory bean.
	 *
	 * @return the factory bean
	 */
	@Bean
	public FactoryBean dataSourceServiceLocatorFactoryBean() {
		ServiceLocatorFactoryBean factoryBean = new ServiceLocatorFactoryBean();
		factoryBean.setServiceLocatorInterface(IICIPDataSourceServiceUtilFactory.class);
		return factoryBean;
	}

	/**
	 * Data set service locator factory bean.
	 *
	 * @return the factory bean
	 */
	@Bean
	public FactoryBean dataSetServiceLocatorFactoryBean() {
		ServiceLocatorFactoryBean factoryBean = new ServiceLocatorFactoryBean();
		factoryBean.setServiceLocatorInterface(IICIPDataSetServiceUtilFactory.class);
		return factoryBean;
	}

	/**
	 * Data source pool locator factory bean.
	 *
	 * @return the factory bean
	 */
	@Bean
	public FactoryBean dataSourcePoolLocatorFactoryBean() {
		ServiceLocatorFactoryBean factoryBean = new ServiceLocatorFactoryBean();
		factoryBean.setServiceLocatorInterface(IICIPDataSourcePoolUtilFactory.class);
		return factoryBean;
	}
}
