package com.lfn.icip.vibecoding.service;

import com.lfn.icip.vibecoding.config.VibeGitHubProperties;
import com.lfn.icip.vibecoding.model.VibeGitHubConfig;
import com.lfn.icip.vibecoding.model.VibeGitHubConfig.PushStatus;
import com.lfn.icip.vibecoding.model.VibeGitHubConfig.StorageType;
import com.lfn.icip.vibecoding.repository.VibeGitHubConfigRepository;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.StoredConfig;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.transport.URIish;
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Stream;

/**
 * Service that pushes vibe-coding session generated code to GitHub.
 * <p>
 * For each session a new branch is created in the configured repository.
 * GitHub metadata (repo URL, branch, commit SHA, status) is persisted in the
 * {@code vibe_github_config} table so it can be queried later.
 * <p>
 * Generated code is fetched from the Goose agent via the {@code list_apps} and
 * {@code export_app} APIs, written to a temporary directory, and pushed.
 */
@Service
public class VibeGitHubService {

    private static final Logger logger = LoggerFactory.getLogger(VibeGitHubService.class);

    private final VibeGitHubProperties props;
    private final VibeGitHubConfigRepository repo;
    private final VibeCodingService vibeCodingService;
    private final ObjectMapper objectMapper;

    public VibeGitHubService(VibeGitHubProperties props,
                             VibeGitHubConfigRepository repo,
                             VibeCodingService vibeCodingService,
                             ObjectMapper objectMapper) {
        this.props = props;
        this.repo = repo;
        this.vibeCodingService = vibeCodingService;
        this.objectMapper = objectMapper;
    }

    /**
     * Push the generated code of a session to GitHub asynchronously.
     *
     * @param sessionId Goose session ID
     * @param org       organisation / tenant
     * @param user      user who triggered the push
     * @param repoUrl   optional override repo URL (null → use default from config)
     */
    @Async
    public void pushSessionToGitHub(String sessionId, String org, String user, String repoUrl,
                                      List<String> excludeDirs, List<String> allowedFiles, String pushDir, String branch) {
        String effectiveRepoUrl = (repoUrl != null && !repoUrl.isBlank()) ? repoUrl : props.getRepoUrl();
        String branchName = (branch != null && !branch.isBlank()) ? branch : props.getBranchPrefix() + sessionId;

        // Upsert config record
        VibeGitHubConfig config = repo.findBySessionIdAndOrg(sessionId, org)
                .orElse(VibeGitHubConfig.builder()
                        .sessionId(sessionId)
                        .org(org)
                        .createdBy(user)
                        .build());

        config.setRepoUrl(effectiveRepoUrl);
        config.setBranchName(branchName);
        config.setStatus(PushStatus.IN_PROGRESS);
        config.setStorageType(StorageType.GITHUB);
        config.setErrorMessage(null);
        config = repo.save(config);

        try {
            String commitSha = doPush(sessionId, effectiveRepoUrl, branchName, excludeDirs, allowedFiles, pushDir);
            config.setCommitSha(commitSha);
            config.setStatus(PushStatus.SUCCESS);
            logger.info("Successfully pushed session {} to branch {} (commit {})", sessionId, branchName, commitSha);
        } catch (Exception e) {
            logger.error("Failed to push session {} to GitHub: {}", sessionId, e.getMessage(), e);
            config.setStatus(PushStatus.FAILED);
            config.setErrorMessage(truncate(e.getMessage(), 2000));
        } finally {
            repo.save(config);
        }
    }

    /**
     * Get the GitHub push status for a session.
     */
    public Optional<VibeGitHubConfig> getStatus(String sessionId, String org) {
        return repo.findBySessionIdAndOrg(sessionId, org);
    }

    /**
     * List all GitHub push records for an org.
     */
    public List<VibeGitHubConfig> listByOrg(String org) {
        return repo.findByOrg(org);
    }

    // =========================================================================
    // Goose API — fetch generated code
    // =========================================================================

