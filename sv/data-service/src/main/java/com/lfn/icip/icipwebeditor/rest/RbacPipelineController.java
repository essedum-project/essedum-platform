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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Hidden;

/**
 * RBAC Pipeline Approval Controller
 * Handles pipeline approval workflow
 */
@RestController
@Timed
@Hidden
@RequestMapping(path = "/api/aip/rbac")
public class RbacPipelineController {

	private static final Logger logger = LoggerFactory.getLogger(RbacPipelineController.class);

	// In-memory storage for pipeline approval status
	// Key: pipelineName, Value: approval status
	private static final Map<String, Map<String, Object>> pipelineApprovals = new ConcurrentHashMap<>();

	/**
	 * Submit a pipeline for approval
	 */
	@PostMapping("/pipeline-approval")
	public ResponseEntity<Map<String, Object>> submitForApproval(@RequestBody Map<String, String> request) {
		try {
			String pipelineName = request.get("pipelineName");
			String pipelineAlias = request.get("pipelineAlias");

			if (pipelineName == null || pipelineName.trim().isEmpty()) {
				return ResponseEntity.badRequest()
					.body(createErrorResponse("Pipeline name is required"));
			}

			logger.info("Submitting pipeline for approval: {} (alias: {})", pipelineName, pipelineAlias);

			// Store approval request
			Map<String, Object> approvalData = new HashMap<>();
			approvalData.put("pipelineName", pipelineName);
			approvalData.put("pipelineAlias", pipelineAlias);
			approvalData.put("status", "pending");
			approvalData.put("submittedAt", System.currentTimeMillis());

			pipelineApprovals.put(pipelineName, approvalData);

			Map<String, Object> response = new HashMap<>();
			response.put("success", true);
			response.put("message", "Pipeline submitted for approval");
			response.put("pipelineName", pipelineName);
			response.put("status", "pending");

			logger.info("Pipeline {} successfully submitted for approval", pipelineName);

			return ResponseEntity.ok(response);
		} catch (Exception e) {
			logger.error("Error submitting pipeline for approval", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(createErrorResponse("Error submitting pipeline for approval: " + e.getMessage()));
		}
	}

	/**
	 * Get list of approved pipelines
	 */
	@GetMapping("/pipeline-approved")
	public ResponseEntity<Map<String, Object>> getApprovedPipelines() {
		try {
			List<Map<String, Object>> approvedList = new ArrayList<>();
			
			// For now, return empty list as approval is a manual process
			// In a real implementation, this would check against an approval database
			
			Map<String, Object> response = new HashMap<>();
			response.put("success", true);
			response.put("data", approvedList);
			response.put("count", approvedList.size());

			return ResponseEntity.ok(response);
		} catch (Exception e) {
			logger.error("Error fetching approved pipelines", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(createErrorResponse("Error fetching approved pipelines: " + e.getMessage()));
		}
	}

	/**
	 * Get list of pipelines pending approval (draft/create state)
	 */
	@GetMapping("/pipeline-create")
	public ResponseEntity<Map<String, Object>> getPendingApprovalPipelines() {
		try {
			List<Map<String, Object>> pendingList = new ArrayList<>();

			// Get all pipelines with pending status
			for (Map.Entry<String, Map<String, Object>> entry : pipelineApprovals.entrySet()) {
				Map<String, Object> approval = entry.getValue();
				if ("pending".equals(approval.get("status"))) {
					Map<String, Object> item = new HashMap<>();
					item.put("name", entry.getKey());
					item.put("pipelineAlias", approval.get("pipelineAlias"));
					item.put("status", approval.get("status"));
					item.put("submittedAt", approval.get("submittedAt"));
					pendingList.add(item);
				}
			}

			Map<String, Object> response = new HashMap<>();
			response.put("success", true);
			response.put("data", pendingList);
			response.put("count", pendingList.size());

			logger.debug("Returning {} pending approval pipelines", pendingList.size());

			return ResponseEntity.ok(response);
		} catch (Exception e) {
			logger.error("Error fetching pending approval pipelines", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(createErrorResponse("Error fetching pending approval pipelines: " + e.getMessage()));
		}
	}

	/**
	 * Create error response
	 */
	private Map<String, Object> createErrorResponse(String message) {
		Map<String, Object> response = new HashMap<>();
		response.put("success", false);
		response.put("message", message);
		return response;
	}
}
