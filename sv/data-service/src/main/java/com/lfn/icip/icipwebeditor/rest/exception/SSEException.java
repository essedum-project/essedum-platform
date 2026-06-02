package com.lfn.icip.icipwebeditor.rest.exception;

/**
 * Custom exception for Server-Sent Events (SSE) operations.
 *
 * @author essedum
 */
public class SSEException extends RuntimeException {

	private static final long serialVersionUID = 1L;

	public SSEException(String message) {
		super(message);
	}

	public SSEException(String message, Throwable cause) {
		super(message, cause);
	}
}

