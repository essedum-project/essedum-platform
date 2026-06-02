package com.lfn.icip.icipwebeditor.rest.exception;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.lfn.ai.comm.lib.util.exceptions.ApiError;
import com.lfn.ai.comm.lib.util.exceptions.ExceptionUtil;

import lombok.extern.log4j.Log4j2;

/**
 * Global exception handler for WebSocket and SSE controllers.
 * Handles real-time communication errors.
 *
 * @author essedum
 */
@ControllerAdvice(basePackages = "com.lfn.icip.icipwebeditor.rest")
@Log4j2
public class RealtimeGlobalExceptionHandler {

	/**
	 * Handle WebSocket specific exceptions.
	 */
	@ExceptionHandler(WebSocketException.class)
	public ResponseEntity<ApiError> handleWebSocketException(WebSocketException ex, WebRequest request) {
		log.error("WebSocket error: {}", ex.getMessage(), ex);
		Throwable rootCause = ExceptionUtil.findRootCause(ex);
		ApiError apiError = new ApiError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			rootCause.getMessage(),
			"WebSocket operation failed: " + ex.getMessage()
		);
		return new ResponseEntity<>(apiError, HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/**
	 * Handle SSE specific exceptions.
	 */
	@ExceptionHandler(SSEException.class)
	public ResponseEntity<ApiError> handleSSEException(SSEException ex, WebRequest request) {
		log.error("SSE error: {}", ex.getMessage(), ex);
		Throwable rootCause = ExceptionUtil.findRootCause(ex);
		ApiError apiError = new ApiError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			rootCause.getMessage(),
			"SSE operation failed: " + ex.getMessage()
		);
		return new ResponseEntity<>(apiError, HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/**
	 * Handle JSON processing exceptions.
	 */
	@ExceptionHandler(JsonProcessingException.class)
	public ResponseEntity<ApiError> handleJsonProcessingException(JsonProcessingException ex, WebRequest request) {
		log.error("JSON processing error: {}", ex.getMessage(), ex);
		ApiError apiError = new ApiError(
			HttpStatus.BAD_REQUEST,
			"Invalid JSON format",
			"Failed to process JSON data: " + ex.getMessage()
		);
		return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
	}

	/**
	 * Handle IOException for real-time operations.
	 */
	@ExceptionHandler(IOException.class)
	public ResponseEntity<ApiError> handleIOException(IOException ex, WebRequest request) {
		log.error("IO error in real-time operation: {}", ex.getMessage(), ex);
		ApiError apiError = new ApiError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			ex.getMessage(),
			"IO operation failed during real-time communication"
		);
		return new ResponseEntity<>(apiError, HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/**
	 * Handle illegal argument exceptions.
	 */
	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiError> handleIllegalArgumentException(IllegalArgumentException ex, WebRequest request) {
		log.error("Illegal argument: {}", ex.getMessage(), ex);
		ApiError apiError = new ApiError(
			HttpStatus.BAD_REQUEST,
			ex.getMessage(),
			"Invalid argument provided for real-time operation"
		);
		return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
	}

	/**
	 * Handle method argument type mismatch.
	 */
	@ExceptionHandler(MethodArgumentTypeMismatchException.class)
	public ResponseEntity<ApiError> handleMethodArgumentTypeMismatch(MethodArgumentTypeMismatchException ex, WebRequest request) {
		log.error("Method argument type mismatch: {}", ex.getMessage(), ex);
		String error = String.format("Parameter '%s' should be of type %s",
			ex.getName(),
			ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown");
		ApiError apiError = new ApiError(HttpStatus.BAD_REQUEST, error, ex.getMessage());
		return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
	}

	/**
	 * Handle NullPointerException.
	 */
	@ExceptionHandler(NullPointerException.class)
	public ResponseEntity<ApiError> handleNullPointerException(NullPointerException ex, WebRequest request) {
		log.error("Null pointer exception: {}", ex.getMessage(), ex);
		Throwable rootCause = ExceptionUtil.findRootCause(ex);
		ApiError apiError = new ApiError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			"Required data not found",
			"Null pointer error: " + rootCause.getMessage()
		);
		return new ResponseEntity<>(apiError, HttpStatus.INTERNAL_SERVER_ERROR);
	}


	/**
	 * Handle all other exceptions.
	 */
	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiError> handleGlobalException(Exception ex, WebRequest request) {
		log.error("Unexpected error in real-time operation: {}", ex.getMessage(), ex);
		Throwable rootCause = ExceptionUtil.findRootCause(ex);
		ApiError apiError = new ApiError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			rootCause.getMessage(),
			"An unexpected error occurred during real-time communication"
		);
		return new ResponseEntity<>(apiError, HttpStatus.INTERNAL_SERVER_ERROR);
	}
}
