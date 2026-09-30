package com.lfn.icip.vibecoding.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Relay service that proxies all requests to the Goose API service.
 * <p>
 * Uses {@link WebClient} for outbound HTTP calls but blocks for results since the
 * host application runs on a servlet container (Tomcat).  SSE endpoints use
 * {@link SseEmitter} to stream events back to the client.
 */
@Service
public class VibeCodingService {

    private static final Logger logger = LoggerFactory.getLogger(VibeCodingService.class);

    private final WebClient gooseWebClient;
    private final Duration blockTimeout;
    private final ObjectMapper objectMapper;

    @Autowired(required = false)
    @Qualifier("opencodeWebClient")
    private WebClient opencodeWebClient;

    public VibeCodingService(
            @Qualifier("gooseWebClient") WebClient gooseWebClient,
            @Value("${vibe.goose.service.response-timeout-seconds:300}") int responseTimeoutSeconds,
            ObjectMapper objectMapper) {
        this.gooseWebClient = gooseWebClient;
        this.blockTimeout = Duration.ofSeconds(responseTimeoutSeconds);
        this.objectMapper = objectMapper;
    }

    private WebClient resolveClient(String framework) {
        if ("opencode".equalsIgnoreCase(framework) && opencodeWebClient != null) {
            return opencodeWebClient;
        }
        return gooseWebClient;
    }

    // =========================================================================
    // OpenCode path / body translation helpers
    // Invoked only when framework == "opencode" and opencodeWebClient is present.
    // Goose paths are never passed through these methods.
    // =========================================================================

    private String opencodePath(String goosePath) {
        if ("/status".equals(goosePath))          return "/api/health";
        if ("/sessions".equals(goosePath))        return "/api/session";
        if ("/sessions/search".equals(goosePath)) return "/api/session";
        if ("/agent/start".equals(goosePath))     return "/api/session";
        if (goosePath.startsWith("/sessions/")) {
            String tail = goosePath.substring("/sessions".length());
            tail = tail.replace("/reply",  "/prompt")
                       .replace("/cancel", "/interrupt")
                       .replace("/events", "/event");
            return "/api/session" + tail;
        }
        return goosePath; // unknown — passes through; OpenCode will return 404
    }

    @SuppressWarnings("unchecked")
    private Object opencodeBody(String goosePath, Object originalBody) {
        // agent/start → create OpenCode session
        if ("/agent/start".equals(goosePath) && originalBody instanceof Map) {
            Map<String, Object> g = (Map<String, Object>) originalBody;
            Map<String, Object> oc = new HashMap<>();
            if (g.containsKey("session_id")) oc.put("id", g.get("session_id"));
            if (g.containsKey("model") || g.containsKey("provider")) {
                Map<String, Object> modelRef = new HashMap<>();
                if (g.containsKey("model"))    modelRef.put("id",       g.get("model"));
                if (g.containsKey("provider")) modelRef.put("providerID", g.get("provider"));
                if (!modelRef.isEmpty())       oc.put("model", modelRef);
            }
            return oc;
        }
        // sessions/{id}/reply → POST /api/session/{id}/prompt body shape
        if (goosePath.startsWith("/sessions/") && goosePath.endsWith("/reply")
                && originalBody instanceof Map) {
            String text = extractTextFromGooseBody((Map<String, Object>) originalBody);
            List<Map<String, String>> parts = new ArrayList<>();
            parts.add(Map.of("type", "text", "text", text));
            return Map.of("prompt", Map.of("text", text, "parts", parts));
        }
        return originalBody;
    }

    private org.springframework.util.LinkedMultiValueMap<String, String> opencodeSearchParams(
            MultiValueMap<String, String> queryParams) {
        org.springframework.util.LinkedMultiValueMap<String, String> oc =
                new org.springframework.util.LinkedMultiValueMap<>();
        if (queryParams == null) return oc;
        // Goose "query" → OpenCode "search"; "limit" kept; date filters unsupported
        if (queryParams.containsKey("query")) oc.add("search", queryParams.getFirst("query"));
        if (queryParams.containsKey("limit")) oc.add("limit",  queryParams.getFirst("limit"));
        return oc;
    }

