package com.lfn.icip.vibecoding.rest;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lfn.icip.vibecoding.service.VibeCodingService;

/**
 * REST controller exposing Goose recipe endpoints to the Vibe Studio frontend.
 * <p>
 * Covers: list, parse, create, save, delete, encode/decode, scan, to-yaml,
 * schedule assignment, and slash-command assignment.
 * <p>
 * Base path: {@code /${icip.pathPrefix}/service/v1/vibe-coding}
 */
@RestController
@RequestMapping("/${icip.pathPrefix}/service/v1/vibe-coding")
public class GooseRecipeController {

    private static final Logger logger = LoggerFactory.getLogger(GooseRecipeController.class);

    private final VibeCodingService vibeCodingService;

    public GooseRecipeController(VibeCodingService vibeCodingService) {
        this.vibeCodingService = vibeCodingService;
    }

    // =========================================================================
    // RECIPES
    // =========================================================================

    /**
     * List all saved recipes with their metadata.
     * Response: { manifests: [{ id, file_path, last_modified, recipe,
     *             slash_command?, schedule_cron? }] }
     */
    @GetMapping(value = "/recipes/list", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> recipesList() {
        logger.info("Recipes list request");
        return vibeCodingService.get("/recipes/list", null);
    }

    /**
     * Parse a recipe from raw YAML/JSON content.
     * Request: { content }
     * Response: { recipe }
     */
    @PostMapping(value = "/recipes/parse",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> recipesParse(@RequestBody Map<String, Object> request) {
        logger.info("Recipes parse request");
        return vibeCodingService.post("/recipes/parse", request);
    }

    /**
     * Create a recipe from an existing session's conversation.
     * Request: { session_id, author?: { contact?, metadata? } }
     * Response: { recipe?, error? }
     */
    @PostMapping(value = "/recipes/create",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> recipesCreate(@RequestBody Map<String, Object> request) {
        logger.info("Recipes create request");
        return vibeCodingService.post("/recipes/create", request);
    }

    /**
     * Save a recipe to disk.
     * Request: { recipe, id? }
     * Response: (empty)
     */
    @PostMapping(value = "/recipes/save",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> recipesSave(@RequestBody Map<String, Object> request) {
        logger.info("Recipes save request");
        return vibeCodingService.post("/recipes/save", request);
    }

    /**
     * Delete a saved recipe by ID.
     * Request: { id }
     * Response: (empty)
     */
    @PostMapping(value = "/recipes/delete",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> recipesDelete(@RequestBody Map<String, Object> request) {
        logger.info("Recipes delete request");
        return vibeCodingService.post("/recipes/delete", request);
    }

    /**
     * Encode a recipe into a shareable deeplink string.
     * Request: { recipe }
     * Response: { deeplink }
     */
    @PostMapping(value = "/recipes/encode",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> recipesEncode(@RequestBody Map<String, Object> request) {
        logger.info("Recipes encode request");
        return vibeCodingService.post("/recipes/encode", request);
    }

    /**
     * Decode a deeplink back into a recipe object.
     * Request: { deeplink }
     * Response: { recipe }
     */
    @PostMapping(value = "/recipes/decode",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> recipesDecode(@RequestBody Map<String, Object> request) {
        logger.info("Recipes decode request");
        return vibeCodingService.post("/recipes/decode", request);
    }

    /**
     * Scan a recipe for potential security issues.
     * Request: { recipe }
     * Response: { has_security_warnings }
     */
    @PostMapping(value = "/recipes/scan",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> recipesScan(@RequestBody Map<String, Object> request) {
        logger.info("Recipes scan request");
        return vibeCodingService.post("/recipes/scan", request);
    }

    /**
     * Convert a recipe object to its YAML representation.
     * Request: { recipe }
     * Response: { yaml }
     */
    @PostMapping(value = "/recipes/to-yaml",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> recipesToYaml(@RequestBody Map<String, Object> request) {
        logger.info("Recipes to-yaml request");
        return vibeCodingService.post("/recipes/to-yaml", request);
    }

    /**
     * Assign or remove a cron schedule from a recipe.
     * Request: { id, cron_schedule? }
     * Response: (empty)
     */
    @PostMapping(value = "/recipes/schedule",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> recipesSchedule(@RequestBody Map<String, Object> request) {
        logger.info("Recipes schedule request");
        return vibeCodingService.post("/recipes/schedule", request);
    }

    /**
     * Assign or remove a slash command trigger from a recipe.
     * Request: { id, slash_command? }
     * Response: (empty)
     */
    @PostMapping(value = "/recipes/slash-command",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> recipesSlashCommand(@RequestBody Map<String, Object> request) {
        logger.info("Recipes slash command request");
        return vibeCodingService.post("/recipes/slash-command", request);
    }
}
