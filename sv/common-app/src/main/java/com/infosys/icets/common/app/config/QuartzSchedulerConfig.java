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
package com.infosys.icets.common.app.config;

import java.util.Properties;

import javax.sql.DataSource;

import org.quartz.spi.TriggerFiredBundle;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.config.AutowireCapableBeanFactory;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.quartz.SchedulerFactoryBean;
import org.springframework.scheduling.quartz.SpringBeanJobFactory;

import lombok.Setter;

// 
/**
 * The Class QuartzSchedulerConfig.
 *
 * @author icets
 */
@Configuration
@Setter
public class QuartzSchedulerConfig {

	/**
	 * Quartz properties.
	 *
	 * @return the properties
	 */
	@Bean(name = "defaultQuartzProperties")
	@ConfigurationProperties("spring.quartz.properties")
	public Properties quartzProperties() {
		return new Properties();
	}

	/**
	 * Quartz data source properties.
	 *
	 * @return the data source properties
	 */
	@Bean(name = "defaultQuartzDatasourceProperties")
	@ConfigurationProperties("quartz.datasource")
	public DataSourceProperties quartzDataSourceProperties() {
		return new DataSourceProperties();
	}

	/**
	 * Quartz data source.
	 *
	 * @param properties the properties
	 * @return the data source
	 */
	@Bean(name = "defaultQuartzDatasource")
	@ConfigurationProperties(prefix = "quartz.datasource")
	public DataSource quartzDataSource(DataSourceProperties properties) {
		return properties.initializeDataSourceBuilder().build();
	}

	/**
	 * Scheduler factory bean.
	 *
	 * @return the scheduler factory bean
	 */
	@Bean(name = "defaultQuartz")
	public SchedulerFactoryBean schedulerFactoryBean(ApplicationContext appContext,
			@Value("${spring.quartz.enabled}") boolean enabled) {
		SchedulerFactoryBean schedulerFactoryBean = new SchedulerFactoryBean();
		AutowiringSpringBeanJobFactory autowiringSpringBeanJobFactory = new AutowiringSpringBeanJobFactory();
		autowiringSpringBeanJobFactory.setApplicationContext(appContext);
		schedulerFactoryBean.setJobFactory(autowiringSpringBeanJobFactory);
		schedulerFactoryBean.setDataSource(quartzDataSource(quartzDataSourceProperties()));
		schedulerFactoryBean.setWaitForJobsToCompleteOnShutdown(true);
		schedulerFactoryBean.setQuartzProperties(quartzProperties());
		schedulerFactoryBean.setAutoStartup(enabled);
		return schedulerFactoryBean;
	}

	/**
	 * A factory for creating AutowiringSpringBeanJob objects.
	 * 
	 * @author icets
	 */
	private class AutowiringSpringBeanJobFactory extends SpringBeanJobFactory implements ApplicationContextAware {

		/** The bean factory. */
		private AutowireCapableBeanFactory beanFactory;

		/**
		 * Sets the application context.
		 *
		 * @param context the new application context
		 */
		public void setApplicationContext(final ApplicationContext context) {
			beanFactory = context.getAutowireCapableBeanFactory();
		}

		/**
		 * Creates a new AutowiringSpringBeanJob object.
		 *
		 * @param bundle the bundle
		 * @return the object
		 * @throws Exception the exception
		 */
		@Override
		public Object createJobInstance(final TriggerFiredBundle bundle) throws Exception {
			final Object job = super.createJobInstance(bundle);
			beanFactory.autowireBean(job);
			return job;
		}
	}
}
