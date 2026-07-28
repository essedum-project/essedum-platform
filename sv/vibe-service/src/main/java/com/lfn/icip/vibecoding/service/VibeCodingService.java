package com.lfn.icip.vibecoding.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    public VibeCodingService(
            @Qualifier("gooseWebClient") WebClient gooseWebClient,
            @Value("${vibe.goose.service.response-timeout-seconds:300}") int responseTimeoutSeconds) {
        this.gooseWebClient = gooseWebClient;
        this.blockTimeout = Duration.ofSeconds(responseTimeoutSeconds);
    }

    // =========================================================================
    // Blocking request methods (for standard JSON endpoints)
    // =========================================================================

    /**
     * POST to Goose and return the response synchronously.
     */
    public ResponseEntity<String> post(String path, Object body) {
        logger.debug("Goose POST {}", path);
        try {
            var spec = gooseWebClient.post()
                    .uri(path)
                    .contentType(MediaType.APPLICATION_JSON);
            var request = (body != null) ? spec.bodyValue(body) : spec.bodyValue("");
            return request
                    .exchangeToMono(response -> response.toEntity(String.class))
                    .block(blockTimeout);
        } catch (WebClientResponseException ex) {
            logger.error("Goose POST {} responded with {}: {}", path, ex.getStatusCode(), ex.getResponseBodyAsString());
            String gooseBody = ex.getResponseBodyAsString();
            String errorBody = (gooseBody != null && !gooseBody.isBlank()) ? gooseBody
                    : "{\"error\":\"Upstream Goose service returned " + ex.getStatusCode().value() + "\"}";
            return ResponseEntity.status(ex.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(errorBody);
        } catch (Exception ex) {
            String cause = ex.getCause() != null ? ex.getCause().getMessage() : ex.getMessage();
            logger.error("Goose POST {} failed — cause: {}", path, cause, ex);
            return ResponseEntity.internalServerError()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\":\"Goose service unreachable\",\"detail\":\"" + cause + "\"}");
        }
    }

    /**
     * GET from Goose and return the response synchronously.
     */
    public ResponseEntity<String> get(String path, MultiValueMap<String, String> queryParams) {
        logger.debug("Goose GET {}", path);
        try {
            ResponseEntity<String> response = gooseWebClient.get()
                    .uri(uriBuilder -> {
                        var b = uriBuilder.path(path);
                        if (queryParams != null && !queryParams.isEmpty()) {
                            b.queryParams(queryParams);
                        }
                        return b.build();
                    })
                    .exchangeToMono(r -> r.toEntity(String.class))
                    .block(blockTimeout);

            // Check if goosed returned non-2xx with empty body (common with 404 Not Found from missing endpoints)
            if (response != null && !response.getStatusCode().is2xxSuccessful()) {
                String body = response.getBody();
                if (body == null || body.isBlank()) {
                    String errorMsg = "{\"error\":\"Upstream Goose service returned " + response.getStatusCode().value() + "\"}";
                    logger.error("Goose GET {} returned {} with empty body", path, response.getStatusCode().value());
                    return ResponseEntity.status(response.getStatusCode())
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(errorMsg);
                }
            }
            return response;
        } catch (WebClientResponseException ex) {
            logger.error("Goose GET {} responded with {}: {}", path, ex.getStatusCode(), ex.getResponseBodyAsString());
            String gooseBody = ex.getResponseBodyAsString();
            String errorBody = (gooseBody != null && !gooseBody.isBlank()) ? gooseBody
                    : "{\"error\":\"Upstream Goose service returned " + ex.getStatusCode().value() + "\"}";
            return ResponseEntity.status(ex.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(errorBody);
        } catch (Exception ex) {
            String cause = ex.getCause() != null ? ex.getCause().getMessage() : ex.getMessage();
            logger.error("Goose GET {} failed — cause: {}", path, cause, ex);
            return ResponseEntity.internalServerError()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\":\"Goose service unreachable\",\"detail\":\"" + cause + "\"}");
        }
    }

    /**
     * PUT to Goose and return the response synchronously.
     */
    public ResponseEntity<String> put(String path, Object body) {
        logger.debug("Goose PUT {}", path);
        try {
            var spec = gooseWebClient.put()
                    .uri(path)
                    .contentType(MediaType.APPLICATION_JSON);
            var request = (body != null) ? spec.bodyValue(body) : spec.bodyValue("");
            return request
                    .exchangeToMono(response -> response.toEntity(String.class))
                    .block(blockTimeout);
        } catch (WebClientResponseException ex) {
            logger.error("Goose PUT {} responded with {}: {}", path, ex.getStatusCode(), ex.getResponseBodyAsString());
            String gooseBody = ex.getResponseBodyAsString();
            String errorBody = (gooseBody != null && !gooseBody.isBlank()) ? gooseBody
                    : "{\"error\":\"Upstream Goose service returned " + ex.getStatusCode().value() + "\"}";
            return ResponseEntity.status(ex.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(errorBody);
        } catch (Exception ex) {
            String cause = ex.getCause() != null ? ex.getCause().getMessage() : ex.getMessage();
            logger.error("Goose PUT {} failed — cause: {}", path, cause, ex);
            return ResponseEntity.internalServerError()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\":\"Goose service unreachable\",\"detail\":\"" + cause + "\"}");
        }
    }

    /**
     * DELETE on Goose and return the response synchronously.
     */
    public ResponseEntity<Void> delete(String path) {
        logger.debug("Goose DELETE {}", path);
        try {
            return gooseWebClient.delete()
                    .uri(path)
                    .exchangeToMono(response -> response.toBodilessEntity())
                    .block(blockTimeout);
        } catch (WebClientResponseException ex) {
            logger.error("Goose DELETE {} responded with {}: {}", path, ex.getStatusCode(), ex.getMessage());
            return ResponseEntity.status(ex.getStatusCode()).build();
        } catch (Exception ex) {
            logger.error("Goose DELETE {} error: {}", path, ex.getMessage(), ex);
            return ResponseEntity.internalServerError().build();
        }
    }

    // =========================================================================
    // SSE streaming methods (return SseEmitter for servlet-based streaming)
    // =========================================================================

    /**
     * POST to Goose expecting an SSE stream; pipes events into an {@link SseEmitter}.
     */
    public SseEmitter ssePost(String path, Object body) {
        logger.debug("Goose SSE POST {}", path);
        SseEmitter emitter = new SseEmitter(blockTimeout.toMillis());

        try {
            var spec = gooseWebClient.post()
                    .uri(path)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.TEXT_EVENT_STREAM);
            var request = (body != null) ? spec.bodyValue(body) : spec.bodyValue("");

            Flux<String> flux = request.retrieve().bodyToFlux(String.class);
            subscribeAndPipe(flux, emitter, "SSE POST " + path);
        } catch (Exception ex) {
            logger.error("Goose SSE POST {} setup error: {}", path, ex.getMessage(), ex);
            completeWithError(emitter, ex);
        }

        return emitter;
    }

    /**
     * GET from Goose expecting an SSE stream; pipes events into an {@link SseEmitter}.
     */
    public SseEmitter sseGet(String path) {
        logger.debug("Goose SSE GET {}", path);
        SseEmitter emitter = new SseEmitter(blockTimeout.toMillis());

        try {
            Flux<String> flux = gooseWebClient.get()
                    .uri(path)
                    .accept(MediaType.TEXT_EVENT_STREAM)
                    .retrieve()
                    .bodyToFlux(String.class);
            subscribeAndPipe(flux, emitter, "SSE GET " + path);
        } catch (Exception ex) {
            logger.error("Goose SSE GET {} setup error: {}", path, ex.getMessage(), ex);
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

