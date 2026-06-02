package com.lfn.icip.dataset.rest.exception;

import java.net.URISyntaxException;

import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import com.lfn.ai.comm.lib.util.exceptions.ApiError;
import com.lfn.ai.comm.lib.util.exceptions.ExceptionUtil;

import lombok.extern.log4j.Log4j2;

/**
 * Global exception handler for Schema Registry Controller.
 * Handles exceptions for schema registry operations.
 *
 * @author essedum
 */
@ControllerAdvice(basePackages = "com.lfn.icip.dataset.rest")
@Log4j2
public class SchemaRegistryGlobalExceptionHandler {

	/**
	 * Handle SchemaRegistryException.
	 */
	@ExceptionHandler(SchemaRegistryException.class)
	public ResponseEntity<ApiError> handleSchemaRegistryException(SchemaRegistryException ex, WebRequest request) {
		log.error("Schema registry operation error: {}", ex.getMessage(), ex);
		Throwable rootCause = ExceptionUtil.findRootCause(ex);
		ApiError apiError = new ApiError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			rootCause.getMessage(),
			"Schema registry operation failed: " + ex.getMessage()
		);
		return new ResponseEntity<>(apiError, HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/**
	 * Handle URISyntaxException.
	 */
	@ExceptionHandler(URISyntaxException.class)
	public ResponseEntity<ApiError> handleURISyntaxException(URISyntaxException ex, WebRequest request) {
		log.error("URI syntax error: {}", ex.getMessage(), ex);
		ApiError apiError = new ApiError(
			HttpStatus.BAD_REQUEST,
			"Invalid URI format",
			ex.getMessage()
		);
		return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
	}

	/**
	 * Handle MissingServletRequestParameterException.
	 */
	@ExceptionHandler(MissingServletRequestParameterException.class)
	public ResponseEntity<ApiError> handleMissingServletRequestParameter(
			MissingServletRequestParameterException ex, WebRequest request) {
		log.error("Missing request parameter: {}", ex.getParameterName(), ex);
		String error = String.format("Required parameter '%s' is missing", ex.getParameterName());
		ApiError apiError = new ApiError(HttpStatus.BAD_REQUEST, error, ex.getMessage());
		return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
	}

	/**
	 * Handle DataIntegrityViolationException.
	 */
	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<ApiError> handleDataIntegrityViolation(
			DataIntegrityViolationException ex, WebRequest request) {
		log.error("Data integrity violation: {}", ex.getMessage(), ex);
		Throwable rootCause = ExceptionUtil.findRootCause(ex);
		ApiError apiError = new ApiError(
			HttpStatus.CONFLICT,
			"Data integrity constraint violation",
			rootCause.getMessage()
		);
		return new ResponseEntity<>(apiError, HttpStatus.CONFLICT);
	}

	/**
	 * Handle EmptyResultDataAccessException.
	 */
	@ExceptionHandler(EmptyResultDataAccessException.class)
	public ResponseEntity<ApiError> handleEmptyResultDataAccess(
			EmptyResultDataAccessException ex, WebRequest request) {
		log.error("No data found: {}", ex.getMessage(), ex);
		ApiError apiError = new ApiError(
			HttpStatus.NOT_FOUND,
			"Requested resource not found",
			ex.getMessage()
		);
		return new ResponseEntity<>(apiError, HttpStatus.NOT_FOUND);
	}

	/**
	 * Handle DataAccessException.
	 */
	@ExceptionHandler(DataAccessException.class)
	public ResponseEntity<ApiError> handleDataAccessException(DataAccessException ex, WebRequest request) {
		log.error("Database access error: {}", ex.getMessage(), ex);
		Throwable rootCause = ExceptionUtil.findRootCause(ex);
		ApiError apiError = new ApiError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			"Database operation failed",
			rootCause.getMessage()
		);
		return new ResponseEntity<>(apiError, HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/**
	 * Handle IllegalArgumentException.
	 */
	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiError> handleIllegalArgumentException(IllegalArgumentException ex, WebRequest request) {
		log.error("Illegal argument: {}", ex.getMessage(), ex);
		ApiError apiError = new ApiError(
			HttpStatus.BAD_REQUEST,
			ex.getMessage(),
			"Invalid argument provided"
		);
		return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
	}

	/**
	 * Handle MethodArgumentTypeMismatchException.
	 */
	@ExceptionHandler(MethodArgumentTypeMismatchException.class)
	public ResponseEntity<ApiError> handleMethodArgumentTypeMismatch(
			MethodArgumentTypeMismatchException ex, WebRequest request) {
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
			"Null pointer error: " + (rootCause.getMessage() != null ? rootCause.getMessage() : "No details available")
		);
		return new ResponseEntity<>(apiError, HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/**
	 * Handle all other exceptions.
	 */
	@ExceptionHandler(Exception.class)
	public ResponseEntity<Object> handleGlobalException(Exception ex, WebRequest request) {
		log.error("Unexpected error in schema registry operation: {}", ex.getMessage(), ex);
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

