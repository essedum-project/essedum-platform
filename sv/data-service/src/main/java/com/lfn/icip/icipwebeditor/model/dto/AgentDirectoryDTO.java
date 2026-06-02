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

package com.lfn.icip.icipwebeditor.model.dto;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * The Class AgentDirectoryDTO.
 * Data Transfer Object for AgentDirectory entity.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgentDirectoryDTO {

    @JsonProperty("cid")
    private Long cid;

    @JsonProperty("pipeline_id")
    private Integer pipelineId;

    @JsonProperty("alias")
    private String alias;

    @JsonProperty("name")
    private String name;

    @JsonProperty("type")
    private String type;

    @JsonProperty("description")
    private String description;

    @JsonProperty("connection_details")
    private String connectionDetails;

    @JsonProperty("organization")
    private String organization;

    @JsonProperty("last_modified_by")
    private String lastModifiedBy;

    @JsonProperty("last_modified_date")
    private LocalDateTime lastModifiedDate;

    @JsonProperty("category")
    private String category;

    @JsonProperty("interface_type")
    private String interfaceType;

    @JsonProperty("version")
    private String version;

    @JsonProperty("creator")
    private String creator;

    @JsonProperty("extras_json")
    private String extrasJson;

    @JsonProperty("created_at")
    private Timestamp createdAt;

    @JsonProperty("updated_at")
    private Timestamp updatedAt;

    // Collections
    @JsonProperty("modules")
    private List<AgentModuleDTO> modules = new ArrayList<>();

    @JsonProperty("skills")
    private List<AgentSkillDTO> skills = new ArrayList<>();

    @JsonProperty("domains")
    private List<AgentDomainDTO> domains = new ArrayList<>();

    @JsonProperty("locators")
    private List<AgentLocatorDTO> locators = new ArrayList<>();

    @JsonProperty("syncs")
    private List<AgentSyncDTO> syncs = new ArrayList<>();

    @JsonProperty("publications")
    private List<AgentPublicationDTO> publications = new ArrayList<>();

    @JsonProperty("extensions")
    private List<AgentExtensionDTO> extensions = new ArrayList<>();

    @JsonProperty("selectors")
    private List<AgentSelectorDTO> selectors = new ArrayList<>();

    @JsonProperty("signatures")
    private List<AgentSignatureDTO> signatures = new ArrayList<>();

    @JsonProperty("tools")
    private List<AgentToolDTO> tools = new ArrayList<>();

    @JsonProperty("resources")
    private List<AgentResourceDTO> resources = new ArrayList<>();

    @JsonProperty("prompts")
    private List<AgentPromptDTO> prompts = new ArrayList<>();
}

