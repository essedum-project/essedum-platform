package com.lfn.icip.vibecoding.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import reactor.core.publisher.Flux;

import java.time.Duration;

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

    @Autowired(required = false)
    @Qualifier("opencodeWebClient")
    private WebClient opencodeWebClient;

    public VibeCodingService(
            @Qualifier("gooseWebClient") WebClient gooseWebClient,
            @Value("${vibe.goose.service.response-timeout-seconds:300}") int responseTimeoutSeconds) {
        this.gooseWebClient = gooseWebClient;
        this.blockTimeout = Duration.ofSeconds(responseTimeoutSeconds);
    }

    private WebClient resolveClient(String framework) {
        if ("opencode".equalsIgnoreCase(framework) && opencodeWebClient != null) {
            return opencodeWebClient;
        }
        return gooseWebClient;
    }

    // =========================================================================
    // Blocking request methods (for standard JSON endpoints)
    // =========================================================================

    /**
     * POST to the active framework backend and return the response synchronously.
     */
    public ResponseEntity<String> post(String path, Object body, String framework) {
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
            return entity;
        } catch (WebClientResponseException ex) {
            logger.error("{} POST {} responded with {}: {}", framework, path, ex.getStatusCode(), ex.getResponseBodyAsString());
            String body = ex.getResponseBodyAsString();
            String errorBody = (body != null && !body.isBlank()) ? body
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
        WebClient client = resolveClient(framework);
        logger.debug("{} GET {}", framework, path);
        try {
            ResponseEntity<String> response = client.get()
                    .uri(uriBuilder -> {
                        var b = uriBuilder.path(path);
                        if (queryParams != null && !queryParams.isEmpty()) {
                            b.queryParams(queryParams);
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
        WebClient client = resolveClient(framework);
        logger.debug("{} SSE GET {}", framework, path);
        SseEmitter emitter = new SseEmitter(blockTimeout.toMillis());

        try {
            Flux<String> flux = client.get()
                    .uri(path)
                    .accept(MediaType.TEXT_EVENT_STREAM)
                    .retrieve()
                    .bodyToFlux(String.class);
            subscribeAndPipe(flux, emitter, "SSE GET " + path);
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
     * Subscribes to a Flux and forwards each element as an SSE event to the emitter.
     */
    private void subscribeAndPipe(Flux<String> flux, SseEmitter emitter, String label) {
        flux.subscribe(
                data -> {
                    try {
                        emitter.send(SseEmitter.event().data(data, MediaType.APPLICATION_JSON));
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

