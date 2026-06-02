package com.lfn.icip.icipwebeditor.v1.rest.exception;

/**
 * Custom exception for Search operations.
 *
 * @author essedum
 */
public class SearchException extends RuntimeException {

	private static final long serialVersionUID = 1L;

	public SearchException(String message) {
		super(message);
	}

	public SearchException(String message, Throwable cause) {
		super(message, cause);
	}
}

