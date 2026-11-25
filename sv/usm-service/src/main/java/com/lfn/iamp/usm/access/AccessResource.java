package com.lfn.iamp.usm.access;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import io.swagger.v3.oas.annotations.tags.Tag;

import com.lfn.iamp.usm.domain.Role;
import com.lfn.iamp.usm.domain.Users;
import com.lfn.iamp.usm.repository.RoleRepository;
import com.lfn.iamp.usm.repository.UsersRepository;

/**
 * Role & Access Management — §9 access package. Backs the admin-console
 * "Members & Roles" screen and the shell's AccessContext client (§4).
 */
@RestController
@RequestMapping("/api/usm")
@Tag(name = "Access", description = "Role assignment & access resolution")
public class AccessResource {

	private static final int ORG_ADMIN = 3;
	private static final int PLATFORM_ADMIN = 4;

	private final AccessContextService accessContextService;
	private final UsersRepository usersRepository;
	private final RoleRepository roleRepository;

	public AccessResource(AccessContextService accessContextService, UsersRepository usersRepository,
	                      RoleRepository roleRepository) {
		this.accessContextService = accessContextService;
		this.usersRepository = usersRepository;
		this.roleRepository = roleRepository;
	}

	@GetMapping("/access-context/{userId}")
	public ResponseEntity<AccessContext> getAccessContext(@PathVariable Integer userId) {
		return ResponseEntity.ok(accessContextService.resolve(userId));
	}

	/**
	 * With actorUserId the list is capped to the roles that actor may see
	 * (platform admin: all; org admin: AI Engineer/Project Admin/Org Admin;
	 * project admin: AI Engineer/Project Admin). Without it: unchanged.
	 */
	@GetMapping("/roles")
	public ResponseEntity<List<UnifiedRole>> listRoles(@RequestParam(required = false) Integer actorUserId) {
		return ResponseEntity.ok(actorUserId == null ? accessContextService.listRoles()
				: accessContextService.listVisibleRoles(actorUserId));
	}

	/**
	 * Distinct legacy role names (usm_role) for the Menu Configuration "Roles
	 * (optional override)" dropdown — these are the role names the shell's Role
	 * selector switches between and that the sidebar role-override matches on.
	 */
	@GetMapping("/role-names")
	public ResponseEntity<List<String>> listRoleNames() {
		List<String> names = roleRepository.findAll().stream()
				.map(Role::getName)
				.filter(n -> n != null && !n.isEmpty())
				.distinct()
				.sorted(String.CASE_INSENSITIVE_ORDER)
				.collect(Collectors.toList());
		return ResponseEntity.ok(names);
	}

	/** Minimal user list for the "Grant Role" dropdown (id + display name). */
	@GetMapping("/users")
	public ResponseEntity<List<UserOption>> listUsers() {
		List<UserOption> users = usersRepository.findAll().stream()
				.map(u -> new UserOption(u.getId(), displayName(u)))
				.sorted(Comparator.comparing(o -> o.getName() == null ? "" : o.getName().toLowerCase()))
				.collect(Collectors.toList());
		return ResponseEntity.ok(users);
	}

	private static String displayName(Users u) {
		String first = u.getUser_f_name() == null ? "" : u.getUser_f_name();
		String last = u.getUser_l_name() == null ? "" : u.getUser_l_name();
		String full = (first + " " + last).trim();
		String login = u.getUser_login();
		if (!full.isEmpty()) {
			return login != null && !login.isEmpty() ? full + " (" + login + ")" : full;
		}
		return login != null && !login.isEmpty() ? login : "User #" + u.getId();
	}

	/**
	 * Lists active role assignments visible to the acting user, optionally
	 * narrowed by user, organization and/or project. The actor-based scoping
	 * (platform admins see all; everyone else sees only their own grants plus
	 * grants inside their reachable projects/organizations) is always applied
	 * first, so the optional filters can never widen visibility.
	 */
	@GetMapping("/access/role-assignments")
	public ResponseEntity<List<RoleAssignment>> listRoleAssignments(
			@RequestParam Integer actorUserId,
			@RequestParam(required = false) Integer userId,
			@RequestParam(required = false) Integer organizationId,
			@RequestParam(required = false) Integer projectId) {
		if (actorUserId == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "actorUserId required");
		}
		AccessContext ctx = accessContextService.resolve(actorUserId);
		List<RoleAssignment> all = accessContextService.listActive();

		java.util.stream.Stream<RoleAssignment> scoped;
		if (ctx.getHighestRank() >= PLATFORM_ADMIN) {
			scoped = all.stream();
		} else {
			List<Integer> projectIds = ctx.getReachableProjectIds();
			List<Integer> orgIds = ctx.getReachableOrganizationIds();
			scoped = all.stream()
					.filter(a -> actorUserId.equals(a.getUserId())
							|| (a.getProjectId() != null && projectIds.contains(a.getProjectId()))
							|| (a.getOrganizationId() != null && orgIds.contains(a.getOrganizationId())));
		}

		// Optional narrowing filters — never widen the actor-based scope above.
		if (userId != null) {
			scoped = scoped.filter(a -> userId.equals(a.getUserId()));
		}
		// organizationId / projectId narrow to a scope. A role assignment is scoped
		// to at most one of organization/project (or neither for a platform-wide
		// grant), so requiring both would always match nothing — treat them as a
		// union: keep rows scoped to the given organization OR the given project.
		if (organizationId != null || projectId != null) {
			scoped = scoped.filter(a ->
					(organizationId != null && organizationId.equals(a.getOrganizationId()))
					|| (projectId != null && projectId.equals(a.getProjectId())));
		}

