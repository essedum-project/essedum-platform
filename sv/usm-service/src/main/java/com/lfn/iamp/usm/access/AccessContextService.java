package com.lfn.iamp.usm.access;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.lfn.iamp.usm.audit.AuditService;
import com.lfn.iamp.usm.domain.Organisation;
import com.lfn.iamp.usm.domain.Project;
import com.lfn.iamp.usm.identity.IdentityProjectionService;
import com.lfn.iamp.usm.repository.OrganisationRepository;
import com.lfn.iamp.usm.repository.ProjectRepository;

/**
 * The one access-resolution mechanism (§2 design philosophy #1): answers
 * "what can this user see" for menus, asset visibility, and API
 * authorization from a single set of role_assignment rows — not three
 * separate code paths.
 *
 * No caching yet (§4 describes a short-TTL cache keyed on userId,
 * invalidated on role_assignment writes) — add once this is load-tested.
 */
@Service
public class AccessContextService {

	/** Matches rbac_role's seeded platform_admin rank (changelog/rbac/rbac.xml). */
	private static final int PLATFORM_ADMIN_RANK = 4;

	private final RoleAssignmentRepository roleAssignmentRepository;
	private final RbacRoleRepository rbacRoleRepository;
	private final ProjectRepository projectRepository;
	private final OrganisationRepository organisationRepository;
	private final AuditService auditService;
	private final IdentityProjectionService identityProjectionService;

	public AccessContextService(RoleAssignmentRepository roleAssignmentRepository,
			RbacRoleRepository rbacRoleRepository, ProjectRepository projectRepository,
			OrganisationRepository organisationRepository, AuditService auditService,
			IdentityProjectionService identityProjectionService) {
		this.roleAssignmentRepository = roleAssignmentRepository;
		this.rbacRoleRepository = rbacRoleRepository;
		this.projectRepository = projectRepository;
		this.organisationRepository = organisationRepository;
		this.auditService = auditService;
		this.identityProjectionService = identityProjectionService;
	}

	public AccessContext resolve(Integer userId) {
		List<RoleAssignment> active = roleAssignmentRepository.findByUserIdAndRevokedAtIsNull(userId);

		int highestRank = active.stream()
				.map(a -> rbacRoleRepository.findById(a.getRoleId()).map(RbacRole::getRank).orElse(0))
				.max(Integer::compareTo)
				.orElse(0);

		// Platform admins reach everything.
		if (highestRank >= PLATFORM_ADMIN_RANK) {
			List<Integer> allProjectIds = projectRepository.findAll().stream()
					.map(Project::getId)
					.collect(Collectors.toList());
			List<Integer> allOrganizationIds = organisationRepository.findAll().stream()
					.map(Organisation::getId)
					.collect(Collectors.toList());
			return new AccessContext(userId, highestRank, allProjectIds, allOrganizationIds);
		}

		List<Integer> organizationIds = active.stream()
				.map(RoleAssignment::getOrganizationId)
				.filter(id -> id != null)
				.distinct()
				.collect(Collectors.toList());

		List<Integer> projectIds = active.stream()
				.map(RoleAssignment::getProjectId)
				.filter(id -> id != null)
				.distinct()
				.collect(Collectors.toList());

		// Org-scoped grants now expand to every project in that org, using the
		// organisation_id column added on usm_project (§11 phase-2 migration,
		// pulled forward — see changelog/rbac/rbac.xml rbac-8).
		if (!organizationIds.isEmpty()) {
			List<Integer> orgProjectIds = projectRepository.findAll().stream()
					.filter(p -> p.getOrganisationId() != null && organizationIds.contains(p.getOrganisationId()))
					.map(Project::getId)
					.collect(Collectors.toList());
			for (Integer id : orgProjectIds) {
				if (!projectIds.contains(id)) {
					projectIds.add(id);
				}
			}
		}

		return new AccessContext(userId, highestRank, projectIds, organizationIds);
	}

	/** Highest rank across a fixed set of gates — used by the approvals queue (§6). */
	public int highestRank(Integer userId) {
		return resolve(userId).getHighestRank();
	}

	public RoleAssignment grant(Integer userId, Integer roleId, Integer organizationId, Integer projectId) {
		if (organizationId != null && projectId != null) {
			throw new IllegalArgumentException("A role assignment scopes to at most one of organization/project");
		}
		RoleAssignment assignment = new RoleAssignment();
		assignment.setUserId(userId);
		assignment.setRoleId(roleId);
		assignment.setOrganizationId(organizationId);
		assignment.setProjectId(projectId);
		assignment.setGrantedAt(Instant.now());
		RoleAssignment saved = roleAssignmentRepository.save(assignment);
		auditService.record("role_assignment", "granted", userId, "User #" + userId,
				"role " + roleId + " granted, org=" + organizationId + " project=" + projectId);
		identityProjectionService.enqueueForProject(projectId);
		return saved;
	}

	public void revoke(Integer roleAssignmentId) {
		roleAssignmentRepository.findById(roleAssignmentId).ifPresent(assignment -> {
			assignment.setRevokedAt(Instant.now());
			roleAssignmentRepository.save(assignment);
			auditService.record("role_assignment", "revoked", assignment.getUserId(),
					"User #" + assignment.getUserId(), "role_assignment #" + roleAssignmentId + " revoked");
		});
	}

	public List<RoleAssignment> listActive() {
		return roleAssignmentRepository.findByRevokedAtIsNull();
	}

	public List<RbacRole> listRoles() {
		return Collections.unmodifiableList(rbacRoleRepository.findAll());
	}
}
