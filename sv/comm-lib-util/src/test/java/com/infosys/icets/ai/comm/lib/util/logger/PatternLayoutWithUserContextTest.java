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

import java.util.Map;

import org.junit.jupiter.api.Test;

import ch.qos.logback.core.pattern.DynamicConverter;
import java.util.function.Supplier;


public class PatternLayoutWithUserContextTest {

	static PatternLayoutWithUserContext testPattern = new PatternLayoutWithUserContext();

	@Test
	public void testPattern() {
		String result = testPattern.getPattern();

		assertEquals(result, result);
	}

	@Test
	public void testPatternMap() {
		Map<String, String> map = testPattern.getDefaultConverterMap();

		assertEquals(map.size(), 63);
	}

	@Test
	public void testHeader() {
		String header = testPattern.getFileHeader();

		assertEquals(header, header);
	}

	@Test
	public void testFooter() {

		String footer = testPattern.getFileFooter();

		assertEquals(footer, footer);
	}

	@Test
	public void testPF() {
		String result = testPattern.getPresentationFooter();

		assertEquals(result, result);
	}
	
//	@Test
//	public void testMap() {
//		Map<String, Supplier<DynamicConverter>> map  = testPattern.getEffectiveConverterMap();
//
//		assertEquals(map.size(), 63);
//	}
}
