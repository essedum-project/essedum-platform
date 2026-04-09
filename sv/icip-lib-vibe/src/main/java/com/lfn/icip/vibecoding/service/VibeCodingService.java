package com.lfn.icip.vibecoding.service;

import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.lfn.icip.vibecoding.dto.AdkGenerateRequest;
import com.lfn.icip.vibecoding.dto.SandboxProvisionRequest;
import com.lfn.icip.vibecoding.dto.SandboxProvisionResponse;
import com.lfn.icip.vibecoding.dto.VibeDeployRequest;
import com.lfn.icip.vibecoding.dto.VibePreviewEvent;
import com.lfn.icip.vibecoding.dto.VibeSseEvent;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Service handling Vibe Studio code generation, deployment, and sandbox status monitoring.
 * <p>
 * Orchestrates communication between:
 * <ul>
 *   <li>ADK Python service — for AI-powered code generation (SSE stream)</li>
 *   <li>Sandbox Orchestrator — for deploying and monitoring sandbox environments</li>
 * </ul>
 */
@Service
public class VibeCodingService {

    private static final Logger logger = LoggerFactory.getLogger(VibeCodingService.class);

    private final WebClient adkWebClient;
    private final WebClient sandboxWebClient;

    @Value("${vibe.sandbox.status.poll-interval-seconds:3}")
    private int pollIntervalSeconds;

    @Value("${vibe.sandbox.status.timeout-minutes:5}")
    private int timeoutMinutes;

    public VibeCodingService(
            @Qualifier("adkWebClient") WebClient adkWebClient,
            @Qualifier("sandboxWebClient") WebClient sandboxWebClient) {
        this.adkWebClient = adkWebClient;
        this.sandboxWebClient = sandboxWebClient;
    }

