package com.lfn.iamp.usm.identity;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Drains the identity-projection outbox (§8): picks up pending targets and
 * applies the matching connector, marking each synced/failed so a role change
 * reaches every external system with no manual step. Failures stay pending and
 * are retried on the next tick.
 */
@Component
public class IdentityProjectionWorker {

	private static final Logger log = LoggerFactory.getLogger(IdentityProjectionWorker.class);

	private final IdentityProjectionService service;
	private final Map<String, ProjectionConnector> byType;
	private final ProjectionConnector fallback;

	public IdentityProjectionWorker(IdentityProjectionService service, List<ProjectionConnector> connectors) {
		this.service = service;
		this.byType = connectors.stream()
				.filter(c -> !"*".equals(c.targetType()))
				.collect(Collectors.toMap(ProjectionConnector::targetType, Function.identity(), (a, b) -> a));
		this.fallback = connectors.stream().filter(c -> "*".equals(c.targetType())).findFirst().orElse(null);
	}

	/** Runs continuously (every 15s) — the §8 "sync worker" loop. */
	@Scheduled(fixedDelayString = "${identity.projection.drain-interval-ms:15000}")
	public void drain() {
		List<IdentityProjectionTarget> pending = service.listPending();
		if (pending.isEmpty()) {
			return;
		}
		for (IdentityProjectionTarget target : pending) {
			ProjectionConnector connector = byType.getOrDefault(target.getTargetType(), fallback);
			if (connector == null) {
				continue;
			}
			try {
				boolean ok = connector.apply(target);
				service.markStatus(target.getId(), ok ? "synced" : "pending");
			} catch (Exception e) {
				log.warn("[identity-projection] failed {} for project {}: {}",
						target.getTargetType(), target.getProjectId(), e.getMessage());
				service.markStatus(target.getId(), "failed");
			}
		}
	}
}
