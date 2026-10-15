package com.lfn.iamp.usm.access;

import java.time.Instant;
import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.lfn.iamp.usm.audit.AuditService;
import com.lfn.iamp.usm.domain.Organisation;
import com.lfn.iamp.usm.domain.Project;
import com.lfn.iamp.usm.domain.Role;
import com.lfn.iamp.usm.domain.UserProjectRole;
import com.lfn.iamp.usm.identity.IdentityProjectionService;
import com.lfn.iamp.usm.repository.OrganisationRepository;
import com.lfn.iamp.usm.repository.ProjectRepository;
import com.lfn.iamp.usm.repository.RoleRepository;
import com.lfn.iamp.usm.repository.UserProjectRoleRepository;
import com.lfn.iamp.usm.repository.UsersRepository;

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

	private static final Logger log = LoggerFactory.getLogger(AccessContextService.class);

	/** Matches rbac_role's seeded platform_admin rank (changelog/rbac/rbac.xml). */
	private static final int PLATFORM_ADMIN_RANK = 4;

	private final RoleAssignmentRepository roleAssignmentRepository;
	private final RbacRoleRepository rbacRoleRepository;
	private final ProjectRepository projectRepository;
	private final OrganisationRepository organisationRepository;
	private final AuditService auditService;
	private final IdentityProjectionService identityProjectionService;
	private final UserProjectRoleRepository userProjectRoleRepository;
	private final RoleRepository legacyRoleRepository;
	private final UsersRepository usersRepository;

	public AccessContextService(RoleAssignmentRepository roleAssignmentRepository,
			RbacRoleRepository rbacRoleRepository, ProjectRepository projectRepository,
			OrganisationRepository organisationRepository, AuditService auditService,
			IdentityProjectionService identityProjectionService, UserProjectRoleRepository userProjectRoleRepository,
			RoleRepository legacyRoleRepository, UsersRepository usersRepository) {
		this.roleAssignmentRepository = roleAssignmentRepository;
		this.rbacRoleRepository = rbacRoleRepository;
		this.projectRepository = projectRepository;
		this.organisationRepository = organisationRepository;
		this.auditService = auditService;
		this.identityProjectionService = identityProjectionService;
		this.userProjectRoleRepository = userProjectRoleRepository;
		this.legacyRoleRepository = legacyRoleRepository;
		this.usersRepository = usersRepository;
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

	/** Rank of a given rbac_role (0 = viewer … 4 = platform_admin), 0 if unknown. */
	public int rankOfRole(Integer roleId) {
		if (roleId == null) {
			return 0;
		}
		return rbacRoleRepository.findById(roleId).map(RbacRole::getRank).orElse(0);
	}

	public RoleAssignment grant(Integer userId, Integer roleId, Integer organizationId, Integer projectId) {
		if (organizationId != null && projectId != null) {
			throw new IllegalArgumentException("A role assignment scopes to at most one of organization/project");
		}
		// Idempotent: granting the exact same (user, role, scope) again just
		// returns the existing active assignment instead of piling up duplicates.
		for (RoleAssignment existing : roleAssignmentRepository.findByUserIdAndRevokedAtIsNull(userId)) {
			if (existing.getRoleId().equals(roleId)
					&& java.util.Objects.equals(existing.getOrganizationId(), organizationId)
					&& java.util.Objects.equals(existing.getProjectId(), projectId)) {
				return existing;
			}
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
		if (projectId != null) {
			// Best-effort mirror into the legacy table — must never fail or roll
			// back the authoritative RBAC grant above (see bridge method javadoc).
			try {
				bridgeToLegacyUserProjectRole(userId, roleId, projectId);
			} catch (RuntimeException e) {
				log.warn("Legacy usm_user_project_role bridge skipped for user {} project {}: {}", userId, projectId,
						e.getMessage());
			}
		}
		return saved;
	}

	/**
	 * Mirrors a project-scoped RBAC grant into the legacy usm_user_project_role
	 * table, which is what the shell header's Organization/Project/Role
	 * switcher (landing.component.ts checkDefaultProject/getRole) actually
	 * reads — that switcher predates rbac_role_assignment and isn't wired to
	 * it. Best-effort: only handles project scope (not organization/platform,
	 * since the legacy table has no equivalent of either).
	 */
	private void bridgeToLegacyUserProjectRole(Integer userId, Integer roleId, Integer projectId) {
		int rank = rankOfRole(roleId);
		String roleName = rbacRoleRepository.findById(roleId).map(RbacRole::getName).orElse("viewer");

		Role legacyRole = legacyRoleRepository.findByNameAndProjectId(roleName, projectId).stream().findFirst()
				.orElseGet(() -> {
					Role r = new Role();
					r.setName(roleName);
					r.setDescription("Bridged from RBAC role_assignment");
					r.setPermission(true);
					r.setRoleadmin(rank >= 3);
					r.setProjectadmin(rank >= 2);
					r.setProjectId(projectId);
					return legacyRoleRepository.save(r);
				});

		UserProjectRole existing = userProjectRoleRepository.findByUserId(userId).stream()
				.filter(upr -> upr.getProject_id() != null && projectId.equals(upr.getProject_id().getId()))
				.findFirst().orElse(null);

		Project project = projectRepository.findById(projectId).orElse(null);
		if (project == null || project.getPortfolioId() == null) {
			// usm_user_project_role.portfolio_id is NOT NULL, and projects
			// created after the §1 org/portfolio split never get one — nothing
			// safe to bridge, so skip (the RBAC grant itself still succeeds).
			return;
		}

		if (existing != null) {
			existing.setRole_id(legacyRole);
			existing.setPortfolio_id(project.getPortfolioId());
			existing.setTime_stamp(ZonedDateTime.now());
			userProjectRoleRepository.save(existing);
			return;
		}

		usersRepository.findById(userId).ifPresent(user -> {
			UserProjectRole upr = new UserProjectRole();
			upr.setUser_id(user);
			upr.setProject_id(project);
			upr.setRole_id(legacyRole);
			// usm_user_project_role.portfolio_id is NOT NULL — mirror the project's own portfolio.
			upr.setPortfolio_id(project.getPortfolioId());
			upr.setTime_stamp(ZonedDateTime.now());
			userProjectRoleRepository.save(upr);
		});
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
