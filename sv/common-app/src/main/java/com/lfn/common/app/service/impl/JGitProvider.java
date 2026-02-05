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

package com.lfn.common.app.service.impl;

import com.lfn.common.app.service.GitStorageProvider;
import com.lfn.common.app.web.rest.dto.FileContent;
import com.lfn.common.app.web.rest.dto.PullResponse;
import com.lfn.common.app.web.rest.dto.PushResponse;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.lib.Ref;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.transport.RefSpec;
import org.eclipse.jgit.transport.RemoteConfig;
import org.eclipse.jgit.transport.URIish;
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider;
import org.eclipse.jgit.treewalk.TreeWalk;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.net.ssl.*;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.charset.StandardCharsets;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.List;

/**
 * JGit implementation for Git operations
 */
@Component
public class JGitProvider implements GitStorageProvider {

    private static final Logger log = LoggerFactory.getLogger(JGitProvider.class);

    @Override
    public void push(String localPath, String remoteUrl, String branch,
                     String commitMessage, String username, String token, boolean verifySsl) throws Exception {
        File repoDir = new File(localPath);

        if (!repoDir.exists()) {
            throw new IllegalArgumentException("Local path does not exist: " + localPath);
        }

        log.info("Starting push operation for path: {}, branch: {}", localPath, branch);

        // Build authenticated URL
        String authenticatedUrl = buildAuthenticatedUrl(remoteUrl, token);

        // Configure SSL bypass if needed
        if (!verifySsl) {
            log.warn("SSL verification is disabled for Git operations - DO NOT USE IN PRODUCTION");
            configureInsecureSSL();
        }

        // Remove existing .git folder to ensure fresh commit
        File gitDir = new File(repoDir, ".git");
        if (gitDir.exists()) {
            log.info("Removing existing .git folder for fresh commit");
            deleteDirectory(gitDir);
        }

        try (Git git = Git.init().setDirectory(repoDir).call()) {
            // Configure credentials for GitHub token authentication
            // GitHub accepts: username + token as password (recommended)
            UsernamePasswordCredentialsProvider credentials;
            if (username != null && !username.isEmpty()) {
                credentials = new UsernamePasswordCredentialsProvider(username, token);
                log.debug("Configured credentials using username: {} with token as password", username);
            } else {
                credentials = new UsernamePasswordCredentialsProvider("x-access-token", token);
                log.debug("Configured credentials using x-access-token with token as password");
            }

            // Check if remote 'origin' exists
            List<RemoteConfig> remoteConfigs = git.remoteList().call();
            boolean originExists = remoteConfigs.stream()
                .anyMatch(remote -> remote.getName().equals("origin"));

            if (!originExists) {
                // Add remote if it doesn't exist with authenticated URL
                git.remoteAdd()
                   .setName("origin")
                   .setUri(new URIish(authenticatedUrl))
                   .call();
                log.info("Added remote origin with authentication");
            } else {
                // Update remote URL if it exists
                git.remoteSetUrl()
                   .setRemoteName("origin")
                   .setRemoteUri(new URIish(authenticatedUrl))
                   .call();
                log.info("Updated remote origin with authentication");
            }

            // Create orphan branch (fresh start)
            git.checkout()
               .setOrphan(true)
               .setName(branch)
               .call();
            log.info("Created orphan branch: {}", branch);

            // Add all files
            git.add()
               .addFilepattern(".")
               .call();
            log.info("Added all files to staging");

            // Check status to see what's staged
            org.eclipse.jgit.api.Status status = git.status().call();
            log.info("Status - Added: {}, Changed: {}, Modified: {}, Untracked: {}",
                    status.getAdded().size(), status.getChanged().size(),
                    status.getModified().size(), status.getUntracked().size());

            // Commit all files
            org.eclipse.jgit.revwalk.RevCommit commit = git.commit()
               .setMessage(commitMessage)
               .setAuthor(username, username + "@github.com")
               .setAll(true)
               .call();
            log.info("Created commit with message: {}, SHA: {}", commitMessage, commit.getName());

            // Verify commit has files
            try (org.eclipse.jgit.treewalk.TreeWalk treeWalk = new org.eclipse.jgit.treewalk.TreeWalk(git.getRepository())) {
                treeWalk.addTree(commit.getTree());
                treeWalk.setRecursive(true);
                int fileCount = 0;
                while (treeWalk.next()) {
                    fileCount++;
                    if (fileCount <= 5) { // Log first 5 files
                        log.info("File in commit: {}", treeWalk.getPathString());
                    }
                }
                log.info("Total files in commit: {}", fileCount);

                if (fileCount == 0) {
                    throw new RuntimeException("Commit is empty - no files to push!");
                }
            }

            // Push to remote with force
            log.info("Attempting to push to remote: origin, branch: {}, refSpec: refs/heads/{}:refs/heads/{}",
                     branch, branch, branch);

            Iterable<org.eclipse.jgit.transport.PushResult> pushResults = git.push()
               .setRemote("origin")
               .setRefSpecs(new RefSpec("refs/heads/" + branch + ":refs/heads/" + branch))
               .setCredentialsProvider(credentials)
               .setForce(true) // Force push since we're overwriting
               .call();

            // Log push results
            for (org.eclipse.jgit.transport.PushResult pushResult : pushResults) {
                log.info("Push result for remote: {}", pushResult.getURI());
                for (org.eclipse.jgit.transport.RemoteRefUpdate update : pushResult.getRemoteUpdates()) {
                    log.info("Remote update - Ref: {}, Status: {}, Message: {}",
                             update.getRemoteName(),
                             update.getStatus(),
                             update.getMessage());

                    if (update.getStatus() != org.eclipse.jgit.transport.RemoteRefUpdate.Status.OK
                        && update.getStatus() != org.eclipse.jgit.transport.RemoteRefUpdate.Status.UP_TO_DATE) {
                        log.error("Push failed for ref {} with status: {}, message: {}",
                                  update.getRemoteName(), update.getStatus(), update.getMessage());
                        throw new RuntimeException("Push failed: " + update.getStatus() + " - " + update.getMessage());
                    }
                }
            }

            log.info("Successfully pushed to {} on branch {}", remoteUrl, branch);

        } catch (GitAPIException e) {
            log.error("Git operation failed: {}", e.getMessage(), e);
            throw new RuntimeException("Git operation failed: " + e.getMessage(), e);
        }
    }

