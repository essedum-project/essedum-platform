package com.lfn.icip.adapter.rest.exception;

import java.io.IOException;
import java.net.URISyntaxException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.sql.SQLException;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;

import org.apache.commons.codec.DecoderException;
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
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import com.lfn.ai.comm.lib.util.exceptions.ApiError;
import com.lfn.ai.comm.lib.util.exceptions.ExceptionUtil;

import lombok.extern.log4j.Log4j2;

/**
 * Global exception handler for Adapter Controllers.
 * Handles ICIPAdaptersController and ICIPAdaptersV1Controller exceptions.
 *
 * @author essedum
 */
@ControllerAdvice(basePackages = "com.lfn.icip.adapter.rest")
@Log4j2
public class AdapterGlobalExceptionHandler {

	/**
	 * Handle AdapterException.
	 */
	@ExceptionHandler(AdapterException.class)
	public ResponseEntity<Object> handleAdapterException(AdapterException ex, WebRequest request) {
		log.error("Adapter operation error: {}", ex.getMessage(), ex);
		Throwable rootCause = ExceptionUtil.findRootCause(ex);
		ApiError apiError = new ApiError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			rootCause.getMessage(),
			"Adapter operation failed"
		);
		return new ResponseEntity<>("There is an application error, please contact the application admin",
				new HttpHeaders(), apiError.getStatus());
	}

	/**
	 * Handle security-related exceptions.
	 */
	@ExceptionHandler({
		InvalidKeyException.class,
		NoSuchAlgorithmException.class,
		NoSuchPaddingException.class,
		InvalidKeySpecException.class,
		InvalidAlgorithmParameterException.class,
		IllegalBlockSizeException.class,
		BadPaddingException.class
	})
	public ResponseEntity<Object> handleSecurityException(Exception ex, WebRequest request) {
		log.error("Security error in adapter operation: {}", ex.getMessage(), ex);
		ApiError apiError = new ApiError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			"Encryption/Decryption operation failed",
			ex.getMessage()
		);
		return new ResponseEntity<>("There is an application error, please contact the application admin",
				new HttpHeaders(), apiError.getStatus());
	}

	/**
	 * Handle KeyManagementException and KeyStoreException.
	 */
	@ExceptionHandler({KeyManagementException.class, KeyStoreException.class})
	public ResponseEntity<Object> handleKeyException(Exception ex, WebRequest request) {
		log.error("Key management error: {}", ex.getMessage(), ex);
		ApiError apiError = new ApiError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			"Key management operation failed",
			ex.getMessage()
		);
		return new ResponseEntity<>("There is an application error, please contact the application admin",
				new HttpHeaders(), apiError.getStatus());
	}

	/**
	 * Handle SQLException.
	 */
	@ExceptionHandler(SQLException.class)
	public ResponseEntity<Object> handleSQLException(SQLException ex, WebRequest request) {
		log.error("SQL error in adapter operation: {}", ex.getMessage(), ex);
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
	 * Handle ClassNotFoundException.
	 */
	@ExceptionHandler(ClassNotFoundException.class)
	public ResponseEntity<Object> handleClassNotFoundException(ClassNotFoundException ex, WebRequest request) {
		log.error("Class not found: {}", ex.getMessage(), ex);
		ApiError apiError = new ApiError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			"Required class not found",
			ex.getMessage()
		);
		return new ResponseEntity<>("There is an application error, please contact the application admin",
				new HttpHeaders(), apiError.getStatus());
	}

	/**
	 * Handle DecoderException.
	 */
	@ExceptionHandler(DecoderException.class)
	public ResponseEntity<Object> handleDecoderException(DecoderException ex, WebRequest request) {
		log.error("Decoding error: {}", ex.getMessage(), ex);
		ApiError apiError = new ApiError(
			HttpStatus.BAD_REQUEST,
			"Failed to decode data",
			ex.getMessage()
		);
		return new ResponseEntity<>("There is an application error, please contact the application admin",
				new HttpHeaders(), apiError.getStatus());
	}

	/**
	 * Handle IOException.
	 */
	@ExceptionHandler(IOException.class)
	public ResponseEntity<Object> handleIOException(IOException ex, WebRequest request) {
		log.error("IO error in adapter operation: {}", ex.getMessage(), ex);
		ApiError apiError = new ApiError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			"IO operation failed",
			ex.getMessage()
		);
		return new ResponseEntity<>("There is an application error, please contact the application admin",
				new HttpHeaders(), apiError.getStatus());
	}

	/**
	 * Handle URISyntaxException.
	 */
	@ExceptionHandler(URISyntaxException.class)
	public ResponseEntity<Object> handleURISyntaxException(URISyntaxException ex, WebRequest request) {
		log.error("URI syntax error: {}", ex.getMessage(), ex);
		ApiError apiError = new ApiError(
			HttpStatus.BAD_REQUEST,
			"Invalid URI format",
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
	 * Handle MaxUploadSizeExceededException.
	 */
	@ExceptionHandler(MaxUploadSizeExceededException.class)
	public ResponseEntity<Object> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException ex, WebRequest request) {
		log.error("File upload size exceeded: {}", ex.getMessage(), ex);
		ApiError apiError = new ApiError(
			HttpStatus.PAYLOAD_TOO_LARGE,
			"File size exceeds maximum allowed limit",
			ex.getMessage()
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
		log.error("Unexpected error in adapter operation: {}", ex.getMessage(), ex);
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

