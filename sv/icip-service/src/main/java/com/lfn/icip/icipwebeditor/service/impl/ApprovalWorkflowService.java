package com.lfn.icip.icipwebeditor.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lfn.icip.icipwebeditor.model.ICIPStreamingServices;
import com.lfn.icip.icipwebeditor.repository.ICIPStreamingServicesRepository;

/**
 * Approval Workflow Service
 * Handles 2-level approval process: Project Admin -> Org Admin
 * Enforces visibility rules based on approval status and user role
 */
@Service
public class ApprovalWorkflowService {

	private static final Logger logger = LoggerFactory.getLogger(ApprovalWorkflowService.class);

	@Autowired
	private ICIPStreamingServicesRepository streamingServicesRepository;

	/**
	 * Submit resource for Project Admin approval
	 * Status: DRAFT -> PENDING_PROJECT_APPROVAL
	 */
	public ICIPStreamingServices submitForProjectApproval(Integer resourceId, Integer projectId, String currentUser) {
		logger.info("[Approval] Submitting resource {} for project approval by user {}", resourceId, currentUser);
		logger.info("[Approval] ProjectId being set: {}", projectId);

		ICIPStreamingServices resource = streamingServicesRepository.findById(resourceId).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Resource not found: " + resourceId);
		}

		// Only creator can submit
		if (!resource.getCreatedBy().equals(currentUser)) {
			throw new IllegalAccessError("Only creator can submit for approval");
		}

		// Only DRAFT resources can be submitted
		if (!"DRAFT".equals(resource.getApprovalStatus())) {
			throw new IllegalStateException("Only DRAFT resources can be submitted for approval");
		}

		resource.setApprovalStatus("PENDING_PROJECT_APPROVAL");
		resource.setProjectId(projectId);
		logger.info("[Approval] Resource {} - After setting: status={}, projectId={}", 
			resourceId, resource.getApprovalStatus(), resource.getProjectId());
		
		ICIPStreamingServices saved = streamingServicesRepository.save(resource);
		logger.info("[Approval] Resource {} saved - Verified: status={}, projectId={}", 
			saved.getCid(), saved.getApprovalStatus(), saved.getProjectId());
		
