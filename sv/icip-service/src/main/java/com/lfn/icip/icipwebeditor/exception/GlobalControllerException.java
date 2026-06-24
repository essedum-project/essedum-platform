package com.lfn.icip.icipwebeditor.exception;

import com.lfn.icip.icipwebeditor.model.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.io.IOException;
import java.util.Map;

@RestControllerAdvice
public class GlobalControllerException {

	private static final Logger logger = LoggerFactory.getLogger(GlobalControllerException.class);

	@ExceptionHandler(AddRuntimeException.class)
	public ResponseEntity<?> handleAddRuntimeException(AddRuntimeException ex) {
		logger.error("AddRuntimeException: {}", ex.getMessage(), ex);
		return new ResponseEntity<>(Map.of("Error Message", "Runtime operation failed"), HttpStatus.BAD_REQUEST);
	}

	@ExceptionHandler(RuntimePortsNotSavedException.class)
	public ResponseEntity<?> handleRuntimePortsNotSavedException(RuntimePortsNotSavedException ex) {
		logger.error("RuntimePortsNotSavedException: {}", ex.getMessage(), ex);
		return new ResponseEntity<>(Map.of("Error Message", "Runtime port configuration failed"), HttpStatus.BAD_REQUEST);
	}

	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<?> handleResourceNotFoundException(ResourceNotFoundException ex) {
		logger.error("ResourceNotFoundException: {}", ex.getMessage(), ex);
		return new ResponseEntity<>(Map.of("Error Message", "Resource not found"), HttpStatus.NOT_FOUND);
	}

	@ExceptionHandler(NoUnassignedPortFoundException.class)
	public ResponseEntity<?> handleNoUnassignedPortFoundException(NoUnassignedPortFoundException ex) {
		logger.error("NoUnassignedPortFoundException: {}", ex.getMessage(), ex);
		return new ResponseEntity<>(Map.of("Error Message", "No unassigned port found"), HttpStatus.NOT_FOUND);
	}

	@ExceptionHandler(RuntimeListNotFoundException.class)
	public ResponseEntity<?> handleRuntimeListNotFoundException(RuntimeListNotFoundException ex) {
		logger.error("RuntimeListNotFoundException: {}", ex.getMessage(), ex);
		return new ResponseEntity<>(Map.of("Error Message", "Runtime list not found"), HttpStatus.NOT_FOUND);
	}

