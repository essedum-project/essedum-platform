/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 */

package com.lfn.icip.dataset.config;

import com.lfn.icip.dataset.exception.LangflowErrorResponse;
import com.lfn.icip.dataset.exception.LangflowExportException;
import com.lfn.icip.dataset.exception.InvalidJSONException;
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
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.servlet.NoHandlerFoundException;
import com.fasterxml.jackson.databind.JsonMappingException;

import java.io.IOException;

/**
 * Global exception handler for Langflow integration controller
 */
@RestControllerAdvice(basePackages = "com.lfn.icip.dataset.rest")
public class LangflowGlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(LangflowGlobalExceptionHandler.class);

    /**
     * Handle Langflow export exceptions (500 Internal Server Error).
     */
    @ExceptionHandler(LangflowExportException.class)
    public ResponseEntity<LangflowErrorResponse> handleLangflowExportException(LangflowExportException ex, WebRequest request) {
        logger.error("Langflow export failed: {}", ex.getMessage(), ex);

        LangflowErrorResponse errorResponse = new LangflowErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Langflow Export Failed",
                ex.getMessage(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Verify the JSON file format and try again. Contact support if the issue persists.");

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handle invalid JSON exceptions (400 Bad Request).
     */
    @ExceptionHandler(InvalidJSONException.class)
    public ResponseEntity<LangflowErrorResponse> handleInvalidJSONException(InvalidJSONException ex, WebRequest request) {
        logger.error("Invalid JSON: {}", ex.getMessage());

        LangflowErrorResponse errorResponse = new LangflowErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Invalid JSON Format",
                ex.getMessage(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Ensure the JSON file is properly formatted and contains valid Langflow agent data.");

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle missing multipart file exceptions (400 Bad Request).
     */
    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<LangflowErrorResponse> handleMissingRequestPart(MissingServletRequestPartException ex, WebRequest request) {
        logger.error("Missing request part: {}", ex.getMessage());

        LangflowErrorResponse errorResponse = new LangflowErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Missing File",
                String.format("Missing required file part: '%s'", ex.getRequestPartName()),
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Include the required JSON file in the request using multipart/form-data format.");

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle multipart exceptions (400 Bad Request).
     */
    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<LangflowErrorResponse> handleMultipartException(MultipartException ex, WebRequest request) {
        logger.error("Multipart request error: {}", ex.getMessage(), ex);

        LangflowErrorResponse errorResponse = new LangflowErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Invalid Multipart Request",
                "The multipart request is invalid or corrupted",
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Ensure the request is sent as multipart/form-data with a valid JSON file.");

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle IO exceptions (500 Internal Server Error).
     */
    @ExceptionHandler(IOException.class)
    public ResponseEntity<LangflowErrorResponse> handleIOException(IOException ex, WebRequest request) {
        logger.error("I/O operation failed: {}", ex.getMessage(), ex);

        LangflowErrorResponse errorResponse = new LangflowErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "I/O Operation Failed",
                "An error occurred while reading the file",
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Ensure the file is accessible and not corrupted. Try uploading again.");

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handle illegal argument exceptions (400 Bad Request).
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<LangflowErrorResponse> handleIllegalArgument(IllegalArgumentException ex, WebRequest request) {
        logger.error("Invalid argument: {}", ex.getMessage());

        LangflowErrorResponse errorResponse = new LangflowErrorResponse(
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
     * Handle missing request parameter exceptions (400 Bad Request).
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<LangflowErrorResponse> handleMissingParameter(MissingServletRequestParameterException ex, WebRequest request) {
        logger.error("Missing request parameter: {}", ex.getMessage());

        LangflowErrorResponse errorResponse = new LangflowErrorResponse(
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
    public ResponseEntity<LangflowErrorResponse> handleMethodArgumentTypeMismatch(MethodArgumentTypeMismatchException ex, WebRequest request) {
        logger.error("Argument type mismatch: {}", ex.getMessage());

        String requiredType = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown";
        LangflowErrorResponse errorResponse = new LangflowErrorResponse(
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
    public ResponseEntity<LangflowErrorResponse> handleJsonException(Exception ex, WebRequest request) {
        logger.error("JSON parsing error: {}", ex.getMessage());

        LangflowErrorResponse errorResponse = new LangflowErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Invalid JSON",
                "Invalid JSON format in request",
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Ensure the file contains valid JSON and matches the expected Langflow agent structure.");

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle HTTP request method not supported exceptions (405 Method Not Allowed).
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<LangflowErrorResponse> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex, WebRequest request) {
        logger.error("HTTP method not supported: {}", ex.getMessage());

        String supportedMethods = ex.getSupportedHttpMethods() != null
                ? ex.getSupportedHttpMethods().toString()
                : "N/A";

        LangflowErrorResponse errorResponse = new LangflowErrorResponse(
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
    public ResponseEntity<LangflowErrorResponse> handleNoHandlerFound(NoHandlerFoundException ex, WebRequest request) {
        logger.error("No handler found: {}", ex.getMessage());

        LangflowErrorResponse errorResponse = new LangflowErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Endpoint Not Found",
                String.format("No endpoint found for %s %s", ex.getHttpMethod(), ex.getRequestURL()),
                "The requested URL does not exist",
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Verify the URL path and HTTP method. Check the API documentation.");

        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    /**
     * Handle all other exceptions (500 Internal Server Error).
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<LangflowErrorResponse> handleGlobalException(Exception ex, WebRequest request) {
        logger.error("Unexpected error occurred: {}", ex.getMessage(), ex);

        Throwable rootCause = getRootCause(ex);
        LangflowErrorResponse errorResponse = new LangflowErrorResponse(
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

