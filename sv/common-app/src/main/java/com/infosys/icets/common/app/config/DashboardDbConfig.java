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

import com.infosys.icets.ai.comm.lib.util.LiquibaseUtil;

import liquibase.integration.spring.SpringLiquibase;

// 
/**
 * The Class DashboardDbConfig.
 *
 * @author icets
 */
@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(entityManagerFactoryRef = "entityManagerFactory", basePackages = {
		"com.infosys.icets.iamp.bcc.repository", "com.infosys.icets.iamp.ccl.repository",
		"com.infosys.icets.iamp.cfm.repository", "com.infosys.icets.iamp.icm.repository",
		"com.infosys.icets.iamp.dbs.repository", "com.infosys.icets.iamp.sre.repository",
	    "com.infosys.icets.iamp.usm.repository", "com.infosys.icets.iamp.eda.repository",
		"com.infosys.icets.iamp.bjm.repository", "com.infosys.icets.iamp.tad.repository",
		"com.infosys.icets.iamp.btm.repository", "com.infosys.icets.iamp.grh.repository",
		 "com.infosys.icets.icip.wflw.repository","com.infosys.icets.iamp.svy.repository"})
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
				.packages("com.infosys.icets.iamp.bcc.domain", "com.infosys.icets.iamp.ccl.domain",
						"com.infosys.icets.iamp.cfm.domain", "com.infosys.icets.iamp.icm.domain",
						"com.infosys.icets.iamp.dbs.domain", "com.infosys.icets.iamp.sre.domain",
						"com.infosys.icets.iamp.usm.domain", "com.infosys.icets.iamp.eda.domain",
						"com.infosys.icets.iamp.bjm.domain","com.infosys.icets.iamp.tad.domain",
						"com.infosys.icets.iamp.btm.domain", "com.infosys.icets.iamp.grh.domain",
						"com.infosys.icets.icip.wflw.model", "com.infosys.icets.iamp.svy.domain")
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
