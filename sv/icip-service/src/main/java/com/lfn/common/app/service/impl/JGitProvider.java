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

import com.lfn.ai.comm.lib.util.SecureTrustManagerUtil;
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
            // Configure credentials
            UsernamePasswordCredentialsProvider credentials =
                new UsernamePasswordCredentialsProvider(username, token);

            // Check if remote 'origin' exists
            List<RemoteConfig> remoteConfigs = git.remoteList().call();
            boolean originExists = remoteConfigs.stream()
                .anyMatch(remote -> remote.getName().equals("origin"));

            if (!originExists) {
                // Add remote if it doesn't exist
                git.remoteAdd()
                   .setName("origin")
                   .setUri(new URIish(remoteUrl))
                   .call();
                log.info("Added remote origin: {}", remoteUrl);
            } else {
                // Update remote URL if it exists
                git.remoteSetUrl()
                   .setRemoteName("origin")
                   .setRemoteUri(new URIish(remoteUrl))
                   .call();
                log.info("Updated remote origin: {}", remoteUrl);
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
     * Automatically detect the default/base branch of the repository
     * Checks in order: remote HEAD, 'main', 'master', then first available branch
     *
     * @param git Git repository instance
     * @return The name of the default branch, or null if repository is empty
     */
    private String detectDefaultBranch(Git git) {
        try {
            // First, try to get the default branch from remote HEAD
            log.info("Detecting default branch from remote HEAD...");

            // List all remote refs
            for (Ref ref : git.getRepository().getRefDatabase().getRefs()) {
                String refName = ref.getName();

                // Check if this is the remote HEAD symbolic ref
                if (refName.equals("refs/remotes/origin/HEAD")) {
                    // Get what it points to
                    Ref target = git.getRepository().getRefDatabase().peel(ref);
                    if (target.isSymbolic()) {
                        String targetName = target.getTarget().getName();
                        // Extract branch name from refs/remotes/origin/branch-name
                        if (targetName.startsWith("refs/remotes/origin/")) {
                            String branchName = targetName.substring("refs/remotes/origin/".length());
                            log.info("Detected default branch from remote HEAD: {}", branchName);
                            return branchName;
                        }
                    } else if (ref.getObjectId() != null) {
                        // If HEAD is pointing to a specific commit, try to find which branch
                        ObjectId headCommit = ref.getObjectId();
                        for (Ref branchRef : git.getRepository().getRefDatabase().getRefs()) {
                            if (branchRef.getName().startsWith("refs/remotes/origin/")
                                && !branchRef.getName().equals("refs/remotes/origin/HEAD")) {
                                if (branchRef.getObjectId().equals(headCommit)) {
                                    String branchName = branchRef.getName().substring("refs/remotes/origin/".length());
                                    log.info("Detected default branch from HEAD commit: {}", branchName);
                                    return branchName;
                                }
                            }
                        }
                    }
                }
            }

            // If remote HEAD detection failed, check for common default branches
            log.info("Remote HEAD not found, checking for common default branches...");

            // Check if 'main' exists
            for (Ref ref : git.getRepository().getRefDatabase().getRefs()) {
                if (ref.getName().equals("refs/remotes/origin/main")) {
                    log.info("Found 'main' branch");
                    return "main";
                }
            }

            // Check if 'master' exists
            for (Ref ref : git.getRepository().getRefDatabase().getRefs()) {
                if (ref.getName().equals("refs/remotes/origin/master")) {
                    log.info("Found 'master' branch");
                    return "master";
                }
            }

            // If neither main nor master exists, return the first remote branch found
            for (Ref ref : git.getRepository().getRefDatabase().getRefs()) {
                String refName = ref.getName();
                if (refName.startsWith("refs/remotes/origin/") && !refName.endsWith("/HEAD")) {
                    String branchName = refName.substring("refs/remotes/origin/".length());
                    log.info("Using first available branch as default: {}", branchName);
                    return branchName;
                }
            }

            log.warn("No remote branches found, repository might be empty");
            return null;

        } catch (Exception e) {
            log.warn("Failed to detect default branch: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Configure JGit to bypass SSL verification
     * WARNING: Use only for development/testing
     */
    private void configureInsecureSSL() throws NoSuchAlgorithmException, KeyManagementException {
        // Create a trust manager that accepts all certificates
        TrustManager[] trustAllCerts = SecureTrustManagerUtil.getValidatingTrustManagers();

        // Install the all-trusting trust manager
        SSLContext sslContext = SSLContext.getInstance("TLS");
        sslContext.init(null, trustAllCerts, new SecureRandom());

        // Set the default SSL socket factory
        HttpsURLConnection.setDefaultSSLSocketFactory(sslContext.getSocketFactory());

        // Set the default hostname verifier
        HttpsURLConnection.setDefaultHostnameVerifier(com.lfn.ai.comm.lib.util.SafeHostnameVerifier.INSTANCE);

        log.info("SSL verification bypass configured for JGit operations");
    }

    @Override
    public void pushFileContents(List<FileContent> files, String remoteUrl, String branch,
                                 String commitMessage, String username, String token, boolean verifySsl) throws Exception {
        // Create a temporary directory for the repository
        Path tempDir = Files.createTempDirectory("github-push-");
        File repoDir = tempDir.toFile();

        log.info("Starting push operation with {} files to branch: {}", files.size(), branch);
        log.info("Using temporary directory: {}", tempDir);

        try {
            // Configure SSL bypass if needed
            if (!verifySsl) {
                log.warn("SSL verification is disabled for Git operations - DO NOT USE IN PRODUCTION");
                configureInsecureSSL();
            }

            // Initialize git repository
            try (Git git = Git.init().setDirectory(repoDir).call()) {

                // Configure credentials
                UsernamePasswordCredentialsProvider credentials =
                    new UsernamePasswordCredentialsProvider(username, token);

                // Add remote
                git.remoteAdd()
                   .setName("origin")
                   .setUri(new URIish(remoteUrl))
                   .call();
                log.info("Added remote origin: {}", remoteUrl);

                // Fetch remote branches to get history
                try {
                    log.info("Fetching remote branches to maintain commit history...");
                    git.fetch()
                       .setRemote("origin")
                       .setCredentialsProvider(credentials)
                       .call();
                    log.info("Successfully fetched remote branches");
                } catch (Exception e) {
                    log.warn("Could not fetch remote branches (repository might be empty): {}", e.getMessage());
                }

                // Try to checkout the target branch or create it from a base branch
                boolean branchExists = false;
                try {
                    // Try to checkout the existing branch
                    git.checkout()
                       .setName(branch)
                       .setCreateBranch(true)
                       .setStartPoint("origin/" + branch)
                       .call();
                    log.info("Checked out existing branch: {}", branch);
                    branchExists = true;
                } catch (Exception e) {
                    // Branch doesn't exist, create it from default/base branch
                    log.info("Branch '{}' doesn't exist remotely, detecting base branch...", branch);

                    // Automatically detect the default branch
                    String baseBranch = detectDefaultBranch(git);

                    if (baseBranch != null) {
                        try {
                            // Create from detected base branch to maintain history
                            git.checkout()
                               .setName(baseBranch)
                               .setCreateBranch(true)
                               .setStartPoint("origin/" + baseBranch)
                               .call();
                            log.info("Checked out base branch: {}", baseBranch);

                            // Now create target branch from base branch
                            git.checkout()
                               .setName(branch)
                               .setCreateBranch(true)
                               .setStartPoint(baseBranch)
                               .call();
                            log.info("Created branch '{}' from detected base branch '{}' to maintain commit history", branch, baseBranch);
                        } catch (Exception ex) {
                            log.warn("Failed to create branch from detected base '{}': {}", baseBranch, ex.getMessage());
                            // Fall back to orphan branch
                            git.checkout()
                               .setOrphan(true)
                               .setName(branch)
                               .call();
                            log.info("Created orphan branch '{}' as fallback", branch);
                        }
                    } else {
                        // Repository is empty, create orphan branch
                        git.checkout()
                           .setOrphan(true)
                           .setName(branch)
                           .call();
                        log.info("Created orphan branch '{}' (repository is empty)", branch);
                    }
                }

                // Clean existing files (except .git folder) to ensure clean state
                if (branchExists) {
                    log.info("Cleaning existing files from working directory...");
                    File[] existingFiles = repoDir.listFiles();
                    if (existingFiles != null) {
                        for (File file : existingFiles) {
                            if (!file.getName().equals(".git")) {
                                deleteDirectory(file);
                            }
                        }
                    }
                }

                // Write all new files to the directory
                for (FileContent file : files) {
                    Path filePath = tempDir.resolve(file.getPath());

                    // Create parent directories if they don't exist
                    Files.createDirectories(filePath.getParent());

                    // Write file content
                    Files.write(filePath, file.getContent().getBytes(StandardCharsets.UTF_8));
                    log.debug("Created file: {}", file.getPath());
                }
                log.info("Wrote {} files to working directory", files.size());

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

                log.info("Successfully pushed {} files to {} on branch {}", files.size(), remoteUrl, branch);

            } catch (GitAPIException e) {
                log.error("Git operation failed: {}", e.getMessage(), e);
                throw new RuntimeException("Git operation failed: " + e.getMessage(), e);
            }
        } finally {
            // Clean up temporary directory
            try {
                deleteDirectory(repoDir);
                log.info("Cleaned up temporary directory: {}", tempDir);
            } catch (IOException e) {
                log.warn("Failed to delete temporary directory: {}", tempDir, e);
            }
        }
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

            // Configure credentials
            UsernamePasswordCredentialsProvider credentials =
                new UsernamePasswordCredentialsProvider(username, token);

            // Clone the repository
            Git git = Git.cloneRepository()
                .setURI(remoteUrl)
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

