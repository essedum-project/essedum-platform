/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 */

package com.lfn.icip.dataset.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Standardized error response for Langflow integration exceptions
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LangflowErrorResponse {

    private int status;
    private String error;
    private String message;
    private String details;
    private String path;
    private String exception;
    private String suggestedAction;
    private String requestId;
    private LocalDateTime timestamp;

    public LangflowErrorResponse() {
        this.timestamp = LocalDateTime.now();
    }

    public LangflowErrorResponse(int status, String error, String message, String details, String path) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.details = details;
        this.path = path;
        this.timestamp = LocalDateTime.now();
    }

    public LangflowErrorResponse(int status, String error, String message) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }
}

