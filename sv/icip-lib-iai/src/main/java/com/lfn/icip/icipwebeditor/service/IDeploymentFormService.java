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

package com.lfn.icip.icipwebeditor.service;

import com.lfn.icip.icipwebeditor.model.dto.DeploymentFormDTO;

import java.time.LocalDateTime;
import java.util.List;

/**
 * The Interface IDeploymentFormService.
 * Service interface for managing deployment forms.
 */
public interface IDeploymentFormService {

    /**
     * Save deployment form.
     * Creates a new deployment form record.
     *
     * @param deploymentFormDTO the deployment form DTO
     * @return the saved deployment form DTO
     */
    DeploymentFormDTO saveDeploymentForm(DeploymentFormDTO deploymentFormDTO);

    /**
     * Update deployment form by id.
     * Updates an existing deployment form record.
     *
     * @param id the deployment form id
     * @param deploymentFormDTO the deployment form DTO with updated data
     * @return the updated deployment form DTO
     */
    DeploymentFormDTO updateDeploymentForm(Long id, DeploymentFormDTO deploymentFormDTO);

    /**
     * Get deployment form by id.
     *
     * @param id the deployment form id
     * @return the deployment form DTO
     */
    DeploymentFormDTO getDeploymentFormById(Long id);

    /**
     * Get deployment form by cname and org.
     *
     * @param cname the customer name
     * @param org the organization/project name
     * @return the deployment form DTO
     */
    DeploymentFormDTO getDeploymentFormByProjectAndCid(String cname, String org);

    /**
     * Delete deployment form by id.
     *
     * @param id the deployment form id
     */
    void deleteDeploymentForm(Long id);
}

