package com.lfn.icip.vibecoding.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * SSE event payload for sandbox preview readiness.
 *
 * @param type always "preview_ready"
 * @param url  the sandbox preview URL
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record VibePreviewEvent(
    String type,
    String url
) {

    /**
     * Creates a preview_ready event with the given sandbox URL.
     */
    public static VibePreviewEvent ready(String url) {
        return new VibePreviewEvent("preview_ready", url);
    }

    /**
     * Creates an error event for sandbox provisioning failures.
     */
    public static VibePreviewEvent error(String message) {
        return new VibePreviewEvent("error", message);
    }
}

