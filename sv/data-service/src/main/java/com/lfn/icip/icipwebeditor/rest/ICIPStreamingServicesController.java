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
import com.lfn.icip.icipwebeditor.service.impl.ApprovalWorkflowService;

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

	/** Approval workflow service */
	@Autowired
	private ApprovalWorkflowService approvalWorkflowService;

	/** The streaming services repository */
	@Autowired
	private com.lfn.icip.icipwebeditor.repository.ICIPStreamingServicesRepository streamingServicesRepository;
	
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

	@org.springframework.web.bind.annotation.PostMapping("/approval/submit")
	public ResponseEntity<java.util.Map<String, Object>> submitForApproval(
			@org.springframework.web.bind.annotation.RequestBody java.util.Map<String, Object> request,
			jakarta.servlet.http.HttpServletRequest httpRequest) {
		java.util.Map<String, Object> response = new java.util.HashMap<>();
		try {
			// Extract from request body
			if (!request.containsKey("resourceId") || !request.containsKey("projectId")) {
				response.put("success", false);
				response.put("message", "Missing resourceId or projectId");
				logger.warn("Submit approval request missing required fields");
				return ResponseEntity.status(400).body(response);
			}

			Integer resourceId = ((Number) request.get("resourceId")).intValue();
			Integer projectId = ((Number) request.get("projectId")).intValue();

			// Get user from context - try multiple header names for compatibility
			String currentUser = httpRequest.getHeader("user-login");
			if (currentUser == null || currentUser.isEmpty()) {
				currentUser = httpRequest.getHeader("User-Login");
			}
			if (currentUser == null || currentUser.isEmpty()) {
				currentUser = "unknown";
			}

			String userRank = httpRequest.getHeader("rank");
			if (userRank == null || userRank.isEmpty()) {
				userRank = httpRequest.getHeader("roleId");
			}

			logger.info("[Approval] Submitting resource {} for project approval. User: {}, Rank: {}, ProjectId: {}", 
				resourceId, currentUser, userRank, projectId);

			// Validate resource exists
			com.lfn.icip.icipwebeditor.model.ICIPStreamingServices resource = 
				streamingServicesRepository.findById(resourceId).orElse(null);
			if (resource == null) {
				response.put("success", false);
				response.put("message", "Resource not found with ID: " + resourceId);
				logger.warn("Resource not found: {}", resourceId);
				return ResponseEntity.status(404).body(response);
			}

			logger.debug("[Approval] Found resource. Name: {}, CreatedBy: {}, CurrentStatus: {}", 
				resource.getName(), resource.getCreatedBy(), resource.getApprovalStatus());

			// Call approval service
			com.lfn.icip.icipwebeditor.model.ICIPStreamingServices updatedResource = 
				approvalWorkflowService.submitForProjectApproval(resourceId, projectId, currentUser);

			response.put("success", true);
			response.put("message", "Resource submitted for project approval");
			response.put("resourceId", updatedResource.getCid());
			response.put("status", updatedResource.getApprovalStatus());

			logger.info("[Approval] Successfully submitted resource {} for approval", resourceId);
			return ResponseEntity.ok(response);
			
		} catch (IllegalAccessError e) {
			logger.warn("[Approval] Authorization error: {}", e.getMessage());
			response.put("success", false);
			response.put("message", e.getMessage());
			return ResponseEntity.status(403).body(response);
			
		} catch (IllegalStateException e) {
			logger.warn("[Approval] State error: {}", e.getMessage());
			response.put("success", false);
			response.put("message", e.getMessage());
			return ResponseEntity.status(400).body(response);
			
		} catch (IllegalArgumentException e) {
			logger.warn("[Approval] Argument error: {}", e.getMessage());
			response.put("success", false);
			response.put("message", e.getMessage());
			return ResponseEntity.status(400).body(response);
			
		} catch (Exception e) {
			logger.error("[Approval] Unexpected error submitting for approval", e);
			response.put("success", false);
			response.put("message", "Error submitting for approval: " + e.getMessage());
			return ResponseEntity.status(500).body(response);
		}
	}

	@org.springframework.web.bind.annotation.PostMapping("/approval/project/approve/{resourceId}")
	public ResponseEntity<java.util.Map<String, Object>> approveProjectApproval(
			@org.springframework.web.bind.annotation.PathVariable Integer resourceId,
			jakarta.servlet.http.HttpServletRequest httpRequest) {
		java.util.Map<String, Object> response = new java.util.HashMap<>();
		try {
			String projectIdHeader = httpRequest.getHeader("Project");
			Integer projectId = projectIdHeader != null ? Integer.parseInt(projectIdHeader) : null;
			
			String userRank = httpRequest.getHeader("rank");
			if (userRank == null || userRank.isEmpty()) {
				userRank = httpRequest.getHeader("roleId");
			}
			if (userRank == null || userRank.isEmpty()) {
				userRank = "2"; // Default to project admin rank
			}
			userRank = userRank.trim();

			logger.info("[Approval] Approving resource {} at project level. Rank: {}, ProjectId: {}", resourceId, userRank, projectId);

			com.lfn.icip.icipwebeditor.model.ICIPStreamingServices resource = approvalWorkflowService.approveProjectApproval(resourceId, projectId, userRank);

			response.put("success", true);
			response.put("message", "Resource approved at project level");
			response.put("resourceId", resource.getCid());
			response.put("status", resource.getApprovalStatus());

			logger.info("[Approval] Successfully approved resource {}", resourceId);
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			logger.error("[Approval] Error approving project approval for resource {}", resourceId, e);
			response.put("success", false);
			response.put("message", e.getMessage());
			return ResponseEntity.status(400).body(response);
		}
	}

	@org.springframework.web.bind.annotation.PostMapping("/approval/project/reject/{resourceId}")
	public ResponseEntity<java.util.Map<String, Object>> rejectProjectApproval(
			@org.springframework.web.bind.annotation.PathVariable Integer resourceId,
			jakarta.servlet.http.HttpServletRequest httpRequest) {
		java.util.Map<String, Object> response = new java.util.HashMap<>();
		try {
			String projectIdHeader = httpRequest.getHeader("Project");
			Integer projectId = projectIdHeader != null ? Integer.parseInt(projectIdHeader) : null;
			
			String userRank = httpRequest.getHeader("rank");
			if (userRank == null || userRank.isEmpty()) {
				userRank = httpRequest.getHeader("roleId");
			}
			if (userRank == null || userRank.isEmpty()) {
				userRank = "2";
			}
			userRank = userRank.trim();

			logger.info("[Approval] Rejecting project approval for resource {}. Rank: {}", resourceId, userRank);

			com.lfn.icip.icipwebeditor.model.ICIPStreamingServices resource = approvalWorkflowService.rejectProjectApproval(resourceId, userRank);

			response.put("success", true);
			response.put("message", "Resource rejected at project level");
			response.put("resourceId", resource.getCid());
			response.put("status", resource.getApprovalStatus());

			logger.info("[Approval] Successfully rejected project approval for resource {}", resourceId);
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			logger.error("[Approval] Error rejecting project approval for resource {}", resourceId, e);
			response.put("success", false);
			response.put("message", e.getMessage());
			return ResponseEntity.status(400).body(response);
		}
	}

	@org.springframework.web.bind.annotation.PostMapping("/approval/org/submit")
	public ResponseEntity<java.util.Map<String, Object>> submitForOrgApproval(
			@org.springframework.web.bind.annotation.RequestBody java.util.Map<String, Object> request,
			jakarta.servlet.http.HttpServletRequest httpRequest) {
		java.util.Map<String, Object> response = new java.util.HashMap<>();
		try {
			// Extract from request body
			if (!request.containsKey("resourceId") || !request.containsKey("organizationId")) {
				response.put("success", false);
				response.put("message", "Missing resourceId or organizationId");
				return ResponseEntity.status(400).body(response);
			}
			
			Integer resourceId = ((Number) request.get("resourceId")).intValue();
			Integer organizationId = ((Number) request.get("organizationId")).intValue();

			String userRank = httpRequest.getHeader("rank");
			if (userRank == null || userRank.isEmpty()) {
				userRank = httpRequest.getHeader("roleId");
			}
			if (userRank == null || userRank.isEmpty()) {
				userRank = "2"; // Default to project admin
			}
			userRank = userRank.trim();

			logger.info("[Approval] Submitting resource {} to org {} for approval. Rank: {}", resourceId, organizationId, userRank);

			com.lfn.icip.icipwebeditor.model.ICIPStreamingServices resource = approvalWorkflowService.submitForOrgApproval(resourceId, organizationId, userRank);

			response.put("success", true);
			response.put("message", "Resource submitted to organization for approval");
			response.put("resourceId", resource.getCid());
			response.put("status", resource.getApprovalStatus());

			logger.info("[Approval] Successfully submitted resource {} to org {}", resourceId, organizationId);
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			logger.error("[Approval] Error submitting org approval for resource {}", request.get("resourceId"), e);
			response.put("success", false);
			response.put("message", e.getMessage());
			return ResponseEntity.status(400).body(response);
		}
	}

	@org.springframework.web.bind.annotation.PostMapping("/approval/org/approve/{resourceId}")
	public ResponseEntity<java.util.Map<String, Object>> approveOrgApproval(
			@org.springframework.web.bind.annotation.PathVariable Integer resourceId,
			jakarta.servlet.http.HttpServletRequest httpRequest) {
		java.util.Map<String, Object> response = new java.util.HashMap<>();
		try {
			String projectIdHeader = httpRequest.getHeader("Project");
			Integer projectId = projectIdHeader != null ? Integer.parseInt(projectIdHeader) : null;
			
			String userRank = httpRequest.getHeader("rank");
			if (userRank == null || userRank.isEmpty()) {
				userRank = httpRequest.getHeader("roleId");
			}
			if (userRank == null || userRank.isEmpty()) {
				userRank = "3"; // Default to org admin rank
			}
			userRank = userRank.trim();

			logger.info("[Approval] Approving org approval for resource {}. Rank: {}", resourceId, userRank);

			com.lfn.icip.icipwebeditor.model.ICIPStreamingServices resource = approvalWorkflowService.approveOrgApproval(resourceId, userRank);

			response.put("success", true);
			response.put("message", "Resource published to organization");
			response.put("resourceId", resource.getCid());
			response.put("status", resource.getApprovalStatus());

			logger.info("[Approval] Successfully published resource {} to org", resourceId);
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			logger.error("[Approval] Error approving org approval for resource {}", resourceId, e);
			response.put("success", false);
			response.put("message", e.getMessage());
			return ResponseEntity.status(400).body(response);
		}
	}

	@org.springframework.web.bind.annotation.PostMapping("/approval/org/reject/{resourceId}")
	public ResponseEntity<java.util.Map<String, Object>> rejectOrgApproval(
			@org.springframework.web.bind.annotation.PathVariable Integer resourceId,
			jakarta.servlet.http.HttpServletRequest httpRequest) {
		java.util.Map<String, Object> response = new java.util.HashMap<>();
		try {
			String userRank = httpRequest.getHeader("rank");
			if (userRank == null || userRank.isEmpty()) {
				userRank = httpRequest.getHeader("roleId");
			}
			if (userRank == null || userRank.isEmpty()) {
				userRank = "3"; // Default to org admin
			}
			userRank = userRank.trim();

			logger.info("[Approval] Rejecting org approval for resource {}. Rank: {}", resourceId, userRank);

			com.lfn.icip.icipwebeditor.model.ICIPStreamingServices resource = approvalWorkflowService.rejectOrgApproval(resourceId, userRank);

			response.put("success", true);
			response.put("message", "Resource rejected at organization level");
			response.put("resourceId", resource.getCid());
			response.put("status", resource.getApprovalStatus());

			logger.info("[Approval] Successfully rejected org approval for resource {}", resourceId);
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			logger.error("[Approval] Error rejecting org approval for resource {}", resourceId, e);
			response.put("success", false);
			response.put("message", e.getMessage());
			return ResponseEntity.status(400).body(response);
		}
	}

	@org.springframework.web.bind.annotation.GetMapping("/approval/project-admin/list")
	public ResponseEntity<java.util.Map<String, Object>> getProjectAdminApprovals(
			@org.springframework.web.bind.annotation.RequestParam Integer projectId,
			jakarta.servlet.http.HttpServletRequest httpRequest) {
		try {
			String userRank = httpRequest.getHeader("roleId");
			if (userRank == null) {
				userRank = "0";
			}
			userRank = userRank.trim();

			java.util.List<com.lfn.icip.icipwebeditor.model.ICIPStreamingServices> approvals = approvalWorkflowService.getProjectAdminApprovals(projectId, userRank);

			java.util.Map<String, Object> response = new java.util.HashMap<>();
			response.put("success", true);
			response.put("data", approvals);
			response.put("count", approvals.size());

			return ResponseEntity.ok(response);
		} catch (Exception e) {
			logger.error("Error fetching project admin approvals", e);
			java.util.Map<String, Object> error = new java.util.HashMap<>();
			error.put("success", false);
			error.put("message", e.getMessage());
			return ResponseEntity.status(400).body(error);
		}
	}

	@org.springframework.web.bind.annotation.GetMapping("/approval/org-admin/list")
	public ResponseEntity<java.util.Map<String, Object>> getOrgAdminApprovals(
			@org.springframework.web.bind.annotation.RequestParam Integer organizationId,
			jakarta.servlet.http.HttpServletRequest httpRequest) {
		try {
			String userRank = httpRequest.getHeader("roleId");
			if (userRank == null) {
				userRank = "0";
			}
			userRank = userRank.trim();

			java.util.List<com.lfn.icip.icipwebeditor.model.ICIPStreamingServices> approvals = approvalWorkflowService.getOrgAdminApprovals(organizationId, userRank);

			java.util.Map<String, Object> response = new java.util.HashMap<>();
			response.put("success", true);
			response.put("data", approvals);
			response.put("count", approvals.size());

			return ResponseEntity.ok(response);
		} catch (Exception e) {
			logger.error("Error fetching org admin approvals", e);
			java.util.Map<String, Object> error = new java.util.HashMap<>();
			error.put("success", false);
			error.put("message", e.getMessage());
			return ResponseEntity.status(400).body(error);
		}
	}

	@org.springframework.web.bind.annotation.GetMapping("/approval/draft-resources")
	public ResponseEntity<java.util.Map<String, Object>> getDraftResources(
			@org.springframework.web.bind.annotation.RequestParam Integer projectId,
			jakarta.servlet.http.HttpServletRequest httpRequest) {
		try {
			String userRank = httpRequest.getHeader("roleId");
			if (userRank == null) {
				userRank = "0";
			}
			userRank = userRank.trim();

			java.util.List<com.lfn.icip.icipwebeditor.model.ICIPStreamingServices> resources = approvalWorkflowService.getDraftResources(projectId, userRank);

			java.util.Map<String, Object> response = new java.util.HashMap<>();
			response.put("success", true);
			response.put("data", resources);
			response.put("count", resources.size());

			return ResponseEntity.ok(response);
		} catch (Exception e) {
			logger.error("Error fetching draft resources", e);
			java.util.Map<String, Object> error = new java.util.HashMap<>();
			error.put("success", false);
			error.put("message", e.getMessage());
			return ResponseEntity.status(400).body(error);
		}
	}

	/**
	 * Get streaming service by name and organization
	 * Used by frontend to load pipeline details with approval_status
	 */
	@org.springframework.web.bind.annotation.GetMapping("/{name}/{org}")
	public ResponseEntity<com.lfn.icip.icipwebeditor.model.ICIPStreamingServices> getStreamingServiceByName(
			@org.springframework.web.bind.annotation.PathVariable String name,
			@org.springframework.web.bind.annotation.PathVariable String org) {
		try {
			logger.info("Fetching streaming service: name={}, org={}", name, org);
			
			// Query database for the streaming service by name and organization
			com.lfn.icip.icipwebeditor.model.ICIPStreamingServices resource = streamingServicesService.findbyNameAndOrganization(name, org);
			
			if (resource == null) {
				logger.warn("Streaming service not found: name={}, org={}", name, org);
				return ResponseEntity.status(404).build();
			}
			
			logger.info("Found streaming service: id={}, name={}, approval_status={}", 
				resource.getCid(), resource.getName(), resource.getApprovalStatus());
			
			return ResponseEntity.ok(resource);
		} catch (Exception e) {
			logger.error("Error fetching streaming service by name: name={}, org={}", name, org, e);
			return ResponseEntity.status(500).build();
		}
	}
}