package com.lfn.icip.icipwebeditor.config;

import org.springframework.beans.factory.FactoryBean;
import org.springframework.beans.factory.config.ServiceLocatorFactoryBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

import com.lfn.icip.icipwebeditor.event.factory.IAPIEventFactory;

// TODO: Auto-generated Javadoc
/**
 * The Class APIEventFactoryService.
 */
@Configuration
@ComponentScan(basePackages = { "com.lfn"})
public class APIEventFactoryService {

	/**
	 * Api event service locator factory bean.
	 *
	 * @return the factory bean
	 */
	@Bean
	public FactoryBean apiEventServiceLocatorFactoryBean() {
		ServiceLocatorFactoryBean factoryBean = new ServiceLocatorFactoryBean();
		factoryBean.setServiceLocatorInterface(IAPIEventFactory.class);
		return factoryBean;
	}

}
