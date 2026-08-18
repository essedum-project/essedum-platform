package com.lfn.icip;

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
 * ICIP Service - AI/ML Pipeline & Jobs Microservice.
 * Handles job execution, pipeline management, events, model management, and MLOps.
 *
 * Modules included:
 * - icip-lib-iai (AI/ML core, pipeline controllers, services, folder management)
 * - icip-lib-jobs (Quartz job scheduling)
 * - icip-lib-evt (Event management, webhooks, publishers)
 * - icip-lib-mod (Model management, endpoint plugins)
 * - icip-lib-mlops (MLOps REST API for datasets, models, endpoints, pipelines)
 * - icip-lib-adp + adapters (for pipeline execution data connectivity)
 * - icip-lib-fsvr (file operations needed during pipeline execution)
 *
 * Bean configuration moved to dedicated classes (Single Responsibility Principle):
 * - RestTemplate + MultipartConfigElement → com.lfn.common.app.config.WebConfig
 * - DataSource (@RefreshScope)            → com.lfn.common.app.config.DataSourceConfig
 */
@SpringBootApplication(exclude = {org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration.class, org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration.class})
@RefreshScope
@ServletComponentScan
@ComponentScan(basePackages = {
        "com.lfn", "macrobase"
})
@EnableAspectJAutoProxy(proxyTargetClass = true)
@EnableAsync
@EnableScheduling
@EnableCaching
@EnableConfigurationProperties(com.lfn.common.app.config.GitHubOAuthConfig.class)
@PropertySource(value = "classpath:github.properties", ignoreResourceNotFound = true)
public class IcipServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(IcipServiceApplication.class, args);
    }
}