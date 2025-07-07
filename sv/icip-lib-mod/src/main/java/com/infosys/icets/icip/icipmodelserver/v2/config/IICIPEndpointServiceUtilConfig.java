package com.infosys.icets.icip.icipmodelserver.v2.config;

import org.springframework.beans.factory.FactoryBean;
import org.springframework.beans.factory.config.ServiceLocatorFactoryBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

import com.infosys.icets.icip.icipmodelserver.v2.factory.IICIPEndpointServiceUtilFactory;

// 
/**
 * The Class IICIPDataSetServiceUtilConfig.
 *
 * @author icets
 */
@Configuration
@ComponentScan(basePackages = { "com.infosys.icets.icip.icipmodelserver.v2"})
public class IICIPEndpointServiceUtilConfig {

	/**
	 * Model service locator factory bean.
	 *
	 * @return the factory bean
	 */
	@Bean
	public FactoryBean endpointServiceServiceLocatorFactoryBean() {
		ServiceLocatorFactoryBean factoryBean = new ServiceLocatorFactoryBean();
		factoryBean.setServiceLocatorInterface(IICIPEndpointServiceUtilFactory.class);
		return factoryBean;
	}

}
