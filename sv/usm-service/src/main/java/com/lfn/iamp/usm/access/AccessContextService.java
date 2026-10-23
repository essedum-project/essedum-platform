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
import com.lfn.iamp.usm.domain.UsmPortfolio;
import com.lfn.iamp.usm.domain.UsmRolePermissions;
import com.lfn.iamp.usm.identity.IdentityProjectionService;
import com.lfn.iamp.usm.repository.OrganisationRepository;
import com.lfn.iamp.usm.repository.ProjectRepository;
import com.lfn.iamp.usm.repository.RoleRepository;
import com.lfn.iamp.usm.repository.UserProjectRoleRepository;
import com.lfn.iamp.usm.repository.UsersRepository;
import com.lfn.iamp.usm.repository.UsmPortfolioRepository;
import com.lfn.iamp.usm.repository.UsmRolePermissionsRepository;
import com.lfn.iamp.usm.service.UsmPermissionApiService;

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
	private final UsmRolePermissionsRepository usmRolePermissionsRepository;
	private final UsmPermissionApiService usmPermissionApiService;
	private final UsmPortfolioRepository usmPortfolioRepository;

	public AccessContextService(RoleAssignmentRepository roleAssignmentRepository,
			RbacRoleRepository rbacRoleRepository, ProjectRepository projectRepository,
			OrganisationRepository organisationRepository, AuditService auditService,
			IdentityProjectionService identityProjectionService, UserProjectRoleRepository userProjectRoleRepository,
			RoleRepository legacyRoleRepository, UsersRepository usersRepository,
			UsmRolePermissionsRepository usmRolePermissionsRepository, UsmPermissionApiService usmPermissionApiService,
			UsmPortfolioRepository usmPortfolioRepository) {
		this.roleAssignmentRepository = roleAssignmentRepository;
		this.rbacRoleRepository = rbacRoleRepository;
		this.projectRepository = projectRepository;
		this.organisationRepository = organisationRepository;
		this.auditService = auditService;
		this.identityProjectionService = identityProjectionService;
		this.userProjectRoleRepository = userProjectRoleRepository;
		this.legacyRoleRepository = legacyRoleRepository;
		this.usersRepository = usersRepository;
		this.usmRolePermissionsRepository = usmRolePermissionsRepository;
		this.usmPermissionApiService = usmPermissionApiService;
		this.usmPortfolioRepository = usmPortfolioRepository;
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
		bridgeAssignment(userId, roleId, organizationId, projectId);
		return saved;
	}

	/**
	 * Best-effort mirror into the legacy table — must never fail or roll back
	 * the authoritative RBAC grant (see bridge method javadoc). An
	 * organization-scoped grant applies to every project in that org, so it is
	 * mirrored once per project.
	 */
	private void bridgeAssignment(Integer userId, Integer roleId, Integer organizationId, Integer projectId) {
		List<Integer> bridgeProjectIds = projectId != null ? Collections.singletonList(projectId)
				: organizationId != null ? projectRepository.findAll().stream()
						.filter(p -> organizationId.equals(p.getOrganisationId()))
						.map(Project::getId)
						.collect(Collectors.toList()) : Collections.<Integer>emptyList();
		for (Integer pid : bridgeProjectIds) {
			try {
				bridgeToLegacyUserProjectRole(userId, roleId, pid);
			} catch (RuntimeException e) {
				log.warn("Legacy usm_user_project_role bridge skipped for user {} project {}: {}", userId, pid,
						e.getMessage());
			}
		}
	}

	/**
	 * One-time backfill: re-mirrors every active role assignment into the legacy
	 * table. Needed for grants made before org-scoped grants were bridged —
	 * re-granting doesn't help, grant() is idempotent and returns early.
	 *
	 * @return number of active assignments processed
	 */
	public int resyncLegacyBridge() {
		List<RoleAssignment> active = roleAssignmentRepository.findByRevokedAtIsNull();
		for (RoleAssignment a : active) {
			bridgeAssignment(a.getUserId(), a.getRoleId(), a.getOrganizationId(), a.getProjectId());
		}
		return active.size();
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
		String roleName = legacyRoleName(roleId);

		boolean[] isNewRole = { false };
		Role legacyRole = legacyRoleRepository.findByNameAndProjectId(roleName, projectId).stream().findFirst()
				.orElseGet(() -> {
					Role r = new Role();
					r.setName(roleName);
					r.setDescription("Bridged from RBAC role_assignment");
					r.setPermission(true);
					r.setRoleadmin(rank >= 3);
					r.setProjectadmin(rank >= 2);
					r.setProjectId(projectId);
					Role saved = legacyRoleRepository.save(r);
					isNewRole[0] = true;
					return saved;
				});
		if (isNewRole[0]) {
			grantTemplatePermissions(legacyRole);
		}

		UserProjectRole existing = userProjectRoleRepository.findByUserId(userId).stream()
				.filter(upr -> upr.getProject_id() != null && projectId.equals(upr.getProject_id().getId()))
				.findFirst().orElse(null);

		Project project = projectRepository.findById(projectId).orElse(null);
		if (project == null) {
			return;
		}
		// usm_user_project_role.portfolio_id is NOT NULL. Projects created
		// before the org/portfolio link was populated have none, so fall back
		// to the portfolio named after the project's organization.
		UsmPortfolio portfolio = project.getPortfolioId() != null ? project.getPortfolioId()
				: portfolioForOrganisation(project.getOrganisationId());
		if (portfolio == null) {
			return;
		}

		if (existing != null) {
			existing.setRole_id(legacyRole);
			existing.setPortfolio_id(portfolio);
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
			upr.setPortfolio_id(portfolio);
			upr.setTime_stamp(ZonedDateTime.now());
			userProjectRoleRepository.save(upr);
		});
	}

	/**
	 * The role name the legacy shell understands. The sidebar looks up menus by
	 * "<role name> Side" (e.g. "Project Admin Side"), so a bridged rbac_role
	 * must carry the legacy display name, not its internal key (project_admin).
	 * A role id that isn't in rbac_role is a legacy usm_role id — keep its name.
	 */
	private String legacyRoleName(Integer roleId) {
		return rbacRoleRepository.findById(roleId).map(r -> {
			switch (r.getName().toLowerCase()) {
			case "platform_admin":
				return "Admin";
			case "org_admin":
				return "Organization Admin";
			case "project_admin":
				return "Project Admin";
			case "developer":
				return "Developer";
			case "viewer":
				return "Viewer";
			default:
				return r.getName();
			}
		}).orElseGet(() -> legacyRoleRepository.findById(roleId).map(Role::getName).orElse("Viewer"));
	}

	private UsmPortfolio portfolioForOrganisation(Integer organisationId) {
		if (organisationId == null) {
			return null;
		}
		return organisationRepository.findById(organisationId)
				.map(org -> usmPortfolioRepository.findAll().stream()
						.filter(p -> org.getName() != null && org.getName().equals(p.getPortfolioName()))
						.findFirst().orElse(null))
				.orElse(null);
	}

	/**
	 * A freshly bridged legacy Role has zero entries in usm_role_permissions,
	 * so CustomAuthorizationManager's in-memory roleMappedApi cache has
	 * nothing for it — every legacy-secured API silently 403s (or, before a
	 * defensive null-check, 500s). Copy the permission set from an existing
	 * role with the same roleadmin/projectadmin capability tier (whichever
	 * one has the most permissions already configured), then force an
	 * immediate cache refresh so it's usable without an app restart.
	 */
	private void grantTemplatePermissions(Role newRole) {
		List<UsmRolePermissions> allLinks = usmRolePermissionsRepository.findAll();
		// Broadening fallback chain — exact capability match first, then
		// progressively looser matches, so something is always found as long
		// as at least one role anywhere has permissions configured.
		Role template = findTemplateRole(allLinks, newRole,
				r -> java.util.Objects.equals(r.getRoleadmin(), newRole.getRoleadmin())
						&& java.util.Objects.equals(r.getProjectadmin(), newRole.getProjectadmin()));
		if (template == null) {
			template = findTemplateRole(allLinks, newRole,
					r -> java.util.Objects.equals(r.getProjectadmin(), newRole.getProjectadmin()));
		}
		if (template == null) {
			template = findTemplateRole(allLinks, newRole,
					r -> java.util.Objects.equals(r.getRoleadmin(), newRole.getRoleadmin()));
		}
		if (template == null) {
			template = findTemplateRole(allLinks, newRole, r -> true);
		}
		if (template == null) {
			log.warn("No existing legacy role has any permissions to copy for new role #{} — it will have none",
					newRole.getId());
			return;
		}
		for (UsmRolePermissions link : allLinks) {
			if (link.getRole() != null && link.getRole().getId().equals(template.getId())) {
				UsmRolePermissions copy = new UsmRolePermissions();
				copy.setRole(newRole);
				copy.setPermission(link.getPermission());
				usmRolePermissionsRepository.save(copy);
			}
		}
		usmPermissionApiService.refreshConfigAPIsMap();
	}

	/** The role (other than newRole itself) matching the predicate with the most permission links already configured. */
	private Role findTemplateRole(List<UsmRolePermissions> allLinks, Role newRole, java.util.function.Predicate<Role> matches) {
		return allLinks.stream()
				.map(UsmRolePermissions::getRole)
				.filter(r -> r != null && !r.getId().equals(newRole.getId()) && matches.test(r))
				.collect(Collectors.groupingBy(Role::getId, Collectors.counting()))
				.entrySet().stream()
				.max(java.util.Map.Entry.comparingByValue())
				.map(e -> allLinks.stream().map(UsmRolePermissions::getRole)
						.filter(r -> r.getId().equals(e.getKey())).findFirst().orElse(null))
				.orElse(null);
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

	public java.util.Optional<RoleAssignment> getAssignment(Integer id) {
		return roleAssignmentRepository.findById(id);
	}

	/**
	 * List all available roles combining both RBAC (rbac_role) and legacy USM
	 * (usm_role) systems. This allows the admin-console to display both
	 * new platform roles and legacy roles assigned to users, providing a
	 * unified role selection experience without breaking backward compatibility.
	 *
	 * @return Combined list of UnifiedRole objects from both systems
	 */
	public List<UnifiedRole> listRoles() {
		// Fetch RBAC roles and convert to UnifiedRole with rank
		List<UnifiedRole> unifiedRoles = rbacRoleRepository.findAll().stream()
				.map(r -> new UnifiedRole(r.getId(), r.getName(), r.getRank()))
				.collect(Collectors.toList());

		// Fetch legacy USM roles and convert to UnifiedRole without rank
		List<UnifiedRole> legacyRoles = legacyRoleRepository.findAll().stream()
				.map(r -> new UnifiedRole(r.getId(), r.getName()))
				.collect(Collectors.toList());

		// Combine both lists, avoiding duplicates by role name
		java.util.Set<String> seenNames = new java.util.HashSet<>();
		for (UnifiedRole role : unifiedRoles) {
			if (role.getName() != null) {
				seenNames.add(role.getName());
			}
		}

		// Add legacy roles that don't already exist in RBAC
		for (UnifiedRole legacyRole : legacyRoles) {
			if (legacyRole.getName() != null && !seenNames.contains(legacyRole.getName())) {
				unifiedRoles.add(legacyRole);
				seenNames.add(legacyRole.getName());
			}
		}

		// Sort by name for consistent ordering
		unifiedRoles.sort((a, b) -> {
			String nameA = a.getName() != null ? a.getName() : "";
			String nameB = b.getName() != null ? b.getName() : "";
			return nameA.compareToIgnoreCase(nameB);
		});

		return Collections.unmodifiableList(unifiedRoles);
	}
}
