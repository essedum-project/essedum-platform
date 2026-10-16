package com.lfn.iamp.usm.publishing;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lfn.iamp.usm.access.AccessContextService;
import com.lfn.iamp.usm.audit.AuditService;

/**
 * Submit/approve/reject drive the §5 state machine. The serving version
 * (asset.current_version_id) only changes inside the same transaction as an
 * "approved" promotion_event — never by a direct edit. A version climbs the
 * scope ladder Draft → Project → Org → Public one gate at a time; the serving
 * pointer only advances when the newly-approved version has reached at least
 * the scope the asset already serves, so editing a published asset keeps the
 * live version serving until the new one has climbed all the way back up.
 */
@Service
public class PublishingService {

	private final AssetRepository assetRepository;
	private final AssetVersionRepository assetVersionRepository;
	private final PromotionEventRepository promotionEventRepository;
	private final AccessContextService accessContextService;
	private final AuditService auditService;

	public PublishingService(AssetRepository assetRepository, AssetVersionRepository assetVersionRepository,
			PromotionEventRepository promotionEventRepository, AccessContextService accessContextService,
			AuditService auditService) {
		this.assetRepository = assetRepository;
		this.assetVersionRepository = assetVersionRepository;
		this.promotionEventRepository = promotionEventRepository;
		this.accessContextService = accessContextService;
		this.auditService = auditService;
	}

	public List<AssetVersion> listDraftsForUser(Integer userId) {
		List<Integer> projectIds = accessContextService.resolve(userId).getReachableProjectIds();
		List<Integer> assetIds = assetRepository.findByProjectIdIn(projectIds).stream()
				.map(Asset::getId)
				.collect(Collectors.toList());
		return assetVersionRepository.findByAssetIdIn(assetIds).stream()
				.filter(v -> "draft".equals(v.getStatus()) || "rejected".equals(v.getStatus())
						|| "in_review".equals(v.getStatus()))
				.collect(Collectors.toList());
	}

	/**
	 * Assets reachable by the user's projects, plus every publicly-scoped
	 * asset regardless of project reach — the §4 visibleAssets query, minus
	 * the "only published current version" filter (that's applied by callers
	 * that care, e.g. a future public asset directory; drafts/approvals want
	 * all statuses).
	 */
	public List<Asset> listAssetsForUser(Integer userId) {
		List<Integer> projectIds = accessContextService.resolve(userId).getReachableProjectIds();
		List<Asset> reachable = new ArrayList<>(assetRepository.findByProjectIdIn(projectIds));
		for (Asset publicAsset : assetRepository.findByScope(PromotionGate.SCOPE_PUBLIC)) {
			if (reachable.stream().noneMatch(a -> a.getId().equals(publicAsset.getId()))) {
				reachable.add(publicAsset);
			}
		}
		return reachable;
	}

	/**
	 * The §4 catalog: published assets the user can see — ones with a serving
	 * version, reachable by project OR public to everyone. This is the single
	 * visibility query the marketplace reads.
	 */
	public List<Asset> listCatalogForUser(Integer userId) {
		return listAssetsForUser(userId).stream()
				.filter(a -> a.getCurrentVersionId() != null)
				.filter(a -> !PromotionGate.SCOPE_DRAFT.equals(a.getScope()))
				.collect(Collectors.toList());
	}

	/** All versions reachable by the user's projects — lets the frontend join versionNo onto a promotion event. */
	public List<AssetVersion> listVersionsForUser(Integer userId) {
		List<Integer> assetIds = listAssetsForUser(userId).stream().map(Asset::getId).collect(Collectors.toList());
		return assetVersionRepository.findByAssetIdIn(assetIds);
	}

	/** Create a brand-new asset and its first draft version (§5: everything starts as a draft). */
	@Transactional
	public AssetVersion createDraft(Integer projectId, String assetType, String name, String payloadRef,
			Integer actorId, String actorName) {
		Asset asset = new Asset();
		asset.setProjectId(projectId);
		asset.setAssetType(assetType == null || assetType.isBlank() ? "generic" : assetType);
		asset.setName(name);
		asset.setScope(PromotionGate.SCOPE_DRAFT);
		Asset savedAsset = assetRepository.save(asset);

		AssetVersion version = newVersion(savedAsset.getId(), 1, payloadRef);
		AssetVersion savedVersion = assetVersionRepository.save(version);

		auditService.record("asset", "created", actorId, actorName,
				"asset '" + name + "' created as draft in project " + projectId);
		return savedVersion;
	}

