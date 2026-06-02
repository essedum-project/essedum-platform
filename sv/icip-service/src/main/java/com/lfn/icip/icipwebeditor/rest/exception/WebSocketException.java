package com.lfn.icip.icipwebeditor.rest.exception;

/**
 * Custom exception for WebSocket operations.
 *
 * @author essedum
 */
public class WebSocketException extends RuntimeException {

	private static final long serialVersionUID = 1L;

	public WebSocketException(String message) {
		super(message);
	}

	public WebSocketException(String message, Throwable cause) {
		super(message, cause);
	}
}

