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

package com.lfn.common.app.config;

import jakarta.persistence.EntityManagerFactory;
import javax.sql.DataSource;
import org.springframework.orm.jpa.vendor.*;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.autoconfigure.liquibase.LiquibaseProperties;
import org.springframework.boot.autoconfigure.orm.jpa.JpaProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import com.lfn.ai.comm.lib.util.LiquibaseUtil;

import liquibase.integration.spring.SpringLiquibase;

// 
/**
 * The Class DashboardDbConfig.
 *
 * @author essedum
 */
@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(entityManagerFactoryRef = "entityManagerFactory", basePackages = {
		"com.lfn.iamp.bcc.repository", "com.lfn.iamp.ccl.repository",
		"com.lfn.iamp.cfm.repository", "com.lfn.iamp.icm.repository",
		"com.lfn.iamp.dbs.repository", "com.lfn.iamp.sre.repository",
	    "com.lfn.iamp.usm.repository", "com.lfn.iamp.eda.repository",
		"com.lfn.iamp.bjm.repository", "com.lfn.iamp.tad.repository",
		"com.lfn.iamp.btm.repository", "com.lfn.iamp.grh.repository",
		 "com.lfn.icip.wflw.repository","com.lfn.iamp.svy.repository"})
public class DashboardDbConfig {
	
	@Bean
    @ConfigurationProperties(prefix = "spring.liquibase")
    public LiquibaseProperties masterLiquibaseProperties() {
        return new LiquibaseProperties();
    }
	
	@Bean
    public SpringLiquibase masterLiquibase() {
        return LiquibaseUtil.springLiquibase(dataSource(dataSourceProperties()), masterLiquibaseProperties());
    }

	/**
	 * Data source properties.
	 *
	 * @return the data source properties
	 */
	@Bean
	@Primary
	@ConfigurationProperties("spring.datasource")
	public DataSourceProperties dataSourceProperties() {
		return new DataSourceProperties();
	}

	/**
	 * Data source.
	 *
	 * @param properties the properties
	 * @return the data source
	 */
	@Primary
	@Bean(name = "dataSource")
	@ConfigurationProperties(prefix = "spring.datasource")
	public DataSource dataSource(DataSourceProperties properties) {
		return properties.initializeDataSourceBuilder().build();
	}
	
	/**
	 * Jpa properties.
	 *
	 * @return the jpa properties
	 */
	@Bean(name = "jpaProperties")
	@Primary
	@ConfigurationProperties("spring.jpa")
	public JpaProperties jpaProperties() {
		return new JpaProperties();
	}

	/**
	 * Entity manager factory.
	 *
	 * @param builder the builder
	 * @param dataSource the data source
	 * @param jpaProperties the jpa properties
	 * @return the local container entity manager factory bean
	 */
	@Primary
	@Bean(name = "entityManagerFactory")
	public LocalContainerEntityManagerFactoryBean entityManagerFactory(EntityManagerFactoryBuilder builder,
			@Qualifier("dataSource") DataSource dataSource, @Qualifier("jpaProperties") JpaProperties jpaProperties) {
		return builder.dataSource(dataSource)
				.packages("com.lfn.iamp.bcc.domain", "com.lfn.iamp.ccl.domain",
						"com.lfn.iamp.cfm.domain", "com.lfn.iamp.icm.domain",
						"com.lfn.iamp.dbs.domain", "com.lfn.iamp.sre.domain",
						"com.lfn.iamp.usm.domain", "com.lfn.iamp.eda.domain",
						"com.lfn.iamp.bjm.domain","com.lfn.iamp.tad.domain",
						"com.lfn.iamp.btm.domain", "com.lfn.iamp.grh.domain",
						"com.lfn.icip.wflw.model", "com.lfn.iamp.svy.domain")
				.persistenceUnit("Dashboard").properties(jpaProperties.getProperties()).build();
	}

	/**
	 * Transaction manager.
	 *
	 * @param entityManagerFactory the entity manager factory
	 * @return the platform transaction manager
	 */
	@Primary
	@Bean(name = "transactionManager")
	public PlatformTransactionManager transactionManager(
			@Qualifier("entityManagerFactory") EntityManagerFactory entityManagerFactory) {
		return new JpaTransactionManager(entityManagerFactory);
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public EntityManagerFactoryBuilder entityManagerFactoryBuilder() {
	    return new EntityManagerFactoryBuilder(
	        new HibernateJpaVendorAdapter(), jpaProperties().getProperties(), null);
	}
}
