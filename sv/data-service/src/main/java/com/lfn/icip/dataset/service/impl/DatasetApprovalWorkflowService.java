package com.lfn.icip.dataset.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.repository.ICIPDatasetRepository;

/**
 * Dataset Approval Workflow Service.
 * Mirrors {@code com.lfn.icip.icipwebeditor.service.impl.ApprovalWorkflowService} (pipelines),
 * adapted for {@link ICIPDataset}. Handles the 4-level approval process:
 * AI Engineer (creator) -> Project Admin -> Org Admin -> Platform Admin.
 *
 * Status flow:
 * DRAFT -> PENDING_PROJECT_APPROVAL -> PROJECT_APPROVED -> PENDING_ORG_APPROVAL
 *       -> ORG_APPROVED -> PENDING_PLATFORM_APPROVAL -> GLOBALLY_PUBLISHED
 * (with PROJECT_REJECTED / ORG_REJECTED / PLATFORM_REJECTED side-states at each gate)
 */
@Service
public class DatasetApprovalWorkflowService {

	private static final Logger logger = LoggerFactory.getLogger(DatasetApprovalWorkflowService.class);

	@Autowired
	private ICIPDatasetRepository datasetRepository;

	/**
	 * Submit resource for Project Admin approval.
	 * Status: DRAFT / PROJECT_REJECTED -> PENDING_PROJECT_APPROVAL
	 */
	public ICIPDataset submitForProjectApproval(Integer id, Integer projectId, String currentUser) {
		logger.info("[DatasetApproval] Submitting dataset {} for project approval by user {}", id, currentUser);

		ICIPDataset resource = datasetRepository.findById(id).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Dataset not found: " + id);
		}

		if (!resource.getLastmodifiedby().equals(currentUser)) {
			throw new IllegalAccessError("Only creator can submit for approval");
		}

		String currentStatus = resource.getApprovalStatus();
		if (!"DRAFT".equals(currentStatus) && !"PROJECT_REJECTED".equals(currentStatus)) {
			throw new IllegalStateException("Only DRAFT or PROJECT_REJECTED resources can be submitted for approval");
		}

