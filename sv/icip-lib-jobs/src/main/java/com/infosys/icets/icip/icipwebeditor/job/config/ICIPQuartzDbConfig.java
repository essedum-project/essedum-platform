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