		return ResponseEntity.ok(scoped.collect(Collectors.toList()));
	}

	/**
	 * Paged Members &amp; Roles list. Scope and visible roles depend on the actor's
	 * rank (see AccessContextService#pageAssignments); filters can only narrow.
	 */
	@GetMapping("/access/role-assignments/page")
	public ResponseEntity<PagedResponse<RoleAssignmentView>> pageRoleAssignments(
			@RequestParam Integer actorUserId,
			@RequestParam(required = false) Integer roleId,
			@RequestParam(required = false) Integer projectId,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "5") int size) {
		if (actorUserId == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "actorUserId required");
		}
		int safePage = Math.max(page, 0);
		int safeSize = Math.min(Math.max(size, 1), 50);
		return ResponseEntity.ok(accessContextService.pageAssignments(actorUserId, roleId, projectId,
				safePage, safeSize));
	}

	/**
	 * What roles does a given user have on a given project? Returns active
	 * (non-revoked) assignments only, including org-scoped grants that cover
	 * this project through its organisation.
	 */
	@GetMapping("/access/role-assignments/by-user-project")
	public ResponseEntity<List<RoleAssignmentView>> listForUserAndProject(
			@RequestParam Integer userId, @RequestParam Integer projectId) {
		List<RoleAssignmentView> views = accessContextService.listForUserAndProject(userId, projectId).stream()
				.map(accessContextService::toView)
				.collect(Collectors.toList());
		return ResponseEntity.ok(views);
	}

	@PostMapping("/access/role-assignments")
	public ResponseEntity<?> grant(@RequestBody GrantRoleRequest request) {
		// If the roleId carries the legacy offset, strip it back to the real usm_role id
		// before storing. This prevents the collision between rbac_role and usm_role integer ids.
		final int OFFSET = AccessContextService.LEGACY_ROLE_ID_OFFSET;
		boolean isLegacyRole = request.getRoleId() != null && request.getRoleId() >= OFFSET;
		if (isLegacyRole) {
			request.setRoleId(request.getRoleId() - OFFSET);
		}

		// NFR-SEC2: only org_admin+ may manage assignments, and no one may grant a
		// role higher than their own rank (no self-escalation).
		int actorRank = requireActorRank(request.getActorUserId(), ORG_ADMIN, "grant a role");
		// Legacy roles have no RBAC rank — treat as rank 0 (no escalation risk).
		int grantedRank = isLegacyRole ? 0 : accessContextService.rankOfRole(request.getRoleId());
		if (actorRank < grantedRank) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN,
					"Cannot grant a role above your own rank (granting rank " + grantedRank + ", have " + actorRank + ")");
		}
		if (actorRank < PLATFORM_ADMIN) {
			AccessContext ctx = accessContextService.resolve(request.getActorUserId());
			Integer projectId = request.getProjectId();
			Integer organizationId = request.getOrganizationId();
			boolean inReach = (projectId != null && ctx.getReachableProjectIds().contains(projectId))
					|| (organizationId != null && ctx.getReachableOrganizationIds().contains(organizationId));
			if (!inReach) {
				throw new ResponseStatusException(HttpStatus.FORBIDDEN,
						"Cannot grant a role outside your own projects/organizations");
			}
		}
		try {
			RoleAssignment saved = accessContextService.grant(request.getUserId(), request.getRoleId(),
					request.getOrganizationId(), request.getProjectId(), isLegacyRole, request.getActorUserId());
			return ResponseEntity.ok(saved);
		} catch (ResponseStatusException ex) {
			if (ex.getStatusCode() == HttpStatus.CONFLICT) {
				return ResponseEntity.status(HttpStatus.CONFLICT)
						.body(java.util.Map.of("message", ex.getReason() != null ? ex.getReason() : "Duplicate role assignment."));
			}
			throw ex;
		}
	}

	/** Backfills the legacy Organization/Project/Role switcher from existing assignments (platform_admin only). */
	@PostMapping("/access/role-assignments/resync")
	public ResponseEntity<java.util.Map<String, Integer>> resync(@RequestParam Integer actorUserId) {
		requireActorRank(actorUserId, PLATFORM_ADMIN, "resync role assignments");
		return ResponseEntity.ok(java.util.Map.of("processed", accessContextService.resyncLegacyBridge()));
	}

	@DeleteMapping("/access/role-assignments/{id}")
	public ResponseEntity<Void> revoke(@PathVariable Integer id, @RequestParam Integer actorUserId) {
		int actorRank = requireActorRank(actorUserId, ORG_ADMIN, "revoke a role assignment");
		RoleAssignment target = accessContextService.getAssignment(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "role assignment not found"));
		int targetRank = accessContextService.rankOfRole(target.getRoleId());
		if (actorRank < targetRank) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN,
					"Cannot revoke a role above your own rank (target rank " + targetRank + ", have " + actorRank + ")");
		}
		if (actorRank < PLATFORM_ADMIN) {
			AccessContext ctx = accessContextService.resolve(actorUserId);
			boolean inReach = (target.getProjectId() != null && ctx.getReachableProjectIds().contains(target.getProjectId()))
					|| (target.getOrganizationId() != null && ctx.getReachableOrganizationIds().contains(target.getOrganizationId()));
			if (!inReach) {
				throw new ResponseStatusException(HttpStatus.FORBIDDEN,
						"Cannot revoke a role outside your own projects/organizations");
			}
		}
		accessContextService.revoke(id, actorUserId);
		return ResponseEntity.noContent().build();
	}

	private int requireActorRank(Integer actorUserId, int minRank, String action) {
		if (actorUserId == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "actorUserId required");
		}
		int rank = accessContextService.highestRank(actorUserId);
		if (rank < minRank) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN,
					"Insufficient role to " + action + " (needs rank " + minRank + ", have " + rank + ")");
		}
		return rank;
	}
}
