package com.lfn.icip.vibecoding.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Represents a single generated file with its path and content.
 *
 * @param path    relative file path (e.g. "src/app.py")
 * @param content full file content as a string
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record VibeFile(
    String path,
    String content
) {}

