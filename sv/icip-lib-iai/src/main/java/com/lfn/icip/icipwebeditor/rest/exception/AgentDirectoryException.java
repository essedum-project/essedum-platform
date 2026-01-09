package com.lfn.icip.icipwebeditor.rest.exception;
/**
 * Custom exception for Agent Directory operations.
 * 
 * @author essedum
 */
public class AgentDirectoryException extends RuntimeException {
private static final long serialVersionUID = 1L;
public AgentDirectoryException(String message) {
super(message);
}
public AgentDirectoryException(String message, Throwable cause) {
super(message, cause);
}
}