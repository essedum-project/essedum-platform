/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 */

package com.lfn.common.app.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lfn.common.app.config.GitHubOAuthConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import javax.net.ssl.*;
import java.security.cert.X509Certificate;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GitHubOAuthService {

    private static final Logger log = LoggerFactory.getLogger(GitHubOAuthService.class);

    @Autowired
    private GitHubOAuthConfig oauthConfig;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GitHubOAuthService() {
        this.restTemplate = createRestTemplate();
    }

    /**
     * Create RestTemplate with SSL verification disabled
     * WARNING: Only for development! Use proper SSL in production
     */
    private RestTemplate createRestTemplate() {
        try {
            // Create trust manager that trusts all certificates
            TrustManager[] trustAllCerts = new TrustManager[]{
                new X509TrustManager() {
                    public X509Certificate[] getAcceptedIssuers() {
                        return null;
                    }
                    public void checkClientTrusted(X509Certificate[] certs, String authType) {
                    }
                    public void checkServerTrusted(X509Certificate[] certs, String authType) {
                    }
                }
            };

            // Install the all-trusting trust manager
            SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(null, trustAllCerts, new java.security.SecureRandom());

            // Create hostname verifier that accepts all hostnames
            HostnameVerifier allHostsValid = (hostname, session) -> true;

            // Set default SSL socket factory and hostname verifier
            HttpsURLConnection.setDefaultSSLSocketFactory(sslContext.getSocketFactory());
            HttpsURLConnection.setDefaultHostnameVerifier(allHostsValid);

            log.warn("SSL verification is disabled for GitHub OAuth - DO NOT USE IN PRODUCTION");

            return new RestTemplate();

        } catch (Exception e) {
            log.error("Failed to create SSL-disabled RestTemplate: {}", e.getMessage());
            return new RestTemplate();
        }
    }

    // In-memory storage for tokens (use Redis or database in production)
    private final Map<String, String> sessionTokens = new ConcurrentHashMap<>();
    private final Map<String, String> stateToSession = new ConcurrentHashMap<>();

    /**
     * Generate authorization URL for GitHub OAuth
     */
    public Map<String, String> getAuthorizationUrl(String sessionId) {
        String state = UUID.randomUUID().toString();
        stateToSession.put(state, sessionId);

        String authUrl = String.format("%s?client_id=%s&redirect_uri=%s&scope=%s&state=%s",
                oauthConfig.getAuthorizationUri(),
                oauthConfig.getClientId(),
                oauthConfig.getRedirectUri(),
                oauthConfig.getScope(),
                state);

        Map<String, String> response = new HashMap<>();
        response.put("authorizationUrl", authUrl);
        response.put("state", state);

        log.info("Generated authorization URL for session: {}", sessionId);
        return response;
    }

    /**
     * Exchange authorization code for access token
     */
    public String exchangeCodeForToken(String code, String state) throws Exception {
        String sessionId = stateToSession.get(state);
        if (sessionId == null) {
            throw new IllegalArgumentException("Invalid state parameter");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.set("Accept", "application/json");

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("client_id", oauthConfig.getClientId());
        params.add("client_secret", oauthConfig.getClientSecret());
        params.add("code", code);
        params.add("redirect_uri", oauthConfig.getRedirectUri());

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    oauthConfig.getTokenUri(),
                    request,
                    String.class
            );

            JsonNode jsonResponse = objectMapper.readTree(response.getBody());
            log.debug("OAuth token response: {}", jsonResponse.toString());

            String accessToken = jsonResponse.get("access_token").asText();
            log.info("Received access token starting with: {}...", accessToken.substring(0, Math.min(10, accessToken.length())));

            // Store token for this session
            sessionTokens.put(sessionId, accessToken);
            stateToSession.remove(state);

            log.info("Successfully exchanged code for token, session: {}", sessionId);
            log.info("Token stored for session: {}, total sessions: {}", sessionId, sessionTokens.size());
            return sessionId;
        } catch (Exception e) {
            log.error("Error exchanging code for token: {}", e.getMessage(), e);
            throw new Exception("Failed to obtain access token: " + e.getMessage());
        }
    }

    /**
     * Get stored access token for session
     */
    public String getAccessToken(String sessionId) {
        String token = sessionTokens.get(sessionId);
        if (token == null) {
            throw new IllegalArgumentException("No token found for session. Please authenticate first.");
        }
        log.debug("Retrieved token for session {}: {}...", sessionId, token.substring(0, Math.min(10, token.length())));
        return token;
    }

    /**
     * Get username from GitHub API using token
     */
    public String getGitHubUsername(String token) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);
        headers.set("Accept", "application/vnd.github.v3+json");

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    "https://api.github.com/user",
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            JsonNode jsonResponse = objectMapper.readTree(response.getBody());
            return jsonResponse.get("login").asText();
        } catch (Exception e) {
            log.error("Error getting GitHub username: {}", e.getMessage(), e);
            throw new Exception("Failed to get GitHub username: " + e.getMessage());
        }
    }

    /**
     * Revoke token and clear session
     */
    public void revokeToken(String sessionId) {
        sessionTokens.remove(sessionId);
        log.info("Revoked token for session: {}", sessionId);
    }

    /**
     * Check if session has valid token
     */
    public boolean hasValidToken(String sessionId) {
        boolean hasToken = sessionTokens.containsKey(sessionId);
        log.info("Checking token for session: {}, has token: {}, total sessions: {}",
                sessionId, hasToken, sessionTokens.size());

        // Debug: Log all session IDs
        if (!hasToken && sessionTokens.size() > 0) {
            log.warn("Session {} not found. Available sessions: {}", sessionId, sessionTokens.keySet());
        }

        return hasToken;
    }
}

