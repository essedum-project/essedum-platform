package com.lfn.icip.vibecoding.rest;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lfn.icip.vibecoding.service.VibeCodingService;

import reactor.core.publisher.Mono;

/**
 * REST controller exposing Goose session-management endpoints to the Vibe Studio frontend.
 * <p>
 * Covers: list, get, delete, export, fork, rename, extensions, user recipe values,
 * search, insights, and import.
 * <p>
 * Base path: {@code /${icip.pathPrefix}/service/v1/vibe-coding}
 */
@RestController
@RequestMapping("/${icip.pathPrefix}/service/v1/vibe-coding")
public class GooseSessionController {

    private static final Logger logger = LoggerFactory.getLogger(GooseSessionController.class);

    private final VibeCodingService vibeCodingService;

    public GooseSessionController(VibeCodingService vibeCodingService) {
        this.vibeCodingService = vibeCodingService;
    }

    // =========================================================================
    // SESSIONS — CRUD
    // =========================================================================

    /**
     * List all Goose sessions.
     * Response: { sessions: [Session] }
     */
    @GetMapping(value = "/sessions", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> listSessions() {
        logger.info("List sessions request");
        return vibeCodingService.get("/sessions", null);
    }

    /**
     * Get a specific Goose session by ID.
     * Response: Session
     */
    @GetMapping(value = "/sessions/{sessionId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> getSession(@PathVariable String sessionId) {
        logger.info("Get session request, session={}", sessionId);
        return vibeCodingService.get("/sessions/" + sessionId, null);
    }

    /**
     * Delete a Goose session and its conversation history.
     * Response: (empty)
     */
    @DeleteMapping("/sessions/{sessionId}")
    public Mono<ResponseEntity<Void>> deleteSession(@PathVariable String sessionId) {
        logger.info("Delete session request, session={}", sessionId);
        return vibeCodingService.delete("/sessions/" + sessionId);
    }

    /**
     * Export a session's conversation as JSON.
     * Response: string (JSON)
     */
    @GetMapping(value = "/sessions/{sessionId}/export",
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> exportSession(@PathVariable String sessionId) {
        logger.info("Export session request, session={}", sessionId);
        return vibeCodingService.get("/sessions/" + sessionId + "/export", null);
    }

    /**
     * Get extensions registered in a session.
     * Response: { extensions: [ExtensionConfig] }
     */
    @GetMapping(value = "/sessions/{sessionId}/extensions",
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> getSessionExtensions(@PathVariable String sessionId) {
        logger.info("Get session extensions request, session={}", sessionId);
        return vibeCodingService.get("/sessions/" + sessionId + "/extensions", null);
    }

    // =========================================================================
    // SESSIONS — mutations
    // =========================================================================

    /**
     * Fork a session (copy or truncate conversation at a point).
     * Request: { copy, truncate, timestamp? }
     * Response: { sessionId }
     */
    @PostMapping(value = "/sessions/{sessionId}/fork",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> forkSession(
            @PathVariable String sessionId,
            @RequestBody Map<String, Object> request) {
        logger.info("Fork session request, session={}", sessionId);
        return vibeCodingService.post("/sessions/" + sessionId + "/fork", request);
    }

    /**
     * Rename a session.
     * Request: { name }
     * Response: (empty)
     */
    @PutMapping(value = "/sessions/{sessionId}/name",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> renameSession(
            @PathVariable String sessionId,
            @RequestBody Map<String, Object> request) {
        logger.info("Rename session request, session={}", sessionId);
        return vibeCodingService.put("/sessions/" + sessionId + "/name", request);
    }

    /**
     * Set user-supplied recipe parameter values for a session.
     * Request: { userRecipeValues: map<string, string> }
     * Response: { recipe }
     */
    @PutMapping(value = "/sessions/{sessionId}/user-recipe-values",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> setUserRecipeValues(
            @PathVariable String sessionId,
            @RequestBody Map<String, Object> request) {
        logger.info("Set user recipe values request, session={}", sessionId);
        return vibeCodingService.put("/sessions/" + sessionId + "/user_recipe_values", request);
    }

    // =========================================================================
    // SESSIONS — search, insights, import
    // =========================================================================

    /**
     * Search sessions by content query with optional date filters.
     * Query: query, limit, after_date, before_date
     * Response: [Session]
     */
    @GetMapping(value = "/sessions/search", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> searchSessions(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String limit,
            @RequestParam(required = false) String after_date,
            @RequestParam(required = false) String before_date) {
        logger.info("Search sessions request, query={}", query);
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        if (query != null) params.add("query", query);
        if (limit != null) params.add("limit", limit);
        if (after_date != null) params.add("after_date", after_date);
        if (before_date != null) params.add("before_date", before_date);
        return vibeCodingService.get("/sessions/search", params);
    }

    /**
     * Get session usage insights (total sessions, total tokens).
     * Response: { totalSessions, totalTokens }
     */
    @GetMapping(value = "/sessions/insights", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> sessionInsights() {
        logger.info("Session insights request");
        return vibeCodingService.get("/sessions/insights", null);
    }

    /**
     * Import a previously exported session from JSON.
     * Request: { json }
     * Response: Session
     */
    @PostMapping(value = "/sessions/import",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> importSession(
            @RequestBody Map<String, Object> request) {
        logger.info("Import session request");
        return vibeCodingService.post("/sessions/import", request);
    }
}
