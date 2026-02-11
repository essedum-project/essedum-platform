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
		logger.error("GitHub authentication failed: {}", ex.getMessage());

		ErrorResponse errorResponse = new ErrorResponse(
				HttpStatus.UNAUTHORIZED.value(),
				"Authentication Failed",
				ex.getMessage(),
				getCauseMessage(ex),
				request.getDescription(false).replace("uri=", "")
		);
		errorResponse.setException(ex.getClass().getSimpleName());
		errorResponse.setSuggestedAction("Please authenticate with GitHub OAuth or provide a valid GitHub Personal Access Token (PAT) in the Authorization header.");

		return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
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
		logger.error("OAuth operation failed: {}", ex.getMessage());

		ErrorResponse errorResponse = new ErrorResponse(
				HttpStatus.UNAUTHORIZED.value(),
				"OAuth Error",
				ex.getMessage(),
				getCauseMessage(ex),
				request.getDescription(false).replace("uri=", "")
		);
		errorResponse.setException(ex.getClass().getSimpleName());
		errorResponse.setSuggestedAction("Please re-authenticate with GitHub OAuth. Ensure the authentication flow is completed successfully.");

		return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
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
		logger.error("Authentication failed: {}", ex.getMessage());

		ErrorResponse errorResponse = new ErrorResponse(
				HttpStatus.UNAUTHORIZED.value(),
				"Authentication Failed",
				ex.getMessage(),
				getCauseMessage(ex),
				request.getDescription(false).replace("uri=", "")
		);
		errorResponse.setException(ex.getClass().getSimpleName());
		errorResponse.setSuggestedAction("Verify your username and password. Ensure your account is active and not locked.");

		return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
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
		logger.error("Security authentication failed: {}", ex.getMessage());

		ErrorResponse errorResponse = new ErrorResponse(
				HttpStatus.UNAUTHORIZED.value(),
				"Authentication Failed",
				"Invalid username or password",
				ex.getMessage(),
				request.getDescription(false).replace("uri=", "")
		);
		errorResponse.setException(ex.getClass().getSimpleName());
		errorResponse.setSuggestedAction("Verify your credentials and try again. Contact administrator if you've forgotten your password.");

		return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
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
		logger.error("Token operation failed: {}", ex.getMessage());

		ErrorResponse errorResponse = new ErrorResponse(
				HttpStatus.UNAUTHORIZED.value(),
				"Token Error",
				ex.getMessage(),
				getCauseMessage(ex),
				request.getDescription(false).replace("uri=", "")
		);
		errorResponse.setException(ex.getClass().getSimpleName());
		errorResponse.setSuggestedAction("Your session may have expired. Please login again to get a new token.");

		return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
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
		logger.error("Unauthorized access attempt: {}", ex.getMessage());

		ErrorResponse errorResponse = new ErrorResponse(
				HttpStatus.FORBIDDEN.value(),
				"Access Denied",
				ex.getMessage(),
				getCauseMessage(ex),
				request.getDescription(false).replace("uri=", "")
		);
		errorResponse.setException(ex.getClass().getSimpleName());
		errorResponse.setSuggestedAction("You do not have permission to access this resource. Contact your administrator for access.");

		return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
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

		String errorMessage = "Cryptographic operation failed";
		String suggestion = "Contact system administrator. This is likely a configuration issue.";

		if (ex instanceof NoSuchAlgorithmException) {
			errorMessage = "Required cryptographic algorithm is not available";
		} else if (ex instanceof InvalidKeyException || ex instanceof InvalidKeySpecException) {
			errorMessage = "Invalid cryptographic key";
		} else if (ex instanceof BadPaddingException || ex instanceof IllegalBlockSizeException) {
			errorMessage = "Data encryption/decryption failed";
			suggestion = "The data may be corrupted or the encryption key may have changed. Contact support.";
		}

		ErrorResponse errorResponse = new ErrorResponse(
				HttpStatus.INTERNAL_SERVER_ERROR.value(),
				"Cryptographic Error",
				errorMessage,
				ex.getMessage(),
				request.getDescription(false).replace("uri=", "")
		);
		errorResponse.setException(ex.getClass().getSimpleName());
		errorResponse.setSuggestedAction(suggestion);

		return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
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

		ErrorResponse errorResponse = new ErrorResponse(
				HttpStatus.INTERNAL_SERVER_ERROR.value(),
				"Git Operation Failed",
				ex.getMessage(),
				getCauseMessage(ex),
				request.getDescription(false).replace("uri=", "")
		);
		errorResponse.setException(ex.getClass().getSimpleName());
		errorResponse.setSuggestedAction("Verify your GitHub token has the necessary permissions. Check repository name, branch, and network connectivity.");

		return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
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
	 * Handle JSON mapping and message not readable exceptions (400 Bad Request).
	 *
	 * @param ex the exception
	 * @param request the web request
	 * @return the error response
	 */
	@ExceptionHandler(value = {MissingServletRequestParameterException.class, JsonMappingException.class, HttpMessageNotReadableException.class})
	public ResponseEntity<ErrorResponse> handleJsonMappingException(Exception ex, WebRequest request) {
		logger.error("JSON parsing or request parameter error: {}", ex.getMessage());

		String message = "Invalid request format or missing required parameters";
		if (ex instanceof MissingServletRequestParameterException) {
			MissingServletRequestParameterException paramEx = (MissingServletRequestParameterException) ex;
			message = String.format("Missing required parameter: '%s' of type %s", paramEx.getParameterName(), paramEx.getParameterType());
		} else if (ex instanceof HttpMessageNotReadableException) {
			message = "Invalid JSON format in request body";
		}

		ErrorResponse errorResponse = new ErrorResponse(
				HttpStatus.BAD_REQUEST.value(),
				"Bad Request",
				message,
				ex.getMessage(),
				request.getDescription(false).replace("uri=", "")
		);
		errorResponse.setException(ex.getClass().getSimpleName());
		errorResponse.setSuggestedAction("Ensure the request body is valid JSON and all required parameters are included.");

		return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
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
	 * Handle all other exceptions (500 Internal Server Error).
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