    @SuppressWarnings("unchecked")
    private String extractSessionId(Object body) {
        if (!(body instanceof Map)) return null;
        Object sid = ((Map<String, Object>) body).get("session_id");
        return sid != null ? sid.toString() : null;
    }

    @SuppressWarnings("unchecked")
    private String extractTextFromGooseBody(Map<String, Object> body) {
        if (body.containsKey("text"))    return String.valueOf(body.get("text"));
        if (body.containsKey("content")) return String.valueOf(body.get("content"));
        // Angular sends { user_message: { role, content: [{type, text}] } }
        if (body.containsKey("user_message")) {
            Object userMsg = body.get("user_message");
            if (userMsg instanceof Map) {
                Object content = ((Map<?, ?>) userMsg).get("content");
                if (content instanceof String) return (String) content;
                if (content instanceof List) {
                    for (Object part : (List<?>) content) {
                        if (part instanceof Map) {
                            Object t = ((Map<?, ?>) part).get("text");
                            if (t != null) return t.toString();
                        }
                    }
                }
            }
        }
        if (body.containsKey("messages")) {
            Object msgs = body.get("messages");
            if (msgs instanceof List) {
                for (Object msg : (List<?>) msgs) {
                    if (!(msg instanceof Map)) continue;
                    Map<String, Object> m = (Map<String, Object>) msg;
                    if (!"user".equals(m.get("role"))) continue;
                    Object content = m.get("content");
                    if (content instanceof String) return (String) content;
                    if (content instanceof List) {
                        for (Object part : (List<?>) content) {
                            if (part instanceof Map) {
                                Object t = ((Map<String, Object>) part).get("text");
                                if (t != null) return t.toString();
                            }
                        }
                    }
                }
            }
        }
        return "";
    }

    private static final Pattern OC_ID_PATTERN = Pattern.compile("\"id\"\\s*:\\s*\"([^\"]+)\"");

    // When OpenCode uses a tool call (e.g. "question") instead of generating code,
    // we send this follow-up so the model proceeds — same as Goose's direct flow.
    private static final int    OPENCODE_MAX_TOOL_RETRIES = 2;
    private static final String OPENCODE_TOOL_FOLLOWUP    =
            "Generate the complete Python script now. Make reasonable assumptions for any missing details " +
            "(dataset columns, target column, etc.) and write the full production-ready code.";

    private String extractIdFromOpencodeJson(String json) {
        if (json == null) return null;
        Matcher m = OC_ID_PATTERN.matcher(json);
        return m.find() ? m.group(1) : null;
    }

    /**
     * Unwraps OpenCode's {@code { "data": {...} }} envelope into the inner object,
     * and copies {@code id} to {@code session_id} so Angular's field fallback works:
     * {@code resp?.id ?? resp?.session_id ?? resp?.sessionId}.
     */
    @SuppressWarnings("unchecked")
    String normalizeOpencodeResponse(String responseBody) {
        if (responseBody == null) return null;
        try {
            Map<String, Object> parsed = objectMapper.readValue(responseBody, Map.class);
            if (parsed.containsKey("data") && parsed.get("data") instanceof Map) {
                Map<String, Object> data = new HashMap<>((Map<String, Object>) parsed.get("data"));
                if (data.containsKey("id") && !data.containsKey("session_id")) {
                    data.put("session_id", data.get("id"));
                }
                return objectMapper.writeValueAsString(data);
            }
        } catch (Exception ignored) {}
        return responseBody;
    }

