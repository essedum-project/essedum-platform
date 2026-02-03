package com.lfn.icip.icipwebeditor.rest.exception;

/**
 * Custom exception for Job operations.
 *
 * @author essedum
 */
public class JobException extends RuntimeException {

	private static final long serialVersionUID = 1L;

	public JobException(String message) {
		super(message);
	}

	public JobException(String message, Throwable cause) {
		super(message, cause);
	}
}

