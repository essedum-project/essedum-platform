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

package com.lfn.icip.icipwebeditor.rest;

import com.lfn.ai.comm.lib.util.ICIPHeaderUtil;
import com.lfn.icip.icipwebeditor.model.dto.DeploymentFormDTO;
import com.lfn.icip.icipwebeditor.service.IDeploymentFormService;
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
 * The Class DeploymentFormController.
 * REST controller for managing Deployment Form operations.
 *
 * @author essedum
 */
@RestController
@Timed
@RequestMapping(path = "/${icip.pathPrefix}/deployment-form")
public class DeploymentFormController {

    /** The Constant ENTITY_NAME. */
    private static final String ENTITY_NAME = "deployment-form";

    /** The Constant logger. */
    private static final Logger logger = LoggerFactory.getLogger(DeploymentFormController.class);

    /** The deployment form service. */
    @Autowired
    private IDeploymentFormService deploymentFormService;

    /**
     * Save or update deployment form.
     * Checks if a deployment form exists for the given cname and org.
     * If exists, updates the existing record. Otherwise, creates a new one.
     *
     * POST /${icip.pathPrefix}/deployment-form/save
     *
     * @param deploymentFormDTO the deployment form DTO
     * @return the response entity with saved/updated deployment form
     * @throws URISyntaxException if URI syntax is invalid
     */
    @PostMapping("/save")
    @Transactional
    public ResponseEntity<?> saveOrUpdateDeploymentForm(@RequestBody DeploymentFormDTO deploymentFormDTO)
            throws URISyntaxException {

        logger.info("Save/Update deployment form for cname: {}, org: {}, agent: {}",
                deploymentFormDTO.getCname(), deploymentFormDTO.getOrg(), deploymentFormDTO.getAgentName());

        DeploymentFormDTO result = deploymentFormService.saveOrUpdateDeploymentForm(deploymentFormDTO);

        boolean isCreate = result.getCreatedAt() != null && result.getUpdatedAt() != null
                && result.getCreatedAt().equals(result.getUpdatedAt());

        if (isCreate) {
            logger.info("Successfully created deployment form with id: {}", result.getId());
            return ResponseEntity.created(new URI("/deployment-form/" + result.getId()))
                    .headers(ICIPHeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
                    .body(result);
        } else {
            logger.info("Successfully updated deployment form with id: {}", result.getId());

            return ResponseEntity.ok()
                    .headers(ICIPHeaderUtil.createEntityUpdateAlert(ENTITY_NAME, result.getId().toString()))
                    .body(result);
        }
    }

    /**
     * Get deployment form by cname and org.
     *
     * GET /${icip.pathPrefix}/deployment-form?cname={cname}&org={org}
     *
     * @param cname the customer name
     * @param org the organization/project name
     * @return the response entity with deployment form
     */
    @GetMapping
    public ResponseEntity<DeploymentFormDTO> getDeploymentFormByProjectAndCid(
            @RequestParam(name = "cname") String cname,
            @RequestParam(name = "org") String org) {
        logger.info("Fetching deployment form with cname: {} and org: {}", cname, org);

        DeploymentFormDTO result = deploymentFormService.getDeploymentFormByProjectAndCid(cname, org);
        return ResponseEntity.ok(result);
    }

    /**
     * Delete deployment form by id.
     *
     * DELETE /${icip.pathPrefix}/deployment-form/{id}
     *
     * @param id the deployment form id
     * @return the response entity
     */
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteDeploymentForm(@PathVariable Long id) {
        logger.info("Deleting deployment form with id: {}", id);

        deploymentFormService.deleteDeploymentForm(id);
        logger.info("Successfully deleted deployment form with id: {}", id);

        return ResponseEntity.ok()
                .headers(ICIPHeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString()))
                .build();
    }
}

