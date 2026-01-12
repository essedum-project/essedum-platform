/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 * <p>
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * <p>
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * <p>
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

package com.lfn.icip.icipwebeditor.service.impl;

import com.lfn.icip.icipwebeditor.model.*;
import com.lfn.icip.icipwebeditor.model.dto.*;
import com.lfn.icip.icipwebeditor.repository.AgentDirectoryRepository;
import com.lfn.icip.icipwebeditor.repository.ICIPStreamingServicesRepository;
import com.lfn.icip.icipwebeditor.rest.exception.AgentDirectoryException;
import com.lfn.icip.icipwebeditor.service.IICIPAgentDirectoryService;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.service.dto.support.NameEncoderService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * The Class ICIPAgentDirectoryService.
 */
@Service
@Transactional
public class ICIPAgentDirectoryService implements IICIPAgentDirectoryService {

    private static final Logger logger = LoggerFactory.getLogger(ICIPAgentDirectoryService.class);
    private static final String ENTITY_NAME = "agent-directory";

    @Autowired
    private AgentDirectoryRepository agentDirectoryRepository;

    @Autowired
    private ICIPStreamingServicesRepository streamingServicesRepository;

    @PersistenceContext
    private EntityManager entityManager;

    private final ModelMapper modelMapper = new ModelMapper();

    @Autowired
    private NameEncoderService ncs;

    @Value("${security.claim:#{null}}")
    private String claim;