    /**
     * Converts an OpenCode {@code SessionEvent.Durable} JSON string into a shape
     * that the Angular {@code extractText} function already understands.
     * <ul>
     *   <li>{@code assistant.message} → {@code { role, content: [{type, text}] }}</li>
     *   <li>All other event types → passed through unchanged (Angular will skip unknown shapes)</li>
     * </ul>
     */
    @SuppressWarnings("unchecked")
    String normalizeOpencodeEvent(String rawEvent) {
        if (rawEvent == null) return null;
        try {
            Map<String, Object> event = objectMapper.readValue(rawEvent, Map.class);
            String type = String.valueOf(event.getOrDefault("type", ""));

            if ("assistant.message".equals(type)) {
                Object props = event.get("properties");
                if (props instanceof Map) {
                    Object msg = ((Map<?, ?>) props).get("message");
                    if (msg instanceof Map) {
                        Object partsRaw = ((Map<?, ?>) msg).get("parts");
                        if (partsRaw instanceof List) {
                            List<Map<String, Object>> contentParts = new ArrayList<>();
                            for (Object part : (List<?>) partsRaw) {
                                if (part instanceof Map) {
                                    Map<?, ?> p = (Map<?, ?>) part;
                                    if ("text".equals(p.get("type")) && p.get("text") != null) {
                                        String text = p.get("text").toString().trim();
                                        // Suppress tool-call JSON payloads — OpenCode embeds
                                        // tool invocations as text parts inside assistant messages.
                                        if (text.startsWith("{") && (
                                                text.contains("\"name\"") ||
                                                text.contains("\"tool_name\"") ||
                                                text.contains("\"tool_args\"") ||
                                                text.contains("\"arguments\""))) {
                                            continue; // skip this part; real text parts pass through
                                        }
                                        Map<String, Object> cp = new HashMap<>();
                                        cp.put("type", "text_delta");
                                        cp.put("text", text);
                                        contentParts.add(cp);
                                    }
                                }
                            }
                            if (!contentParts.isEmpty()) {
                                Map<String, Object> norm = new HashMap<>();
                                norm.put("role", "assistant");
                                norm.put("content", contentParts);
                                return objectMapper.writeValueAsString(norm);
                            }
                        }
                    }
                }
                return null; // assistant.message with no real text parts — suppress entirely
            }

            // For session.next.text.ended: suppress tool-call JSON payloads;
            // normalize real code/prose text into the same {role, content} shape that
            // assistant.message uses — Angular's extractText already renders that format.
            if ("session.next.text.ended".equals(type)) {
                Object data = event.get("data");
                logger.info("OC text.ended data type={}", data == null ? "null" : data.getClass().getSimpleName());
                if (data instanceof Map) {
                    Object textObj = ((Map<?, ?>) data).get("text");
                    logger.info("OC text.ended textObj type={} len={} prefix={}",
                            textObj == null ? "null" : textObj.getClass().getSimpleName(),
                            textObj instanceof String ? ((String) textObj).length() : -1,
                            textObj instanceof String ? ((String) textObj).substring(0, Math.min(120, ((String) textObj).length())).replace("\n", "\\n") : "N/A");
                    if (textObj instanceof String) {
                        String text = ((String) textObj).trim();
                        // Tool-call JSON detected — try to extract the file content
                        // (e.g. OpenCode's "write" tool: {"name":"write","arguments":{"path":"...","content":"..."}})
                        if (text.startsWith("{") && (
                                text.contains("\"name\"") ||
                                text.contains("\"tool_name\"") ||
                                text.contains("\"tool_args\""))) {
                            String code = extractCodeFromToolCall(text);
                            if (code != null && !code.isEmpty()) {
                                logger.info("OC text.ended extracted code from tool call, len={}", code.length());
                                String display = code.contains("\n") && !code.startsWith("```")
                                        ? "```python\n" + code + "\n```" : code;
                                Map<String, Object> normTc = new HashMap<>();
                                normTc.put("role", "assistant");
                                List<Map<String, Object>> partsTc = new ArrayList<>();
                                Map<String, Object> partTc = new HashMap<>();
                                partTc.put("type", "text_delta");
                                partTc.put("text", display);
                                partsTc.add(partTc);
                                normTc.put("content", partsTc);
                                return objectMapper.writeValueAsString(normTc);
                            }
                            logger.info("OC text.ended suppressed as tool-call JSON (no extractable code)");
                            return null;
                        }
                        // Real content — convert to the assistant-message shape Angular renders.
                        // Wrap multi-line content in a Python fence so the Angular code-editor
                        // fallback (which scans for ```python blocks) can extract and display it.
                        if (!text.isEmpty()) {
                            String display = (text.contains("\n") && !text.startsWith("```"))
                                    ? "```python\n" + text + "\n```"
                                    : text;
                            Map<String, Object> norm = new HashMap<>();
                            norm.put("role", "assistant");
                            List<Map<String, Object>> parts = new ArrayList<>();
                            Map<String, Object> part = new HashMap<>();
                            part.put("type", "text_delta");
                            part.put("text", display);
                            parts.add(part);
                            norm.put("content", parts);
                            return objectMapper.writeValueAsString(norm);
                        }
                    }
                }
                return null; // empty text.ended — suppress
            }

        } catch (Exception ignored) {}
        return rawEvent; // unknown / non-tool-call events pass through unchanged
    }

