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

package com.lfn.icip.icipwebeditor.rest;

import com.lfn.ai.comm.lib.util.ICIPHeaderUtil;
import com.lfn.icip.icipwebeditor.model.dto.GitHubInfoDTO;
import com.lfn.icip.icipwebeditor.service.IGitHubInfoService;
import io.micrometer.core.annotation.Timed;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;

/**
 * The Class GitHubInfoController.
 * REST controller for managing GitHub repository information.
 *
 * @author essedum
 */
@RestController
@Timed
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:8080", "http://localhost:8087",
        "https://langflow.az.ad.idemo-ppc.com", "https://essedum.az.ad.idemo-ppc.com"},
        allowedHeaders = {"*", "Authorization", "Content-Type", "Project", "ProjectName", "roleId", "roleName", "X-Requested-With", "charset"},
        allowCredentials = "true",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
@RequestMapping(path = "/${icip.pathPrefix}/git-configs")
public class GitHubInfoController {

    /** The Constant ENTITY_NAME. */
    private static final String ENTITY_NAME = "github-info";

    /** The Constant logger. */
    private static final Logger logger = LoggerFactory.getLogger(GitHubInfoController.class);

    /** The GitHub info service. */
    @Autowired
    private IGitHubInfoService gitHubInfoService;

    /**
     * Save or update GitHub info.
     * If a record exists with the given cname and org, it will be updated.
     * Otherwise, a new record will be created.
     *
     * POST /${icip.pathPrefix}/git-configs/save
     *
     * @param gitHubInfoDTO the GitHub info DTO
     * @return the response entity with created/updated GitHub info
     * @throws URISyntaxException if URI syntax is invalid
     */
    @PostMapping("/save")
    @Transactional
    public ResponseEntity<?> createGitHubInfo(@RequestBody GitHubInfoDTO gitHubInfoDTO)
            throws URISyntaxException {

        logger.info("Save or update GitHub info for cname: {}, org: {}", gitHubInfoDTO.getCname(), gitHubInfoDTO.getOrg());

        GitHubInfoDTO result = gitHubInfoService.saveOrUpdateGitHubInfo(gitHubInfoDTO);

        // Check if it was a create or update based on timestamps
        boolean isCreate = result.getCreatedAt() != null && result.getUpdatedAt() != null
                && result.getCreatedAt().equals(result.getUpdatedAt());

        if (isCreate) {
            logger.info("Successfully created GitHub info with id: {}", result.getId());
            return ResponseEntity.created(new URI("/git-configs/" + result.getId()))
                    .headers(ICIPHeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
                    .body(result);
        } else {
            logger.info("Successfully updated GitHub info with id: {}", result.getId());
            return ResponseEntity.ok()
                    .headers(ICIPHeaderUtil.createEntityUpdateAlert(ENTITY_NAME, result.getId().toString()))
                    .body(result);
        }
    }

    /**
     * Update GitHub info.
     * Updates an existing GitHub repository information record identified by cname and org.
     *
     * PUT /${icip.pathPrefix}/github-info?cname={cname}&org={org}
     *
     * @param cname the repository/component name (request param)
     * @param org the organization name (request param)
     * @param gitHubInfoDTO the GitHub info DTO with updated data
     * @return the response entity with updated GitHub info
     */
    @PutMapping("/update")
    @Transactional
    public ResponseEntity<?> updateGitHubInfo(
            @RequestParam("cname") String cname,
            @RequestParam("org") String org,
            @RequestBody GitHubInfoDTO gitHubInfoDTO) {

        logger.info("Updating GitHub info for cname: {}, org: {}", cname, org);

        GitHubInfoDTO result = gitHubInfoService.updateGitHubInfo(cname, org, gitHubInfoDTO);

        logger.info("Successfully updated GitHub info with id: {}", result.getId());
        return ResponseEntity.ok()
                .headers(ICIPHeaderUtil.createEntityUpdateAlert(ENTITY_NAME, result.getId().toString()))
                .body(result);
    }

    /**
     * Get GitHub info.
     * Retrieves GitHub repository information by cname and org.
     *
     * GET /${icip.pathPrefix}/github-info?cname={cname}&org={org}
     *
     * @param cname the repository/component name (request param)
     * @param org the organization name (request param)
     * @return the response entity with GitHub info
     */
    @GetMapping
    public ResponseEntity<?> getGitHubInfo(
            @RequestParam("cname") String cname,
            @RequestParam("org") String org) {

        logger.info("Fetching GitHub info for cname: {}, org: {}", cname, org);

        GitHubInfoDTO result = gitHubInfoService.getGitHubInfo(cname, org);

        logger.info("Successfully fetched GitHub info with id: {}", result.getId());
        return ResponseEntity.ok(result);
    }

    /**
     * Delete GitHub info.
     * Deletes a GitHub repository information record by id.
     *
     * DELETE /${icip.pathPrefix}/github-info/{id}
     *
     * @param id the GitHub info id
     * @return the response entity with no content
     */
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteGitHubInfo(@PathVariable Long id) {

        logger.info("Deleting GitHub info with id: {}", id);

        gitHubInfoService.deleteGitHubInfo(id);

        logger.info("Successfully deleted GitHub info with id: {}", id);
        return ResponseEntity.noContent()
                .headers(ICIPHeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString()))
                .build();
    }
}

