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

package com.lfn.icip.dataset.exception;

import com.lfn.icip.dataset.model.dto.ErrorResponse;
import org.apache.commons.codec.DecoderException;
import org.json.JSONException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import java.io.IOException;
import java.net.URISyntaxException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.sql.SQLException;

/**
 * Global exception handler for Dataset REST API controllers.
 * Handles exceptions for ICIPProxyController, ICIPRatingController, and ICIPTagsController.
 *
 * @author essedum
 */
@RestControllerAdvice(basePackages = "com.lfn.icip.dataset.rest")
public class DatasetGlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(DatasetGlobalExceptionHandler.class);

    /**
     * Handle proxy operation exceptions.
     */
    @ExceptionHandler(ProxyOperationException.class)
    public ResponseEntity<ErrorResponse> handleProxyOperationException(ProxyOperationException ex, WebRequest request) {
        logger.error("Proxy operation failed: {}", ex.getMessage(), ex);

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Proxy Operation Failed",
                ex.getMessage(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Verify datasource and dataset configuration. Check connection details and data format compatibility.");

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handle rating not found exceptions.
     */
    @ExceptionHandler(RatingNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleRatingNotFoundException(RatingNotFoundException ex, WebRequest request) {
        logger.error("Rating not found: {}", ex.getMessage(), ex);

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Rating Not Found",
                ex.getMessage(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Verify the rating ID exists. Use the list endpoint to check available ratings.");

        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    /**
     * Handle tag not found exceptions.
     */
    @ExceptionHandler(TagNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleTagNotFoundException(TagNotFoundException ex, WebRequest request) {
        logger.error("Tag not found: {}", ex.getMessage(), ex);

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Tag Not Found",
                ex.getMessage(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Verify the tag ID exists. Use the fetch endpoint to check available tags.");

        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    /**
     * Handle JSON parsing exceptions.
     */
    @ExceptionHandler(JSONException.class)
    public ResponseEntity<ErrorResponse> handleJSONException(JSONException ex, WebRequest request) {
        logger.error("JSON parsing error: {}", ex.getMessage(), ex);

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Invalid JSON Format",
                ex.getMessage(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Verify the JSON structure matches the expected format. Check for missing or extra fields.");

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle SQL exceptions.
     */
    @ExceptionHandler(SQLException.class)
    public ResponseEntity<ErrorResponse> handleSQLException(SQLException ex, WebRequest request) {
        logger.error("Database operation failed: {}", ex.getMessage(), ex);

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Database Operation Failed",
                ex.getMessage(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Check database connectivity and query syntax. Verify data integrity constraints.");

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handle IO exceptions.
     */
    @ExceptionHandler(IOException.class)
    public ResponseEntity<ErrorResponse> handleIOException(IOException ex, WebRequest request) {
        logger.error("I/O operation failed: {}", ex.getMessage(), ex);

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "I/O Operation Failed",
                ex.getMessage(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Verify network connectivity and external service availability.");

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handle URI syntax exceptions.
     */
    @ExceptionHandler(URISyntaxException.class)
    public ResponseEntity<ErrorResponse> handleURISyntaxException(URISyntaxException ex, WebRequest request) {
        logger.error("Invalid URI syntax: {}", ex.getMessage(), ex);

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Invalid URI Format",
                ex.getMessage(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Verify the URI format is correct and properly encoded.");

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle cryptographic exceptions.
     */
    @ExceptionHandler({
            NoSuchAlgorithmException.class,
            InvalidKeyException.class,
            NoSuchPaddingException.class,
            IllegalBlockSizeException.class,
            BadPaddingException.class,
            InvalidKeySpecException.class,
            InvalidAlgorithmParameterException.class,
            KeyManagementException.class,
            KeyStoreException.class,
            DecoderException.class
    })
    public ResponseEntity<ErrorResponse> handleCryptographicExceptions(Exception ex, WebRequest request) {
        logger.error("Cryptographic operation failed: {}", ex.getMessage(), ex);

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Cryptographic Operation Failed",
                ex.getMessage(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Verify encryption keys and algorithms. Check security configuration and certificate validity.");

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handle missing request parameter exceptions.
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParams(MissingServletRequestParameterException ex, WebRequest request) {
        logger.error("Missing request parameter: {}", ex.getMessage(), ex);

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Missing Required Parameter",
                ex.getMessage(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Include the required parameter '" + ex.getParameterName() + "' in your request.");

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle method argument type mismatch exceptions.
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex, WebRequest request) {
        logger.error("Type mismatch: {}", ex.getMessage(), ex);

        String expectedType = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown";
        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Invalid Parameter Type",
                String.format("Parameter '%s' should be of type %s", ex.getName(), expectedType),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Provide a valid " + expectedType + " value for parameter '" + ex.getName() + "'.");

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle method argument not valid exceptions.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex, WebRequest request) {
        logger.error("Validation failed: {}", ex.getMessage(), ex);

        StringBuilder errors = new StringBuilder();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.append(error.getField()).append(": ").append(error.getDefaultMessage()).append("; ")
        );

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Validation Failed",
                errors.toString(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Fix the validation errors and retry the request.");

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle HTTP message not readable exceptions.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadable(HttpMessageNotReadableException ex, WebRequest request) {
        logger.error("Malformed request body: {}", ex.getMessage(), ex);

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Malformed Request Body",
                "Request body is not readable or improperly formatted",
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Verify the request body is valid JSON and matches the expected schema.");

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle data integrity violation exceptions.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex, WebRequest request) {
        logger.error("Data integrity violation: {}", ex.getMessage(), ex);

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.CONFLICT.value(),
                "Data Integrity Violation",
                "Operation violates data integrity constraints",
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Check for duplicate entries or foreign key violations. Verify data consistency.");

        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    /**
     * Handle HTTP method not supported exceptions.
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex, WebRequest request) {
        logger.error("HTTP method not supported: {}", ex.getMessage(), ex);

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.METHOD_NOT_ALLOWED.value(),
                "Method Not Allowed",
                ex.getMessage(),
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Use one of the supported HTTP methods: " + String.join(", ", ex.getSupportedMethods()));

        return new ResponseEntity<>(errorResponse, HttpStatus.METHOD_NOT_ALLOWED);
    }

    /**
     * Handle all other exceptions.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex, WebRequest request) {
        logger.error("Unexpected error: {}", ex.getMessage(), ex);

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "An unexpected error occurred while processing the request",
                getCauseMessage(ex),
                request.getDescription(false).replace("uri=", "")
        );
        errorResponse.setException(ex.getClass().getSimpleName());
        errorResponse.setSuggestedAction("Contact system administrator if the problem persists. Check application logs for details.");

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Extract the root cause message from an exception.
     */
    private String getCauseMessage(Throwable ex) {
        Throwable cause = ex;
        while (cause.getCause() != null && cause.getCause() != cause) {
            cause = cause.getCause();
        }
        return cause.getMessage();
    }
}