    /**
     * Connects to the ADK Python service and relays the SSE stream of generation events.
     * <p>
     * Sends the prompt/model to ADK via POST and returns the streamed SSE events
     * (token, file, app_type, done) wrapped in {@link ServerSentEvent}.
     *
     * @param sessionId unique session identifier
     * @param prompt    the user's prompt for code generation
     * @param model     the LLM model to use
     * @param userId    the authenticated user's ID
     * @return a Flux of SSE events for the frontend to consume
     */
    public Flux<ServerSentEvent<VibeSseEvent>> generate(
            String sessionId, String prompt, String model, String userId) {

        logger.info("Starting code generation for session={}, model={}, userId={}", sessionId, model, userId);

        AdkGenerateRequest adkRequest = new AdkGenerateRequest(prompt, model, sessionId, userId);

        return adkWebClient.post()
                .uri("/vibe-coding/generate")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.TEXT_EVENT_STREAM)
                .bodyValue(adkRequest)
                .retrieve()
                .bodyToFlux(new ParameterizedTypeReference<ServerSentEvent<String>>() {})
                .mapNotNull(sse -> {
                    try {
                        String data = sse.data();
                        if (data == null || data.isBlank()) {
                            return null;
                        }
                        com.fasterxml.jackson.databind.ObjectMapper mapper =
                                new com.fasterxml.jackson.databind.ObjectMapper();
                        VibeSseEvent event = mapper.readValue(data, VibeSseEvent.class);
                        return ServerSentEvent.<VibeSseEvent>builder()
                                .data(event)
                                .build();
                    } catch (Exception e) {
                        logger.warn("Failed to parse ADK SSE event: {}", e.getMessage());
                        return null;
                    }
                })
                .doOnError(WebClientResponseException.class, ex ->
                        logger.error("ADK service error for session={}: {} - {}",
                                sessionId, ex.getStatusCode(), ex.getResponseBodyAsString()))
                .doOnError(ex ->
                        logger.error("Error during generation for session={}: {}", sessionId, ex.getMessage()))
                .onErrorResume(ex -> {
                    VibeSseEvent errorEvent = VibeSseEvent.error(
                            "Code generation failed: " + ex.getMessage());
                    return Flux.just(
                            ServerSentEvent.<VibeSseEvent>builder()
                                    .data(errorEvent)
                                    .build()
                    );
                })
                .doOnComplete(() ->
                        logger.info("Generation stream completed for session={}", sessionId));
    }

    /**
     * Forwards the generated files to the Sandbox Orchestrator for provisioning.
     * <p>
     * This is a fire-and-forget operation. The frontend monitors sandbox readiness
     * via the {@link #watchSandboxStatus(String)} SSE endpoint.
     *
     * @param sessionId unique session identifier
     * @param request   the deploy request containing files and app type
     */
    public void deploy(String sessionId, VibeDeployRequest request) {
        logger.info("Deploying session={}, appType={}, fileCount={}",
                sessionId, request.appType(), request.files() != null ? request.files().size() : 0);

        SandboxProvisionRequest provisionRequest = new SandboxProvisionRequest(
                sessionId, request.files(), request.appType());

        sandboxWebClient.post()
                .uri("/sandbox/provision")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(provisionRequest)
                .retrieve()
                .toBodilessEntity()
                .doOnSuccess(response ->
                        logger.info("Sandbox provision request accepted for session={}", sessionId))
                .doOnError(WebClientResponseException.class, ex ->
                        logger.error("Sandbox provision error for session={}: {} - {}",
                                sessionId, ex.getStatusCode(), ex.getResponseBodyAsString()))
                .doOnError(ex ->
                        logger.error("Error deploying session={}: {}", sessionId, ex.getMessage()))
                .subscribe();
    }

    /**
     * Polls the Sandbox Orchestrator status endpoint until the sandbox is live.
     * <p>
     * Emits a single {@code preview_ready} event when the sandbox becomes available,
     * then completes the stream. Times out after the configured duration.
     *
     * @param sessionId unique session identifier
     * @return a Flux that emits a single preview_ready SSE event
     */
    public Flux<ServerSentEvent<VibePreviewEvent>> watchSandboxStatus(String sessionId) {
        logger.info("Starting sandbox status watch for session={}", sessionId);

        return Flux.interval(Duration.ofSeconds(pollIntervalSeconds))
                .flatMap(tick -> checkSandboxStatus(sessionId))
                .filter(response -> "live".equals(response.status()))
                .take(1)
                .map(response -> {
                    logger.info("Sandbox is live for session={}, previewUrl={}",
                            sessionId, response.previewUrl());
                    return ServerSentEvent.<VibePreviewEvent>builder()
                            .data(VibePreviewEvent.ready(response.previewUrl()))
                            .build();
                })
                .timeout(Duration.ofMinutes(timeoutMinutes))
                .onErrorResume(ex -> {
                    String message;
                    if (ex instanceof java.util.concurrent.TimeoutException) {
                        message = "Sandbox provisioning timed out after " + timeoutMinutes + " minutes";
                        logger.warn(message + " for session={}", sessionId);
                    } else {
                        message = "Sandbox status check failed: " + ex.getMessage();
                        logger.error(message + " for session={}", sessionId, ex);
                    }
                    return Flux.just(
                            ServerSentEvent.<VibePreviewEvent>builder()
                                    .data(VibePreviewEvent.error(message))
                                    .build()
                    );
                })
                .doOnComplete(() ->
                        logger.info("Sandbox status watch completed for session={}", sessionId));
    }

    /**
     * Checks the current sandbox status from the orchestrator.
     *
     * @param sessionId the session to check
     * @return a Mono of the sandbox status response
     */
    private Mono<SandboxProvisionResponse> checkSandboxStatus(String sessionId) {
        return sandboxWebClient.get()
                .uri("/sandbox/{sessionId}/status", sessionId)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(SandboxProvisionResponse.class)
                .doOnError(ex ->
                        logger.debug("Sandbox status poll error for session={}: {}", sessionId, ex.getMessage()))
                .onErrorResume(ex ->
                        Mono.just(new SandboxProvisionResponse(null, "pending")));
    }
}

