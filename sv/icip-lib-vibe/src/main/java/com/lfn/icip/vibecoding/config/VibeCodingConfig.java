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
 * Configuration for Vibe Coding external service clients.
 * <p>
 * Provides WebClient beans pre-configured for the ADK Python service
 * and the Sandbox Orchestrator.
 */
@Configuration
public class VibeCodingConfig {

    @Value("${vibe.adk.service.url:http://adk-service:8000}")
    private String adkServiceUrl;

    @Value("${vibe.sandbox.orchestrator.url:http://sandbox-orchestrator:8080}")
    private String sandboxOrchestratorUrl;

    @Value("${vibe.adk.service.connect-timeout-ms:10000}")
    private int adkConnectTimeoutMs;

    @Value("${vibe.adk.service.response-timeout-seconds:300}")
    private int adkResponseTimeoutSeconds;

    @Value("${vibe.sandbox.orchestrator.connect-timeout-ms:10000}")
    private int sandboxConnectTimeoutMs;

    /**
     * WebClient configured for consuming SSE streams from the ADK Python service.
     * Increased buffer size and extended timeouts for large streaming responses.
     */
    @Bean("adkWebClient")
    public WebClient adkWebClient() {
        // 16 MB buffer for large SSE streams
        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(configurer -> configurer.defaultCodecs()
                        .maxInMemorySize(16 * 1024 * 1024))
                .build();

        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, adkConnectTimeoutMs)
                .responseTimeout(Duration.ofSeconds(adkResponseTimeoutSeconds));

        return WebClient.builder()
                .baseUrl(adkServiceUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .exchangeStrategies(strategies)
                .build();
    }

    /**
     * WebClient configured for REST calls to the Sandbox Orchestrator.
     */
    @Bean("sandboxWebClient")
    public WebClient sandboxWebClient() {
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, sandboxConnectTimeoutMs)
                .responseTimeout(Duration.ofSeconds(30));

        return WebClient.builder()
                .baseUrl(sandboxOrchestratorUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }
}

