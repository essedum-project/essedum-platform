package com.lfn.icip.dataset.service.impl;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lfn.icip.approval.ApprovalCloneSupport;
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.model.ICIPDataset2;
import com.lfn.icip.dataset.repository.ICIPDatasetRepository;
import com.lfn.icip.dataset.repository.ICIPDatasetRepository2;

/**
 * Dataset Approval Workflow Service.
 * Mirrors {@code com.lfn.icip.icipwebeditor.service.impl.ApprovalWorkflowService} (pipelines),
 * adapted for {@link ICIPDataset}. Handles the 4-level approval process:
 * AI Engineer (creator) -> Project Admin -> Org Admin -> Platform Admin.
 *
 * Status flow:
 * DRAFT -> PENDING_PROJECT_APPROVAL -> PROJECT_APPROVED -> PENDING_ORG_APPROVAL
 *       -> ORG_APPROVED -> PENDING_PLATFORM_APPROVAL -> PUBLISHED
 * (with PROJECT_REJECTED / ORG_REJECTED / PLATFORM_REJECTED side-states at each gate)
 */
@Service
public class DatasetApprovalWorkflowService {

	private static final Logger logger = LoggerFactory.getLogger(DatasetApprovalWorkflowService.class);

	@Autowired
	private ICIPDatasetRepository datasetRepository;

