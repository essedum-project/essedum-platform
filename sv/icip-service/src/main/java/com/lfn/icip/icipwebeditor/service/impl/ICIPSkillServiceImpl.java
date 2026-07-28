/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 */

package com.lfn.icip.icipwebeditor.service.impl;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.lfn.icip.icipwebeditor.model.ICIPSkillAuditLog;
import com.lfn.icip.icipwebeditor.model.ICIPSkillRegistry;
import com.lfn.icip.icipwebeditor.model.dto.ICIPSkillPageResponse;
import com.lfn.icip.icipwebeditor.model.dto.ICIPSkillRegistryDTO;
import com.lfn.icip.icipwebeditor.model.dto.ICIPSkillRequest;
import com.lfn.icip.icipwebeditor.repository.ICIPSkillAuditLogRepository;
import com.lfn.icip.icipwebeditor.repository.ICIPSkillRegistryRepository;
import com.lfn.icip.icipwebeditor.rest.exception.SkillRegistryException;
import com.lfn.icip.icipwebeditor.service.IICIPSkillService;

/**
 * Service implementation for ESSEDUM Copilot Skill Registry.
 * Handles CRUD, audit logging, usage tracking, and soft delete.
 *
 * @author essedum
 */
@Service
@Transactional
public class ICIPSkillServiceImpl implements IICIPSkillService {

    private static final Logger logger = LoggerFactory.getLogger(ICIPSkillServiceImpl.class);

    // ── Constructor injection ─────────────────────────────────────────────────
    private final ICIPSkillRegistryRepository skillRepository;
    private final ICIPSkillAuditLogRepository auditLogRepository;
    private final ICIPSkillAuditService auditService;

    public ICIPSkillServiceImpl(ICIPSkillRegistryRepository skillRepository,
                                 ICIPSkillAuditLogRepository auditLogRepository,
                                 ICIPSkillAuditService auditService) {
        this.skillRepository    = skillRepository;
        this.auditLogRepository = auditLogRepository;
        this.auditService       = auditService;
    }

    // ── CREATE ───────────────────────────────────────────────────────────────

    @Override
    public ICIPSkillRegistryDTO createSkill(ICIPSkillRequest request, String organization, Integer projectId, String createdBy) {
        logger.info("Creating skill: {} for org: {}", request.getSkillName(), organization);

        // Duplicate check: same name + version + org must be unique
        boolean exists = skillRepository.existsBySkillNameAndSkillVersionAndOrganizationAndDeletedFalse(
                request.getSkillName(), request.getSkillVersion(), organization);
        if (exists) {
            throw new SkillRegistryException("SKILL_DUPLICATE",
                    String.format("Skill '%s' version '%s' already exists in organization '%s'",
                            request.getSkillName(), request.getSkillVersion(), organization));
        }

        ICIPSkillRegistry skill = mapRequestToEntity(request);
        skill.setSkillUid(UUID.randomUUID().toString());
        skill.setOrganization(organization);
        skill.setProjectId(projectId);
        skill.setCreatedBy(createdBy);
        skill.setCreatedDate(Instant.now());
        // NOTE: lastModifiedBy and lastModifiedDate are intentionally NOT set on creation
        // They remain null until the skill is actually updated via PUT /skills/{id}

        ICIPSkillRegistry saved = skillRepository.save(skill);

        // Audit: record CREATE event
        saveAuditLog(saved.getId(), saved.getSkillName(), "CREATE",
                null, null, null, createdBy, saved.getOrganization(), null);

        logger.info("Skill created — id: {} uid: {}", saved.getId(), saved.getSkillUid());
        return mapEntityToDTO(saved);
    }

    // ── UPDATE ───────────────────────────────────────────────────────────────

    @Override
    public ICIPSkillRegistryDTO updateSkill(Long id, ICIPSkillRequest request, String updatedBy) {
        logger.info("Updating skill id: {} by: {}", id, updatedBy);

        ICIPSkillRegistry existing = skillRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new SkillRegistryException("SKILL_NOT_FOUND",
                        "Skill not found with id: " + id));

