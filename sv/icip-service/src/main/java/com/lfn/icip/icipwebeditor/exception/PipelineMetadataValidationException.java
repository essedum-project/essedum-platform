package com.lfn.icip.icipwebeditor.exception;

/**
 * Thrown when a pipeline package is missing metadata.json
 * or when metadata.json fails type-specific validation rules.
 */
public class PipelineMetadataValidationException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public PipelineMetadataValidationException(String message) {
        super(message);
    }

    public PipelineMetadataValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}

