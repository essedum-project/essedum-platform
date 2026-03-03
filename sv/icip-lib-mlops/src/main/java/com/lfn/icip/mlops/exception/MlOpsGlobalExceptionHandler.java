/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 * <p>
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * <p>
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * <p>
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

package com.lfn.icip.mlops.exception;

import com.lfn.icip.mlops.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.io.IOException;
import java.sql.SQLException;

/**
 * Global exception handler for MLOps REST API.
 * Handles all exceptions and provides detailed error responses.
 *
 * @author essedum
 */
@RestControllerAdvice(basePackages = "com.lfn.icip.mlops.rest")
public class MlOpsGlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(MlOpsGlobalExceptionHandler.class);

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
                ex.getMessage(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Verify all required parameters are provided and valid. Check the API documentation for correct parameter formats.");

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle resource not found exceptions.
     *
     * @param ex the exception
     * @param request the web request
     * @return the error response
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        logger.error("Resource not found: {}", ex.getMessage(), ex);

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Resource Not Found",
                ex.getMessage(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Verify the resource ID exists. Use the list endpoint to check available resources.");

        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    /**
     * Handle dataset operation exceptions.
     *
     * @param ex the exception
     * @param request the web request
     * @return the error response
     */
    @ExceptionHandler(DatasetOperationException.class)
    public ResponseEntity<ErrorResponse> handleDatasetOperationException(DatasetOperationException ex, WebRequest request) {
        logger.error("Dataset operation failed: {}", ex.getMessage(), ex);

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Dataset Operation Failed",
                ex.getMessage(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Verify dataset configuration and data source connectivity. Check dataset schema compatibility and data format.");

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handle model operation exceptions.
     *
     * @param ex the exception
     * @param request the web request
     * @return the error response
     */
    @ExceptionHandler(ModelOperationException.class)
    public ResponseEntity<ErrorResponse> handleModelOperationException(ModelOperationException ex, WebRequest request) {
        logger.error("Model operation failed: {}", ex.getMessage(), ex);

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Model Operation Failed",
                ex.getMessage(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Verify model configuration and artifacts. Check model registry connectivity and ensure model format is compatible.");

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handle endpoint operation exceptions.
     *
     * @param ex the exception
     * @param request the web request
     * @return the error response
     */
    @ExceptionHandler(EndpointOperationException.class)
    public ResponseEntity<ErrorResponse> handleEndpointOperationException(EndpointOperationException ex, WebRequest request) {
        logger.error("Endpoint operation failed: {}", ex.getMessage(), ex);

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Endpoint Operation Failed",
                ex.getMessage(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Verify endpoint configuration and connectivity. Ensure the endpoint service is running and accessible.");

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handle model deployment exceptions.
     *
     * @param ex the exception
     * @param request the web request
     * @return the error response
     */
    @ExceptionHandler(ModelDeploymentException.class)
    public ResponseEntity<ErrorResponse> handleModelDeploymentException(ModelDeploymentException ex, WebRequest request) {
        logger.error("Model deployment failed: {}", ex.getMessage(), ex);

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Model Deployment Failed",
                ex.getMessage(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Verify endpoint is available and properly configured. Check model compatibility with the target endpoint. Ensure sufficient resources are available.");

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handle model inference exceptions.
     *
     * @param ex the exception
     * @param request the web request
     * @return the error response
     */
    @ExceptionHandler(ModelInferenceException.class)
    public ResponseEntity<ErrorResponse> handleModelInferenceException(ModelInferenceException ex, WebRequest request) {
        logger.error("Model inference failed: {}", ex.getMessage(), ex);

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Model Inference Failed",
                ex.getMessage(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Verify input data format matches the model's expected schema. Check that all required features are provided with correct data types.");

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle data integrity violation exceptions.
     *
     * @param ex the exception
     * @param request the web request
     * @return the error response
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolationException(DataIntegrityViolationException ex, WebRequest request) {
        logger.error("Data integrity violation: {}", ex.getMessage(), ex);

        String message = "Database constraint violation occurred";
        String details = ex.getMostSpecificCause().getMessage();
        String suggestedAction = "Check database schema constraints and ensure data meets all requirements.";

        if (details != null && details.contains("Duplicate entry")) {
            message = "Resource with this identifier already exists";
            suggestedAction = "Use a unique identifier or update the existing resource instead.";
        } else if (details != null && details.contains("Data too long")) {
            message = "Data size exceeds column limit";
            suggestedAction = "Reduce the data size or contact administrator to increase column size limit.";
        }

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.CONFLICT.value(),
                "Data Integrity Violation",
                message,
                details,
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction(suggestedAction);

        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    /**
     * Handle SQL exceptions.
     *
     * @param ex the exception
     * @param request the web request
     * @return the error response
     */
    @ExceptionHandler(SQLException.class)
    public ResponseEntity<ErrorResponse> handleSQLException(SQLException ex, WebRequest request) {
        logger.error("Database error: {}", ex.getMessage(), ex);

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Database Error",
                "A database error occurred while processing your request",
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Contact support if this error persists. Check database connectivity and configuration.");

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
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
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Check file system permissions and disk space. Verify file paths are correct and accessible.");

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
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
        errorResponse.setSuggestedAction("Reduce the file size or contact administrator to increase upload size limit.");

        return new ResponseEntity<>(errorResponse, HttpStatus.PAYLOAD_TOO_LARGE);
    }

    /**
     * Handle missing request parameter exceptions.
     *
     * @param ex the exception
     * @param request the web request
     * @return the error response
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingServletRequestParameterException(
            MissingServletRequestParameterException ex, WebRequest request) {
        logger.error("Missing required parameter: {}", ex.getMessage());

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Missing Required Parameter",
                String.format("Required parameter '%s' is missing", ex.getParameterName()),
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction(String.format("Provide the required parameter '%s' of type %s",
                ex.getParameterName(), ex.getParameterType()));

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle method argument type mismatch exceptions.
     *
     * @param ex the exception
     * @param request the web request
     * @return the error response
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentTypeMismatchException(
            MethodArgumentTypeMismatchException ex, WebRequest request) {
        logger.error("Argument type mismatch: {}", ex.getMessage());

        String requiredType = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown";
        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Invalid Parameter Type",
                String.format("Parameter '%s' must be of type %s", ex.getName(), requiredType),
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction(String.format("Provide a valid %s value for parameter '%s'",
                requiredType, ex.getName()));

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle HTTP message not readable exceptions.
     *
     * @param ex the exception
     * @param request the web request
     * @return the error response
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadableException(
            HttpMessageNotReadableException ex, WebRequest request) {
        logger.error("Malformed JSON request: {}", ex.getMessage());

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Malformed Request",
                "Request body is not valid JSON",
                ex.getMostSpecificCause().getMessage(),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Verify the request body is valid JSON format. Check for syntax errors, missing commas, or incorrect data types.");

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle method argument not valid exceptions.
     *
     * @param ex the exception
     * @param request the web request
     * @return the error response
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValidException(
            MethodArgumentNotValidException ex, WebRequest request) {
        logger.error("Validation failed: {}", ex.getMessage());

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Validation Failed",
                "Request validation failed",
                null,
                request.getDescription(false).replace("uri=", "")
        );

        ex.getBindingResult().getFieldErrors().forEach(error ->
                errorResponse.addError(String.format("%s: %s", error.getField(), error.getDefaultMessage()))
        );

        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Fix the validation errors listed and resubmit the request.");

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
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
                ex.getMessage(),
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

