package com.lfn.icip.vibecoding.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

import io.netty.channel.ChannelOption;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

/**
 * Configuration for Vibe Studio Goose service client.
 * <p>
 * Provides a single WebClient bean pre-configured for the Goose API service.
 */
@Configuration
public class VibeCodingConfig {

    @Value("${vibe.goose.service.url:http://goose-service:3000}")
    private String gooseServiceUrl;

    @Value("${vibe.goose.service.connect-timeout-ms:10000}")
    private int gooseConnectTimeoutMs;

    @Value("${vibe.goose.service.response-timeout-seconds:300}")
    private int gooseResponseTimeoutSeconds;

    /**
     * WebClient configured for the Goose API service.
     * <p>
     * Uses a 16 MB in-memory buffer to handle large SSE streams containing
     * generated code or conversation history. The extended response timeout
     * accommodates long-running AI generation sessions.
     */
    @Bean("gooseWebClient")
    public WebClient gooseWebClient() {
        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(configurer -> configurer.defaultCodecs()
                        .maxInMemorySize(16 * 1024 * 1024))
                .build();

        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, gooseConnectTimeoutMs)
                .responseTimeout(Duration.ofSeconds(gooseResponseTimeoutSeconds));

        return WebClient.builder()
                .baseUrl(gooseServiceUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .exchangeStrategies(strategies)
                .build();
    }
}

