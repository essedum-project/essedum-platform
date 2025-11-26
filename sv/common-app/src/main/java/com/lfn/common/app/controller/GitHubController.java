package com.lfn.common.app.controller;

import com.lfn.common.app.service.GitHubOAuthService;
import com.lfn.common.app.web.rest.dto.GitHubRepoInfo;
import com.lfn.common.app.web.rest.dto.PushRequest;
import com.lfn.common.app.service.GitHubIntegrationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/github")
@CrossOrigin(origins = "*")
public class GitHubController {

    @Autowired
    private GitHubIntegrationService gitHubIntegrationService;

    @Autowired
    private GitHubOAuthService oauthService;

    /**
     * Get token from either Authorization header or session
     */
    private String getToken(@RequestHeader(value = "Authorization", required = false) String authHeader,
                           HttpSession session) {
        // First try Authorization header (for PAT-based auth)
        if (authHeader != null && !authHeader.isEmpty()) {
            String token = authHeader.replace("Bearer ", "").trim();

            // Check if this is a GitHub token (starts with gh*)
            // GitHub tokens: ghp_ (PAT), gho_ (OAuth), ghs_ (server), ghu_ (user)
            if (token.startsWith("gh")) {
                log.info("Using GitHub token from Authorization header");
                return token;
            }

            // If not a GitHub token, ignore it and try session
            log.debug("Authorization header contains non-GitHub token (app JWT?), checking session instead");
        }

        // Fall back to session-based OAuth token
        try {
            String sessionId = session.getId();
            String sessionToken = oauthService.getAccessToken(sessionId);
            log.info("Using GitHub OAuth token from session");
            return sessionToken;
        } catch (Exception e) {
            throw new IllegalArgumentException("No GitHub authentication found. Please login with GitHub OAuth or provide a GitHub PAT token.", e);
        }
    }

    @GetMapping("/repos")
    public ResponseEntity<List<GitHubRepoInfo>> getRepositories(
            @RequestHeader(value = "Authorization", required = false) String token,
            HttpSession session) {
        try {
            String cleanToken = getToken(token, session);
            return ResponseEntity.ok(gitHubIntegrationService.fetchRepositories(cleanToken));
        } catch (Exception e) {
            log.error("Error fetching repositories", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/branches")
    public ResponseEntity<List<String>> getBranches(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestParam String repo,
            HttpSession session) {
        try {
            String cleanToken = getToken(token, session);
            return ResponseEntity.ok(gitHubIntegrationService.fetchBranches(cleanToken, repo));
        } catch (Exception e) {
            log.error("Error fetching branches", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/push")
    public ResponseEntity<String> pushToGitHub(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestHeader(value = "X-GitHub-Username", required = false) String username,
            @RequestBody PushRequest request,
            HttpSession session) {
        try {
            String cleanToken = getToken(token, session);

            // Get username from OAuth if not provided
            if (username == null || username.isEmpty()) {
                username = oauthService.getGitHubUsername(cleanToken);
            }

            gitHubIntegrationService.pushToGitHub(request, cleanToken, username);
            return ResponseEntity.ok("Successfully pushed to GitHub");
        } catch (Exception e) {
            log.error("Error pushing to GitHub", e);
            return ResponseEntity.internalServerError()
                    .body("Failed to push: " + e.getMessage());
        }
    }

    @PostMapping("/verify-token")
    public ResponseEntity<Boolean> verifyToken(
            @RequestHeader(value = "Authorization", required = false) String token,
            HttpSession session) {
        try {
            String cleanToken = getToken(token, session);
            boolean isValid = gitHubIntegrationService.verifyToken(cleanToken);
            return ResponseEntity.ok(isValid);
        } catch (Exception e) {
            log.error("Error verifying token", e);
            return ResponseEntity.ok(false);
        }
    }
}
