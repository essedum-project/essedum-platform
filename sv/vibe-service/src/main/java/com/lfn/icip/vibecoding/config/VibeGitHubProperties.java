package com.lfn.icip.vibecoding.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration properties for Vibe GitHub integration.
 */
@Component
@ConfigurationProperties(prefix = "vibe.github")
@Getter
@Setter
public class VibeGitHubProperties {

    /** Whether GitHub push is enabled (false = legacy DB-only mode) */
    private boolean enabled = false;

    /** Default GitHub repo URL to push session code to */
    private String repoUrl;

    /** GitHub username for authentication */
    private String username;

    /** GitHub personal access token (PAT) for authentication */
    private String token;

    /** Local directory for cloning repos before push */
    private String workDir = "/tmp/vibe-github";

    /** Default commit message template. Use {sessionId} as placeholder. */
    private String commitMessageTemplate = "Vibe session {sessionId} — auto-generated code";

    /** Branch name prefix. Final branch = prefix + sessionId */
    private String branchPrefix = "studio/";
}

