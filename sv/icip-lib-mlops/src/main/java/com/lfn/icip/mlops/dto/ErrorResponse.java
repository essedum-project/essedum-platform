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

package com.lfn.icip.mlops.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Standardized error response DTO for MLOps API exceptions.
 * Provides detailed error information to help users understand and resolve issues.
 *
 * @author essedum
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    /** The timestamp when the error occurred. */
    private LocalDateTime timestamp;

    /** The HTTP status code. */
    private int status;

    /** The error type/category. */
    private String error;

    /** The error message describing what went wrong. */
    private String message;

    /** Additional details about the error. */
    private String details;

    /** The request path where the error occurred. */
    private String path;

    /** The exception class name. */
    private String exception;

    /** List of validation errors or additional error information. */
    private List<String> errors;

    /** Suggested action to resolve the issue. */
    private String suggestedAction;

    /**
     * Instantiates a new error response.
     */
    public ErrorResponse() {
        this.timestamp = LocalDateTime.now();
    }

    /**
     * Instantiates a new error response with basic information.
     *
     * @param status the HTTP status code
     * @param error the error type
     * @param message the error message
     */
    public ErrorResponse(int status, String error, String message) {
        this();
        this.status = status;
        this.error = error;
        this.message = message;
    }

    /**
     * Instantiates a new error response with detailed information.
     *
     * @param status the HTTP status code
     * @param error the error type
     * @param message the error message
     * @param details additional details
     * @param path the request path
     */
    public ErrorResponse(int status, String error, String message, String details, String path) {
        this(status, error, message);
        this.details = details;
        this.path = path;
    }

    /**
     * Add an error to the errors list.
     *
     * @param error the error message to add
     * @return this ErrorResponse for method chaining
     */
    public ErrorResponse addError(String error) {
        if (this.errors == null) {
            this.errors = new ArrayList<>();
        }
        this.errors.add(error);
        return this;
    }

    // Getters and Setters

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getException() {
        return exception;
    }

    public void setException(String exception) {
        this.exception = exception;
    }

    public List<String> getErrors() {
        return errors;
    }

    public void setErrors(List<String> errors) {
        this.errors = errors;
    }

    public String getSuggestedAction() {
        return suggestedAction;
    }

    public void setSuggestedAction(String suggestedAction) {
        this.suggestedAction = suggestedAction;
    }
}

