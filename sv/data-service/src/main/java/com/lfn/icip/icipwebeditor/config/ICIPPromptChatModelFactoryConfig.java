package com.lfn.icip.icipwebeditor.config;

import org.springframework.beans.factory.FactoryBean;
import org.springframework.beans.factory.config.ServiceLocatorFactoryBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

import com.lfn.icip.icipwebeditor.factory.ICIPPromptChatModelFactory;

@Configuration
@ComponentScan(basePackages = { "com.lfn.icip.icipwebeditor" })
public class ICIPPromptChatModelFactoryConfig {


		@Bean
		public FactoryBean promptchatModelLocatorFactoryBean() {
			ServiceLocatorFactoryBean factoryBean = new ServiceLocatorFactoryBean();
			factoryBean.setServiceLocatorInterface(ICIPPromptChatModelFactory.class);
			return factoryBean;
		}

}
