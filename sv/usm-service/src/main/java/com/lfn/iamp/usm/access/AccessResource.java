package com.lfn.iamp.usm.access;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Role & Access Management — §9 access package. Backs the admin-console
 * "Members & Roles" screen and the shell's AccessContext client (§4).
 */
@RestController
@RequestMapping("/api/usm")
@Tag(name = "Access", description = "Role assignment & access resolution")
public class AccessResource {

	private final AccessContextService accessContextService;

	public AccessResource(AccessContextService accessContextService) {
		this.accessContextService = accessContextService;
	}

	@GetMapping("/access-context/{userId}")
	public ResponseEntity<AccessContext> getAccessContext(@PathVariable Integer userId) {
		return ResponseEntity.ok(accessContextService.resolve(userId));
	}

	@GetMapping("/roles")
	public ResponseEntity<List<RbacRole>> listRoles() {
		return ResponseEntity.ok(accessContextService.listRoles());
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
