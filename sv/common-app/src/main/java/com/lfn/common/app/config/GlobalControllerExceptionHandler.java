package com.lfn.common.app.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

import com.fasterxml.jackson.databind.JsonMappingException;

@ControllerAdvice
public class GlobalControllerExceptionHandler {

	private final static Logger logger = LoggerFactory.getLogger(GlobalControllerExceptionHandler.class);

 
    @ExceptionHandler(value = {MissingServletRequestParameterException.class,JsonMappingException.class,HttpMessageNotReadableException.class})
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public void handleJsonMappingException(Exception ex) {
    	 logger.error("Returning HTTP 400 Bad Request", ex);
    }   

}
