package com.lfn.common.app.controller;

import com.lfn.common.app.service.GitHubOAuthService;
import com.lfn.common.app.web.rest.dto.*;
import com.lfn.common.app.service.GitHubIntegrationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
            log.debug("Authorization header contains non-GitHub token (app JWT?), checking OAuth storage instead");
        }

        // Fall back to session-based OAuth token
        // Get authenticated username from JWT
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            try {
                String sessionToken = oauthService.getAccessToken(username);
                log.info("Using GitHub OAuth token for user: {}", username);
                return sessionToken;
            } catch (Exception e) {
                log.debug("No OAuth token found for user: {}", username);
            }
        }

        throw new IllegalArgumentException("No GitHub authentication found. Please login with GitHub OAuth or provide a GitHub PAT token.");
    }

    /**
     * Extract user-friendly error message from GitHub's error JSON response
     *
     * @param rawErrorMessage The raw error message from GitHub (JSON format)
     * @return User-friendly error message
     */
    private String extractGitHubErrorMessage(String rawErrorMessage) {
        try {
            // Try to parse as JSON
            if (rawErrorMessage != null && rawErrorMessage.trim().startsWith("{")) {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                com.fasterxml.jackson.databind.JsonNode rootNode = mapper.readTree(rawErrorMessage);

                // Check if there are specific error messages in the "errors" array
                if (rootNode.has("errors") && rootNode.get("errors").isArray()) {
                    com.fasterxml.jackson.databind.JsonNode errorsArray = rootNode.get("errors");
                    if (errorsArray.size() > 0) {
                        // Extract all error messages from the errors array
                        StringBuilder errorMessages = new StringBuilder();
                        for (com.fasterxml.jackson.databind.JsonNode errorNode : errorsArray) {
                            if (errorNode.has("message")) {
                                if (errorMessages.length() > 0) {
                                    errorMessages.append(" ");
                                }
                                errorMessages.append(errorNode.get("message").asText());
                            }
                        }
                        if (errorMessages.length() > 0) {
                            return errorMessages.toString();
                        }
                    }
                }

                // Fall back to the main "message" field
                if (rootNode.has("message")) {
                    return rootNode.get("message").asText();
                }
            }
        } catch (Exception e) {
            log.debug("Could not parse GitHub error message as JSON: {}", e.getMessage());
        }

        // If parsing fails, return the raw message (cleaned up if it's too long)
        if (rawErrorMessage != null && rawErrorMessage.length() > 200) {
            return rawErrorMessage.substring(0, 197) + "...";
        }
        return rawErrorMessage != null ? rawErrorMessage : "An error occurred";
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
            @RequestParam("repo") String repo,
            HttpSession session) {
        try {
            String cleanToken = getToken(token, session);
            return ResponseEntity.ok(gitHubIntegrationService.fetchBranches(cleanToken, repo));
        } catch (Exception e) {
            log.error("Error fetching branches", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/collaborators")
    public ResponseEntity<List<GitHubCollaboratorInfo>> getCollaborators(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestParam("repo") String repo,
            HttpSession session) {
        try {
            String cleanToken = getToken(token, session);
            return ResponseEntity.ok(gitHubIntegrationService.fetchRepositoryCollaborators(cleanToken, repo));
        } catch (Exception e) {
            log.error("Error fetching collaborators for repo: {}", repo, e);
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

    @PostMapping("/pull")
    public ResponseEntity<PullResponse> pullFromGitHub(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestHeader(value = "X-GitHub-Username", required = false) String username,
            @RequestBody PullRequest request,
            HttpSession session) {
        try {
            String cleanToken = getToken(token, session);

            // Get username from OAuth if not provided
            if (username == null || username.isEmpty()) {
                username = oauthService.getGitHubUsername(cleanToken);
            }

            PullResponse response = gitHubIntegrationService.pullFromGitHub(request, cleanToken, username);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error pulling from GitHub", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/push-branch-to-branch")
    public ResponseEntity<BranchPushResponse> pushBranchToBranch(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestHeader(value = "X-GitHub-Username", required = false) String username,
            @RequestBody BranchPushRequest request,
            HttpSession session) {
        try {
            String cleanToken = getToken(token, session);

            // Get username from OAuth if not provided
            if (username == null || username.isEmpty()) {
                username = oauthService.getGitHubUsername(cleanToken);
            }

            BranchPushResponse response = gitHubIntegrationService.pushBranchToBranch(request, cleanToken, username);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Validation error in branch-to-branch push", e);
            BranchPushResponse errorResponse = BranchPushResponse.builder()
                .success(false)
                .message(e.getMessage())
                .repoName(request.getRepoName())
                .sourceBranch(request.getSourceBranch())
                .destinationBranch(request.getDestinationBranch())
                .build();
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            log.error("Error pushing branch to branch", e);
            BranchPushResponse errorResponse = BranchPushResponse.builder()
                .success(false)
                .message("Failed to push: " + e.getMessage())
                .repoName(request.getRepoName())
                .sourceBranch(request.getSourceBranch())
                .destinationBranch(request.getDestinationBranch())
                .build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/create-pull-request")
    public ResponseEntity<CreatePullRequestResponse> createPullRequest(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestHeader(value = "X-GitHub-Username", required = false) String username,
            @RequestBody CreatePullRequestRequest request,
            HttpSession session) {
        try {
            String cleanToken = getToken(token, session);

            // Get username from OAuth if not provided
            if (username == null || username.isEmpty()) {
                username = oauthService.getGitHubUsername(cleanToken);
            }

            CreatePullRequestResponse response = gitHubIntegrationService.createPullRequest(request, cleanToken, username);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Validation error in pull request creation", e);
            CreatePullRequestResponse errorResponse = CreatePullRequestResponse.builder()
                .success(false)
                .message(e.getMessage())
                .repoName(request.getRepoName())
                .sourceBranch(request.getSourceBranch())
                .targetBranch(request.getTargetBranch())
                .build();
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (org.kohsuke.github.HttpException e) {
            // GitHub API returned an error (e.g., PR already exists, validation failed)
            log.error("GitHub API error creating pull request: HTTP {} - {}", e.getResponseCode(), e.getMessage(), e);

            // Parse GitHub error response to extract user-friendly message
            String rawErrorMessage = e.getMessage();
            int statusCode = e.getResponseCode();
            String userFriendlyMessage = extractGitHubErrorMessage(rawErrorMessage);

            CreatePullRequestResponse errorResponse = CreatePullRequestResponse.builder()
                .success(false)
                .message(userFriendlyMessage)
                .repoName(request.getRepoName())
                .sourceBranch(request.getSourceBranch())
                .targetBranch(request.getTargetBranch())
                .details("GitHub API returned HTTP " + statusCode + ". " +
                        (statusCode == 422 ? "The request was valid but could not be processed." :
                         statusCode == 404 ? "Repository or branch not found." :
                         statusCode == 401 ? "Authentication failed." :
                         statusCode == 403 ? "Access forbidden." : "Request failed."))
                .build();

            // Return appropriate HTTP status based on GitHub's response code
            if (statusCode == 422) {
                return ResponseEntity.unprocessableEntity().body(errorResponse);
            } else if (statusCode >= 400 && statusCode < 500) {
                return ResponseEntity.status(statusCode).body(errorResponse);
            } else {
                return ResponseEntity.internalServerError().body(errorResponse);
            }
        } catch (Exception e) {
            log.error("Error creating pull request", e);
            CreatePullRequestResponse errorResponse = CreatePullRequestResponse.builder()
                .success(false)
                .message("Failed to create pull request: " + e.getMessage())
                .repoName(request.getRepoName())
                .sourceBranch(request.getSourceBranch())
                .targetBranch(request.getTargetBranch())
                .details(e.getMessage())
                .build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}
