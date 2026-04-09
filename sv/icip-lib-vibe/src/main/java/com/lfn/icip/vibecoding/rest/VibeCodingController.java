package com.lfn.icip.vibecoding.rest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lfn.icip.vibecoding.dto.VibeDeployRequest;
import com.lfn.icip.vibecoding.dto.VibePreviewEvent;
import com.lfn.icip.vibecoding.dto.VibeSseEvent;
import com.lfn.icip.vibecoding.service.VibeCodingService;

import reactor.core.publisher.Flux;

/**
 * REST controller for Vibe Studio code generation, deployment, and sandbox monitoring.
 * <p>
 * Endpoints:
 * <ul>
 *   <li>GET  /sessions/{sessionId}/generate — SSE stream for AI code generation</li>
 *   <li>POST /sessions/{sessionId}/deploy   — Deploy generated files to sandbox</li>
 *   <li>GET  /sessions/{sessionId}/status   — SSE stream for sandbox readiness</li>
 * </ul>
 * <p>
 * All endpoints are secured via the existing JWT auth filter chain.
 */
@RestController
@RequestMapping("/${icip.pathPrefix}/service/v1/vibe-coding")
public class VibeCodingController {

    private static final Logger logger = LoggerFactory.getLogger(VibeCodingController.class);

    private final VibeCodingService vibeCodingService;

    public VibeCodingController(VibeCodingService vibeCodingService) {
        this.vibeCodingService = vibeCodingService;
    }

    /**
     * Endpoint 1: Generate code via ADK — SSE stream.
     * <p>
     * The frontend opens an EventSource to this URL. The backend connects to the
     * ADK Python service and relays SSE events (token, file, app_type, done) back.
     *
     * @param sessionId unique session identifier (path variable)
     * @param prompt    the user's prompt (query parameter)
     * @param model     the LLM model: "claude" | "gemini" | "azure-oai" (query parameter)
     * @return SSE stream of VibeSseEvent payloads
     */
    @GetMapping(
        value = "/sessions/{sessionId}/generate",
        produces = MediaType.TEXT_EVENT_STREAM_VALUE
    )
    public Flux<ServerSentEvent<VibeSseEvent>> generate(
            @PathVariable String sessionId,
            @RequestParam String prompt,
            @RequestParam String model) {

        String userId = extractUserId();
        logger.info("Generate request: session={}, model={}, user={}", sessionId, model, userId);
        return vibeCodingService.generate(sessionId, prompt, model, userId);
    }

    /**
     * Endpoint 2: Deploy generated files to a sandbox environment.
     * <p>
     * The frontend sends the generated files and app type. The backend forwards
     * them to the Sandbox Orchestrator asynchronously.
     *
     * @param sessionId     unique session identifier (path variable)
     * @param deployRequest request body with files and appType
     * @return 200 OK on successful submission
     */
    @PostMapping("/sessions/{sessionId}/deploy")
    public ResponseEntity<Void> deploy(
            @PathVariable String sessionId,
            @RequestBody VibeDeployRequest deployRequest) {

        logger.info("Deploy request: session={}, appType={}, files={}",
                sessionId, deployRequest.appType(),
                deployRequest.files() != null ? deployRequest.files().size() : 0);
        vibeCodingService.deploy(sessionId, deployRequest);
        return ResponseEntity.ok().build();
    }

    /**
     * Endpoint 3: SSE stream for sandbox status monitoring.
     * <p>
     * The frontend opens an EventSource after deploy. The backend polls the
     * Sandbox Orchestrator and emits a single {@code preview_ready} event
     * when the sandbox pod is live.
     *
     * @param sessionId unique session identifier (path variable)
     * @return SSE stream with a single preview_ready event
     */
    @GetMapping(
        value = "/sessions/{sessionId}/status",
        produces = MediaType.TEXT_EVENT_STREAM_VALUE
    )
    public Flux<ServerSentEvent<VibePreviewEvent>> status(
            @PathVariable String sessionId) {

        logger.info("Status watch request: session={}", sessionId);
        return vibeCodingService.watchSandboxStatus(sessionId);
    }

    /**
     * Extracts the user ID from the current security context.
     * <p>
     * Supports both JWT (OAuth2) and standard authentication principals.
     *
     * @return the authenticated user's identifier, or "anonymous" if not available
     */
    private String extractUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null) {
                return "anonymous";
            }
            // OAuth2 JWT — extract preferred_username or sub claim
            if (authentication.getCredentials() instanceof Jwt jwt) {
                String user = jwt.getClaimAsString("preferred_username");
                if (user == null || user.isBlank()) {
                    user = jwt.getClaimAsString("sub");
                }
                return user != null ? user : "anonymous";
            }
            // Fallback to authentication name
            String name = authentication.getName();
            return name != null ? name : "anonymous";
        } catch (Exception e) {
            logger.warn("Failed to extract userId from security context: {}", e.getMessage());
            return "anonymous";
        }
    }
}

