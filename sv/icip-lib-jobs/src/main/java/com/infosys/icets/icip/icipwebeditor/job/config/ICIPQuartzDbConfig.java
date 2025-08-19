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

package com.infosys.icets.icip.icipwebeditor.job.config;

import jakarta.persistence.EntityManagerFactory;
import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.liquibase.LiquibaseProperties;
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

import com.infosys.icets.ai.comm.lib.util.LiquibaseUtil;

import liquibase.integration.spring.SpringLiquibase;


// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPDbConfig.
 *
 * @author icets
 */
@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(entityManagerFactoryRef = "icipQuartzEntityManagerFactory", transactionManagerRef = "icipQuartzTransactionManager", basePackages = {
		"com.infosys.icets.icip.icipwebeditor.job.quartz.repository" })
public class ICIPQuartzDbConfig {

	/**
	 * Quartz liquibase properties.
	 *
	 * @return the liquibase properties
	 */
	@Bean
    @ConfigurationProperties(prefix = "quartz.liquibase")
    public LiquibaseProperties quartzLiquibaseProperties() {
        return new LiquibaseProperties();
    }
	
	/**
	 * Quartz liquibase.
	 *
	 * @return the spring liquibase
	 */
	@Bean
    public SpringLiquibase quartzLiquibase() {
        return LiquibaseUtil.springLiquibase(icipQuartzDataSource(), quartzLiquibaseProperties());
    }

	/**
	 * Icip data source.
	 *
	 * @return the data source
	 */
	@Bean(name = "icipQuartzDataSource")
	@ConfigurationProperties(prefix = "quartz.datasource")
	public DataSource icipQuartzDataSource() {
		return DataSourceBuilder.create().build();
	}

	/**
	 * Jpa properties.
	 *
	 * @return the jpa properties
	 */
	@Bean(name = "quartzjpaProperties")
	@ConfigurationProperties("quartz.jpa")
	public JpaProperties jpaProperties() {
		return new JpaProperties();
	}

	/**
	 * Icip entity manager factory.
	 *
	 * @param builder       the builder
	 * @param dataSource    the data source
	 * @param jpaProperties the jpa properties
	 * @return the local container entity manager factory bean
	 */
	@Bean(name = "icipQuartzEntityManagerFactory")
	public LocalContainerEntityManagerFactoryBean icipQuartzEntityManagerFactory(EntityManagerFactoryBuilder builder,
			@Qualifier("icipQuartzDataSource") DataSource dataSource,
			@Qualifier("quartzjpaProperties") JpaProperties jpaProperties) {
		return builder.dataSource(dataSource).packages("com.infosys.icets.icip.icipwebeditor.job.quartz.model")
				.persistenceUnit("quartz").properties(jpaProperties.getProperties()).build();
	}

	/**
	 * Icip transaction manager.
	 *
	 * @param entityManagerFactory the entity manager factory
	 * @return the platform transaction manager
	 */
	@Bean(name = "icipQuartzTransactionManager")
	public PlatformTransactionManager icipQuartzTransactionManager(
			@Qualifier("icipQuartzEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
		return new JpaTransactionManager(entityManagerFactory);
	}

}