package com.lfn.usm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.ServletComponentScan;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.context.annotation.PropertySource;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * USM Service - User & Security Management Microservice.
 * Handles authentication, authorization, user management, roles, permissions, and organizations.
 *
 * Modules included:
 * - iamp-lib-usm (all USM business logic: users, roles, orgs, permissions, delegates, notifications)
 * - common-app security infrastructure (JWT auth, OAuth2, CORS, exception handlers)
 * - comm-lib-secrets / comm-secrets-app (secrets management)
 *
 * Bean configuration moved to dedicated classes (Single Responsibility Principle):
 * - RestTemplate + MultipartConfigElement → com.lfn.common.app.config.WebConfig
 * - DataSource (@RefreshScope)            → com.lfn.common.app.config.DataSourceConfig
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
public class UsmServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(UsmServiceApplication.class, args);
    }
}

