package com.lfn.icip.vibecoding.rest;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lfn.icip.vibecoding.service.VibeCodingService;

import reactor.core.publisher.Mono;

/**
 * REST controller exposing Goose system, diagnostics, and telemetry endpoints
 * to the Vibe Studio frontend.
 * <p>
 * Covers: status, system info, session diagnostics, telemetry events,
 * tunnel provisioning, and OAuth callbacks.
 * <p>
 * Base path: {@code /${icip.pathPrefix}/service/v1/vibe-coding}
 */
@RestController
@RequestMapping("/${icip.pathPrefix}/service/v1/vibe-coding")
public class GooseSystemController {

    private static final Logger logger = LoggerFactory.getLogger(GooseSystemController.class);

    private final VibeCodingService vibeCodingService;

    public GooseSystemController(VibeCodingService vibeCodingService) {
        this.vibeCodingService = vibeCodingService;
    }

    // =========================================================================
    // SYSTEM / STATUS
    // =========================================================================

    /**
     * Health-check endpoint — confirms the Goose service is running.
     * Response: string
     */
    @GetMapping(value = "/status", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> status() {
        logger.info("Status request");
        return vibeCodingService.get("/status", null);
    }

    /**
     * Get system information: OS, architecture, app version, active provider/model,
     * and list of enabled extensions.
     * Response: { os, os_version, architecture, app_version, provider?, model?,
     *             enabled_extensions: [string] }
     */
    @GetMapping(value = "/system/info", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> systemInfo() {
        logger.info("System info request");
        return vibeCodingService.get("/system_info", null);
    }

    /**
     * Generate a diagnostic report for the given session.
     * Response: string (diagnostic report)
     */
    @GetMapping(value = "/diagnostics/{sessionId}",
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> diagnostics(@PathVariable String sessionId) {
        logger.info("Diagnostics request, session={}", sessionId);
        return vibeCodingService.get("/diagnostics/" + sessionId, null);
    }

    // =========================================================================
    // TELEMETRY
    // =========================================================================

    /**
     * Record a telemetry event.
     * Request: { event_name, properties?: object }
     * Response: (empty)
     */
    @PostMapping(value = "/telemetry/event",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> telemetryEvent(@RequestBody Map<String, Object> request) {
        logger.info("Telemetry event request, event={}", request.get("event_name"));
        return vibeCodingService.post("/telemetry/event", request);
    }

    // =========================================================================
    // TUNNEL
    // =========================================================================

    /**
     * Start a tunnel to expose the Goose session externally.
     * Response: { hostname, url, secret }
     */
    @PostMapping(value = "/tunnel/start", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> tunnelStart() {
        logger.info("Tunnel start request");
        return vibeCodingService.post("/tunnel/start", null);
    }

    // =========================================================================
    // OAUTH CALLBACKS
    // =========================================================================

    /**
     * Handle OpenRouter OAuth callback.
     * Response: { success, message }
     */
    @PostMapping(value = "/handle-openrouter", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> handleOpenRouter() {
        logger.info("Handle OpenRouter OAuth callback");
        return vibeCodingService.post("/handle_openrouter", null);
    }

    /**
     * Handle NanoGPT OAuth callback.
     * Response: { success, message }
     */
    @PostMapping(value = "/handle-nanogpt", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> handleNanoGpt() {
        logger.info("Handle NanoGPT OAuth callback");
        return vibeCodingService.post("/handle_nanogpt", null);
    }

    /**
     * Handle Tetrate OAuth callback.
     * Response: { success, message }
     */
    @PostMapping(value = "/handle-tetrate", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> handleTetrate() {
        logger.info("Handle Tetrate OAuth callback");
        return vibeCodingService.post("/handle_tetrate", null);
    }
}
