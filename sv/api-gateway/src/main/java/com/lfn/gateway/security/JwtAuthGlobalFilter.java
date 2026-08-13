package com.lfn.gateway.security;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

/**
 * Global JWT Authentication Filter for Spring Cloud Gateway.
 * Validates JWT Bearer tokens before forwarding to downstream microservices.
 * After successful validation, injects service access-token so downstream
 * services trust this as a gateway-authenticated request.
 */
@Component
public class JwtAuthGlobalFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthGlobalFilter.class);
    private static final String BEARER_PREFIX = "Bearer ";
    private static final String ACCESS_TOKEN_HEADER = "access-token";
    private static final String GATEWAY_AUTH_HEADER = "X-Gateway-Authenticated";

    private final JwtUtil jwtUtil;
    private final GatewayAuthProperties authProperties;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Value("${config.service-auth.access-token:}")
    private String serviceAccessToken;

    public JwtAuthGlobalFilter(JwtUtil jwtUtil, GatewayAuthProperties authProperties) {
        this.jwtUtil = jwtUtil;
        this.authProperties = authProperties;
        log.info("JWT Auth Global Filter initialized");
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        if (!authProperties.isEnabled()) {
            return chain.filter(exchange);
        }

        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // Allow CORS preflight requests
        if (request.getMethod() == HttpMethod.OPTIONS) {
            return chain.filter(exchange);
        }

        // Allow open/public paths
        if (isOpenPath(path)) {
            log.debug("Open path, skipping auth: {}", path);
            return chain.filter(exchange);
        }

        // Support direct service-to-service calls via access-token header
        String accessTokenHeader = request.getHeaders().getFirst(ACCESS_TOKEN_HEADER);
        if (accessTokenHeader != null && serviceAccessToken != null
                && !serviceAccessToken.isEmpty() && serviceAccessToken.equals(accessTokenHeader)) {
            log.debug("Valid service access-token for path: {}", path);
            return chain.filter(exchange);
        }

        // Check for Authorization header
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || authHeader.isBlank()) {
            log.info("Rejected - Missing Authorization header for path: {}", path);
            return onUnauthorized(exchange, "Missing Authorization header");
        }

        if (!authHeader.startsWith(BEARER_PREFIX)) {
            log.info("Rejected - Invalid Authorization format for path: {}", path);
            return onUnauthorized(exchange, "Authorization header must start with Bearer");
        }

        String token = authHeader.substring(BEARER_PREFIX.length());

        // OAuth2 / Keycloak mode: tokens are RS256-signed by the IdP and must be
        // validated by the downstream resource servers (each microservice runs
        // spring-boot-starter-oauth2-resource-server). The gateway only relays
        // the Bearer header and the service access-token for downstream trust.
        if ("oauth2".equalsIgnoreCase(authProperties.getMode())) {
            log.debug("OAuth2 mode - relaying Bearer token without local validation for path: {}", path);
            ServerHttpRequest.Builder relayBuilder = request.mutate()
                    .header(GATEWAY_AUTH_HEADER, "true");
            if (serviceAccessToken != null && !serviceAccessToken.isEmpty()) {
                relayBuilder.header(ACCESS_TOKEN_HEADER, serviceAccessToken);
            }
            return chain.filter(exchange.mutate().request(relayBuilder.build()).build());
        }

        // dbjwt mode: validate HMAC-signed JJWT locally
        if (!jwtUtil.validateToken(token)) {
            log.info("Rejected - Invalid or expired JWT token for path: {}", path);
            return onUnauthorized(exchange, "Invalid or expired JWT token");
        }

        // Token is valid - extract user info
        String subject = jwtUtil.getSubject(token);
        String authorities = jwtUtil.getAuthorities(token);
        log.info("JWT validated for user '{}' with authorities '{}' on path: {}", subject, authorities, path);

        // Mutate request: add gateway trust headers + service access-token
        // so downstream services know this request was authenticated by the gateway
        ServerHttpRequest.Builder mutatedRequestBuilder = request.mutate()
                .header("X-Auth-User", subject)
                .header("X-Auth-Authorities", authorities)
                .header(GATEWAY_AUTH_HEADER, "true");

        // Inject service access-token so downstream treats this as a trusted service call
        if (serviceAccessToken != null && !serviceAccessToken.isEmpty()) {
            mutatedRequestBuilder.header(ACCESS_TOKEN_HEADER, serviceAccessToken);
        }

        ServerHttpRequest mutatedRequest = mutatedRequestBuilder.build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    private Mono<Void> onUnauthorized(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        HttpHeaders headers = response.getHeaders();          // explicit variable — null checker can verify
        headers.setContentType(MediaType.APPLICATION_JSON);
        String body = String.format(
                "{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"%s\",\"path\":\"%s\"}",
                message, exchange.getRequest().getURI().getPath());
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        DataBuffer buffer = response.bufferFactory().wrap(bytes);  // explicit byte[] variable — avoids chained null warning
        return response.writeWith(Mono.just(buffer));
    }

    private boolean isOpenPath(String path) {
        List<String> openPaths = Optional.ofNullable(authProperties.getOpenPaths())
                .orElse(List.of());
        return openPaths.stream().anyMatch(pattern -> pathMatcher.match(pattern.trim(), path));
    }

    @Override
    public int getOrder() {
        return -100;
    }
}