	/** Edit a draft/rejected version in place — same version row, new bytes, re-opens the draft. §5. */
	@Transactional
	public AssetVersion editDraft(Integer versionId, String name, String payloadRef, Integer actorId,
			String actorName) {
		AssetVersion version = requireVersion(versionId);
		if (!("draft".equals(version.getStatus()) || "rejected".equals(version.getStatus()))) {
			throw new IllegalStateException("Only draft or rejected versions can be edited: v" + versionId);
		}
		version.setPayloadRef(payloadRef);
		version.setContentDigest(digest(name, payloadRef));
		version.setStatus("draft");
		version.setUpdatedAt(Instant.now());
		AssetVersion saved = assetVersionRepository.save(version);

		if (name != null && !name.isBlank()) {
			assetRepository.findById(version.getAssetId()).ifPresent(asset -> {
				asset.setName(name);
				assetRepository.save(asset);
			});
		}
		auditService.record("asset_version", "edited", actorId, actorName, "version " + versionId + " edited");
		return saved;
	}

	/**
	 * Open a fresh draft version on an already-published asset. The live
	 * version keeps serving (current_version_id untouched) until this new one
	 * climbs the gates. §5 "editing published opens a new draft".
	 */
	@Transactional
	public AssetVersion createNewVersion(Integer assetId, String payloadRef, Integer actorId, String actorName) {
		Asset asset = assetRepository.findById(assetId)
				.orElseThrow(() -> new IllegalArgumentException("No such asset: " + assetId));
		int nextNo = assetVersionRepository.findByAssetIdIn(Arrays.asList(assetId)).stream()
				.map(AssetVersion::getVersionNo)
				.max(Comparator.naturalOrder())
				.orElse(0) + 1;
		AssetVersion version = newVersion(assetId, nextNo, payloadRef);
		AssetVersion saved = assetVersionRepository.save(version);
		auditService.record("asset_version", "created", actorId, actorName,
				"new draft v" + nextNo + " opened on asset " + asset.getName());
		return saved;
	}

	/**
	 * The gate this version must clear next, derived from its own approved
	 * promotion events — not the asset scope, so a fresh draft on a public
	 * asset still starts at the project gate. Returns null once fully public.
	 */
	public String nextGateForVersion(Integer versionId) {
		List<PromotionEvent> events = promotionEventRepository.findByAssetVersionId(versionId);
		boolean project = hasApproval(events, PromotionGate.PROJECT_ADMIN);
		boolean org = hasApproval(events, PromotionGate.ORG_ADMIN);
		boolean platform = hasApproval(events, PromotionGate.PLATFORM_ADMIN);
		if (platform) {
			return null;
		}
		if (org) {
			return PromotionGate.PLATFORM_ADMIN;
		}
		if (project) {
			return PromotionGate.ORG_ADMIN;
		}
		return PromotionGate.PROJECT_ADMIN;
	}

	@Transactional
	public PromotionEvent submit(Integer versionId, Integer actorId, String actorName, String note) {
		AssetVersion version = requireVersion(versionId);
		String gate = nextGateForVersion(versionId);
		if (gate == null) {
			throw new IllegalStateException("Version " + versionId + " is already public — nothing to submit");
		}
		// The approver must outrank the submitter, so a project admin's draft goes
		// to an org admin (reaching organization scope) rather than back to them.
		gate = PromotionGate.atLeastRank(gate, accessContextService.highestRank(actorId) + 1);
		version.setStatus("in_review");
		assetVersionRepository.save(version);

		PromotionEvent event = newEvent(versionId, gate, "submitted", actorId, actorName, note);
		PromotionEvent saved = promotionEventRepository.save(event);
		auditService.record("promotion_event", "submitted", actorId, actorName,
				"version " + versionId + " submitted at gate " + gate);
		return saved;
	}

