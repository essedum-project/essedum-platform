/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
