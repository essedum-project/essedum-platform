/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 */

package com.lfn.common.app.controller;

import com.lfn.common.app.service.GitHubOAuthService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/github/oauth")
public class GitHubOAuthController {

    @Autowired
    private GitHubOAuthService oauthService;

    /**
     * Extract username from JWT token in SecurityContext
     */
    private String getAuthenticatedUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            log.debug("Extracted username from SecurityContext: {}", username);
            return username;
        }
        log.warn("No authenticated user found in SecurityContext");
        return null;
    }

    /**
     * Initiate OAuth flow - returns authorization URL
     */
    @GetMapping("/authorize")
    public ResponseEntity<Map<String, String>> authorize(HttpSession session) {
        try {
            String sessionId = session.getId();
            String username = getAuthenticatedUsername();

            if (username == null || username.isEmpty()) {
                log.error("Cannot initiate OAuth: No authenticated user");
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Not authenticated");
                errorResponse.put("message", "Please login to the application first");
                return ResponseEntity.status(401).body(errorResponse);
            }

            Map<String, String> response = oauthService.getAuthorizationUrl(sessionId, username);

            log.info("OAuth authorization initiated for session: {}, user: {}", sessionId, username);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error initiating OAuth: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * OAuth callback - handles redirect from GitHub.
     * Returns a small self-closing HTML page instead of raw JSON so the popup
     * window doesn't display the raw response to the user. The opener window
     * detects completion separately by polling /oauth/status.
     */
    @GetMapping(value = "/callback", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> callback(
            @RequestParam("code") String code,
            @RequestParam("state") String state) {
        try {
            String sessionId = oauthService.exchangeCodeForToken(code, state);
            log.info("OAuth callback successful for session: {}", sessionId);
            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_HTML)
                    .body(buildAutoCloseHtml(true, "Authentication successful"));
        } catch (Exception e) {
            log.error("Error in OAuth callback: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .contentType(MediaType.TEXT_HTML)
                    .body(buildAutoCloseHtml(false, e.getMessage()));
        }
    }

    /**
     * Small self-closing HTML page shown briefly in the OAuth popup window.
     */
    private String buildAutoCloseHtml(boolean success, String message) {
        String safeMessage = message == null ? "" : message.replace("<", "&lt;").replace(">", "&gt;");
        String text = success ? "Login successful. You can close this window."
                : "Login failed: " + safeMessage + " You can close this window.";
        return "<!DOCTYPE html><html><head><title>GitHub Login</title></head>"
                + "<body style=\"font-family:sans-serif;text-align:center;padding-top:40px;\">"
                + "<p>" + text + "</p>"
                + "<script>window.close();</script>"
                + "</body></html>";
    }

    /**
     * Check authentication status
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status(HttpSession session) {
        String sessionId = session.getId();
        String username = getAuthenticatedUsername();

        // Check OAuth status based on application username, not session
        boolean authenticated = false;
        if (username != null && !username.isEmpty()) {
            authenticated = oauthService.hasValidToken(username);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("authenticated", authenticated);
        response.put("sessionId", sessionId);
        response.put("username", username);

        if (authenticated && username != null) {
            try {
                String token = oauthService.getAccessToken(username);
                String githubUsername = oauthService.getGitHubUsername(token);
                response.put("githubUsername", githubUsername);
                log.info("OAuth status check: user '{}' is authenticated with GitHub as '{}'", username, githubUsername);
            } catch (Exception e) {
                log.error("Error getting GitHub username for user '{}': {}", username, e.getMessage());
            }
        } else {
            log.info("OAuth status check: user '{}' is NOT authenticated with GitHub", username);
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Logout - revoke token
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpSession session) {
        String sessionId = session.getId();
        String username = getAuthenticatedUsername();

        // Revoke both session and user tokens
        oauthService.revokeToken(sessionId);
        if (username != null && !username.isEmpty()) {
            oauthService.revokeToken(username);
        }

        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Logged out successfully");

        log.info("User '{}' logged out from GitHub, session: {}", username, sessionId);
        return ResponseEntity.ok(response);
    }
}

