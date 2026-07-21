package com.lfn.icip.vibecoding.rest;

import java.util.Map;
import org.springframework.http.HttpStatus;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
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

import org.springframework.beans.factory.annotation.Value;

import com.lfn.icip.vibecoding.service.SalusService;
import com.lfn.icip.vibecoding.service.SalusService.SalusResult;
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
    private final SalusService salusService;

    @Value("${vibe.azure.openai.endpoint}")
    private String azureOpenAiEndpoint;

    @Value("${vibe.azure.openai.deployment-name}")
    private String azureOpenAiDeploymentName;

    @Value("${vibe.azure.openai.api-version}")
    private String azureOpenAiApiVersion;

    @Value("${vibe.azure.openai.api-key}")
    private String azureOpenAiApiKey;

    public VibeCodingController(VibeCodingService vibeCodingService, SalusService salusService) {
        this.vibeCodingService = vibeCodingService;
        this.salusService = salusService;
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
        String originalProvider = String.valueOf(request.get("provider"));
        String originalModel = String.valueOf(request.get("model"));
        logger.info("Agent update provider request — original provider/model: {}/{} — updated to azure_openai/{}",
                originalProvider, originalModel, azureOpenAiDeploymentName);

        // ── Step 1: call update_provider IMMEDIATELY (before upserts) ──────
        // Calling right after agent/start wins the session-creation lock race,
        // so goosed returns in <100 ms instead of blocking ~61 s waiting for the
        // background extension-loading task.  The Azure config keys are already
        // persisted in goosed's config.yaml from the first session; the upserts
        // below keep them fresh but are not required for the provider call.
        request.put("provider", originalProvider);
        request.put("model", originalModel);

        int maxAttempts = 36;           // 36 × 5 s = 3 min ceiling (safety net)
        int delayMs    = 5_000;
        ResponseEntity<String> lastResponse = null;
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            lastResponse = vibeCodingService.post("/agent/update_provider", request);
            if (lastResponse != null && lastResponse.getStatusCode().is2xxSuccessful()) {
                logger.info("update_provider succeeded on attempt {}/{}", attempt, maxAttempts);
                break;
            }
            int status = lastResponse != null ? lastResponse.getStatusCode().value() : -1;
            logger.warn("update_provider attempt {}/{} returned {} — retrying in {} ms",
                    attempt, maxAttempts, status, delayMs);
            if (attempt < maxAttempts) {
                try { Thread.sleep(delayMs); } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }

        // ── Step 2: refresh Azure OpenAI config in goosed config store ──────
        // Done after update_provider so it never adds latency to the lock race.
        if ("azure_openai".equals(originalProvider) && azureOpenAiEndpoint != null) {
            vibeCodingService.post("/config/upsert",
                    Map.of("key", "AZURE_OPENAI_ENDPOINT", "value", azureOpenAiEndpoint, "is_secret", false));
            vibeCodingService.post("/config/upsert",
                    Map.of("key", "AZURE_OPENAI_DEPLOYMENT_NAME", "value", azureOpenAiDeploymentName, "is_secret", false));
            vibeCodingService.post("/config/upsert",
                    Map.of("key", "AZURE_OPENAI_API_VERSION", "value", azureOpenAiApiVersion, "is_secret", false));
            vibeCodingService.post("/config/upsert",
                    Map.of("key", "AZURE_OPENAI_API_KEY", "value", azureOpenAiApiKey, "is_secret", true));
        }

        if (lastResponse != null && lastResponse.getStatusCode().is2xxSuccessful()) {
            return lastResponse;
        }
        logger.error("update_provider failed after {} attempts — last status: {}",
                maxAttempts, lastResponse != null ? lastResponse.getStatusCode().value() : "null");
        return lastResponse != null ? lastResponse
                : ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("{\"error\":\"update_provider exhausted all retries\"}");
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
            @RequestParam(value = "session_id") String session_id,
            @RequestParam(value = "extension_name", required = false) String extension_name) {
        logger.info("Agent tools request, session={}", session_id);
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("session_id", session_id);
        if (extension_name != null) params.add("extension_name", extension_name);
        return vibeCodingService.get("/agent/tools", params);
    }

    @GetMapping(value = "/agent/list-apps", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> agentListApps(
            @RequestParam(value = "session_id", required = false) String session_id) {
        logger.info("Agent list apps request");
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        if (session_id != null) params.add("session_id", session_id);
        return vibeCodingService.get("/agent/list_apps", params);
    }

    @GetMapping(value = "/agent/export-app/{name}", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> agentExportApp(@PathVariable(value = "name") String name) {
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
     * Input is screened by Salus before being forwarded to Goose.
     */
    @PostMapping(value = "/reply",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter reply(@RequestBody Map<String, Object> request) {
        logger.info("Reply SSE request, session_id={}", request.get("session_id"));

        String userText = salusService.extractUserText(request);
        SalusResult inputResult = salusService.checkInput(userText);
        if (inputResult.blocked()) {
            logger.warn("Salus blocked SSE reply — reason: {}", inputResult.reason());
            SseEmitter blocked = new SseEmitter(10_000L);
            try {
                String json = "{\"type\":\"error\",\"message\":\"Your message was blocked by the responsible AI policy.\","
                        + "\"reason\":" + jsonString(inputResult.reason()) + "}";
                blocked.send(SseEmitter.event().data(json, MediaType.APPLICATION_JSON));
                blocked.complete();
            } catch (Exception ex) {
                blocked.completeWithError(ex);
            }
            return blocked;
        }

        return vibeCodingService.ssePost("/reply", request);
    }

    /**
     * Queue a reply request in a session (async, non-streaming).
     * Both input and output are screened by Salus.
     */
    @PostMapping(value = "/sessions/{sessionId}/reply",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> sessionReply(
            @PathVariable(value = "sessionId") String sessionId,
            @RequestBody Map<String, Object> request) {
        logger.info("Session reply request, session={}", sessionId);

        String userText = salusService.extractUserText(request);
        SalusResult inputResult = salusService.checkInput(userText);
        if (inputResult.blocked()) {
            logger.warn("Salus blocked session reply input — session={} reason={}", sessionId, inputResult.reason());
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\":\"Content blocked by responsible AI policy\","
                            + "\"reason\":" + jsonString(inputResult.reason()) + "}");
        }

        ResponseEntity<String> response = vibeCodingService.post("/sessions/" + sessionId + "/reply", request);

        SalusResult outputResult = salusService.checkOutput(response.getBody());
        if (outputResult.blocked()) {
            logger.warn("Salus blocked session reply output — session={} reason={}", sessionId, outputResult.reason());
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\":\"Response blocked by responsible AI policy\","
                            + "\"reason\":" + jsonString(outputResult.reason()) + "}");
        }

        return response;
    }

    /**
     * Cancel an in-progress reply request in a session.
     */
    @PostMapping(value = "/sessions/{sessionId}/cancel",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> sessionCancel(
            @PathVariable(value = "sessionId") String sessionId,
            @RequestBody Map<String, Object> request) {
        logger.debug("Session cancel request, session={} (auto-triggered by frontend)", sessionId);
        return vibeCodingService.post("/sessions/" + sessionId + "/cancel", request);
    }

    /**
     * Stream message events from an active session (SSE).
     */
    @GetMapping(value = "/sessions/{sessionId}/events",
            produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter sessionEvents(@PathVariable(value = "sessionId") String sessionId) {
        logger.info("Session events SSE request, session={}", sessionId);
        return vibeCodingService.sseGet("/sessions/" + sessionId + "/events");
    }

    /** Escapes a string for embedding as a JSON string value. */
    private static String jsonString(String s) {
        if (s == null) return "null";
        return "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
    }
}