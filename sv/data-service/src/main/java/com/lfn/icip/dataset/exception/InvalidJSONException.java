/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 */

package com.lfn.icip.dataset.exception;

/**
 * Exception thrown when invalid JSON is provided
 */
public class InvalidJSONException extends RuntimeException {

    public InvalidJSONException(String message) {
        super(message);
    }

    public InvalidJSONException(String message, Throwable cause) {
        super(message, cause);
    }
}