		return saved;
	}

	/**
	 * Project Admin approves resource
	 * Status: PENDING_PROJECT_APPROVAL -> PROJECT_APPROVED
	 * Resource becomes visible to ALL users of same project
	 */
	public ICIPStreamingServices approveProjectApproval(Integer resourceId, Integer projectId, String currentUserRank) {
		logger.info("[Approval] Project Admin approving resource {} for project {}, rank: {}", resourceId, projectId, currentUserRank);

		if (!"2".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Project Admin (rank 2) can approve");
		}

		ICIPStreamingServices resource = streamingServicesRepository.findById(resourceId).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Resource not found: " + resourceId);
		}

		logger.info("[Approval] Found resource: cid={}, name={}, currentStatus={}, currentProjectId={}", 
			resource.getCid(), resource.getName(), resource.getApprovalStatus(), resource.getProjectId());

		if (!"PENDING_PROJECT_APPROVAL".equals(resource.getApprovalStatus())) {
			throw new IllegalStateException("Only PENDING_PROJECT_APPROVAL resources can be approved");
		}

		// Ensure projectId is set before approving
		if (resource.getProjectId() == null || resource.getProjectId() == 0) {
			logger.warn("[Approval] Resource projectId was null or 0, setting to {} (param projectId: {})", projectId, projectId);
			resource.setProjectId(projectId);
		} else {
			logger.info("[Approval] Resource already has projectId: {}, param projectId: {}, using existing", resource.getProjectId(), projectId);
		}

		resource.setApprovalStatus("PROJECT_APPROVED");
		ICIPStreamingServices saved = streamingServicesRepository.save(resource);
		logger.info("[Approval] Resource approved - cid={}, newStatus={}, projectId in DB={}", 
			saved.getCid(), saved.getApprovalStatus(), saved.getProjectId());
		return saved;
	}

	/**
	 * Project Admin rejects resource
	 * Status: PENDING_PROJECT_APPROVAL -> PROJECT_REJECTED
	 * Only visible to creator
	 */
	public ICIPStreamingServices rejectProjectApproval(Integer resourceId, String currentUserRank) {
		logger.info("[Approval] Project Admin rejecting resource {}", resourceId);

		if (!"2".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Project Admin (rank 2) can reject");
		}

		ICIPStreamingServices resource = streamingServicesRepository.findById(resourceId).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Resource not found: " + resourceId);
		}

		resource.setApprovalStatus("PROJECT_REJECTED");
		return streamingServicesRepository.save(resource);
	}

	/**
	 * Submit approved resource to Org Admin for Organization publishing
	 * Status: PROJECT_APPROVED -> PENDING_ORG_APPROVAL
	 */
	public ICIPStreamingServices submitForOrgApproval(Integer resourceId, Integer targetOrganizationId, String currentUserRank) {
		logger.info("[Approval] Submitting resource {} to org {} for org approval", resourceId, targetOrganizationId);

		if (!"2".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Project Admin can submit to Org");
		}

		ICIPStreamingServices resource = streamingServicesRepository.findById(resourceId).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Resource not found: " + resourceId);
		}

		if (!"PROJECT_APPROVED".equals(resource.getApprovalStatus())) {
			throw new IllegalStateException("Only PROJECT_APPROVED resources can be submitted to Org");
		}

		resource.setApprovalStatus("PENDING_ORG_APPROVAL");
		resource.setApprovedOrganizationId(targetOrganizationId);
		return streamingServicesRepository.save(resource);
	}

	/**
	 * Org Admin approves and publishes resource
	 * Status: PENDING_ORG_APPROVAL -> PUBLISHED
	 * Now visible to ALL users of approved organization
	 */
	public ICIPStreamingServices approveOrgApproval(Integer resourceId, String currentUserRank) {
		logger.info("[Approval] Org Admin publishing resource {}", resourceId);

		if (!"3".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Org Admin (rank 3) can approve org-level publishing");
		}

		ICIPStreamingServices resource = streamingServicesRepository.findById(resourceId).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Resource not found: " + resourceId);
		}

		if (!"PENDING_ORG_APPROVAL".equals(resource.getApprovalStatus())) {
			throw new IllegalStateException("Only PENDING_ORG_APPROVAL resources can be org-approved");
		}

		logger.info("[Approval] Before publish - resource: id={}, name={}, status={}, approvedOrgId={}", 
			resourceId, resource.getName(), resource.getApprovalStatus(), resource.getApprovedOrganizationId());
		
		resource.setApprovalStatus("PUBLISHED");
		ICIPStreamingServices saved = streamingServicesRepository.save(resource);
		
		logger.info("[Approval] After publish - resource: id={}, name={}, status={}, approvedOrgId={}", 
			saved.getCid(), saved.getName(), saved.getApprovalStatus(), saved.getApprovedOrganizationId());
		
		return saved;
	}

	/**
	 * Org Admin rejects organization publishing
	 * Status: PENDING_ORG_APPROVAL -> ORG_REJECTED
	 * Resource remains visible to same project users
	 */
	public ICIPStreamingServices rejectOrgApproval(Integer resourceId, String currentUserRank) {
		logger.info("[Approval] Org Admin rejecting org approval for resource {}", resourceId);

		if (!"3".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Org Admin (rank 3) can reject org-level approval");
		}

		ICIPStreamingServices resource = streamingServicesRepository.findById(resourceId).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Resource not found: " + resourceId);
		}

		resource.setApprovalStatus("ORG_REJECTED");
		return streamingServicesRepository.save(resource);
	}

	/**
	 * Get resources visible to current user based on approval status and user context
	 */
	public List<ICIPStreamingServices> getVisibleResources(String currentUser, Integer userProjectId, Integer userOrganizationId, String userRank) {
		logger.debug("[Approval] Getting visible resources for user: {}, projectId: {}, orgId: {}, rank: {}", 
			currentUser, userProjectId, userOrganizationId, userRank);

		List<ICIPStreamingServices> allResources = streamingServicesRepository.findAll();
		List<ICIPStreamingServices> visibleResources = new ArrayList<>();

		for (ICIPStreamingServices resource : allResources) {
			if (isResourceVisibleToUser(resource, currentUser, userProjectId, userOrganizationId, userRank)) {
				visibleResources.add(resource);
			}
		}

		return visibleResources;
	}

	/**
	 * Check if a resource is visible to the current user
	 */
	public boolean isResourceVisibleToUser(ICIPStreamingServices resource, String currentUser, 
			Integer userProjectId, Integer userOrganizationId, String userRank) {

		String status = resource.getApprovalStatus();
		boolean isVisible = false;

		// DRAFT: Only creator
		if ("DRAFT".equals(status)) {
			isVisible = resource.getCreatedBy().equals(currentUser);
		}

		// PENDING_PROJECT_APPROVAL: Creator + Project Admins of same project
		else if ("PENDING_PROJECT_APPROVAL".equals(status)) {
			boolean isCreator = resource.getCreatedBy().equals(currentUser);
			boolean isProjectAdmin = "2".equals(userRank) && userProjectId.equals(resource.getProjectId());
			isVisible = isCreator || isProjectAdmin;
		}

		// PROJECT_APPROVED: ALL users of same project
		else if ("PROJECT_APPROVED".equals(status)) {
			isVisible = userProjectId.equals(resource.getProjectId());
		}

		// PENDING_ORG_APPROVAL: ALL users of same project + Selected org admins
		else if ("PENDING_ORG_APPROVAL".equals(status)) {
			boolean sameProject = userProjectId.equals(resource.getProjectId());
			boolean isSelectedOrgAdmin = "3".equals(userRank) && userOrganizationId.equals(resource.getApprovedOrganizationId());
			isVisible = sameProject || isSelectedOrgAdmin;
		}

		// PROJECT_REJECTED: Creator only
		else if ("PROJECT_REJECTED".equals(status)) {
			isVisible = resource.getCreatedBy().equals(currentUser);
		}

		// ORG_REJECTED: ALL users of same project
		else if ("ORG_REJECTED".equals(status)) {
			isVisible = userProjectId.equals(resource.getProjectId());
		}

		// PUBLISHED: ALL users of approved organization
		else if ("PUBLISHED".equals(status)) {
			isVisible = userOrganizationId.equals(resource.getApprovedOrganizationId());
			if (!isVisible) {
				logger.debug("[Approval] PUBLISHED resource {} not visible: userOrgId={}, resourceApprovedOrgId={}", 
					resource.getCid(), userOrganizationId, resource.getApprovedOrganizationId());
			} else {
				logger.debug("[Approval] PUBLISHED resource {} IS visible to user: userOrgId={}, resourceApprovedOrgId={}", 
					resource.getCid(), userOrganizationId, resource.getApprovedOrganizationId());
			}
		}

		return isVisible;
	}

	/**
	 * Get approval requests for Project Admin
	 */
	public List<ICIPStreamingServices> getProjectAdminApprovals(Integer projectId, String currentUserRank) {
		if (!"2".equals(currentUserRank)) {
			logger.warn("[Approval] User rank is not 2 (project admin): {}", currentUserRank);
			return new ArrayList<>();
		}

		List<ICIPStreamingServices> allResources = streamingServicesRepository.findAll();
		logger.info("[Approval] Total resources in DB: {}", allResources.size());
		
		// Debug: log resources with PENDING_PROJECT_APPROVAL
		long pendingCount = allResources.stream()
			.filter(r -> "PENDING_PROJECT_APPROVAL".equals(r.getApprovalStatus()))
			.count();
		logger.info("[Approval] Resources with PENDING_PROJECT_APPROVAL status: {}", pendingCount);
		
		// Debug: log projectId distribution
		allResources.stream()
			.filter(r -> "PENDING_PROJECT_APPROVAL".equals(r.getApprovalStatus()))
			.forEach(r -> logger.info("[Approval] Resource ID: {}, Name: {}, Status: {}, ProjectId: {}", 
				r.getCid(), r.getName(), r.getApprovalStatus(), r.getProjectId()));
		
		logger.info("[Approval] Filtering for projectId: {}", projectId);
		
		List<ICIPStreamingServices> result = allResources.stream()
			.filter(r -> "PENDING_PROJECT_APPROVAL".equals(r.getApprovalStatus()) && projectId.equals(r.getProjectId()))
			.collect(Collectors.toList());
		
		logger.info("[Approval] Found {} resources for project admin with projectId: {}", result.size(), projectId);
		return result;
	}

	/**
	 * Get approval requests for Org Admin
	 */
	public List<ICIPStreamingServices> getOrgAdminApprovals(Integer organizationId, String currentUserRank) {
		if (!"3".equals(currentUserRank)) {
			return new ArrayList<>();
		}

		List<ICIPStreamingServices> allResources = streamingServicesRepository.findAll();
		return allResources.stream()
			.filter(r -> "PENDING_ORG_APPROVAL".equals(r.getApprovalStatus()) && organizationId.equals(r.getApprovedOrganizationId()))
			.collect(Collectors.toList());
	}

	/**
	 * Get PROJECT_APPROVED resources for a project
	 */
	public List<ICIPStreamingServices> getDraftResources(Integer projectId, String currentUserRank) {
		logger.info("[Approval] getDraftResources called - projectId: {} (type: {}), rank: {}", 
			projectId, projectId != null ? projectId.getClass().getSimpleName() : "null", currentUserRank);
		
		if (!"2".equals(currentUserRank)) {
			logger.warn("[Approval] User rank is not 2 (project admin): {}", currentUserRank);
			return new ArrayList<>();
		}

		List<ICIPStreamingServices> allResources = streamingServicesRepository.findAll();
		logger.info("[Approval] Total resources in DB: {}", allResources.size());
		
		// Log all resources for debugging
		for (ICIPStreamingServices r : allResources) {
			logger.debug("[Approval] Resource in DB - cid={}, status={}, projectId={}, statusMatch={}, projectMatch={}", 
				r.getCid(), r.getApprovalStatus(), r.getProjectId(), 
				"PROJECT_APPROVED".equals(r.getApprovalStatus()),
				projectId != null && projectId.equals(r.getProjectId()));
		}
		
		List<ICIPStreamingServices> draftResources = allResources.stream()
			.filter(r -> {
				boolean statusMatch = "PROJECT_APPROVED".equals(r.getApprovalStatus());
				boolean projectMatch = projectId != null && projectId.equals(r.getProjectId());
				boolean keep = statusMatch && projectMatch;
				if (!keep && (statusMatch || projectMatch)) {
					logger.debug("[Approval] Resource FILTERED OUT - cid={}: status={} (match={}), projectId={} (match={}, param={})", 
						r.getCid(), r.getApprovalStatus(), statusMatch, r.getProjectId(), projectMatch, projectId);
				}
				return keep;
			})
			.collect(Collectors.toList());
		
		logger.info("[Approval] Found {} PROJECT_APPROVED resources for projectId {}", draftResources.size(), projectId);
		for (ICIPStreamingServices resource : draftResources) {
			logger.info("[Approval] Draft resource MATCH: cid={}, name={}, status={}, projectId={}", 
				resource.getCid(), resource.getName(), resource.getApprovalStatus(), resource.getProjectId());
		}
		
		return draftResources;
	}
}
