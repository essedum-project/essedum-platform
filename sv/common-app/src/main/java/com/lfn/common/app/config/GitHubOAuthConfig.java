/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 */

package com.lfn.common.app.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "github.oauth")
public class GitHubOAuthConfig {

    private String clientId;
    private String clientSecret;
    private String redirectUri;
    private String authorizationUri = "https://github.com/login/oauth/authorize";
    private String tokenUri = "https://github.com/login/oauth/access_token";
    private String scope = "repo,user";

    // Getters and Setters
    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public String getClientSecret() {
        return clientSecret;
    }

    public void setClientSecret(String clientSecret) {
        this.clientSecret = clientSecret;
    }

    public String getRedirectUri() {
        return redirectUri;
    }

    public void setRedirectUri(String redirectUri) {
        this.redirectUri = redirectUri;
    }

    public String getAuthorizationUri() {
        return authorizationUri;
    }

    public void setAuthorizationUri(String authorizationUri) {
        this.authorizationUri = authorizationUri;
    }

    public String getTokenUri() {
        return tokenUri;
    }

    public void setTokenUri(String tokenUri) {
        this.tokenUri = tokenUri;
    }

    public String getScope() {
        return scope;
    }

    public void setScope(String scope) {
        this.scope = scope;
    }
}

