/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

package com.lfn.common.app.service;

import com.lfn.common.app.exception.GitOperationException;
import com.lfn.common.app.web.rest.dto.*;
import okhttp3.OkHttpClient;
import org.kohsuke.github.*;
import org.kohsuke.github.extras.okhttp3.OkHttpGitHubConnector;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.net.ssl.*;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * Service for GitHub Integration operations (Push to GitHub feature)
 */
@Service
public class GitHubIntegrationService {

    private static final Logger log = LoggerFactory.getLogger(GitHubIntegrationService.class);

    @Autowired
    private GitStorageProvider gitStorageProvider;

    @Value("${github.ssl.verify:true}")
    private boolean verifySsl;

    /**
     * Create GitHub instance with optional SSL verification bypass
     */
    private GitHub createGitHubInstance(String token) throws Exception {
        GitHubBuilder builder = new GitHubBuilder().withOAuthToken(token);

        if (!verifySsl) {
            log.warn("SSL verification is disabled for GitHub API - DO NOT USE IN PRODUCTION");
            OkHttpClient okHttpClient = createInsecureOkHttpClient();
            builder.withConnector(new OkHttpGitHubConnector(okHttpClient));
        }

        return builder.build();
    }

    /**
     * Centralized exception handler that properly handles GitHub API exceptions
     * Re-throws HttpException for proper status code handling in controller
     * Wraps other exceptions in GitOperationException
     *
     * @param e The exception to handle
     * @param operation Description of the operation that failed
     * @param context Additional context (e.g., repo name, branch name)
     * @throws Exception Re-throws HttpException or wraps in GitOperationException
     */
    private void handleGitHubException(Exception e, String operation, String context) throws Exception {
        if (e instanceof IllegalArgumentException) {
            // Validation errors - re-throw as-is
            log.error("Validation error in {}: {}", operation, e.getMessage());
            throw e;
        } else if (e instanceof org.kohsuke.github.HttpException) {
            // GitHub API errors - re-throw to preserve status code
            org.kohsuke.github.HttpException httpEx = (org.kohsuke.github.HttpException) e;
            log.error("GitHub API error in {} ({}): HTTP {} - {}",
                operation, context, httpEx.getResponseCode(), httpEx.getMessage());
            throw httpEx;
        } else {
            // Other exceptions - wrap in GitOperationException
            log.error("Error in {} ({}): {}", operation, context, e.getMessage(), e);
            throw new GitOperationException("Failed to " + operation + ": " + context, e);
        }
    }

