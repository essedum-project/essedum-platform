package com.lfn.data;

import jakarta.servlet.MultipartConfigElement;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.boot.web.servlet.MultipartConfigFactory;
import org.springframework.boot.web.servlet.ServletComponentScan;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.context.annotation.PropertySource;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.util.unit.DataSize;
import org.springframework.web.client.RestTemplate;

import javax.sql.DataSource;

/**
 * Data Service - Files & Data Adapters Microservice.
 * Handles file storage, data source connectivity, dataset management, and search functionality.
 *
 * Modules included:
 * - icip-lib-fsvr (file server: upload, download, Local/MinIO/Azure/S3 backends)
 * - icip-lib-adp (data adapter library: dataset management, readers)
 * - icip-lib-search (search functionality: Lucene-based searchable entities)
 * - icip-adp-* (all data adapter plugins: REST, S3, MySQL, PostgreSQL, Azure, AI Cloud, etc.)
 */
@SpringBootApplication(exclude = {org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration.class, org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration.class})
@RefreshScope
@ServletComponentScan
@ComponentScan(basePackages = {"com.lfn"})
@EnableAspectJAutoProxy(proxyTargetClass = true)
@EnableAsync
@EnableScheduling
@EnableCaching
@EnableConfigurationProperties(com.lfn.common.app.config.GitHubOAuthConfig.class)
@PropertySource(value = "classpath:github.properties", ignoreResourceNotFound = true)
public class DataServiceApplication {

    private static final Logger logger = LoggerFactory.getLogger(DataServiceApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(DataServiceApplication.class, args);
    }

    @Bean
    MultipartConfigElement multipartConfigElement() {
        MultipartConfigFactory factory = new MultipartConfigFactory();
        factory.setMaxFileSize(DataSize.ofBytes(314572800L));
        factory.setMaxRequestSize(DataSize.ofBytes(314572800L));
        return factory.createMultipartConfig();
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    @RefreshScope
    DataSource dataSource(DataSourceProperties properties) {
        DataSource db = DataSourceBuilder
                .create()
                .url(properties.getUrl())
                .username(properties.getUsername())
                .password(properties.getPassword())
                .build();
        logger.info("Data Service - Rebuilding datasource with new configuration");
        return db;
    }
}