    /**
     * Fetch the list of app names generated in a Goose session, then export each
     * app's content and write it into the given target directory.
     */
    private void fetchSessionFiles(String sessionId, Path targetDir,
                                     List<String> excludeDirs, List<String> allowedFiles, String pushDir) throws IOException {
        // 1. list_apps for this session
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("session_id", sessionId);
        ResponseEntity<String> listResp = vibeCodingService.get("/agent/list_apps", params);

        if (listResp == null || !listResp.getStatusCode().is2xxSuccessful() || listResp.getBody() == null) {
            throw new IOException("Failed to fetch app list from Goose for session " + sessionId);
        }

        // Parse app names — response may be a JSON array of strings or objects with "name"
        List<String> appNames = parseAppNames(listResp.getBody());
        if (appNames.isEmpty()) {
            throw new IOException("No apps found for session " + sessionId);
        }
        logger.info("Session {} has {} app(s): {}", sessionId, appNames.size(), appNames);

        // Filter out session ID entries and excluded directories
        List<String> effectiveExcludes = excludeDirs != null ? excludeDirs : List.of();
        List<String> filteredApps = appNames.stream()
                .filter(name -> !name.equals(sessionId)
                        && !name.startsWith(sessionId + "/")
                        && !name.startsWith(sessionId + "\\"))
                .filter(name -> {
                    // Exclude directories in the exclude list
                    for (String excl : effectiveExcludes) {
                        if (name.equals(excl) || name.startsWith(excl + "/") || name.startsWith(excl + "\\")) {
                            return false;
                        }
                    }
                    return true;
                })
                .filter(name -> {
                    // If pushDir is specified, only include files under that directory
                    if (pushDir != null && !pushDir.isBlank()) {
                        return name.startsWith(pushDir + "/") || name.startsWith(pushDir + "\\") || name.equals(pushDir);
                    }
                    return true;
                })
                .filter(name -> {
                    // If allowedFiles list is specified, only include those files
                    if (allowedFiles != null && !allowedFiles.isEmpty()) {
                        return allowedFiles.contains(name);
                    }
                    return true;
                })
                .toList();

        if (filteredApps.isEmpty()) {
            logger.warn("All apps filtered out for session '{}'. excludeDirs={}, pushDir={}, allowedFiles count={}. Falling back to all non-session apps.",
                    sessionId, effectiveExcludes, pushDir, allowedFiles != null ? allowedFiles.size() : 0);
            filteredApps = appNames.stream()
                    .filter(name -> !name.equals(sessionId))
                    .toList();
        } else {
            logger.info("Filtered apps for push: {} (excluded: session={}, dirs={}, pushDir={})",
                    filteredApps, sessionId, effectiveExcludes, pushDir);
        }

        // 2. export each app and write to target directory
        // Strip pushDir prefix so files are at repo root (e.g. "my-app/src/App.js" → "src/App.js")
        String prefixToStrip = (pushDir != null && !pushDir.isBlank()) ? pushDir + "/" : null;

        for (String appName : filteredApps) {
            ResponseEntity<String> exportResp = vibeCodingService.get("/agent/export_app/" + appName, null);
            if (exportResp == null || !exportResp.getStatusCode().is2xxSuccessful() || exportResp.getBody() == null) {
                logger.warn("Could not export app '{}', skipping", appName);
                continue;
            }

            // Strip the push_dir prefix so code lands at repo root
            String relativePath = appName;
            if (prefixToStrip != null && relativePath.startsWith(prefixToStrip)) {
                relativePath = relativePath.substring(prefixToStrip.length());
            }
            if (relativePath.isBlank()) continue;

            Path appFile = targetDir.resolve(relativePath);
            Files.createDirectories(appFile.getParent());
            Files.writeString(appFile, exportResp.getBody(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
            logger.info("Wrote '{}' → {}", appName, appFile);
        }
    }

    /**
     * Parse the Goose list_apps response into a list of app names.
     * Handles both {@code ["app1","app2"]} and {@code [{"name":"app1"}, ...]} formats.
     */
    @SuppressWarnings("unchecked")
    private List<String> parseAppNames(String json) throws IOException {
        Object parsed = objectMapper.readValue(json, Object.class);

        // If the response is a map with an inner list (e.g. {"apps": [...]})
        if (parsed instanceof Map) {
            Map<String, Object> map = (Map<String, Object>) parsed;
            // try common keys
            for (String key : new String[]{"apps", "applications", "data", "result"}) {
                if (map.containsKey(key) && map.get(key) instanceof List) {
                    parsed = map.get(key);
                    break;
                }
            }
        }

        if (parsed instanceof List<?> list) {
            return list.stream().map(item -> {
                if (item instanceof String s) return s;
                if (item instanceof Map<?,?> m) {
                    Object name = m.get("name");
                    return String.valueOf(name != null ? name : item);
                }
                return String.valueOf(item);
            }).toList();
        }

        throw new IOException("Unexpected list_apps response format: " + json);
    }

    // =========================================================================
    // Git operations
    // =========================================================================

    private String doPush(String sessionId, String repoUrl, String branchName,
                           List<String> excludeDirs, List<String> allowedFiles, String pushDir)
            throws IOException, GitAPIException, URISyntaxException {

        // Use a unique temp directory per session to avoid cross-contamination
        Path localRepoPath = Paths.get(props.getWorkDir(), "tmp-vibe-" + sessionId + "-" + System.currentTimeMillis());
        File localRepoDir = localRepoPath.toFile();
        UsernamePasswordCredentialsProvider creds =
                new UsernamePasswordCredentialsProvider(props.getUsername(), props.getToken());

        Git git = null;

        try {
            // Clone or init
            if (localRepoDir.exists()) {
                deleteDirectory(localRepoPath);
            }
            Files.createDirectories(localRepoPath);

            // Try clone; if repo is empty, init fresh
            boolean freshRepo = false;
            try {
                git = Git.cloneRepository()
                        .setURI(repoUrl)
                        .setDirectory(localRepoDir)
                        .setCredentialsProvider(creds)
                        .setCloneAllBranches(false)
                        .call();
            } catch (Exception cloneEx) {
                logger.warn("Clone failed (repo may be empty), initialising fresh: {}", cloneEx.getMessage());
                if (localRepoDir.exists()) {
                    deleteDirectory(localRepoPath);
                }
                Files.createDirectories(localRepoPath);
                git = Git.init().setDirectory(localRepoDir).call();
                StoredConfig cfg = git.getRepository().getConfig();
                cfg.setBoolean("http", null, "sslVerify", false);
                cfg.save();
                git.remoteAdd().setName("origin").setUri(new URIish(repoUrl)).call();
                freshRepo = true;
            }

            String commitMsg = props.getCommitMessageTemplate().replace("{sessionId}", sessionId);

            if (freshRepo) {
                // Empty repo — fetch session files directly to repo root, stage, commit, rename branch
                fetchSessionFiles(sessionId, localRepoPath, excludeDirs, allowedFiles, pushDir);

                git.add().addFilepattern(".").call();
                git.commit()
                        .setMessage("Initial commit")
                        .setAuthor(props.getUsername(), props.getUsername() + "@vibe")
                        .call();
                git.branchRename().setNewName(branchName).call();
                logger.info("Fresh repo: created and renamed default branch to '{}'", branchName);
            } else {
                // Existing repo — detect default branch (main/master) and create new branch from it
                String remoteDefaultBranch = detectRemoteDefaultBranch(git, creds);
                logger.info("Detected remote default branch: '{}'. Creating new branch '{}' from 'origin/{}'",
                        remoteDefaultBranch, branchName, remoteDefaultBranch);

                git.checkout()
                        .setCreateBranch(true)
                        .setName(branchName)
                        .setStartPoint("origin/" + remoteDefaultBranch)
                        .call();

                // Remove all existing content (pipeline folders etc.) from working tree
                File[] existingFiles = localRepoDir.listFiles();
                if (existingFiles != null) {
                    for (File f : existingFiles) {
                        if (f.getName().equals(".git")) continue;
                        if (f.isDirectory()) {
                            deleteDirectory(f.toPath());
                        } else {
                            Files.deleteIfExists(f.toPath());
                        }
                    }
                }
                // Stage removals
                git.add().setUpdate(true).addFilepattern(".").call();

                // Fetch and write session files directly to repo root
                fetchSessionFiles(sessionId, localRepoPath, excludeDirs, allowedFiles, pushDir);
                git.add().addFilepattern(".").call();
            }

            // Commit session code
            RevCommit commit = git.commit()
                    .setMessage(commitMsg)
                    .setAuthor(props.getUsername(), props.getUsername() + "@vibe")
                    .call();

            logger.info("Branch '{}' committed: {}", branchName, commit.getName());

            // Push the new branch
            git.push()
                    .setCredentialsProvider(creds)
                    .setRemote("origin")
                    .add(branchName)
                    .call();

            return commit.getName();

        } finally {
            // Always close git and cleanup temp directory
            if (git != null) {
                git.close();
            }
            try {
                deleteDirectory(localRepoPath);
                logger.info("Cleaned up temp directory: {}", localRepoPath);
            } catch (IOException e) {
                logger.warn("Could not clean up local repo dir: {}", localRepoDir);
            }
        }
    }

    private void deleteDirectory(Path dir) throws IOException {
        if (!Files.exists(dir)) return;
        try (Stream<Path> walk = Files.walk(dir)) {
            walk.sorted(Comparator.reverseOrder())
                    .forEach(p -> {
                        try { Files.delete(p); } catch (IOException ignored) {}
                    });
        }
    }

    /**
     * Detects the default branch on the remote (main vs master).
     * Falls back to "main" if neither can be detected.
     */
    private String detectRemoteDefaultBranch(Git git, UsernamePasswordCredentialsProvider creds) {
        try {
            var refs = git.lsRemote()
                    .setCredentialsProvider(creds)
                    .setHeads(true).call();
            boolean hasMain = refs.stream().anyMatch(ref -> ref.getName().equals("refs/heads/main"));
            boolean hasMaster = refs.stream().anyMatch(ref -> ref.getName().equals("refs/heads/master"));
            if (hasMain) return "main";
            if (hasMaster) return "master";
        } catch (Exception e) {
            logger.warn("Could not detect remote default branch: {}", e.getMessage());
        }
        return "main";
    }

    private void copyDirectory(Path source, Path target) throws IOException {
        Files.walkFileTree(source, new SimpleFileVisitor<>() {
            @Override
            public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException {
                if (dir.getFileName() != null && dir.getFileName().toString().equals(".git")) {
                    return FileVisitResult.SKIP_SUBTREE;
                }
                Path dest = target.resolve(source.relativize(dir));
                if (!Files.exists(dest)) {
                    Files.createDirectories(dest);
                }
                return FileVisitResult.CONTINUE;
            }

            @Override
            public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                Files.copy(file, target.resolve(source.relativize(file)), StandardCopyOption.REPLACE_EXISTING);
                return FileVisitResult.CONTINUE;
            }
        });
    }

    private static String truncate(String s, int maxLen) {
        if (s == null) return null;
        return s.length() <= maxLen ? s : s.substring(0, maxLen);
    }
}

