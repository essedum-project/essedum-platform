package com.infosys.icets.icip.icipwebeditor.config;

import org.springframework.beans.factory.FactoryBean;
import org.springframework.beans.factory.config.ServiceLocatorFactoryBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

import com.infosys.icets.icip.icipwebeditor.factory.IICIPJobRuntimeServiceUtilFactory;
import com.infosys.icets.icip.icipwebeditor.factory.IICIPJobRuntimeLoggerServiceUtilFactory;

@Configuration
@ComponentScan(basePackages = { "com.infosys.icets.icip.icipwebeditor" })
public class ICIPJobRuntimeLoggerFactoryConfig {

	@Bean
	public FactoryBean icipLoggerServiceLocatorFactoryBean() {
		ServiceLocatorFactoryBean factoryBean = new ServiceLocatorFactoryBean();
		factoryBean.setServiceLocatorInterface(IICIPJobRuntimeLoggerServiceUtilFactory.class);
		return factoryBean;
	}
	
	
	
	
	
}
