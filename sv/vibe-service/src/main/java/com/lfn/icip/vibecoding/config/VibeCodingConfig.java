package com.lfn.icip.vibecoding.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

import io.netty.channel.ChannelOption;
import reactor.netty.http.client.HttpClient;
import io.minio.MinioClient;

import jakarta.annotation.PostConstruct;
import java.net.URI;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import org.springframework.util.StringUtils;

/**
 * Configuration for Vibe Studio Goose service client and Salus Responsible-AI client.
 */
@Configuration
@EnableConfigurationProperties(SalusProperties.class)
public class VibeCodingConfig {

    private static final Logger logger = LoggerFactory.getLogger(VibeCodingConfig.class);

    @Value("${vibe.goose.service.url:http://localhost:30132}")
    private String gooseServiceUrl;

    @Value("${vibe.goose.service.connect-timeout-ms:10000}")
    private int gooseConnectTimeoutMs;

    @Value("${vibe.goose.service.response-timeout-seconds:300}")
    private int gooseResponseTimeoutSeconds;

    @Value("${vibe.goose.service.secret-key:}")
    private String gooseSecretKey;

    private static final String DEFAULT_SECRET_KEY = "";

    // ── MinIO (Goose-generated session files) ────────────────────────────────
    // No hardcoded default here — the URL is environment-specific (differs between
    // local/dev/k8s). It must be supplied via the active application profile YAML
    // (vibe.minio.url) or the MINIO_URL environment variable. See validateMinioConfig().
    @Value("${vibe.minio.url:}")
    private String minioUrl;

    @Value("${vibe.minio.access-key:}")
    private String minioAccessKey;

    @Value("${vibe.minio.secret-key:}")
    private String minioSecretKey;

    @PostConstruct
    void validateMinioConfig() {
                if (minioUrl == null || minioUrl.isBlank()) {
                        logger.warn("Goose MinIO disabled: property 'vibe.minio.url' is empty");
                        return;
                }
                if (!StringUtils.hasText(minioAccessKey) || !StringUtils.hasText(minioSecretKey)) {
                        logger.warn("Goose MinIO disabled: 'vibe.minio.access-key' or 'vibe.minio.secret-key' is empty");
                        return;
        }
        try {
            URI.create(minioUrl);
        } catch (IllegalArgumentException ex) {
            throw new IllegalStateException(
                    "Property 'vibe.minio.url' contains an invalid URL: " + minioUrl, ex);
        }
        logger.info("Goose MinIO URL configured: {}", minioUrl);
    }

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
        // Spring ${VAR:default} only substitutes the default when the env-var is absent,
        // not when it is set to an empty string. Guard here so a blank GOOSE_SECRET_KEY
        // (e.g. from an empty K8s secret) never sends an empty X-Secret-Key header.
        if (gooseSecretKey == null || gooseSecretKey.isBlank()) {
            throw new IllegalStateException(
                    "Property 'vibe.goose.service.secret-key' (env: GOOSE_SECRET_KEY) is not set. "
                            + "Please configure it in the active application profile YAML or as an environment variable.");
        }
        logger.info("Goose service URL configured: {}", gooseServiceUrl);
    }

    /**
     * WebClient configured for the Salus Moderation service.
     */
    @Bean("salusWebClient")
    public WebClient salusWebClient(SalusProperties salus) {
        String baseUrl = salus.getModerationUrl();
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }

        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, salus.getTimeoutSeconds() * 1000)
                .responseTimeout(Duration.ofSeconds(salus.getTimeoutSeconds()));

        logger.info("Salus guard {} — moderation: {}  input-checks: {}  output-checks: {}",
                salus.isEnabled() ? "ENABLED" : "DISABLED",
                baseUrl,
                salus.getInputChecks(),
                salus.getOutputChecks());

        return WebClient.builder()
                .baseUrl(baseUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
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

    /**
     * MinIO client for reading Goose-generated session files. Goose uploads every
     * file it writes to {@code <bucket>/<prefix>/<session_id>/<relative_path>};
     * this client lets vibe-service list and download that folder directly instead
     * of re-exporting each file from the Goose agent.
     * <p>
     * {@code ignoreCertCheck()} matches the platform's existing MinioServer pattern
     * (self-signed corporate certificate).
     */
    @Bean("gooseMinioClient")
    @ConditionalOnExpression(
            "T(org.springframework.util.StringUtils).hasText('${vibe.minio.url:}') and "
                    + "T(org.springframework.util.StringUtils).hasText('${vibe.minio.access-key:}') and "
                    + "T(org.springframework.util.StringUtils).hasText('${vibe.minio.secret-key:}')")
    public MinioClient gooseMinioClient() throws KeyManagementException, NoSuchAlgorithmException {
        MinioClient client = MinioClient.builder()
                .endpoint(minioUrl)
                .credentials(minioAccessKey, minioSecretKey)
                .build();
        client.ignoreCertCheck();
        logger.info("Goose MinIO client configured: {}", minioUrl);
        return client;
    }
}