    // =========================================================================
    // Blocking request methods (for standard JSON endpoints)
    // =========================================================================

    /**
     * POST to the active framework backend and return the response synchronously.
     */
    public ResponseEntity<String> post(String path, Object body, String framework) {
        if ("opencode".equalsIgnoreCase(framework) && opencodeWebClient != null) {
            if ("/agent/stop".equals(path)) {
                // sessionId lives in the body; must be embedded in the OpenCode path
                String sid = extractSessionId(body);
                path = (sid != null) ? "/api/session/" + sid + "/interrupt" : "/api/session/unknown/interrupt";
                body = Map.of();
            } else {
                body = opencodeBody(path, body);
                path = opencodePath(path);
            }
        }
        WebClient client = resolveClient(framework);
        logger.debug("{} POST {}", framework, path);
        try {
            var spec = client.post()
                    .uri(path)
                    .contentType(MediaType.APPLICATION_JSON);
            var request = (body != null) ? spec.bodyValue(body) : spec.bodyValue("");
            ResponseEntity<String> entity = request
                    .exchangeToMono(response -> response.toEntity(String.class))
                    .block(blockTimeout);
            // Goosed returns empty bodies on some success responses (e.g. update_provider).
            // Ensure a well-formed JSON body so the gateway's Netty stream terminates
            // cleanly instead of waiting for keep-alive timeout and raising PrematureCloseException.
            if (entity != null && (entity.getBody() == null || entity.getBody().isBlank())) {
                return ResponseEntity.status(entity.getStatusCode())
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{}");
            }
            // Unwrap OpenCode's { "data": {...} } envelope so Angular can read fields directly
            if ("opencode".equalsIgnoreCase(framework) && entity != null
                    && entity.getBody() != null) {
                String normalized = normalizeOpencodeResponse(entity.getBody());
                if (!entity.getBody().equals(normalized)) {
                    return ResponseEntity.status(entity.getStatusCode())
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(normalized);
                }
            }
            return entity;
        } catch (WebClientResponseException ex) {
            logger.error("{} POST {} responded with {}: {}", framework, path, ex.getStatusCode(), ex.getResponseBodyAsString());
            String errBody = ex.getResponseBodyAsString();
            String errorBody = (errBody != null && !errBody.isBlank()) ? errBody
                    : "{\"error\":\"Upstream service returned " + ex.getStatusCode().value() + "\"}";
            return ResponseEntity.status(ex.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(errorBody);
        } catch (Exception ex) {
            String cause = ex.getCause() != null ? ex.getCause().getMessage() : ex.getMessage();
            logger.error("{} POST {} failed — cause: {}", framework, path, cause, ex);
            return ResponseEntity.internalServerError()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\":\"Vibe coding service unreachable\",\"detail\":\"" + cause + "\"}");
        }
    }

