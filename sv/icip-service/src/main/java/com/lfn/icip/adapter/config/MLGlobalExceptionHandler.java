/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

package com.lfn.icip.adapter.config;

import com.lfn.icip.adapter.exception.MLErrorResponse;
import com.lfn.icip.adapter.exception.MLResourceNotFoundException;
import com.lfn.icip.adapter.exception.DuplicateMLResourceException;
import com.lfn.icip.adapter.exception.PortAllocationException;
import com.lfn.icip.icipwebeditor.exception.InvalidRequestException;
import com.lfn.icip.icipwebeditor.exception.FileUploadException;
import com.lfn.icip.icipwebeditor.exception.FileDeletionException;
import com.lfn.icip.icipwebeditor.exception.DatasourceNotFoundException;
import com.lfn.icip.icipwebeditor.exception.MinIOStorageException;
import com.lfn.icip.icipwebeditor.exception.ResourceNotFoundException;
import com.lfn.icip.icipwebeditor.exception.PipelineMetadataValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;
import com.fasterxml.jackson.databind.JsonMappingException;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;

/**
 * Global exception handler for ML/Adapter REST controllers
 * Handles exceptions for: MlInstancesController, MlAdaptersController,
 * MlSpecTemplatesController, ICIPMLFederatedRuntimeController
 */
