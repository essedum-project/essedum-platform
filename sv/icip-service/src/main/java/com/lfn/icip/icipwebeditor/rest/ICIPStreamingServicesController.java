/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

package com.lfn.icip.icipwebeditor.rest;

import java.io.IOException;
import java.sql.SQLException;

import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.api.errors.InvalidRemoteException;
import org.eclipse.jgit.api.errors.TransportException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lfn.ai.comm.lib.util.ICIPHeaderUtil;
import com.lfn.icip.icipwebeditor.service.IICIPStreamingServiceService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Hidden;

// TODO: Auto-generated Javadoc
/**
 * The Class ICIPStreamingServicesController.
 *
 * @author essedum
 */
@RestController
@Timed
@Hidden
@RequestMapping(path = "/${icip.pathPrefix}/streamingServices")
public class ICIPStreamingServicesController {

	/** The Constant ENTITY_NAME. */
	private static final String ENTITY_NAME = "streamingServices";

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPStreamingServicesController.class);

	/** The streaming services service. */
	@Autowired
	private IICIPStreamingServiceService streamingServicesService;

	
	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;

	/**
	 * Delete streaming services.
	 *
	 * @param id the id
	 * @return the response entity
	 * @throws SQLException the SQL exception
	 * @throws GitAPIException 
	 * @throws IOException 
	 * @throws TransportException 
	 * @throws InvalidRemoteException 
	 */
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<Void> deleteStreamingServices(@PathVariable(name = "id") Integer id) throws SQLException, InvalidRemoteException, TransportException, IOException, GitAPIException {
		try {
			streamingServicesService.delete(id);
			logger.info("Deleting streaming service by Id : {}", id);
			return ResponseEntity.ok().headers(ICIPHeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString()))
				.build();
		} catch (Exception e) {
			logger.error("Error deleting streaming service with id: {}", id, e);
			return ResponseEntity.status(500).build();
		}
	}

	// ==================== PIPELINE APPROVAL ENDPOINTS ====================
	private static final java.util.Map<String, java.util.Map<String, Object>> pipelineApprovals = new java.util.concurrent.ConcurrentHashMap<>();

	@org.springframework.web.bind.annotation.PostMapping("/approval/submit")
	public ResponseEntity<java.util.Map<String, Object>> submitPipelineForApproval(@org.springframework.web.bind.annotation.RequestBody java.util.Map<String, String> request) {
		try {
			String pipelineName = request.get("pipelineName");
			String pipelineAlias = request.get("pipelineAlias");

			if (pipelineName == null || pipelineName.trim().isEmpty()) {
				logger.warn("Pipeline name is required");
				return ResponseEntity.badRequest().body(createErrorResponse("Pipeline name is required"));
			}

			logger.info("Pipeline submitted for approval: {}", pipelineName);

			java.util.Map<String, Object> approvalData = new java.util.HashMap<>();
			approvalData.put("pipelineName", pipelineName);
			approvalData.put("pipelineAlias", pipelineAlias);
			approvalData.put("status", "pending");
			approvalData.put("submittedAt", System.currentTimeMillis());

			pipelineApprovals.put(pipelineName, approvalData);

			java.util.Map<String, Object> response = new java.util.HashMap<>();
			response.put("success", true);
			response.put("message", "Pipeline submitted for approval");
			response.put("pipelineName", pipelineName);
			response.put("status", "pending");

			return ResponseEntity.ok(response);
		} catch (Exception e) {
			logger.error("Error submitting pipeline for approval", e);
			return ResponseEntity.status(500).body(createErrorResponse("Error: " + e.getMessage()));
		}
	}

	@org.springframework.web.bind.annotation.GetMapping("/approval/approved-list")
	public ResponseEntity<java.util.Map<String, Object>> getApprovedPipelines() {
		try {
			java.util.List<java.util.Map<String, Object>> approvedList = new java.util.ArrayList<>();
			java.util.Map<String, Object> response = new java.util.HashMap<>();
			response.put("success", true);
			response.put("data", approvedList);
			response.put("count", 0);
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			logger.error("Error fetching approved pipelines", e);
			return ResponseEntity.status(500).body(createErrorResponse("Error: " + e.getMessage()));
		}
	}

	@org.springframework.web.bind.annotation.GetMapping("/approval/pending-list")
	public ResponseEntity<java.util.Map<String, Object>> getPendingPipelines() {
		try {
			java.util.List<java.util.Map<String, Object>> pendingList = new java.util.ArrayList<>();

			for (java.util.Map.Entry<String, java.util.Map<String, Object>> entry : pipelineApprovals.entrySet()) {
				java.util.Map<String, Object> approval = entry.getValue();
				if ("pending".equals(approval.get("status"))) {
					java.util.Map<String, Object> item = new java.util.HashMap<>();
					item.put("name", entry.getKey());
					item.put("pipelineAlias", approval.get("pipelineAlias"));
					item.put("status", approval.get("status"));
					item.put("submittedAt", approval.get("submittedAt"));
					pendingList.add(item);
				}
			}

			java.util.Map<String, Object> response = new java.util.HashMap<>();
			response.put("success", true);
			response.put("data", pendingList);
			response.put("count", pendingList.size());
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			logger.error("Error fetching pending pipelines", e);
			return ResponseEntity.status(500).body(createErrorResponse("Error: " + e.getMessage()));
		}
	}

	private java.util.Map<String, Object> createErrorResponse(String message) {
		java.util.Map<String, Object> response = new java.util.HashMap<>();
		response.put("success", false);
		response.put("message", message);
		return response;
	}
}