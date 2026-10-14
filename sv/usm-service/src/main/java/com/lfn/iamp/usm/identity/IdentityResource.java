package com.lfn.iamp.usm.identity;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;

/** Backs the admin-console "Identity Sync Status" screen (§8/§10). */
@RestController
@RequestMapping("/api/usm/identity")
@Tag(name = "Identity", description = "Identity projection (outbox) status")
public class IdentityResource {

	private final IdentityProjectionService service;

	public IdentityResource(IdentityProjectionService service) {
		this.service = service;
	}

	/** All projection targets, or just one project's when projectId is given. */
	@GetMapping("/targets")
	public ResponseEntity<List<IdentityProjectionTarget>> targets(
			@RequestParam(required = false) Integer projectId) {
		return ResponseEntity.ok(projectId == null ? service.listAll() : service.listByProject(projectId));
	}

	/** Re-queue a single target for the worker (manual retry). */
	@PostMapping("/targets/{id}/retry")
	public ResponseEntity<Void> retry(@PathVariable Integer id) {
		service.retry(id);
		return ResponseEntity.accepted().build();
	}
}
