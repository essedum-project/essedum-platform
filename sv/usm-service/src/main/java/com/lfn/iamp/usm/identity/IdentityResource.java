package com.lfn.iamp.usm.identity;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import io.swagger.v3.oas.annotations.tags.Tag;

import com.lfn.iamp.usm.access.AccessContext;
import com.lfn.iamp.usm.access.AccessContextService;

/** Backs the admin-console "Identity Sync Status" screen (§8/§10). */
@RestController
@RequestMapping("/api/usm/identity")
@Tag(name = "Identity", description = "Identity projection (outbox) status")
public class IdentityResource {

	private static final int ORG_ADMIN = 3;
	private static final int PLATFORM_ADMIN = 4;

	private final IdentityProjectionService service;
	private final AccessContextService accessContextService;

	public IdentityResource(IdentityProjectionService service, AccessContextService accessContextService) {
		this.service = service;
		this.accessContextService = accessContextService;
	}

	private int requireOrgAdmin(Integer actorUserId) {
		if (actorUserId == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "actorUserId required");
		}
		int rank = accessContextService.highestRank(actorUserId);
		if (rank < ORG_ADMIN) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN,
					"Only an org admin or above may view identity sync status (have rank " + rank + ")");
		}
		return rank;
	}

	/** All projection targets, or just one project's when projectId is given. */
	@GetMapping("/targets")
	public ResponseEntity<List<IdentityProjectionTarget>> targets(
			@RequestParam(required = false) Integer projectId, @RequestParam Integer actorUserId) {
		int rank = requireOrgAdmin(actorUserId);
		List<IdentityProjectionTarget> targets = projectId == null ? service.listAll() : service.listByProject(projectId);
		if (rank >= PLATFORM_ADMIN) {
			return ResponseEntity.ok(targets);
		}
		AccessContext ctx = accessContextService.resolve(actorUserId);
		List<Integer> reachable = ctx.getReachableProjectIds();
		return ResponseEntity.ok(targets.stream()
				.filter(t -> reachable.contains(t.getProjectId()))
				.collect(Collectors.toList()));
	}

	/** Re-queue a single target for the worker (manual retry). */
	@PostMapping("/targets/{id}/retry")
	public ResponseEntity<Void> retry(@PathVariable Integer id, @RequestParam Integer actorUserId) {
		requireOrgAdmin(actorUserId);
		service.retry(id);
		return ResponseEntity.accepted().build();
	}
}
