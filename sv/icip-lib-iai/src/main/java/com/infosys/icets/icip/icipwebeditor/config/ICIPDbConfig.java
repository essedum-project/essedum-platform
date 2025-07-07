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
package com.infosys.icets.icip.icipwebeditor.config;

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
 * @author icets
 */
@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(entityManagerFactoryRef = "icipEntityManagerFactory", transactionManagerRef = "icipTransactionManager", basePackages = {
		"com.infosys.icets.icip.icipwebeditor.repository", "com.infosys.icets.icip.icipwebeditor.job.repository",
		"com.infosys.icets.icip.dataset.repository", "com.infosys.icets.cn.plugins.repository" ,"com.infosys.icets.icip.icipdgbrainserver.v1.repository","com.infosys.icets.icip.icipwebeditor.v1.repository"})
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
				.packages("com.infosys.icets.icip.icipwebeditor.model",
						"com.infosys.icets.icip.icipwebeditor.job.model", 
						"com.infosys.icets.icip.dataset.model",
						"com.infosys.icets.cn.plugins.domain",
						"com.infosys.icets.icip.icipdgbrainserver.v1.model",
						"com.infosys.icets.icip.icipwebeditor.v1.domain")
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