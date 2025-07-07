/**
 * @ 2021 - 2022 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.common.lib.rest;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class RestApiAuth {

	private final static Logger log = LoggerFactory.getLogger(RestApiAuth.class);

	public static Boolean validate(String url, String authHeader) throws IOException {

		String[] values = authHeader.split("Bearer");
		String token = values[values.length - 1].trim();
		String result = RestClientUtil.getApiCall(url + "api/validateUser", token);
		if (result != null && !result.isEmpty() && result != "" && !result.contains("error")) {
			log.info(result);
			return true;
		}
		return false;
	}

	public static Boolean validate(String url, Map<String, String> map) throws IOException {
		
		
		String result = RestClientUtil.getApiCall(url + "api/validateUser", map);
		if (result != null && !result.isEmpty() && result != "" && !result.contains("error")) {
			log.info(result);
			return true;
		}
		return false;
	}

}
