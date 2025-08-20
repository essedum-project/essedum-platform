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

package com.lfn.icip.icipwebeditor.config;

import jakarta.persistence.EntityManagerFactory;
import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.orm.jpa.JpaProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPDbConfig.
 *
 * @author essedum
 */
@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(entityManagerFactoryRef = "icipEntityManagerFactory", transactionManagerRef = "icipTransactionManager", basePackages = {
		"com.lfn.icip.icipwebeditor.repository", "com.lfn.icip.icipwebeditor.job.repository",
		"com.lfn.icip.dataset.repository", "com.lfn.cn.plugins.repository" ,"com.lfn.icip.icipdgbrainserver.v1.repository","com.lfn.icip.icipwebeditor.v1.repository"})
public class ICIPDbConfig {

	/**
	 * Icip data source.
	 *
	 * @return the data source
	 */
	@Bean(name = "icipDataSource")
	@ConfigurationProperties(prefix = "icip.datasource")
	public DataSource icipDataSource() {
		return DataSourceBuilder.create().build();
	}

	/**
	 * Icip entity manager factory.
	 *
	 * @param builder       the builder
	 * @param dataSource    the data source
	 * @param jpaProperties the jpa properties
	 * @return the local container entity manager factory bean
	 */
	@Bean(name = "icipEntityManagerFactory")
	public LocalContainerEntityManagerFactoryBean icipEntityManagerFactory(EntityManagerFactoryBuilder builder,
			@Qualifier("icipDataSource") DataSource dataSource,
			@Qualifier("jpaProperties") JpaProperties jpaProperties) {
		return builder.dataSource(dataSource)
				.packages("com.lfn.icip.icipwebeditor.model",
						"com.lfn.icip.icipwebeditor.job.model", 
						"com.lfn.icip.dataset.model",
						"com.lfn.cn.plugins.domain",
						"com.lfn.icip.icipdgbrainserver.v1.model",
						"com.lfn.icip.icipwebeditor.v1.domain")
				.persistenceUnit("icip").properties(jpaProperties.getProperties()).build();
	}

	/**
	 * Icip transaction manager.
	 *
	 * @param entityManagerFactory the entity manager factory
	 * @return the platform transaction manager
	 */
	@Bean(name = "icipTransactionManager")
	public PlatformTransactionManager icipTransactionManager(
			@Qualifier("icipEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
		return new JpaTransactionManager(entityManagerFactory);
	}

}