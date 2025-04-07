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

import java.util.Objects;

// 
/**
 * The Class ExceptionUtil.
 *
 * @author icets
 */
public class ExceptionUtil {

	/**
	 * Instantiates a new exception util.
	 */
	private ExceptionUtil() {
	    throw new IllegalStateException("ExceptionUtil class");
	  }
	
	/**
	 * Find root cause.
	 *
	 * @param throwable the throwable
	 * @return the throwable
	 */
	public static Throwable findRootCause(Throwable throwable) {
	    Objects.requireNonNull(throwable);
	    Throwable rootCause = throwable;
	    while (rootCause.getCause() != null && rootCause.getCause() != rootCause) {
	        rootCause = rootCause.getCause();
	    }
	    return rootCause;
	}
}
