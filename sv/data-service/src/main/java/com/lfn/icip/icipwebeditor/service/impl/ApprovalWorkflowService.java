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
		return streamingServicesRepository.save(resource);
	}

	/**
	 * Project Admin approves resource
	 * Status: PENDING_PROJECT_APPROVAL -> PROJECT_APPROVED
	 * Resource becomes visible to ALL users of same project
	 */
	public ICIPStreamingServices approveProjectApproval(Integer resourceId, Integer projectId, String currentUserRank) {
		logger.info("[Approval] Project Admin approving resource {} for project {}", resourceId, projectId);

		if (!"2".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Project Admin (rank 2) can approve");
		}

		ICIPStreamingServices resource = streamingServicesRepository.findById(resourceId).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Resource not found: " + resourceId);
		}

		if (!"PENDING_PROJECT_APPROVAL".equals(resource.getApprovalStatus())) {
			throw new IllegalStateException("Only PENDING_PROJECT_APPROVAL resources can be approved");
		}

		resource.setApprovalStatus("PROJECT_APPROVED");
		return streamingServicesRepository.save(resource);
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
	 * Org Admin approves org-level publishing
	 * Status: PENDING_ORG_APPROVAL -> ORG_APPROVED
	 * Now visible to ALL users of approved organization; awaits an explicit
	 * submission by the Org Admin to the Platform Admin before it becomes
	 * globally PUBLISHED.
	 */
	public ICIPStreamingServices approveOrgApproval(Integer resourceId, String currentUserRank) {
		logger.info("[Approval] Org Admin approving resource {} at org level", resourceId);

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

		resource.setApprovalStatus("ORG_APPROVED");
		return streamingServicesRepository.save(resource);
	}

	/**
	 * Org Admin submits an ORG_APPROVED resource to Platform Admin for global publishing
	 * Status: ORG_APPROVED -> PENDING_PLATFORM_APPROVAL
	 */
	public ICIPStreamingServices submitForPlatformApproval(Integer resourceId, String currentUserRank) {
		logger.info("[Approval] Org Admin submitting resource {} for platform approval", resourceId);

		if (!"3".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Org Admin (rank 3) can submit to Platform Admin");
		}

		ICIPStreamingServices resource = streamingServicesRepository.findById(resourceId).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Resource not found: " + resourceId);
		}

		if (!"ORG_APPROVED".equals(resource.getApprovalStatus())) {
			throw new IllegalStateException("Only ORG_APPROVED resources can be submitted to Platform Admin");
		}

		resource.setApprovalStatus("PENDING_PLATFORM_APPROVAL");
		return streamingServicesRepository.save(resource);
	}

	/**
	 * Platform Admin approves and publishes resource globally
	 * Status: PENDING_PLATFORM_APPROVAL -> PUBLISHED (approvedOrganizationId cleared = global visibility)
	 */
	public ICIPStreamingServices approvePlatformApproval(Integer resourceId, String currentUserRank) {
		logger.info("[Approval] Platform Admin publishing resource {} globally", resourceId);

		if (!"4".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Platform Admin (rank 4) can publish globally");
		}

		ICIPStreamingServices resource = streamingServicesRepository.findById(resourceId).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Resource not found: " + resourceId);
		}

		if (!"PENDING_PLATFORM_APPROVAL".equals(resource.getApprovalStatus())) {
			throw new IllegalStateException("Only PENDING_PLATFORM_APPROVAL resources can be platform-approved");
		}

		resource.setApprovalStatus("PUBLISHED");
		resource.setApprovedOrganizationId(null);
		return streamingServicesRepository.save(resource);
	}

	/**
	 * Platform Admin rejects resource submitted for global publishing
	 * Status: PENDING_PLATFORM_APPROVAL -> PLATFORM_REJECTED
	 */
	public ICIPStreamingServices rejectPlatformApproval(Integer resourceId, String currentUserRank) {
		logger.info("[Approval] Platform Admin rejecting resource {}", resourceId);

		if (!"4".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Platform Admin (rank 4) can reject");
		}

		ICIPStreamingServices resource = streamingServicesRepository.findById(resourceId).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Resource not found: " + resourceId);
		}

		resource.setApprovalStatus("PLATFORM_REJECTED");
		return streamingServicesRepository.save(resource);
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
	 * 
	 * VISIBILITY RULES:
	 * - DRAFT: Only creator
	 * - PENDING_PROJECT_APPROVAL: Creator + Project Admins of same project
	 * - PROJECT_APPROVED: ALL users of same project
	 * - PENDING_ORG_APPROVAL: ALL users of same project + Selected org admins
	 * - PROJECT_REJECTED: Creator only
	 * - ORG_REJECTED: ALL users of same project
	 * - PUBLISHED: ALL users of approved organization
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

		// DRAFT: Only creator
		if ("DRAFT".equals(status)) {
			return resource.getCreatedBy().equals(currentUser);
		}

		// PENDING_PROJECT_APPROVAL: Creator + Project Admins of same project
		if ("PENDING_PROJECT_APPROVAL".equals(status)) {
			boolean isCreator = resource.getCreatedBy().equals(currentUser);
			boolean isProjectAdmin = "2".equals(userRank) && userProjectId.equals(resource.getProjectId());
			return isCreator || isProjectAdmin;
		}

		// PROJECT_APPROVED: ALL users of same project
		if ("PROJECT_APPROVED".equals(status)) {
			return userProjectId.equals(resource.getProjectId());
		}

		// PENDING_ORG_APPROVAL: ALL users of same project + Selected org admins
		if ("PENDING_ORG_APPROVAL".equals(status)) {
			boolean sameProject = userProjectId.equals(resource.getProjectId());
			boolean isSelectedOrgAdmin = "3".equals(userRank) && userOrganizationId.equals(resource.getApprovedOrganizationId());
			return sameProject || isSelectedOrgAdmin;
		}

		// ORG_APPROVED: ALL users of the approved organization + Platform Admins (reviewing before submission)
		if ("ORG_APPROVED".equals(status)) {
			boolean sameOrg = userOrganizationId.equals(resource.getApprovedOrganizationId());
			boolean isPlatformAdmin = "4".equals(userRank);
			return sameOrg || isPlatformAdmin;
		}

		// PENDING_PLATFORM_APPROVAL: ALL users of the submitting organization + Platform Admins (global)
		if ("PENDING_PLATFORM_APPROVAL".equals(status)) {
			boolean sameOrg = userOrganizationId.equals(resource.getApprovedOrganizationId());
			boolean isPlatformAdmin = "4".equals(userRank);
			return sameOrg || isPlatformAdmin;
		}

		// PLATFORM_REJECTED: ALL users of the submitting organization
		if ("PLATFORM_REJECTED".equals(status)) {
			return userOrganizationId.equals(resource.getApprovedOrganizationId());
		}

		// PROJECT_REJECTED: Creator only
		if ("PROJECT_REJECTED".equals(status)) {
			return resource.getCreatedBy().equals(currentUser);
		}

		// ORG_REJECTED: ALL users of same project
		if ("ORG_REJECTED".equals(status)) {
			return userProjectId.equals(resource.getProjectId());
		}

		// PUBLISHED: Globally visible (approvedOrganizationId == null, Platform-approved) to everyone,
		// or ALL users of approved organization (legacy org-scoped PUBLISHED records)
		if ("PUBLISHED".equals(status)) {
			return resource.getApprovedOrganizationId() == null
					|| userOrganizationId.equals(resource.getApprovedOrganizationId());
		}

		return false;
	}

	/**
	 * Get approval requests for Project Admin
	 * Shows: PENDING_PROJECT_APPROVAL resources of their project
	 */
	public List<ICIPStreamingServices> getProjectAdminApprovals(Integer projectId, String currentUserRank) {
		if (!"2".equals(currentUserRank)) {
			return new ArrayList<>();
		}

		List<ICIPStreamingServices> allResources = streamingServicesRepository.findAll();
		return allResources.stream()
			.filter(r -> "PENDING_PROJECT_APPROVAL".equals(r.getApprovalStatus()) && projectId.equals(r.getProjectId()))
			.collect(Collectors.toList());
	}

	/**
	 * Get approval requests for Org Admin
	 * Shows: PENDING_ORG_APPROVAL resources for their organization
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
	 * Get PROJECT_APPROVED resources for a project (for Draft Resources page)
	 */
	public List<ICIPStreamingServices> getDraftResources(Integer projectId, String currentUserRank) {
		if (!"2".equals(currentUserRank)) {
			return new ArrayList<>();
		}

		List<ICIPStreamingServices> allResources = streamingServicesRepository.findAll();
		return allResources.stream()
			.filter(r -> "PROJECT_APPROVED".equals(r.getApprovalStatus()) && projectId.equals(r.getProjectId()))
			.collect(Collectors.toList());
	}

	/**
	 * Org Admin draft view: ORG_APPROVED resources for this org, waiting to be
	 * submitted to Platform Admin for global publishing.
	 */
	public List<ICIPStreamingServices> getOrgAdminDraftResources(Integer organizationId, String currentUserRank) {
		if (!"3".equals(currentUserRank)) {
			return new ArrayList<>();
		}

		List<ICIPStreamingServices> allResources = streamingServicesRepository.findAll();
		return allResources.stream()
			.filter(r -> "ORG_APPROVED".equals(r.getApprovalStatus()) && organizationId.equals(r.getApprovedOrganizationId()))
			.collect(Collectors.toList());
	}

	/**
	 * Get approval requests for Platform Admin (global publishing requests)
	 */
	public List<ICIPStreamingServices> getPlatformAdminApprovals(String currentUserRank) {
		if (!"4".equals(currentUserRank)) {
			return new ArrayList<>();
		}

		List<ICIPStreamingServices> allResources = streamingServicesRepository.findAll();
		return allResources.stream()
			.filter(r -> "PENDING_PLATFORM_APPROVAL".equals(r.getApprovalStatus()))
			.collect(Collectors.toList());
	}

	/**
	 * Catalog for Platform Admin (rank 4): all globally PUBLISHED resources
	 * (approvedOrganizationId == null means Platform-approved, globally visible).
	 */
	public List<ICIPStreamingServices> getGloballyPublishedResources() {
		List<ICIPStreamingServices> allResources = streamingServicesRepository.findAll();
		return allResources.stream()
			.filter(r -> "PUBLISHED".equals(r.getApprovalStatus()) && r.getApprovedOrganizationId() == null)
			.collect(Collectors.toList());
	}
}
