package com.infosys.icets.icip.icipwebeditor.v1.config;

import org.springframework.beans.factory.FactoryBean;
import org.springframework.beans.factory.config.ServiceLocatorFactoryBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

import com.infosys.icets.icip.icipwebeditor.v1.factory.IICIPSearchableFactory;

@Configuration
@ComponentScan(basePackages = { "com.infosys.icets.icip" })
public class ICIPSearchableConfig {
	@Bean
	public FactoryBean icipSearchableFactoryBean() {
		ServiceLocatorFactoryBean factoryBean = new ServiceLocatorFactoryBean();
		factoryBean.setServiceLocatorInterface(IICIPSearchableFactory.class);
		return factoryBean;
	}
	
}
