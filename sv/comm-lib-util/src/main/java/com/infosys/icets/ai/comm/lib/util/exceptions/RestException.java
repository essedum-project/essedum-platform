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

// 
/**
 * The Class RestException.
 *
 * @author icets
 */
public class RestException {

	/** The code. */
	private String code;
	
	/** The message. */
	private String message;
	
	/** The detailed message. */
	private String detailedMessage;

	/**
	 * Instantiates a new rest exception.
	 */
	public RestException() {
	}

	/**
	 * Instantiates a new rest exception.
	 *
	 * @param code the code
	 * @param message the message
	 * @param detailedMessage the detailed message
	 */
	public RestException(String code, String message, String detailedMessage) {
		super();
		this.code = code;
		this.message = message;
		this.detailedMessage = detailedMessage;
	}

	/**
	 * Gets the code.
	 *
	 * @return the code
	 */
	public String getCode() {
		return code;
	}

	/**
	 * Sets the code.
	 *
	 * @param code the new code
	 */
	public void setCode(String code) {
		this.code = code;
	}

	/**
	 * Gets the message.
	 *
	 * @return the message
	 */
	public String getMessage() {
		return message;
	}

	/**
	 * Sets the message.
	 *
	 * @param message the new message
	 */
	public void setMessage(String message) {
		this.message = message;
	}

	/**
	 * Gets the detailed message.
	 *
	 * @return the detailed message
	 */
	public String getDetailedMessage() {
		return detailedMessage;
	}

	/**
	 * Sets the detailed message.
	 *
	 * @param detailedMessage the new detailed message
	 */
	public void setDetailedMessage(String detailedMessage) {
		this.detailedMessage = detailedMessage;
	}

}
