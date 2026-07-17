package com.lfn.icip.vibecoding.service;

import com.lfn.icip.vibecoding.config.SalusProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Calls the Salus Responsible-AI Moderation API to screen prompts and LLM responses.
 * <p>
 * Input and output checks run synchronously on the calling thread. A connectivity
 * failure either blocks the call ({@code failClosed=true}) or logs a warning and
 * passes through ({@code failClosed=false}, the default).
 */
@Service
public class SalusService {

    private static final Logger logger = LoggerFactory.getLogger(SalusService.class);

    /** Returned by checkInput / checkOutput to convey allow/block + reason. */
    public record SalusResult(boolean blocked, String reason) {
        static SalusResult allow() { return new SalusResult(false, null); }
        static SalusResult block(String reason) { return new SalusResult(true, reason); }
    }

    private final WebClient salusWebClient;
    private final SalusProperties props;
    private final Duration timeout;

    public SalusService(
            @Qualifier("salusWebClient") WebClient salusWebClient,
            SalusProperties props) {
        this.salusWebClient = salusWebClient;
        this.props = props;
        this.timeout = Duration.ofSeconds(props.getTimeoutSeconds());
    }

    // =========================================================================
    // Public API
    // =========================================================================

    /**
     * Run Salus input-moderation checks on the user prompt.
     * Returns {@link SalusResult#allow()} when the text passes; block with a reason otherwise.
     */
    public SalusResult checkInput(String text) {
        if (!props.isEnabled() || props.getInputChecks().isEmpty()) {
            return SalusResult.allow();
        }
        return moderate(text, props.getInputChecks(), "input");
    }

    /**
     * Run Salus output-moderation checks on the LLM response (non-streaming path).
     * Returns {@link SalusResult#allow()} when the text passes; block with a reason otherwise.
     */
    public SalusResult checkOutput(String text) {
        if (!props.isEnabled() || props.getOutputChecks().isEmpty()) {
            return SalusResult.allow();
        }
        return moderate(text, props.getOutputChecks(), "output");
    }

    /**
     * Extract the user message text from an incoming Goose request body.
     * Vibe Studio sends: {@code {"session_id":"...","user_message":{"content":[{"type":"text","text":"..."}]}}}
     * Falls back to legacy formats for compatibility.
     */
    @SuppressWarnings("unchecked")
    public String extractUserText(Map<String, Object> request) {
        if (request == null) return null;

        // Format 1 (Vibe Studio / Goose): user_message.content[].text
        Object userMsg = request.get("user_message");
        if (userMsg instanceof Map<?, ?> msgMap) {
            Object contentArr = msgMap.get("content");
            if (contentArr instanceof List<?> contentList && !contentList.isEmpty()) {
                List<String> parts = new ArrayList<>();
                for (Object item : contentList) {
                    if (item instanceof Map<?, ?> contentObj) {
                        Object text = contentObj.get("text");
                        if (text instanceof String s && !s.isBlank()) parts.add(s);
                    }
                }
                if (!parts.isEmpty()) return String.join(" ", parts);
            }
        }

        // Format 2: messages[].content (OpenAI-style)
        Object msgs = request.get("messages");
        if (msgs instanceof List<?> list && !list.isEmpty()) {
            List<String> parts = new ArrayList<>();
            for (Object item : list) {
                if (item instanceof Map<?, ?> msg) {
                    Object content = msg.get("content");
                    if (content instanceof String s && !s.isBlank()) parts.add(s);
                }
            }
            if (!parts.isEmpty()) return String.join(" ", parts);
        }

        // Format 3: plain prompt string
        Object prompt = request.get("prompt");
        if (prompt instanceof String s && !s.isBlank()) return s;

        return null;
    }

    // =========================================================================
    // Internal helpers
    // =========================================================================

