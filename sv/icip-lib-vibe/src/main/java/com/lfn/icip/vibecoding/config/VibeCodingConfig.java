package com.lfn.icip.vibecoding.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

import io.netty.channel.ChannelOption;
import reactor.netty.http.client.HttpClient;

import jakarta.annotation.PostConstruct;
import java.net.URI;
import java.time.Duration;

/**
 * Configuration for Vibe Studio Goose service client.
 * <p>
 * Provides a single WebClient bean pre-configured for the Goose API service.
 */
@Configuration
public class VibeCodingConfig {

    private static final Logger logger = LoggerFactory.getLogger(VibeCodingConfig.class);

    @Value("${vibe.goose.service.url:http://localhost:30132}")
    private String gooseServiceUrl;

    @Value("${vibe.goose.service.connect-timeout-ms:10000}")
    private int gooseConnectTimeoutMs;

    @Value("${vibe.goose.service.response-timeout-seconds:300}")
    private int gooseResponseTimeoutSeconds;

    @Value("${vibe.goose.service.secret-key:sk-1234}")
    private String gooseSecretKey;

    @PostConstruct
    void validateGooseServiceUrl() {
        if (gooseServiceUrl == null || gooseServiceUrl.isBlank()) {
            throw new IllegalStateException(
                    "Property 'vibe.goose.service.url' is not set. "
                    + "Please configure it in the active application profile YAML.");
        }
        try {
            URI.create(gooseServiceUrl);
        } catch (IllegalArgumentException ex) {
            throw new IllegalStateException(
                    "Property 'vibe.goose.service.url' contains an invalid URL: "
                    + gooseServiceUrl, ex);
        }
        logger.info("Goose service URL configured: {}", gooseServiceUrl);
    }

    /**
     * WebClient configured for the Goose API service.
     * <p>
     * Uses a 16 MB in-memory buffer to handle large SSE streams containing
     * generated code or conversation history. The extended response timeout
     * accommodates long-running AI generation sessions.
     */
    @Bean("gooseWebClient")
    public WebClient gooseWebClient() {
        // Strip trailing slash to prevent double-slash when appending paths
        String baseUrl = gooseServiceUrl.endsWith("/")
                ? gooseServiceUrl.substring(0, gooseServiceUrl.length() - 1)
                : gooseServiceUrl;

        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(configurer -> configurer.defaultCodecs()
                        .maxInMemorySize(16 * 1024 * 1024))
                .build();

        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, gooseConnectTimeoutMs)
                .responseTimeout(Duration.ofSeconds(gooseResponseTimeoutSeconds));

        return WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("X-Secret-Key", gooseSecretKey)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .exchangeStrategies(strategies)
                .build();
    }
}

