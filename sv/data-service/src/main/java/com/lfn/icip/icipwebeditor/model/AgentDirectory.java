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

package com.lfn.icip.icipwebeditor.model;

import java.io.Serializable;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * The Class AgentDirectory.
 * Main entity for agent discovery and management.
 */
@Entity
@Table(name = "agent_directory", schema = "essedum_coredb")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class AgentDirectory implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long cid;

    @ManyToOne
    @JoinColumn(name = "pipeline_id", nullable = true)
    @JsonIgnore
    private ICIPStreamingServices pipeline;

    @Column(name = "alias", length = 128, nullable = false, unique = true)
    private String alias;

    @Column(name = "name", length = 256, nullable = false)
    private String name;

    @Column(name = "type", length = 128, nullable = false)
    private String type;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "connection_details", columnDefinition = "TEXT")
    @JsonProperty("connection_details")
    private String connectionDetails;

    @Column(name = "organization", length = 256)
    private String organization;

    @Column(name = "last_modified_by", length = 256)
    @JsonProperty("last_modified_by")
    private String lastModifiedBy;

    @Column(name = "last_modified_date")
    @JsonProperty("last_modified_date")
    private LocalDateTime lastModifiedDate;

    @Column(name = "category", length = 128)
    private String category;

    @Column(name = "interface_type", length = 256, nullable = false)
    @JsonProperty("interface_type")
    private String interfaceType;

    @Column(name = "version", length = 64)
    private String version;

    @Column(name = "creator", length = 256)
    private String creator;

    @Column(name = "extras_json", columnDefinition = "JSON")
    @JsonProperty("extras_json")
    private String extrasJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    @JsonProperty("created_at")
    private Timestamp createdAt;

    @Column(name = "updated_at", nullable = false)
    @JsonProperty("updated_at")
    private Timestamp updatedAt;

    // One-to-Many relationships
    @OneToMany(mappedBy = "agent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AgentModule> modules = new ArrayList<>();

    @OneToMany(mappedBy = "agent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AgentSkill> skills = new ArrayList<>();

    @OneToMany(mappedBy = "agent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AgentDomain> domains = new ArrayList<>();

    @OneToMany(mappedBy = "agent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AgentLocator> locators = new ArrayList<>();

    @OneToMany(mappedBy = "agent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AgentSync> syncs = new ArrayList<>();

    @OneToMany(mappedBy = "agent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AgentPublication> publications = new ArrayList<>();

    @OneToMany(mappedBy = "agent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AgentExtension> extensions = new ArrayList<>();

    @OneToMany(mappedBy = "agent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AgentSelector> selectors = new ArrayList<>();

    @OneToMany(mappedBy = "agent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AgentSignature> signatures = new ArrayList<>();

    @OneToMany(mappedBy = "agent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AgentTool> tools = new ArrayList<>();

    @OneToMany(mappedBy = "agent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AgentResource> resources = new ArrayList<>();

    @OneToMany(mappedBy = "agent", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonProperty("prompts")
    private List<AgentPrompt> prompts = new ArrayList<>();


    // Helper methods to manage bidirectional relationships
    public void addModule(AgentModule module) {
        modules.add(module);
        module.setAgent(this);
    }

    public void addSkill(AgentSkill skill) {
        skills.add(skill);
        skill.setAgent(this);
    }

    public void addDomain(AgentDomain domain) {
        domains.add(domain);
        domain.setAgent(this);
    }

    public void addLocator(AgentLocator locator) {
        locators.add(locator);
        locator.setAgent(this);
    }

    public void addSync(AgentSync sync) {
        syncs.add(sync);
        sync.setAgent(this);
    }

    public void addPublication(AgentPublication publication) {
        publications.add(publication);
        publication.setAgent(this);
    }

    public void addExtension(AgentExtension extension) {
        extensions.add(extension);
        extension.setAgent(this);
    }

    public void addSelector(AgentSelector selector) {
        selectors.add(selector);
        selector.setAgent(this);
    }

    public void addSignature(AgentSignature signature) {
        signatures.add(signature);
        signature.setAgent(this);
    }

    public void addTool(AgentTool tool) {
        tools.add(tool);
        tool.setAgent(this);
    }

    public void addResource(AgentResource resource) {
        resources.add(resource);
        resource.setAgent(this);
    }

    public void addPrompt(AgentPrompt prompt) {
        prompts.add(prompt);
        prompt.setAgent(this);
    }
}

