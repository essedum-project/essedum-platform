package com.lfn.iamp.usm.access;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.lfn.iamp.usm.domain.Organisation;
import com.lfn.iamp.usm.domain.Project;
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

	public AccessContextService(RoleAssignmentRepository roleAssignmentRepository,
			RbacRoleRepository rbacRoleRepository, ProjectRepository projectRepository,
			OrganisationRepository organisationRepository) {
		this.roleAssignmentRepository = roleAssignmentRepository;
		this.rbacRoleRepository = rbacRoleRepository;
		this.projectRepository = projectRepository;
		this.organisationRepository = organisationRepository;
	}

	public AccessContext resolve(Integer userId) {
		List<RoleAssignment> active = roleAssignmentRepository.findByUserIdAndRevokedAtIsNull(userId);

		int highestRank = active.stream()
				.map(a -> rbacRoleRepository.findById(a.getRoleId()).map(RbacRole::getRank).orElse(0))
				.max(Integer::compareTo)
				.orElse(0);

		// Platform admins reach everything. Below that rank, reach is limited to
		// explicit project-scoped grants — org-scoped grants can't yet expand to
		// "every project in that org" because usm_project has no FK to
		// usm_organisation in the current schema (confirmed gap, plan Appendix A).
		// That needs the §11 phase-2 migration before org-scoped reach is correct.
		if (highestRank >= PLATFORM_ADMIN_RANK) {
			List<Integer> allProjectIds = projectRepository.findAll().stream()
					.map(Project::getId)
					.collect(Collectors.toList());
			List<Integer> allOrganizationIds = organisationRepository.findAll().stream()
					.map(Organisation::getId)
					.collect(Collectors.toList());
			return new AccessContext(userId, highestRank, allProjectIds, allOrganizationIds);
		}

		List<Integer> projectIds = active.stream()
				.map(RoleAssignment::getProjectId)
				.filter(id -> id != null)
				.distinct()
				.collect(Collectors.toList());

		List<Integer> organizationIds = active.stream()
				.map(RoleAssignment::getOrganizationId)
				.filter(id -> id != null)
				.distinct()
				.collect(Collectors.toList());

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
		return roleAssignmentRepository.save(assignment);
	}

	public void revoke(Integer roleAssignmentId) {
		roleAssignmentRepository.findById(roleAssignmentId).ifPresent(assignment -> {
			assignment.setRevokedAt(Instant.now());
			roleAssignmentRepository.save(assignment);
		});
	}

	public List<RoleAssignment> listActive() {
		return roleAssignmentRepository.findByRevokedAtIsNull();
	}

	public List<RbacRole> listRoles() {
		return Collections.unmodifiableList(rbacRoleRepository.findAll());
	}
}
