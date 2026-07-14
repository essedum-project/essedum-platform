/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 */
package com.lfn.icip.icipwebeditor.rest;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.lfn.icip.icipwebeditor.model.dto.ICIPSkillPageResponse;
import com.lfn.icip.icipwebeditor.model.dto.ICIPSkillRegistryDTO;
import com.lfn.icip.icipwebeditor.model.dto.ICIPSkillRequest;
import com.lfn.icip.icipwebeditor.service.IICIPSkillService;
import io.micrometer.core.annotation.Timed;
import jakarta.validation.Valid;
/**
 * REST Controller for ESSEDUM Copilot Skill Registry.
 *
 * Base path : /${icip.pathPrefix}/skills
 *
 * API Summary:
 *   POST   /skills/create       — Create new skill
 *   PUT    /skills/{id}         — Update skill by ID
 *   GET    /skills/{id}         — View skill by ID
 *   GET    /skills?org=X&page=0 — All skills — paginated + filtered
 *   DELETE /skills/{id}         — Soft-delete skill
 *
 * Exception handling is delegated to GlobalControllerException.
 *
 * @author essedum
 */
@RestController
@Timed
@RequestMapping(path = "/${icip.pathPrefix}/skills")
public class ICIPSkillController {
    private static final Logger logger = LoggerFactory.getLogger(ICIPSkillController.class);
    @Autowired
    private IICIPSkillService skillService;
    @PostMapping("/create")
    public ResponseEntity<ICIPSkillRegistryDTO> createSkill(
            @Valid @RequestBody ICIPSkillRequest request,
            @RequestParam(name = "org") String organization,
            @RequestParam(name = "projectId", required = false) Integer projectId,
            @RequestHeader(value = "Userid", required = false) String userLogin) {
        String createdBy = resolveUser(userLogin);
        logger.info("POST /skills/create — name: {} org: {}", request.getSkillName(), organization);
        ICIPSkillRegistryDTO created = skillService.createSkill(request, organization, projectId, createdBy);
        return new ResponseEntity<>(created, new HttpHeaders(), HttpStatus.CREATED);
    }
    @PutMapping("/{id}")
    public ResponseEntity<ICIPSkillRegistryDTO> updateSkill(
            @PathVariable(name = "id") Long id,
            @Valid @RequestBody ICIPSkillRequest request,
            @RequestHeader(value = "Userid", required = false) String userLogin) {
        String updatedBy = resolveUser(userLogin);
        logger.info("PUT /skills/{} by: {}", id, updatedBy);
        ICIPSkillRegistryDTO updated = skillService.updateSkill(id, request, updatedBy);
        return new ResponseEntity<>(updated, new HttpHeaders(), HttpStatus.OK);
    }
    @GetMapping("/{id}")
    public ResponseEntity<ICIPSkillRegistryDTO> getSkillById(
            @PathVariable(name = "id") Long id) {
        logger.debug("GET /skills/{}", id);
        ICIPSkillRegistryDTO skill = skillService.getSkillById(id);
        return new ResponseEntity<>(skill, new HttpHeaders(), HttpStatus.OK);
    }
    @GetMapping
    public ResponseEntity<ICIPSkillPageResponse> getAllSkills(
            @RequestParam(name = "org") String organization,
            @RequestParam(name = "status",           required = false) String status,
            @RequestParam(name = "skillType",        required = false) String skillType,
            @RequestParam(name = "skillCategory",    required = false) String skillCategory,
            @RequestParam(name = "skillSubcategory", required = false) String skillSubcategory,
            @RequestParam(name = "visibility",       required = false) String visibility,
            @RequestParam(name = "search",           required = false) String search,
            @RequestParam(name = "page", defaultValue = "0")  int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        logger.debug("GET /skills org: {} page: {} size: {}", organization, page, size);
        ICIPSkillPageResponse response = skillService.getAllSkills(
                organization, status, skillType, skillCategory,
                skillSubcategory, visibility, search, page, size);
        return new ResponseEntity<>(response, new HttpHeaders(), HttpStatus.OK);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSkill(
            @PathVariable(name = "id") Long id,
            @RequestHeader(value = "Userid", required = false) String userLogin) {
        String deletedBy = resolveUser(userLogin);
        logger.info("DELETE /skills/{} by: {}", id, deletedBy);
        skillService.deleteSkill(id, deletedBy);
        return ResponseEntity.ok(Map.of("message", "Skill deleted successfully", "id", id));
    }
    private String resolveUser(String userLogin) {
        return (userLogin != null && !userLogin.isBlank()) ? userLogin : "system";
    }
}