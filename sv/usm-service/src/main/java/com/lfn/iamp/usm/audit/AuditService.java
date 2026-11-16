package com.lfn.iamp.usm.audit;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.lfn.iamp.usm.repository.UsersRepository;

/** NFR-O2: structured, correlation-ID-tagged log entry for every RBAC write. */
@Service
public class AuditService {

	private final AuditEventRepository auditEventRepository;
	private final UsersRepository usersRepository;

	public AuditService(AuditEventRepository auditEventRepository, UsersRepository usersRepository) {
		this.auditEventRepository = auditEventRepository;
		this.usersRepository = usersRepository;
	}

	public void record(String entity, String action, Integer actorId, String actorName, String details) {
		record(entity, action, actorId, actorName, details, null, null);
	}

	public void record(String entity, String action, Integer actorId, String actorName, String details,
	                   Integer orgId, Integer projectId) {
		AuditEvent event = new AuditEvent();
		event.setCorrelationId(UUID.randomUUID().toString());
		event.setEntity(entity);
		event.setAction(action);
		event.setActorId(actorId);
		String resolvedName = usersRepository.findById(actorId)
				.map(u -> u.getUser_email() != null && !u.getUser_email().isEmpty()
						? u.getUser_email() : u.getUser_login())
				.orElse(actorName);
		event.setActorName(resolvedName);
		event.setDetails(details);
		event.setOccurredAt(Instant.now());
		event.setOrgId(orgId);
		event.setProjectId(projectId);
		auditEventRepository.save(event);
	}

	public List<AuditEvent> list(Integer orgId, Integer projectId) {
		if (orgId != null && projectId != null) {
			return auditEventRepository.findByOrgIdOrProjectIdOrderByOccurredAtDesc(orgId, projectId);
		}
		if (orgId != null) {
			return auditEventRepository.findByOrgIdOrderByOccurredAtDesc(orgId);
		}
		if (projectId != null) {
			return auditEventRepository.findByProjectIdOrderByOccurredAtDesc(projectId);
		}
		return auditEventRepository.findAllByOrderByOccurredAtDesc();
	}

	public List<AuditEvent> list() {
		return list(null, null);
	}
}
