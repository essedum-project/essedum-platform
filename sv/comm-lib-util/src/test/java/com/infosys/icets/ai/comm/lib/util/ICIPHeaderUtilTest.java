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

public class ICIPHeaderUtilTest {

	private static final String APPLICATION_NAME = "icipwebeditor";

	@Test
	public void TestcreateAlert() {
		
		String message = "Message added";
		String param = "param added";
		
		HttpHeaders headers = ICIPHeaderUtil.createAlert(message, param);
		assertEquals(headers.get("X-icipwebeditor-alert").get(0), message);
	}
	
	@Test
	public void TestcreateEntityCreationAlert() {
		String entityName="entity name";
		String param="param added";
		
		HttpHeaders headers= ICIPHeaderUtil.createEntityCreationAlert(entityName, param);
		String str=APPLICATION_NAME + "." + entityName + ".created";
		assertEquals(headers.get("X-icipwebeditor-alert").get(0),str);
	}
	
	@Test
	public void TestcreateEntityUpdateAlert() {
		String entityName="entity name";
		String param="param added";
		
		HttpHeaders headers= ICIPHeaderUtil.createEntityUpdateAlert(entityName, param);
		String str=APPLICATION_NAME + "." + entityName + ".updated";
		assertEquals(headers.get("X-icipwebeditor-alert").get(0),str);
	}
	
	@Test
	public void TestcreateEntityDeletionAlert() {
		String entityName="entity name";
		String param="param added";
		
		HttpHeaders headers= ICIPHeaderUtil.createEntityDeletionAlert(entityName, param);
		String str=APPLICATION_NAME + "." + entityName + ".deleted";
		assertEquals(headers.get("X-icipwebeditor-alert").get(0),str);
	}
	
	@Test
	public void TestcreateFailureAlert() {
		String entityName="entity name";
		String errorKey="error key";
		String defaultMessage="default message";
		
		HttpHeaders headers=ICIPHeaderUtil.createFailureAlert(entityName, errorKey, defaultMessage);
		assertEquals(headers.get("X-icspApp-error").get(0), "error."+ errorKey);
	}
	
	@Test
	public void TestcustomQueryAlert() {
		String entityName="entity name";
		String string ="added";
		HttpHeaders headers=ICIPHeaderUtil.customQueryAlert(entityName, string);
		assertEquals(headers.get("X-pamApp-error").get(0), "error." + string);
	}
}