    private SalusResult moderate(String text, List<String> checks, String stage) {
        if (text == null || text.isBlank()) return SalusResult.allow();

        Map<String, Object> payload = buildPayload(text, checks);
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = salusWebClient.post()
                    .uri("/rai/v1/moderations")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(payload)
                    .exchangeToMono(r -> r.bodyToMono(Map.class))
                    .block(timeout);

            return evaluateResponse(response, stage);

        } catch (WebClientResponseException ex) {
            logger.error("Salus {} check HTTP error {}: {}", stage, ex.getStatusCode(), ex.getMessage());
            return handleFailure("HTTP " + ex.getStatusCode());
        } catch (Exception ex) {
            logger.error("Salus {} check unreachable: {}", stage, ex.getMessage());
            return handleFailure("Salus service unreachable");
        }
    }

    @SuppressWarnings("unchecked")
    private SalusResult evaluateResponse(Map<String, Object> response, String stage) {
        if (response == null) {
            logger.warn("Salus {} check returned null response", stage);
            return handleFailure("empty response");
        }

        try {
            Map<String, Object> results = (Map<String, Object>) response.get("moderationResults");
            if (results == null) {
                logger.warn("Salus {} check: no moderationResults in response", stage);
                return SalusResult.allow();
            }

            Map<String, Object> summary = (Map<String, Object>) results.get("summary");
            String status = summary != null ? String.valueOf(summary.get("status")) : "PASSED";

            if ("REJECTED".equalsIgnoreCase(status) || "FAILED".equalsIgnoreCase(status)) {
                Object reasons = summary != null ? summary.get("reasons") : null;
                String reason = reasons != null ? reasons.toString() : status;
                logger.warn("Salus {} check BLOCKED — reason: {}", stage, reason);
                return SalusResult.block(reason);
            }

            logger.debug("Salus {} check passed — status: {}", stage, status);
            return SalusResult.allow();

        } catch (ClassCastException ex) {
            logger.warn("Salus {} check: unexpected response shape — {}", stage, ex.getMessage());
            return SalusResult.allow();
        }
    }

    private SalusResult handleFailure(String detail) {
        if (props.isFailClosed()) {
            logger.error("Salus fail-closed: blocking call — {}", detail);
            return SalusResult.block("Responsible AI service unavailable");
        }
        logger.warn("Salus fail-open: allowing call despite error — {}", detail);
        return SalusResult.allow();
    }

    private Map<String, Object> buildPayload(String text, List<String> checks) {
        double tox = props.getToxicityThreshold();

        Map<String, Object> toxThresholds = new LinkedHashMap<>();
        toxThresholds.put("ToxicityThreshold", tox);
        toxThresholds.put("SevereToxicityThreshold", tox);
        toxThresholds.put("ObsceneThreshold", tox);
        toxThresholds.put("ThreatThreshold", tox);
        toxThresholds.put("InsultThreshold", tox);
        toxThresholds.put("IdentityAttackThreshold", tox);
        toxThresholds.put("SexualExplicitThreshold", tox);

        // CustomTheme and RestrictedtopicDetails are required by Salus — omitting them
        // causes a silent KeyError in the Salus service that returns an empty response.
        Map<String, Object> customTheme = new LinkedHashMap<>();
        customTheme.put("Themename", "");
        customTheme.put("Themethresold", 0.6);
        customTheme.put("ThemeTexts", List.of());

        Map<String, Object> restrictedTopic = new LinkedHashMap<>();
        restrictedTopic.put("RestrictedtopicThreshold", 0.7);
        restrictedTopic.put("Restrictedtopics", List.of());

        Map<String, Object> thresholds = new LinkedHashMap<>();
        thresholds.put("PromptinjectionThreshold", props.getPromptInjectionThreshold());
        thresholds.put("JailbreakThreshold", props.getJailbreakThreshold());
        thresholds.put("PiientitiesConfiguredToBlock", List.of());
        thresholds.put("RefusalThreshold", props.getRefusalThreshold());
        thresholds.put("ToxicityThresholds", toxThresholds);
        thresholds.put("ProfanityCountThreshold", 1);
        thresholds.put("CustomTheme", customTheme);
        thresholds.put("RestrictedtopicDetails", restrictedTopic);

        Map<String, Object> payload = new HashMap<>();
        payload.put("AccountName", "essedum");
        payload.put("userid", "vibe-studio");
        payload.put("PortfolioName", "vibe-coding");
        payload.put("lotNumber", "1");
        payload.put("translate", "no");
        payload.put("Prompt", text);
        payload.put("ModerationChecks", checks);
        payload.put("ModerationCheckThresholds", thresholds);
        return payload;
    }
}
