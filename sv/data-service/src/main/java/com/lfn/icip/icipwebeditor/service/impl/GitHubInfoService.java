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

import com.lfn.icip.icipwebeditor.model.GitHubInfo;
import com.lfn.icip.icipwebeditor.model.dto.GitHubInfoDTO;
import com.lfn.icip.icipwebeditor.repository.GitHubInfoRepository;
import com.lfn.icip.icipwebeditor.rest.exception.AgentDirectoryException;
import com.lfn.icip.icipwebeditor.service.IGitHubInfoService;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;

/**
 * The Class GitHubInfoService.
 * Service implementation for managing GitHub repository information.
 */
@Service
@Transactional
public class GitHubInfoService implements IGitHubInfoService {

    private static final Logger logger = LoggerFactory.getLogger(GitHubInfoService.class);

    @Autowired
    private GitHubInfoRepository gitHubInfoRepository;

    private final ModelMapper modelMapper = new ModelMapper();

    @Override
    public GitHubInfoDTO saveGitHubInfo(GitHubInfoDTO gitHubInfoDTO) {
        try {
            logger.info("Saving GitHub info for cname: {}, org: {}", gitHubInfoDTO.getCname(), gitHubInfoDTO.getOrg());

            // Validate input
            if (gitHubInfoDTO == null) {
                throw new IllegalArgumentException("GitHub info DTO cannot be null");
            }
            if (gitHubInfoDTO.getCname() == null || gitHubInfoDTO.getCname().trim().isEmpty()) {
                throw new IllegalArgumentException("Component name (cname) is required");
            }
            if (gitHubInfoDTO.getOrg() == null || gitHubInfoDTO.getOrg().trim().isEmpty()) {
                throw new IllegalArgumentException("Organization (org) is required");
            }

            // Check if already exists
            if (gitHubInfoRepository.findByCnameAndOrg(gitHubInfoDTO.getCname(), gitHubInfoDTO.getOrg()).isPresent()) {
                throw new IllegalArgumentException("GitHub info already exists for cname: " + gitHubInfoDTO.getCname() + " and org: " + gitHubInfoDTO.getOrg());
            }

            // Convert DTO to Entity
            GitHubInfo gitHubInfo = modelMapper.map(gitHubInfoDTO, GitHubInfo.class);

            // Set timestamps
            Timestamp now = Timestamp.from(Instant.now());
            gitHubInfo.setCreatedAt(now);
            gitHubInfo.setUpdatedAt(now);

            // Save to database
            GitHubInfo savedInfo = gitHubInfoRepository.save(gitHubInfo);
            logger.info("Successfully saved GitHub info with id: {}", savedInfo.getId());

            // Convert back to DTO and return
            return modelMapper.map(savedInfo, GitHubInfoDTO.class);

        } catch (IllegalArgumentException e) {
            // Re-throw validation errors as-is (will be caught by global handler with 400 status)
            throw e;
        } catch (Exception e) {
            // Wrap any other exceptions in AgentDirectoryException
            logger.error("Failed to save GitHub info", e);
            throw new AgentDirectoryException("Failed to save GitHub info", e);
        }
    }

