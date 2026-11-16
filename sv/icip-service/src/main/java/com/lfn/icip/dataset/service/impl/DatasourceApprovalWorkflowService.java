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
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.repository.ICIPDatasourceRepository;

/**
 * Datasource (Connection) Approval Workflow Service.
 * Mirrors {@link DatasetApprovalWorkflowService}, adapted for {@link ICIPDatasource}.
 * Handles the 4-level approval process: AI Engineer (creator) -> Project Admin
 * -> Org Admin -> Platform Admin.
 *
 * Status flow:
 * DRAFT -> PENDING_PROJECT_APPROVAL -> PROJECT_APPROVED -> PENDING_ORG_APPROVAL
 *       -> ORG_APPROVED -> PENDING_PLATFORM_APPROVAL -> PUBLISHED
 * (with PROJECT_REJECTED / ORG_REJECTED / PLATFORM_REJECTED side-states at each gate)
 */
@Service
public class DatasourceApprovalWorkflowService {

	private static final Logger logger = LoggerFactory.getLogger(DatasourceApprovalWorkflowService.class);

	@Autowired
	private ICIPDatasourceRepository datasourceRepository;

	/**
	 * Submit resource for Project Admin approval.
	 * Status: DRAFT / PROJECT_REJECTED -> PENDING_PROJECT_APPROVAL
	 */
	public ICIPDatasource submitForProjectApproval(Integer id, Integer projectId, String currentUser) {
		logger.info("[DatasourceApproval] Submitting datasource {} for project approval by user {}", id, currentUser);

		ICIPDatasource resource = datasourceRepository.findById(id).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Datasource not found: " + id);
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
		return datasourceRepository.save(resource);
	}

	/**
	 * Project Admin approves resource.
	 * Status: PENDING_PROJECT_APPROVAL -> PROJECT_APPROVED
	 */
	public ICIPDatasource approveProjectApproval(Integer id, Integer projectId, String currentUserRank) {
		logger.info("[DatasourceApproval] Project Admin approving datasource {} for project {}", id, projectId);

		if (!"2".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Project Admin (rank 2) can approve");
		}

		ICIPDatasource resource = datasourceRepository.findById(id).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Datasource not found: " + id);
		}

		if (!"PENDING_PROJECT_APPROVAL".equals(resource.getApprovalStatus())) {
			throw new IllegalStateException("Only PENDING_PROJECT_APPROVAL resources can be approved");
		}

		if (resource.getProjectId() == null || resource.getProjectId() == 0) {
			resource.setProjectId(projectId);
		}

