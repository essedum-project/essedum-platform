package com.lfn.icip.vibecoding.dto;

/**
 * Internal representation of generate request parameters.
 * Not a request body — params come as query string on the GET SSE endpoint.
 *
 * @param sessionId unique session identifier
 * @param prompt    the user prompt for code generation
 * @param model     the LLM model to use: "claude" | "gemini" | "azure-oai"
 */
public record VibeGenerateRequest(
    String sessionId,
    String prompt,
    String model
) {}

