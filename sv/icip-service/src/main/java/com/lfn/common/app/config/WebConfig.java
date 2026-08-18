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
 * IcipServiceApplication.java into this dedicated config class.
 * Magic number 314572800L replaced with DataSize.ofMegabytes(300).
 */
@Configuration
public class WebConfig {

    /** Maximum allowed file upload / request size: 300 MB */
    private static final DataSize MAX_UPLOAD_SIZE = DataSize.ofMegabytes(300);

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    public MultipartConfigElement multipartConfigElement() {
        MultipartConfigFactory factory = new MultipartConfigFactory();
        factory.setMaxFileSize(MAX_UPLOAD_SIZE);
        factory.setMaxRequestSize(MAX_UPLOAD_SIZE);
        return factory.createMultipartConfig();
    }
}