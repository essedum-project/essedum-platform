package com.lfn.icip.icipwebeditor.rest.exception;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.lfn.ai.comm.lib.util.exceptions.ExceptionUtil;
import jakarta.transaction.TransactionalException;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.log4j.Log4j2;
import org.json.JSONException;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.net.URISyntaxException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Global exception handler for Agent Directory Controller and Deployment Form Controller.
 * Provides detailed error responses with status codes, descriptions, and suggested actions.
 *
 * @author essedum
 */
@RestControllerAdvice(assignableTypes = {
		com.lfn.icip.icipwebeditor.rest.ICIPAgentDirectoryController.class,
		com.lfn.icip.icipwebeditor.rest.DeploymentFormController.class
})
@Log4j2
public class AgentDirectoryGlobalExceptionHandler {

	/**
	 * Build error response with all details.
	 */
	private ErrorResponse buildErrorResponse(HttpStatus status, String message, String details,
			String exception, WebRequest request) {
		return ErrorResponse.builder()
				.timestamp(LocalDateTime.now())
				.status(status.value())
				.error(status.getReasonPhrase())
				.message(message)
				.details(details)
				.path(request.getDescription(false).replace("uri=", ""))
				.exception(exception)
				.build();
	}

	/**
	 * Handle AgentDirectoryException.
	 */
	@ExceptionHandler(AgentDirectoryException.class)
	public ResponseEntity<ErrorResponse> handleAgentDirectoryException(
			AgentDirectoryException ex, WebRequest request) {
		log.error("Agent directory operation error: {}", ex.getMessage(), ex);
		Throwable rootCause = ExceptionUtil.findRootCause(ex);

		ErrorResponse errorResponse = buildErrorResponse(
				HttpStatus.INTERNAL_SERVER_ERROR,
				"An unexpected error occurred while processing agent directory operation",
				rootCause.getMessage() != null ? rootCause.getMessage() : ex.getMessage(),
				"AgentDirectoryException",
				request
		);

		return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/**
	 * Handle IllegalArgumentException for validation errors.
	 */
	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleIllegalArgumentException(
			IllegalArgumentException ex, WebRequest request) {
		log.error("Validation error in agent directory: {}", ex.getMessage(), ex);

		ErrorResponse errorResponse = buildErrorResponse(
				HttpStatus.BAD_REQUEST,
				"Validation failed for agent directory operation",
				ex.getMessage(),
				"IllegalArgumentException",
				request
		);

		return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
	}

	/**
	 * Handle URISyntaxException.
	 */
	@ExceptionHandler(URISyntaxException.class)
	public ResponseEntity<ErrorResponse> handleURISyntaxException(
			URISyntaxException ex, WebRequest request) {
		log.error("URI syntax error in agent directory: {}", ex.getMessage(), ex);

		ErrorResponse errorResponse = buildErrorResponse(
				HttpStatus.BAD_REQUEST,
				"Invalid URI format in agent directory operation",
				ex.getMessage(),
				"URISyntaxException",
				request
		);

		return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
	}

	/**
	 * Handle EmptyResultDataAccessException when agent directory not found.
	 */
	@ExceptionHandler(EmptyResultDataAccessException.class)
	public ResponseEntity<ErrorResponse> handleEmptyResultDataAccess(
			EmptyResultDataAccessException ex, WebRequest request) {
		log.error("Agent directory not found: {}", ex.getMessage(), ex);

		ErrorResponse errorResponse = buildErrorResponse(
				HttpStatus.NOT_FOUND,
				"Agent directory not found",
				"No agent directory entry found matching the specified criteria",
				"EmptyResultDataAccessException",
				request
		);

		return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
	}

	/**
	 * Handle JSONException.
	 */
	@ExceptionHandler(JSONException.class)
	public ResponseEntity<ErrorResponse> handleJSONException(JSONException ex, WebRequest request) {
		log.error("JSON processing error in agent directory: {}", ex.getMessage(), ex);

		ErrorResponse errorResponse = buildErrorResponse(
				HttpStatus.BAD_REQUEST,
				"Invalid JSON format in request",
				ex.getMessage(),
				"JSONException",
				request
		);

		return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
	}

	/**
	 * Handle JsonProcessingException.
	 */
	@ExceptionHandler(JsonProcessingException.class)
	public ResponseEntity<ErrorResponse> handleJsonProcessingException(
			JsonProcessingException ex, WebRequest request) {
		log.error("JSON processing error: {}", ex.getMessage(), ex);

		ErrorResponse errorResponse = buildErrorResponse(
				HttpStatus.BAD_REQUEST,
				"Failed to process JSON data",
				ex.getOriginalMessage(),
				"JsonProcessingException",
				request
		);

		return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
	}

	/**
	 * Handle TransactionalException.
	 */
	@ExceptionHandler(TransactionalException.class)
	public ResponseEntity<ErrorResponse> handleTransactionalException(
			TransactionalException ex, WebRequest request) {
		log.error("Transaction error in agent directory operation: {}", ex.getMessage(), ex);
		Throwable rootCause = ExceptionUtil.findRootCause(ex);

		ErrorResponse errorResponse = buildErrorResponse(
				HttpStatus.INTERNAL_SERVER_ERROR,
				"Transaction operation failed for agent directory",
				rootCause.getMessage() != null ? rootCause.getMessage() : "Database transaction could not be completed",
				"TransactionalException",
				request
		);

		return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/**
	 * Handle DataAccessException.
	 */
	@ExceptionHandler(DataAccessException.class)
	public ResponseEntity<ErrorResponse> handleDataAccessException(
			DataAccessException ex, WebRequest request) {
		log.error("Database access error in agent directory: {}", ex.getMessage(), ex);
		Throwable rootCause = ExceptionUtil.findRootCause(ex);

		String details = rootCause.getMessage() != null ? rootCause.getMessage() : "Database operation failed";

		ErrorResponse errorResponse = buildErrorResponse(
				HttpStatus.INTERNAL_SERVER_ERROR,
				"Database operation failed",
				details,
				"DataAccessException",
				request
		);

		return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/**
	 * Handle MissingServletRequestParameterException.
	 */
	@ExceptionHandler(MissingServletRequestParameterException.class)
	public ResponseEntity<ErrorResponse> handleMissingServletRequestParameter(
			MissingServletRequestParameterException ex, WebRequest request) {
		log.error("Missing request parameter: {}", ex.getParameterName(), ex);

		String paramName = ex.getParameterName();
		String paramType = ex.getParameterType();
		String details = String.format("Required parameter '%s' of type '%s' is missing from the request",
				paramName, paramType);

		ErrorResponse errorResponse = buildErrorResponse(
				HttpStatus.BAD_REQUEST,
				"Missing required request parameter",
				details,
				"MissingServletRequestParameterException",
				request
		);

		return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
	}

	/**
	 * Handle MethodArgumentTypeMismatchException.
	 */
	@ExceptionHandler(MethodArgumentTypeMismatchException.class)
	public ResponseEntity<ErrorResponse> handleMethodArgumentTypeMismatch(
			MethodArgumentTypeMismatchException ex, WebRequest request) {
		log.error("Method argument type mismatch: {}", ex.getMessage(), ex);

		String paramName = ex.getName();
		String requiredType = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown";
		String providedValue = ex.getValue() != null ? ex.getValue().toString() : "null";

		String details = String.format("Parameter '%s' with value '%s' could not be converted to type '%s'",
				paramName, providedValue, requiredType);

		ErrorResponse errorResponse = buildErrorResponse(
				HttpStatus.BAD_REQUEST,
				"Invalid parameter type",
				details,
				"MethodArgumentTypeMismatchException",
				request
		);

		return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
	}

	/**
	 * Handle NumberFormatException.
	 */
	@ExceptionHandler(NumberFormatException.class)
	public ResponseEntity<ErrorResponse> handleNumberFormatException(
			NumberFormatException ex, WebRequest request) {
		log.error("Number format error in agent directory: {}", ex.getMessage(), ex);

		ErrorResponse errorResponse = buildErrorResponse(
				HttpStatus.BAD_REQUEST,
				"Invalid number format in pagination parameters",
				ex.getMessage(),
				"NumberFormatException",
				request
		);

		return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
	}

	/**
	 * Handle NullPointerException.
	 */
	@ExceptionHandler(NullPointerException.class)
	public ResponseEntity<ErrorResponse> handleNullPointerException(
			NullPointerException ex, WebRequest request) {
		log.error("Null pointer exception in agent directory: {}", ex.getMessage(), ex);
		Throwable rootCause = ExceptionUtil.findRootCause(ex);

		String details = rootCause.getMessage() != null ? rootCause.getMessage() :
				"A required data field was null or missing";

		ErrorResponse errorResponse = buildErrorResponse(
				HttpStatus.INTERNAL_SERVER_ERROR,
				"Required data not found",
				details,
				"NullPointerException",
				request
		);

		return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/**
	 * Handle MethodArgumentNotValidException for @Valid annotation.
	 * Triggered when bean validation fails on request body.
	 */
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(
			MethodArgumentNotValidException ex, WebRequest request) {
		log.error("Bean validation failed: {}", ex.getMessage(), ex);

		// Collect all field errors
		Map<String, String> fieldErrors = new HashMap<>();
		ex.getBindingResult().getAllErrors().forEach(error -> {
			String fieldName = ((FieldError) error).getField();
			String errorMessage = error.getDefaultMessage();
			fieldErrors.put(fieldName, errorMessage);
		});

		// Build a detailed message
		String details = fieldErrors.entrySet().stream()
				.map(entry -> entry.getKey() + ": " + entry.getValue())
				.collect(Collectors.joining(", "));

		ErrorResponse errorResponse = ErrorResponse.builder()
				.timestamp(LocalDateTime.now())
				.status(HttpStatus.BAD_REQUEST.value())
				.error(HttpStatus.BAD_REQUEST.getReasonPhrase())
				.message("Validation failed for request body")
				.details(details)
				.path(request.getDescription(false).replace("uri=", ""))
				.exception("MethodArgumentNotValidException")
				.context("Field validation errors: " + fieldErrors.size())
				.build();

		return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
	}

	/**
	 * Handle ConstraintViolationException for @Validated on controller level.
	 */
	@ExceptionHandler(ConstraintViolationException.class)
	public ResponseEntity<ErrorResponse> handleConstraintViolation(
			ConstraintViolationException ex, WebRequest request) {
		log.error("Constraint violation: {}", ex.getMessage(), ex);

		// Collect all constraint violations
		String details = ex.getConstraintViolations().stream()
				.map(violation -> violation.getPropertyPath() + ": " + violation.getMessage())
				.collect(Collectors.joining(", "));

		ErrorResponse errorResponse = buildErrorResponse(
				HttpStatus.BAD_REQUEST,
				"Validation constraint violated",
				details,
				"ConstraintViolationException",
				request
		);

		return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
	}

	/**
	 * Handle all other exceptions.
	 */
	@ExceptionHandler(Exception.class)
	public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex, WebRequest request) {
		log.error("Unexpected error in agent directory operation: {}", ex.getMessage(), ex);
		Throwable rootCause = ExceptionUtil.findRootCause(ex);

		ErrorResponse errorResponse = buildErrorResponse(
				HttpStatus.INTERNAL_SERVER_ERROR,
				"An unexpected error occurred while processing your request",
				rootCause.getMessage() != null ? rootCause.getMessage() : ex.getMessage(),
				ex.getClass().getSimpleName(),
				request
		);

		return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
	}
}
