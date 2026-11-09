package com.lfn.iamp.usm.access;

import java.time.Instant;
import java.time.ZonedDateTime;
import java.util.ArrayList;
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

		// Platform admins reach everything — directProjectIds = all projects too.
		if (highestRank >= PLATFORM_ADMIN_RANK) {
			List<Integer> allProjectIds = projectRepository.findAll().stream()
					.map(Project::getId)
					.collect(Collectors.toList());
			List<Integer> allOrganizationIds = organisationRepository.findAll().stream()
					.map(Organisation::getId)
					.collect(Collectors.toList());
			return new AccessContext(userId, highestRank, allProjectIds, allOrganizationIds, allProjectIds);
		}

		List<Integer> organizationIds = active.stream()
				.map(RoleAssignment::getOrganizationId)
				.filter(id -> id != null)
				.distinct()
				.collect(Collectors.toList());

		// Capture the raw project-level grants BEFORE org expansion.
		// Draft visibility is limited to this set only.
		List<Integer> directProjectIds = active.stream()
				.map(RoleAssignment::getProjectId)
				.filter(id -> id != null)
				.distinct()
				.collect(Collectors.toList());

		// reachableProjectIds starts from direct grants, then org grants expand it
		// for published-asset access (§4 visibility query).
		List<Integer> projectIds = new ArrayList<>(directProjectIds);

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

		return new AccessContext(userId, highestRank, projectIds, organizationIds, directProjectIds);
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
		return grant(userId, roleId, organizationId, projectId, false);
	}

	public RoleAssignment grant(Integer userId, Integer roleId, Integer organizationId, Integer projectId, boolean isLegacy) {
		if (organizationId != null && projectId != null) {
			throw new IllegalArgumentException("A role assignment scopes to at most one of organization/project");
		}
		// Idempotent: granting the exact same (user, role, scope) again just
		// returns the existing active assignment instead of piling up duplicates.
		for (RoleAssignment existing : roleAssignmentRepository.findByUserIdAndRevokedAtIsNull(userId)) {
			if (existing.getRoleId().equals(roleId)
					&& java.util.Objects.equals(existing.getOrganizationId(), organizationId)
					&& java.util.Objects.equals(existing.getProjectId(), projectId)) {
				// Already assigned — still ensure the legacy bridge exists (idempotent).
				bridgeAssignment(userId, roleId, organizationId, projectId, isLegacy);
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
		bridgeAssignment(userId, roleId, organizationId, projectId, isLegacy);
		return saved;
	}

	/**
	 * Best-effort mirror into the legacy table — must never fail or roll back
	 * the authoritative RBAC grant (see bridge method javadoc). An
	 * organization-scoped grant applies to every project in that org, so it is
	 * mirrored once per project.
	 */
	private void bridgeAssignment(Integer userId, Integer roleId, Integer organizationId, Integer projectId) {
		bridgeAssignment(userId, roleId, organizationId, projectId, false);
	}

	private void bridgeAssignment(Integer userId, Integer roleId, Integer organizationId, Integer projectId, boolean isLegacy) {
		List<Integer> bridgeProjectIds = projectId != null ? Collections.singletonList(projectId)
				: organizationId != null ? projectRepository.findAll().stream()
										   .filter(p -> organizationId.equals(p.getOrganisationId()))
										   .map(Project::getId)
										   .collect(Collectors.toList()) : Collections.<Integer>emptyList();
		for (Integer pid : bridgeProjectIds) {
			try {
				bridgeToLegacyUserProjectRole(userId, roleId, pid, isLegacy);
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
		bridgeToLegacyUserProjectRole(userId, roleId, projectId, false);
	}

	private void bridgeToLegacyUserProjectRole(Integer userId, Integer roleId, Integer projectId, boolean isLegacy) {
		// For legacy roles the roleId is a usm_role PK, not an rbac_role PK.
		// rankOfRole() looks in rbac_role and would return the colliding RBAC role's
		// rank (e.g. rank=4 for id=1 "platform_admin") — use 0 for all legacy roles.
		int rank = isLegacy ? 0 : rankOfRole(roleId);
		String roleName = legacyRoleName(roleId, isLegacy);

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
				.filter(upr -> upr.getProject_id() != null && projectId.equals(upr.getProject_id().getId())
						&& upr.getRole_id() != null && legacyRole.getId().equals(upr.getRole_id().getId()))
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
			// Already mapped. Never update it: the table's primary key includes portfolio_id,
			// so rewriting it can collide with a sibling row.
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
	 *
	 * IMPORTANT: rbac_role and usm_role both start their auto-increment at 1, so
	 * their IDs collide (e.g. usm_role.id=1 "IT Portfolio Manager" == rbac_role.id=1
	 * "platform_admin"). When bridging a known-legacy roleId (isLegacy=true) we
	 * skip the rbac_role lookup entirely to return the correct display name.
	 */
	private String legacyRoleName(Integer roleId) {
		return legacyRoleName(roleId, false);
	}

	private String legacyRoleName(Integer roleId, boolean isLegacy) {
		if (isLegacy) {
			// Legacy role — look up display name directly from usm_role, bypassing the
			// rbac_role table whose IDs overlap with usm_role's auto-increment sequence.
			return legacyRoleRepository.findById(roleId).map(Role::getName).orElse("Viewer");
		}
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

	/**
	 * Active role assignments for a given user, scoped to a specific project —
	 * answers "what roles does user X have on project Y". Includes both direct
	 * project-level grants and, if the user's org-scoped grant covers this
	 * project, that org-scoped assignment as well (since it's what actually
	 * grants access to the project per resolve()'s org-expansion logic).
	 */
	public List<RoleAssignment> listForUserAndProject(Integer userId, Integer projectId) {
		List<RoleAssignment> direct = roleAssignmentRepository
				.findByUserIdAndProjectIdAndRevokedAtIsNull(userId, projectId);

		Project project = projectRepository.findById(projectId).orElse(null);
		Integer organisationId = project != null ? project.getOrganisationId() : null;

		List<RoleAssignment> result = new ArrayList<>(direct);
		if (organisationId != null) {
			// Org-scoped assignments that cover this project through its organisation.
			roleAssignmentRepository.findByUserIdAndRevokedAtIsNull(userId).stream()
					.filter(a -> organisationId.equals(a.getOrganizationId()))
					.forEach(result::add);
		}
		// Platform Admin (rank >= 4) is a global role, but only when the grant itself
		// is platform-wide (organization_id and project_id both NULL — see
		// RoleAssignment's "scoped to exactly one of organization/project, or
		// neither for a platform-wide grant" invariant). A Platform Admin grant
		// that was deliberately scoped to one org/project must not leak into an
		// unrelated project and mask that project's own role assignment.
		roleAssignmentRepository.findByUserIdAndRevokedAtIsNull(userId).stream()
				.filter(a -> a.getOrganizationId() == null && a.getProjectId() == null)
				.filter(a -> {
					RbacRole role = rbacRoleRepository.findById(a.getRoleId()).orElse(null);
					return role != null && role.getRank() != null && role.getRank() >= PLATFORM_ADMIN_RANK;
				})
				.filter(a -> result.stream().noneMatch(r -> r.getId().equals(a.getId())))
				.forEach(result::add);
		return result;
	}

	/**
	 * Resolves a role name/rank for display. Checks rbac_role first (new RBAC
	 * roles, IDs as-is); if not found there, falls back to usm_role by the raw
	 * id — covers assignments bridged from the legacy system whose roleId was
	 * stored without the LEGACY_ROLE_ID_OFFSET (the offset is only applied on
	 * the /roles listing endpoint, not on the stored rbac_role_assignment row).
	 */
	public RoleAssignmentView toView(RoleAssignment a) {
		String orgName = a.getOrganizationId() != null
				? organisationRepository.findById(a.getOrganizationId()).map(Organisation::getName).orElse(null)
				: null;
		Project project = a.getProjectId() != null
				? projectRepository.findById(a.getProjectId()).orElse(null)
				: null;
		String projectName = project != null ? project.getName() : null;
		Integer projectOrgId = project != null ? project.getOrganisationId() : null;
		String projectOrgName = projectOrgId != null
				? organisationRepository.findById(projectOrgId).map(Organisation::getName).orElse(null)
				: null;
		return rbacRoleRepository.findById(a.getRoleId())
				.map(r -> RoleAssignmentView.of(a, displayNameOf(r.getName()), r.getRank(), orgName, projectName,
						projectOrgId, projectOrgName))
				.orElseGet(() -> RoleAssignmentView.of(a,
						legacyRoleRepository.findById(a.getRoleId()).map(Role::getName).orElse("Unknown"), null,
						orgName, projectName, projectOrgId, projectOrgName));
	}

	private String displayNameOf(String rbacRoleName) {
		if (rbacRoleName == null) {
			return null;
		}
		switch (rbacRoleName.toLowerCase()) {
			case "platform_admin":
				return "Platform Admin";
			case "org_admin":
				return "Organization Admin";
			case "project_admin":
				return "Project Admin";
			case "developer":
				return "Developer";
			case "viewer":
				return "Viewer";
			default:
				return rbacRoleName;
		}
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
	/**
	 * Legacy role IDs are offset by this amount so they never collide with RBAC
	 * role IDs. Both tables use auto-increment starting at 1; without the offset
	 * "IT Portfolio Manager" (usm_role.id=1) collides with "platform_admin"
	 * (rbac_role.id=1), causing the wrong role to be granted and displayed.
	 *
	 * The grant endpoint detects IDs >= LEGACY_ROLE_ID_OFFSET and routes them to
	 * the legacy bridge instead of the RBAC assignment table.
	 */
	public static final int LEGACY_ROLE_ID_OFFSET = 100_000;

	public List<UnifiedRole> listRoles() {
		// RBAC roles — authoritative, IDs as-is.
		List<UnifiedRole> result = new java.util.ArrayList<>(rbacRoleRepository.findAll().stream()
				.map(r -> new UnifiedRole(r.getId(), r.getName(), r.getRank()))
				.collect(Collectors.toList()));

		java.util.Set<String> seenNames = result.stream()
				.filter(r -> r.getName() != null)
				.map(UnifiedRole::getName)
				.collect(Collectors.toCollection(java.util.HashSet::new));
		java.util.Set<Integer> seenIds = result.stream()
				.map(UnifiedRole::getId)
				.collect(Collectors.toCollection(java.util.HashSet::new));

		// Legacy USM roles — offset IDs by LEGACY_ROLE_ID_OFFSET to avoid collision.
		// Only add if the role name isn't already covered by an RBAC role.
		for (Role r : legacyRoleRepository.findAll()) {
			if (r.getName() == null || seenNames.contains(r.getName())) {
				continue;
			}
			int offsetId = r.getId() + LEGACY_ROLE_ID_OFFSET;
			if (seenIds.contains(offsetId)) {
				continue; // extremely unlikely, but guard anyway
			}
			result.add(new UnifiedRole(offsetId, r.getName()));
			seenNames.add(r.getName());
			seenIds.add(offsetId);
		}

		result.sort((a, b) -> {
			String na = a.getName() != null ? a.getName() : "";
			String nb = b.getName() != null ? b.getName() : "";
			return na.compareToIgnoreCase(nb);
		});

		return Collections.unmodifiableList(result);
	}
}
