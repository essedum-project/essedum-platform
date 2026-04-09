package com.lfn.icip.vibecoding.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Response from the Sandbox Orchestrator status endpoint.
 *
 * @param previewUrl the URL to access the sandbox preview
 * @param status     provisioning status: "live" | "pending" | "error"
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record SandboxProvisionResponse(
    String previewUrl,
    String status
) {}