		resource.setApprovalStatus("PROJECT_APPROVED");
		return datasourceRepository.save(resource);
	}

	/**
	 * Project Admin rejects resource.
	 * Status: PENDING_PROJECT_APPROVAL -> PROJECT_REJECTED
	 */
	public ICIPDatasource rejectProjectApproval(Integer id, String currentUserRank) {
		logger.info("[DatasourceApproval] Project Admin rejecting datasource {}", id);

		if (!"2".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Project Admin (rank 2) can reject");
		}

		ICIPDatasource resource = datasourceRepository.findById(id).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Datasource not found: " + id);
		}

		resource.setApprovalStatus("PROJECT_REJECTED");
		return datasourceRepository.save(resource);
	}

	/**
	 * Project Admin submits approved resource to Org Admin.
	 * Status: PROJECT_APPROVED -> PENDING_ORG_APPROVAL
	 */
	public ICIPDatasource submitForOrgApproval(Integer id, Integer targetOrganizationId, String currentUserRank) {
		logger.info("[DatasourceApproval] Submitting datasource {} to org {} for org approval", id, targetOrganizationId);

		if (!"2".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Project Admin can submit to Org");
		}

		ICIPDatasource resource = datasourceRepository.findById(id).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Datasource not found: " + id);
		}

		if (!"PROJECT_APPROVED".equals(resource.getApprovalStatus())) {
			throw new IllegalStateException("Only PROJECT_APPROVED resources can be submitted to Org");
		}

		resource.setApprovalStatus("PENDING_ORG_APPROVAL");
		resource.setApprovedOrganizationId(targetOrganizationId);
		return datasourceRepository.save(resource);
	}

	/**
	 * Org Admin approves org-level publishing.
	 * Status: PENDING_ORG_APPROVAL -> ORG_APPROVED (org-wide visible, awaiting platform submission)
	 */
	public ICIPDatasource approveOrgApproval(Integer id, String currentUserRank) {
		logger.info("[DatasourceApproval] Org Admin approving datasource {} at org level", id);

		if (!"3".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Org Admin (rank 3) can approve org-level publishing");
		}

		ICIPDatasource resource = datasourceRepository.findById(id).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Datasource not found: " + id);
		}

		if (!"PENDING_ORG_APPROVAL".equals(resource.getApprovalStatus())) {
			throw new IllegalStateException("Only PENDING_ORG_APPROVAL resources can be org-approved");
		}

		resource.setApprovalStatus("ORG_APPROVED");
		return datasourceRepository.save(resource);
	}

	/**
	 * Org Admin rejects organization publishing.
	 * Status: PENDING_ORG_APPROVAL -> ORG_REJECTED
	 */
	public ICIPDatasource rejectOrgApproval(Integer id, String currentUserRank) {
		logger.info("[DatasourceApproval] Org Admin rejecting org approval for datasource {}", id);

		if (!"3".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Org Admin (rank 3) can reject org-level approval");
		}

		ICIPDatasource resource = datasourceRepository.findById(id).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Datasource not found: " + id);
		}

		resource.setApprovalStatus("ORG_REJECTED");
		return datasourceRepository.save(resource);
	}

	/**
	 * Org Admin submits an ORG_APPROVED resource to Platform Admin for global publishing.
	 * Status: ORG_APPROVED -> PENDING_PLATFORM_APPROVAL
	 */
	public ICIPDatasource submitForPlatformApproval(Integer id, String currentUserRank) {
		logger.info("[DatasourceApproval] Org Admin submitting datasource {} for platform approval", id);

		if (!"3".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Org Admin (rank 3) can submit to Platform Admin");
		}

		ICIPDatasource resource = datasourceRepository.findById(id).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Datasource not found: " + id);
		}

		if (!"ORG_APPROVED".equals(resource.getApprovalStatus())) {
			throw new IllegalStateException("Only ORG_APPROVED resources can be submitted to Platform Admin");
		}

		resource.setApprovalStatus("PENDING_PLATFORM_APPROVAL");
		return datasourceRepository.save(resource);
	}

	/**
	 * Platform Admin approves and publishes resource globally.
	 * Status: PENDING_PLATFORM_APPROVAL -> PUBLISHED (approvedOrganizationId cleared = global visibility)
	 */
	public ICIPDatasource approvePlatformApproval(Integer id, String currentUserRank) {
		logger.info("[DatasourceApproval] Platform Admin publishing datasource {} globally", id);

		if (!"4".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Platform Admin (rank 4) can publish globally");
		}

		ICIPDatasource resource = datasourceRepository.findById(id).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Datasource not found: " + id);
		}

		if (!"PENDING_PLATFORM_APPROVAL".equals(resource.getApprovalStatus())) {
			throw new IllegalStateException("Only PENDING_PLATFORM_APPROVAL resources can be platform-approved");
		}

		resource.setApprovalStatus("PUBLISHED");
		resource.setApprovedOrganizationId(null);
		return datasourceRepository.save(resource);
	}

	/**
	 * Platform Admin rejects resource submitted for global publishing.
	 * Status: PENDING_PLATFORM_APPROVAL -> PLATFORM_REJECTED
	 */
	public ICIPDatasource rejectPlatformApproval(Integer id, String currentUserRank) {
		logger.info("[DatasourceApproval] Platform Admin rejecting datasource {}", id);

		if (!"4".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Platform Admin (rank 4) can reject");
		}

		ICIPDatasource resource = datasourceRepository.findById(id).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Datasource not found: " + id);
		}

		resource.setApprovalStatus("PLATFORM_REJECTED");
		return datasourceRepository.save(resource);
	}

	/** Get approval requests for Project Admin — PENDING_PROJECT_APPROVAL for a project. */
	public List<ICIPDatasource> getProjectAdminApprovals(Integer projectId, String currentUserRank) {
		if (!"2".equals(currentUserRank)) {
			return new ArrayList<>();
		}
		return datasourceRepository.findByApprovalStatusAndProjectId("PENDING_PROJECT_APPROVAL", projectId);
	}

	/** Get approval requests for Org Admin — PENDING_ORG_APPROVAL for an org. */
	public List<ICIPDatasource> getOrgAdminApprovals(Integer organizationId, String currentUserRank) {
		if (!"3".equals(currentUserRank)) {
			return new ArrayList<>();
		}
		return datasourceRepository.findByApprovalStatusAndApprovedOrganizationId("PENDING_ORG_APPROVAL", organizationId);
	}

	/** Get approval requests for Platform Admin — PENDING_PLATFORM_APPROVAL (global). */
	public List<ICIPDatasource> getPlatformAdminApprovals(String currentUserRank) {
		if (!"4".equals(currentUserRank)) {
			return new ArrayList<>();
		}
		return datasourceRepository.findByApprovalStatus("PENDING_PLATFORM_APPROVAL");
	}

	/** Get PROJECT_APPROVED resources for a project (rank 2 "ready to submit to org" inbox). */
	public List<ICIPDatasource> getDraftResources(Integer projectId, String currentUserRank) {
		if (!"2".equals(currentUserRank)) {
			return new ArrayList<>();
		}
		return datasourceRepository.findByApprovalStatusAndProjectId("PROJECT_APPROVED", projectId);
	}

	/** Get ORG_APPROVED resources for an org (rank 3 "ready to submit to platform" inbox). */
	public List<ICIPDatasource> getOrgAdminDraftResources(Integer organizationId, String currentUserRank) {
		if (!"3".equals(currentUserRank)) {
			return new ArrayList<>();
		}
		return datasourceRepository.findByApprovalStatusAndApprovedOrganizationId("ORG_APPROVED", organizationId);
	}

	/**
	 * Catalog: visible items based on scope.
	 * projectId provided -> PROJECT_APPROVED items for that project.
	 * orgId provided -> ORG_APPROVED items for that org.
	 * neither -> all PUBLISHED (platform-approved, global) items.
	 */
	public List<ICIPDatasource> getCatalog(Integer projectId, Integer orgId) {
		if (projectId != null) {
			return datasourceRepository.findByApprovalStatusAndProjectId("PROJECT_APPROVED", projectId);
		}
		if (orgId != null) {
			return datasourceRepository.findByApprovalStatusAndApprovedOrganizationId("ORG_APPROVED", orgId);
		}
		return datasourceRepository.findByApprovalStatus("PUBLISHED").stream()
				.filter(r -> r.getApprovedOrganizationId() == null)
				.collect(Collectors.toList());
	}

	/**
	 * Clone an approved/published datasource into a brand-new DRAFT datasource.
	 *
	 * The original row is never touched — it keeps serving at its current
	 * approval level. The clone is named {@code <base>-v<n>} (next free n) and
	 * re-enters the approval chain from DRAFT.
	 */
	@Transactional
	public ICIPDatasource cloneDatasource(Integer resourceId, Integer projectId, String currentUser) {
		ICIPDatasource original = datasourceRepository.findById(resourceId).orElse(null);
		if (original == null) {
			throw new IllegalArgumentException("Datasource not found: " + resourceId);
		}
		if (!ApprovalCloneSupport.isCloneable(original.getApprovalStatus())) {
			throw new IllegalStateException(
					"Only approved or published connections can be cloned (current status: " + original.getApprovalStatus() + ")");
		}

		String org = original.getOrganization();
		String newName = ApprovalCloneSupport.nextVersionName(original.getName(),
				candidate -> datasourceRepository.findByNameAndOrganization(candidate, org) != null);

		ICIPDatasource clone = new ICIPDatasource();
		clone.setName(newName);
		clone.setAlias(ApprovalCloneSupport.cloneAlias(original.getAlias(), original.getName(), newName));
		clone.setDescription(original.getDescription());
		clone.setType(original.getType());
		clone.setConnectionDetails(original.getConnectionDetails());
		clone.setSalt(original.getSalt());
		clone.setOrganization(org);
		clone.setDshashcode(original.getDshashcode());
		clone.setActivetime(original.getActivetime());
		clone.setCategory(original.getCategory());
		clone.setExtras(original.getExtras());
		clone.setInterfacetype(original.getInterfacetype());
		clone.setFordataset(original.getFordataset());
		clone.setForruntime(original.getForruntime());
		clone.setForadapter(original.getForadapter());
		clone.setFormodel(original.getFormodel());
		clone.setForpromptprovider(original.getForpromptprovider());
		clone.setForendpoint(original.getForendpoint());
		clone.setForapp(original.getForapp());
		clone.setLastmodifiedby(currentUser != null && !currentUser.isEmpty() ? currentUser : original.getLastmodifiedby());
		clone.setLastmodifieddate(new Timestamp(System.currentTimeMillis()));

		clone.setApprovalStatus("DRAFT");
		clone.setProjectId(projectId != null ? projectId : original.getProjectId());
		clone.setApprovedOrganizationId(null);

		ICIPDatasource saved = datasourceRepository.save(clone);
		logger.info("[Clone] Datasource {} ('{}') cloned -> {} ('{}') as DRAFT in project {}",
				resourceId, original.getName(), saved.getId(), saved.getName(), saved.getProjectId());
		return saved;
	}
}

