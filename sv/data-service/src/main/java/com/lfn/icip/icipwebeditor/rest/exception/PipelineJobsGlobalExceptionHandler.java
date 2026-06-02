package com.lfn.icip.icipwebeditor.rest.exception;

import java.awt.image.ImagingOpException;
import java.io.IOException;
import java.sql.SQLException;

import javax.imageio.IIOException;

import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.api.errors.InvalidRemoteException;
import org.eclipse.jgit.api.errors.TransportException;
import org.json.JSONException;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.TransactionException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import com.lfn.ai.comm.lib.util.exceptions.ApiError;
import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.ai.comm.lib.util.exceptions.ExceptionUtil;

import lombok.extern.log4j.Log4j2;

/**
 * Global exception handler for Pipeline, Jobs, and Streaming Services Controllers.
 * Handles ICIPPipelineNewController, ICIPJobsController, and ICIPStreamingServicesController exceptions.
 *
 * @author essedum
 */
@ControllerAdvice(basePackages = "com.lfn.icip.icipwebeditor.rest")
@Log4j2
public class PipelineJobsGlobalExceptionHandler {

	/**
	 * Handle PipelineException.
	 */
	@ExceptionHandler(PipelineException.class)
	public ResponseEntity<Object> handlePipelineException(PipelineException ex, WebRequest request) {
		log.error("Pipeline operation error: {}", ex.getMessage(), ex);
		Throwable rootCause = ExceptionUtil.findRootCause(ex);
		ApiError apiError = new ApiError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			rootCause.getMessage(),
			"Pipeline operation failed"
		);
		return new ResponseEntity<>("There is an application error, please contact the application admin",
				new HttpHeaders(), apiError.getStatus());
	}

	/**
	 * Handle JobException.
	 */
	@ExceptionHandler(JobException.class)
	public ResponseEntity<Object> handleJobException(JobException ex, WebRequest request) {
		log.error("Job operation error: {}", ex.getMessage(), ex);
		Throwable rootCause = ExceptionUtil.findRootCause(ex);
		ApiError apiError = new ApiError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			rootCause.getMessage(),
			"Job operation failed"
		);
		return new ResponseEntity<>("There is an application error, please contact the application admin",
				new HttpHeaders(), apiError.getStatus());
	}

	/**
	 * Handle StreamingServiceException.
	 */
	@ExceptionHandler(StreamingServiceException.class)
	public ResponseEntity<Object> handleStreamingServiceException(StreamingServiceException ex, WebRequest request) {
		log.error("Streaming service operation error: {}", ex.getMessage(), ex);
		Throwable rootCause = ExceptionUtil.findRootCause(ex);
		ApiError apiError = new ApiError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			rootCause.getMessage(),
			"Streaming service operation failed"
		);
		return new ResponseEntity<>("There is an application error, please contact the application admin",
				new HttpHeaders(), apiError.getStatus());
	}

	/**
	 * Handle EssedumException.
	 */
	@ExceptionHandler(EssedumException.class)
	public ResponseEntity<Object> handleEssedumException(EssedumException ex, WebRequest request) {
		log.error("Essedum application error: {}", ex.getMessage(), ex);
		Throwable rootCause = ExceptionUtil.findRootCause(ex);
		ApiError apiError = new ApiError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			rootCause.getMessage(),
			"Application error occurred"
		);
		return new ResponseEntity<>("There is an application error, please contact the application admin",
				new HttpHeaders(), apiError.getStatus());
	}

	/**
	 * Handle SQLException.
	 */
	@ExceptionHandler(SQLException.class)
	public ResponseEntity<Object> handleSQLException(SQLException ex, WebRequest request) {
		log.error("SQL error in pipeline/job operation: {}", ex.getMessage(), ex);
		Throwable rootCause = ExceptionUtil.findRootCause(ex);
		ApiError apiError = new ApiError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			"Database operation failed",
			rootCause.getMessage()
		);
		return new ResponseEntity<>("There is an application error, please contact the application admin",
				new HttpHeaders(), apiError.getStatus());
	}

	/**
	 * Handle Git-related exceptions.
	 */
	@ExceptionHandler({InvalidRemoteException.class, TransportException.class, GitAPIException.class})
	public ResponseEntity<Object> handleGitException(Exception ex, WebRequest request) {
		log.error("Git operation error: {}", ex.getMessage(), ex);
		ApiError apiError = new ApiError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			"Git operation failed",
			ex.getMessage()
		);
		return new ResponseEntity<>("There is an application error, please contact the application admin",
				new HttpHeaders(), apiError.getStatus());
	}

	/**
	 * Handle IOException and IIOException.
	 */
	@ExceptionHandler({IOException.class, IIOException.class})
	public ResponseEntity<Object> handleIOException(IOException ex, WebRequest request) {
		log.error("IO error in pipeline/job operation: {}", ex.getMessage(), ex);
		ApiError apiError = new ApiError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			"IO operation failed",
			ex.getMessage()
		);
		return new ResponseEntity<>("There is an application error, please contact the application admin",
				new HttpHeaders(), apiError.getStatus());
	}

	/**
	 * Handle ImagingOpException (for image processing in jobs).
	 */
	@ExceptionHandler(ImagingOpException.class)
	public ResponseEntity<Object> handleImagingOpException(ImagingOpException ex, WebRequest request) {
		log.error("Image processing error: {}", ex.getMessage(), ex);
		ApiError apiError = new ApiError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			"Image processing failed",
			ex.getMessage()
		);
		return new ResponseEntity<>("There is an application error, please contact the application admin",
				new HttpHeaders(), apiError.getStatus());
	}

	/**
	 * Handle JSONException.
	 */
	@ExceptionHandler(JSONException.class)
	public ResponseEntity<Object> handleJSONException(JSONException ex, WebRequest request) {
		log.error("JSON parsing error: {}", ex.getMessage(), ex);
		ApiError apiError = new ApiError(
			HttpStatus.BAD_REQUEST,
			"Invalid JSON format",
			ex.getMessage()
		);
		return new ResponseEntity<>("There is an application error, please contact the application admin",
				new HttpHeaders(), apiError.getStatus());
	}

	/**
	 * Handle TransactionException.
	 */
	@ExceptionHandler(TransactionException.class)
	public ResponseEntity<Object> handleTransactionException(TransactionException ex, WebRequest request) {
		log.error("Transaction error: {}", ex.getMessage(), ex);
		Throwable rootCause = ExceptionUtil.findRootCause(ex);
		ApiError apiError = new ApiError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			"Transaction operation failed",
			rootCause.getMessage()
		);
		return new ResponseEntity<>("There is an application error, please contact the application admin",
				new HttpHeaders(), apiError.getStatus());
	}

	/**
	 * Handle DataAccessException.
	 */
	@ExceptionHandler(DataAccessException.class)
	public ResponseEntity<Object> handleDataAccessException(DataAccessException ex, WebRequest request) {
		log.error("Database access error: {}", ex.getMessage(), ex);
		Throwable rootCause = ExceptionUtil.findRootCause(ex);
		ApiError apiError = new ApiError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			"Database operation failed",
			rootCause.getMessage()
		);
		return new ResponseEntity<>("There is an application error, please contact the application admin",
				new HttpHeaders(), apiError.getStatus());
	}

	/**
	 * Handle MissingServletRequestParameterException.
	 */
	@ExceptionHandler(MissingServletRequestParameterException.class)
	public ResponseEntity<Object> handleMissingServletRequestParameter(
			MissingServletRequestParameterException ex, WebRequest request) {
		log.error("Missing request parameter: {}", ex.getParameterName(), ex);
		String error = String.format("Required parameter '%s' is missing", ex.getParameterName());
		ApiError apiError = new ApiError(HttpStatus.BAD_REQUEST, error, ex.getMessage());
		return new ResponseEntity<>("There is an application error, please contact the application admin",
				new HttpHeaders(), apiError.getStatus());
	}

	/**
	 * Handle MethodArgumentTypeMismatchException.
	 */
	@ExceptionHandler(MethodArgumentTypeMismatchException.class)
	public ResponseEntity<Object> handleMethodArgumentTypeMismatch(
			MethodArgumentTypeMismatchException ex, WebRequest request) {
		log.error("Method argument type mismatch: {}", ex.getMessage(), ex);
		String error = String.format("Parameter '%s' should be of type %s",
			ex.getName(),
			ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown");
		ApiError apiError = new ApiError(HttpStatus.BAD_REQUEST, error, ex.getMessage());
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
			"Invalid argument provided"
		);
		return new ResponseEntity<>("There is an application error, please contact the application admin",
				new HttpHeaders(), apiError.getStatus());
	}

	/**
	 * Handle NumberFormatException.
	 */
	@ExceptionHandler(NumberFormatException.class)
	public ResponseEntity<Object> handleNumberFormatException(NumberFormatException ex, WebRequest request) {
		log.error("Number format error: {}", ex.getMessage(), ex);
		ApiError apiError = new ApiError(
			HttpStatus.BAD_REQUEST,
			"Invalid number format",
			ex.getMessage()
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
		log.error("Unexpected error in pipeline/job operation: {}", ex.getMessage(), ex);
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

