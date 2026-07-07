/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

package com.lfn.icip.icipwebeditor.model;

import java.io.Serializable;
import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import com.lfn.ai.comm.lib.util.domain.BaseDomain;
import com.lfn.ai.comm.lib.util.listener.AuditListener;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entity representing a Copilot Skill in the ESSEDUM Skill Registry.
 * Skills are displayed in the Copilot Tab for pipeline users to select.
 * No agent configuration stored here — skills are UI listing entries only.
 *
 * @author essedum
 */
@EntityListeners(AuditListener.class)
@Entity
@Table(
    name = "icip_skill_registry",
    uniqueConstraints = @UniqueConstraint(columnNames = {"skill_name", "skill_version", "organization"})
)
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class ICIPSkillRegistry extends BaseDomain implements Serializable {

    /** The Constant serialVersionUID. */
    private static final long serialVersionUID = 1L;

    // ── IDENTITY ────────────────────────────────────────────────────────────
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "skill_uid", nullable = false, unique = true, length = 64)
    private String skillUid;

    @Column(name = "skill_name", nullable = false, length = 256)
    private String skillName;

    @Column(name = "skill_alias", length = 128)
    private String skillAlias;

    @Column(name = "skill_version", nullable = false, length = 20)
    private String skillVersion = "1.0.0";

    // ── CLASSIFICATION ──────────────────────────────────────────────────────
    /** CODE_GENERATION / TEST_GENERATION / DEBUGGING / REFACTORING / DOCUMENTATION /
     *  DEPLOYMENT / CODE_REVIEW / SECURITY_SCAN / DATA_PIPELINE / CUSTOM */
    @Column(name = "skill_type", nullable = false, length = 64)
    private String skillType;

    /** Backend / Frontend / ML / DevOps / Data */
    @Column(name = "skill_category", nullable = false, length = 128)
    private String skillCategory;

    /** SpringBoot / FastAPI / React — optional sub-domain */
    @Column(name = "skill_subcategory", length = 128)
    private String skillSubcategory;

    /** JSON array — e.g. ["python","rest","junit"] */
    @Column(name = "tags", columnDefinition = "TEXT")
    private String tags;

    /** JSON array — keywords that auto-match this skill from a user prompt */
    @Column(name = "trigger_keywords", columnDefinition = "TEXT")
    private String triggerKeywords;

    // ── DESCRIPTION ────────────────────────────────────────────��────────────
    @Column(name = "description", nullable = false, length = 512)
    private String description;

    // ── TECHNICAL DEFINITION ─────────────────────────────────────────────────
    /** python | java | typescript | shell | go */
    @Column(name = "language", length = 64)
    private String language;

    /** SpringBoot | FastAPI | LangChain | React */
    @Column(name = "framework", length = 128)
    private String framework;

    /** python3.11 | jdk21 | node18 | docker */
    @Column(name = "runtime", length = 128)
    private String runtime;

    /** Script path / main class / command */
    @Column(name = "entrypoint", length = 512)
    private String entrypoint;

    /** JSON Schema of expected input parameters */
    @Column(name = "input_schema", columnDefinition = "TEXT")
    private String inputSchema;

    /** JSON Schema of produced output */
    @Column(name = "output_schema", columnDefinition = "TEXT")
    private String outputSchema;

    // ── AVAILABILITY ─────────────────────────────────────────────────────────
    /** ALL / SPECIFIC / NONE */
    @Column(name = "pipeline_scope", nullable = false, length = 16)
    private String pipelineScope = "ALL";

    /** ACTIVE / INACTIVE / DEPRECATED */
    @Column(name = "status", nullable = false, length = 16)
    private String status = "ACTIVE";

    /** GLOBAL / ORG / PROJECT / PRIVATE */
    @Column(name = "visibility", nullable = false, length = 16)
    private String visibility = "PROJECT";

    // ── MULTI-TENANCY ────────────────────────────────────────────────────────
    @Column(name = "organization", nullable = false, length = 256)
    private String organization;

    /** FK → usm_project.id (NULL = org-wide) */
    @Column(name = "project_id")
    private Integer projectId;

    // ── USAGE METRICS (denormalized — updated on each trigger) ────────────────
    @Column(name = "usage_count", nullable = false)
    private Long usageCount = 0L;

    @Column(name = "last_used_date")
    private Instant lastUsedDate;

    // ── AUDIT fields (created_by / created_date inherited via explicit columns) ─
    @Column(name = "created_by", nullable = false, length = 100)
    private String createdBy;

    @Column(name = "created_date", nullable = false, updatable = false)
    private Instant createdDate;

    // last_modified_by and last_modified_date come from BaseDomain.lastmodifiedby/lastmodifieddate

    // ── SOFT DELETE ─────────────────────────────────────────────────────────
    @Column(name = "deleted", nullable = false)
    private boolean deleted = false;

    @Column(name = "deleted_by", length = 100)
    private String deletedBy;

    @Column(name = "deleted_date")
    private Instant deletedDate;

    // ── equals / hashCode ───────────────────────────────────────���────────────

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!super.equals(obj)) return false;
        if (getClass() != obj.getClass()) return false;
        ICIPSkillRegistry other = (ICIPSkillRegistry) obj;
        if (this.getId() == null) {
            return other.getId() == null;
        }
        return id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = super.hashCode();
        result = prime * result + ((this.getId() == null) ? 0 : id.hashCode());
        return result;
    }
}


