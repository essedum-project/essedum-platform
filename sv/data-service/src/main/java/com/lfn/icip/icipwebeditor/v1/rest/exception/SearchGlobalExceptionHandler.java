package com.lfn.icip.icipwebeditor.v1.rest.exception;

import java.io.IOException;

import org.json.JSONException;
import org.springframework.dao.DataAccessException;
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
 * Global exception handler for Search controllers.
 * Handles ICIPSearchableController and ICIPRelatedComponentsController exceptions.
 *
 * @author essedum
 */
@ControllerAdvice(basePackages = "com.lfn.icip.icipwebeditor.v1.rest")
@Log4j2
public class SearchGlobalExceptionHandler {

	/**
	 * Handle SearchException.
	 */
	@ExceptionHandler(SearchException.class)
	public ResponseEntity<ApiError> handleSearchException(SearchException ex, WebRequest request) {
		log.error("Search operation error: {}", ex.getMessage(), ex);
		Throwable rootCause = ExceptionUtil.findRootCause(ex);
		ApiError apiError = new ApiError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			rootCause.getMessage(),
			"Search operation failed: " + ex.getMessage()
		);
		return new ResponseEntity<>(apiError, HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/**
	 * Handle missing request parameters.
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
	 * Handle JSON exceptions.
	 */
	@ExceptionHandler(JSONException.class)
	public ResponseEntity<ApiError> handleJSONException(JSONException ex, WebRequest request) {
		log.error("JSON parsing error: {}", ex.getMessage(), ex);
		ApiError apiError = new ApiError(
			HttpStatus.BAD_REQUEST,
			"Invalid JSON format",
			"Failed to parse JSON: " + ex.getMessage()
		);
		return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
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
			"Invalid argument provided for search operation"
		);
		return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
	}

	/**
	 * Handle NumberFormatException.
	 */
	@ExceptionHandler(NumberFormatException.class)
	public ResponseEntity<ApiError> handleNumberFormatException(NumberFormatException ex, WebRequest request) {
		log.error("Number format error: {}", ex.getMessage(), ex);
		ApiError apiError = new ApiError(
			HttpStatus.BAD_REQUEST,
			"Invalid number format",
			"Expected a valid number: " + ex.getMessage()
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
	 * Handle IOException.
	 */
	@ExceptionHandler(IOException.class)
	public ResponseEntity<ApiError> handleIOException(IOException ex, WebRequest request) {
		log.error("IO error in search operation: {}", ex.getMessage(), ex);
		ApiError apiError = new ApiError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			ex.getMessage(),
			"IO operation failed during search"
		);
		return new ResponseEntity<>(apiError, HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/**
	 * Handle all other exceptions.
	 */
	@ExceptionHandler(Exception.class)
	public ResponseEntity<Object> handleGlobalException(Exception ex, WebRequest request) {
		log.error("Unexpected error in search operation: {}", ex.getMessage(), ex);
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

