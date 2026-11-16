package com.lfn.iamp.usm.identity;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Outbox pattern (§8): a role_assignment write enqueues one "to-do" row per
 * external system, in the same transaction, so a change can never silently
 * fail to queue its sync. The actual Git/K8s/Storage/Gateway connectors are
 * NOT implemented here — no infra access from this environment to build
 * against. This is the queue + status tracking half of the design only.
 */
@Service
public class IdentityProjectionService {

	private static final List<String> TARGET_TYPES = Arrays.asList(
			"git_team", "k8s_rbac", "storage_iam", "gateway_key");

	private final IdentityProjectionTargetRepository repository;

	public IdentityProjectionService(IdentityProjectionTargetRepository repository) {
		this.repository = repository;
	}

	/**
	 * Called whenever a project-scoped role_assignment changes: ensures the four
	 * to-do rows exist and (re-)marks them pending so the worker re-syncs every
	 * external system. A change can never silently fail to queue (outbox, §8).
	 */
	@Transactional
	public void enqueueForProject(Integer projectId) {
		if (projectId == null) {
			return;
		}
		List<IdentityProjectionTarget> existing = repository.findByProjectId(projectId);
		for (String targetType : TARGET_TYPES) {
			IdentityProjectionTarget target = existing.stream()
					.filter(t -> targetType.equals(t.getTargetType()))
					.findFirst()
					.orElseGet(() -> {
						IdentityProjectionTarget t = new IdentityProjectionTarget();
						t.setProjectId(projectId);
						t.setTargetType(targetType);
						return t;
					});
			target.setSyncStatus("pending");
			target.setLastAttemptAt(Instant.now());
			repository.save(target);
		}
	}

	public List<IdentityProjectionTarget> listAll() {
		return repository.findAll();
	}

	public List<IdentityProjectionTarget> listByProject(Integer projectId) {
		return repository.findByProjectId(projectId);
	}

	/** Re-queue a single target for the worker (manual retry from the UI). */
	public void retry(Integer targetId) {
		markStatus(targetId, "pending");
	}

	public List<IdentityProjectionTarget> listPending() {
		return repository.findBySyncStatus("pending");
	}

	public void markStatus(Integer targetId, String status) {
		repository.findById(targetId).ifPresent(target -> {
			target.setSyncStatus(status);
			target.setLastAttemptAt(Instant.now());
			repository.save(target);
		});
	}
}