    /**
     * Recursively delete a directory
     */
    private void deleteDirectory(File directory) throws IOException {
        if (directory.isDirectory()) {
            File[] files = directory.listFiles();
            if (files != null) {
                for (File file : files) {
                    deleteDirectory(file);
                }
            }
        }
        Files.delete(directory.toPath());
    }

    /**
     * Configure JGit to bypass SSL verification
     * WARNING: Use only for development/testing
     */
    private void configureInsecureSSL() throws NoSuchAlgorithmException, KeyManagementException {
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

        // Set the default SSL socket factory
        HttpsURLConnection.setDefaultSSLSocketFactory(sslContext.getSocketFactory());

        // Set the default hostname verifier
        HttpsURLConnection.setDefaultHostnameVerifier((hostname, session) -> true);

        log.info("SSL verification bypass configured for JGit operations");
    }

    @Override
    public PushResponse pushFileContents(List<FileContent> files, String remoteUrl, String branch,
                                 String commitMessage, String username, String token, boolean verifySsl) throws Exception {
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("Files list cannot be null or empty");
        }

        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("GitHub token cannot be null or empty");
        }

        if (remoteUrl == null || remoteUrl.trim().isEmpty()) {
            throw new IllegalArgumentException("Remote URL cannot be null or empty");
        }

        // Create a temporary directory for the repository
        Path tempDir = Files.createTempDirectory("github-push-");
        File repoDir = tempDir.toFile();

        log.info("Starting push operation with {} files to branch: {}", files.size(), branch);
        log.info("Using temporary directory: {}", tempDir);
        log.info("Remote URL: {}", remoteUrl);
        log.info("Username: {}", username != null ? username : "<not provided>");
        log.info("Token length: {}", token.length());
        log.info("Token prefix: {}...", token.substring(0, Math.min(10, token.length())));

        // Construct authenticated URL by embedding token
        // Format: https://TOKEN@github.com/user/repo.git
        String authenticatedUrl = buildAuthenticatedUrl(remoteUrl, token);
        log.info("Using token-authenticated URL for GitHub operations");

        Git git = null;
        try {
            // Configure SSL bypass if needed
            if (!verifySsl) {
                log.warn("SSL verification is disabled for Git operations - DO NOT USE IN PRODUCTION");
                configureInsecureSSL();
            }

            // Configure credentials for GitHub token authentication
            // GitHub accepts: username + token as password (recommended)
            // or "x-access-token" + token as password
            UsernamePasswordCredentialsProvider credentials;
            if (username != null && !username.isEmpty()) {
                // Use actual username with token as password
                credentials = new UsernamePasswordCredentialsProvider(username, token);
                log.debug("Configured credentials using username: {} with token as password", username);
            } else {
                // Fallback: use x-access-token with token as password
                credentials = new UsernamePasswordCredentialsProvider("x-access-token", token);
                log.debug("Configured credentials using x-access-token with token as password");
            }

            // Try to clone the existing repository to get the latest state
            boolean branchExists = false;
            try {
                log.info("Attempting to clone existing repository from branch: {}", branch);
                git = Git.cloneRepository()
                    .setURI(authenticatedUrl)  // Use authenticated URL
                    .setBranch(branch)
                    .setDirectory(repoDir)
                    .setCredentialsProvider(credentials)
                    .call();
                branchExists = true;
                log.info("Successfully cloned existing repository");
            } catch (Exception e) {
                log.info("Branch '{}' does not exist or clone failed: {}. Will create new branch.", branch, e.getMessage());
                // Initialize a new repository
                git = Git.init().setDirectory(repoDir).call();

                // Add remote with authenticated URL
                git.remoteAdd()
                   .setName("origin")
                   .setUri(new URIish(authenticatedUrl))
                   .call();
                log.info("Initialized new repository with remote origin");
            }

            // Get existing files from the repository (if branch exists)
            java.util.Map<String, String> existingFiles = new java.util.HashMap<>();
            if (branchExists) {
                log.info("Reading existing files from repository for change detection");
                existingFiles = getExistingFilesFromRepo(git);
                log.info("Found {} existing files in repository", existingFiles.size());
            }

            // Determine which files have changed
            java.util.Set<String> changedFiles = new java.util.HashSet<>();
            java.util.Set<String> newFilePaths = new java.util.HashSet<>();

            for (FileContent file : files) {
                if (file.getPath() == null || file.getPath().trim().isEmpty()) {
                    log.warn("Skipping file with empty path");
                    continue;
                }

                newFilePaths.add(file.getPath());
                String newContent = file.getContent() != null ? file.getContent() : "";
                String existingContent = existingFiles.get(file.getPath());

                if (existingContent == null) {
                    // New file
                    changedFiles.add(file.getPath());
                    log.debug("New file detected: {}", file.getPath());
                } else if (!newContent.equals(existingContent)) {
                    // Modified file
                    changedFiles.add(file.getPath());
                    log.debug("Modified file detected: {}", file.getPath());
                } else {
                    log.debug("File unchanged: {}", file.getPath());
                }
            }

            // Detect deleted files (files that exist in repo but not in new file list)
            java.util.Set<String> deletedFiles = new java.util.HashSet<>();
            for (String existingPath : existingFiles.keySet()) {
                if (!newFilePaths.contains(existingPath)) {
                    deletedFiles.add(existingPath);
                    log.debug("Deleted file detected: {}", existingPath);
                }
            }

            // If no changes detected, skip the push
            if (changedFiles.isEmpty() && deletedFiles.isEmpty()) {
                log.info("No changes detected. Skipping push operation.");
                PushResponse response = new PushResponse(true, "No changes to push. Repository is already up to date.");
                response.setHasChanges(false);
                response.setModifiedFilesCount(0);
                response.setDeletedFilesCount(0);
                response.setTotalFilesCount(files.size());
                return response;
            }

            log.info("Changes detected - New/Modified: {}, Deleted: {}", changedFiles.size(), deletedFiles.size());

            // Write new/modified files to the temporary directory
            for (FileContent file : files) {
                if (file.getPath() == null || file.getPath().trim().isEmpty()) {
                    continue;
                }

                Path filePath = tempDir.resolve(file.getPath().replace("/", File.separator));

                // Create parent directories if they don't exist
                if (filePath.getParent() != null) {
                    Files.createDirectories(filePath.getParent());
                }

                // Write file content
                String content = file.getContent() != null ? file.getContent() : "";
                Files.write(filePath, content.getBytes(StandardCharsets.UTF_8));

                if (changedFiles.contains(file.getPath())) {
                    log.debug("Wrote changed file: {}", file.getPath());
                }
            }

            // Delete removed files from working directory
            for (String deletedPath : deletedFiles) {
                Path fileToDelete = tempDir.resolve(deletedPath.replace("/", File.separator));
                try {
                    if (Files.exists(fileToDelete)) {
                        Files.delete(fileToDelete);
                        log.debug("Deleted file from working directory: {}", deletedPath);
                    }
                } catch (IOException e) {
                    log.warn("Failed to delete file {}: {}", deletedPath, e.getMessage());
                }
            }

            // Checkout or create the target branch
            if (!branchExists) {
                git.checkout()
                   .setOrphan(true)
                   .setName(branch)
                   .call();
                log.info("Created new orphan branch: {}", branch);
            }

            // Stage all changes (add, modify, delete)
            git.add()
               .addFilepattern(".")
               .setUpdate(false) // Include new files
               .call();

            // Remove deleted files from index
            for (String deletedPath : deletedFiles) {
                try {
                    git.rm()
                       .addFilepattern(deletedPath)
                       .call();
                    log.debug("Removed deleted file from index: {}", deletedPath);
                } catch (Exception e) {
                    log.debug("Could not remove file from index (may not exist): {}", deletedPath);
                }
            }

            log.info("Staged all changes");

            // Check status to see what's staged
            org.eclipse.jgit.api.Status status = git.status().call();
            int totalChanges = status.getAdded().size() + status.getChanged().size() +
                             status.getModified().size() + status.getRemoved().size();

            log.info("Status - Added: {}, Changed: {}, Modified: {}, Removed: {}, Total Changes: {}",
                    status.getAdded().size(), status.getChanged().size(),
                    status.getModified().size(), status.getRemoved().size(), totalChanges);

            // Only commit if there are actual changes
            if (totalChanges == 0) {
                log.info("No changes to commit after staging. Repository is up to date.");
                PushResponse response = new PushResponse(true, "No changes to commit. Repository is already up to date.");
                response.setHasChanges(false);
                response.setModifiedFilesCount(0);
                response.setDeletedFilesCount(0);
                response.setTotalFilesCount(files.size());
                return response;
            }

            // Commit the changes
            String enhancedCommitMessage = String.format("%s (Modified: %d, Deleted: %d)",
                commitMessage, changedFiles.size(), deletedFiles.size());

            org.eclipse.jgit.revwalk.RevCommit commit = git.commit()
               .setMessage(enhancedCommitMessage)
               .setAuthor(username, username + "@github.com")
               .setAll(true)
               .call();
            log.info("Created commit with message: {}, SHA: {}", enhancedCommitMessage, commit.getName());

            // Verify commit has the expected changes
            try (org.eclipse.jgit.treewalk.TreeWalk treeWalk = new org.eclipse.jgit.treewalk.TreeWalk(git.getRepository())) {
                treeWalk.addTree(commit.getTree());
                treeWalk.setRecursive(true);
                int fileCount = 0;
                while (treeWalk.next()) {
                    fileCount++;
                    if (fileCount <= 5) { // Log first 5 files
                        log.info("File in commit: {}", treeWalk.getPathString());
                    }
                }
                log.info("Total files in commit tree: {}", fileCount);
            }

            // Push to remote
            log.info("Attempting to push to remote: origin, branch: {}", branch);
            log.info("Using credentials provider with token length: {}", token != null ? token.length() : 0);

            try {
                Iterable<org.eclipse.jgit.transport.PushResult> pushResults = git.push()
                   .setRemote("origin")
                   .setRefSpecs(new RefSpec("refs/heads/" + branch + ":refs/heads/" + branch))
                   .setCredentialsProvider(credentials)
                   .setForce(false) // Normal push, not force
                   .call();

                // Log push results
                boolean pushSuccessful = false;
                for (org.eclipse.jgit.transport.PushResult pushResult : pushResults) {
                    log.info("Push result for remote: {}", pushResult.getURI());
                    for (org.eclipse.jgit.transport.RemoteRefUpdate update : pushResult.getRemoteUpdates()) {
                        log.info("Remote update - Ref: {}, Status: {}, Message: {}",
                                 update.getRemoteName(),
                                 update.getStatus(),
                                 update.getMessage());

                        if (update.getStatus() == org.eclipse.jgit.transport.RemoteRefUpdate.Status.OK ||
                            update.getStatus() == org.eclipse.jgit.transport.RemoteRefUpdate.Status.UP_TO_DATE) {
                            pushSuccessful = true;
                        } else if (update.getStatus() == org.eclipse.jgit.transport.RemoteRefUpdate.Status.REJECTED_NONFASTFORWARD) {
                            log.warn("Push rejected (non-fast-forward). Attempting force push...");
                            // Retry with force push
                            Iterable<org.eclipse.jgit.transport.PushResult> forcePushResults = git.push()
                               .setRemote("origin")
                               .setRefSpecs(new RefSpec("refs/heads/" + branch + ":refs/heads/" + branch))
                               .setCredentialsProvider(credentials)
                               .setForce(true)
                               .call();

                            for (org.eclipse.jgit.transport.PushResult forcePushResult : forcePushResults) {
                                for (org.eclipse.jgit.transport.RemoteRefUpdate forceUpdate : forcePushResult.getRemoteUpdates()) {
                                    log.info("Force push - Ref: {}, Status: {}", forceUpdate.getRemoteName(), forceUpdate.getStatus());
                                    if (forceUpdate.getStatus() == org.eclipse.jgit.transport.RemoteRefUpdate.Status.OK) {
                                        pushSuccessful = true;
                                    }
                                }
                            }
                        } else {
                            log.error("Push failed for ref {} with status: {}, message: {}",
                                      update.getRemoteName(), update.getStatus(), update.getMessage());
                            throw new RuntimeException("Push failed: " + update.getStatus() + " - " + update.getMessage());
                        }
                    }
                }

                if (!pushSuccessful) {
                    throw new RuntimeException("Push operation did not complete successfully");
                }

            } catch (org.eclipse.jgit.api.errors.TransportException e) {
                log.error("Transport exception during push operation", e);
                log.error("Error message: {}", e.getMessage());
                log.error("This usually indicates an authentication problem. Please verify:");
                log.error("1. The GitHub token is valid and not expired");
                log.error("2. The token has 'repo' scope permissions");
                log.error("3. The username '{}' has write access to the repository", username);
                log.error("4. The repository URL is correct: {}", remoteUrl);
                throw new RuntimeException("Git operation failed: " + e.getMessage(), e);
            } catch (GitAPIException e) {
                log.error("Git API exception: {}", e.getMessage(), e);
                throw new RuntimeException("Git operation failed: " + e.getMessage(), e);
            }

            log.info("Successfully pushed changes to {} on branch {} (Modified: {}, Deleted: {})",
                     remoteUrl, branch, changedFiles.size(), deletedFiles.size());

            // Create successful response
            PushResponse response = new PushResponse(true,
                String.format("Successfully pushed %d file(s) to GitHub", changedFiles.size() + deletedFiles.size()));
            response.setHasChanges(true);
            response.setModifiedFilesCount(changedFiles.size());
            response.setDeletedFilesCount(deletedFiles.size());
            response.setTotalFilesCount(files.size());
            response.setCommitHash(commit.getName());

            return response;

        } finally {
            // Close git instance
            if (git != null) {
                git.close();
            }

            // Clean up temporary directory
            try {
                deleteDirectory(repoDir);
                log.info("Cleaned up temporary directory: {}", tempDir);
            } catch (IOException e) {
                log.warn("Failed to delete temporary directory: {}", tempDir, e);
            }
        }
    }

    /**
     * Build authenticated URL by embedding the token
     * Converts: https://github.com/user/repo.git
     * To: https://TOKEN@github.com/user/repo.git
     *
     * @param url Original GitHub URL
     * @param token GitHub Personal Access Token
     * @return Authenticated URL
     */
    private String buildAuthenticatedUrl(String url, String token) {
        if (url == null || url.isEmpty()) {
            return url;
        }

        // If URL already contains authentication, return as is
        if (url.contains("@")) {
            return url;
        }

        // Replace https:// with https://TOKEN@
        if (url.startsWith("https://")) {
            return url.replace("https://", "https://" + token + "@");
        }

        // If using http (not recommended), handle it too
        if (url.startsWith("http://")) {
            return url.replace("http://", "http://" + token + "@");
        }

        // Return original URL if format is unexpected
        return url;
    }

    /**
     * Get existing files from the cloned repository
     *
     * @param git Git instance with cloned repository
     * @return Map of file paths to their content
     */
    private java.util.Map<String, String> getExistingFilesFromRepo(Git git) {
        java.util.Map<String, String> existingFiles = new java.util.HashMap<>();

        try {
            Ref head = git.getRepository().exactRef("HEAD");
            if (head == null || head.getObjectId() == null) {
                log.debug("No HEAD reference found, repository might be empty");
                return existingFiles;
            }

            ObjectId headId = head.getObjectId();
            RevCommit commit = git.getRepository().parseCommit(headId);

            TreeWalk treeWalk = new TreeWalk(git.getRepository());
            treeWalk.addTree(commit.getTree());
            treeWalk.setRecursive(true);

            File repoDir = git.getRepository().getWorkTree();

            while (treeWalk.next()) {
                String filePath = treeWalk.getPathString();

                // Skip .git directory files
                if (filePath.startsWith(".git/") || filePath.startsWith(".git\\")) {
                    continue;
                }

                File file = new File(repoDir, filePath);
                if (file.exists() && file.isFile()) {
                    try {
                        String content = new String(Files.readAllBytes(file.toPath()), StandardCharsets.UTF_8);
                        existingFiles.put(filePath, content);
                    } catch (IOException e) {
                        log.warn("Failed to read file {}: {}", filePath, e.getMessage());
                    }
                }
            }

            treeWalk.close();

        } catch (Exception e) {
            log.warn("Error reading existing files from repository: {}", e.getMessage(), e);
        }

        return existingFiles;
    }

    @Override
    public PullResponse pull(String remoteUrl, String branch, String localPath,
                            String username, String token, boolean verifySsl) throws Exception {
        Path targetDir;
        boolean isTemporary = false;

        // Determine target directory
        if (localPath == null || localPath.isEmpty()) {
            targetDir = Files.createTempDirectory("github-pull-");
            isTemporary = true;
            log.info("Created temporary directory for pull: {}", targetDir);
        } else {
            targetDir = new File(localPath).toPath();
            if (!Files.exists(targetDir)) {
                Files.createDirectories(targetDir);
            }
            log.info("Using specified directory for pull: {}", targetDir);
        }

        File repoDir = targetDir.toFile();
        PullResponse response = new PullResponse();

        try {
            // Configure SSL bypass if needed
            if (!verifySsl) {
                log.warn("SSL verification is disabled for Git operations - DO NOT USE IN PRODUCTION");
                configureInsecureSSL();
            }

            log.info("Starting pull operation from: {}, branch: {}", remoteUrl, branch);

            // Build authenticated URL
            String authenticatedUrl = buildAuthenticatedUrl(remoteUrl, token);

            // Configure credentials for GitHub token authentication
            // GitHub accepts: username + token as password (recommended)
            UsernamePasswordCredentialsProvider credentials;
            if (username != null && !username.isEmpty()) {
                credentials = new UsernamePasswordCredentialsProvider(username, token);
                log.debug("Configured credentials using username: {} with token as password", username);
            } else {
                credentials = new UsernamePasswordCredentialsProvider("x-access-token", token);
                log.debug("Configured credentials using x-access-token with token as password");
            }

            // Clone the repository using authenticated URL
            Git git = Git.cloneRepository()
                .setURI(authenticatedUrl)
                .setBranch(branch)
                .setDirectory(repoDir)
                .setCredentialsProvider(credentials)
                .call();

            log.info("Successfully cloned repository to: {}", targetDir);

            try {
                // Get the latest commit hash
                Ref head = git.getRepository().exactRef("HEAD");
                ObjectId headId = head.getObjectId();
                RevCommit commit = git.getRepository().parseCommit(headId);
                String commitHash = commit.getName();

                log.info("Latest commit: {} - {}", commitHash, commit.getShortMessage());

                // Read all files from the repository
                List<FileContent> files = new ArrayList<>();
                TreeWalk treeWalk = new TreeWalk(git.getRepository());
                treeWalk.addTree(commit.getTree());
                treeWalk.setRecursive(true);

                while (treeWalk.next()) {
                    String filePath = treeWalk.getPathString();

                    // Skip .git directory files
                    if (filePath.startsWith(".git/")) {
                        continue;
                    }

                    File file = new File(repoDir, filePath);
                    if (file.exists() && file.isFile()) {
                        FileContent fileContent = new FileContent();
                        fileContent.setPath(filePath);

                        // Read file content
                        String content = new String(Files.readAllBytes(file.toPath()), StandardCharsets.UTF_8);
                        fileContent.setContent(content);

                        files.add(fileContent);
                        log.debug("Read file: {}", filePath);
                    }
                }

                treeWalk.close();
                log.info("Read {} files from repository", files.size());

                // Populate response
                response.setLocalPath(targetDir.toString());
                response.setBranch(branch);
                response.setCommitHash(commitHash);
                response.setFiles(files);

            } finally {
                git.close();
            }

            return response;

        } catch (GitAPIException | IOException e) {
            log.error("Pull operation failed: {}", e.getMessage(), e);

            // Clean up temporary directory on failure
            if (isTemporary) {
                try {
                    deleteDirectory(repoDir);
                    log.info("Cleaned up temporary directory after failure: {}", targetDir);
                } catch (IOException cleanupEx) {
                    log.warn("Failed to delete temporary directory: {}", targetDir, cleanupEx);
                }
            }

            throw new RuntimeException("Pull operation failed: " + e.getMessage(), e);
        }
    }
}

