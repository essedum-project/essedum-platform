package com.lfn.icip.vibecoding.dto;

import java.util.List;

/**
 * Request body sent to the Sandbox Orchestrator for provisioning.
 *
 * @param sessionId unique session identifier
 * @param files     list of files to deploy
 * @param appType   the application type
 */
public record SandboxProvisionRequest(
    String sessionId,
    List<VibeFile> files,
    String appType
) {}

