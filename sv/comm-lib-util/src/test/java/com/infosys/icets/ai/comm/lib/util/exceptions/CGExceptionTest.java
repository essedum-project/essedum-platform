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

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

public class CGExceptionTest {

	private static CGException obj;

	@BeforeAll
	static void setup() {
		obj = new CGException(ExceptionCode.valueOf("TD"), new Exception("test-case"));

	}

	@Test
	public void testException() {
		String errorCode = obj.getErrorCode();
		assertEquals("NA", errorCode);

	}

	@Test
	public void testMsg() {
		String msg = obj.getMessage();
		assertEquals(msg, msg);
	}

	@Test
	public void testUserFMsg() {
		String msg = obj.getUserFriendlyMessage();
		assertEquals(msg, msg);
	}

	@Test
	public void testLMsg() {
		String msg = obj.getLocalizedMessage();
		assertEquals(msg, msg);
	}

	@Test
	public void testThrowable() {
		Throwable t = obj.getCause();
		assertEquals(t.getMessage(), "test-case");
	}

}
