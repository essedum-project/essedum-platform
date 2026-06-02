package com.lfn.icip.icipwebeditor.rest.exception;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Detailed error response for Agent Directory operations.
 * Provides comprehensive error information to help clients understand and resolve issues.
 *
 * @author essedum
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    /**
     * Timestamp when the error occurred.
     */
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSSSSS")
    private LocalDateTime timestamp;

    /**
     * HTTP status code.
     */
    private int status;

    /**
     * HTTP status reason phrase (e.g., "Bad Request", "Internal Server Error").
     */
    private String error;

    /**
     * High-level error message for the user.
     */
    private String message;

    /**
     * Detailed error description with specific information about what went wrong.
     */
    private String details;

    /**
     * The request path that caused the error.
     */
    private String path;

    /**
     * The exception class name.
     */
    private String exception;

    /**
     * Additional context or field-specific errors (optional).
     */
    private String context;
}

