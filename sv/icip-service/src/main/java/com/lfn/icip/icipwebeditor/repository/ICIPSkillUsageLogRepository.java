/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 */

package com.lfn.icip.icipwebeditor.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.lfn.icip.icipwebeditor.model.ICIPSkillUsageLog;

/**
 * Repository for icip_skill_usage_log table.
 *
 * @author essedum
 */
public interface ICIPSkillUsageLogRepository extends JpaRepository<ICIPSkillUsageLog, Long> {

    /** Usage frequency per pipeline for a given skill. */
    @Query("""
        SELECT u.pipelineName, COUNT(u) as useCount
        FROM ICIPSkillUsageLog u
        WHERE u.skillId = :skillId
        GROUP BY u.pipelineId, u.pipelineName
        ORDER BY useCount DESC
    """)
    List<Object[]> findPipelineUsageBySkill(@Param("skillId") Long skillId);

    /** Top skills by total usage in an org. */
    @Query("""
        SELECT u.skillName, COUNT(u) as useCount
        FROM ICIPSkillUsageLog u
        WHERE u.organization = :org
        GROUP BY u.skillId, u.skillName
        ORDER BY useCount DESC
    """)
    List<Object[]> findTopSkillsByOrg(@Param("org") String organization);

    long countBySkillIdAndPipelineId(Long skillId, Integer pipelineId);
}

