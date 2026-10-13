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

	/** Called whenever a project-scoped role_assignment changes. Idempotent per project. */
	@Transactional
	public void enqueueForProject(Integer projectId) {
		if (projectId == null) {
			return;
		}
		List<IdentityProjectionTarget> existing = repository.findByProjectId(projectId);
		for (String targetType : TARGET_TYPES) {
			boolean alreadyQueued = existing.stream().anyMatch(t -> targetType.equals(t.getTargetType()));
			if (alreadyQueued) {
				continue;
			}
			IdentityProjectionTarget target = new IdentityProjectionTarget();
			target.setProjectId(projectId);
			target.setTargetType(targetType);
			target.setSyncStatus("pending");
			target.setLastAttemptAt(Instant.now());
			repository.save(target);
		}
	}

	public List<IdentityProjectionTarget> listByProject(Integer projectId) {
		return repository.findByProjectId(projectId);
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
