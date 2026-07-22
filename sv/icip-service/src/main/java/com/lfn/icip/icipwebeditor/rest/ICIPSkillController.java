/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 */
package com.lfn.icip.icipwebeditor.rest;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
import com.lfn.ai.comm.lib.util.ICIPUtils;
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
 * createdBy / updatedBy / deletedBy is resolved from JWT token first
 * (via ICIPUtils.getUser), falling back to Userid header, then "system".
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

    /** JWT claim to read display username from — e.g. "preferred_username" for createdBy/updatedBy */
    @Value("${security.display-claim:preferred_username}")
    private String userClaim;

    @PostMapping("/create")
    public ResponseEntity<ICIPSkillRegistryDTO> createSkill(
            @Valid @RequestBody ICIPSkillRequest request,
            @RequestParam(name = "org") String organization,
            @RequestParam(name = "projectId", required = false) Integer projectId,
            @RequestHeader(value = "Userid", required = false) String userIdHeader) {
        String createdBy = resolveUser(userIdHeader);
        logger.info("POST /skills/create — name: {} org: {} by: {}", request.getSkillName(), organization, createdBy);
        ICIPSkillRegistryDTO created = skillService.createSkill(request, organization, projectId, createdBy);
        return new ResponseEntity<>(created, new HttpHeaders(), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ICIPSkillRegistryDTO> updateSkill(
            @PathVariable(name = "id") Long id,
            @Valid @RequestBody ICIPSkillRequest request,
            @RequestHeader(value = "Userid", required = false) String userIdHeader) {
        String updatedBy = resolveUser(userIdHeader);
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
            @RequestHeader(value = "Userid", required = false) String userIdHeader) {
        String deletedBy = resolveUser(userIdHeader);
        logger.info("DELETE /skills/{} by: {}", id, deletedBy);
        skillService.deleteSkill(id, deletedBy);
        return ResponseEntity.ok(Map.of("message", "Skill deleted successfully", "id", id));
    }

    /**
     * Resolves the acting user in this priority order:
     *   1. JWT token claim (preferred_username / email) — most reliable, auto-populated by security filter
     *   2. Userid request header — fallback for non-OAuth2 environments
     *   3. "system" — absolute fallback
     */
    private String resolveUser(String userIdHeader) {
        // 1. Try JWT token from SecurityContextHolder (set by CustomAuthFilter)
        String jwtUser = ICIPUtils.getUser(userClaim);
        if (jwtUser != null && !jwtUser.isBlank() && !"Anonymous".equals(jwtUser)) {
            return jwtUser;
        }
        // 2. Fall back to Userid header
        if (userIdHeader != null && !userIdHeader.isBlank()) {
            return userIdHeader;
        }
        // 3. Final fallback
        return "system";
    }
}