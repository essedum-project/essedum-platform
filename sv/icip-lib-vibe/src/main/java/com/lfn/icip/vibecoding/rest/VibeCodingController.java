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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.lfn.icip.vibecoding.service.VibeCodingService;

/**
 * REST controller exposing the Goose API action-required, agent management,
 * and reply/chat endpoints to the Vibe Studio frontend.
 * <p>
 * Base path: {@code /${icip.pathPrefix}/service/v1/vibe-coding}
 * <p>
 * All request bodies are forwarded verbatim to the Goose service and responses
 * are relayed back, preserving original HTTP status codes.
 */
@RestController
@RequestMapping("/${icip.pathPrefix}/service/v1/vibe-coding")
public class VibeCodingController {

    private static final Logger logger = LoggerFactory.getLogger(VibeCodingController.class);

    private final VibeCodingService vibeCodingService;

    public VibeCodingController(VibeCodingService vibeCodingService) {
        this.vibeCodingService = vibeCodingService;
    }

    // =========================================================================
    // ACTION REQUIRED
    // =========================================================================

    @PostMapping(value = "/action-required/tool-confirmation",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> toolConfirmation(
            @RequestBody Map<String, Object> request) {
        logger.info("Tool confirmation request");
        return vibeCodingService.post("/action-required/tool-confirmation", request);
    }

    // =========================================================================
    // AGENT — lifecycle management
    // =========================================================================

    @PostMapping(value = "/agent/start",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> agentStart(
            @RequestBody Map<String, Object> request) {
        logger.info("Agent start request");
        return vibeCodingService.post("/agent/start", request);
    }

    @PostMapping(value = "/agent/stop",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> agentStop(
            @RequestBody Map<String, Object> request) {
        logger.info("Agent stop request");
        return vibeCodingService.post("/agent/stop", request);
    }

    @PostMapping(value = "/agent/restart",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> agentRestart(
            @RequestBody Map<String, Object> request) {
        logger.info("Agent restart request");
        return vibeCodingService.post("/agent/restart", request);
    }

    @PostMapping(value = "/agent/resume",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> agentResume(
            @RequestBody Map<String, Object> request) {
        logger.info("Agent resume request");
        return vibeCodingService.post("/agent/resume", request);
    }

    @PostMapping(value = "/agent/add-extension",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> agentAddExtension(
            @RequestBody Map<String, Object> request) {
        logger.info("Agent add extension request");
        return vibeCodingService.post("/agent/add_extension", request);
    }

    @PostMapping(value = "/agent/remove-extension",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> agentRemoveExtension(
            @RequestBody Map<String, Object> request) {
        logger.info("Agent remove extension request");
        return vibeCodingService.post("/agent/remove_extension", request);
    }

    @PostMapping(value = "/agent/update-provider",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> agentUpdateProvider(
            @RequestBody Map<String, Object> request) {
        // Override provider/model to use local Ollama instead of external providers
        String originalProvider = String.valueOf(request.get("provider"));
        String originalModel = String.valueOf(request.get("model"));
        request.put("provider", "ollama");
        request.put("model", "gpt-oss:latest");
        logger.info("Agent update provider request — remapped [{}/{}] -> [ollama/gpt-oss:latest]",
                originalProvider, originalModel);
        return vibeCodingService.post("/agent/update_provider", request);
    }

    @PostMapping(value = "/agent/update-session",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> agentUpdateSession(
            @RequestBody Map<String, Object> request) {
        logger.info("Agent update session request");
        return vibeCodingService.post("/agent/update_session", request);
    }

    @PostMapping(value = "/agent/update-working-dir",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> agentUpdateWorkingDir(
            @RequestBody Map<String, Object> request) {
        logger.info("Agent update working dir request");
        return vibeCodingService.post("/agent/update_working_dir", request);
    }

    @PostMapping(value = "/agent/update-from-session",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> agentUpdateFromSession(
            @RequestBody Map<String, Object> request) {
        logger.info("Agent update from session request");
        return vibeCodingService.post("/agent/update_from_session", request);
    }

    @PostMapping(value = "/agent/call-tool",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> agentCallTool(
            @RequestBody Map<String, Object> request) {
        logger.info("Agent call tool request");
        return vibeCodingService.post("/agent/call_tool", request);
    }

    @PostMapping(value = "/agent/read-resource",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> agentReadResource(
            @RequestBody Map<String, Object> request) {
        logger.info("Agent read resource request");
        return vibeCodingService.post("/agent/read_resource", request);
    }

    @GetMapping(value = "/agent/tools", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> agentTools(
            @RequestParam String session_id,
            @RequestParam(required = false) String extension_name) {
        logger.info("Agent tools request, session={}", session_id);
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("session_id", session_id);
        if (extension_name != null) params.add("extension_name", extension_name);
        return vibeCodingService.get("/agent/tools", params);
    }

    @GetMapping(value = "/agent/list-apps", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> agentListApps(
            @RequestParam(required = false) String session_id) {
        logger.info("Agent list apps request");
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        if (session_id != null) params.add("session_id", session_id);
        return vibeCodingService.get("/agent/list_apps", params);
    }

    @GetMapping(value = "/agent/export-app/{name}", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> agentExportApp(@PathVariable String name) {
        logger.info("Agent export app request, name={}", name);
        return vibeCodingService.get("/agent/export_app/" + name, null);
    }

    @PostMapping(value = "/agent/import-app",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> agentImportApp(
            @RequestBody Map<String, Object> request) {
        logger.info("Agent import app request");
        return vibeCodingService.post("/agent/import_app", request);
    }

    // =========================================================================
    // REPLY / CHAT
    // =========================================================================

    /**
     * Send a message to the Goose agent and receive an SSE stream of MessageEvents.
     */
    @PostMapping(value = "/reply",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter reply(@RequestBody Map<String, Object> request) {
        logger.info("Reply SSE request, session_id={}", request.get("session_id"));
        return vibeCodingService.ssePost("/reply", request);
    }

    /**
     * Queue a reply request in a session (async, non-streaming).
     */
    @PostMapping(value = "/sessions/{sessionId}/reply",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> sessionReply(
            @PathVariable String sessionId,
            @RequestBody Map<String, Object> request) {
        logger.info("Session reply request, session={}", sessionId);
        return vibeCodingService.post("/sessions/" + sessionId + "/reply", request);
    }

    /**
     * Cancel an in-progress reply request in a session.
     */
    @PostMapping(value = "/sessions/{sessionId}/cancel",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> sessionCancel(
            @PathVariable String sessionId,
            @RequestBody Map<String, Object> request) {
        logger.debug("Session cancel request, session={} (auto-triggered by frontend)", sessionId);
        return vibeCodingService.post("/sessions/" + sessionId + "/cancel", request);
    }

    /**
     * Stream message events from an active session (SSE).
     */
    @GetMapping(value = "/sessions/{sessionId}/events",
            produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter sessionEvents(@PathVariable String sessionId) {
        logger.info("Session events SSE request, session={}", sessionId);
        return vibeCodingService.sseGet("/sessions/" + sessionId + "/events");
    }
}


