package com.lfn.ai.comm.lib.util.config;

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
import javax.sql.DataSource;
//import com.lfn.icip.icipwebeditor.config.DataSource;

import jakarta.persistence.EntityManagerFactory;

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(entityManagerFactoryRef = "telemetryEntityManagerFactory", transactionManagerRef = "telemetryTransactionManager", basePackages = {
		"com.lfn.ai.comm.lib.util.telemetry.repository"})
public class TelemetryDbConfig {

	/**
	 * Icip data source.
	 *
	 * @return the data source
	 */
	@Bean(name = "telemetryDataSource")
	@ConfigurationProperties(prefix = "telemetry.datasource")
	public DataSource telemetryDataSource() {
		System.out.println(DataSourceBuilder.create().build());
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
	@Bean(name = "telemetryEntityManagerFactory")
	public LocalContainerEntityManagerFactoryBean telemetryEntityManagerFactory(EntityManagerFactoryBuilder builder,
			@Qualifier("telemetryDataSource") DataSource dataSource,
			@Qualifier("jpaProperties") JpaProperties jpaProperties) {
		return builder.dataSource(dataSource)
				.packages("com.lfn.ai.comm.lib.util.telemetry.domain")
				.persistenceUnit("dbs")
				.properties(jpaProperties.getProperties())
				.build();
	}

	/**
	 * Icip transaction manager.
	 *
	 * @param entityManagerFactory the entity manager factory
	 * @return the platform transaction manager
	 */
	@Bean(name = "telemetryTransactionManager")
	public PlatformTransactionManager telemetryTransactionManager(
			@Qualifier("telemetryEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
		return new JpaTransactionManager(entityManagerFactory);
	}
}
