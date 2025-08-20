package com.lfn.icip.icipmodelserver.v2.config;

import org.springframework.beans.factory.FactoryBean;
import org.springframework.beans.factory.config.ServiceLocatorFactoryBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

import com.lfn.icip.icipmodelserver.v2.factory.IICIPModelServiceUtilFactory;

// 
/**
 * The Class IICIPDataSetServiceUtilConfig.
 *
 * @author essedum
 */
@Configuration
@ComponentScan(basePackages = { "com.lfn.icip.icipmodelserver.v2"})
public class IICIPModelServiceUtilConfig {

	/**
	 * Model service locator factory bean.
	 *
	 * @return the factory bean
	 */
	@Bean
	public FactoryBean modelServiceServiceLocatorFactoryBean() {
		ServiceLocatorFactoryBean factoryBean = new ServiceLocatorFactoryBean();
		factoryBean.setServiceLocatorInterface(IICIPModelServiceUtilFactory.class);
		return factoryBean;
	}

}
