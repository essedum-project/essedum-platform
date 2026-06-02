package com.lfn.common.app.config;

import com.fasterxml.jackson.databind.JsonMappingException;
import com.lfn.common.app.exception.AuthenticationFailedException;
import com.lfn.common.app.exception.GitHubAuthenticationException;
import com.lfn.common.app.exception.GitOperationException;
import com.lfn.common.app.exception.OAuthException;
import com.lfn.common.app.exception.TokenException;
import com.lfn.common.app.exception.UnauthorizedAccessException;
import com.lfn.common.app.web.rest.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.NoHandlerFoundException;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import java.io.UnsupportedEncodingException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;

@ControllerAdvice
public class GlobalControllerExceptionHandler {

	private final static Logger logger = LoggerFactory.getLogger(GlobalControllerExceptionHandler.class);

	/**
	 * Handle GitHub authentication exceptions (401 Unauthorized).
	 *
	 * @param ex the exception
	 * @param request the web request
	 * @return the error response
	 */
	@ExceptionHandler(GitHubAuthenticationException.class)
	public ResponseEntity<ErrorResponse> handleGitHubAuthenticationException(GitHubAuthenticationException ex, WebRequest request) {
		logger.error("GitHub authentication failed: {}", ex.getMessage(), ex);
		return buildErrorResponse(HttpStatus.UNAUTHORIZED, "Authentication Failed",
				"GitHub authentication failed. Please check your credentials.",
				"Please authenticate with GitHub OAuth or provide a valid GitHub Personal Access Token (PAT) in the Authorization header.",
				request);
	}

	/**
	 * Handle OAuth exceptions (401 Unauthorized).
	 *
	 * @param ex the exception
	 * @param request the web request
	 * @return the error response
	 */
	@ExceptionHandler(OAuthException.class)
	public ResponseEntity<ErrorResponse> handleOAuthException(OAuthException ex, WebRequest request) {
		logger.error("OAuth operation failed: {}", ex.getMessage(), ex);
		return buildErrorResponse(HttpStatus.UNAUTHORIZED, "OAuth Error",
				"OAuth authentication failed. Please re-authenticate.",
				"Please re-authenticate with GitHub OAuth. Ensure the authentication flow is completed successfully.",
				request);
	}

	/**
	 * Handle authentication failed exceptions (401 Unauthorized).
	 *
	 * @param ex the exception
	 * @param request the web request
	 * @return the error response
	 */
	@ExceptionHandler(AuthenticationFailedException.class)
	public ResponseEntity<ErrorResponse> handleAuthenticationFailed(AuthenticationFailedException ex, WebRequest request) {
		logger.error("Authentication failed: {}", ex.getMessage(), ex);
		return buildErrorResponse(HttpStatus.UNAUTHORIZED, "Authentication Failed",
				"Authentication failed. Please verify your credentials.",
				"Verify your username and password. Ensure your account is active and not locked.",
				request);
	}

	/**
	 * Handle Spring Security authentication exceptions (401 Unauthorized).
	 *
	 * @param ex the exception
	 * @param request the web request
	 * @return the error response
	 */
	@ExceptionHandler({AuthenticationException.class, BadCredentialsException.class})
	public ResponseEntity<ErrorResponse> handleSecurityAuthenticationException(Exception ex, WebRequest request) {
		logger.error("Security authentication failed: {}", ex.getMessage(), ex);
		return buildErrorResponse(HttpStatus.UNAUTHORIZED, "Authentication Failed",
				"Invalid username or password.",
				"Verify your credentials and try again. Contact administrator if you've forgotten your password.",
				request);
	}

	/**
	 * Handle token exceptions (401 Unauthorized).
	 *
	 * @param ex the exception
	 * @param request the web request
	 * @return the error response
	 */
	@ExceptionHandler(TokenException.class)
	public ResponseEntity<ErrorResponse> handleTokenException(TokenException ex, WebRequest request) {
		logger.error("Token operation failed: {}", ex.getMessage(), ex);
		return buildErrorResponse(HttpStatus.UNAUTHORIZED, "Token Error",
				"Token validation failed or session has expired.",
				"Your session may have expired. Please login again to get a new token.",
				request);
	}

	/**
	 * Handle unauthorized access exceptions (403 Forbidden).
	 *
	 * @param ex the exception
	 * @param request the web request
	 * @return the error response
	 */
	@ExceptionHandler(UnauthorizedAccessException.class)
	public ResponseEntity<ErrorResponse> handleUnauthorizedAccess(UnauthorizedAccessException ex, WebRequest request) {
		logger.error("Unauthorized access attempt: {}", ex.getMessage(), ex);
		return buildErrorResponse(HttpStatus.FORBIDDEN, "Access Denied",
				"You do not have permission to access this resource.",
				"You do not have permission to access this resource. Contact your administrator for access.",
				request);
	}

