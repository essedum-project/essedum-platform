package com.lfn.icip.icipwebeditor.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedModel;
import com.lfn.icip.icipwebeditor.repository.ICIPMLFederatedModelsRepository;

/**
 * Model Approval Workflow Service.
 * Mirrors DatasourceApprovalWorkflowService, adapted for ICIPMLFederatedModel.
 *
 * Status flow:
 * DRAFT -> PENDING_PROJECT_APPROVAL -> PROJECT_APPROVED -> PENDING_ORG_APPROVAL
 *       -> ORG_APPROVED -> PENDING_PLATFORM_APPROVAL -> PUBLISHED
 * (with PROJECT_REJECTED / ORG_REJECTED / PLATFORM_REJECTED side-states)
 */
@Service
public class ModelApprovalWorkflowService {

	private static final Logger logger = LoggerFactory.getLogger(ModelApprovalWorkflowService.class);

	@Autowired
	private ICIPMLFederatedModelsRepository modelRepository;

	/** Submit resource for Project Admin approval. DRAFT / PROJECT_REJECTED -> PENDING_PROJECT_APPROVAL */
	public ICIPMLFederatedModel submitForProjectApproval(Integer id, Integer projectId, String currentUser) {
		logger.info("[ModelApproval] Submitting model {} for project approval by user {}", id, currentUser);

		ICIPMLFederatedModel resource = modelRepository.findById(id).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Model not found: " + id);
		}

		if (resource.getModifiedBy() != null && !resource.getModifiedBy().equals(currentUser)) {
			throw new IllegalAccessError("Only creator/modifier can submit for approval");
		}

		String currentStatus = resource.getApprovalStatus();
		if (!"DRAFT".equals(currentStatus) && !"PROJECT_REJECTED".equals(currentStatus)) {
			throw new IllegalStateException("Only DRAFT or PROJECT_REJECTED models can be submitted for approval");
		}

