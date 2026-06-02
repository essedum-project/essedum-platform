/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 */
package com.lfn.common.app.exception;
/**
 * Exception thrown when token operations fail
 */
public class TokenException extends RuntimeException {
    public TokenException(String message) {
        super(message);
    }
    public TokenException(String message, Throwable cause) {
        super(message, cause);
    }
}