@RestControllerAdvice(basePackages = {"com.lfn.icip.adapter.rest", "com.lfn.icip.icipwebeditor.rest"})
public class MLGlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(MLGlobalExceptionHandler.class);

    /**
     * Handle ML resource not found exceptions (404 Not Found).
     */
    @ExceptionHandler(MLResourceNotFoundException.class)
    public ResponseEntity<MLErrorResponse> handleMLResourceNotFound(MLResourceNotFoundException ex, WebRequest request) {
        logger.error("ML resource not found: {}", ex.getMessage());

        MLErrorResponse errorResponse = new MLErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Resource Not Found",
                ex.getMessage(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Verify the resource name and organization. Ensure the resource exists in the system.");

        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    /**
     * Handle duplicate ML resource exceptions (409 Conflict).
     */
    @ExceptionHandler(DuplicateMLResourceException.class)
    public ResponseEntity<MLErrorResponse> handleDuplicateMLResource(DuplicateMLResourceException ex, WebRequest request) {
        logger.error("Duplicate ML resource: {}", ex.getMessage());

        MLErrorResponse errorResponse = new MLErrorResponse(
                HttpStatus.CONFLICT.value(),
                "Duplicate Resource",
                ex.getMessage(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Use a unique resource name or update the existing resource instead of creating a new one.");

        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    /**
     * Handle port allocation exceptions (400 Bad Request).
     */
    @ExceptionHandler(PortAllocationException.class)
    public ResponseEntity<MLErrorResponse> handlePortAllocation(PortAllocationException ex, WebRequest request) {
        logger.error("Port allocation failed: {}", ex.getMessage());

        MLErrorResponse errorResponse = new MLErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Port Allocation Failed",
                ex.getMessage(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Ensure port range is valid and ports are available. Check for port conflicts.");

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle NoSuchAlgorithmException (500 Internal Server Error).
     */
    @ExceptionHandler(NoSuchAlgorithmException.class)
    public ResponseEntity<MLErrorResponse> handleNoSuchAlgorithm(NoSuchAlgorithmException ex, WebRequest request) {
        logger.error("Algorithm not found: {}", ex.getMessage(), ex);

        MLErrorResponse errorResponse = new MLErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Cryptographic Algorithm Error",
                "Required cryptographic algorithm is not available",
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Contact system administrator. Ensure required cryptographic providers are installed.");

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handle IO exceptions (500 Internal Server Error).
     */
    @ExceptionHandler(IOException.class)
    public ResponseEntity<MLErrorResponse> handleIOException(IOException ex, WebRequest request) {
        logger.error("I/O operation failed: {}", ex.getMessage(), ex);

        MLErrorResponse errorResponse = new MLErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "I/O Operation Failed",
                "An error occurred during I/O operation",
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Check file system permissions and network connectivity. Contact support if the issue persists.");

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handle illegal argument exceptions (400 Bad Request).
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<MLErrorResponse> handleIllegalArgument(IllegalArgumentException ex, WebRequest request) {
        logger.error("Invalid argument: {}", ex.getMessage());

        MLErrorResponse errorResponse = new MLErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Invalid Request",
                ex.getMessage(),
                null,
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Check the request parameters and ensure all required fields are provided correctly.");

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle number format exceptions (400 Bad Request).
     */
    @ExceptionHandler(NumberFormatException.class)
    public ResponseEntity<MLErrorResponse> handleNumberFormat(NumberFormatException ex, WebRequest request) {
        logger.error("Number format error: {}", ex.getMessage());

        MLErrorResponse errorResponse = new MLErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Invalid Number Format",
                "The provided value is not a valid number",
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Ensure numeric values (port numbers, IDs) are provided in correct format.");

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle missing request parameter exceptions (400 Bad Request).
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<MLErrorResponse> handleMissingParameter(MissingServletRequestParameterException ex, WebRequest request) {
        logger.error("Missing request parameter: {}", ex.getMessage());

        MLErrorResponse errorResponse = new MLErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Missing Parameter",
                String.format("Missing required parameter: '%s' of type %s", ex.getParameterName(), ex.getParameterType()),
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Include all required parameters in the request.");

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle method argument type mismatch exceptions (400 Bad Request).
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<MLErrorResponse> handleMethodArgumentTypeMismatch(MethodArgumentTypeMismatchException ex, WebRequest request) {
        logger.error("Argument type mismatch: {}", ex.getMessage());

        String requiredType = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown";
        MLErrorResponse errorResponse = new MLErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Invalid Parameter Type",
                String.format("Parameter '%s' should be of type %s", ex.getName(), requiredType),
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction(String.format("Provide a valid %s value for parameter '%s'", requiredType, ex.getName()));

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle JSON mapping and message not readable exceptions (400 Bad Request).
     */
    @ExceptionHandler(value = {JsonMappingException.class, HttpMessageNotReadableException.class})
    public ResponseEntity<MLErrorResponse> handleJsonException(Exception ex, WebRequest request) {
        logger.error("JSON parsing error: {}", ex.getMessage());

        MLErrorResponse errorResponse = new MLErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Invalid JSON",
                "Invalid JSON format in request body",
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Ensure the request body is valid JSON and matches the expected structure.");

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle HTTP request method not supported exceptions (405 Method Not Allowed).
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<MLErrorResponse> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex, WebRequest request) {
        logger.error("HTTP method not supported: {}", ex.getMessage());

        String supportedMethods = ex.getSupportedHttpMethods() != null
                ? ex.getSupportedHttpMethods().toString()
                : "N/A";

        MLErrorResponse errorResponse = new MLErrorResponse(
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
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<MLErrorResponse> handleNoHandlerFound(NoHandlerFoundException ex, WebRequest request) {
        logger.error("No handler found: {}", ex.getMessage());

        MLErrorResponse errorResponse = new MLErrorResponse(
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
     * Handle pipeline metadata.json validation failures — HTTP 422 Unprocessable Entity.
     * The full validation message is surfaced directly in the 'message' field.
     */
    @ExceptionHandler(PipelineMetadataValidationException.class)
    public ResponseEntity<MLErrorResponse> handlePipelineMetadataValidationException(
            PipelineMetadataValidationException ex, WebRequest request) {
        logger.error("Pipeline metadata validation failed: {}", ex.getMessage());
        MLErrorResponse errorResponse = new MLErrorResponse(
                HttpStatus.UNPROCESSABLE_ENTITY.value(),
                "Pipeline Metadata Validation Failed",
                ex.getMessage(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        return new ResponseEntity<>(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    /**
     * Handle invalid request exceptions (400 Bad Request).
     */
    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<MLErrorResponse> handleInvalidRequestException(InvalidRequestException ex, WebRequest request) {
        logger.error("Invalid request: {}", ex.getMessage(), ex);

        MLErrorResponse errorResponse = new MLErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Invalid Request",
                ex.getMessage(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Check the request parameters. Ensure all required fields are provided correctly.");

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle file upload exceptions (400 Bad Request).
     */
    @ExceptionHandler(FileUploadException.class)
    public ResponseEntity<MLErrorResponse> handleFileUploadException(FileUploadException ex, WebRequest request) {
        logger.error("File upload failed: {}", ex.getMessage(), ex);

        MLErrorResponse errorResponse = new MLErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "File Upload Failed",
                ex.getMessage(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Verify that the file is a valid ZIP file and not corrupted. Ensure the file contains valid AI agent scripts.");

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle file deletion exceptions (500 Internal Server Error).
     */
    @ExceptionHandler(FileDeletionException.class)
    public ResponseEntity<MLErrorResponse> handleFileDeletionException(FileDeletionException ex, WebRequest request) {
        logger.error("File deletion failed: {}", ex.getMessage(), ex);

        MLErrorResponse errorResponse = new MLErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "File Deletion Failed",
                ex.getMessage(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Verify that the file exists and you have permission to delete it.");

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handle datasource not found exceptions (404 Not Found).
     */
    @ExceptionHandler(DatasourceNotFoundException.class)
    public ResponseEntity<MLErrorResponse> handleDatasourceNotFoundException(DatasourceNotFoundException ex, WebRequest request) {
        logger.error("Datasource not found: {}", ex.getMessage(), ex);

        MLErrorResponse errorResponse = new MLErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Datasource Not Found",
                ex.getMessage(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Ensure the datasource is configured correctly. Verify the type and alias parameters match an existing datasource.");

        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    /**
     * Handle MinIO storage exceptions (500 Internal Server Error).
     */
    @ExceptionHandler(MinIOStorageException.class)
    public ResponseEntity<MLErrorResponse> handleMinIOStorageException(MinIOStorageException ex, WebRequest request) {
        logger.error("MinIO storage operation failed: {}", ex.getMessage(), ex);

        MLErrorResponse errorResponse = new MLErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "MinIO Storage Failed",
                ex.getMessage(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Verify MinIO connection details (URL, access key, secret key). Ensure the bucket exists and you have write permissions.");

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handle resource not found exceptions (404 Not Found).
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<MLErrorResponse> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        logger.error("Resource not found: {}", ex.getMessage(), ex);

        MLErrorResponse errorResponse = new MLErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Resource Not Found",
                ex.getMessage(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Verify the resource exists. Check the provided identifiers and try again.");

        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    /**
     * Handle all other exceptions (500 Internal Server Error).
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<MLErrorResponse> handleGlobalException(Exception ex, WebRequest request) {
        logger.error("Unexpected error occurred: {}", ex.getMessage(), ex);

        Throwable rootCause = getRootCause(ex);
        MLErrorResponse errorResponse = new MLErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "An unexpected error occurred while processing your request",
                rootCause.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Please contact support with the error details if the problem persists.");

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Get the root cause message from an exception.
     */
    private String getCauseMessage(Throwable ex) {
        if (ex.getCause() != null) {
            return ex.getCause().getMessage();
        }
        return null;
    }

    /**
     * Get the root cause of an exception.
     */
    private Throwable getRootCause(Throwable ex) {
        Throwable cause = ex;
        while (cause.getCause() != null && cause.getCause() != cause) {
            cause = cause.getCause();
        }
        return cause;
    }
}

