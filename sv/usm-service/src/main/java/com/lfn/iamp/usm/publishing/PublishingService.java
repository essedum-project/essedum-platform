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

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.lfn.iamp.usm.access.AccessContext;
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
		// Drafts are only visible to DIRECT project members — not to users who
		// reach the project transitively via an org-scoped grant.
		AccessContext ctx = accessContextService.resolve(userId);
		List<Integer> assetIds = assetRepository.findByProjectIdIn(ctx.getDirectProjectIds()).stream()
				.map(Asset::getId)
				.collect(Collectors.toList());
		// Return only the highest version_no per asset — editDraft now writes a new
		// row on every save, so an asset can have both a rejected v1 and a draft v2.
		// My Drafts should show the latest, not both.
		Map<Integer, AssetVersion> latestPerAsset = new HashMap<>();
		for (AssetVersion v : assetVersionRepository.findByAssetIdIn(assetIds)) {
			if (!"draft".equals(v.getStatus()) && !"rejected".equals(v.getStatus())
					&& !"in_review".equals(v.getStatus())) {
				continue;
			}
			AssetVersion current = latestPerAsset.get(v.getAssetId());
			if (current == null || v.getVersionNo() > current.getVersionNo()) {
				latestPerAsset.put(v.getAssetId(), v);
			}
		}
		return new ArrayList<>(latestPerAsset.values());
	}

	/**
	 * Assets reachable by the user's projects, plus every publicly-scoped asset
	 * regardless of project reach — the §4 visibleAssets query.
	 *
	 * Scope-based visibility rules :
	 *   scope=project   → only direct project members (not org-expanded)
	 *   scope=org       → any member of the same org (org-expanded reachableIds)
	 *   scope=public    → all authenticated users (added unconditionally below)
	 *   no currentVersion (pure draft) → only direct project members
	 */
	public List<Asset> listAssetsForUser(Integer userId) {
		AccessContext ctx = accessContextService.resolve(userId);
		List<Integer> reachableIds = ctx.getReachableProjectIds();
		List<Integer> directIds = ctx.getDirectProjectIds();

		List<Asset> reachable = assetRepository.findByProjectIdIn(reachableIds).stream()
				.filter(a -> {
					if (a.getCurrentVersionId() == null) {
						// Pure draft — only direct project members can see it
						return directIds.contains(a.getProjectId());
					}
					// project scope: only direct project members 
					if (PromotionGate.SCOPE_PROJECT.equals(a.getScope())) {
						return directIds.contains(a.getProjectId());
					}
					// org/public scope: org-expanded visibility is fine
					return true;
				})
				.collect(Collectors.toCollection(ArrayList::new));

		for (Asset publicAsset : assetRepository.findByScope(PromotionGate.SCOPE_PUBLIC)) {
			if (reachable.stream().noneMatch(a -> a.getId().equals(publicAsset.getId()))) {
				reachable.add(publicAsset);
			}
		}
		return reachable;
	}

	/**
	 * Single-asset lookup with the same visibility rules as listAssetsForUser —
	 * returns empty if the asset does not exist or the user cannot see it.
	 */
	public java.util.Optional<Asset> findAssetForUser(Integer assetId, Integer userId) {
		return assetRepository.findById(assetId)
				.filter(asset -> listAssetsForUser(userId).stream().anyMatch(a -> a.getId().equals(assetId)));
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
		// Rank ≥ 1 (Developer) required; viewer (rank 0) gets 403 via resource layer,
		// but also guard here as defense-in-depth.
		AccessContext ctx = accessContextService.resolve(actorId);
		if (ctx.getHighestRank() < 1 || !ctx.getDirectProjectIds().contains(projectId)) {
			throw new IllegalStateException(
					"Rank ≥ 1 (Developer) and direct project membership required to create a draft in project " + projectId);
		}

		Asset asset = new Asset();
		asset.setProjectId(projectId);
		asset.setAssetType(assetType == null || assetType.isBlank() ? "generic" : assetType);
		asset.setName(name);
		// Scope starts at "project" — the lowest promotion target.
		// Draft-ness is carried by asset_version.status, not asset.scope.
		asset.setScope(PromotionGate.SCOPE_PROJECT);
		asset.setCreatedBy(actorId);
		Asset savedAsset = assetRepository.save(asset);

		AssetVersion version = newVersion(savedAsset.getId(), 1, payloadRef, actorId);
		AssetVersion savedVersion = assetVersionRepository.save(version);

		auditService.record("asset", "created", actorId, actorName,
				"asset '" + name + "' created as draft in project " + projectId);
		return savedVersion;
	}

	/**
	 * Edit a draft — writes a NEW asset_version row with version_no+1 and
	 * re-sets status to "draft". The old row is left intact (immutable history).
	 * Each save increments version_no. Only the original creator may edit;
	 * admins approve/reject but do not author.
	 */
	@Transactional
	public AssetVersion editDraft(Integer versionId, String name, String payloadRef, Integer actorId,
	                              String actorName) {
		AssetVersion current = requireVersion(versionId);
		if (!("draft".equals(current.getStatus()) || "rejected".equals(current.getStatus()))) {
			throw new IllegalStateException("Only draft or rejected versions can be edited: v" + versionId);
		}

		// Only the creator may edit a draft.
		Asset asset = assetRepository.findById(current.getAssetId())
				.orElseThrow(() -> new IllegalArgumentException("No such asset: " + current.getAssetId()));
		if (asset.getCreatedBy() != null && !asset.getCreatedBy().equals(actorId)) {
			throw new IllegalStateException(
					"Only the creator (user " + asset.getCreatedBy() + ") may edit this draft");
		}

		// Each save writes a new version row with an incremented version_no.
		int nextNo = assetVersionRepository.findByAssetIdIn(Arrays.asList(asset.getId())).stream()
				.map(AssetVersion::getVersionNo)
				.max(Comparator.naturalOrder())
				.orElse(0) + 1;

		// Use name as the digest salt so a rename also registers as a content change.
		AssetVersion newVersion = newVersion(asset.getId(), nextNo, payloadRef, name);
		AssetVersion saved = assetVersionRepository.save(newVersion);

		if (name != null && !name.isBlank()) {
			asset.setName(name);
			assetRepository.save(asset);
		}
		auditService.record("asset_version", "edited", actorId, actorName,
				"new draft v" + nextNo + " written for asset " + asset.getName() + " (from v" + versionId + ")");
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
		AssetVersion version = newVersion(assetId, nextNo, payloadRef, actorId);
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
		//  only draft or rejected versions may be submitted
		if (!"draft".equals(version.getStatus()) && !"rejected".equals(version.getStatus())) {
			throw new IllegalStateException(
					"Only draft or rejected versions can be submitted (version " + versionId
					+ " has status=" + version.getStatus() + ")");
		}
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
		if (note == null || note.isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "note is required for approval or rejection");
		}
		if (viewerRank < PromotionGate.requiredRank(gate)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN,
					"Insufficient role to decide at gate " + gate + " (needs rank "
							+ PromotionGate.requiredRank(gate) + ", have " + viewerRank + ")");
		}
		//  a note is mandatory for every approve/reject decision
		if (note == null || note.isBlank()) {
			throw new IllegalArgumentException("A note is required for approve/reject decisions");
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

	/** All promotion events for a version — the append-only audit trail  */
	public List<PromotionEvent> getVersionEvents(Integer versionId) {
		List<PromotionEvent> events = promotionEventRepository.findByAssetVersionId(versionId);
		events.sort(Comparator.comparing(PromotionEvent::getOccurredAt));
		return events;
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
		return newVersion(assetId, versionNo, payloadRef, assetId + ":v" + versionNo);
	}

	private AssetVersion newVersion(Integer assetId, int versionNo, String payloadRef, Integer creatorId) {
		AssetVersion version = newVersion(assetId, versionNo, payloadRef, assetId + ":v" + versionNo);
		version.setCreatorId(creatorId);
		return version;
	}

	private AssetVersion newVersion(Integer assetId, int versionNo, String payloadRef, String digestSalt) {
		AssetVersion version = new AssetVersion();
		version.setAssetId(assetId);
		version.setVersionNo(versionNo);
		version.setStatus("draft");
		version.setPayloadRef(payloadRef);
		version.setContentDigest(digest(digestSalt, payloadRef));
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
