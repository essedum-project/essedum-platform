package com.lfn.icip.vibecoding.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration properties for the Salus Responsible-AI moderation/privacy layer.
 * Bound from {@code vibe.salus.*} in the active application profile.
 */
@ConfigurationProperties(prefix = "vibe.salus")
public class SalusProperties {

    /** Master switch — set SALUS_ENABLED=true to activate all checks. */
    private boolean enabled = false;

    /**
     * When true, a Salus connectivity failure blocks the LLM call.
     * When false (default), the call is allowed through and the error is logged.
     */
    private boolean failClosed = false;

    /** Base URL of the Salus Moderation service. */
    private String moderationUrl = "http://localhost:30000";

    /** Moderation checks to run on user input. */
    private List<String> inputChecks = List.of("PromptInjection", "JailBreak", "Toxicity", "Piidetct");

    /** Moderation checks to run on LLM output (non-streaming path only). */
    private List<String> outputChecks = List.of("Toxicity", "Refusal");

    /** HTTP connect timeout in seconds for Salus calls. */
    private int timeoutSeconds = 10;

    /** Thresholds — all in [0, 1] range. */
    private double promptInjectionThreshold = 0.70;
    private double jailbreakThreshold = 0.70;
    private double toxicityThreshold = 0.60;
    private double refusalThreshold = 0.70;

    // -------------------------------------------------------------------------
    // Getters / setters (Spring requires these for @ConfigurationProperties)
    // -------------------------------------------------------------------------

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public boolean isFailClosed() { return failClosed; }
    public void setFailClosed(boolean failClosed) { this.failClosed = failClosed; }

    public String getModerationUrl() { return moderationUrl; }
    public void setModerationUrl(String moderationUrl) { this.moderationUrl = moderationUrl; }

    public List<String> getInputChecks() { return inputChecks; }
    public void setInputChecks(List<String> inputChecks) { this.inputChecks = inputChecks; }

    public List<String> getOutputChecks() { return outputChecks; }
    public void setOutputChecks(List<String> outputChecks) { this.outputChecks = outputChecks; }

    public int getTimeoutSeconds() { return timeoutSeconds; }
    public void setTimeoutSeconds(int timeoutSeconds) { this.timeoutSeconds = timeoutSeconds; }

    public double getPromptInjectionThreshold() { return promptInjectionThreshold; }
    public void setPromptInjectionThreshold(double t) { this.promptInjectionThreshold = t; }

    public double getJailbreakThreshold() { return jailbreakThreshold; }
    public void setJailbreakThreshold(double t) { this.jailbreakThreshold = t; }

    public double getToxicityThreshold() { return toxicityThreshold; }
    public void setToxicityThreshold(double t) { this.toxicityThreshold = t; }

    public double getRefusalThreshold() { return refusalThreshold; }
    public void setRefusalThreshold(double t) { this.refusalThreshold = t; }
}