    /**
     * Create an insecure OkHttpClient that bypasses SSL verification
     * WARNING: Use only for development/testing
     */
    private OkHttpClient createInsecureOkHttpClient() throws NoSuchAlgorithmException, KeyManagementException {
        // Create a trust manager that accepts all certificates
        TrustManager[] trustAllCerts = new TrustManager[]{
            new X509TrustManager() {
                public X509Certificate[] getAcceptedIssuers() {
                    return new X509Certificate[0];
                }
                public void checkClientTrusted(X509Certificate[] certs, String authType) {}
                public void checkServerTrusted(X509Certificate[] certs, String authType) {}
            }
        };

        // Install the all-trusting trust manager
        SSLContext sslContext = SSLContext.getInstance("TLS");
        sslContext.init(null, trustAllCerts, new SecureRandom());

        return new OkHttpClient.Builder()
            .sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0])
            .hostnameVerifier((hostname, session) -> true)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build();
    }

    /**
     * Fetch user's GitHub repositories
     *
     * @param token GitHub Personal Access Token
     * @return List of repository information
     * @throws Exception if fetch fails
     */
    public List<GitHubRepoInfo> fetchRepositories(String token) throws Exception {
        try {
            log.info("Fetching repositories from GitHub");
            log.debug("Using token starting with: {}...", token != null ? token.substring(0, Math.min(10, token.length())) : "null");

            GitHub github = createGitHubInstance(token);

            log.info("Testing GitHub connection by getting user info");
            GHUser myself = github.getMyself();
            log.info("Successfully authenticated as: {}", myself.getLogin());

            return github.getMyself().listRepositories().toList().stream()
                .map(repo -> {
                    GitHubRepoInfo info = new GitHubRepoInfo();
                    info.setName(repo.getName());
                    info.setFullName(repo.getFullName());
                    info.setCloneUrl(repo.getHttpTransportUrl());
                    info.setHtmlUrl(repo.getHtmlUrl().toString());
                    info.setDescription(repo.getDescription());
                    return info;
                })
                .collect(Collectors.toList());
        } catch (Exception e) {
            handleGitHubException(e, "fetch repositories", "");
            return null; // Never reached, but needed for compilation
        }
    }

    /**
     * Fetch branches for a specific repository
     *
     * @param token GitHub Personal Access Token
     * @param repoName Repository name in format "owner/repo"
     * @return List of branch names
     * @throws Exception if fetch fails
     */
    public List<String> fetchBranches(String token, String repoName) throws Exception {
        try {
            log.info("Fetching branches for repository: {}", repoName);
            GitHub github = createGitHubInstance(token);
            GHRepository repo = github.getRepository(repoName);

            return repo.getBranches().keySet().stream()
                .sorted()
                .collect(Collectors.toList());
        } catch (Exception e) {
            handleGitHubException(e, "fetch branches", repoName);
            return null; // Never reached
        }
    }

    /**
     * Fetch repository collaborators who can be added as reviewers
     *
     * @param token GitHub Personal Access Token
     * @param repoName Repository name in format "owner/repo"
     * @return List of collaborator information (username, name, avatar)
     * @throws Exception if fetch fails
     */
    public List<GitHubCollaboratorInfo> fetchRepositoryCollaborators(String token, String repoName) throws Exception {
        try {
            log.info("Fetching collaborators for repository: {}", repoName);
            GitHub github = createGitHubInstance(token);
            GHRepository repo = github.getRepository(repoName);

            // Get current authenticated user to exclude them from the list
            GHUser currentUser = github.getMyself();
            String currentUsername = currentUser.getLogin();
            log.info("Current user: {}", currentUsername);

            // Fetch collaborators (users with write/admin access)
            List<GitHubCollaboratorInfo> collaborators = repo.getCollaborators().stream()
                .filter(user -> !user.getLogin().equals(currentUsername)) // Exclude current user
                .map(user -> {
                    GitHubCollaboratorInfo info = new GitHubCollaboratorInfo();
                    info.setLogin(user.getLogin());
                    try {
                        info.setName(user.getName() != null ? user.getName() : user.getLogin());
                    } catch (Exception e) {
                        info.setName(user.getLogin());
                    }
                    info.setAvatarUrl(user.getAvatarUrl());
                    try {
                        info.setHtmlUrl(user.getHtmlUrl().toString());
                    } catch (Exception e) {
                        info.setHtmlUrl("");
                    }
                    return info;
                })
                .sorted((a, b) -> a.getLogin().compareToIgnoreCase(b.getLogin()))
                .collect(Collectors.toList());

            log.info("Found {} collaborators for repository {}", collaborators.size(), repoName);
            return collaborators;
        } catch (Exception e) {
            handleGitHubException(e, "fetch collaborators", repoName);
            return null; // Never reached
        }
    }

    /**
     * Push ADK folder or file contents to GitHub repository
     *
     * @param request Push request containing repo, branch, path/files details
     * @param token GitHub Personal Access Token
     * @param username GitHub username
     * @throws Exception if push fails
     */
    public void pushToGitHub(PushRequest request, String token, String username) throws Exception {
        try {
            log.info("Starting push to GitHub - Repo: {}, Branch: {}",
                     request.getRepoName(), request.getBranch());

            GitHub github = createGitHubInstance(token);
            GHRepository repo = github.getRepository(request.getRepoName());
            String remoteUrl = repo.getHttpTransportUrl();

            // Check if files list is provided (new approach) or localPath (old approach)
            if (request.getFiles() != null && !request.getFiles().isEmpty()) {
                log.info("Pushing {} files directly from content", request.getFiles().size());
                gitStorageProvider.pushFileContents(
                    request.getFiles(),
                    remoteUrl,
                    request.getBranch(),
                    request.getCommitMessage(),
                    username,
                    token,
                    verifySsl
                );
            } else if (request.getLocalPath() != null && !request.getLocalPath().isEmpty()) {
                log.info("Pushing from local path: {}", request.getLocalPath());
                gitStorageProvider.push(
                    request.getLocalPath(),
                    remoteUrl,
                    request.getBranch(),
                    request.getCommitMessage(),
                    username,
                    token,
                    verifySsl
                );
            } else {
                throw new IllegalArgumentException("Either 'files' or 'localPath' must be provided in the request");
            }

            log.info("Successfully pushed to GitHub - Repo: {}, Branch: {}",
                     request.getRepoName(), request.getBranch());
        } catch (Exception e) {
            handleGitHubException(e, "push to GitHub", request.getRepoName() + ":" + request.getBranch());
            // Never reached
        }
    }

    /**
     * Verify GitHub token validity
     *
     * @param token GitHub Personal Access Token
     * @return true if token is valid
     */
    public boolean verifyToken(String token) {
        try {
            GitHub github = createGitHubInstance(token);
            github.checkApiUrlValidity();
            github.getMyself(); // This will throw if token is invalid
            return true;
        } catch (Exception e) {
            log.error("Token verification failed: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Pull (clone) code from GitHub repository
     *
     * @param request Pull request containing repo URL, branch, and optional local path
     * @param token GitHub Personal Access Token
     * @param username GitHub username
     * @return PullResponse containing local path, files, and commit information
     * @throws Exception if pull fails
     */
    public PullResponse pullFromGitHub(PullRequest request, String token, String username) throws Exception {
        try {
            log.info("Starting pull from GitHub - Repo: {}, Branch: {}",
                     request.getRepoUrl(), request.getBranch());

            // Validate inputs
            if (request.getRepoUrl() == null || request.getRepoUrl().isEmpty()) {
                throw new IllegalArgumentException("Repository URL is required");
            }
            if (request.getBranch() == null || request.getBranch().isEmpty()) {
                throw new IllegalArgumentException("Branch name is required");
            }

            // Pull from GitHub
            PullResponse response = gitStorageProvider.pull(
                request.getRepoUrl(),
                request.getBranch(),
                request.getLocalPath(),
                username,
                token,
                verifySsl
            );

            log.info("Successfully pulled from GitHub - Repo: {}, Branch: {}, Files: {}",
                     request.getRepoUrl(), request.getBranch(), response.getFiles().size());

            return response;
        } catch (Exception e) {
            handleGitHubException(e, "pull from GitHub", request.getRepoUrl() + ":" + request.getBranch());
            return null; // Never reached
        }
    }

    /**
     * Check if user has push access to a repository
     *
     * @param token GitHub Personal Access Token
     * @param repoName Repository name in format "owner/repo"
     * @return true if user has push access
     * @throws Exception if access check fails
     */
    public boolean hasRepositoryPushAccess(String token, String repoName) throws Exception {
        try {
            log.info("Checking repository push access for: {}", repoName);
            GitHub github = createGitHubInstance(token);
            GHRepository repo = github.getRepository(repoName);

            // Check if user has push permission
            GHPermissionType permission = repo.getPermission(github.getMyself());
            boolean hasPushAccess = permission == GHPermissionType.ADMIN ||
                                   permission == GHPermissionType.WRITE;

            log.info("User has {} permission for repository {}", permission, repoName);
            return hasPushAccess;
        } catch (GHFileNotFoundException e) {
            log.error("Repository not found: {}", repoName);
            throw new IllegalArgumentException("Repository not found: " + repoName);
        } catch (org.kohsuke.github.HttpException e) {
            // Handle GitHub API errors (like 403 permission errors)
            if (e.getResponseCode() == 403) {
                log.error("Access forbidden when checking repository permissions: {}", e.getMessage());
                throw new com.lfn.common.app.exception.UnauthorizedAccessException(
                    "Must have push access to view collaborator permission.");
            }
            log.error("GitHub API error checking repository access: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Error checking repository access: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Push code from source branch to destination branch within the same repository
     *
     * @param request Branch push request containing repo, source and destination branches
     * @param token GitHub Personal Access Token
     * @param username GitHub username
     * @return BranchPushResponse containing operation result details
     * @throws Exception if push operation fails
     */
    public BranchPushResponse pushBranchToBranch(BranchPushRequest request, String token, String username) throws Exception {
        try {
            log.info("Starting branch-to-branch push - Repo: {}, Source: {}, Destination: {}",
                     request.getRepoName(), request.getSourceBranch(), request.getDestinationBranch());

            // Validate inputs
            if (request.getRepoName() == null || request.getRepoName().isEmpty()) {
                throw new IllegalArgumentException("Repository name is required");
            }
            if (request.getSourceBranch() == null || request.getSourceBranch().isEmpty()) {
                throw new IllegalArgumentException("Source branch name is required");
            }
            if (request.getDestinationBranch() == null || request.getDestinationBranch().isEmpty()) {
                throw new IllegalArgumentException("Destination branch name is required");
            }

            GitHub github = createGitHubInstance(token);
            GHRepository repo = github.getRepository(request.getRepoName());

            // Check if user has push access to the repository
            if (!hasRepositoryPushAccess(token, request.getRepoName())) {
                throw new com.lfn.common.app.exception.UnauthorizedAccessException(
                    "User does not have push access to repository: " + request.getRepoName());
            }

            // Check if source branch exists
            GHBranch sourceBranch;
            try {
                sourceBranch = repo.getBranch(request.getSourceBranch());
            } catch (Exception e) {
                throw new IllegalArgumentException("Source branch '" + request.getSourceBranch() + "' does not exist");
            }

            // Get the SHA of the source branch
            String sourceSha = sourceBranch.getSHA1();
            log.info("Source branch SHA: {}", sourceSha);

            boolean branchCreated = false;
            GHBranch destinationBranch = null;

            // Check if destination branch exists
            try {
                destinationBranch = repo.getBranch(request.getDestinationBranch());
                log.info("Destination branch exists with SHA: {}", destinationBranch.getSHA1());
            } catch (Exception e) {
                if (request.isCreateBranchIfNotExists()) {
                    log.info("Destination branch does not exist, creating it from source branch");
                    // Create the destination branch from source branch
                    repo.createRef("refs/heads/" + request.getDestinationBranch(), sourceSha);
                    branchCreated = true;
                    log.info("Created destination branch: {}", request.getDestinationBranch());
                } else {
                    throw new IllegalArgumentException("Destination branch '" + request.getDestinationBranch() +
                                                     "' does not exist. Set 'createBranchIfNotExists' to true to create it.");
                }
            }

            // If branch was just created, we're done
            if (branchCreated) {
                return BranchPushResponse.builder()
                    .success(true)
                    .message("Successfully created destination branch from source branch")
                    .repoName(request.getRepoName())
                    .sourceBranch(request.getSourceBranch())
                    .destinationBranch(request.getDestinationBranch())
                    .commitSha(sourceSha)
                    .filesChanged(0)
                    .branchCreated(true)
                    .build();
            }

            // Update the destination branch reference to point to source branch SHA
            // Use forcePush flag from request to determine whether to force update
            String refPath = "refs/heads/" + request.getDestinationBranch();
            GHRef destinationRef = repo.getRef("heads/" + request.getDestinationBranch());
            destinationRef.updateTo(sourceSha, request.isForcePush());

            log.info("Successfully updated destination branch to source branch SHA (force={})", request.isForcePush());

            return BranchPushResponse.builder()
                .success(true)
                .message("Successfully pushed code from " + request.getSourceBranch() + " to " + request.getDestinationBranch())
                .repoName(request.getRepoName())
                .sourceBranch(request.getSourceBranch())
                .destinationBranch(request.getDestinationBranch())
                .commitSha(sourceSha)
                .filesChanged(0)
                .branchCreated(false)
                .build();

        } catch (Exception e) {
            handleGitHubException(e, "push from branch to branch",
                request.getRepoName() + " (" + request.getSourceBranch() + " -> " + request.getDestinationBranch() + ")");
            return null; // Never reached
        }
    }

    /**
     * Create a pull request to merge code from source branch to target branch
     *
     * @param request Create pull request request containing repo, branches, title, reviewers, etc.
     * @param token GitHub Personal Access Token
     * @param username GitHub username
     * @return CreatePullRequestResponse containing PR details and conflict information
     * @throws Exception if pull request creation fails
     */
    public CreatePullRequestResponse createPullRequest(CreatePullRequestRequest request, String token, String username) throws Exception {
        try {
            log.info("Starting pull request creation - Repo: {}, Source: {}, Target: {}",
                     request.getRepoName(), request.getSourceBranch(), request.getTargetBranch());

            // Validate inputs
            if (request.getRepoName() == null || request.getRepoName().isEmpty()) {
                throw new IllegalArgumentException("Repository name is required");
            }
            if (request.getSourceBranch() == null || request.getSourceBranch().isEmpty()) {
                throw new IllegalArgumentException("Source branch name is required");
            }
            if (request.getTargetBranch() == null || request.getTargetBranch().isEmpty()) {
                throw new IllegalArgumentException("Target branch name is required");
            }
            if (request.getTitle() == null || request.getTitle().isEmpty()) {
                throw new IllegalArgumentException("Pull request title is required");
            }
            if (request.getSourceBranch().equals(request.getTargetBranch())) {
                throw new IllegalArgumentException("Source and target branches cannot be the same");
            }

            GitHub github = createGitHubInstance(token);
            GHRepository repo = github.getRepository(request.getRepoName());

            // Verify both branches exist
            try {
                repo.getBranch(request.getSourceBranch());
            } catch (Exception e) {
                throw new IllegalArgumentException("Source branch '" + request.getSourceBranch() + "' does not exist");
            }

            try {
                repo.getBranch(request.getTargetBranch());
            } catch (Exception e) {
                throw new IllegalArgumentException("Target branch '" + request.getTargetBranch() + "' does not exist");
            }

            // Initialize conflict tracking variables
            boolean hasMergeConflicts = false;
            List<String> conflictingFiles = null;


            // Create the pull request
            GHPullRequest pullRequest = repo.createPullRequest(
                request.getTitle(),
                request.getSourceBranch(),  // head
                request.getTargetBranch(),  // base
                request.getBody() != null ? request.getBody() : "",
                true,  // maintainer can modify
                request.isDraft()
            );

            log.info("Pull request created successfully: #{}", pullRequest.getNumber());

            // Request reviewers if provided
            List<String> reviewersRequested = null;
            if (request.getReviewers() != null && !request.getReviewers().isEmpty()) {
                try {
                    log.info("Requesting reviewers: {}", request.getReviewers());

                    // Request reviewers by username
                    pullRequest.requestReviewers(
                        request.getReviewers().stream()
                            .map(reviewerUsername -> {
                                try {
                                    return github.getUser(reviewerUsername);
                                } catch (Exception e) {
                                    log.warn("Could not find user: {}", reviewerUsername);
                                    return null;
                                }
                            })
                            .filter(user -> user != null)
                            .collect(Collectors.toList())
                    );

                    reviewersRequested = request.getReviewers();
                    log.info("Reviewers requested successfully");
                } catch (Exception e) {
                    log.warn("Could not request reviewers: {}", e.getMessage());
                }
            }

            // Check if PR is mergeable (this may take a moment for GitHub to compute)
            Boolean mergeable = null;
            String mergeableState = null;

            try {
                // Refresh to get latest mergeable status
                pullRequest.refresh();
                mergeable = pullRequest.getMergeable();
                mergeableState = pullRequest.getMergeableState();

                log.info("PR mergeable status: {}, state: {}", mergeable, mergeableState);

                // If mergeable is false, there are conflicts
                if (mergeable != null && !mergeable) {
                    hasMergeConflicts = true;
                    log.warn("Pull request has merge conflicts");
                }
            } catch (Exception e) {
                log.warn("Could not determine mergeable status: {}", e.getMessage());
            }

            return CreatePullRequestResponse.builder()
                .success(true)
                .message("Pull request created successfully")
                .repoName(request.getRepoName())
                .sourceBranch(request.getSourceBranch())
                .targetBranch(request.getTargetBranch())
                .pullRequestNumber(pullRequest.getNumber())
                .pullRequestUrl(pullRequest.getHtmlUrl().toString())
                .hasMergeConflicts(hasMergeConflicts)
                .conflictingFiles(conflictingFiles)
                .mergeable(mergeable)
                .mergeableState(mergeableState)
                .reviewersRequested(reviewersRequested)
                .details(hasMergeConflicts ?
                    "Pull request created but has merge conflicts. Please resolve conflicts before merging." :
                    "Pull request is ready for review")
                .build();

        } catch (Exception e) {
            handleGitHubException(e, "create pull request",
                request.getRepoName() + " (" + request.getSourceBranch() + " -> " + request.getTargetBranch() + ")");
            return null; // Never reached
        }
    }
}

