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

package com.lfn.icip.icipwebeditor.model.dto;

import java.time.Instant;

import lombok.Data;

/**
 * Response DTO — returned for GET single, GET list, create, and update responses.
 *
 * @author essedum
 */
@Data
public class ICIPSkillRegistryDTO {

    // ── IDENTITY ─────────────────────────────────────────────────────────────
    private Long id;
    private String skillUid;
    private String skillName;
    private String skillAlias;
    private String skillVersion;

    // ── CLASSIFICATION ───────────────────────────────��────────────────────────
    private String skillType;
    private String skillCategory;
    private String skillSubcategory;
    private String tags;
    private String triggerKeywords;

    // ── DESCRIPTION ────────────────────────────────────���─────────────────────
    private String description;

    // ── TECHNICAL DEFINITION ──────────────────────────────────────────────────
    private String language;
    private String framework;
    private String runtime;
    private String entrypoint;
    private String inputSchema;
    private String outputSchema;

    // ── AVAILABILITY ─────────────────────────────────────────────────────────
    private String pipelineScope;
    private String status;
    private String visibility;

    // ── MULTI-TENANCY ─────────────────────────────────────────────────────────
    private String organization;
    private Integer projectId;

    // ── USAGE METRICS ─────────────────────────────────────────────────────────
    private Long usageCount;
    private Instant lastUsedDate;

    // ── AUDIT ─────────────────────────────────────────────────────────────────
    private String createdBy;
    private Instant createdDate;
    private String lastModifiedBy;
    private Instant lastModifiedDate;
}