		resource.setApprovalStatus("PENDING_PROJECT_APPROVAL");
		resource.setProjectId(projectId);
		return modelRepository.save(resource);
	}

	/** Project Admin approves model. PENDING_PROJECT_APPROVAL -> PROJECT_APPROVED */
	public ICIPMLFederatedModel approveProjectApproval(Integer id, Integer projectId, String currentUserRank) {
		logger.info("[ModelApproval] Project Admin approving model {} for project {}", id, projectId);

		if (!"2".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Project Admin (rank 2) can approve");
		}

		ICIPMLFederatedModel resource = modelRepository.findById(id).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Model not found: " + id);
		}

		if (!"PENDING_PROJECT_APPROVAL".equals(resource.getApprovalStatus())) {
			throw new IllegalStateException("Only PENDING_PROJECT_APPROVAL models can be approved");
		}

		if (resource.getProjectId() == null || resource.getProjectId() == 0) {
			resource.setProjectId(projectId);
		}

		resource.setApprovalStatus("PROJECT_APPROVED");
		return modelRepository.save(resource);
	}

	/** Project Admin rejects model. PENDING_PROJECT_APPROVAL -> PROJECT_REJECTED */
	public ICIPMLFederatedModel rejectProjectApproval(Integer id, String currentUserRank) {
		logger.info("[ModelApproval] Project Admin rejecting model {}", id);

		if (!"2".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Project Admin (rank 2) can reject");
		}

		ICIPMLFederatedModel resource = modelRepository.findById(id).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Model not found: " + id);
		}

		resource.setApprovalStatus("PROJECT_REJECTED");
		return modelRepository.save(resource);
	}

	/** Project Admin submits approved model to Org Admin. PROJECT_APPROVED -> PENDING_ORG_APPROVAL */
	public ICIPMLFederatedModel submitForOrgApproval(Integer id, Integer targetOrganizationId, String currentUserRank) {
		logger.info("[ModelApproval] Submitting model {} to org {} for org approval", id, targetOrganizationId);

		if (!"2".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Project Admin can submit to Org");
		}

		ICIPMLFederatedModel resource = modelRepository.findById(id).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Model not found: " + id);
		}

		if (!"PROJECT_APPROVED".equals(resource.getApprovalStatus())) {
			throw new IllegalStateException("Only PROJECT_APPROVED models can be submitted to Org");
		}

		resource.setApprovalStatus("PENDING_ORG_APPROVAL");
		resource.setApprovedOrganizationId(targetOrganizationId);
		return modelRepository.save(resource);
	}

	/** Org Admin approves org-level publishing. PENDING_ORG_APPROVAL -> ORG_APPROVED */
	public ICIPMLFederatedModel approveOrgApproval(Integer id, String currentUserRank) {
		logger.info("[ModelApproval] Org Admin approving model {} at org level", id);

		if (!"3".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Org Admin (rank 3) can approve org-level publishing");
		}

		ICIPMLFederatedModel resource = modelRepository.findById(id).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Model not found: " + id);
		}

		if (!"PENDING_ORG_APPROVAL".equals(resource.getApprovalStatus())) {
			throw new IllegalStateException("Only PENDING_ORG_APPROVAL models can be org-approved");
		}

		resource.setApprovalStatus("ORG_APPROVED");
		return modelRepository.save(resource);
	}

	/** Org Admin rejects organization publishing. PENDING_ORG_APPROVAL -> ORG_REJECTED */
	public ICIPMLFederatedModel rejectOrgApproval(Integer id, String currentUserRank) {
		logger.info("[ModelApproval] Org Admin rejecting org approval for model {}", id);

		if (!"3".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Org Admin (rank 3) can reject org-level approval");
		}

		ICIPMLFederatedModel resource = modelRepository.findById(id).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Model not found: " + id);
		}

		resource.setApprovalStatus("ORG_REJECTED");
		return modelRepository.save(resource);
	}

	/** Org Admin submits ORG_APPROVED model for global publishing. ORG_APPROVED -> PENDING_PLATFORM_APPROVAL */
	public ICIPMLFederatedModel submitForPlatformApproval(Integer id, String currentUserRank) {
		logger.info("[ModelApproval] Org Admin submitting model {} for platform approval", id);

		if (!"3".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Org Admin (rank 3) can submit to Platform Admin");
		}

		ICIPMLFederatedModel resource = modelRepository.findById(id).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Model not found: " + id);
		}

		if (!"ORG_APPROVED".equals(resource.getApprovalStatus())) {
			throw new IllegalStateException("Only ORG_APPROVED models can be submitted to Platform Admin");
		}

		resource.setApprovalStatus("PENDING_PLATFORM_APPROVAL");
		return modelRepository.save(resource);
	}

	/** Platform Admin publishes model globally. PENDING_PLATFORM_APPROVAL -> PUBLISHED */
	public ICIPMLFederatedModel approvePlatformApproval(Integer id, String currentUserRank) {
		logger.info("[ModelApproval] Platform Admin publishing model {} globally", id);

		if (!"4".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Platform Admin (rank 4) can publish globally");
		}

		ICIPMLFederatedModel resource = modelRepository.findById(id).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Model not found: " + id);
		}

		if (!"PENDING_PLATFORM_APPROVAL".equals(resource.getApprovalStatus())) {
			throw new IllegalStateException("Only PENDING_PLATFORM_APPROVAL models can be platform-approved");
		}

		resource.setApprovalStatus("PUBLISHED");
		resource.setApprovedOrganizationId(null);
		return modelRepository.save(resource);
	}

	/** Platform Admin rejects model submitted for global publishing. PENDING_PLATFORM_APPROVAL -> PLATFORM_REJECTED */
	public ICIPMLFederatedModel rejectPlatformApproval(Integer id, String currentUserRank) {
		logger.info("[ModelApproval] Platform Admin rejecting model {}", id);

		if (!"4".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Platform Admin (rank 4) can reject");
		}

		ICIPMLFederatedModel resource = modelRepository.findById(id).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Model not found: " + id);
		}

		resource.setApprovalStatus("PLATFORM_REJECTED");
		return modelRepository.save(resource);
	}

	/** Get PENDING_PROJECT_APPROVAL models for a project (rank 2 inbox). */
	public List<ICIPMLFederatedModel> getProjectAdminApprovals(Integer projectId, String currentUserRank) {
		if (!"2".equals(currentUserRank)) {
			return new ArrayList<>();
		}
		return modelRepository.findByApprovalStatusAndProjectId("PENDING_PROJECT_APPROVAL", projectId);
	}

	/** Get PENDING_ORG_APPROVAL models for an org (rank 3 inbox). */
	public List<ICIPMLFederatedModel> getOrgAdminApprovals(Integer organizationId, String currentUserRank) {
		if (!"3".equals(currentUserRank)) {
			return new ArrayList<>();
		}
		return modelRepository.findByApprovalStatusAndApprovedOrganizationId("PENDING_ORG_APPROVAL", organizationId);
	}

	/** Get PENDING_PLATFORM_APPROVAL models (rank 4 global inbox). */
	public List<ICIPMLFederatedModel> getPlatformAdminApprovals(String currentUserRank) {
		if (!"4".equals(currentUserRank)) {
			return new ArrayList<>();
		}
		return modelRepository.findByApprovalStatus("PENDING_PLATFORM_APPROVAL");
	}

	/** Get PROJECT_APPROVED models for a project (rank 2 "ready to submit to org" queue). */
	public List<ICIPMLFederatedModel> getDraftResources(Integer projectId, String currentUserRank) {
		if (!"2".equals(currentUserRank)) {
			return new ArrayList<>();
		}
		return modelRepository.findByApprovalStatusAndProjectId("PROJECT_APPROVED", projectId);
	}

	/** Get ORG_APPROVED models for an org (rank 3 "ready to submit to platform" queue). */
	public List<ICIPMLFederatedModel> getOrgAdminDraftResources(Integer organizationId, String currentUserRank) {
		if (!"3".equals(currentUserRank)) {
			return new ArrayList<>();
		}
		return modelRepository.findByApprovalStatusAndApprovedOrganizationId("ORG_APPROVED", organizationId);
	}
}
