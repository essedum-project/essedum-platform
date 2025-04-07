/**
 * @ 2023 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.ai.comm.lib.util.exceptions;

import org.springframework.data.annotation.Transient;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// 
/**
 * The Class CGException.
 *
 * @author icets
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
