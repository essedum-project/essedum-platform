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
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lfn.icip.vibecoding.service.VibeCodingService;

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
    public ResponseEntity<String> status(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework) {
        logger.info("Status request");
        return vibeCodingService.get("/status", null, framework);
    }

    /**
     * Get system information: OS, architecture, app version, active provider/model,
     * and list of enabled extensions.
     * Response: { os, os_version, architecture, app_version, provider?, model?,
     *             enabled_extensions: [string] }
     */
    @GetMapping(value = "/system/info", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> systemInfo(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework) {
        logger.info("System info request");
        return vibeCodingService.get("/system_info", null, framework);
    }

    /**
     * Generate a diagnostic report for the given session.
     * Response: string (diagnostic report)
     */
    @GetMapping(value = "/diagnostics/{sessionId}",
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> diagnostics(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework,
            @PathVariable String sessionId) {
        logger.info("Diagnostics request, session={}", sessionId);
        return vibeCodingService.get("/diagnostics/" + sessionId, null, framework);
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
    public ResponseEntity<String> telemetryEvent(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework,
            @RequestBody Map<String, Object> request) {
        logger.info("Telemetry event request, event={}", request.get("event_name"));
        return vibeCodingService.post("/telemetry/event", request, framework);
    }

    // =========================================================================
    // TUNNEL
    // =========================================================================

    /**
     * Start a tunnel to expose the Goose session externally.
     * Response: { hostname, url, secret }
     */
    @PostMapping(value = "/tunnel/start", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> tunnelStart(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework) {
        logger.info("Tunnel start request");
        return vibeCodingService.post("/tunnel/start", null, framework);
    }

    // =========================================================================
    // OAUTH CALLBACKS
    // =========================================================================

    /**
     * Handle OpenRouter OAuth callback.
     * Response: { success, message }
     */
    @PostMapping(value = "/handle-openrouter", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> handleOpenRouter(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework) {
        logger.info("Handle OpenRouter OAuth callback");
        return vibeCodingService.post("/handle_openrouter", null, framework);
    }

    /**
     * Handle NanoGPT OAuth callback.
     * Response: { success, message }
     */
    @PostMapping(value = "/handle-nanogpt", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> handleNanoGpt(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework) {
        logger.info("Handle NanoGPT OAuth callback");
        return vibeCodingService.post("/handle_nanogpt", null, framework);
    }

    /**
     * Handle Tetrate OAuth callback.
     * Response: { success, message }
     */
    @PostMapping(value = "/handle-tetrate", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> handleTetrate(
            @RequestHeader(value = "X-Vibe-Framework", defaultValue = "goose") String framework) {
        logger.info("Handle Tetrate OAuth callback");
        return vibeCodingService.post("/handle_tetrate", null, framework);
    }
}
