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
import com.lfn.common.app.web.rest.dto.GitHubRepoInfo;
import com.lfn.common.app.web.rest.dto.PullRequest;
import com.lfn.common.app.web.rest.dto.PullResponse;
import com.lfn.common.app.web.rest.dto.PushRequest;
import okhttp3.OkHttpClient;
import org.kohsuke.github.GHRepository;
import org.kohsuke.github.GHUser;
import org.kohsuke.github.GitHub;
import org.kohsuke.github.GitHubBuilder;
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
            log.error("Error fetching repositories: {}", e.getMessage(), e);
            throw new GitOperationException("Failed to fetch repositories", e);
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
            log.error("Error fetching branches for repo {}: {}", repoName, e.getMessage(), e);
            throw new GitOperationException("Failed to fetch branches for repository: " + repoName, e);
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
            log.error("Error pushing to GitHub: {}", e.getMessage(), e);
            throw new GitOperationException("Failed to push to GitHub", e);
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
            log.error("Error pulling from GitHub: {}", e.getMessage(), e);
            throw new GitOperationException("Failed to pull from GitHub", e);
        }
    }
}

