package com.lfn.icip.vibecoding.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * SSE event payload sent during code generation.
 * <p>
 * Event types:
 * <ul>
 *   <li><b>token</b> — streamed text chunk (uses {@code data})</li>
 *   <li><b>file</b> — complete generated file (uses {@code path} and {@code content})</li>
 *   <li><b>app_type</b> — detected application type (uses {@code data})</li>
 *   <li><b>done</b> — generation complete (uses {@code fileCount})</li>
 * </ul>
 *
 * @param type      event type identifier
 * @param data      used for token text and app_type value
 * @param path      used for file events — the relative file path
 * @param content   used for file events — the full file content
 * @param fileCount used for done events — total number of generated files
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record VibeSseEvent(
    String type,
    String data,
    String path,
    String content,
    Integer fileCount
) {

    /**
     * Creates a token event for streaming text chunks.
     */
    public static VibeSseEvent token(String text) {
        return new VibeSseEvent("token", text, null, null, null);
    }

    /**
     * Creates a file event when a complete file is generated.
     */
    public static VibeSseEvent file(String path, String content) {
        return new VibeSseEvent("file", null, path, content, null);
    }

    /**
     * Creates an app_type event when ADK detects the application type.
     */
    public static VibeSseEvent appType(String appType) {
        return new VibeSseEvent("app_type", appType, null, null, null);
    }

    /**
     * Creates a done event signaling generation is complete.
     */
    public static VibeSseEvent done(int fileCount) {
        return new VibeSseEvent("done", null, null, null, fileCount);
    }

    /**
     * Creates an error event for exceptional conditions.
     */
    public static VibeSseEvent error(String message) {
        return new VibeSseEvent("error", message, null, null, null);
    }
}

