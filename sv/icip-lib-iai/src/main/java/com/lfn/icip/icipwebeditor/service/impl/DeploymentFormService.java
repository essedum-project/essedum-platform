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

package com.lfn.icip.icipwebeditor.service.impl;

import com.lfn.icip.icipwebeditor.model.DeploymentForm;
import com.lfn.icip.icipwebeditor.model.dto.DeploymentFormDTO;
import com.lfn.icip.icipwebeditor.repository.DeploymentFormRepository;
import com.lfn.icip.icipwebeditor.rest.exception.AgentDirectoryException;
import com.lfn.icip.icipwebeditor.service.IDeploymentFormService;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Optional;

/**
 * The Class DeploymentFormService.
 * Service implementation for managing deployment forms.
 */
@Service
@Transactional
public class DeploymentFormService implements IDeploymentFormService {

    private static final Logger logger = LoggerFactory.getLogger(DeploymentFormService.class);

    @Autowired
    private DeploymentFormRepository deploymentFormRepository;

    private final ModelMapper modelMapper = new ModelMapper();

    @Override
    public DeploymentFormDTO saveDeploymentForm(DeploymentFormDTO deploymentFormDTO) {
        try {
            logger.info("Saving deployment form for agent: {}", deploymentFormDTO.getAgentName());

            // Validate input
            if (deploymentFormDTO == null) {
                throw new IllegalArgumentException("Deployment form DTO cannot be null");
            }
            if (deploymentFormDTO.getAgentName() == null || deploymentFormDTO.getAgentName().trim().isEmpty()) {
                throw new IllegalArgumentException("Agent name is required");
            }
            if (deploymentFormDTO.getAgentVersion() == null || deploymentFormDTO.getAgentVersion().trim().isEmpty()) {
                throw new IllegalArgumentException("Agent version is required");
            }
            if (deploymentFormDTO.getDeploymentDatetime() == null) {
                throw new IllegalArgumentException("Deployment datetime is required");
            }

            // Convert DTO to Entity
            DeploymentForm deploymentForm = modelMapper.map(deploymentFormDTO, DeploymentForm.class);

            // Set timestamps
            Timestamp now = Timestamp.from(Instant.now());
            deploymentForm.setCreatedAt(now);
            deploymentForm.setUpdatedAt(now);

            // Save to database
            DeploymentForm savedForm = deploymentFormRepository.save(deploymentForm);
            logger.info("Successfully saved deployment form with id: {}", savedForm.getId());

            // Convert back to DTO and return
            return modelMapper.map(savedForm, DeploymentFormDTO.class);

        } catch (IllegalArgumentException e) {
            // Re-throw validation errors as-is (will be caught by global handler with 400 status)
            throw e;
        } catch (Exception e) {
            // Wrap any other exceptions in AgentDirectoryException
            logger.error("Failed to save deployment form", e);
            throw new AgentDirectoryException("Failed to save deployment form", e);
        }
    }

