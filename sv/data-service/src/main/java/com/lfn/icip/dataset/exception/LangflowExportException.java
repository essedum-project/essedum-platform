/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 */

package com.lfn.icip.dataset.exception;

/**
 * Exception thrown when Langflow export/import operations fail
 */
public class LangflowExportException extends RuntimeException {

    public LangflowExportException(String message) {
        super(message);
    }

    public LangflowExportException(String message, Throwable cause) {
        super(message, cause);
    }
}

