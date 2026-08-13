package com.lfn.common.app.config;

import jakarta.servlet.MultipartConfigElement;

import org.springframework.boot.web.servlet.MultipartConfigFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.unit.DataSize;
import org.springframework.web.client.RestTemplate;

/**
 * Web infrastructure configuration.
 *
 * CHANGE: Moved RestTemplate and MultipartConfigElement beans out of
 * *Application.java (entry-point class) into this dedicated config class.
 *
 * Why:
 *  - *Application.java should only contain main() — Single Responsibility Principle.
 *  - Centralising here makes it easy to add interceptors, timeouts, or SSL config
 *    to RestTemplate in one place without touching the entry-point.
 *  - Magic number 314572800L (300 * 1024 * 1024) replaced with DataSize.ofMegabytes(300)
 *    for readability and easier future changes.
 */
@Configuration
public class WebConfig {

    /** Maximum allowed file upload / request size: 300 MB */
    private static final DataSize MAX_UPLOAD_SIZE = DataSize.ofMegabytes(300);

    /**
     * Shared RestTemplate bean for outbound HTTP calls to other microservices.
     * Inject via constructor injection: public MyService(RestTemplate restTemplate)
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    /**
     * Multipart upload limits applied to the embedded Tomcat connector.
     * Replaces the hardcoded 314572800L magic number with a named constant.
     */
    @Bean
    public MultipartConfigElement multipartConfigElement() {
        MultipartConfigFactory factory = new MultipartConfigFactory();
        factory.setMaxFileSize(MAX_UPLOAD_SIZE);
        factory.setMaxRequestSize(MAX_UPLOAD_SIZE);
        return factory.createMultipartConfig();
    }
}
