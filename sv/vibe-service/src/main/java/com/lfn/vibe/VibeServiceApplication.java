package com.lfn.vibe;

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
 * Vibe Service - AI-Assisted Coding Microservice.
 * Handles Goose AI integration, coding sessions, GitHub push, and code generation.
 *
 * Modules included:
 * - icip-lib-vibe (Goose API relay, session management, GitHub push, SSE streaming)
 * - common-app GitHub OAuth controllers (GitHub authorization flow)
 * - common-app GitHub integration service (repo management, push, pull, PR creation)
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
public class VibeServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(VibeServiceApplication.class, args);
    }
}