	/**
	 * Handle cryptographic exceptions (500 Internal Server Error).
	 *
	 * @param ex the exception
	 * @param request the web request
	 * @return the error response
	 */
	@ExceptionHandler({
		NoSuchAlgorithmException.class,
		NoSuchPaddingException.class,
		InvalidKeyException.class,
		InvalidKeySpecException.class,
		InvalidAlgorithmParameterException.class,
		BadPaddingException.class,
		IllegalBlockSizeException.class,
		UnsupportedEncodingException.class
	})
	public ResponseEntity<ErrorResponse> handleCryptoException(Exception ex, WebRequest request) {
		logger.error("Cryptographic operation failed: {}", ex.getMessage(), ex);
		return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Cryptographic Error",
				"A cryptographic operation failed. Please contact the administrator.",
				"Contact system administrator. This is likely a configuration issue.",
				request);
	}

	/**
	 * Handle Git operation exceptions (500 Internal Server Error).
	 *
	 * @param ex the exception
	 * @param request the web request
	 * @return the error response
	 */
	@ExceptionHandler(GitOperationException.class)
	public ResponseEntity<ErrorResponse> handleGitOperationException(GitOperationException ex, WebRequest request) {
		logger.error("Git operation failed: {}", ex.getMessage(), ex);
		return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Git Operation Failed",
				"A Git operation failed. Please verify your configuration.",
				"Verify your GitHub token has the necessary permissions. Check repository name, branch, and network connectivity.",
				request);
	}

	/**
	 * Handle illegal argument exceptions (400 Bad Request).
	 *
	 * @param ex the exception
	 * @param request the web request
	 * @return the error response
	 */
	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex, WebRequest request) {
		logger.error("Invalid argument: {}", ex.getMessage(), ex);
		return buildErrorResponse(HttpStatus.BAD_REQUEST, "Invalid Request",
				"The request contains invalid parameters.",
				"Check the request parameters and ensure all required fields are provided correctly.",
				request);
	}

	/**
	 * Handle JSON mapping and message not readable exceptions (400 Bad Request).
	 *
	 * @param ex the exception
	 * @param request the web request
	 * @return the error response
	 */
	@ExceptionHandler(value = {MissingServletRequestParameterException.class, JsonMappingException.class, HttpMessageNotReadableException.class})
	public ResponseEntity<ErrorResponse> handleJsonMappingException(Exception ex, WebRequest request) {
		logger.error("JSON parsing or request parameter error: {}", ex.getMessage(), ex);

		String message = "Invalid request format or missing required parameters.";
		if (ex instanceof MissingServletRequestParameterException) {
			MissingServletRequestParameterException paramEx = (MissingServletRequestParameterException) ex;
			message = String.format("Missing required parameter: '%s'", paramEx.getParameterName());
		} else if (ex instanceof HttpMessageNotReadableException) {
			message = "Invalid JSON format in request body.";
		}

		return buildErrorResponse(HttpStatus.BAD_REQUEST, "Bad Request", message,
				"Ensure the request body is valid JSON and all required parameters are included.",
				request);
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
		logger.error("HTTP method not supported: {}", ex.getMessage(), ex);

		String supportedMethods = ex.getSupportedHttpMethods() != null
				? ex.getSupportedHttpMethods().toString()
				: "N/A";

		return buildErrorResponse(HttpStatus.METHOD_NOT_ALLOWED, "Method Not Allowed",
				String.format("HTTP method '%s' is not supported for this endpoint.", ex.getMethod()),
				String.format("Use one of the supported HTTP methods: %s", supportedMethods),
				request);
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
		logger.error("No handler found: {}", ex.getMessage(), ex);
		return buildErrorResponse(HttpStatus.NOT_FOUND, "Endpoint Not Found",
				"The requested endpoint does not exist.",
				"Verify the URL path and HTTP method. Check the API documentation for available endpoints.",
				request);
	}

	/**
	 * Handle all other exceptions (500 Internal Server Error).
	 *
	 * @param ex the exception
	 * @param request the web request
	 * @return the error response
	 */
	@ExceptionHandler(Exception.class)
	public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex, WebRequest request) {
		logger.error("Unexpected error occurred: {}", ex.getMessage(), ex);
		return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error",
				"An unexpected error occurred while processing your request.",
				"Please contact support if the problem persists.",
				request);
	}

	/**
	 * Build a safe error response that does not expose internal details.
	 */
	private ResponseEntity<ErrorResponse> buildErrorResponse(HttpStatus status, String error, String message,
			String suggestedAction, WebRequest request) {
		ErrorResponse errorResponse = new ErrorResponse(
				status.value(),
				error,
				message,
				null,
				request.getDescription(false).replace("uri=", "")
		);
		errorResponse.setSuggestedAction(suggestedAction);
		return new ResponseEntity<>(errorResponse, status);
	}
}
