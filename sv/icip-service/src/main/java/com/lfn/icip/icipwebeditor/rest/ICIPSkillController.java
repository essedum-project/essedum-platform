/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 */
package com.lfn.icip.icipwebeditor.rest;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;
import org.json.JSONObject;
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

    /** Preference order of JWT claims tried when resolving the acting user for
     *  createdBy / lastModifiedBy / deletedBy audit fields. First non-empty wins. */
    private static final String[] USER_CLAIM_PREFERENCE = {
            "preferred_username", "email", "name", "sub"
    };

    @PostMapping("/create")
    public ResponseEntity<ICIPSkillRegistryDTO> createSkill(
            @Valid @RequestBody ICIPSkillRequest request,
            @RequestParam(name = "org") String organization,
            @RequestParam(name = "projectId", required = false) Integer projectId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "Userid", required = false) String userIdHeader) {
        String createdBy = resolveUser(authHeader, userIdHeader);
        logger.info("POST /skills/create — name: {} org: {} by: {}", request.getSkillName(), organization, createdBy);
        ICIPSkillRegistryDTO created = skillService.createSkill(request, organization, projectId, createdBy);
        return new ResponseEntity<>(created, new HttpHeaders(), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ICIPSkillRegistryDTO> updateSkill(
            @PathVariable(name = "id") Long id,
            @Valid @RequestBody ICIPSkillRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "Userid", required = false) String userIdHeader) {
        String updatedBy = resolveUser(authHeader, userIdHeader);
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
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "Userid", required = false) String userIdHeader) {
        String deletedBy = resolveUser(authHeader, userIdHeader);
        logger.info("DELETE /skills/{} by: {}", id, deletedBy);
        skillService.deleteSkill(id, deletedBy);
        return ResponseEntity.ok(Map.of("message", "Skill deleted successfully", "id", id));
    }

    /**
     * Resolves the acting user by directly decoding the JWT payload from the
     * "Authorization: Bearer …" header. This is intentionally independent of
     * Spring's SecurityContextHolder because, in Spring Security 6, the
     * JwtAuthenticationToken exposes credentials as an empty string (not the
     * Jwt object), which caused the previous SecurityContext-based lookup to
     * silently fall back to a literal "admin" value.
     *
     * Priority order:
     *   1. First non-empty claim from USER_CLAIM_PREFERENCE inside the JWT payload
     *   2. Userid request header (non-OAuth2 environments)
     *   3. "system" (absolute fallback)
     */
    private String resolveUser(String authHeader, String userIdHeader) {
        String jwtUser = extractUserFromBearer(authHeader);
        if (jwtUser != null && !jwtUser.isBlank()) {
            logger.debug("User resolved from JWT payload");
            return jwtUser;
        }
        if (userIdHeader != null && !userIdHeader.isBlank()) {
            logger.debug("JWT unavailable - using Userid header");
            return userIdHeader;
        }
        logger.warn("No JWT or Userid header found - using 'system' fallback");
        return "system";
    }

    /**
     * Decodes the JWT payload from a Bearer authorization header and returns the
     * first non-empty claim value from {@link #USER_CLAIM_PREFERENCE}. Returns
     * {@code null} if the header is missing, malformed, or none of the preferred
     * claims are present.
     */
    private String extractUserFromBearer(String authHeader) {
        if (authHeader == null || !authHeader.regionMatches(true, 0, "Bearer ", 0, 7)) {
            return null;
        }
        String token = authHeader.substring(7).trim();
        String[] parts = token.split("\\.");
        if (parts.length < 2) {
            return null;
        }
        try {
            byte[] decoded = Base64.getUrlDecoder().decode(parts[1]);
            JSONObject payload = new JSONObject(new String(decoded, StandardCharsets.UTF_8));
            for (String claimName : USER_CLAIM_PREFERENCE) {
                if (payload.has(claimName) && !payload.isNull(claimName)) {
                    String value = payload.optString(claimName, "").trim();
                    if (!value.isEmpty()) {
                        return value;
                    }
                }
            }
        } catch (IllegalArgumentException | org.json.JSONException e) {
            logger.debug("Failed to decode JWT payload: {}", e.getMessage());
        }
        return null;
    }
}