    @Override
    public DeploymentFormDTO updateDeploymentForm(Long id, DeploymentFormDTO deploymentFormDTO) {
        try {
            logger.info("Updating deployment form with id: {}", id);

            // Validate input
            if (id == null) {
                throw new IllegalArgumentException("Deployment form id cannot be null");
            }
            if (deploymentFormDTO == null) {
                throw new IllegalArgumentException("Deployment form DTO cannot be null");
            }

            // Find existing deployment form
            DeploymentForm existingForm = deploymentFormRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Deployment form not found with id: " + id));

            // Update fields from DTO
            if (deploymentFormDTO.getAgentName() != null) {
                existingForm.setAgentName(deploymentFormDTO.getAgentName());
            }
            if (deploymentFormDTO.getAgentVersion() != null) {
                existingForm.setAgentVersion(deploymentFormDTO.getAgentVersion());
            }
            if (deploymentFormDTO.getDeploymentEnvironment() != null) {
                existingForm.setDeploymentEnvironment(deploymentFormDTO.getDeploymentEnvironment());
            }
            if (deploymentFormDTO.getDeploymentDatetime() != null) {
                existingForm.setDeploymentDatetime(deploymentFormDTO.getDeploymentDatetime());
            }
            if (deploymentFormDTO.getBuildReleaseId() != null) {
                existingForm.setBuildReleaseId(deploymentFormDTO.getBuildReleaseId());
            }
            if (deploymentFormDTO.getAgentPackageLocation() != null) {
                existingForm.setAgentPackageLocation(deploymentFormDTO.getAgentPackageLocation());
            }
            if (deploymentFormDTO.getHashChecksum() != null) {
                existingForm.setHashChecksum(deploymentFormDTO.getHashChecksum());
            }
            if (deploymentFormDTO.getTargetNodesHosts() != null) {
                existingForm.setTargetNodesHosts(deploymentFormDTO.getTargetNodesHosts());
            }
            if (deploymentFormDTO.getImpactedServices() != null) {
                existingForm.setImpactedServices(deploymentFormDTO.getImpactedServices());
            }
            if (deploymentFormDTO.getDependencies() != null) {
                existingForm.setDependencies(deploymentFormDTO.getDependencies());
            }
            if (deploymentFormDTO.getHealthCheckStatus() != null) {
                existingForm.setHealthCheckStatus(deploymentFormDTO.getHealthCheckStatus());
            }
            if (deploymentFormDTO.getBackupConfirmation() != null) {
                existingForm.setBackupConfirmation(deploymentFormDTO.getBackupConfirmation());
            }
            if (deploymentFormDTO.getChangeFreezeCompliance() != null) {
                existingForm.setChangeFreezeCompliance(deploymentFormDTO.getChangeFreezeCompliance());
            }
            if (deploymentFormDTO.getSecurityPatchVerification() != null) {
                existingForm.setSecurityPatchVerification(deploymentFormDTO.getSecurityPatchVerification());
            }
            if (deploymentFormDTO.getApproverNameRole() != null) {
                existingForm.setApproverNameRole(deploymentFormDTO.getApproverNameRole());
            }
            if (deploymentFormDTO.getCabApprovalReference() != null) {
                existingForm.setCabApprovalReference(deploymentFormDTO.getCabApprovalReference());
            }
            if (deploymentFormDTO.getChangeRequestId() != null) {
                existingForm.setChangeRequestId(deploymentFormDTO.getChangeRequestId());
            }
            if (deploymentFormDTO.getRollbackProcedureReference() != null) {
                existingForm.setRollbackProcedureReference(deploymentFormDTO.getRollbackProcedureReference());
            }
            if (deploymentFormDTO.getPreviousStableAgentVersion() != null) {
                existingForm.setPreviousStableAgentVersion(deploymentFormDTO.getPreviousStableAgentVersion());
            }
            if (deploymentFormDTO.getSmokeTestStatus() != null) {
                existingForm.setSmokeTestStatus(deploymentFormDTO.getSmokeTestStatus());
            }
            if (deploymentFormDTO.getPerformanceTestSummary() != null) {
                existingForm.setPerformanceTestSummary(deploymentFormDTO.getPerformanceTestSummary());
            }
            if (deploymentFormDTO.getSslTlsCertificateCheck() != null) {
                existingForm.setSslTlsCertificateCheck(deploymentFormDTO.getSslTlsCertificateCheck());
            }
            if (deploymentFormDTO.getDrReadiness() != null) {
                existingForm.setDrReadiness(deploymentFormDTO.getDrReadiness());
            }
            if (deploymentFormDTO.getDataRetentionConfirmation() != null) {
                existingForm.setDataRetentionConfirmation(deploymentFormDTO.getDataRetentionConfirmation());
            }
            if (deploymentFormDTO.getAntivirusPatchConfirmation() != null) {
                existingForm.setAntivirusPatchConfirmation(deploymentFormDTO.getAntivirusPatchConfirmation());
            }
            if (deploymentFormDTO.getDeploymentOwner() != null) {
                existingForm.setDeploymentOwner(deploymentFormDTO.getDeploymentOwner());
            }
            if (deploymentFormDTO.getInfraSupportContacts() != null) {
                existingForm.setInfraSupportContacts(deploymentFormDTO.getInfraSupportContacts());
            }
            if (deploymentFormDTO.getAuditPocDetails() != null) {
                existingForm.setAuditPocDetails(deploymentFormDTO.getAuditPocDetails());
            }

            // Update timestamp
            existingForm.setUpdatedAt(Timestamp.from(Instant.now()));

            // Save updated entity
            DeploymentForm updatedForm = deploymentFormRepository.save(existingForm);
            logger.info("Successfully updated deployment form with id: {}", updatedForm.getId());

            // Convert back to DTO and return
            return modelMapper.map(updatedForm, DeploymentFormDTO.class);

        } catch (IllegalArgumentException e) {
            // Re-throw validation errors as-is
            throw e;
        } catch (Exception e) {
            // Wrap any other exceptions in AgentDirectoryException
            logger.error("Failed to update deployment form with id: {}", id, e);
            throw new AgentDirectoryException("Failed to update deployment form", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public DeploymentFormDTO getDeploymentFormById(Long id) {
        try {
            logger.info("Fetching deployment form with id: {}", id);

            DeploymentForm deploymentForm = deploymentFormRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Deployment form not found with id: " + id));

            return modelMapper.map(deploymentForm, DeploymentFormDTO.class);

        } catch (IllegalArgumentException e) {
            // Re-throw validation errors as-is
            throw e;
        } catch (Exception e) {
            // Wrap any other exceptions in AgentDirectoryException
            logger.error("Failed to fetch deployment form with id: {}", id, e);
            throw new AgentDirectoryException("Failed to fetch deployment form", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public DeploymentFormDTO getDeploymentFormByProjectAndCid(String cname, String org) {
        try {
            logger.info("Fetching deployment form with cname: {} and org: {}", cname, org);

            // Validate input
            if (cname == null || cname.trim().isEmpty()) {
                throw new IllegalArgumentException("Customer name cannot be null or empty");
            }
            if (org == null || org.trim().isEmpty()) {
                throw new IllegalArgumentException("Organization cannot be null or empty");
            }

            DeploymentForm deploymentForm = deploymentFormRepository.findByCnameAndOrg(cname, org)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Deployment form not found with cname: " + cname + " and org: " + org));

            return modelMapper.map(deploymentForm, DeploymentFormDTO.class);

        } catch (IllegalArgumentException e) {
            // Re-throw validation errors as-is
            throw e;
        } catch (Exception e) {
            // Wrap any other exceptions in AgentDirectoryException
            logger.error("Failed to fetch deployment form with cname: {} and org: {}", cname, org, e);
            throw new AgentDirectoryException("Failed to fetch deployment form", e);
        }
    }

    @Override
    public DeploymentFormDTO saveOrUpdateDeploymentForm(DeploymentFormDTO deploymentFormDTO) {
        try {
            logger.info("Save or update deployment form for cname: {}, org: {}",
                    deploymentFormDTO.getCname(), deploymentFormDTO.getOrg());

            // Validate required fields
            if (deploymentFormDTO == null) {
                throw new IllegalArgumentException("Deployment form DTO cannot be null");
            }
            if (deploymentFormDTO.getCname() == null || deploymentFormDTO.getCname().trim().isEmpty()) {
                throw new IllegalArgumentException("Customer name (cname) is required");
            }
            if (deploymentFormDTO.getOrg() == null || deploymentFormDTO.getOrg().trim().isEmpty()) {
                throw new IllegalArgumentException("Organization (org) is required");
            }
            if (deploymentFormDTO.getAgentName() == null || deploymentFormDTO.getAgentName().trim().isEmpty()) {
                throw new IllegalArgumentException("Agent name is required");
            }
            if (deploymentFormDTO.getAgentVersion() == null || deploymentFormDTO.getAgentVersion().trim().isEmpty()) {
                throw new IllegalArgumentException("Agent version is required");
            }
            if (deploymentFormDTO.getDeploymentDatetime() == null) {
                throw new IllegalArgumentException("Deployment datetime is required");
            }

            // Check if deployment form already exists for this cname, org and agent name
            Optional<DeploymentForm> existingFormOpt = deploymentFormRepository.findByCnameAndOrgAndAgentName(
                    deploymentFormDTO.getCname(), deploymentFormDTO.getOrg(), deploymentFormDTO.getAgentName());

            DeploymentFormDTO result;
            if (existingFormOpt.isPresent()) {
                // Update existing deployment form
                DeploymentForm existingForm = existingFormOpt.get();
                logger.info("Found existing deployment form with id: {}, updating...", existingForm.getId());

                deploymentFormDTO.setId(existingForm.getId());
                result = updateDeploymentForm(existingForm.getId(), deploymentFormDTO);
                logger.info("Successfully updated deployment form with id: {}", result.getId());
            } else {
                // Create new deployment form
                logger.info("No existing deployment form found, creating new...");
                result = saveDeploymentForm(deploymentFormDTO);
                logger.info("Successfully created deployment form with id: {}", result.getId());
            }

            return result;

        } catch (IllegalArgumentException e) {
            // Re-throw validation errors as-is
            throw e;
        } catch (Exception e) {
            // Wrap any other exceptions in AgentDirectoryException
            logger.error("Failed to save or update deployment form for cname: {}, org: {}",
                    deploymentFormDTO != null ? deploymentFormDTO.getCname() : "null",
                    deploymentFormDTO != null ? deploymentFormDTO.getOrg() : "null", e);
            throw new AgentDirectoryException("Failed to save or update deployment form", e);
        }
    }

    @Override
    public void deleteDeploymentForm(Long id) {
        try {
            logger.info("Deleting deployment form with id: {}", id);

            if (!deploymentFormRepository.existsById(id)) {
                throw new IllegalArgumentException("Deployment form not found with id: " + id);
            }

            deploymentFormRepository.deleteById(id);
            logger.info("Successfully deleted deployment form with id: {}", id);

        } catch (IllegalArgumentException e) {
            // Re-throw validation errors as-is
            throw e;
        } catch (Exception e) {
            // Wrap any other exceptions in AgentDirectoryException
            logger.error("Failed to delete deployment form with id: {}", id, e);
            throw new AgentDirectoryException("Failed to delete deployment form", e);
        }
    }
}

