package com.lfn.icip.vibecoding.dto;

/**
 * Request body sent to the ADK Python service for code generation.
 *
 * @param prompt    the user prompt
 * @param model     the LLM model identifier
 * @param sessionId unique session identifier
 * @param userId    the authenticated user's ID
 */
public record AdkGenerateRequest(
    String prompt,
    String model,
    String sessionId,
    String userId
) {}

