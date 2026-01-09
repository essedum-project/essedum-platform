package com.lfn.icip.icipwebeditor.rest.exception;

/**
 * Custom exception for Streaming Services operations.
 *
 * @author essedum
 */
public class StreamingServiceException extends RuntimeException {

	private static final long serialVersionUID = 1L;

	public StreamingServiceException(String message) {
		super(message);
	}

	public StreamingServiceException(String message, Throwable cause) {
		super(message, cause);
	}
}