    @Override
    public GitHubInfoDTO updateGitHubInfo(String cname, String org, GitHubInfoDTO gitHubInfoDTO) {
        try {
            logger.info("Updating GitHub info for cname: {}, org: {}", cname, org);

            // Validate input
            if (cname == null || cname.trim().isEmpty()) {
                throw new IllegalArgumentException("Component name (cname) is required");
            }
            if (org == null || org.trim().isEmpty()) {
                throw new IllegalArgumentException("Organization (org) is required");
            }
            if (gitHubInfoDTO == null) {
                throw new IllegalArgumentException("GitHub info DTO cannot be null");
            }

            // Find existing GitHub info
            GitHubInfo existingInfo = gitHubInfoRepository.findByCnameAndOrg(cname, org)
                    .orElseThrow(() -> new IllegalArgumentException("GitHub info not found for cname: " + cname + " and org: " + org));

            // Check if cname or org is being updated and if it conflicts with another record
            boolean cnameChanged = gitHubInfoDTO.getCname() != null && !gitHubInfoDTO.getCname().equals(cname);
            boolean orgChanged = gitHubInfoDTO.getOrg() != null && !gitHubInfoDTO.getOrg().equals(org);

            if (cnameChanged || orgChanged) {
                String newCname = gitHubInfoDTO.getCname() != null ? gitHubInfoDTO.getCname() : cname;
                String newOrg = gitHubInfoDTO.getOrg() != null ? gitHubInfoDTO.getOrg() : org;

                // Check if the new combination already exists (and it's not the same record)
                var conflictingRecord = gitHubInfoRepository.findByCnameAndOrg(newCname, newOrg);
                if (conflictingRecord.isPresent() && !conflictingRecord.get().getId().equals(existingInfo.getId())) {
                    throw new IllegalArgumentException("GitHub info already exists for cname: " + newCname + " and org: " + newOrg);
                }
            }

            // Update fields from DTO
            if (gitHubInfoDTO.getCname() != null) {
                existingInfo.setCname(gitHubInfoDTO.getCname());
            }
            if (gitHubInfoDTO.getOrg() != null) {
                existingInfo.setOrg(gitHubInfoDTO.getOrg());
            }
            if (gitHubInfoDTO.getBname() != null) {
                existingInfo.setBname(gitHubInfoDTO.getBname());
            }
            if (gitHubInfoDTO.getRepo() != null) {
                existingInfo.setRepo(gitHubInfoDTO.getRepo());
            }
            if (gitHubInfoDTO.getGitUser() != null) {
                existingInfo.setGituser(gitHubInfoDTO.getGitUser());
            }
            if (gitHubInfoDTO.getCreatedBy() != null) {
                existingInfo.setCreatedBy(gitHubInfoDTO.getCreatedBy());
            }
            if (gitHubInfoDTO.getUpdatedBy() != null) {
                existingInfo.setUpdatedBy(gitHubInfoDTO.getUpdatedBy());
            }

            // Update timestamp
            existingInfo.setUpdatedAt(Timestamp.from(Instant.now()));

            // Save updated entity
            GitHubInfo updatedInfo = gitHubInfoRepository.save(existingInfo);
            logger.info("Successfully updated GitHub info with id: {}", updatedInfo.getId());

            // Convert back to DTO and return
            return modelMapper.map(updatedInfo, GitHubInfoDTO.class);

        } catch (IllegalArgumentException e) {
            // Re-throw validation errors as-is
            throw e;
        } catch (Exception e) {
            // Wrap any other exceptions in AgentDirectoryException
            logger.error("Failed to update GitHub info", e);
            throw new AgentDirectoryException("Failed to update GitHub info", e);
        }
    }

    @Override
    public GitHubInfoDTO getGitHubInfo(String cname, String org) {
        try {
            logger.info("Fetching GitHub info for cname: {}, org: {}", cname, org);

            // Validate input
            if (cname == null || cname.trim().isEmpty()) {
                throw new IllegalArgumentException("Component name (cname) is required");
            }
            if (org == null || org.trim().isEmpty()) {
                throw new IllegalArgumentException("Organization (org) is required");
            }

            // Find GitHub info
            GitHubInfo gitHubInfo = gitHubInfoRepository.findByCnameAndOrg(cname, org)
                    .orElseThrow(() -> new IllegalArgumentException("GitHub info not found for cname: " + cname + " and org: " + org));

            logger.info("Successfully fetched GitHub info with id: {}", gitHubInfo.getId());

            // Convert to DTO and return
            return modelMapper.map(gitHubInfo, GitHubInfoDTO.class);

        } catch (IllegalArgumentException e) {
            // Re-throw validation errors as-is
            throw e;
        } catch (Exception e) {
            // Wrap any other exceptions in AgentDirectoryException
            logger.error("Failed to fetch GitHub info", e);
            throw new AgentDirectoryException("Failed to fetch GitHub info", e);
        }
    }

