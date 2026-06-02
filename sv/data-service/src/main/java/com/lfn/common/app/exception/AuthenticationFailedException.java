/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 */
package com.lfn.common.app.exception;
/**
 * Exception thrown when authentication fails
 */
public class AuthenticationFailedException extends RuntimeException {
    public AuthenticationFailedException(String message) {
        super(message);
    }
    public AuthenticationFailedException(String message, Throwable cause) {
        super(message, cause);
    }
}
