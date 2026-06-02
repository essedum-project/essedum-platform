package com.lfn.ai.comm.lib.util.config;

import org.springframework.beans.factory.FactoryBean;
import org.springframework.beans.factory.config.ServiceLocatorFactoryBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import com.lfn.ai.comm.lib.util.factory.SecretsManagerFactory;

@Configuration
@ComponentScan(basePackages = { "com.lfn.ai.comm.lib.util" })
public class SecretsManagerFactoryConfig {

	
	@Bean
	public FactoryBean SecretsManagerFactoryBean() {
		ServiceLocatorFactoryBean factoryBean = new ServiceLocatorFactoryBean();
		factoryBean.setServiceLocatorInterface(SecretsManagerFactory.class);
		return factoryBean;
	}
	


}
