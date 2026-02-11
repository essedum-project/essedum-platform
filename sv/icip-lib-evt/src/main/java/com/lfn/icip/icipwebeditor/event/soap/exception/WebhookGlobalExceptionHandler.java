package com.lfn.icip.icipwebeditor.event.soap.exception;

import java.io.UnsupportedEncodingException;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import com.google.gson.JsonSyntaxException;
import com.lfn.ai.comm.lib.util.exceptions.ApiError;
import com.lfn.ai.comm.lib.util.exceptions.ExceptionUtil;

import lombok.extern.log4j.Log4j2;

/**
 * Global exception handler for Webhook Controller (SOAP).
 * Handles webhook and SOAP operation exceptions.
 * Note: This controller is currently disabled but exception handling is ready.
 *
 * @author essedum
 */
@ControllerAdvice(basePackages = "com.lfn.icip.icipwebeditor.event.soap")
@Log4j2
public class WebhookGlobalExceptionHandler {

	/**
	 * Handle WebhookException.
	 */
	@ExceptionHandler(WebhookException.class)
	public ResponseEntity<Object> handleWebhookException(WebhookException ex, WebRequest request) {
		log.error("Webhook operation error: {}", ex.getMessage(), ex);
		Throwable rootCause = ExceptionUtil.findRootCause(ex);
		ApiError apiError = new ApiError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			rootCause.getMessage(),
			"Webhook operation failed"
		);
		return new ResponseEntity<>("There is an application error, please contact the application admin",
				new HttpHeaders(), apiError.getStatus());
	}

	/**
	 * Handle UnsupportedEncodingException.
	 */
	@ExceptionHandler(UnsupportedEncodingException.class)
	public ResponseEntity<Object> handleUnsupportedEncodingException(UnsupportedEncodingException ex, WebRequest request) {
		log.error("Encoding error: {}", ex.getMessage(), ex);
		ApiError apiError = new ApiError(
			HttpStatus.BAD_REQUEST,
			"Unsupported encoding format",
			ex.getMessage()
		);
		return new ResponseEntity<>("There is an application error, please contact the application admin",
				new HttpHeaders(), apiError.getStatus());
	}

	/**
	 * Handle JsonSyntaxException.
	 */
	@ExceptionHandler(JsonSyntaxException.class)
	public ResponseEntity<Object> handleJsonSyntaxException(JsonSyntaxException ex, WebRequest request) {
		log.error("JSON syntax error: {}", ex.getMessage(), ex);
		ApiError apiError = new ApiError(
			HttpStatus.BAD_REQUEST,
			"Invalid JSON syntax",
			ex.getMessage()
		);
		return new ResponseEntity<>("There is an application error, please contact the application admin",
				new HttpHeaders(), apiError.getStatus());
	}

	/**
	 * Handle IllegalArgumentException.
	 */
	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<Object> handleIllegalArgumentException(IllegalArgumentException ex, WebRequest request) {
		log.error("Illegal argument: {}", ex.getMessage(), ex);
		ApiError apiError = new ApiError(
			HttpStatus.BAD_REQUEST,
			ex.getMessage(),
			"Invalid argument provided to webhook"
		);
		return new ResponseEntity<>("There is an application error, please contact the application admin",
				new HttpHeaders(), apiError.getStatus());
	}

	/**
	 * Handle NullPointerException.
	 */
	@ExceptionHandler(NullPointerException.class)
	public ResponseEntity<Object> handleNullPointerException(NullPointerException ex, WebRequest request) {
		log.error("Null pointer exception: {}", ex.getMessage(), ex);
		Throwable rootCause = ExceptionUtil.findRootCause(ex);
		ApiError apiError = new ApiError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			"Required data not found",
			"Null pointer error: " + (rootCause.getMessage() != null ? rootCause.getMessage() : "No details available")
		);
		return new ResponseEntity<>("There is an application error, please contact the application admin",
				new HttpHeaders(), apiError.getStatus());
	}

	/**
	 * Handle all other exceptions.
	 */
	@ExceptionHandler(Exception.class)
	public ResponseEntity<Object> handleGlobalException(Exception ex, WebRequest request) {
		log.error("Unexpected error in webhook operation: {}", ex.getMessage(), ex);
		Throwable rootCause = ExceptionUtil.findRootCause(ex);
		ApiError apiError = new ApiError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			rootCause.getMessage(),
			"An unexpected error occurred"
		);
		return new ResponseEntity<>("There is an application error, please contact the application admin",
				new HttpHeaders(), apiError.getStatus());
	}
}

