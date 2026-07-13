/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 */

package com.lfn.icip.icipwebeditor.service;

import java.util.List;

import com.lfn.icip.icipwebeditor.model.dto.ICIPSkillPageResponse;
import com.lfn.icip.icipwebeditor.model.dto.ICIPSkillRegistryDTO;
import com.lfn.icip.icipwebeditor.model.dto.ICIPSkillRequest;

/**
 * Service interface for ESSEDUM Copilot Skill Registry.
 *
 * @author essedum
 */
public interface IICIPSkillService {

    ICIPSkillRegistryDTO createSkill(ICIPSkillRequest request, String organization, Integer projectId, String createdBy);

    ICIPSkillRegistryDTO updateSkill(Long id, ICIPSkillRequest request, String updatedBy);

    ICIPSkillRegistryDTO getSkillById(Long id);

    ICIPSkillPageResponse getAllSkills(
            String organization, String status, String skillType,
            String skillCategory, String skillSubcategory, String visibility,
            String search, int page, int size);

    void deleteSkill(Long id, String deletedBy);
}

