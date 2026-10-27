package com.lfn.iamp.usm.publishing;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lfn.iamp.usm.access.AccessContext;
import com.lfn.iamp.usm.access.AccessContextService;

import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Backs the admin-console "My Drafts" and "Approvals" screens — §6.
 */
@RestController
@RequestMapping("/api/usm")
@Tag(name = "Publishing", description = "Draft/publish/promotion workflow")
public class PublishingResource {

	private final PublishingService publishingService;
	private final AccessContextService accessContextService;

	public PublishingResource(PublishingService publishingService, AccessContextService accessContextService) {
		this.publishingService = publishingService;
		this.accessContextService = accessContextService;
	}

	@GetMapping("/assets/versions/drafts")
	public ResponseEntity<List<AssetVersion>> myDrafts(@RequestParam Integer userId) {
		return ResponseEntity.ok(publishingService.listDraftsForUser(userId));
	}

	@GetMapping("/assets")
	public ResponseEntity<List<Asset>> assets(@RequestParam Integer userId) {
		return ResponseEntity.ok(publishingService.listAssetsForUser(userId));
	}

	/** §4 marketplace — published assets visible within the caller's scope. */
	@GetMapping("/assets/catalog")
	public ResponseEntity<List<Asset>> catalog(@RequestParam Integer userId) {
		return ResponseEntity.ok(publishingService.listCatalogForUser(userId));
	}

	@GetMapping("/assets/versions")
	public ResponseEntity<List<AssetVersion>> versions(@RequestParam Integer userId) {
		return ResponseEntity.ok(publishingService.listVersionsForUser(userId));
	}

	/** Create an asset + its first draft version. §5. Requires rank ≥ 1 (Developer). */
	@PostMapping("/assets")
	public ResponseEntity<?> create(@RequestBody CreateDraftRequest request) {
		// project_id and name are required; return 400 naming the missing field.
		if (request.getProjectId() == null) {
			return ResponseEntity.badRequest()
					.body(Collections.singletonMap("message", "project_id is required"));
		}
		if (request.getName() == null || request.getName().isBlank()) {
			return ResponseEntity.badRequest()
					.body(Collections.singletonMap("message", "name is required"));
		}
		// Rank ≥ 1 required; resolve uses direct project IDs so org expansion
		// does not grant create rights in a project the user isn't directly a member of.
		AccessContext ctx = accessContextService.resolve(request.getActorId());
		if (ctx.getHighestRank() < 1 || !ctx.getDirectProjectIds().contains(request.getProjectId())) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body(Collections.singletonMap("message", "Rank ≥ 1 (Developer) and direct project membership required"));
		}
		AssetVersion version = publishingService.createDraft(request.getProjectId(), request.getAssetType(),
				request.getName(), request.getPayloadRef(), request.getActorId(), request.getActorName());
		return ResponseEntity.ok(version);
	}

	/** Single-asset lookup — returns 404 when the user cannot see the asset. */
	@GetMapping("/assets/{id}")
	public ResponseEntity<Asset> getAsset(@PathVariable Integer id, @RequestParam Integer userId) {
		return publishingService.findAssetForUser(id, userId)
				.map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}

	/**
	 * Edit a draft — creates a new asset_version row. Returns 403 when
	 * the actor is not the original creator.
	 */
	@PutMapping("/assets/versions/{id}")
	public ResponseEntity<AssetVersion> edit(@PathVariable Integer id, @RequestBody EditDraftRequest request) {
		AssetVersion version = publishingService.editDraft(id, request.getName(), request.getPayloadRef(),
				request.getActorId(), request.getActorName());
		return ResponseEntity.ok(version);
	}

	/** Maps service-layer ownership / rank violations to 403 Forbidden. */
	@ExceptionHandler(IllegalStateException.class)
	public ResponseEntity<Map<String, String>> handleIllegalState(IllegalStateException ex) {
		return ResponseEntity.status(HttpStatus.FORBIDDEN)
				.body(Collections.singletonMap("message", ex.getMessage()));
	}

	/** Maps bad-input errors (unknown IDs, invalid actions) to 400 Bad Request. */
	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
		return ResponseEntity.badRequest()
				.body(Collections.singletonMap("message", ex.getMessage()));
	}

	/** Open a fresh draft version on a published asset (live keeps serving). §5. */
	@PostMapping("/assets/{id}/versions")
	public ResponseEntity<AssetVersion> newVersion(@PathVariable Integer id, @RequestBody EditDraftRequest request) {
		AssetVersion version = publishingService.createNewVersion(id, request.getPayloadRef(), request.getActorId(),
				request.getActorName());
		return ResponseEntity.ok(version);
	}

	/** The next gate this version must clear, or null if already public. Drives the Submit button label. */
	@GetMapping("/assets/versions/{id}/next-gate")
	public ResponseEntity<Map<String, String>> nextGate(@PathVariable Integer id) {
		String gate = publishingService.nextGateForVersion(id);
		return ResponseEntity.ok(Collections.singletonMap("gate", gate));
	}

	/** Submit for review. Requires rank ≥ 1 (Developer). */
	@PostMapping("/assets/versions/{id}/submit")
	public ResponseEntity<PromotionEvent> submit(@PathVariable Integer id, @RequestBody SubmitRequest request) {
		int rank = accessContextService.highestRank(request.getActorId());
		if (rank < 1) {
			throw new org.springframework.web.server.ResponseStatusException(
					org.springframework.http.HttpStatus.FORBIDDEN,
					"Insufficient role to submit for review (needs rank 1, have " + rank + ")");
		}
		PromotionEvent event = publishingService.submit(id, request.getActorId(), request.getActorName(),
				request.getNote());
		return ResponseEntity.ok(event);
	}

	@GetMapping("/approvals")
	public ResponseEntity<List<PromotionEvent>> approvals(@RequestParam Integer userId) {
		int rank = accessContextService.highestRank(userId);
		return ResponseEntity.ok(publishingService.pendingApprovalsForRank(rank));
	}

	@PostMapping("/approvals/{versionId}/decision")
	public ResponseEntity<PromotionEvent> decide(@PathVariable Integer versionId,
	                                             @RequestBody DecisionRequest request) {
		int viewerRank = accessContextService.highestRank(request.getActorId());
		PromotionEvent event = publishingService.decide(versionId, request.getGate(), request.getAction(),
				request.getActorId(), request.getActorName(), request.getNote(), viewerRank);
		return ResponseEntity.ok(event);
	}
}
