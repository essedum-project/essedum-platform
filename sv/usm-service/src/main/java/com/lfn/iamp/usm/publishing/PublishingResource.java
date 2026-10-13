package com.lfn.iamp.usm.publishing;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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

	@GetMapping("/assets/versions")
	public ResponseEntity<List<AssetVersion>> versions(@RequestParam Integer userId) {
		return ResponseEntity.ok(publishingService.listVersionsForUser(userId));
	}

	@PostMapping("/assets/versions/{id}/submit")
	public ResponseEntity<PromotionEvent> submit(@PathVariable Integer id, @RequestBody SubmitRequest request) {
		PromotionEvent event = publishingService.submit(id, request.getGate(), request.getActorId(),
				request.getActorName(), request.getNote());
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