    /**
     * GET from the active framework backend and return the response synchronously.
     */
    public ResponseEntity<String> get(String path, MultiValueMap<String, String> queryParams, String framework) {
        if ("opencode".equalsIgnoreCase(framework) && opencodeWebClient != null) {
            if ("/sessions/search".equals(path)) {
                queryParams = opencodeSearchParams(queryParams);
            }
            path = opencodePath(path);
        }
        WebClient client = resolveClient(framework);
        final String finalPath = path;
        final MultiValueMap<String, String> finalQueryParams = queryParams;
        logger.debug("{} GET {}", framework, finalPath);
        try {
            ResponseEntity<String> response = client.get()
                    .uri(uriBuilder -> {
                        var b = uriBuilder.path(finalPath);
                        if (finalQueryParams != null && !finalQueryParams.isEmpty()) {
                            b.queryParams(finalQueryParams);
                        }
                        return b.build();
                    })
                    .exchangeToMono(r -> r.toEntity(String.class))
                    .block(blockTimeout);

            if (response != null && !response.getStatusCode().is2xxSuccessful()) {
                String body = response.getBody();
                if (body == null || body.isBlank()) {
                    String errorMsg = "{\"error\":\"Upstream service returned " + response.getStatusCode().value() + "\"}";
                    logger.error("{} GET {} returned {} with empty body", framework, path, response.getStatusCode().value());
                    return ResponseEntity.status(response.getStatusCode())
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(errorMsg);
                }
            }
            return response;
        } catch (WebClientResponseException ex) {
            logger.error("{} GET {} responded with {}: {}", framework, path, ex.getStatusCode(), ex.getResponseBodyAsString());
            String body = ex.getResponseBodyAsString();
            String errorBody = (body != null && !body.isBlank()) ? body
                    : "{\"error\":\"Upstream service returned " + ex.getStatusCode().value() + "\"}";
            return ResponseEntity.status(ex.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(errorBody);
        } catch (Exception ex) {
            String cause = ex.getCause() != null ? ex.getCause().getMessage() : ex.getMessage();
            logger.error("{} GET {} failed — cause: {}", framework, path, cause, ex);
            return ResponseEntity.internalServerError()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\":\"Vibe coding service unreachable\",\"detail\":\"" + cause + "\"}");
        }
    }

    /**
     * PUT to the active framework backend and return the response synchronously.
     */
    public ResponseEntity<String> put(String path, Object body, String framework) {
        WebClient client = resolveClient(framework);
        logger.debug("{} PUT {}", framework, path);
        try {
            var spec = client.put()
                    .uri(path)
                    .contentType(MediaType.APPLICATION_JSON);
            var request = (body != null) ? spec.bodyValue(body) : spec.bodyValue("");
            return request
                    .exchangeToMono(response -> response.toEntity(String.class))
                    .block(blockTimeout);
        } catch (WebClientResponseException ex) {
            logger.error("{} PUT {} responded with {}: {}", framework, path, ex.getStatusCode(), ex.getResponseBodyAsString());
            String b = ex.getResponseBodyAsString();
            String errorBody = (b != null && !b.isBlank()) ? b
                    : "{\"error\":\"Upstream service returned " + ex.getStatusCode().value() + "\"}";
            return ResponseEntity.status(ex.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(errorBody);
        } catch (Exception ex) {
            String cause = ex.getCause() != null ? ex.getCause().getMessage() : ex.getMessage();
            logger.error("{} PUT {} failed — cause: {}", framework, path, cause, ex);
            return ResponseEntity.internalServerError()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\":\"Vibe coding service unreachable\",\"detail\":\"" + cause + "\"}");
        }
    }

    /**
     * DELETE on the active framework backend and return the response synchronously.
     */
    public ResponseEntity<Void> delete(String path, String framework) {
        WebClient client = resolveClient(framework);
        logger.debug("{} DELETE {}", framework, path);
        try {
            return client.delete()
                    .uri(path)
                    .exchangeToMono(response -> response.toBodilessEntity())
                    .block(blockTimeout);
        } catch (WebClientResponseException ex) {
            logger.error("{} DELETE {} responded with {}: {}", framework, path, ex.getStatusCode(), ex.getMessage());
            return ResponseEntity.status(ex.getStatusCode()).build();
        } catch (Exception ex) {
            logger.error("{} DELETE {} error: {}", framework, path, ex.getMessage(), ex);
            return ResponseEntity.internalServerError().build();
        }
    }

    // =========================================================================
    // SSE streaming methods (return SseEmitter for servlet-based streaming)
    // =========================================================================