	/** Approve moves the serving pointer and widens scope; reject sends the version back to draft. §5. */
	@Transactional
	public PromotionEvent decide(Integer versionId, String gate, String action, Integer actorId, String actorName,
			String note, Integer viewerRank) {
		if (viewerRank < PromotionGate.requiredRank(gate)) {
			throw new IllegalStateException("Viewer rank " + viewerRank + " cannot decide at gate " + gate);
		}
		AssetVersion version = requireVersion(versionId);

		if ("approved".equals(action)) {
			version.setStatus("published");
			assetVersionRepository.save(version);
			String reachedScope = PromotionGate.scopeForGate(gate);
			assetRepository.findById(version.getAssetId()).ifPresent(asset -> {
				// Only advance the serving pointer when this version has climbed at
				// least as high as what the asset already serves — keeps the live
				// version serving while an edit re-climbs the ladder.
				if (scopeRank(reachedScope) >= scopeRank(asset.getScope())) {
					asset.setCurrentVersionId(version.getId());
					asset.setScope(reachedScope);
					assetRepository.save(asset);
				}
			});
		} else if ("rejected".equals(action)) {
			version.setStatus("rejected");
			assetVersionRepository.save(version);
		} else {
			throw new IllegalArgumentException("Unknown action: " + action);
		}

		PromotionEvent event = newEvent(versionId, gate, action, actorId, actorName, note);
		PromotionEvent saved = promotionEventRepository.save(event);
		auditService.record("promotion_event", action, actorId, actorName,
				"version " + versionId + " " + action + " at gate " + gate);
		return saved;
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
		// Drop gates that already got a later decision (approved/rejected) than their latest submit.
		List<PromotionEvent> pending = new ArrayList<>();
		for (PromotionEvent submit : latestByKey.values()) {
			boolean decidedSince = promotionEventRepository.findByAssetVersionId(submit.getAssetVersionId()).stream()
					.anyMatch(e -> e.getGate().equals(submit.getGate())
							&& !"submitted".equals(e.getAction())
							&& e.getOccurredAt().isAfter(submit.getOccurredAt()));
			if (!decidedSince) {
				pending.add(submit);
			}
		}
		pending.sort(Comparator.comparing(PromotionEvent::getOccurredAt));
		return pending;
	}

	private boolean hasApproval(List<PromotionEvent> events, String gate) {
		return events.stream().anyMatch(e -> gate.equals(e.getGate()) && "approved".equals(e.getAction()));
	}

	private int scopeRank(String scope) {
		if (scope == null) {
			return 0;
		}
		switch (scope) {
			case PromotionGate.SCOPE_PROJECT:
				return 1;
			case PromotionGate.SCOPE_ORGANIZATION:
				return 2;
			case PromotionGate.SCOPE_PUBLIC:
				return 3;
			case PromotionGate.SCOPE_DRAFT:
			default:
				return 0;
		}
	}

	private AssetVersion requireVersion(Integer versionId) {
		return assetVersionRepository.findById(versionId)
				.orElseThrow(() -> new IllegalArgumentException("No such asset version: " + versionId));
	}

	private AssetVersion newVersion(Integer assetId, int versionNo, String payloadRef) {
		AssetVersion version = new AssetVersion();
		version.setAssetId(assetId);
		version.setVersionNo(versionNo);
		version.setStatus("draft");
		version.setPayloadRef(payloadRef);
		version.setContentDigest(digest(assetId + ":v" + versionNo, payloadRef));
		version.setUpdatedAt(Instant.now());
		return version;
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

	/** SHA-256 of the content — computed once, stable across gates (§5: same bytes approved up the ladder). */
	private String digest(String salt, String payloadRef) {
		try {
			MessageDigest md = MessageDigest.getInstance("SHA-256");
			byte[] hash = md.digest(((salt == null ? "" : salt) + "|" + (payloadRef == null ? "" : payloadRef))
					.getBytes(StandardCharsets.UTF_8));
			StringBuilder sb = new StringBuilder();
			for (byte b : hash) {
				sb.append(String.format("%02x", b));
			}
			return sb.substring(0, 64);
		} catch (NoSuchAlgorithmException e) {
			return null;
		}
	}
}