    @Override
    public void deleteGitHubInfo(Long id) {
        try {
            logger.info("Deleting GitHub info with id: {}", id);

            // Validate input
            if (id == null) {
                throw new IllegalArgumentException("GitHub info id cannot be null");
            }

            // Check if exists
            if (!gitHubInfoRepository.existsById(id)) {
                throw new IllegalArgumentException("GitHub info not found with id: " + id);
            }

            // Delete
            gitHubInfoRepository.deleteById(id);
            logger.info("Successfully deleted GitHub info with id: {}", id);

        } catch (IllegalArgumentException e) {
            // Re-throw validation errors as-is
            throw e;
        } catch (Exception e) {
            // Wrap any other exceptions in AgentDirectoryException
            logger.error("Failed to delete GitHub info", e);
            throw new AgentDirectoryException("Failed to delete GitHub info", e);
        }
    }

    @Override
    public GitHubInfoDTO saveOrUpdateGitHubInfo(GitHubInfoDTO gitHubInfoDTO) {
        try {
            logger.info("Save or update GitHub info for cname: {}, org: {}", gitHubInfoDTO.getCname(), gitHubInfoDTO.getOrg());

            // Validate input
            if (gitHubInfoDTO == null) {
                throw new IllegalArgumentException("GitHub info DTO cannot be null");
            }
            if (gitHubInfoDTO.getCname() == null || gitHubInfoDTO.getCname().trim().isEmpty()) {
                throw new IllegalArgumentException("Component name (cname) is required");
            }
            if (gitHubInfoDTO.getOrg() == null || gitHubInfoDTO.getOrg().trim().isEmpty()) {
                throw new IllegalArgumentException("Organization (org) is required");
            }

            // Check if already exists
            var existingInfoOpt = gitHubInfoRepository.findByCnameAndOrg(gitHubInfoDTO.getCname(), gitHubInfoDTO.getOrg());

            GitHubInfo gitHubInfo;
            boolean isCreate = false;

            if (existingInfoOpt.isPresent()) {
                // Update existing record
                logger.info("Updating existing GitHub info for cname: {}, org: {}", gitHubInfoDTO.getCname(), gitHubInfoDTO.getOrg());
                gitHubInfo = existingInfoOpt.get();

                // Update fields
                if (gitHubInfoDTO.getBname() != null) {
                    gitHubInfo.setBname(gitHubInfoDTO.getBname());
                }
                if (gitHubInfoDTO.getRepo() != null) {
                    gitHubInfo.setRepo(gitHubInfoDTO.getRepo());
                }
                if (gitHubInfoDTO.getGitUser() != null) {
                    gitHubInfo.setGituser(gitHubInfoDTO.getGitUser());
                }
                if (gitHubInfoDTO.getCreatedBy() != null) {
                    gitHubInfo.setCreatedBy(gitHubInfoDTO.getCreatedBy());
                }
                if (gitHubInfoDTO.getUpdatedBy() != null) {
                    gitHubInfo.setUpdatedBy(gitHubInfoDTO.getUpdatedBy());
                }

                // Update timestamp
                gitHubInfo.setUpdatedAt(Timestamp.from(Instant.now()));

            } else {
                // Create new record
                logger.info("Creating new GitHub info for cname: {}, org: {}", gitHubInfoDTO.getCname(), gitHubInfoDTO.getOrg());
                isCreate = true;
                gitHubInfo = modelMapper.map(gitHubInfoDTO, GitHubInfo.class);

                // Set timestamps
                Timestamp now = Timestamp.from(Instant.now());
                gitHubInfo.setCreatedAt(now);
                gitHubInfo.setUpdatedAt(now);
            }

            // Save to database
            GitHubInfo savedInfo = gitHubInfoRepository.save(gitHubInfo);
            logger.info("Successfully {} GitHub info with id: {}", isCreate ? "created" : "updated", savedInfo.getId());

            // Convert back to DTO and return
            return modelMapper.map(savedInfo, GitHubInfoDTO.class);

        } catch (IllegalArgumentException e) {
            // Re-throw validation errors as-is
            throw e;
        } catch (Exception e) {
            // Wrap any other exceptions in AgentDirectoryException
            logger.error("Failed to save or update GitHub info", e);
            throw new AgentDirectoryException("Failed to save or update GitHub info", e);
        }
    }
}

