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
