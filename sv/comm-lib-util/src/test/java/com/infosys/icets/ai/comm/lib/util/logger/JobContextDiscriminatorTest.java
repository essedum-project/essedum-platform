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
package com.infosys.icets.ai.comm.lib.util.logger;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import ch.qos.logback.classic.spi.ILoggingEvent;

public class JobContextDiscriminatorTest {

	static JobContextDiscriminator testJob = new JobContextDiscriminator();

	static String testKey = "TestKey";
	static String testDefaultvalue = "TestDeafultvalue";
	static ILoggingEvent testEvent;

	@Test
	public void testGetKey() {
		String val = testJob.getKey();
		assertEquals("contextName", val);
	}

	@Test
	public void testSetKey() {
		try {
			testJob.setKey(testKey);
		} catch (UnsupportedOperationException exception) {
			assertEquals("Key cannot be set. Using fixed key contextName", exception.getMessage());
		}

	}

}
