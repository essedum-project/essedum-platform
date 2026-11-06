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
 * Approval Workflow Service for Datasources (Connections).
 * Mirrors the pipeline/streaming-service approval workflow so connections go through
 * the same 4-level approval process: Project Admin -> Org Admin -> Platform Admin.
 * Enforces visibility rules based on approval status and user rank.
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
	public ICIPDatasource submitForProjectApproval(Integer resourceId, Integer projectId, String currentUser) {
		logger.info("[Approval] Submitting datasource {} for project approval by user {}", resourceId, currentUser);

		ICIPDatasource resource = datasourceRepository.findById(resourceId).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Datasource not found: " + resourceId);
		}

		// Allow resubmission from DRAFT or PROJECT_REJECTED
		String currentStatus = resource.getApprovalStatus();
		if (currentStatus != null && !"DRAFT".equals(currentStatus) && !"PROJECT_REJECTED".equals(currentStatus)) {
			throw new IllegalStateException("Only DRAFT or PROJECT_REJECTED datasources can be submitted for approval");
		}

		resource.setApprovalStatus("PENDING_PROJECT_APPROVAL");
		resource.setProjectId(projectId);
		return datasourceRepository.save(resource);
	}

	/**
	 * Project Admin approves resource.
	 * Status: PENDING_PROJECT_APPROVAL -> PROJECT_APPROVED
	 * Resource becomes visible to ALL users of same project.
	 */
	public ICIPDatasource approveProjectApproval(Integer resourceId, Integer projectId, String currentUserRank) {
		logger.info("[Approval] Project Admin approving datasource {} for project {}, rank: {}", resourceId, projectId, currentUserRank);

		if (!"2".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Project Admin (rank 2) can approve");
		}

		ICIPDatasource resource = datasourceRepository.findById(resourceId).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Datasource not found: " + resourceId);
		}

		if (!"PENDING_PROJECT_APPROVAL".equals(resource.getApprovalStatus())) {
			throw new IllegalStateException("Only PENDING_PROJECT_APPROVAL datasources can be approved");
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
	public ICIPDatasource rejectProjectApproval(Integer resourceId, String currentUserRank) {
		logger.info("[Approval] Project Admin rejecting datasource {}", resourceId);

		if (!"2".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Project Admin (rank 2) can reject");
		}

		ICIPDatasource resource = datasourceRepository.findById(resourceId).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Datasource not found: " + resourceId);
		}

		resource.setApprovalStatus("PROJECT_REJECTED");
		return datasourceRepository.save(resource);
	}

	/**
	 * Project Admin submits an approved resource to Org Admin for org-level publishing.
	 * Status: PROJECT_APPROVED -> PENDING_ORG_APPROVAL
	 */
	public ICIPDatasource submitForOrgApproval(Integer resourceId, Integer targetOrganizationId, String currentUserRank) {
		logger.info("[Approval] Submitting datasource {} to org {} for org approval", resourceId, targetOrganizationId);

		if (!"2".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Project Admin can submit to Org");
		}

		ICIPDatasource resource = datasourceRepository.findById(resourceId).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Datasource not found: " + resourceId);
		}

		if (!"PROJECT_APPROVED".equals(resource.getApprovalStatus())) {
			throw new IllegalStateException("Only PROJECT_APPROVED datasources can be submitted to Org");
		}

		resource.setApprovalStatus("PENDING_ORG_APPROVAL");
		resource.setApprovedOrganizationId(targetOrganizationId);
		return datasourceRepository.save(resource);
	}

	/**
	 * Org Admin approves org-level publishing.
	 * Status: PENDING_ORG_APPROVAL -> ORG_APPROVED
	 * Visible to ALL users of the approved organization; awaits an explicit submission
	 * by the Org Admin to the Platform Admin before it becomes globally PUBLISHED.
	 */
	public ICIPDatasource approveOrgApproval(Integer resourceId, String currentUserRank) {
		logger.info("[Approval] Org Admin approving datasource {} at org level", resourceId);

		if (!"3".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Org Admin (rank 3) can approve org-level publishing");
		}

		ICIPDatasource resource = datasourceRepository.findById(resourceId).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Datasource not found: " + resourceId);
		}

		if (!"PENDING_ORG_APPROVAL".equals(resource.getApprovalStatus())) {
			throw new IllegalStateException("Only PENDING_ORG_APPROVAL datasources can be org-approved");
		}

		resource.setApprovalStatus("ORG_APPROVED");
		return datasourceRepository.save(resource);
	}

	/**
	 * Org Admin rejects organization publishing.
	 * Status: PENDING_ORG_APPROVAL -> ORG_REJECTED
	 */
	public ICIPDatasource rejectOrgApproval(Integer resourceId, String currentUserRank) {
		logger.info("[Approval] Org Admin rejecting org approval for datasource {}", resourceId);

		if (!"3".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Org Admin (rank 3) can reject org-level approval");
		}

		ICIPDatasource resource = datasourceRepository.findById(resourceId).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Datasource not found: " + resourceId);
		}

		resource.setApprovalStatus("ORG_REJECTED");
		return datasourceRepository.save(resource);
	}

	/**
	 * Org Admin submits an ORG_APPROVED resource to Platform Admin for global publishing.
	 * Status: ORG_APPROVED -> PENDING_PLATFORM_APPROVAL
	 */
	public ICIPDatasource submitForPlatformApproval(Integer resourceId, String currentUserRank) {
		logger.info("[Approval] Org Admin submitting datasource {} for platform approval", resourceId);

		if (!"3".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Org Admin (rank 3) can submit to Platform Admin");
		}

		ICIPDatasource resource = datasourceRepository.findById(resourceId).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Datasource not found: " + resourceId);
		}

		if (!"ORG_APPROVED".equals(resource.getApprovalStatus())) {
			throw new IllegalStateException("Only ORG_APPROVED datasources can be submitted to Platform Admin");
		}

		resource.setApprovalStatus("PENDING_PLATFORM_APPROVAL");
		return datasourceRepository.save(resource);
	}

	/**
	 * Platform Admin approves and publishes resource globally.
	 * Status: PENDING_PLATFORM_APPROVAL -> PUBLISHED (approvedOrganizationId cleared = global visibility)
	 */
	public ICIPDatasource approvePlatformApproval(Integer resourceId, String currentUserRank) {
		logger.info("[Approval] Platform Admin publishing datasource {} globally", resourceId);

		if (!"4".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Platform Admin (rank 4) can publish globally");
		}

		ICIPDatasource resource = datasourceRepository.findById(resourceId).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Datasource not found: " + resourceId);
		}

		if (!"PENDING_PLATFORM_APPROVAL".equals(resource.getApprovalStatus())) {
			throw new IllegalStateException("Only PENDING_PLATFORM_APPROVAL datasources can be platform-approved");
		}

		resource.setApprovalStatus("PUBLISHED");
		resource.setApprovedOrganizationId(null);
		return datasourceRepository.save(resource);
	}

	/**
	 * Platform Admin rejects resource submitted for global publishing.
	 * Status: PENDING_PLATFORM_APPROVAL -> PLATFORM_REJECTED
	 */
	public ICIPDatasource rejectPlatformApproval(Integer resourceId, String currentUserRank) {
		logger.info("[Approval] Platform Admin rejecting datasource {}", resourceId);

		if (!"4".equals(currentUserRank)) {
			throw new IllegalAccessError("Only Platform Admin (rank 4) can reject");
		}

		ICIPDatasource resource = datasourceRepository.findById(resourceId).orElse(null);
		if (resource == null) {
			throw new IllegalArgumentException("Datasource not found: " + resourceId);
		}

		resource.setApprovalStatus("PLATFORM_REJECTED");
		return datasourceRepository.save(resource);
	}

	/**
	 * Get approval requests for Project Admin (PENDING_PROJECT_APPROVAL in their project).
	 */
	public List<ICIPDatasource> getProjectAdminApprovals(Integer projectId, String currentUserRank) {
		if (!"2".equals(currentUserRank)) {
			return new ArrayList<>();
		}

		List<ICIPDatasource> all = datasourceRepository.findAll();
		return all.stream()
			.filter(r -> "PENDING_PROJECT_APPROVAL".equals(r.getApprovalStatus()) && projectId.equals(r.getProjectId()))
			.collect(Collectors.toList());
	}

	/**
	 * Get PROJECT_APPROVED resources for a project, available for Org submission.
	 */
	public List<ICIPDatasource> getDraftResources(Integer projectId, String currentUserRank) {
		if (!"2".equals(currentUserRank)) {
			return new ArrayList<>();
		}

		List<ICIPDatasource> all = datasourceRepository.findAll();
		return all.stream()
			.filter(r -> "PROJECT_APPROVED".equals(r.getApprovalStatus()) && projectId != null && projectId.equals(r.getProjectId()))
			.collect(Collectors.toList());
	}

	/**
	 * Get approval requests for Org Admin (PENDING_ORG_APPROVAL in their organization).
	 */
	public List<ICIPDatasource> getOrgAdminApprovals(Integer organizationId, String currentUserRank) {
		if (!"3".equals(currentUserRank)) {
			return new ArrayList<>();
		}

		List<ICIPDatasource> all = datasourceRepository.findAll();
		return all.stream()
			.filter(r -> "PENDING_ORG_APPROVAL".equals(r.getApprovalStatus()) && organizationId.equals(r.getApprovedOrganizationId()))
			.collect(Collectors.toList());
	}

	/**
	 * Org Admin draft view: ORG_APPROVED resources for this org, waiting to be
	 * submitted to Platform Admin for global publishing.
	 */
	public List<ICIPDatasource> getOrgAdminDraftResources(Integer organizationId, String currentUserRank) {
		if (!"3".equals(currentUserRank)) {
			return new ArrayList<>();
		}

		List<ICIPDatasource> all = datasourceRepository.findAll();
		return all.stream()
			.filter(r -> "ORG_APPROVED".equals(r.getApprovalStatus()) && organizationId.equals(r.getApprovedOrganizationId()))
			.collect(Collectors.toList());
	}

	/**
	 * Get approval requests for Platform Admin (global publishing requests).
	 */
	public List<ICIPDatasource> getPlatformAdminApprovals(String currentUserRank) {
		if (!"4".equals(currentUserRank)) {
			return new ArrayList<>();
		}

		List<ICIPDatasource> all = datasourceRepository.findAll();
		return all.stream()
			.filter(r -> "PENDING_PLATFORM_APPROVAL".equals(r.getApprovalStatus()))
			.collect(Collectors.toList());
	}

	/**
	 * Catalog: all approved datasources visible to a user given their project and org.
	 * Combines PROJECT_APPROVED (project-scoped) + ORG_APPROVED (org-scoped) + globally PUBLISHED.
	 * No rank restriction — any user in the project/org may call this.
	 */
	public List<ICIPDatasource> getCatalogResources(Integer projectId, Integer orgId) {
		List<ICIPDatasource> all = datasourceRepository.findAll();
		List<ICIPDatasource> result = new ArrayList<>();

		for (ICIPDatasource r : all) {
			String status = r.getApprovalStatus();
			if (status == null) continue;
			boolean include = false;

			if ("PROJECT_APPROVED".equals(status) && projectId != null && projectId.equals(r.getProjectId())) {
				include = true;
			} else if (("ORG_APPROVED".equals(status) || "PENDING_PLATFORM_APPROVAL".equals(status))
					&& orgId != null && orgId.equals(r.getApprovedOrganizationId())) {
				include = true;
			} else if ("PUBLISHED".equals(status) && r.getApprovedOrganizationId() == null) {
				include = true;
			}

			if (include) {
				result.add(r);
			}
		}

		logger.info("[Catalog] projectId={}, orgId={} -> {} datasource items", projectId, orgId, result.size());
		return result;
	}
}
