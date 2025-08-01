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

package com.infosys.icets.ai.comm.lib.util;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;

public class HeaderUtilTest {

	private static final String APPLICATION_NAME = "Icip App";

	// public static HeaderUtil file;

	@Test
	public void testCreateAlert() {

		String message1 = "added message";
		String param1 = "added param";

		HttpHeaders headers = HeaderUtil.createAlert(message1, param1);

		assertEquals(headers.get("X-" + APPLICATION_NAME + "-alert").get(0), message1);
	}
	
	@Test
	public void testCreateEntityCreationAlert() {
		String entityName="entity name added";
		String param="param added";
		HttpHeaders headers = HeaderUtil.createEntityCreationAlert(entityName, param);
		String str="A new " + entityName + " is created with identifier " + param;
		assertEquals(headers.get("X-" + APPLICATION_NAME + "-alert").get(0), str);
	}
	
	
	@Test
	public void testCreateEntityUpdateAlert() {
		String entityName="entity name added";
		String param="param added";
		HttpHeaders headers = HeaderUtil.createEntityUpdateAlert(entityName, param);
		String str="A " + entityName + " is updated with identifier " + param;
		assertEquals(headers.get("X-" + APPLICATION_NAME + "-alert").get(0),str);
	}
	
	@Test
	public void testCreateEntityDeletionAlert() {
		String entityName="entity name added";
		String param="param added";
		HttpHeaders headers = HeaderUtil.createEntityDeletionAlert(entityName, param);
		String str="A " + entityName + " is deleted with identifier " + param;
		assertEquals(headers.get("X-" + APPLICATION_NAME + "-alert").get(0),str);
	}
	
	@Test
	public void testCreateFailureAlert() {
		String entityName="entity name added";
		String defaultMessage="defaultMessage added";
		String errorKey="ErrorKey";
		HttpHeaders headers = HeaderUtil.createFailureAlert(entityName,errorKey, defaultMessage);
		assertEquals(headers.get("X-" + APPLICATION_NAME + "-error").get(0),defaultMessage);
	}
	
	
	@Test
	public void testCustomQueryAlert() {
		String entityName="entity name added";
		String str="stringAdded";
		HttpHeaders headers = HeaderUtil.customQueryAlert(entityName,str);
		assertEquals(headers.get("X-pamApp-error").get(0),"error." + str);
	}
}
