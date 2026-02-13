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
    private final String clientId = System.getenv("GITHUB_CLIENT_ID");
    private final String  clientSecret = System.getenv("GITHUB_CLIENT_SECRET");

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
    // Maps session ID -> access token (for OAuth flow)
    private final Map<String, String> sessionTokens = new ConcurrentHashMap<>();
    // Maps state -> session ID (for OAuth callback)
    private final Map<String, String> stateToSession = new ConcurrentHashMap<>();
    // Maps application username -> GitHub access token (persistent user storage)
    private final Map<String, String> userTokens = new ConcurrentHashMap<>();
    // Maps session ID -> application username (for linking OAuth to app user)
    private final Map<String, String> sessionToUser = new ConcurrentHashMap<>();

    /**
     * Generate authorization URL for GitHub OAuth
     */
    public Map<String, String> getAuthorizationUrl(String sessionId, String username) {
        String state = UUID.randomUUID().toString();
        stateToSession.put(state, sessionId);

        // Store the application username for this session
        if (username != null && !username.isEmpty()) {
            sessionToUser.put(sessionId, username);
            log.info("Linking session {} to application user: {}", sessionId, username);
        }
        
        String authUrl = String.format("%s?client_id=%s&redirect_uri=%s&scope=%s&state=%s",
                oauthConfig.getAuthorizationUri(),
                clientId,
                oauthConfig.getRedirectUri(),
                oauthConfig.getScope(),
                state);

        Map<String, String> response = new HashMap<>();
        response.put("authorizationUrl", authUrl);
        response.put("state", state);

        log.info("Generated authorization URL for session: {} (user: {})", sessionId, username);
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
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
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

            // Store token for the application user if linked
            String username = sessionToUser.get(sessionId);
            if (username != null && !username.isEmpty()) {
                userTokens.put(username, accessToken);
                log.info("Stored GitHub token for application user: {}", username);
            } else {
                log.warn("No application username linked to session {}, token not stored per user", sessionId);
            }

            stateToSession.remove(state);

            log.info("Successfully exchanged code for token, session: {}, user: {}", sessionId, username);
            log.info("Token stored - session tokens: {}, user tokens: {}", sessionTokens.size(), userTokens.size());
            return sessionId;
        } catch (Exception e) {
            log.error("Error exchanging code for token: {}", e.getMessage(), e);
            throw new Exception("Failed to obtain access token: " + e.getMessage());
        }
    }

    /**
     * Get stored access token for session or user
     */
    public String getAccessToken(String sessionIdOrUsername) {
        // First try as username (user-based storage)
        String token = userTokens.get(sessionIdOrUsername);
        if (token != null) {
            log.debug("Retrieved token for user {}: {}...", sessionIdOrUsername, token.substring(0, Math.min(10, token.length())));
            return token;
        }

        // Fall back to session-based storage
        token = sessionTokens.get(sessionIdOrUsername);
        if (token != null) {
            log.debug("Retrieved token for session {}: {}...", sessionIdOrUsername, token.substring(0, Math.min(10, token.length())));
            return token;
        }

        throw new IllegalArgumentException("No token found for session/user: " + sessionIdOrUsername + ". Please authenticate first.");
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
     * Revoke token and clear session/user
     */
    public void revokeToken(String sessionIdOrUsername) {
        sessionTokens.remove(sessionIdOrUsername);
        userTokens.remove(sessionIdOrUsername);

        // Also clean up the session-to-user mapping
        String username = sessionToUser.get(sessionIdOrUsername);
        if (username != null) {
            userTokens.remove(username);
            sessionToUser.remove(sessionIdOrUsername);
            log.info("Revoked token for session: {} and user: {}", sessionIdOrUsername, username);
        } else {
            log.info("Revoked token for session/user: {}", sessionIdOrUsername);
        }
    }

    /**
     * Check if session or user has valid token
     */
    public boolean hasValidToken(String sessionIdOrUsername) {
        // Check user token storage first
        boolean hasUserToken = userTokens.containsKey(sessionIdOrUsername);
        // Then check session token storage
        boolean hasSessionToken = sessionTokens.containsKey(sessionIdOrUsername);
        boolean hasToken = hasUserToken || hasSessionToken;

        log.info("Checking token for '{}': userToken={}, sessionToken={}, total users={}, total sessions={}",
                sessionIdOrUsername, hasUserToken, hasSessionToken, userTokens.size(), sessionTokens.size());

        // Debug: Log all available keys
        if (!hasToken && (userTokens.size() > 0 || sessionTokens.size() > 0)) {
            log.warn("'{}' not found. Available users: {}, Available sessions: {}",
                    sessionIdOrUsername, userTokens.keySet(), sessionTokens.keySet());
        }

        return hasToken;
    }
}

