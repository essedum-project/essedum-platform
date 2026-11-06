package com.lfn.icip.dataset.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
 *       -> ORG_APPROVED -> PENDING_PLATFORM_APPROVAL -> GLOBALLY_PUBLISHED
 * (with PROJECT_REJECTED / ORG_REJECTED / PLATFORM_REJECTED side-states at each gate)
 */
@Service
public class DatasourceApprovalWorkflowService {

	private static final Logger logger = LoggerFactory.getLogger(DatasourceApprovalWorkflowService.class);

	@Autowired
	private ICIPDatasourceRepository datasourceRepository;

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

		resource.setApprovalStatus("GLOBALLY_PUBLISHED");
		resource.setApprovedOrganizationId(null);
		return datasourceRepository.save(resource);
	}

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

	public List<ICIPDatasource> getProjectAdminApprovals(Integer projectId, String currentUserRank) {
		if (!"2".equals(currentUserRank)) {
			return new ArrayList<>();
		}
		return datasourceRepository.findByApprovalStatusAndProjectId("PENDING_PROJECT_APPROVAL", projectId);
	}

	public List<ICIPDatasource> getOrgAdminApprovals(Integer organizationId, String currentUserRank) {
		if (!"3".equals(currentUserRank)) {
			return new ArrayList<>();
		}
		return datasourceRepository.findByApprovalStatusAndApprovedOrganizationId("PENDING_ORG_APPROVAL", organizationId);
	}

	public List<ICIPDatasource> getPlatformAdminApprovals(String currentUserRank) {
		if (!"4".equals(currentUserRank)) {
			return new ArrayList<>();
		}
		return datasourceRepository.findByApprovalStatus("PENDING_PLATFORM_APPROVAL");
	}

	public List<ICIPDatasource> getDraftResources(Integer projectId, String currentUserRank) {
		if (!"2".equals(currentUserRank)) {
			return new ArrayList<>();
		}
		return datasourceRepository.findByApprovalStatusAndProjectId("PROJECT_APPROVED", projectId);
	}

	public List<ICIPDatasource> getOrgAdminDraftResources(Integer organizationId, String currentUserRank) {
		if (!"3".equals(currentUserRank)) {
			return new ArrayList<>();
		}
		return datasourceRepository.findByApprovalStatusAndApprovedOrganizationId("ORG_APPROVED", organizationId);
	}

	public List<ICIPDatasource> getCatalog(Integer projectId, Integer orgId) {
		if (projectId != null) {
			return datasourceRepository.findByApprovalStatusAndProjectId("PROJECT_APPROVED", projectId);
		}
		if (orgId != null) {
			return datasourceRepository.findByApprovalStatusAndApprovedOrganizationId("ORG_APPROVED", orgId);
		}
		return datasourceRepository.findByApprovalStatus("GLOBALLY_PUBLISHED").stream()
				.filter(r -> r.getApprovedOrganizationId() == null)
				.collect(Collectors.toList());
	}
}