    @Override
    public AgentDirectoryDTO saveOrUpdateAgentDirectory(AgentDirectoryDTO agentDirectoryDTO) {
        try {
            // Validate input
            if (agentDirectoryDTO == null) {
                throw new IllegalArgumentException("Agent directory DTO cannot be null");
            }
            if (agentDirectoryDTO.getAlias() == null || agentDirectoryDTO.getAlias().trim().isEmpty()) {
                throw new IllegalArgumentException("Agent alias is required");
            }
            if (agentDirectoryDTO.getOrganization() == null || agentDirectoryDTO.getOrganization().trim().isEmpty()) {
                throw new IllegalArgumentException("Organization is required");
            }

            // Check for existing agent with same alias and organization
            List<AgentDirectory> existList = agentDirectoryRepository.getByAliasAndOrganization(
                    agentDirectoryDTO.getAlias(), agentDirectoryDTO.getOrganization());

            if (!existList.isEmpty()) {
                // If we're creating a new agent (cid is null) and duplicates exist, return error
                if (agentDirectoryDTO.getCid() == null) {
                    throw new IllegalArgumentException("Display name already exists.");
                }
                // If we're updating, ensure the existing record is the one we're updating
                AgentDirectory existing = existList.getFirst();
                if (!existing.getCid().equals(agentDirectoryDTO.getCid())) {
                    throw new IllegalArgumentException("Display name already exists.");
                }
            }

            AgentDirectory agentDirectory;

            if (agentDirectoryDTO.getCid() != null) {
                // Update existing agent
                Optional<AgentDirectory> existingAgent = agentDirectoryRepository.findById(agentDirectoryDTO.getCid());
                if (existingAgent.isPresent()) {
                    logger.info("Updating agent directory: {}", agentDirectoryDTO.getAlias());
                    agentDirectory = existingAgent.get();
                    updateAgentFromDTO(agentDirectory, agentDirectoryDTO);
                    // Set audit fields for update
                    agentDirectory.setLastModifiedBy(ICIPUtils.getUser(claim));
                    agentDirectory.setCreator(ICIPUtils.getUser(claim));
                    agentDirectory.setLastModifiedDate(LocalDateTime.now());
                    agentDirectory.setUpdatedAt(Timestamp.from(Instant.now()));
                } else {
                    throw new IllegalArgumentException("Agent with cid " + agentDirectoryDTO.getCid() + " not found.");
                }
            } else {
                // Create new agent
                logger.info("Creating new agent directory: {}", agentDirectoryDTO.getAlias());
                agentDirectory = convertToEntity(agentDirectoryDTO);
                // Set audit fields for create
                agentDirectory.setCreator(ICIPUtils.getUser(claim));
                agentDirectory.setCreator(ICIPUtils.getUser(claim));
                agentDirectory.setLastModifiedBy(ICIPUtils.getUser(claim));
                agentDirectory.setLastModifiedDate(LocalDateTime.now());

                // Handle pipeline ID only during CREATE (not UPDATE)
                if (agentDirectoryDTO.getPipelineId() != null) {
                    logger.info("Setting pipeline ID during agent creation: {}", agentDirectoryDTO.getPipelineId());
                    Optional<ICIPStreamingServices> pipeline = streamingServicesRepository.findById(agentDirectoryDTO.getPipelineId());
                    if (pipeline.isPresent()) {
                        agentDirectory.setPipeline(pipeline.get());
                        logger.info("Successfully set pipeline for new agent directory");
                    } else {
                        logger.warn("Pipeline with ID {} not found, skipping pipeline association", agentDirectoryDTO.getPipelineId());
                    }
                } else {
                    logger.debug("No pipeline ID provided in DTO for new agent");
                }
            }

            AgentDirectory savedAgent = save(agentDirectory, logger, null);
            return convertToDTO(savedAgent);

        } catch (IllegalArgumentException e) {
            // Re-throw validation errors as-is (will be caught by global handler with 400 status)
            logger.error("Validation error in saveOrUpdateAgentDirectory: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            // Wrap any other exceptions in AgentDirectoryException
            logger.error("Error saving/updating agent directory: {}", e.getMessage(), e);
            throw new AgentDirectoryException("Failed to save or update agent directory", e);
        }
    }

    @Override
    public AgentDirectoryDTO getAgentDirectory(String name, String organization) {
        try {
            // Validate input
            if (name == null || name.trim().isEmpty()) {
                throw new IllegalArgumentException("Agent name is required");
            }
            if (organization == null || organization.trim().isEmpty()) {
                throw new IllegalArgumentException("Organization is required");
            }

            logger.info("Fetching agent directory by name: {} and organization: {}", name, organization);
            Optional<AgentDirectory> agentDirectory = agentDirectoryRepository.findByNameAndOrganization(name, organization);
            return agentDirectory.map(this::convertToDTO).orElse(null);

        } catch (IllegalArgumentException e) {
            logger.error("Validation error in getAgentDirectory: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error fetching agent directory: {}", e.getMessage(), e);
            throw new AgentDirectoryException("Failed to fetch agent directory", e);
        }
    }


    @Override
    public void deleteAgentDirectory(Long cid) {
        try {
            // Validate input
            if (cid == null) {
                logger.error("Delete operation failed - Agent CID is null");
                throw new IllegalArgumentException("Agent cid cannot be null");
            }

            logger.info("Service layer - Deleting agent directory with cid: {}", cid);

            // Check if agent exists before deleting
            if (!agentDirectoryRepository.existsById(cid)) {
                logger.warn("Delete operation failed - Agent with CID {} does not exist in database", cid);
                throw new IllegalArgumentException("Agent with cid " + cid + " not found");
            }

            // Get agent details for logging before deletion
            try {
                AgentDirectory agent = agentDirectoryRepository.findById(cid).orElse(null);
                if (agent != null) {
                    logger.info("Deleting agent - Name: {}, Alias: {}, Organization: {}, CID: {}",
                            agent.getName(), agent.getAlias(), agent.getOrganization(), cid);
                }
            } catch (Exception e) {
                logger.debug("Could not retrieve agent details before deletion: {}", e.getMessage());
            }

            agentDirectoryRepository.deleteById(cid);
            logger.info("Successfully deleted agent directory from database with cid: {}", cid);

        } catch (IllegalArgumentException e) {
            logger.error("Validation error in deleteAgentDirectory for CID {}: {}", cid, e.getMessage());
            throw e;
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            logger.error("Data integrity violation while deleting agent CID {}: {}. Agent may have dependent entities.",
                    cid, e.getMessage());
            throw new AgentDirectoryException("Cannot delete agent directory due to existing dependencies", e);
        } catch (org.springframework.dao.DataAccessException e) {
            logger.error("Database error while deleting agent CID {}: {}", cid, e.getMessage(), e);
            throw new AgentDirectoryException("Database error while deleting agent directory", e);
        } catch (Exception e) {
            logger.error("Unexpected error deleting agent directory with cid {}: {}", cid, e.getMessage(), e);
            throw new AgentDirectoryException("Failed to delete agent directory", e);
        }
    }



    /**
     * Save agent directory with name generation.
     *
     * @param agentDirectory the agent directory
     * @param logger the logger
     * @param marker the marker
     * @return the saved agent directory
     */
    public AgentDirectory save(AgentDirectory agentDirectory, Logger logger, Marker marker) {
        if (logger != null) {
            logger.info(marker, "Saving agent directory {}", agentDirectory.getAlias());
        }

        if (agentDirectory.getName() == null || agentDirectory.getName().trim().isEmpty()) {
            boolean uniqueName = true;
            String name = null;
            do {
                name = ncs.nameEncoder(agentDirectory.getOrganization(), agentDirectory.getAlias());
                uniqueName = agentDirectoryRepository.countByName(name) == 0;
                if (logger != null) {
                    logger.info(name);
                }
            } while (!uniqueName);
            agentDirectory.setName(name);
        }

        agentDirectory.setAlias(agentDirectory.getAlias() != null && !agentDirectory.getAlias().trim().isEmpty()
                ? agentDirectory.getAlias()
                : agentDirectory.getName());

        return agentDirectoryRepository.save(agentDirectory);
    }

    /**
     * Convert entity to DTO.
     *
     * @param agentDirectory the agent directory entity
     * @return the agent directory DTO
     */
    public AgentDirectoryDTO convertToDTO(AgentDirectory agentDirectory) {
        AgentDirectoryDTO dto = modelMapper.map(agentDirectory, AgentDirectoryDTO.class);

        // Map pipeline_id if pipeline is present
        if (agentDirectory.getPipeline() != null) {
            dto.setPipelineId(agentDirectory.getPipeline().getCid());
        }

        // Map nested collections
        if (agentDirectory.getModules() != null) {
            dto.setModules(agentDirectory.getModules().stream()
                    .map(module -> modelMapper.map(module, com.lfn.icip.icipwebeditor.model.dto.AgentModuleDTO.class))
                    .collect(Collectors.toList()));
        }

        if (agentDirectory.getSkills() != null) {
            dto.setSkills(agentDirectory.getSkills().stream()
                    .map(skill -> modelMapper.map(skill, com.lfn.icip.icipwebeditor.model.dto.AgentSkillDTO.class))
                    .collect(Collectors.toList()));
        }

        if (agentDirectory.getDomains() != null) {
            dto.setDomains(agentDirectory.getDomains().stream()
                    .map(domain -> modelMapper.map(domain, com.lfn.icip.icipwebeditor.model.dto.AgentDomainDTO.class))
                    .collect(Collectors.toList()));
        }

        if (agentDirectory.getLocators() != null) {
            dto.setLocators(agentDirectory.getLocators().stream()
                    .map(locator -> modelMapper.map(locator, com.lfn.icip.icipwebeditor.model.dto.AgentLocatorDTO.class))
                    .collect(Collectors.toList()));
        }

        if (agentDirectory.getSyncs() != null) {
            dto.setSyncs(agentDirectory.getSyncs().stream()
                    .map(sync -> modelMapper.map(sync, com.lfn.icip.icipwebeditor.model.dto.AgentSyncDTO.class))
                    .collect(Collectors.toList()));
        }

        if (agentDirectory.getPublications() != null) {
            dto.setPublications(agentDirectory.getPublications().stream()
                    .map(publication -> modelMapper.map(publication, com.lfn.icip.icipwebeditor.model.dto.AgentPublicationDTO.class))
                    .collect(Collectors.toList()));
        }

        if (agentDirectory.getExtensions() != null) {
            dto.setExtensions(agentDirectory.getExtensions().stream()
                    .map(extension -> modelMapper.map(extension, AgentExtensionDTO.class))
                    .collect(Collectors.toList()));
        }

        if (agentDirectory.getSelectors() != null) {
            dto.setSelectors(agentDirectory.getSelectors().stream()
                    .map(selector -> modelMapper.map(selector, AgentSelectorDTO.class))
                    .collect(Collectors.toList()));
        }

        if (agentDirectory.getSignatures() != null) {
            dto.setSignatures(agentDirectory.getSignatures().stream()
                    .map(signature -> modelMapper.map(signature, com.lfn.icip.icipwebeditor.model.dto.AgentSignatureDTO.class))
                    .collect(Collectors.toList()));
        }

        if (agentDirectory.getTools() != null) {
            dto.setTools(agentDirectory.getTools().stream()
                    .map(tool -> modelMapper.map(tool, AgentToolDTO.class))
                    .collect(Collectors.toList()));
        }

        if (agentDirectory.getResources() != null) {
            dto.setResources(agentDirectory.getResources().stream()
                    .map(resource -> modelMapper.map(resource, com.lfn.icip.icipwebeditor.model.dto.AgentResourceDTO.class))
                    .collect(Collectors.toList()));
        }

        if (agentDirectory.getPrompts() != null) {
            dto.setPrompts(agentDirectory.getPrompts().stream()
                    .map(prompt -> modelMapper.map(prompt, com.lfn.icip.icipwebeditor.model.dto.AgentPromptDTO.class))
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    /**
     * Convert DTO to entity.
     *
     * @param dto the agent directory DTO
     * @return the agent directory entity
     */
    private AgentDirectory convertToEntity(AgentDirectoryDTO dto) {
        AgentDirectory agentDirectory = modelMapper.map(dto, AgentDirectory.class);

        // Set timestamps for new entity
        agentDirectory.setCreatedAt(new java.sql.Timestamp(System.currentTimeMillis()));
        agentDirectory.setUpdatedAt(new java.sql.Timestamp(System.currentTimeMillis()));

        // Map nested collections
        mapNestedCollections(agentDirectory, dto);

        return agentDirectory;
    }

    /**
     * Update existing entity from DTO.
     *
     * @param agentDirectory the agent directory entity
     * @param dto the agent directory DTO
     */
    private void updateAgentFromDTO(AgentDirectory agentDirectory, AgentDirectoryDTO dto) {
        // Update basic fields
        agentDirectory.setAlias(dto.getAlias());
        agentDirectory.setType(dto.getType());
        agentDirectory.setDescription(dto.getDescription());
        agentDirectory.setConnectionDetails(dto.getConnectionDetails());
        agentDirectory.setOrganization(dto.getOrganization());
        agentDirectory.setLastModifiedBy(dto.getLastModifiedBy());
        agentDirectory.setLastModifiedDate(dto.getLastModifiedDate());
        agentDirectory.setCategory(dto.getCategory());
        agentDirectory.setInterfaceType(dto.getInterfaceType());
        agentDirectory.setVersion(dto.getVersion());
        agentDirectory.setCreator(dto.getCreator());
        agentDirectory.setExtrasJson(dto.getExtrasJson());
        agentDirectory.setUpdatedAt(new java.sql.Timestamp(System.currentTimeMillis()));

        // Update nested collections without clearing - just update existing data
        // This avoids unique constraint violations and transaction rollback issues
        updateNestedCollections(agentDirectory, dto);
    }

    /**
     * Update nested collections by updating existing items and adding new ones.
     * This properly handles updates without clearing everything, preventing constraint violations.
     *
     * @param agentDirectory the agent directory entity
     * @param dto the agent directory DTO
     */
    private void updateNestedCollections(AgentDirectory agentDirectory, AgentDirectoryDTO dto) {
        // Update modules
        updateModules(agentDirectory, dto);

        // Update skills
        updateSkills(agentDirectory, dto);

        // Update domains
        updateDomains(agentDirectory, dto);

        // Update locators
        updateLocators(agentDirectory, dto);

        // Update syncs
        updateSyncs(agentDirectory, dto);

        // Update publications
        updatePublications(agentDirectory, dto);

        // Update extensions
        updateExtensions(agentDirectory, dto);

        // Update selectors
        updateSelectors(agentDirectory, dto);

        // Update signatures
        updateSignatures(agentDirectory, dto);

        // Update tools
        updateTools(agentDirectory, dto);

        // Update resources
        updateResources(agentDirectory, dto);

        // Update prompts
        updatePrompts(agentDirectory, dto);
    }

    private void updateModules(AgentDirectory agentDirectory, AgentDirectoryDTO dto) {
        if (dto.getModules() != null) {
            // Remove modules not in DTO
            agentDirectory.getModules().removeIf(existing ->
                    dto.getModules().stream().noneMatch(dtoModule -> dtoModule.getName().equals(existing.getName()))
            );

            // Add or update modules
            dto.getModules().forEach(moduleDTO -> {
                AgentModule existing = agentDirectory.getModules().stream()
                        .filter(m -> m.getName().equals(moduleDTO.getName()))
                        .findFirst()
                        .orElse(null);

                if (existing != null) {
                    // Update existing module (name is already set, update other fields if any)
                    existing.setName(moduleDTO.getName());
                } else {
                    // Add new module
                    AgentModule module = new AgentModule();
                    module.setName(moduleDTO.getName());
                    agentDirectory.addModule(module);
                }
            });
        } else {
            agentDirectory.getModules().clear();
        }
    }

    private void updateSkills(AgentDirectory agentDirectory, AgentDirectoryDTO dto) {
        if (dto.getSkills() != null) {
            agentDirectory.getSkills().removeIf(existing ->
                    dto.getSkills().stream().noneMatch(dtoSkill -> dtoSkill.getName().equals(existing.getName()))
            );

            dto.getSkills().forEach(skillDTO -> {
                AgentSkill existing = agentDirectory.getSkills().stream()
                        .filter(s -> s.getName().equals(skillDTO.getName()))
                        .findFirst()
                        .orElse(null);

                if (existing == null) {
                    AgentSkill skill = new AgentSkill();
                    skill.setName(skillDTO.getName());
                    agentDirectory.addSkill(skill);
                }
            });
        } else {
            agentDirectory.getSkills().clear();
        }
    }

    private void updateDomains(AgentDirectory agentDirectory, AgentDirectoryDTO dto) {
        if (dto.getDomains() != null) {
            agentDirectory.getDomains().removeIf(existing ->
                    dto.getDomains().stream().noneMatch(dtoDomain -> dtoDomain.getName().equals(existing.getName()))
            );

            dto.getDomains().forEach(domainDTO -> {
                AgentDomain existing = agentDirectory.getDomains().stream()
                        .filter(d -> d.getName().equals(domainDTO.getName()))
                        .findFirst()
                        .orElse(null);

                if (existing != null) {
                    existing.setDescription(domainDTO.getDescription());
                } else {
                    AgentDomain domain = new AgentDomain();
                    domain.setName(domainDTO.getName());
                    domain.setDescription(domainDTO.getDescription());
                    agentDirectory.addDomain(domain);
                }
            });
        } else {
            agentDirectory.getDomains().clear();
        }
    }

    private void updateLocators(AgentDirectory agentDirectory, AgentDirectoryDTO dto) {
        if (dto.getLocators() != null) {
            agentDirectory.getLocators().removeIf(existing ->
                    dto.getLocators().stream().noneMatch(dtoLoc -> dtoLoc.getUrl().equals(existing.getUrl()))
            );

            dto.getLocators().forEach(locatorDTO -> {
                AgentLocator existing = agentDirectory.getLocators().stream()
                        .filter(l -> l.getUrl().equals(locatorDTO.getUrl()))
                        .findFirst()
                        .orElse(null);

                if (existing != null) {
                    existing.setLocatorType(locatorDTO.getLocatorType());
                } else {
                    AgentLocator locator = new AgentLocator();
                    locator.setLocatorType(locatorDTO.getLocatorType());
                    locator.setUrl(locatorDTO.getUrl());
                    agentDirectory.addLocator(locator);
                }
            });
        } else {
            agentDirectory.getLocators().clear();
        }
    }

    private void updateSyncs(AgentDirectory agentDirectory, AgentDirectoryDTO dto) {
        if (dto.getSyncs() != null) {
            agentDirectory.getSyncs().removeIf(existing ->
                    dto.getSyncs().stream().noneMatch(dtoSync -> dtoSync.getTarget().equals(existing.getTarget()))
            );

            dto.getSyncs().forEach(syncDTO -> {
                AgentSync existing = agentDirectory.getSyncs().stream()
                        .filter(s -> s.getTarget().equals(syncDTO.getTarget()))
                        .findFirst()
                        .orElse(null);

                if (existing != null) {
                    existing.setFrequency(syncDTO.getFrequency());
                    existing.setLastSync(syncDTO.getLastSync());
                } else {
                    AgentSync sync = modelMapper.map(syncDTO, AgentSync.class);
                    sync.setId(null);
                    agentDirectory.addSync(sync);
                }
            });
        } else {
            agentDirectory.getSyncs().clear();
        }
    }

    private void updatePublications(AgentDirectory agentDirectory, AgentDirectoryDTO dto) {
        if (dto.getPublications() != null) {
            agentDirectory.getPublications().removeIf(existing ->
                    dto.getPublications().stream().noneMatch(dtoPub -> dtoPub.getChannel().equals(existing.getChannel()))
            );

            dto.getPublications().forEach(publicationDTO -> {
                AgentPublication existing = agentDirectory.getPublications().stream()
                        .filter(p -> p.getChannel().equals(publicationDTO.getChannel()))
                        .findFirst()
                        .orElse(null);

                if (existing != null) {
                    existing.setPublishedDate(publicationDTO.getPublishedDate());
                    existing.setStatus(publicationDTO.getStatus());
                } else {
                    AgentPublication publication = modelMapper.map(publicationDTO, AgentPublication.class);
                    publication.setId(null);
                    agentDirectory.addPublication(publication);
                }
            });
        } else {
            agentDirectory.getPublications().clear();
        }
    }

    private void updateExtensions(AgentDirectory agentDirectory, AgentDirectoryDTO dto) {
        if (dto.getExtensions() != null) {
            agentDirectory.getExtensions().removeIf(existing ->
                    dto.getExtensions().stream().noneMatch(dtoExt ->
                            dtoExt.getKey() != null && dtoExt.getKey().equals(existing.getExtKey()))
            );

            dto.getExtensions().forEach(extensionDTO -> {
                if (extensionDTO.getKey() == null) {
                    return; // Skip if key is null
                }

                AgentExtension existing = agentDirectory.getExtensions().stream()
                        .filter(e -> e.getExtKey() != null && e.getExtKey().equals(extensionDTO.getKey()))
                        .findFirst()
                        .orElse(null);

                if (existing != null) {
                    existing.setExtValue(extensionDTO.getValue());
                    existing.setDescription(extensionDTO.getDescription());
                } else {
                    // Manually create extension to avoid ModelMapper field mapping issues
                    AgentExtension extension = new AgentExtension();
                    extension.setExtKey(extensionDTO.getKey());
                    extension.setExtValue(extensionDTO.getValue());
                    extension.setDescription(extensionDTO.getDescription());
                    agentDirectory.addExtension(extension);
                }
            });
        } else {
            agentDirectory.getExtensions().clear();
        }
    }

    private void updateSelectors(AgentDirectory agentDirectory, AgentDirectoryDTO dto) {
        if (dto.getSelectors() != null) {
            agentDirectory.getSelectors().removeIf(existing ->
                    dto.getSelectors().stream().noneMatch(dtoSel ->
                            dtoSel.getKey() != null && dtoSel.getKey().equals(existing.getSelKey()))
            );

            dto.getSelectors().forEach(selectorDTO -> {
                if (selectorDTO.getKey() == null) {
                    return; // Skip if key is null
                }

                AgentSelector existing = agentDirectory.getSelectors().stream()
                        .filter(s -> s.getSelKey() != null && s.getSelKey().equals(selectorDTO.getKey()))
                        .findFirst()
                        .orElse(null);

                if (existing != null) {
                    existing.setSelValue(selectorDTO.getValue());
                } else {
                    // Manually create selector to avoid ModelMapper field mapping issues
                    AgentSelector selector = new AgentSelector();
                    selector.setSelKey(selectorDTO.getKey());
                    selector.setSelValue(selectorDTO.getValue());
                    agentDirectory.addSelector(selector);
                }
            });
        } else {
            agentDirectory.getSelectors().clear();
        }
    }

    private void updateSignatures(AgentDirectory agentDirectory, AgentDirectoryDTO dto) {
        if (dto.getSignatures() != null) {
            agentDirectory.getSignatures().removeIf(existing ->
                    dto.getSignatures().stream().noneMatch(dtoSig ->
                            dtoSig.getAlgorithm().equals(existing.getAlgorithm()) &&
                                    dtoSig.getValue().equals(existing.getValue()))
            );

            dto.getSignatures().forEach(signatureDTO -> {
                AgentSignature existing = agentDirectory.getSignatures().stream()
                        .filter(s -> s.getAlgorithm().equals(signatureDTO.getAlgorithm()) &&
                                s.getValue().equals(signatureDTO.getValue()))
                        .findFirst()
                        .orElse(null);

                if (existing != null) {
                    existing.setCertificate(signatureDTO.getCertificate());
                } else {
                    AgentSignature signature = modelMapper.map(signatureDTO, AgentSignature.class);
                    signature.setId(null);
                    agentDirectory.addSignature(signature);
                }
            });
        } else {
            agentDirectory.getSignatures().clear();
        }
    }

    private void updateTools(AgentDirectory agentDirectory, AgentDirectoryDTO dto) {
        if (dto.getTools() != null) {
            agentDirectory.getTools().removeIf(existing ->
                    dto.getTools().stream().noneMatch(dtoTool -> dtoTool.getName().equals(existing.getName()))
            );

            dto.getTools().forEach(toolDTO -> {
                AgentTool existing = agentDirectory.getTools().stream()
                        .filter(t -> t.getName().equals(toolDTO.getName()))
                        .findFirst()
                        .orElse(null);

                if (existing != null) {
                    // Update existing tool
                    existing.setDescription(toolDTO.getDescription());

                    // Update parameters: remove old ones not in DTO
                    if (toolDTO.getParameters() != null) {
                        existing.getParameters().removeIf(existingParam ->
                                toolDTO.getParameters().stream()
                                        .noneMatch(dtoParam -> dtoParam.getName().equals(existingParam.getName()))
                        );

                        // Add or update parameters
                        toolDTO.getParameters().forEach(paramDTO -> {
                            AgentToolParameter existingParam = existing.getParameters().stream()
                                    .filter(p -> p.getName().equals(paramDTO.getName()))
                                    .findFirst()
                                    .orElse(null);

                            if (existingParam != null) {
                                // Update existing parameter
                                existingParam.setParamType(paramDTO.getType());
                                existingParam.setDescription(paramDTO.getDescription());
                            } else {
                                // Add new parameter
                                AgentToolParameter newParam = new AgentToolParameter();
                                newParam.setName(paramDTO.getName());
                                newParam.setParamType(paramDTO.getType());
                                newParam.setDescription(paramDTO.getDescription());
                                newParam.setTool(existing);
                                existing.getParameters().add(newParam);
                            }
                        });
                    } else {
                        // No parameters in DTO, clear all
                        existing.getParameters().clear();
                    }
                } else {
                    // Create new tool manually
                    AgentTool tool = new AgentTool();
                    tool.setName(toolDTO.getName());
                    tool.setDescription(toolDTO.getDescription());

                    // Add tool to agent directory
                    agentDirectory.addTool(tool);

                    // Add parameters if they exist
                    if (toolDTO.getParameters() != null && !toolDTO.getParameters().isEmpty()) {
                        toolDTO.getParameters().forEach(paramDTO -> {
                            AgentToolParameter parameter = new AgentToolParameter();
                            parameter.setName(paramDTO.getName());
                            parameter.setParamType(paramDTO.getType());
                            parameter.setDescription(paramDTO.getDescription());
                            parameter.setTool(tool);
                            tool.getParameters().add(parameter);
                        });
                    }
                }
            });
        } else {
            agentDirectory.getTools().clear();
        }
    }

    private void updateResources(AgentDirectory agentDirectory, AgentDirectoryDTO dto) {
        if (dto.getResources() != null) {
            agentDirectory.getResources().removeIf(existing ->
                    dto.getResources().stream().noneMatch(dtoRes -> dtoRes.getName().equals(existing.getName()))
            );

            dto.getResources().forEach(resourceDTO -> {
                AgentResource existing = agentDirectory.getResources().stream()
                        .filter(r -> r.getName().equals(resourceDTO.getName()))
                        .findFirst()
                        .orElse(null);

                if (existing != null) {
                    existing.setDescription(resourceDTO.getDescription());
                    existing.setUrl(resourceDTO.getUrl());
                } else {
                    AgentResource resource = modelMapper.map(resourceDTO, AgentResource.class);
                    resource.setId(null);
                    agentDirectory.addResource(resource);
                }
            });
        } else {
            agentDirectory.getResources().clear();
        }
    }

    private void updatePrompts(AgentDirectory agentDirectory, AgentDirectoryDTO dto) {
        if (dto.getPrompts() != null) {
            agentDirectory.getPrompts().removeIf(existing ->
                    dto.getPrompts().stream().noneMatch(dtoPrompt -> dtoPrompt.getName().equals(existing.getName()))
            );

            dto.getPrompts().forEach(promptDTO -> {
                AgentPrompt existing = agentDirectory.getPrompts().stream()
                        .filter(p -> p.getName().equals(promptDTO.getName()))
                        .findFirst()
                        .orElse(null);

                if (existing != null) {
                    existing.setDescription(promptDTO.getDescription());
                } else {
                    AgentPrompt prompt = modelMapper.map(promptDTO, AgentPrompt.class);
                    prompt.setId(null);
                    agentDirectory.addPrompt(prompt);
                }
            });
        } else {
            agentDirectory.getPrompts().clear();
        }
    }

    /**
     * Map nested collections from DTO to entity.
     *
     * @param agentDirectory the agent directory entity
     * @param dto the agent directory DTO
     */
    private void mapNestedCollections(AgentDirectory agentDirectory, AgentDirectoryDTO dto) {
        // Map modules
        if (dto.getModules() != null) {
            dto.getModules().forEach(moduleDTO -> {
                AgentModule module = modelMapper.map(moduleDTO, AgentModule.class);
                module.setId(null); // Force new entity to avoid duplicate key constraint
                agentDirectory.addModule(module);
            });
        }

        // Map skills
        if (dto.getSkills() != null) {
            dto.getSkills().forEach(skillDTO -> {
                AgentSkill skill = modelMapper.map(skillDTO, AgentSkill.class);
                skill.setId(null); // Force new entity to avoid duplicate key constraint
                agentDirectory.addSkill(skill);
            });
        }

        // Map domains
        if (dto.getDomains() != null) {
            dto.getDomains().forEach(domainDTO -> {
                AgentDomain domain = modelMapper.map(domainDTO, AgentDomain.class);
                domain.setId(null); // Force new entity to avoid duplicate key constraint
                agentDirectory.addDomain(domain);
            });
        }

        // Map locators
        if (dto.getLocators() != null) {
            dto.getLocators().forEach(locatorDTO -> {
                AgentLocator locator = modelMapper.map(locatorDTO, AgentLocator.class);
                locator.setId(null); // Force new entity to avoid duplicate key constraint
                agentDirectory.addLocator(locator);
            });
        }

        // Map syncs
        if (dto.getSyncs() != null) {
            dto.getSyncs().forEach(syncDTO -> {
                AgentSync sync = modelMapper.map(syncDTO, AgentSync.class);
                sync.setId(null); // Force new entity to avoid duplicate key constraint
                agentDirectory.addSync(sync);
            });
        }

        // Map publications
        if (dto.getPublications() != null) {
            dto.getPublications().forEach(publicationDTO -> {
                AgentPublication publication = modelMapper.map(publicationDTO, AgentPublication.class);
                publication.setId(null); // Force new entity to avoid duplicate key constraint
                agentDirectory.addPublication(publication);
            });
        }

        // Map extensions
        if (dto.getExtensions() != null) {
            dto.getExtensions().forEach(extensionDTO -> {
                // Manually create extension to avoid ModelMapper field mapping issues
                AgentExtension extension = new AgentExtension();
                extension.setExtKey(extensionDTO.getKey());
                extension.setExtValue(extensionDTO.getValue());
                extension.setDescription(extensionDTO.getDescription());
                agentDirectory.addExtension(extension);
            });
        }

        // Map selectors
        if (dto.getSelectors() != null) {
            dto.getSelectors().forEach(selectorDTO -> {
                // Manually create selector to avoid ModelMapper field mapping issues
                AgentSelector selector = new AgentSelector();
                selector.setSelKey(selectorDTO.getKey());
                selector.setSelValue(selectorDTO.getValue());
                agentDirectory.addSelector(selector);
            });
        }

        // Map signatures
        if (dto.getSignatures() != null) {
            dto.getSignatures().forEach(signatureDTO -> {
                AgentSignature signature = modelMapper.map(signatureDTO, AgentSignature.class);
                signature.setId(null); // Force new entity to avoid duplicate key constraint
                agentDirectory.addSignature(signature);
            });
        }

        // Map tools
        if (dto.getTools() != null) {
            dto.getTools().forEach(toolDTO -> {
                // Manually create tool to avoid ModelMapper transient reference issues
                AgentTool tool = new AgentTool();
                tool.setName(toolDTO.getName());
                tool.setDescription(toolDTO.getDescription());

                // Add tool to agent directory first
                agentDirectory.addTool(tool);

                // Then add parameters if they exist
                if (toolDTO.getParameters() != null && !toolDTO.getParameters().isEmpty()) {
                    toolDTO.getParameters().forEach(paramDTO -> {
                        AgentToolParameter parameter = new AgentToolParameter();
                        parameter.setName(paramDTO.getName());
                        parameter.setParamType(paramDTO.getType());
                        parameter.setDescription(paramDTO.getDescription());
                        parameter.setTool(tool); // Set the tool reference
                        tool.getParameters().add(parameter);
                    });
                }
            });
        }

        // Map resources
        if (dto.getResources() != null) {
            dto.getResources().forEach(resourceDTO -> {
                AgentResource resource = modelMapper.map(resourceDTO, AgentResource.class);
                resource.setId(null); // Force new entity to avoid duplicate key constraint
                agentDirectory.addResource(resource);
            });
        }

        // Map prompts
        if (dto.getPrompts() != null) {
            dto.getPrompts().forEach(promptDTO -> {
                AgentPrompt prompt = modelMapper.map(promptDTO, AgentPrompt.class);
                prompt.setId(null); // Force new entity to avoid duplicate key constraint
                agentDirectory.addPrompt(prompt);
            });
        }
    }

    @Override
    public List<AgentDirectory> getAllAgentsByTypeAndOrg(String project, Pageable paginate, String query,
                                                         String type, String interfacetype) {
        try {
            // Validate input
            if (project == null || project.trim().isEmpty()) {
                throw new IllegalArgumentException("Project/organization is required");
            }
            if (paginate == null) {
                throw new IllegalArgumentException("Pagination information is required");
            }

            logger.info("Fetching agents with pagination - project: {}, page: {}, size: {}, query: {}",
                    project, paginate.getPageNumber(), paginate.getPageSize(), query);

            // Handle project list
            List<String> projectList = new ArrayList<>();
            if (project.contains(",")) {
                projectList = Arrays.asList(project.split(","));
            } else {
                projectList.add(project);
            }

            logger.info("Processed project list: {}", projectList);

            // Fetch data from repository based on organization only
            List<AgentDirectory> agentList = agentDirectoryRepository.getAllAgentsByOrg(
                    projectList, paginate, query);

            logger.info("Retrieved {} agents from database", agentList.size());
            return agentList;

        } catch (IllegalArgumentException e) {
            logger.error("Validation error in getAllAgentsByTypeAndOrg: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error fetching agents: {}", e.getMessage(), e);
            throw new AgentDirectoryException("Failed to fetch agents", e);
        }
    }

    @Override
    public Long getAgentsCountByTypeAndOrg(String project, String query, String type, String interfacetype) {
        try {
            // Validate input
            if (project == null || project.trim().isEmpty()) {
                throw new IllegalArgumentException("Project/organization is required");
            }

            logger.info("Counting agents - project: {}, query: {}", project, query);

            // Handle project list
            List<String> projectList = new ArrayList<>();
            if (project.contains(",")) {
                projectList = Arrays.asList(project.split(","));
            } else {
                projectList.add(project);
            }

            // Get count from repository based on organization only
            Long count = agentDirectoryRepository.getAgentsCountByOrg(projectList, query);

            logger.info("Total agents count: {}", count);
            return count;

        } catch (IllegalArgumentException e) {
            logger.error("Validation error in getAgentsCountByTypeAndOrg: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error counting agents: {}", e.getMessage(), e);
            throw new AgentDirectoryException("Failed to count agents", e);
        }
    }


    @Override
    public List<Long> getAllPipelineIdsByOrgAndInterfaceType(String organization, String interfacetype) {
        try {
            // Validate input
            if (organization == null || organization.trim().isEmpty()) {
                throw new IllegalArgumentException("Organization is required");
            }
            if (interfacetype == null || interfacetype.trim().isEmpty()) {
                throw new IllegalArgumentException("Interface type is required");
            }

            logger.info("Fetching all pipeline IDs for organization: {} and interfacetype: {}", organization, interfacetype);

            // Fetch distinct pipeline IDs from repository filtered by org and interface type
            List<Long> pipelineIds = agentDirectoryRepository.findAllPipelineIdsByOrganizationAndInterfaceType(
                    organization, interfacetype);

            logger.info("Found {} pipeline IDs for organization: {} and interfacetype: {}",
                    pipelineIds != null ? pipelineIds.size() : 0, organization, interfacetype);
            return pipelineIds != null ? pipelineIds : List.of();

        } catch (IllegalArgumentException e) {
            logger.error("Validation error in getAllPipelineIdsByOrgAndInterfaceType: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error fetching pipeline IDs: {}", e.getMessage(), e);
            throw new AgentDirectoryException("Failed to fetch pipeline IDs", e);
        }
    }

}
