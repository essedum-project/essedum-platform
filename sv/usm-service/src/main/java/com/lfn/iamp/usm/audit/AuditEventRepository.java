package com.lfn.iamp.usm.audit;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditEventRepository extends JpaRepository<AuditEvent, Integer> {
	List<AuditEvent> findAllByOrderByOccurredAtDesc();
}
