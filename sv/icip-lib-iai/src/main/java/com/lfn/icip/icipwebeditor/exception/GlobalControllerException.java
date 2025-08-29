package com.lfn.icip.icipwebeditor.exception;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalControllerException {

	@ExceptionHandler(AddRuntimeException.class)
	public ResponseEntity<?> handleAddRuntimeException(AddRuntimeException ex) {

		return new ResponseEntity<>(Map.of("Error Message", ex.getMessage()), HttpStatus.BAD_REQUEST);
	}

	@ExceptionHandler(RuntimePortsNotSavedException.class)
	public ResponseEntity<?> handleRuntimePortsNotSavedException(RuntimePortsNotSavedException ex) {

		return new ResponseEntity<>(Map.of("Error Message", ex.getMessage()), HttpStatus.BAD_REQUEST);
	}

	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<?> handleResourceNotFoundException(ResourceNotFoundException ex) {

		return new ResponseEntity<>(Map.of("Error Message", ex.getMessage()), HttpStatus.NOT_FOUND);
	}

	@ExceptionHandler(NoUnassignedPortFoundException.class)
	public ResponseEntity<?> handleNoUnassignedPortFoundException(NoUnassignedPortFoundException ex) {

		return new ResponseEntity<>(Map.of("Error Message", ex.getMessage()), HttpStatus.NOT_FOUND);
	}

	@ExceptionHandler(RuntimeListNotFoundException.class)
	public ResponseEntity<?> handleRuntimeListNotFoundException(RuntimeListNotFoundException ex) {

		return new ResponseEntity<>(Map.of("Error Message", ex.getMessage()), HttpStatus.NOT_FOUND);
	}

	@ExceptionHandler(NullPointerException.class)
	public ResponseEntity<?> handleNullPointerException(NullPointerException ex) {

		return new ResponseEntity<>(Map.of("Error Message", ex.getMessage()), HttpStatus.NOT_FOUND);
	}

}
