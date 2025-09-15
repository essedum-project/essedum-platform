package com.lfn.icip.icipwebeditor.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

import com.lfn.icip.icipwebeditor.factory.IICIPOutputArtifactsServiceUtilFactory;
import com.lfn.icip.icipwebeditor.factory.IICIPStopJobServiceUtilFactory;

import org.springframework.beans.factory.FactoryBean;
import org.springframework.beans.factory.config.ServiceLocatorFactoryBean;
import org.springframework.context.annotation.Bean;

@Configuration
@ComponentScan(basePackages = { "com.lfn.icip.icipwebeditor" })
public class ICIPOutputArtifactsFactoryConfig {

	@Bean
	public FactoryBean icipoutputArtifactsServiceLocatorFactoryBean() {
		ServiceLocatorFactoryBean factoryBean = new ServiceLocatorFactoryBean();
		factoryBean.setServiceLocatorInterface(IICIPOutputArtifactsServiceUtilFactory.class);
		return factoryBean;
	}
	
}