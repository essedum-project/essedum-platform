package com.lfn.icip.vibecoding.model;

import java.io.Serializable;
import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

/**
 * Entity storing GitHub push metadata for each vibe-coding session.
 */
@Entity
@Table(name = "vibe_github_config",
       uniqueConstraints = @UniqueConstraint(columnNames = {"session_id", "org"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class VibeGitHubConfig implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    /** Goose session ID */
    @Column(name = "session_id", length = 256, nullable = false)
    @JsonProperty("sessionId")
    private String sessionId;

    /** Organisation / tenant identifier */
    @Column(name = "org", length = 256, nullable = false)
    @JsonProperty("org")
    private String org;

    /** GitHub repository URL (e.g. https://github.com/org/repo.git) */
    @Column(name = "repo_url", length = 1024, nullable = false)
    @JsonProperty("repoUrl")
    private String repoUrl;

    /** Branch name created for this session */
    @Column(name = "branch_name", length = 512, nullable = false)
    @JsonProperty("branchName")
    private String branchName;

    /** Latest commit SHA pushed */
    @Column(name = "commit_sha", length = 64)
    @JsonProperty("commitSha")
    private String commitSha;

    /** Push status: PENDING, IN_PROGRESS, SUCCESS, FAILED */
    @Column(name = "status", length = 32, nullable = false)
    @JsonProperty("status")
    @Enumerated(EnumType.STRING)
    private PushStatus status;

    /** Error message if push failed */
    @Column(name = "error_message", length = 2048)
    @JsonProperty("errorMessage")
    private String errorMessage;

    /** Storage type: DATABASE (legacy) or GITHUB */
    @Column(name = "storage_type", length = 32, nullable = false)
    @JsonProperty("storageType")
    @Enumerated(EnumType.STRING)
    private StorageType storageType;

    @Column(name = "created_by", length = 256)
    @JsonProperty("createdBy")
    private String createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    @JsonProperty("createdAt")
    private Timestamp createdAt;

    @Column(name = "updated_at", nullable = false)
    @JsonProperty("updatedAt")
    private Timestamp updatedAt;

    @PrePersist
    protected void onCreate() {
        Timestamp now = new Timestamp(System.currentTimeMillis());
        createdAt = now;
        updatedAt = now;
        if (status == null) status = PushStatus.PENDING;
        if (storageType == null) storageType = StorageType.GITHUB;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Timestamp(System.currentTimeMillis());
    }

    public enum PushStatus {
        PENDING, IN_PROGRESS, SUCCESS, FAILED
    }

    public enum StorageType {
        DATABASE, GITHUB
    }
}