	@Autowired
	private ICIPDatasetRepository2 datasetRepository2;

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
	 * organizationId: the approving org admin's portfolioId — stamped onto the record so queries
	 * using that same portfolioId can find it reliably.
	 */
	public ICIPDataset approveOrgApproval(Integer id, String currentUserRank, Integer organizationId) {
		logger.info("[DatasetApproval] Org Admin approving dataset {} at org level, orgId={}", id, organizationId);

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
		if (organizationId != null) {
			resource.setApprovedOrganizationId(organizationId);
		}
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
	 * Status: PENDING_PLATFORM_APPROVAL -> PUBLISHED (approvedOrganizationId = -1 = global visibility sentinel)
	 * Also accepts already-PUBLISHED datasets so platform admin can re-mark them as globally visible.
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

		String currentStatus = resource.getApprovalStatus();
		if (!"PENDING_PLATFORM_APPROVAL".equals(currentStatus) && !"PUBLISHED".equals(currentStatus)) {
			throw new IllegalStateException("Only PENDING_PLATFORM_APPROVAL (or already PUBLISHED) resources can be platform-approved");
		}

		// approvedOrganizationId = -1 is the sentinel meaning "platform-approved, globally visible".
		// Legacy rows that were directly PUBLISHED (never through the workflow) have null and stay org-scoped.
		resource.setApprovalStatus("PUBLISHED");
		resource.setApprovedOrganizationId(-1);
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
	 * Clone an approved/published dataset into a brand-new DRAFT dataset.
	 *
	 * The original row is never touched — it keeps serving at its current
	 * approval level. The clone is named {@code <base>-v<n>} (next free n) and
	 * re-enters the approval chain from DRAFT.
	 *
	 * The copy goes through {@link ICIPDataset2} because {@link ICIPDataset}
	 * maps dataset_schema / datasource / backing_dataset as non-insertable
	 * associations, which would otherwise be dropped on insert.
	 */
	@Transactional
	public ICIPDataset cloneDataset(Integer id, Integer projectId, String currentUser) {
		ICIPDataset original = datasetRepository.findById(id).orElse(null);
		if (original == null) {
			throw new IllegalArgumentException("Dataset not found: " + id);
		}
		if (!ApprovalCloneSupport.isCloneable(original.getApprovalStatus())) {
			throw new IllegalStateException(
					"Only approved or published datasets can be cloned (current status: " + original.getApprovalStatus() + ")");
		}

		ICIPDataset2 source = datasetRepository2.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Dataset not found: " + id));
		String org = source.getOrganization();
		String newName = ApprovalCloneSupport.nextVersionName(source.getName(),
				candidate -> datasetRepository.findByNameAndOrganization(candidate, org) != null);

		ICIPDataset2 clone = new ICIPDataset2();
		clone.setName(newName);
		clone.setAlias(ApprovalCloneSupport.cloneAlias(source.getAlias(), source.getName(), newName));
		clone.setDescription(source.getDescription());
		clone.setSchema(source.getSchema());
		clone.setSchemajson(source.getSchemajson());
		clone.setAttributes(source.getAttributes());
		clone.setType(source.getType());
		clone.setDatasource(source.getDatasource());
		clone.setBackingDataset(source.getBackingDataset());
		clone.setOrganization(org);
		clone.setExpStatus(source.getExpStatus());
		clone.setViews(source.getViews());
		clone.setContext(source.getContext());
		clone.setArchivalConfig(source.getArchivalConfig());
		clone.setIsArchivalEnabled(source.getIsArchivalEnabled());
		clone.setIsApprovalRequired(source.getIsApprovalRequired());
		clone.setIsPermissionManaged(source.getIsPermissionManaged());
		clone.setIsAuditRequired(source.getIsAuditRequired());
		clone.setIsInboxRequired(source.getIsInboxRequired());
		clone.setDashboard(source.getDashboard());
		clone.setMetadata(source.getMetadata());
		clone.setModeltype(source.getModeltype());
		clone.setTaskdetails(source.getTaskdetails());
		clone.setTags(source.getTags());
		clone.setInterfacetype(source.getInterfacetype());
		clone.setAdaptername(source.getAdaptername());
		clone.setIsadapteractive(source.getIsadapteractive());
		clone.setIndexname(source.getIndexname());
		clone.setSummary(source.getSummary());
		clone.setEvent_details(source.getEvent_details());
		clone.setLastmodifiedby(currentUser != null && !currentUser.isEmpty() ? currentUser : source.getLastmodifiedby());
		clone.setLastmodifieddate(new Timestamp(System.currentTimeMillis()));

		ICIPDataset2 savedClone = datasetRepository2.save(clone);

		// approval_status / project_id are not mapped on ICIPDataset2, so the
		// insert picks up the DB default — reset the clone to DRAFT explicitly.
		ICIPDataset draft = datasetRepository.findById(savedClone.getId())
				.orElseThrow(() -> new IllegalStateException("Clone not found after save: " + savedClone.getId()));
		draft.setApprovalStatus("DRAFT");
		draft.setProjectId(projectId != null ? projectId : original.getProjectId());
		draft.setApprovedOrganizationId(null);
		ICIPDataset saved = datasetRepository.save(draft);

		logger.info("[Clone] Dataset {} ('{}') cloned -> {} ('{}') as DRAFT in project {}",
				id, original.getName(), saved.getId(), saved.getName(), saved.getProjectId());
		return saved;
	}

	/**
	 * Catalog: visible items based on scope.
	 * projectId provided -> PROJECT_APPROVED items for that project.
	 * orgId provided -> PUBLISHED items with that org (legacy org-scoped) OR org-wide ORG_APPROVED.
	 * neither -> all PUBLISHED (platform-approved, global) items.
	 */
	public List<ICIPDataset> getCatalog(Integer projectId, Integer orgId) {
		if (projectId == null && orgId == null) {
			return datasetRepository.findByApprovalStatus("PUBLISHED").stream()
					.filter(r -> r.getApprovedOrganizationId() == null)
					.collect(Collectors.toList());
		}
		List<ICIPDataset> result = new ArrayList<>();
		java.util.Set<Integer> seen = new java.util.HashSet<>();
		if (projectId != null) {
			datasetRepository.findByApprovalStatusAndProjectId("PROJECT_APPROVED", projectId)
					.forEach(d -> { if (seen.add(d.getId())) result.add(d); });
		}
		if (orgId != null) {
			datasetRepository.findByApprovalStatusAndApprovedOrganizationId("ORG_APPROVED", orgId)
					.forEach(d -> { if (seen.add(d.getId())) result.add(d); });
		}
		return result;
	}
}

