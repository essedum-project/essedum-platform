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

import com.lfn.icip.vibecoding.service.VibeCodingService;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

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
    // POST /action-required/tool-confirmation
    //   Request:  { id, sessionId, action: Permission, principalType? }
    //   Response: {}
    // =========================================================================

    @PostMapping(value = "/action-required/tool-confirmation",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> toolConfirmation(
            @RequestBody Map<String, Object> request) {
        logger.info("Tool confirmation request");
        return vibeCodingService.post("/action-required/tool-confirmation", request);
    }

    // =========================================================================
    // AGENT — lifecycle management
    // =========================================================================

    /**
     * Start a new Goose agent session.
     * Request: { working_dir, recipe?, recipe_id?, recipe_deeplink?, extension_overrides? }
     * Response: Session
     */
    @PostMapping(value = "/agent/start",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> agentStart(
            @RequestBody Map<String, Object> request) {
        logger.info("Agent start request");
        return vibeCodingService.post("/agent/start", request);
    }

    /**
     * Stop a running Goose agent session.
     * Request: { session_id }
     * Response: string
     */
    @PostMapping(value = "/agent/stop",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> agentStop(
            @RequestBody Map<String, Object> request) {
        logger.info("Agent stop request");
        return vibeCodingService.post("/agent/stop", request);
    }

    /**
     * Restart a Goose agent session (reloads model and extensions).
     * Request: { session_id }
     * Response: { extension_results: [{ name, success, error? }] }
     */
    @PostMapping(value = "/agent/restart",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> agentRestart(
            @RequestBody Map<String, Object> request) {
        logger.info("Agent restart request");
        return vibeCodingService.post("/agent/restart", request);
    }

    /**
     * Resume a previously stopped Goose session.
     * Request: { session_id, load_model_and_extensions }
     * Response: { session, extension_results? }
     */
    @PostMapping(value = "/agent/resume",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> agentResume(
            @RequestBody Map<String, Object> request) {
        logger.info("Agent resume request");
        return vibeCodingService.post("/agent/resume", request);
    }

    /**
     * Add an extension to a running Goose session.
     * Request: { session_id, config: ExtensionConfig }
     * Response: string
     */
    @PostMapping(value = "/agent/add-extension",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> agentAddExtension(
            @RequestBody Map<String, Object> request) {
        logger.info("Agent add extension request");
        return vibeCodingService.post("/agent/add_extension", request);
    }

    /**
     * Remove an extension from a running Goose session.
     * Request: { session_id, name }
     * Response: string
     */
    @PostMapping(value = "/agent/remove-extension",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> agentRemoveExtension(
            @RequestBody Map<String, Object> request) {
        logger.info("Agent remove extension request");
        return vibeCodingService.post("/agent/remove_extension", request);
    }

    /**
     * Update the LLM provider/model for a session.
     * Request: { session_id, provider, model?, context_limit?, request_params? }
     * Response: (empty)
     */
    @PostMapping(value = "/agent/update-provider",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> agentUpdateProvider(
            @RequestBody Map<String, Object> request) {
        logger.info("Agent update provider request");
        return vibeCodingService.post("/agent/update_provider", request);
    }

    /**
     * Update session-level settings (e.g. goose_mode).
     * Request: { session_id, goose_mode? }
     * Response: (empty)
     */
    @PostMapping(value = "/agent/update-session",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> agentUpdateSession(
            @RequestBody Map<String, Object> request) {
        logger.info("Agent update session request");
        return vibeCodingService.post("/agent/update_session", request);
    }

    /**
     * Update the working directory for a session.
     * Request: { session_id, working_dir }
     * Response: (empty)
     */
    @PostMapping(value = "/agent/update-working-dir",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> agentUpdateWorkingDir(
            @RequestBody Map<String, Object> request) {
        logger.info("Agent update working dir request");
        return vibeCodingService.post("/agent/update_working_dir", request);
    }

    /**
     * Sync agent state from the persisted session.
     * Request: { session_id }
     * Response: (empty)
     */
    @PostMapping(value = "/agent/update-from-session",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> agentUpdateFromSession(
            @RequestBody Map<String, Object> request) {
        logger.info("Agent update from session request");
        return vibeCodingService.post("/agent/update_from_session", request);
    }

    /**
     * Invoke a specific tool in the Goose session.
     * Request: { session_id, name, arguments: object }
     * Response: { content, isError, _meta?, structuredContent? }
     */
    @PostMapping(value = "/agent/call-tool",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> agentCallTool(
            @RequestBody Map<String, Object> request) {
        logger.info("Agent call tool request");
        return vibeCodingService.post("/agent/call_tool", request);
    }

    /**
     * Read a resource from an extension.
     * Request: { session_id, extension_name, uri }
     * Response: { uri, text, mimeType?, _meta? }
     */
    @PostMapping(value = "/agent/read-resource",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> agentReadResource(
            @RequestBody Map<String, Object> request) {
        logger.info("Agent read resource request");
        return vibeCodingService.post("/agent/read_resource", request);
    }

    /**
     * List tools available in a session (optionally filtered by extension).
     * Query: session_id (required), extension_name (optional)
     * Response: [{ name, description, parameters, input_schema?, permission? }]
     */
    @GetMapping(value = "/agent/tools", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> agentTools(
            @RequestParam String session_id,
            @RequestParam(required = false) String extension_name) {
        logger.info("Agent tools request, session={}", session_id);
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("session_id", session_id);
        if (extension_name != null) params.add("extension_name", extension_name);
        return vibeCodingService.get("/agent/tools", params);
    }

    /**
     * List Goose apps available in a session.
     * Query: session_id (optional)
     * Response: { apps: [GooseApp] }
     */
    @GetMapping(value = "/agent/list-apps", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> agentListApps(
            @RequestParam(required = false) String session_id) {
        logger.info("Agent list apps request");
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        if (session_id != null) params.add("session_id", session_id);
        return vibeCodingService.get("/agent/list_apps", params);
    }

    /**
     * Export a Goose app as an HTML string.
     * Response: string (HTML)
     */
    @GetMapping(value = "/agent/export-app/{name}", produces = MediaType.TEXT_HTML_VALUE)
    public Mono<ResponseEntity<String>> agentExportApp(@PathVariable String name) {
        logger.info("Agent export app request, name={}", name);
        return vibeCodingService.get("/agent/export_app/" + name, null);
    }

    /**
     * Import a Goose app from an HTML payload.
     * Request: { html }
     * Response: { name, message }
     */
    @PostMapping(value = "/agent/import-app",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> agentImportApp(
            @RequestBody Map<String, Object> request) {
        logger.info("Agent import app request");
        return vibeCodingService.post("/agent/import_app", request);
    }

    // =========================================================================
    // REPLY / CHAT
    // =========================================================================

    /**
     * Send a message to the Goose agent and receive an SSE stream of MessageEvents.
     * <p>
     * This is the primary interaction endpoint — the frontend opens an EventSource
     * here to send a user prompt and receive a streamed reply.
     * <p>
     * Request:  { session_id, user_message: Message, override_conversation?,
     *             recipe_name?, recipe_version? }
     * Response: SSE stream of MessageEvent
     */
    @PostMapping(value = "/reply",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> reply(@RequestBody Map<String, Object> request) {
        logger.info("Reply SSE request, session_id={}", request.get("session_id"));
        return vibeCodingService.ssePost("/reply", request);
    }

    /**
     * Queue a reply request in a session (async, non-streaming).
     * Request:  { request_id, user_message: Message, override_conversation?,
     *             recipe_name?, recipe_version? }
     * Response: { request_id }
     */
    @PostMapping(value = "/sessions/{sessionId}/reply",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> sessionReply(
            @PathVariable String sessionId,
            @RequestBody Map<String, Object> request) {
        logger.info("Session reply request, session={}", sessionId);
        return vibeCodingService.post("/sessions/" + sessionId + "/reply", request);
    }

    /**
     * Cancel an in-progress reply request in a session.
     * Request: { request_id }
     * Response: (empty)
     */
    @PostMapping(value = "/sessions/{sessionId}/cancel",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> sessionCancel(
            @PathVariable String sessionId,
            @RequestBody Map<String, Object> request) {
        logger.info("Session cancel request, session={}", sessionId);
        return vibeCodingService.post("/sessions/" + sessionId + "/cancel", request);
    }

    /**
     * Stream message events from an active session (SSE).
     * Response: SSE stream of [MessageEvent]
     */
    @GetMapping(value = "/sessions/{sessionId}/events",
            produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> sessionEvents(@PathVariable String sessionId) {
        logger.info("Session events SSE request, session={}", sessionId);
        return vibeCodingService.sseGet("/sessions/" + sessionId + "/events");
    }
}


