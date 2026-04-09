package com.lfn.icip.vibecoding.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Request body for the deploy endpoint.
 *
 * @param files   list of generated files to deploy
 * @param appType the detected application type: "agents_mcp" | "react_app" | "react_node" | "streamlit"
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record VibeDeployRequest(
    List<VibeFile> files,
    String appType
) {}