		resource.setApprovalStatus("PENDING_PROJECT_APPROVAL");
		resource.setProjectId(projectId);
		return datasetRepository.save(resource);
	}

	/**
	 * Project Admin approves resource.
	 * Status: PENDING_PROJECT_APPROVAL -> PROJECT_APPROVED
	 */
	public ICIPDataset approveProjectApproval(Integer id, Integer projectId, String currentUserRank) {
		logger.info("[DatasetApproval] Project Admin approving dataset {} for project {}", id, projectId);

		if (!"2".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Project Admin (rank 2) can approve");
		}

		ICIPDataset resource = datasetRepository.findById(id).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Dataset not found: " + id);
		}

		if (!"PENDING_PROJECT_APPROVAL".equals(resource.getApprovalStatus())) {
			throw new IllegalStateException("Only PENDING_PROJECT_APPROVAL resources can be approved");
		}

		if (resource.getProjectId() == null || resource.getProjectId() == 0) {
			resource.setProjectId(projectId);
		}

		resource.setApprovalStatus("PROJECT_APPROVED");
		return datasetRepository.save(resource);
	}

	/**
	 * Project Admin rejects resource.
	 * Status: PENDING_PROJECT_APPROVAL -> PROJECT_REJECTED
	 */
	public ICIPDataset rejectProjectApproval(Integer id, String currentUserRank) {
		logger.info("[DatasetApproval] Project Admin rejecting dataset {}", id);

		if (!"2".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Project Admin (rank 2) can reject");
		}

		ICIPDataset resource = datasetRepository.findById(id).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Dataset not found: " + id);
		}

		resource.setApprovalStatus("PROJECT_REJECTED");
		return datasetRepository.save(resource);
	}

	/**
	 * Project Admin submits approved resource to Org Admin.
	 * Status: PROJECT_APPROVED -> PENDING_ORG_APPROVAL
	 */
	public ICIPDataset submitForOrgApproval(Integer id, Integer targetOrganizationId, String currentUserRank) {
		logger.info("[DatasetApproval] Submitting dataset {} to org {} for org approval", id, targetOrganizationId);

		if (!"2".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Project Admin can submit to Org");
		}

		ICIPDataset resource = datasetRepository.findById(id).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Dataset not found: " + id);
		}

		if (!"PROJECT_APPROVED".equals(resource.getApprovalStatus())) {
			throw new IllegalStateException("Only PROJECT_APPROVED resources can be submitted to Org");
		}

		resource.setApprovalStatus("PENDING_ORG_APPROVAL");
		resource.setApprovedOrganizationId(targetOrganizationId);
		return datasetRepository.save(resource);
	}

	/**
	 * Org Admin approves org-level publishing.
	 * Status: PENDING_ORG_APPROVAL -> ORG_APPROVED (org-wide visible, awaiting platform submission)
	 */
	public ICIPDataset approveOrgApproval(Integer id, String currentUserRank) {
		logger.info("[DatasetApproval] Org Admin approving dataset {} at org level", id);

		if (!"3".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Org Admin (rank 3) can approve org-level publishing");
		}

		ICIPDataset resource = datasetRepository.findById(id).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Dataset not found: " + id);
		}

		if (!"PENDING_ORG_APPROVAL".equals(resource.getApprovalStatus())) {
			throw new IllegalStateException("Only PENDING_ORG_APPROVAL resources can be org-approved");
		}

		resource.setApprovalStatus("ORG_APPROVED");
		return datasetRepository.save(resource);
	}

	/**
	 * Org Admin rejects organization publishing.
	 * Status: PENDING_ORG_APPROVAL -> ORG_REJECTED
	 */
	public ICIPDataset rejectOrgApproval(Integer id, String currentUserRank) {
		logger.info("[DatasetApproval] Org Admin rejecting org approval for dataset {}", id);

		if (!"3".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Org Admin (rank 3) can reject org-level approval");
		}

		ICIPDataset resource = datasetRepository.findById(id).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Dataset not found: " + id);
		}

		resource.setApprovalStatus("ORG_REJECTED");
		return datasetRepository.save(resource);
	}

	/**
	 * Org Admin submits an ORG_APPROVED resource to Platform Admin for global publishing.
	 * Status: ORG_APPROVED -> PENDING_PLATFORM_APPROVAL
	 */
	public ICIPDataset submitForPlatformApproval(Integer id, String currentUserRank) {
		logger.info("[DatasetApproval] Org Admin submitting dataset {} for platform approval", id);

		if (!"3".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Org Admin (rank 3) can submit to Platform Admin");
		}

		ICIPDataset resource = datasetRepository.findById(id).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Dataset not found: " + id);
		}

		if (!"ORG_APPROVED".equals(resource.getApprovalStatus())) {
			throw new IllegalStateException("Only ORG_APPROVED resources can be submitted to Platform Admin");
		}

		resource.setApprovalStatus("PENDING_PLATFORM_APPROVAL");
		return datasetRepository.save(resource);
	}

	/**
	 * Platform Admin approves and publishes resource globally.
	 * Status: PENDING_PLATFORM_APPROVAL -> GLOBALLY_PUBLISHED (approvedOrganizationId cleared = global visibility)
	 */
	public ICIPDataset approvePlatformApproval(Integer id, String currentUserRank) {
		logger.info("[DatasetApproval] Platform Admin publishing dataset {} globally", id);

		if (!"4".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Platform Admin (rank 4) can publish globally");
		}

		ICIPDataset resource = datasetRepository.findById(id).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Dataset not found: " + id);
		}

		if (!"PENDING_PLATFORM_APPROVAL".equals(resource.getApprovalStatus())) {
			throw new IllegalStateException("Only PENDING_PLATFORM_APPROVAL resources can be platform-approved");
		}

		resource.setApprovalStatus("GLOBALLY_PUBLISHED");
		resource.setApprovedOrganizationId(null);
		return datasetRepository.save(resource);
	}

	/**
	 * Platform Admin rejects resource submitted for global publishing.
	 * Status: PENDING_PLATFORM_APPROVAL -> PLATFORM_REJECTED
	 */
	public ICIPDataset rejectPlatformApproval(Integer id, String currentUserRank) {
		logger.info("[DatasetApproval] Platform Admin rejecting dataset {}", id);

		if (!"4".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Platform Admin (rank 4) can reject");
		}

		ICIPDataset resource = datasetRepository.findById(id).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Dataset not found: " + id);
		}

		resource.setApprovalStatus("PLATFORM_REJECTED");
		return datasetRepository.save(resource);
	}

	/** Get approval requests for Project Admin — PENDING_PROJECT_APPROVAL for a project. */
	public List<ICIPDataset> getProjectAdminApprovals(Integer projectId, String currentUserRank) {
		if (!"2".equals(currentUserRank)) {
			return new ArrayList<>();
		}
		return datasetRepository.findByApprovalStatusAndProjectId("PENDING_PROJECT_APPROVAL", projectId);
	}

	/** Get approval requests for Org Admin — PENDING_ORG_APPROVAL for an org. */
	public List<ICIPDataset> getOrgAdminApprovals(Integer organizationId, String currentUserRank) {
		if (!"3".equals(currentUserRank)) {
			return new ArrayList<>();
		}
		return datasetRepository.findByApprovalStatusAndApprovedOrganizationId("PENDING_ORG_APPROVAL", organizationId);
	}

	/** Get approval requests for Platform Admin — PENDING_PLATFORM_APPROVAL (global). */
	public List<ICIPDataset> getPlatformAdminApprovals(String currentUserRank) {
		if (!"4".equals(currentUserRank)) {
			return new ArrayList<>();
		}
		return datasetRepository.findByApprovalStatus("PENDING_PLATFORM_APPROVAL");
	}

	/** Get PROJECT_APPROVED resources for a project (rank 2 "ready to submit to org" inbox). */
	public List<ICIPDataset> getDraftResources(Integer projectId, String currentUserRank) {
		if (!"2".equals(currentUserRank)) {
			return new ArrayList<>();
		}
		return datasetRepository.findByApprovalStatusAndProjectId("PROJECT_APPROVED", projectId);
	}

	/** Get ORG_APPROVED resources for an org (rank 3 "ready to submit to platform" inbox). */
	public List<ICIPDataset> getOrgAdminDraftResources(Integer organizationId, String currentUserRank) {
		if (!"3".equals(currentUserRank)) {
			return new ArrayList<>();
		}
		return datasetRepository.findByApprovalStatusAndApprovedOrganizationId("ORG_APPROVED", organizationId);
	}

	/**
	 * Catalog: visible items based on scope.
	 * projectId provided -> PROJECT_APPROVED items for that project.
	 * orgId provided -> GLOBALLY_PUBLISHED items with that org (legacy org-scoped) OR org-wide ORG_APPROVED.
	 * neither -> all GLOBALLY_PUBLISHED (platform-approved, global) items.
	 */
	public List<ICIPDataset> getCatalog(Integer projectId, Integer orgId) {
		if (projectId != null) {
			return datasetRepository.findByApprovalStatusAndProjectId("PROJECT_APPROVED", projectId);
		}
		if (orgId != null) {
			return datasetRepository.findByApprovalStatusAndApprovedOrganizationId("ORG_APPROVED", orgId);
		}
		return datasetRepository.findByApprovalStatus("GLOBALLY_PUBLISHED").stream()
				.filter(r -> r.getApprovedOrganizationId() == null)
				.collect(Collectors.toList());
	}
}