    /**
     * POST to the active framework backend expecting an SSE stream; pipes events into an {@link SseEmitter}.
     */
    public SseEmitter ssePost(String path, Object body, String framework) {
        if ("opencode".equalsIgnoreCase(framework) && opencodeWebClient != null) {
            // Legacy /reply endpoint: OpenCode needs a 3-step create→prompt→stream flow
            if ("/reply".equals(path)) {
                return opencodeReplyEmitter(body);
            }
            body = opencodeBody(path, body);
            path = opencodePath(path);
        }
        WebClient client = resolveClient(framework);
        logger.debug("{} SSE POST {}", framework, path);
        SseEmitter emitter = new SseEmitter(blockTimeout.toMillis());

        try {
            var spec = client.post()
                    .uri(path)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.TEXT_EVENT_STREAM);
            var request = (body != null) ? spec.bodyValue(body) : spec.bodyValue("");

            Flux<String> flux = request.retrieve().bodyToFlux(String.class);
            subscribeAndPipe(flux, emitter, "SSE POST " + path);
        } catch (Exception ex) {
            logger.error("{} SSE POST {} setup error: {}", framework, path, ex.getMessage(), ex);
            completeWithError(emitter, ex);
        }

        return emitter;
    }

    /**
     * GET from the active framework backend expecting an SSE stream; pipes events into an {@link SseEmitter}.
     */
    public SseEmitter sseGet(String path, String framework) {
        if ("opencode".equalsIgnoreCase(framework) && opencodeWebClient != null) {
            path = opencodePath(path);
        }
        WebClient client = resolveClient(framework);
        logger.debug("{} SSE GET {}", framework, path);
        SseEmitter emitter = new SseEmitter(blockTimeout.toMillis());

        try {
            Flux<String> flux = client.get()
                    .uri(path)
                    .accept(MediaType.TEXT_EVENT_STREAM)
                    .retrieve()
                    .bodyToFlux(String.class);
            final boolean isOpenCode = "opencode".equalsIgnoreCase(framework) && opencodeWebClient != null;
            subscribeAndPipe(flux, emitter, "SSE GET " + path,
                    isOpenCode ? this::normalizeOpencodeEvent : null);
        } catch (Exception ex) {
            logger.error("{} SSE GET {} setup error: {}", framework, path, ex.getMessage(), ex);
            completeWithError(emitter, ex);
        }

        return emitter;
    }

    // =========================================================================
    // Internal helpers
    // =========================================================================

    /**
     * Multi-step OpenCode equivalent of Goose's single-shot {@code POST /reply} SSE endpoint.
     * <ol>
     *   <li>Resolves or creates the OpenCode session.</li>
     *   <li>Sends the user prompt via {@code POST /api/session/:id/prompt} (blocking).</li>
     *   <li>Streams events; if the model calls a tool (e.g. the question tool) without producing
     *       any renderable text, a follow-up prompt is sent automatically so the model generates
     *       code — matching Goose's direct one-shot flow.</li>
     * </ol>
     */
    @SuppressWarnings("unchecked")
    private SseEmitter opencodeReplyEmitter(Object body) {
        SseEmitter emitter = new SseEmitter(blockTimeout.toMillis());
        try {
            // Step 1 — resolve or create session
            String sessionId = extractSessionId(body);
            if (sessionId == null) {
                ResponseEntity<String> sessionResp = post("/api/session", Map.of(), "opencode");
                if (sessionResp == null || !sessionResp.getStatusCode().is2xxSuccessful()) {
                    completeWithError(emitter, new RuntimeException("OpenCode session creation failed"));
                    return emitter;
                }
                sessionId = extractIdFromOpencodeJson(sessionResp.getBody());
            }
            if (sessionId == null) {
                completeWithError(emitter, new RuntimeException("Could not resolve OpenCode session id"));
                return emitter;
            }
            // Step 2 — send prompt (blocking, non-SSE)
            Object promptBody = opencodeBody("/sessions/" + sessionId + "/reply", body);
            post("/api/session/" + sessionId + "/prompt", promptBody, "opencode");
            // Step 3 — stream; auto-follow-up if model uses a tool call with no code output
            streamOpencodeEvents(emitter, sessionId, 0);
        } catch (Exception ex) {
            logger.error("OpenCode reply stream setup error: {}", ex.getMessage(), ex);
            completeWithError(emitter, ex);
        }
        return emitter;
    }

    /**
     * Opens {@code GET /api/session/:id/event}, forwards normalized events to {@code emitter},
     * and — if the model used a tool call without producing any renderable text — sends
     * {@link #OPENCODE_TOOL_FOLLOWUP} and re-streams (up to {@link #OPENCODE_MAX_TOOL_RETRIES}
     * times), matching Goose's behaviour of generating code on the first useful turn.
     */
    private void streamOpencodeEvents(SseEmitter emitter, String sessionId, int attempt) {
        String eventsPath = "/api/session/" + sessionId + "/event";
        logger.info("opencode SSE GET {} (attempt {})", eventsPath, attempt);

        AtomicBoolean gotContent  = new AtomicBoolean(false);
        AtomicBoolean hadToolCall = new AtomicBoolean(false);
        AtomicBoolean done        = new AtomicBoolean(false);
        // Holds the Reactor subscription so we can cancel it when the step ends.
        // OpenCode keeps its event stream open indefinitely; we must cut it ourselves.
        reactor.core.Disposable[] sub = {null};

        Flux<String> flux = opencodeWebClient.get()
                .uri(eventsPath)
                .accept(MediaType.TEXT_EVENT_STREAM)
                .retrieve()
                .bodyToFlux(String.class);

        sub[0] = flux.subscribe(
            rawData -> {
                if (done.get()) return;
                try {
                    if (isOpencodeToolCallEvent(rawData)) hadToolCall.set(true);
                    String out = normalizeOpencodeEvent(rawData);
                    if (out != null) {
                        if (out.contains("\"text_delta\"")) gotContent.set(true);
                        emitter.send(SseEmitter.event().data(out, MediaType.APPLICATION_JSON));
                    }
                    // OpenCode never closes its event stream; finish as soon as the step ends.
                    if (isStepEndedEvent(rawData) && done.compareAndSet(false, true)) {
                        if (sub[0] != null) sub[0].dispose();
                        finishOpencodeStream(emitter, sessionId, attempt, gotContent, hadToolCall);
                    }
                } catch (Exception sendEx) {
                    logger.warn("OpenCode SSE {} send error: {}", eventsPath, sendEx.getMessage());
                    emitter.completeWithError(sendEx);
                }
            },
            error -> {
                logger.error("OpenCode SSE error (attempt {}): {}", attempt, error.getMessage());
                if (done.compareAndSet(false, true)) {
                    completeWithError(emitter, error);
                }
            },
            () -> {
                // OpenCode closed the stream on its own (rare)
                if (done.compareAndSet(false, true)) {
                    finishOpencodeStream(emitter, sessionId, attempt, gotContent, hadToolCall);
                }
            }
        );
    }

    /** Returns true when {@code rawEvent} is a {@code session.next.step.ended} event. */
    @SuppressWarnings("unchecked")
    private boolean isStepEndedEvent(String rawEvent) {
        if (rawEvent == null) return false;
        try {
            Map<String, Object> ev = objectMapper.readValue(rawEvent, Map.class);
            return "session.next.step.ended".equals(ev.getOrDefault("type", ""));
        } catch (Exception ignored) {}
        return false;
    }

    /** Handles auto-follow-up logic and emitter completion after an OpenCode step ends. */
    private void finishOpencodeStream(SseEmitter emitter, String sessionId, int attempt,
            AtomicBoolean gotContent, AtomicBoolean hadToolCall) {
        logger.info("opencode SSE complete attempt={} gotContent={} hadToolCall={}", attempt, gotContent.get(), hadToolCall.get());
        if (!gotContent.get() && hadToolCall.get() && attempt < OPENCODE_MAX_TOOL_RETRIES) {
            logger.info("OpenCode tool-only step (attempt {}), sending follow-up", attempt);
            Thread t = new Thread(() -> {
                try {
                    List<Map<String, String>> parts = new ArrayList<>();
                    parts.add(Map.of("type", "text", "text", OPENCODE_TOOL_FOLLOWUP));
                    opencodeWebClient.post()
                            .uri("/api/session/" + sessionId + "/prompt")
                            .contentType(MediaType.APPLICATION_JSON)
                            .bodyValue(Map.of("prompt",
                                    Map.of("text", OPENCODE_TOOL_FOLLOWUP, "parts", parts)))
                            .retrieve().toBodilessEntity().block(blockTimeout);
                    streamOpencodeEvents(emitter, sessionId, attempt + 1);
                } catch (Exception ex) {
                    logger.error("OpenCode follow-up failed: {}", ex.getMessage());
                    completeWithError(emitter, ex);
                }
            }, "oc-followup-" + attempt);
            t.setDaemon(true);
            t.start();
        } else {
            emitter.complete();
        }
    }

    /**
     * Extracts file content from a tool-call JSON payload.
     * OpenCode uses: {"name":"write","arguments":{"path":"...","content":"..."}}
     */
    @SuppressWarnings("unchecked")
    private String extractCodeFromToolCall(String toolCallJson) {
        try {
            Map<String, Object> tc = objectMapper.readValue(toolCallJson, Map.class);
            // Walk common argument wrapper keys
            for (String argsKey : new String[]{"arguments", "args", "tool_args", "parameters", "input"}) {
                Object argsObj = tc.get(argsKey);
                if (argsObj instanceof Map) {
                    Map<?, ?> args = (Map<?, ?>) argsObj;
                    for (String contentKey : new String[]{"content", "code", "source", "text", "file_content"}) {
                        Object val = args.get(contentKey);
                        if (val instanceof String && ((String) val).trim().length() > 50) {
                            return ((String) val).trim();
                        }
                    }
                }
            }
            // Direct content field
            for (String key : new String[]{"content", "code", "source"}) {
                Object val = tc.get(key);
                if (val instanceof String && ((String) val).trim().length() > 50) {
                    return ((String) val).trim();
                }
            }
        } catch (Exception ignored) {}
        return null;
    }

    /** Returns true when {@code rawEvent} is a {@code session.next.text.ended} carrying tool-call JSON. */
    @SuppressWarnings("unchecked")
    private boolean isOpencodeToolCallEvent(String rawEvent) {
        if (rawEvent == null) return false;
        try {
            Map<String, Object> ev = objectMapper.readValue(rawEvent, Map.class);
            if (!"session.next.text.ended".equals(ev.getOrDefault("type", ""))) return false;
            Object data = ev.get("data");
            if (data instanceof Map) {
                Object textObj = ((Map<?, ?>) data).get("text");
                if (textObj instanceof String) {
                    String text = ((String) textObj).trim();
                    return text.startsWith("{") && (
                            text.contains("\"name\"") ||
                            text.contains("\"tool_name\"") ||
                            text.contains("\"tool_args\""));
                }
            }
        } catch (Exception ignored) {}
        return false;
    }

    /**
     * Subscribes to a Flux and forwards each element as an SSE event to the emitter.
     * Pass a non-null {@code transformer} to rewrite each event before forwarding
     * (used for OpenCode → Goose-compatible event shape conversion).
     */
    private void subscribeAndPipe(Flux<String> flux, SseEmitter emitter, String label,
            java.util.function.Function<String, String> transformer) {
        flux.subscribe(
                data -> {
                    try {
                        String out = (transformer != null) ? transformer.apply(data) : data;
                        if (out != null) {
                            emitter.send(SseEmitter.event().data(out, MediaType.APPLICATION_JSON));
                        }
                    } catch (Exception sendEx) {
                        logger.warn("{} — client disconnected: {}", label, sendEx.getMessage());
                        emitter.completeWithError(sendEx);
                    }
                },
                error -> {
                    logger.error("{} stream error: {}", label, error.getMessage());
                    completeWithError(emitter, error);
                },
                emitter::complete
        );
    }

    private void subscribeAndPipe(Flux<String> flux, SseEmitter emitter, String label) {
        subscribeAndPipe(flux, emitter, label, null);
    }

    private void completeWithError(SseEmitter emitter, Throwable ex) {
        try {
            emitter.send(SseEmitter.event()
                    .data("{\"type\":\"error\",\"message\":\"Stream error\"}",
                            MediaType.APPLICATION_JSON));
            emitter.complete();
        } catch (Exception ignored) {
            emitter.completeWithError(ex);
        }
    }
}

