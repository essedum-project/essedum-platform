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
