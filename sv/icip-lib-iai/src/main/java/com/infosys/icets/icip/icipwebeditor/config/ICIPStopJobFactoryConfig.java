package com.infosys.icets.icip.icipwebeditor.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;


import com.infosys.icets.icip.icipwebeditor.factory.IICIPStopJobServiceUtilFactory;

import org.springframework.beans.factory.FactoryBean;
import org.springframework.beans.factory.config.ServiceLocatorFactoryBean;
import org.springframework.context.annotation.Bean;

@Configuration
@ComponentScan(basePackages = { "com.infosys.icets.icip.icipwebeditor" })
public class ICIPStopJobFactoryConfig {

	@Bean
	public FactoryBean icipStopJobServiceLocatorFactoryBean() {
		ServiceLocatorFactoryBean factoryBean = new ServiceLocatorFactoryBean();
		factoryBean.setServiceLocatorInterface(IICIPStopJobServiceUtilFactory.class);
		return factoryBean;
	}
	
}