/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 */

package com.lfn.common.app.controller;

import com.lfn.common.app.service.GitHubOAuthService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/github/oauth")
@CrossOrigin(origins = "*")
public class GitHubOAuthController {

    @Autowired
    private GitHubOAuthService oauthService;

    /**
     * Initiate OAuth flow - returns authorization URL
     */
    @GetMapping("/authorize")
    public ResponseEntity<Map<String, String>> authorize(HttpSession session) {
        try {
            String sessionId = session.getId();
            Map<String, String> response = oauthService.getAuthorizationUrl(sessionId);

            log.info("OAuth authorization initiated for session: {}", sessionId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error initiating OAuth: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * OAuth callback - handles redirect from GitHub
     */
    @GetMapping("/callback")
    public ResponseEntity<Map<String, String>> callback(
            @RequestParam("code") String code,
            @RequestParam("state") String state) {
        try {
            String sessionId = oauthService.exchangeCodeForToken(code, state);

            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Authentication successful");
            response.put("sessionId", sessionId);

            log.info("OAuth callback successful for session: {}", sessionId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error in OAuth callback: {}", e.getMessage(), e);
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Check authentication status
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status(HttpSession session) {
        String sessionId = session.getId();
        boolean authenticated = oauthService.hasValidToken(sessionId);

        Map<String, Object> response = new HashMap<>();
        response.put("authenticated", authenticated);
        response.put("sessionId", sessionId);

        if (authenticated) {
            try {
                String token = oauthService.getAccessToken(sessionId);
                String username = oauthService.getGitHubUsername(token);
                response.put("username", username);
            } catch (Exception e) {
                log.error("Error getting username: {}", e.getMessage());
            }
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Logout - revoke token
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpSession session) {
        String sessionId = session.getId();
        oauthService.revokeToken(sessionId);

        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Logged out successfully");

        log.info("User logged out, session: {}", sessionId);
        return ResponseEntity.ok(response);
    }
}

