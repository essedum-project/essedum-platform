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

import java.io.IOException;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class USMRest {

	private final static Logger log = LoggerFactory.getLogger(USMRest.class);

	public static String getPorfolioProject(String url, String portfolio, String authHeader) throws IOException {

		String[] values = authHeader.split("Bearer");
		String token = values[values.length - 1].trim();
		String result = RestClientUtil.getApiCall(url + "/api/getPortfolioProjects/" + portfolio, token);
		if (result != null && !result.isEmpty() && result != "" && !result.contains("error")) {
			log.info(result);
			return result;
		}
		return null;
	}
	
	public static String getUsmConstants(String url,String projectId, String authHeader,Map<String, String> headers) throws IOException {

		String[] values = authHeader.split("Bearer");
		String token = values[values.length - 1].trim();
		String result = RestClientUtil.getApiCallWithHeaders(url + "api/get-dash-constants?projectId=" + projectId, token,headers);
		if (result != null && !result.isEmpty() && result != "" && !result.contains("error\":")) {
			return result;
		}
		return null;
	}
}
