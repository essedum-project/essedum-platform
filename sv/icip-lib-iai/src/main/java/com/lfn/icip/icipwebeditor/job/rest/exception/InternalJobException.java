package com.lfn.icip.icipwebeditor.job.rest.exception;

/**
 * Custom exception for Internal Job operations.
 *
 * @author essedum
 */
public class InternalJobException extends RuntimeException {

	private static final long serialVersionUID = 1L;

	public InternalJobException(String message) {
		super(message);
	}

	public InternalJobException(String message, Throwable cause) {
		super(message, cause);
	}
}

