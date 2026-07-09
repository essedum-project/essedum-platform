/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

package com.lfn.icip.icipwebeditor.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.lfn.icip.icipwebeditor.model.ICIPSkillRegistry;

/**
 * Repository for icip_skill_registry table.
 * Supports paginated listing, filtered queries, soft delete, and usage tracking.
 *
 * @author essedum
 */
public interface ICIPSkillRegistryRepository extends JpaRepository<ICIPSkillRegistry, Long> {

    // ── Single lookups ────────────────────────────────────────────────────────

    Optional<ICIPSkillRegistry> findByIdAndDeletedFalse(Long id);

    Optional<ICIPSkillRegistry> findBySkillUidAndDeletedFalse(String skillUid);

    Optional<ICIPSkillRegistry> findBySkillAliasAndOrganizationAndStatusAndDeletedFalse(
            String skillAlias, String organization, String status);

    boolean existsBySkillNameAndSkillVersionAndOrganizationAndDeletedFalse(
            String skillName, String skillVersion, String organization);

    // ── Paginated list with optional filters ─────────────────────────────────

    @Query(
        value = """
            SELECT s FROM ICIPSkillRegistry s
            WHERE s.deleted = false
              AND s.organization = :org
              AND (:status IS NULL OR s.status = :status)
              AND (:skillType IS NULL OR s.skillType = :skillType)
              AND (:skillCategory IS NULL OR s.skillCategory = :skillCategory)
              AND (:visibility IS NULL OR s.visibility = :visibility)
              AND (:search IS NULL
                   OR LOWER(s.skillName) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(s.description) LIKE LOWER(CONCAT('%', :search, '%')))
            ORDER BY s.createdDate DESC
        """,
        countQuery = """
            SELECT COUNT(s) FROM ICIPSkillRegistry s
            WHERE s.deleted = false
              AND s.organization = :org
              AND (:status IS NULL OR s.status = :status)
              AND (:skillType IS NULL OR s.skillType = :skillType)
              AND (:skillCategory IS NULL OR s.skillCategory = :skillCategory)
              AND (:visibility IS NULL OR s.visibility = :visibility)
              AND (:search IS NULL
                   OR LOWER(s.skillName) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(s.description) LIKE LOWER(CONCAT('%', :search, '%')))
        """
    )
    Page<ICIPSkillRegistry> findAllWithFilters(
            @Param("org")          String organization,
            @Param("status")       String status,
            @Param("skillType")    String skillType,
            @Param("skillCategory") String skillCategory,
            @Param("visibility")   String visibility,
            @Param("search")       String search,
            Pageable pageable);

    // ── Copilot Tab — all active skills for org (used for prompt matching) ────

    @Query("""
        SELECT s FROM ICIPSkillRegistry s
        WHERE s.deleted = false
          AND s.status = 'ACTIVE'
          AND s.organization = :org
          AND (s.pipelineScope = 'ALL'
               OR s.visibility IN ('GLOBAL', 'ORG'))
        ORDER BY s.usageCount DESC
    """)
    List<ICIPSkillRegistry> findActiveSkillsForOrg(@Param("org") String organization);

    // ── Distinct filter values for UI dropdowns ─────────────────────────���─────

    @Query("""
        SELECT DISTINCT s.skillType FROM ICIPSkillRegistry s
        WHERE s.deleted = false AND s.organization = :org
          AND s.skillType IS NOT NULL
        ORDER BY s.skillType
    """)
    List<String> findDistinctSkillTypesByOrg(@Param("org") String organization);

    @Query("""
        SELECT DISTINCT s.skillCategory FROM ICIPSkillRegistry s
        WHERE s.deleted = false AND s.organization = :org
          AND s.skillCategory IS NOT NULL
        ORDER BY s.skillCategory
    """)
    List<String> findDistinctSkillCategoriesByOrg(@Param("org") String organization);

    @Query("""
        SELECT DISTINCT s.skillSubcategory FROM ICIPSkillRegistry s
        WHERE s.deleted = false AND s.organization = :org
          AND s.skillSubcategory IS NOT NULL
        ORDER BY s.skillSubcategory
    """)
    List<String> findDistinctSkillSubcategoriesByOrg(@Param("org") String organization);

    // ── Soft delete ─────────────────────────────────────────────────────────

    @Modifying
    @Transactional
    @Query("""
        UPDATE ICIPSkillRegistry s
        SET s.deleted = true,
            s.deletedBy = :deletedBy,
            s.deletedDate = CURRENT_TIMESTAMP,
            s.status = 'INACTIVE'
        WHERE s.id = :id AND s.deleted = false
    """)
    int softDeleteById(@Param("id") Long id, @Param("deletedBy") String deletedBy);

    // ── Usage count increment ─────────────────────────────────────────────────

    @Modifying
    @Transactional
    @Query("""
        UPDATE ICIPSkillRegistry s
        SET s.usageCount = s.usageCount + 1,
            s.lastUsedDate = CURRENT_TIMESTAMP
        WHERE s.id = :id
    """)
    void incrementUsageCount(@Param("id") Long id);
}