	@ExceptionHandler(NullPointerException.class)
	public ResponseEntity<?> handleNullPointerException(NullPointerException ex) {
		logger.error("NullPointerException: {}", ex.getMessage(), ex);
		return new ResponseEntity<>(Map.of("Error Message", "An internal error occurred"), HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/**
	 * Handle file upload exceptions.
	 *
	 * @param ex the exception
	 * @param request the web request
	 * @return the error response
	 */
	@ExceptionHandler(FileUploadException.class)
	public ResponseEntity<ErrorResponse> handleFileUploadException(FileUploadException ex, WebRequest request) {
		logger.error("File upload failed: {}", ex.getMessage(), ex);

		ErrorResponse errorResponse = new ErrorResponse(
				HttpStatus.BAD_REQUEST.value(),
				"File Upload Failed",
				"File upload operation failed",
				null,
				request.getDescription(false).replace("uri=", "")
		);
		errorResponse.setException(ex.getClass().getSimpleName());
		errorResponse.setSuggestedAction("Verify that the file is a valid ZIP file and not corrupted. Ensure the file contains valid AI agent scripts.");

		return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
	}

	/**
	 * Handle invalid request exceptions.
	 *
	 * @param ex the exception
	 * @param request the web request
	 * @return the error response
	 */
	@ExceptionHandler(InvalidRequestException.class)
	public ResponseEntity<ErrorResponse> handleInvalidRequestException(InvalidRequestException ex, WebRequest request) {
		logger.error("Invalid request: {}", ex.getMessage(), ex);

		ErrorResponse errorResponse = new ErrorResponse(
				HttpStatus.BAD_REQUEST.value(),
				"Invalid Request",
				"Invalid request parameters",
				null,
				request.getDescription(false).replace("uri=", "")
		);
		errorResponse.setException(ex.getClass().getSimpleName());
		errorResponse.setSuggestedAction("Check the request parameters. Ensure both cname and org are provided, and either zipFile or folderPath is specified.");

		return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
	}

	/**
	 * Handle datasource not found exceptions.
	 *
	 * @param ex the exception
	 * @param request the web request
	 * @return the error response
	 */
	@ExceptionHandler(DatasourceNotFoundException.class)
	public ResponseEntity<ErrorResponse> handleDatasourceNotFoundException(DatasourceNotFoundException ex, WebRequest request) {
		logger.error("Datasource not found: {}", ex.getMessage(), ex);

		ErrorResponse errorResponse = new ErrorResponse(
				HttpStatus.NOT_FOUND.value(),
				"Datasource Not Found",
				"Datasource not found",
				null,
				request.getDescription(false).replace("uri=", "")
		);
		errorResponse.setException(ex.getClass().getSimpleName());
		errorResponse.setSuggestedAction("Ensure the datasource is configured correctly in the system. Verify the type and alias parameters match an existing datasource configuration.");

		return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
	}

	/**
	 * Handle MinIO storage exceptions.
	 *
	 * @param ex the exception
	 * @param request the web request
	 * @return the error response
	 */
	@ExceptionHandler(MinIOStorageException.class)
	public ResponseEntity<ErrorResponse> handleMinIOStorageException(MinIOStorageException ex, WebRequest request) {
		logger.error("MinIO storage operation failed: {}", ex.getMessage(), ex);

		ErrorResponse errorResponse = new ErrorResponse(
				HttpStatus.INTERNAL_SERVER_ERROR.value(),
				"MinIO Storage Failed",
				"Storage operation failed",
				null,
				request.getDescription(false).replace("uri=", "")
		);
		errorResponse.setException(ex.getClass().getSimpleName());
		errorResponse.setSuggestedAction("Verify MinIO connection details (URL, access key, secret key). Ensure the bucket exists and you have write permissions. Check network connectivity to MinIO server.");

		return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/**
	 * Handle file deletion exceptions.
	 *
	 * @param ex the exception
	 * @param request the web request
	 * @return the error response
	 */
	@ExceptionHandler(FileDeletionException.class)
	public ResponseEntity<ErrorResponse> handleFileDeletionException(FileDeletionException ex, WebRequest request) {
		logger.error("File deletion failed: {}", ex.getMessage(), ex);

		ErrorResponse errorResponse = new ErrorResponse(
				HttpStatus.INTERNAL_SERVER_ERROR.value(),
				"File Deletion Failed",
				"File deletion operation failed",
				null,
				request.getDescription(false).replace("uri=", "")
		);
		errorResponse.setException(ex.getClass().getSimpleName());
		errorResponse.setSuggestedAction("Verify that the file exists and you have permission to delete it. Check if the file is being used by another process.");

		return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/**
	 * Handle data integrity violation exceptions (e.g., data too long for column).
	 *
	 * @param ex the exception
	 * @param request the web request
	 * @return the error response
	 */
	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<ErrorResponse> handleDataIntegrityViolationException(DataIntegrityViolationException ex, WebRequest request) {
		logger.error("Data integrity violation: {}", ex.getMessage(), ex);

		String message = "Database constraint violation occurred";
		String details = "An internal database error occurred";
		String suggestedAction = "Check database schema constraints";

		// Check for specific data truncation error
		if (details != null && details.contains("Data too long for column")) {
			message = "Data size exceeds database column limit";
			suggestedAction = "The data you're trying to save is too large for the database column. Consider increasing the column size or reducing the data size. For file paths, use object storage references instead of storing full file content.";
		}

		ErrorResponse errorResponse = new ErrorResponse(
				HttpStatus.BAD_REQUEST.value(),
				"Data Integrity Violation",
				message,
				details,
				request.getDescription(false).replace("uri=", "")
		);
		errorResponse.setException(ex.getClass().getSimpleName());
		errorResponse.setSuggestedAction(suggestedAction);

		return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
	}

	/**
	 * Handle max upload size exceeded exceptions.
	 *
	 * @param ex the exception
	 * @param request the web request
	 * @return the error response
	 */
	@ExceptionHandler(MaxUploadSizeExceededException.class)
	public ResponseEntity<ErrorResponse> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException ex, WebRequest request) {
		logger.error("File size exceeds maximum allowed size: {}", ex.getMessage());

		ErrorResponse errorResponse = new ErrorResponse(
				HttpStatus.PAYLOAD_TOO_LARGE.value(),
				"File Size Exceeds Limit",
				"The uploaded file is too large",
				"Maximum allowed file size has been exceeded",
				request.getDescription(false).replace("uri=", "")
		);
		errorResponse.setException(ex.getClass().getSimpleName());
		errorResponse.setSuggestedAction("Reduce the file size or increase the maximum upload size limit in application configuration (spring.servlet.multipart.max-file-size).");

		return new ResponseEntity<>(errorResponse, HttpStatus.PAYLOAD_TOO_LARGE);
	}

	/**
	 * Handle IO exceptions.
	 *
	 * @param ex the exception
	 * @param request the web request
	 * @return the error response
	 */
	@ExceptionHandler(IOException.class)
	public ResponseEntity<ErrorResponse> handleIOException(IOException ex, WebRequest request) {
		logger.error("I/O operation failed: {}", ex.getMessage(), ex);

		ErrorResponse errorResponse = new ErrorResponse(
				HttpStatus.INTERNAL_SERVER_ERROR.value(),
				"I/O Operation Failed",
				"An error occurred during file I/O operation",
				null,
				request.getDescription(false).replace("uri=", "")
		);
		errorResponse.setException(ex.getClass().getSimpleName());
		errorResponse.setSuggestedAction("Check file system permissions and disk space. Verify the file path is correct and accessible.");

		return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/**
	 * Handle HTTP request method not supported exceptions (405 Method Not Allowed).
	 *
	 * @param ex the exception
	 * @param request the web request
	 * @return the error response
	 */
	@ExceptionHandler(HttpRequestMethodNotSupportedException.class)
	public ResponseEntity<ErrorResponse> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex, WebRequest request) {
		logger.error("HTTP method not supported: {}", ex.getMessage());

		String supportedMethods = ex.getSupportedHttpMethods() != null
			? ex.getSupportedHttpMethods().toString()
			: "N/A";

		ErrorResponse errorResponse = new ErrorResponse(
				HttpStatus.METHOD_NOT_ALLOWED.value(),
				"Method Not Allowed",
				String.format("HTTP method '%s' is not supported for this endpoint", ex.getMethod()),
				String.format("Supported methods: %s", supportedMethods),
				request.getDescription(false).replace("uri=", "")
		);
		errorResponse.setException(ex.getClass().getSimpleName());
		errorResponse.setSuggestedAction(String.format("Use one of the supported HTTP methods: %s", supportedMethods));

		return new ResponseEntity<>(errorResponse, HttpStatus.METHOD_NOT_ALLOWED);
	}

	/**
	 * Handle no handler found exceptions (404 Not Found).
	 *
	 * @param ex the exception
	 * @param request the web request
	 * @return the error response
	 */
	@ExceptionHandler(NoHandlerFoundException.class)
	public ResponseEntity<ErrorResponse> handleNoHandlerFound(NoHandlerFoundException ex, WebRequest request) {
		logger.error("No handler found: {}", ex.getMessage());

		ErrorResponse errorResponse = new ErrorResponse(
				HttpStatus.NOT_FOUND.value(),
				"Endpoint Not Found",
				String.format("No endpoint found for %s %s", ex.getHttpMethod(), ex.getRequestURL()),
				"The requested URL does not exist",
				request.getDescription(false).replace("uri=", "")
		);
		errorResponse.setException(ex.getClass().getSimpleName());
		errorResponse.setSuggestedAction("Verify the URL path and HTTP method. Check the API documentation for available endpoints.");

		return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
	}

	/**
	 * Handle all other exceptions.
	 *
	 * @param ex the exception
	 * @param request the web request
	 * @return the error response
	 */
	@ExceptionHandler(Exception.class)
	public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex, WebRequest request) {
		logger.error("Unexpected error occurred: {}", ex.getMessage(), ex);

		ErrorResponse errorResponse = new ErrorResponse(
				HttpStatus.INTERNAL_SERVER_ERROR.value(),
				"Internal Server Error",
				"An unexpected error occurred while processing your request",
				null,
				request.getDescription(false).replace("uri=", "")
		);
		errorResponse.setException(ex.getClass().getSimpleName());
		errorResponse.setSuggestedAction("Please contact support with the error details if the problem persists.");

		return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/**
	 * Get the root cause message from an exception.
	 *
	 * @param ex the exception
	 * @return the cause message
	 */
	private String getCauseMessage(Throwable ex) {
		if (ex.getCause() != null) {
			return ex.getCause().getMessage();
		}
		return null;
	}

}