        // Audit each changed field before applying update
        auditChangedFields(existing, request, updatedBy);

        updateEntityFromRequest(existing, request);
        // Stamp who modified and when — AuditListener only logs, does NOT set these fields
        existing.setLastmodifiedby(updatedBy);
        existing.setLastmodifieddate(new Timestamp(System.currentTimeMillis()));
        ICIPSkillRegistry updated = skillRepository.save(existing);

        logger.info("Skill updated — id: {}", id);
        return mapEntityToDTO(updated);
    }

    // ── GET SINGLE ───────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public ICIPSkillRegistryDTO getSkillById(Long id) {
        logger.debug("Fetching skill id: {}", id);
        ICIPSkillRegistry skill = skillRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new SkillRegistryException("SKILL_NOT_FOUND",
                        "Skill not found with id: " + id));
        return mapEntityToDTO(skill);
    }

    // ── GET ALL — paginated with optional filters ─────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public ICIPSkillPageResponse getAllSkills(String organization, String status,
            String skillType, String skillCategory, String skillSubcategory,
            String visibility, String search, int page, int size) {

        logger.debug("Fetching skills org: {} page: {} size: {}", organization, page, size);

        if (!StringUtils.hasText(organization)) {
            throw new SkillRegistryException("SKILL_ORG_REQUIRED", "Organization is required");
        }

        // Normalize empty strings to null for optional JPQL :param IS NULL checks
        String statusFilter        = StringUtils.hasText(status)           ? status           : null;
        String typeFilter          = StringUtils.hasText(skillType)        ? skillType        : null;
        String categoryFilter      = StringUtils.hasText(skillCategory)    ? skillCategory    : null;
        String subcategoryFilter   = StringUtils.hasText(skillSubcategory) ? skillSubcategory : null;
        String visibilityFilter    = StringUtils.hasText(visibility)       ? visibility       : null;
        String searchFilter        = StringUtils.hasText(search)           ? search           : null;

        Pageable pageable = PageRequest.of(page, size);

        Page<ICIPSkillRegistry> resultPage = skillRepository.findAllWithFilters(
                organization, statusFilter, typeFilter, categoryFilter,
                subcategoryFilter, visibilityFilter, searchFilter, pageable);

        List<ICIPSkillRegistryDTO> dtoList = resultPage.getContent()
                .stream()
                .map(this::mapEntityToDTO)
                .collect(Collectors.toList());

        // Fetch distinct filter options for UI dropdowns (always scoped to org)
        List<String> availableTypes         = skillRepository.findDistinctSkillTypesByOrg(organization);
        List<String> availableCategories    = skillRepository.findDistinctSkillCategoriesByOrg(organization);
        List<String> availableSubcategories = skillRepository.findDistinctSkillSubcategoriesByOrg(organization);

        return ICIPSkillPageResponse.builder()
                .skills(dtoList)
                .count(dtoList.size())
                .totalCount(resultPage.getTotalElements())
                .page(resultPage.getNumber())
                .size(resultPage.getSize())
                .totalPages(resultPage.getTotalPages())
                .availableTypes(availableTypes)
                .availableCategories(availableCategories)
                .availableSubcategories(availableSubcategories)
                .build();
    }

    // ── DELETE — soft delete ─────────────────────────────────────────────────

    @Override
    public void deleteSkill(Long id, String deletedBy) {
        logger.info("Soft deleting skill id: {} by: {}", id, deletedBy);

        ICIPSkillRegistry skill = skillRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new SkillRegistryException("SKILL_NOT_FOUND",
                        "Skill not found with id: " + id));

        int updated = skillRepository.softDeleteById(id, deletedBy);
        if (updated == 0) {
            throw new SkillRegistryException("SKILL_DELETE_FAILED",
                    "Failed to delete skill with id: " + id);
        }

        // Audit: record DELETE event
        saveAuditLog(id, skill.getSkillName(), "DELETE",
                "status", skill.getStatus(), "INACTIVE",
                deletedBy, skill.getOrganization(), null);

        logger.info("Skill id: {} soft deleted by: {}", id, deletedBy);
    }


    // ── PRIVATE HELPERS ───────────────────────────────────────────────────────


    private ICIPSkillRegistry mapRequestToEntity(ICIPSkillRequest req) {
        ICIPSkillRegistry skill = new ICIPSkillRegistry();
        skill.setSkillName(req.getSkillName());
        skill.setSkillAlias(req.getSkillAlias());
        skill.setSkillVersion(StringUtils.hasText(req.getSkillVersion()) ? req.getSkillVersion() : "1.0.0");
        skill.setSkillType(req.getSkillType());
        skill.setSkillCategory(req.getSkillCategory());
        skill.setSkillSubcategory(req.getSkillSubcategory());
        skill.setTags(req.getTags());
        skill.setTriggerKeywords(req.getTriggerKeywords());
        skill.setDescription(req.getDescription());
        skill.setLanguage(req.getLanguage());
        skill.setFramework(req.getFramework());
        skill.setRuntime(req.getRuntime());
        skill.setEntrypoint(req.getEntrypoint());
        skill.setInputSchema(req.getInputSchema());
        skill.setOutputSchema(req.getOutputSchema());
        skill.setPipelineScope(StringUtils.hasText(req.getPipelineScope()) ? req.getPipelineScope() : "ALL");
        skill.setStatus(StringUtils.hasText(req.getStatus()) ? req.getStatus() : "ACTIVE");
        skill.setVisibility(StringUtils.hasText(req.getVisibility()) ? req.getVisibility() : "PROJECT");
        // NOTE: organization and projectId are set from request params — not from body
        return skill;
    }

    private void updateEntityFromRequest(ICIPSkillRegistry skill, ICIPSkillRequest req) {
        skill.setSkillName(req.getSkillName());
        skill.setSkillAlias(req.getSkillAlias());
        // Fallback defaults for nullable=false fields — guard against client omitting them
        skill.setSkillVersion(StringUtils.hasText(req.getSkillVersion()) ? req.getSkillVersion() : "1.0.0");
        skill.setSkillType(req.getSkillType());
        skill.setSkillCategory(req.getSkillCategory());
        skill.setSkillSubcategory(req.getSkillSubcategory());
        skill.setTags(req.getTags());
        skill.setTriggerKeywords(req.getTriggerKeywords());
        skill.setDescription(req.getDescription());
        skill.setLanguage(req.getLanguage());
        skill.setFramework(req.getFramework());
        skill.setRuntime(req.getRuntime());
        skill.setEntrypoint(req.getEntrypoint());
        skill.setInputSchema(req.getInputSchema());
        skill.setOutputSchema(req.getOutputSchema());
        skill.setPipelineScope(StringUtils.hasText(req.getPipelineScope()) ? req.getPipelineScope() : "ALL");
        skill.setStatus(StringUtils.hasText(req.getStatus()) ? req.getStatus() : "ACTIVE");
        skill.setVisibility(StringUtils.hasText(req.getVisibility()) ? req.getVisibility() : "PROJECT");
        // NOTE: organization and createdBy are immutable — never updated
        // NOTE: projectId is immutable after creation
    }

    private ICIPSkillRegistryDTO mapEntityToDTO(ICIPSkillRegistry skill) {
        ICIPSkillRegistryDTO dto = new ICIPSkillRegistryDTO();
        dto.setId(skill.getId());
        dto.setSkillUid(skill.getSkillUid());
        dto.setSkillName(skill.getSkillName());
        dto.setSkillAlias(skill.getSkillAlias());
        dto.setSkillVersion(skill.getSkillVersion());
        dto.setSkillType(skill.getSkillType());
        dto.setSkillCategory(skill.getSkillCategory());
        dto.setSkillSubcategory(skill.getSkillSubcategory());
        dto.setTags(skill.getTags());
        dto.setTriggerKeywords(skill.getTriggerKeywords());
        dto.setDescription(skill.getDescription());
        dto.setLanguage(skill.getLanguage());
        dto.setFramework(skill.getFramework());
        dto.setRuntime(skill.getRuntime());
        dto.setEntrypoint(skill.getEntrypoint());
        dto.setInputSchema(skill.getInputSchema());
        dto.setOutputSchema(skill.getOutputSchema());
        dto.setPipelineScope(skill.getPipelineScope());
        dto.setStatus(skill.getStatus());
        dto.setVisibility(skill.getVisibility());
        dto.setOrganization(skill.getOrganization());
        dto.setProjectId(skill.getProjectId());
        dto.setUsageCount(skill.getUsageCount());
        dto.setLastUsedDate(skill.getLastUsedDate());
        dto.setCreatedBy(skill.getCreatedBy());
        dto.setCreatedDate(skill.getCreatedDate());
        dto.setLastModifiedBy(skill.getLastmodifiedby());
        dto.setLastModifiedDate(skill.getLastmodifieddate() != null
                ? skill.getLastmodifieddate().toInstant() : null);
        return dto;
    }

    /** Compares old values vs incoming request and logs each changed field separately. */
    private void auditChangedFields(ICIPSkillRegistry existing,
            ICIPSkillRequest request, String changedBy) {
        checkAndAudit(existing, "skill_name",        existing.getSkillName(),        request.getSkillName(),        changedBy);
        checkAndAudit(existing, "status",             existing.getStatus(),            request.getStatus(),            changedBy);
        checkAndAudit(existing, "skill_type",         existing.getSkillType(),         request.getSkillType(),         changedBy);
        checkAndAudit(existing, "visibility",         existing.getVisibility(),        request.getVisibility(),        changedBy);
        checkAndAudit(existing, "pipeline_scope",     existing.getPipelineScope(),     request.getPipelineScope(),     changedBy);
        checkAndAudit(existing, "description",        existing.getDescription(),       request.getDescription(),       changedBy);
        checkAndAudit(existing, "skill_category",     existing.getSkillCategory(),     request.getSkillCategory(),     changedBy);
        checkAndAudit(existing, "skill_subcategory",  existing.getSkillSubcategory(),  request.getSkillSubcategory(),  changedBy);
        checkAndAudit(existing, "tags",               existing.getTags(),              request.getTags(),              changedBy);
    }

    private void checkAndAudit(ICIPSkillRegistry existing, String field,
            String oldVal, String newVal, String changedBy) {
        if (!Objects.equals(oldVal, newVal)) {
            saveAuditLog(existing.getId(), existing.getSkillName(),
                    "UPDATE", field, oldVal, newVal, changedBy, existing.getOrganization(), null);
        }
    }

    /**
     * Saves an audit log entry in a REQUIRES_NEW transaction via ICIPSkillAuditService.
     * Failure is caught and logged — must NEVER propagate and break the main operation.
     */
    private void saveAuditLog(Long skillId, String skillName, String action,
            String changedField, String oldValue, String newValue,
            String changedBy, String organization, String remarks) {
        try {
            ICIPSkillAuditLog log = ICIPSkillAuditLog.builder()
                    .skillId(skillId)
                    .skillName(skillName)
                    .action(action)
                    .changedField(changedField)
                    .oldValue(oldValue)
                    .newValue(newValue)
                    .changedBy(changedBy)
                    .changedDate(Instant.now())
                    .organization(organization)
                    .remarks(remarks)
                    .build();
            auditService.save(log);
        } catch (Exception e) {
            logger.error("Audit log save failed — skill id: {} action: {} — {}", skillId, action, e.getMessage());
        }
    }
}

