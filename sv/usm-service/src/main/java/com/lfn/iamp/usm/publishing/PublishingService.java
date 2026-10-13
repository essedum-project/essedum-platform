package com.lfn.iamp.usm.publishing;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lfn.iamp.usm.access.AccessContextService;

/**
 * Submit/approve/reject drive the §5 state machine. The serving version
 * (asset.current_version_id) only changes inside the same transaction as an
 * "approved" promotion_event — never by a direct edit.
 */
@Service
public class PublishingService {

	private final AssetRepository assetRepository;
	private final AssetVersionRepository assetVersionRepository;
	private final PromotionEventRepository promotionEventRepository;
	private final AccessContextService accessContextService;

	public PublishingService(AssetRepository assetRepository, AssetVersionRepository assetVersionRepository,
			PromotionEventRepository promotionEventRepository, AccessContextService accessContextService) {
		this.assetRepository = assetRepository;
		this.assetVersionRepository = assetVersionRepository;
		this.promotionEventRepository = promotionEventRepository;
		this.accessContextService = accessContextService;
	}

	public List<AssetVersion> listDraftsForUser(Integer userId) {
		List<Integer> projectIds = accessContextService.resolve(userId).getReachableProjectIds();
		List<Integer> assetIds = assetRepository.findByProjectIdIn(projectIds).stream()
				.map(Asset::getId)
				.collect(Collectors.toList());
		return assetVersionRepository.findByAssetIdIn(assetIds).stream()
				.filter(v -> "draft".equals(v.getStatus()) || "rejected".equals(v.getStatus()))
				.collect(Collectors.toList());
	}

	/** All assets reachable by the user's projects — lets the frontend join asset name onto a version. */
	public List<Asset> listAssetsForUser(Integer userId) {
		List<Integer> projectIds = accessContextService.resolve(userId).getReachableProjectIds();
		return assetRepository.findByProjectIdIn(projectIds);
	}

	/** All versions reachable by the user's projects — lets the frontend join versionNo onto a promotion event. */
	public List<AssetVersion> listVersionsForUser(Integer userId) {
		List<Integer> assetIds = listAssetsForUser(userId).stream().map(Asset::getId).collect(Collectors.toList());
		return assetVersionRepository.findByAssetIdIn(assetIds);
	}

	@Transactional
	public PromotionEvent submit(Integer versionId, String gate, Integer actorId, String actorName, String note) {
		AssetVersion version = assetVersionRepository.findById(versionId)
				.orElseThrow(() -> new IllegalArgumentException("No such asset version: " + versionId));
		version.setStatus("in_review");
		assetVersionRepository.save(version);

		PromotionEvent event = newEvent(versionId, gate, "submitted", actorId, actorName, note);
		return promotionEventRepository.save(event);
	}

	/** Approve moves the serving pointer; reject sends the version back to draft. §5. */
	@Transactional
	public PromotionEvent decide(Integer versionId, String gate, String action, Integer actorId, String actorName,
			String note, Integer viewerRank) {
		if (viewerRank < PromotionGate.requiredRank(gate)) {
			throw new IllegalStateException("Viewer rank " + viewerRank + " cannot decide at gate " + gate);
		}
		AssetVersion version = assetVersionRepository.findById(versionId)
				.orElseThrow(() -> new IllegalArgumentException("No such asset version: " + versionId));

		if ("approved".equals(action)) {
			version.setStatus("published");
			assetVersionRepository.save(version);
			assetRepository.findById(version.getAssetId()).ifPresent(asset -> {
				asset.setCurrentVersionId(version.getId());
				assetRepository.save(asset);
			});
		} else if ("rejected".equals(action)) {
			version.setStatus("rejected");
			assetVersionRepository.save(version);
		} else {
			throw new IllegalArgumentException("Unknown action: " + action);
		}

		PromotionEvent event = newEvent(versionId, gate, action, actorId, actorName, note);
		return promotionEventRepository.save(event);
	}

	/**
	 * The current state of a gate is the latest event for (asset_version_id,
	 * gate) — filtered to gates the viewer's rank can decide at. §6.
	 */
	public List<PromotionEvent> pendingApprovalsForRank(int viewerRank) {
		Map<String, PromotionEvent> latestByKey = new HashMap<>();
		for (String gate : PromotionGate.all()) {
			if (viewerRank < PromotionGate.requiredRank(gate)) {
				continue;
			}
			for (PromotionEvent event : promotionEventRepository.findByGateAndAction(gate, "submitted")) {
				String key = event.getAssetVersionId() + ":" + event.getGate();
				PromotionEvent existing = latestByKey.get(key);
				if (existing == null || event.getOccurredAt().isAfter(existing.getOccurredAt())) {
					latestByKey.put(key, event);
				}
			}
		}
		List<PromotionEvent> pending = new ArrayList<>(latestByKey.values());
		pending.sort(Comparator.comparing(PromotionEvent::getOccurredAt));
		return pending;
	}

	private PromotionEvent newEvent(Integer versionId, String gate, String action, Integer actorId, String actorName,
			String note) {
		PromotionEvent event = new PromotionEvent();
		event.setAssetVersionId(versionId);
		event.setGate(gate);
		event.setAction(action);
		event.setActorId(actorId);
		event.setActorName(actorName);
		event.setNote(note);
		event.setOccurredAt(Instant.now());
		return event;
	}
}
