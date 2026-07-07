/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 */

package com.lfn.icip.icipwebeditor.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lfn.icip.icipwebeditor.model.ICIPSkillAuditLog;

/**
 * Repository for icip_skill_audit_log table.
 *
 * @author essedum
 */
public interface ICIPSkillAuditLogRepository extends JpaRepository<ICIPSkillAuditLog, Long> {

    /** Full change history for a single skill — newest first. */
    List<ICIPSkillAuditLog> findBySkillIdOrderByChangedDateDesc(Long skillId);

    /** All changes made by a specific user within an org — newest first. */
    List<ICIPSkillAuditLog> findByOrganizationAndChangedByOrderByChangedDateDesc(
            String organization, String changedBy);
}

