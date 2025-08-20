/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

package com.lfn.ai.comm.lib.util.exceptions;

import org.springframework.data.annotation.Transient;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// 
/**
 * The Class CGException.
 *
 * @author essedum
 */
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class CGException extends RuntimeException {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 9121051262505124665L;

	/** The enable detail trace. */
	@Transient
	private boolean enableDetailTrace;

	/** The error code. */
	private ExceptionCode errorCode;

	/** The message. */
	private String message;

	/** The caller info. */
	private StackTraceElement callerInfo;

	/**
	 * Instantiates a new CG exception.
	 *
	 * @param errorCode the error code
	 * @param throwable the throwable
	 */
	public CGException(ExceptionCode errorCode, Throwable throwable) {
		super(errorCode.toString(), throwable);

	}

	/**
	 * Gets the error code.
	 *
	 * @return the error code
	 */
	public String getErrorCode() {
		return errorCode != null ? errorCode.getCode() : "NA";
	}

	/**
	 * Gets the message.
	 *
	 * @return the message
	 */
	@Override
	public String getMessage() {
		return message;
	}

	/**
	 * Gets the caller info.
	 *
	 * @return the caller info
	 */
	public StackTraceElement getCallerInfo() {
		return callerInfo;
	}

	/**
	 * Gets the user friendly message.
	 *
	 * @return the user friendly message
	 */
	public String getUserFriendlyMessage() {
		return errorCode != null ? errorCode.getUserFriendlyMessage() : "NA";
	}

	/**
	 * Sets the properties.
	 *
	 * @param errorCode     the error code
	 * @param customMessage the custom message
	 * @param throwable     the throwable
	 */
//	private void setProperties(ExceptionCode errorCode, String customMessage, Throwable throwable) {
//		this.callerInfo = enableDetailTrace ? Thread.currentThread().getStackTrace()[3] : null;
//		this.errorCode = errorCode;
//		this.message = errorCode + "-" + customMessage;
//	}

}
