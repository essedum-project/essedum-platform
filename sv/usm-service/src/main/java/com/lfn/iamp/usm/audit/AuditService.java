package com.lfn.iamp.usm.audit;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

/** NFR-O2: structured, correlation-ID-tagged log entry for every RBAC write. */
@Service
public class AuditService {

	private final AuditEventRepository auditEventRepository;

	public AuditService(AuditEventRepository auditEventRepository) {
		this.auditEventRepository = auditEventRepository;
	}

	public void record(String entity, String action, Integer actorId, String actorName, String details) {
		AuditEvent event = new AuditEvent();
		event.setCorrelationId(UUID.randomUUID().toString());
		event.setEntity(entity);
		event.setAction(action);
		event.setActorId(actorId);
		event.setActorName(actorName);
		event.setDetails(details);
		event.setOccurredAt(Instant.now());
		auditEventRepository.save(event);
	}

	public List<AuditEvent> list() {
		return auditEventRepository.findAllByOrderByOccurredAtDesc();
	}
}
