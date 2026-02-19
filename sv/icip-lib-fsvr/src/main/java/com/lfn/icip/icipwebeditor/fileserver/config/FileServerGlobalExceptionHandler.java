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

package com.lfn.icip.icipwebeditor.fileserver.config;

import com.lfn.icip.icipwebeditor.fileserver.dto.ErrorResponse;
import com.lfn.icip.icipwebeditor.fileserver.exception.FileNotFoundException;
import com.lfn.icip.icipwebeditor.fileserver.exception.FileUploadException;
import com.lfn.icip.icipwebeditor.fileserver.exception.FileSizeExceededException;
import com.lfn.icip.icipwebeditor.fileserver.exception.InvalidFileTypeException;
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
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.servlet.NoHandlerFoundException;

import com.fasterxml.jackson.databind.JsonMappingException;

import java.io.IOException;

/**
 * Global exception handler for File Server REST controllers
 */
@RestControllerAdvice(basePackages = "com.lfn.icip.icipwebeditor.fileserver.rest")
public class FileServerGlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(FileServerGlobalExceptionHandler.class);

    /**
     * Handle file not found exceptions (404 Not Found).
     */
    @ExceptionHandler(FileNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleFileNotFoundException(FileNotFoundException ex, WebRequest request) {
        logger.error("File not found: {}", ex.getMessage());

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "File Not Found",
                ex.getMessage(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Verify the file ID and organization. Ensure the file exists in the system.");

        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    /**
     * Handle file upload exceptions (500 Internal Server Error).
     */
    @ExceptionHandler(FileUploadException.class)
    public ResponseEntity<ErrorResponse> handleFileUploadException(FileUploadException ex, WebRequest request) {
        logger.error("File upload failed: {}", ex.getMessage(), ex);

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "File Upload Failed",
                ex.getMessage(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Check the file format and try again. Contact support if the issue persists.");

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handle file size exceeded exceptions (413 Payload Too Large).
     */
    @ExceptionHandler({FileSizeExceededException.class, MaxUploadSizeExceededException.class})
    public ResponseEntity<ErrorResponse> handleFileSizeExceededException(Exception ex, WebRequest request) {
        logger.error("File size exceeded: {}", ex.getMessage());

        String message = "File size exceeds the maximum allowed limit";
        if (ex instanceof MaxUploadSizeExceededException) {
            MaxUploadSizeExceededException maxEx = (MaxUploadSizeExceededException) ex;
            message = String.format("File size exceeds the maximum allowed limit of %d bytes",
                    maxEx.getMaxUploadSize());
        }

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.PAYLOAD_TOO_LARGE.value(),
                "File Size Exceeded",
                message,
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Reduce the file size or split into multiple smaller files.");

        return new ResponseEntity<>(errorResponse, HttpStatus.PAYLOAD_TOO_LARGE);
    }

    /**
     * Handle invalid file type exceptions (400 Bad Request).
     */
    @ExceptionHandler(InvalidFileTypeException.class)
    public ResponseEntity<ErrorResponse> handleInvalidFileTypeException(InvalidFileTypeException ex, WebRequest request) {
        logger.error("Invalid file type: {}", ex.getMessage());

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Invalid File Type",
                ex.getMessage(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Ensure the file type is allowed. Check supported file formats.");

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle multipart exceptions (400 Bad Request).
     */
    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<ErrorResponse> handleMultipartException(MultipartException ex, WebRequest request) {
        logger.error("Multipart request error: {}", ex.getMessage(), ex);

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Invalid Multipart Request",
                "The multipart request is invalid or corrupted",
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Ensure the request is sent as multipart/form-data with valid file(s).");

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle IO exceptions (500 Internal Server Error).
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
        errorResponse.setSuggestedAction("Check file system permissions and available disk space. Contact support if the issue persists.");

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handle illegal argument exceptions (400 Bad Request).
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex, WebRequest request) {
        logger.error("Invalid argument: {}", ex.getMessage());

        ErrorResponse errorResponse = new ErrorResponse(
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
    public ResponseEntity<ErrorResponse> handleNumberFormatException(NumberFormatException ex, WebRequest request) {
        logger.error("Number format error: {}", ex.getMessage());

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Invalid Number Format",
                "The provided value is not a valid number",
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Ensure numeric values are provided in correct format (e.g., file ID, chunk index).");

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle missing request parameter exceptions (400 Bad Request).
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParameterException(MissingServletRequestParameterException ex, WebRequest request) {
        logger.error("Missing request parameter: {}", ex.getMessage());

        ErrorResponse errorResponse = new ErrorResponse(
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
    public ResponseEntity<ErrorResponse> handleMethodArgumentTypeMismatch(MethodArgumentTypeMismatchException ex, WebRequest request) {
        logger.error("Argument type mismatch: {}", ex.getMessage());

        String requiredType = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown";
        ErrorResponse errorResponse = new ErrorResponse(
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
    public ResponseEntity<ErrorResponse> handleJsonException(Exception ex, WebRequest request) {
        logger.error("JSON parsing error: {}", ex.getMessage());

        ErrorResponse errorResponse = new ErrorResponse(
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
     * Handle all other exceptions (500 Internal Server Error).
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex, WebRequest request) {
        logger.error("Unexpected error occurred: {}", ex.getMessage(), ex);

        Throwable rootCause = getRootCause(ex);
        ErrorResponse errorResponse = new ErrorResponse(
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

