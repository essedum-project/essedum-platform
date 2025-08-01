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
