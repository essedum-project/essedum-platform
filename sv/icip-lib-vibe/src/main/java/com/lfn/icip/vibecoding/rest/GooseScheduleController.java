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
 * REST controller exposing Goose schedule endpoints to the Vibe Studio frontend.
 * <p>
 * Covers: list, create, update, delete, inspect, pause/unpause/kill,
 * run-now, and listing sessions for a scheduled job.
 * <p>
 * Base path: {@code /${icip.pathPrefix}/service/v1/vibe-coding}
 */
@RestController
@RequestMapping("/${icip.pathPrefix}/service/v1/vibe-coding")
public class GooseScheduleController {

    private static final Logger logger = LoggerFactory.getLogger(GooseScheduleController.class);

    private final VibeCodingService vibeCodingService;

    public GooseScheduleController(VibeCodingService vibeCodingService) {
        this.vibeCodingService = vibeCodingService;
    }

    // =========================================================================
    // SCHEDULE
    // =========================================================================

    /**
     * List all scheduled jobs.
     * Response: { jobs: [ScheduledJob] }
     */
    @GetMapping(value = "/schedule/list", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> scheduleList() {
        logger.info("Schedule list request");
        return vibeCodingService.get("/schedule/list", null);
    }

    /**
     * Create a new scheduled job.
     * Request: { id, cron, recipe }
     * Response: ScheduledJob
     */
    @PostMapping(value = "/schedule/create",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> scheduleCreate(@RequestBody Map<String, Object> request) {
        logger.info("Schedule create request");
        return vibeCodingService.post("/schedule/create", request);
    }

    /**
     * Delete a scheduled job by ID.
     * Response: (empty)
     */
    @DeleteMapping("/schedule/delete/{id}")
    public Mono<ResponseEntity<Void>> scheduleDelete(@PathVariable String id) {
        logger.info("Schedule delete request, id={}", id);
        return vibeCodingService.delete("/schedule/delete/" + id);
    }

    /**
     * Update the cron expression for a scheduled job.
     * Request: { cron }
     * Response: ScheduledJob
     */
    @PutMapping(value = "/schedule/{id}",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> scheduleUpdate(
            @PathVariable String id,
            @RequestBody Map<String, Object> request) {
        logger.info("Schedule update request, id={}", id);
        return vibeCodingService.put("/schedule/" + id, request);
    }

    /**
     * Inspect the currently running execution of a scheduled job.
     * Response: { sessionId?, processStartTime?, runningDurationSeconds? }
     */
    @GetMapping(value = "/schedule/{id}/inspect",
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> scheduleInspect(@PathVariable String id) {
        logger.info("Schedule inspect request, id={}", id);
        return vibeCodingService.get("/schedule/" + id + "/inspect", null);
    }

    /**
     * Pause a scheduled job (prevents future executions).
     * Response: (empty)
     */
    @PostMapping(value = "/schedule/{id}/pause",
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> schedulePause(@PathVariable String id) {
        logger.info("Schedule pause request, id={}", id);
        return vibeCodingService.post("/schedule/" + id + "/pause", null);
    }

    /**
     * Unpause a scheduled job (resumes future executions).
     * Response: (empty)
     */
    @PostMapping(value = "/schedule/{id}/unpause",
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> scheduleUnpause(@PathVariable String id) {
        logger.info("Schedule unpause request, id={}", id);
        return vibeCodingService.post("/schedule/" + id + "/unpause", null);
    }

    /**
     * Kill the currently running execution of a scheduled job.
     * Response: (empty)
     */
    @PostMapping(value = "/schedule/{id}/kill",
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> scheduleKill(@PathVariable String id) {
        logger.info("Schedule kill request, id={}", id);
        return vibeCodingService.post("/schedule/" + id + "/kill", null);
    }

    /**
     * Run a scheduled job immediately (outside its cron schedule).
     * Response: { session_id }
     */
    @PostMapping(value = "/schedule/{id}/run-now",
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> scheduleRunNow(@PathVariable String id) {
        logger.info("Schedule run-now request, id={}", id);
        return vibeCodingService.post("/schedule/" + id + "/run_now", null);
    }

    /**
     * List sessions that were triggered by a scheduled job.
     * Query: limit (optional)
     * Response: [{ id, name, createdAt, workingDir, messageCount, scheduleId?,
     *              inputTokens?, outputTokens?, totalTokens?,
     *              accumulatedInputTokens?, accumulatedOutputTokens?, accumulatedTotalTokens? }]
     */
    @GetMapping(value = "/schedule/{id}/sessions",
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> scheduleJobSessions(
            @PathVariable String id,
            @RequestParam(required = false) String limit) {
        logger.info("Schedule job sessions request, id={}", id);
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        if (limit != null) params.add("limit", limit);
        return vibeCodingService.get("/schedule/" + id + "/sessions", params);
    }
}
