package com.lfn.icip.icipwebeditor.event.soap.exception;

/**
 * Custom exception for Webhook operations.
 *
 * @author essedum
 */
public class WebhookException extends RuntimeException {

	private static final long serialVersionUID = 1L;

	public WebhookException(String message) {
		super(message);
	}

	public WebhookException(String message, Throwable cause) {
		super(message, cause);
	}
}

