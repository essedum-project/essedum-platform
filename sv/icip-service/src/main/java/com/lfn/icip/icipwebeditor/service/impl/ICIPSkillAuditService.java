/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 */

package com.lfn.icip.icipwebeditor.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.lfn.icip.icipwebeditor.model.ICIPSkillAuditLog;
import com.lfn.icip.icipwebeditor.repository.ICIPSkillAuditLogRepository;

/**
 * Runs audit-log inserts in their own transaction (REQUIRES_NEW) so a failure
 * never marks the caller's transaction rollback-only.
 */
@Service
public class ICIPSkillAuditService {

    private static final Logger logger = LoggerFactory.getLogger(ICIPSkillAuditService.class);

    private final ICIPSkillAuditLogRepository auditLogRepository;

    public ICIPSkillAuditService(ICIPSkillAuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void save(ICIPSkillAuditLog log) {
        auditLogRepository.save(log);
        logger.debug("Audit log saved — skill id: {} action: {}", log.getSkillId(), log.getAction());
    }
}
