package com.lfn.iamp.usm.access;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

	@GetMapping("/roles")
	public ResponseEntity<List<RbacRole>> listRoles() {
		return ResponseEntity.ok(accessContextService.listRoles());
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

	@GetMapping("/access/role-assignments")
	public ResponseEntity<List<RoleAssignment>> listRoleAssignments() {
		return ResponseEntity.ok(accessContextService.listActive());
	}

	@PostMapping("/access/role-assignments")
	public ResponseEntity<RoleAssignment> grant(@RequestBody GrantRoleRequest request) {
		RoleAssignment saved = accessContextService.grant(request.getUserId(), request.getRoleId(),
				request.getOrganizationId(), request.getProjectId());
		return ResponseEntity.ok(saved);
	}

	@DeleteMapping("/access/role-assignments/{id}")
	public ResponseEntity<Void> revoke(@PathVariable Integer id) {
		accessContextService.revoke(id);
		return ResponseEntity.noContent().build();
	}
}
