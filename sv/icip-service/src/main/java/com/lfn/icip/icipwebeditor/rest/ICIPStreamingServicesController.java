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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

	/** Approval workflow service */
	@Autowired
	private com.lfn.icip.icipwebeditor.service.impl.ApprovalWorkflowService approvalWorkflowService;

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

	/**
	 * POST /approval/submit
	 * Submit resource for Project Admin approval (DRAFT -> PENDING_PROJECT_APPROVAL)
	 */
	@PostMapping("/approval/submit")
	public ResponseEntity<?> submitForApproval(
			@RequestBody java.util.Map<String, Object> request,
			@RequestHeader(value = "user-login", required = false) String username,
			@RequestHeader(value = "project", required = false) String projectHeader) {
		try {
			Integer resourceId = (Integer) request.get("resourceId");
			Integer projectId = null;
			
			if (resourceId == null) {
				logger.warn("[Approval] Submit failed: Missing resourceId");
				return ResponseEntity.status(400).body(java.util.Map.of("error", "resourceId is required"));
			}

			logger.info("[Approval] Submit endpoint - projectHeader: {}, request body: {}", projectHeader, request);

			if (projectHeader != null && !projectHeader.isEmpty()) {
				try {
					projectId = Integer.parseInt(projectHeader);
					logger.info("[Approval] ProjectId from header: {}", projectId);
				} catch (NumberFormatException e) {
					logger.warn("[Approval] Invalid projectId format: {}", projectHeader);
				}
			}

			if (projectId == null) {
				projectId = (Integer) request.get("projectId");
				logger.info("[Approval] ProjectId from body: {}", projectId);
			}

			if (projectId == null) {
				logger.warn("[Approval] Submit failed: Missing projectId");
				return ResponseEntity.status(400).body(java.util.Map.of("error", "projectId is required"));
			}

			if (username == null || username.isEmpty()) {
				logger.warn("[Approval] Submit failed: Missing username");
				return ResponseEntity.status(403).body(java.util.Map.of("error", "Authentication required"));
			}

			com.lfn.icip.icipwebeditor.model.ICIPStreamingServices result = approvalWorkflowService.submitForProjectApproval(resourceId, projectId, username);
			logger.info("[Approval] Successfully submitted resource {} for approval", resourceId);
			return ResponseEntity.ok(java.util.Map.of(
				"success", true,
				"message", "Resource submitted for approval",
				"resourceId", resourceId,
				"status", result.getApprovalStatus()
			));
		} catch (IllegalAccessError e) {
			logger.warn("[Approval] Forbidden: {}", e.getMessage());
			return ResponseEntity.status(403).body(java.util.Map.of("error", e.getMessage()));
		} catch (IllegalStateException | IllegalArgumentException e) {
			logger.warn("[Approval] Bad request: {}", e.getMessage());
			return ResponseEntity.status(400).body(java.util.Map.of("error", e.getMessage()));
		} catch (Exception e) {
			logger.error("[Approval] Error submitting resource for approval", e);
			return ResponseEntity.status(500).body(java.util.Map.of("error", "Internal server error: " + e.getMessage()));
		}
	}

	/**
	 * GET /approval/visible-resources
	 * Get all visible streaming services for current user (including PUBLISHED org-wide resources)
	 * Rank 0: sees DRAFT (own), PROJECT_APPROVED (project), PUBLISHED (org)
	 * Rank 2: sees all + PENDING_PROJECT_APPROVAL
	 * Rank 3: sees all + PENDING_ORG_APPROVAL
	 */
	@GetMapping("/approval/visible-resources")
	public ResponseEntity<?> getVisibleResources(
			@RequestHeader(value = "user-login", required = false) String username,
			@RequestHeader(value = "project", required = false) String projectHeader,
			@RequestHeader(value = "organisation", required = false) String orgHeader,
			@RequestHeader(value = "roleId", required = false) String roleId) {
		try {
			logger.info("[Approval] getVisibleResources - user: {}, project: {}, org: {}, role: {}", 
				username, projectHeader, orgHeader, roleId);
			
			Integer userProjectId = null;
			Integer userOrganizationId = null;
			
			if (projectHeader != null && !projectHeader.isEmpty()) {
				try {
					userProjectId = Integer.parseInt(projectHeader);
				} catch (NumberFormatException e) {
					logger.warn("[Approval] Invalid projectId format: {}", projectHeader);
				}
			}
			
			if (orgHeader != null && !orgHeader.isEmpty()) {
				try {
					userOrganizationId = Integer.parseInt(orgHeader);
				} catch (NumberFormatException e) {
					logger.warn("[Approval] Invalid orgId format: {}", orgHeader);
				}
			}

			if (username == null || userProjectId == null || userOrganizationId == null || roleId == null) {
				logger.warn("[Approval] Missing required headers for visibility check");
				return ResponseEntity.status(400).body(java.util.Map.of("error", "Missing user context headers"));
			}

			java.util.List<com.lfn.icip.icipwebeditor.model.ICIPStreamingServices> visibleResources = 
				approvalWorkflowService.getVisibleResources(username, userProjectId, userOrganizationId, roleId);
			
			logger.info("[Approval] Found {} visible resources for user {} in projectId: {}, orgId: {}", 
				visibleResources.size(), username, userProjectId, userOrganizationId);
			
			return ResponseEntity.ok(java.util.Map.of(
				"success", true,
				"data", visibleResources,
				"count", visibleResources.size()
			));
		} catch (Exception e) {
			logger.error("[Approval] Error getting visible resources", e);
			return ResponseEntity.status(500).body(java.util.Map.of("error", "Internal server error: " + e.getMessage()));
		}
	}

	/**
	 * POST /approval/project/approve/{resourceId}?projectId=X&rank=2
	 * Project Admin approves resource (PENDING_PROJECT_APPROVAL -> PROJECT_APPROVED)
	 */
	@PostMapping("/approval/project/approve/{resourceId}")
	public ResponseEntity<?> approveProjectApproval(
			@PathVariable Integer resourceId,
			@RequestParam(required = false) Integer projectId,
			@RequestParam(required = false) String rank) {
		try {
			logger.info("[Approval] POST /approval/project/approve/{} - projectId: {} (type: {}), rank: {}", 
				resourceId, projectId, projectId != null ? projectId.getClass().getSimpleName() : "null", rank);
			
			if (rank == null || rank.isEmpty()) {
				logger.warn("[Approval] Missing rank parameter for project approval");
				return ResponseEntity.status(403).body(java.util.Map.of("error", "Missing rank parameter"));
			}

			com.lfn.icip.icipwebeditor.model.ICIPStreamingServices result = approvalWorkflowService.approveProjectApproval(resourceId, projectId, rank);
			logger.info("[Approval] Resource {} approved at project level - Saved status: {}, projectId in DB: {}", 
				resourceId, result.getApprovalStatus(), result.getProjectId());
			return ResponseEntity.ok(java.util.Map.of(
				"success", true,
				"message", "Resource approved",
				"resourceId", resourceId,
				"status", result.getApprovalStatus(),
				"projectIdInDb", result.getProjectId()
			));
		} catch (IllegalAccessError e) {
			logger.warn("[Approval] Forbidden: {}", e.getMessage());
			return ResponseEntity.status(403).body(java.util.Map.of("error", e.getMessage()));
		} catch (IllegalStateException | IllegalArgumentException e) {
			logger.warn("[Approval] Bad request: {}", e.getMessage());
			return ResponseEntity.status(400).body(java.util.Map.of("error", e.getMessage()));
		} catch (Exception e) {
			logger.error("[Approval] Error approving resource", e);
			return ResponseEntity.status(500).body(java.util.Map.of("error", "Internal server error: " + e.getMessage()));
		}
	}

	/**
	 * POST /approval/project/reject/{resourceId}?rank=2
	 * Project Admin rejects resource (PENDING_PROJECT_APPROVAL -> PROJECT_REJECTED)
	 */
	@PostMapping("/approval/project/reject/{resourceId}")
	public ResponseEntity<?> rejectProjectApproval(
			@PathVariable Integer resourceId,
			@RequestParam(required = false) String rank) {
		try {
			logger.info("[Approval] POST /approval/project/reject/{} - rank: {}", resourceId, rank);
			
			if (rank == null || rank.isEmpty()) {
				logger.warn("[Approval] Missing rank parameter for project rejection");
				return ResponseEntity.status(403).body(java.util.Map.of("error", "Missing rank parameter"));
			}

			com.lfn.icip.icipwebeditor.model.ICIPStreamingServices result = approvalWorkflowService.rejectProjectApproval(resourceId, rank);
			logger.info("[Approval] Resource {} rejected at project level by rank: {}", resourceId, rank);
			return ResponseEntity.ok(java.util.Map.of(
				"success", true,
				"message", "Resource rejected",
				"resourceId", resourceId,
				"status", result.getApprovalStatus()
			));
		} catch (IllegalAccessError e) {
			logger.warn("[Approval] Forbidden: {}", e.getMessage());
			return ResponseEntity.status(403).body(java.util.Map.of("error", e.getMessage()));
		} catch (IllegalStateException | IllegalArgumentException e) {
			logger.warn("[Approval] Bad request: {}", e.getMessage());
			return ResponseEntity.status(400).body(java.util.Map.of("error", e.getMessage()));
		} catch (Exception e) {
			logger.error("[Approval] Error rejecting resource", e);
			return ResponseEntity.status(500).body(java.util.Map.of("error", "Internal server error: " + e.getMessage()));
		}
	}

	/**
	 * POST /approval/org/submit
	 * Submit approved resource to Org Admin (PROJECT_APPROVED -> PENDING_ORG_APPROVAL)
	 */
	@PostMapping("/approval/org/submit")
	public ResponseEntity<?> submitForOrgApproval(
			@RequestBody java.util.Map<String, Object> request,
			@RequestParam(value = "rank", required = false) String rank,
			@RequestHeader(value = "roleId", required = false) String roleId) {
		try {
			Integer resourceId = (Integer) request.get("resourceId");
			Integer organizationId = null;
			
			if (resourceId == null) {
				logger.warn("[Approval] Org submit failed: Missing resourceId");
				return ResponseEntity.status(400).body(java.util.Map.of("error", "resourceId is required"));
			}

			Object orgObj = request.get("organizationId");
			if (orgObj != null) {
				if (orgObj instanceof Integer) {
					organizationId = (Integer) orgObj;
				} else if (orgObj instanceof String) {
					try {
						organizationId = Integer.parseInt((String) orgObj);
					} catch (NumberFormatException e) {
						logger.warn("[Approval] Invalid organizationId format");
					}
				}
			}

			if (organizationId == null) {
				logger.warn("[Approval] Org submit failed: Missing organizationId");
				return ResponseEntity.status(400).body(java.util.Map.of("error", "organizationId is required"));
			}

			String userRank = (rank != null && !rank.isEmpty()) ? rank : roleId;
			if (userRank == null || userRank.isEmpty()) {
				logger.warn("[Approval] Missing rank/roleId for org submit");
				return ResponseEntity.status(403).body(java.util.Map.of("error", "Missing user rank"));
			}

			com.lfn.icip.icipwebeditor.model.ICIPStreamingServices result = approvalWorkflowService.submitForOrgApproval(resourceId, organizationId, userRank);
			logger.info("[Approval] Successfully submitted resource {} to org {} for approval", resourceId, organizationId);
			return ResponseEntity.ok(java.util.Map.of(
				"success", true,
				"message", "Resource submitted to organization for approval",
				"resourceId", resourceId,
				"organizationId", organizationId,
				"status", result.getApprovalStatus()
			));
		} catch (IllegalAccessError e) {
			logger.warn("[Approval] Forbidden: {}", e.getMessage());
			return ResponseEntity.status(403).body(java.util.Map.of("error", e.getMessage()));
		} catch (IllegalStateException | IllegalArgumentException e) {
			logger.warn("[Approval] Bad request: {}", e.getMessage());
			return ResponseEntity.status(400).body(java.util.Map.of("error", e.getMessage()));
		} catch (Exception e) {
			logger.error("[Approval] Error submitting to org", e);
			return ResponseEntity.status(500).body(java.util.Map.of("error", "Internal server error: " + e.getMessage()));
		}
	}

	/**
	 * POST /approval/org/approve/{resourceId}
	 * Org Admin approves and publishes (PENDING_ORG_APPROVAL -> PUBLISHED)
	 */
	@PostMapping("/approval/org/approve/{resourceId}")
	public ResponseEntity<?> approveOrgApproval(
			@PathVariable Integer resourceId,
			@RequestParam(value = "rank", required = false) String rank,
			@RequestHeader(value = "roleId", required = false) String roleId) {
		try {
			String userRank = (rank != null && !rank.isEmpty()) ? rank : roleId;
			if (userRank == null || userRank.isEmpty()) {
				logger.warn("[Approval] Missing rank/roleId for org approval");
				return ResponseEntity.status(403).body(java.util.Map.of("error", "Missing user rank"));
			}

			com.lfn.icip.icipwebeditor.model.ICIPStreamingServices result = approvalWorkflowService.approveOrgApproval(resourceId, userRank);
			logger.info("[Approval] Resource {} approved and published at org level", resourceId);
			return ResponseEntity.ok(java.util.Map.of(
				"success", true,
				"message", "Resource published",
				"resourceId", resourceId,
				"status", result.getApprovalStatus()
			));
		} catch (IllegalAccessError e) {
			logger.warn("[Approval] Forbidden: {}", e.getMessage());
			return ResponseEntity.status(403).body(java.util.Map.of("error", e.getMessage()));
		} catch (IllegalStateException | IllegalArgumentException e) {
			logger.warn("[Approval] Bad request: {}", e.getMessage());
			return ResponseEntity.status(400).body(java.util.Map.of("error", e.getMessage()));
		} catch (Exception e) {
			logger.error("[Approval] Error org-approving resource", e);
			return ResponseEntity.status(500).body(java.util.Map.of("error", "Internal server error: " + e.getMessage()));
		}
	}

	/**
	 * POST /approval/org/reject/{resourceId}
	 * Org Admin rejects (PENDING_ORG_APPROVAL -> ORG_REJECTED)
	 */
	@PostMapping("/approval/org/reject/{resourceId}")
	public ResponseEntity<?> rejectOrgApproval(
			@PathVariable Integer resourceId,
			@RequestParam(value = "rank", required = false) String rank,
			@RequestHeader(value = "roleId", required = false) String roleId) {
		try {
			String userRank = (rank != null && !rank.isEmpty()) ? rank : roleId;
			if (userRank == null || userRank.isEmpty()) {
				logger.warn("[Approval] Missing rank/roleId for org rejection");
				return ResponseEntity.status(403).body(java.util.Map.of("error", "Missing user rank"));
			}

			com.lfn.icip.icipwebeditor.model.ICIPStreamingServices result = approvalWorkflowService.rejectOrgApproval(resourceId, userRank);
			logger.info("[Approval] Resource {} rejected at org level", resourceId);
			return ResponseEntity.ok(java.util.Map.of(
				"success", true,
				"message", "Resource rejected",
				"resourceId", resourceId,
				"status", result.getApprovalStatus()
			));
		} catch (IllegalAccessError e) {
			logger.warn("[Approval] Forbidden: {}", e.getMessage());
			return ResponseEntity.status(403).body(java.util.Map.of("error", e.getMessage()));
		} catch (IllegalStateException | IllegalArgumentException e) {
			logger.warn("[Approval] Bad request: {}", e.getMessage());
			return ResponseEntity.status(400).body(java.util.Map.of("error", e.getMessage()));
		} catch (Exception e) {
			logger.error("[Approval] Error org-rejecting resource", e);
			return ResponseEntity.status(500).body(java.util.Map.of("error", "Internal server error: " + e.getMessage()));
		}
	}

	/**
	 * GET /approval/project-admin/list?projectId=X&rank=2
	 * Get resources pending project admin approval
	 */
	@GetMapping("/approval/project-admin/list")
	public ResponseEntity<?> getProjectAdminApprovals(
			@RequestParam Integer projectId,
			@RequestParam(required = false) String rank) {
		try {
			logger.info("[Approval] GET /approval/project-admin/list - projectId: {}, rank param: {}", projectId, rank);
			
			if (rank == null || rank.isEmpty()) {
				logger.warn("[Approval] Missing rank parameter for project admin list");
				return ResponseEntity.status(403).body(java.util.Map.of("error", "Missing rank parameter"));
			}

			java.util.List<com.lfn.icip.icipwebeditor.model.ICIPStreamingServices> approvals = approvalWorkflowService.getProjectAdminApprovals(projectId, rank);
			logger.info("[Approval] Retrieved {} approval requests for project admin with projectId: {} and rank: {}", 
				approvals.size(), projectId, rank);
			return ResponseEntity.ok(java.util.Map.of(
				"success", true,
				"data", approvals,
				"count", approvals.size()
			));
		} catch (Exception e) {
			logger.error("[Approval] Error getting project admin approvals", e);
			return ResponseEntity.status(500).body(java.util.Map.of("error", "Internal server error: " + e.getMessage()));
		}
	}

	/**
	 * GET /approval/org-admin/list?organizationId=X&rank=3
	 * Get resources pending org admin approval
	 */
	@GetMapping("/approval/org-admin/list")
	public ResponseEntity<?> getOrgAdminApprovals(
			@RequestParam Integer organizationId,
			@RequestParam(required = false) String rank) {
		try {
			logger.info("[Approval] GET /approval/org-admin/list - organizationId: {}, rank param: {}", organizationId, rank);
			
			if (rank == null || rank.isEmpty()) {
				logger.warn("[Approval] Missing rank parameter for org admin list");
				return ResponseEntity.status(403).body(java.util.Map.of("error", "Missing rank parameter"));
			}

			java.util.List<com.lfn.icip.icipwebeditor.model.ICIPStreamingServices> approvals = approvalWorkflowService.getOrgAdminApprovals(organizationId, rank);
			logger.info("[Approval] Retrieved {} approval requests for org admin with organizationId: {} and rank: {}", 
				approvals.size(), organizationId, rank);
			return ResponseEntity.ok(java.util.Map.of(
				"success", true,
				"data", approvals,
				"count", approvals.size()
			));
		} catch (Exception e) {
			logger.error("[Approval] Error getting org admin approvals", e);
			return ResponseEntity.status(500).body(java.util.Map.of("error", "Internal server error: " + e.getMessage()));
		}
	}

	/**
	 * GET /approval/draft-resources?projectId=X&rank=2
	 * Get PROJECT_APPROVED resources available for org submission
	 */
	@GetMapping("/approval/draft-resources")
	public ResponseEntity<?> getDraftResources(
			@RequestParam Integer projectId,
			@RequestParam(required = false) String rank,
			@RequestHeader(value = "roleId", required = false) String roleId) {
		try {
			String userRank = (rank != null && !rank.isEmpty()) ? rank : roleId;
			logger.info("[Approval] getDraftResources endpoint called - projectId: {} (type: {}), rank param: {}, roleId header: {}, final rank: {}", 
				projectId, projectId != null ? projectId.getClass().getSimpleName() : "null", rank, roleId, userRank);
			
			if (userRank == null || userRank.isEmpty()) {
				logger.warn("[Approval] Missing rank/roleId for draft resources");
				return ResponseEntity.status(403).body(java.util.Map.of("error", "Missing user rank"));
			}

			java.util.List<com.lfn.icip.icipwebeditor.model.ICIPStreamingServices> resources = approvalWorkflowService.getDraftResources(projectId, userRank);
			logger.info("[Approval] Retrieved {} draft resources for projectId {}", resources.size(), projectId);
			
			// Additional debug logging to understand what's in DB
			if (resources.isEmpty()) {
				logger.warn("[Approval] EMPTY RESULT - projectId: {} - Checking all resources in DB for diagnosis...", projectId);
				java.util.List<com.lfn.icip.icipwebeditor.model.ICIPStreamingServices> allResources = streamingServicesRepository.findAll();
				logger.warn("[Approval] Total resources in DB: {}", allResources.size());
				for (com.lfn.icip.icipwebeditor.model.ICIPStreamingServices r : allResources) {
					logger.warn("[Approval] Resource cid={}, status={}, projectId={}", r.getCid(), r.getApprovalStatus(), r.getProjectId());
				}
			}
			
			return ResponseEntity.ok(java.util.Map.of(
				"success", true,
				"data", resources,
				"count", resources.size()
			));
		} catch (Exception e) {
			logger.error("[Approval] Error getting draft resources", e);
			return ResponseEntity.status(500).body(java.util.Map.of("error", "Internal server error: " + e.getMessage()));
		}
	}

	/**
	 * GET /{name}/{org}
	 * Retrieve streaming service with approval status
	 */
	@GetMapping("/{name}/{org}")
	public ResponseEntity<?> getStreamingServiceWithApproval(
			@PathVariable String name,
			@PathVariable String org,
			@RequestHeader(value = "user-login", required = false) String username,
			@RequestHeader(value = "project", required = false) String projectHeader,
			@RequestHeader(value = "organisation", required = false) String orgHeader,
			@RequestHeader(value = "roleId", required = false) String roleId) {
		try {
			logger.info("[Approval] Retrieving streaming service: {}/{} for user: {}, project: {}, org: {}, role: {}", 
				name, org, username, projectHeader, orgHeader, roleId);
			
			com.lfn.icip.icipwebeditor.model.ICIPStreamingServices service = streamingServicesRepository
				.findByNameAndOrganization(name, org);
			
			if (service == null) {
				logger.warn("[Approval] Service not found: {}/{}", name, org);
				return ResponseEntity.status(404).body(java.util.Map.of("error", "Service not found"));
			}

			// Apply visibility filtering
			Integer userProjectId = null;
			Integer userOrganizationId = null;
			String userRank = roleId;
			
			if (projectHeader != null && !projectHeader.isEmpty()) {
				try {
					userProjectId = Integer.parseInt(projectHeader);
				} catch (NumberFormatException e) {
					logger.warn("[Approval] Invalid projectId format: {}", projectHeader);
				}
			}
			
			if (orgHeader != null && !orgHeader.isEmpty()) {
				try {
					userOrganizationId = Integer.parseInt(orgHeader);
				} catch (NumberFormatException e) {
					logger.warn("[Approval] Invalid orgId format: {}", orgHeader);
				}
			}

			// Check visibility
			if (username != null && userProjectId != null && userOrganizationId != null && userRank != null) {
				boolean isVisible = approvalWorkflowService.isResourceVisibleToUser(
					service, username, userProjectId, userOrganizationId, userRank);
				
				if (!isVisible) {
					logger.warn("[Approval] Access denied - resource {}/{} not visible to user {} with projectId: {}, orgId: {}, rank: {}", 
						name, org, username, userProjectId, userOrganizationId, userRank);
					return ResponseEntity.status(403).body(java.util.Map.of("error", "Access denied"));
				}
			}

			logger.info("[Approval] Retrieved service {}/{} with status: {}", name, org, service.getApprovalStatus());
			return ResponseEntity.ok(service);
		} catch (Exception e) {
			logger.error("[Approval] Error retrieving streaming service", e);
			return ResponseEntity.status(500).body(java.util.Map.of("error", "Internal server error: " + e.getMessage()));
		}
	}

	private java.util.Map<String, Object> createErrorResponse(String message) {
		java.util.Map<String, Object> response = new java.util.HashMap<>();
		response.put("success", false);
		response.put("message", message);
		return response;
	}
}