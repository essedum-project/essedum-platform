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

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request DTO for Create and Update skill operations.
 * Validated before hitting the service layer.
 *
 * @author essedum
 */
@Data
public class ICIPSkillRequest {

    // ── IDENTITY ──────────��─────────────────────────────────────────────────
    @NotBlank(message = "Skill name is required")
    @Size(max = 256, message = "Skill name must not exceed 256 characters")
    private String skillName;

    @Size(max = 128, message = "Skill alias must not exceed 128 characters")
    private String skillAlias;

    private String skillVersion = "1.0.0";

    // ── CLASSIFICATION ──────────────────────────────────────────────────────
    /** CODE_GENERATION / TEST_GENERATION / DEBUGGING / REFACTORING / DOCUMENTATION /
     *  DEPLOYMENT / CODE_REVIEW / SECURITY_SCAN / DATA_PIPELINE / CUSTOM */
    @NotBlank(message = "Skill type is required")
    private String skillType;

    /** Backend / Frontend / ML / DevOps / Data */
    @NotBlank(message = "Skill category is required")
    private String skillCategory;

    private String skillSubcategory;

    /** JSON array string — e.g. ["python","rest"] */
    private String tags;

    /** JSON array string — e.g. ["generate","build"] */
    private String triggerKeywords;

    // ── DESCRIPTION ─────────────────────────────────────────────────��───────
    @NotBlank(message = "Description is required")
    @Size(max = 16000, message = "Description must not exceed 16000 characters")
    private String description;

    // ── TECHNICAL DEFINITION ─────────────────────────────────────────────────
    /** python | java | typescript | shell | go */
    private String language;

    /** SpringBoot | FastAPI | LangChain | React */
    private String framework;

    /** python3.11 | jdk21 | node18 | docker */
    private String runtime;

    /** Script path / main class / command */
    private String entrypoint;

    /** JSON Schema string */
    private String inputSchema;

    /** JSON Schema string */
    private String outputSchema;

    // ── AVAILABILITY ─────────────────────────────────────────────────────────
    /** ALL / SPECIFIC / NONE */
    private String pipelineScope = "ALL";

    /** ACTIVE / INACTIVE / DEPRECATED */
    private String status = "ACTIVE";

    /** GLOBAL / ORG / PROJECT / PRIVATE */
    private String visibility = "PROJECT";

}


