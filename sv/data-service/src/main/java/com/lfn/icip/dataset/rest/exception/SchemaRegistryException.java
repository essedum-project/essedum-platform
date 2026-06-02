package com.lfn.icip.dataset.rest.exception;

/**
 * Custom exception for Schema Registry operations.
 *
 * @author essedum
 */
public class SchemaRegistryException extends RuntimeException {

	private static final long serialVersionUID = 1L;

	public SchemaRegistryException(String message) {
		super(message);
	}

	public SchemaRegistryException(String message, Throwable cause) {
		super(message, cause);
	}
}

