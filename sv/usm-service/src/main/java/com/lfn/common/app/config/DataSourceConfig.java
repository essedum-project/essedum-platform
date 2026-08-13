package com.lfn.common.app.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

/**
 * Manual DataSource configuration with Spring Cloud @RefreshScope support.
 *
 * CHANGE: Moved DataSource bean out of *Application.java into this dedicated
 * config class.
 *
 * Why manual DataSource instead of Spring Boot auto-configuration:
 *  - @RefreshScope rebuilds this bean when /actuator/refresh is called.
 *  - This allows DB credentials (url, username, password) rotated in
 *    Vault / K8s Secrets to take effect WITHOUT a service restart.
 *  - DataSourceAutoConfiguration and HibernateJpaAutoConfiguration are
 *    excluded in @SpringBootApplication so this manual bean is used exclusively.
 */
@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Bean
    @RefreshScope
    public DataSource dataSource(DataSourceProperties properties) {
        DataSource db = DataSourceBuilder
                .create()
                .url(properties.getUrl())
                .username(properties.getUsername())
                .password(properties.getPassword())
                .build();
        log.info("DataSource initialized/refreshed — url: {}", properties.getUrl());
        return db;
    }
}
