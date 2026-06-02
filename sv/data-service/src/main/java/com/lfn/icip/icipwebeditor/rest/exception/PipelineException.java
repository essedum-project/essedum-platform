package com.lfn.icip.icipwebeditor.rest.exception;

/**
 * Custom exception for Pipeline operations.
 *
 * @author essedum
 */
public class PipelineException extends RuntimeException {

	private static final long serialVersionUID = 1L;

	public PipelineException(String message) {
		super(message);
	}

	public PipelineException(String message, Throwable cause) {
		super(message, cause);
	}
}

