/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 */
package com.lfn.common.app.exception;
/**
 * Exception thrown when user is not authorized
 */
public class UnauthorizedAccessException extends RuntimeException {
    public UnauthorizedAccessException(String message) {
        super(message);
    }
    public UnauthorizedAccessException(String message, Throwable cause) {
        super(message, cause);
    }
}
