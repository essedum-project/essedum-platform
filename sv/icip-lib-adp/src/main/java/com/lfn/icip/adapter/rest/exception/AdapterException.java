package com.lfn.icip.adapter.rest.exception;

/**
 * Custom exception for Adapter operations.
 *
 * @author essedum
 */
public class AdapterException extends RuntimeException {

	private static final long serialVersionUID = 1L;

	public AdapterException(String message) {
		super(message);
	}

	public AdapterException(String message, Throwable cause) {
		super(message, cause);
	}
}

