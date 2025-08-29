package com.lfn.common.lib.rest;

import java.io.IOException;

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

	public static String getUsmConstants(String url, String projectId, String authHeader) throws IOException {

		String[] values = authHeader.split("Bearer");
		String token = values[values.length - 1].trim();
		String result = RestClientUtil.getApiCall(url + "api/get-dash-constants?projectId=" + projectId,projectId, token);
		if (result != null && !result.isEmpty() && result != "" && !result.contains("error\":")) {
			return result;
		}
		return null;
	}

	public static String getKeyUsmConstants(String url, String projectId, String key, String authHeader)
			throws IOException {
		try {
			String[] values = authHeader.split("Bearer");
			String token = values[values.length - 1].trim();

			String result = RestClientUtil
					.getApiCall(url + "api/get-extension-key?projectId=" + projectId + "&key=" + key,projectId, token);
			log.info("api/get-extension-key?projectId=" + projectId + "&key=" + key+" result="+result);
			if (result != null && !result.isEmpty() && result != "" && !result.contains("error\":")) {
				return result;
			}
		} catch (Exception e) {
			e.printStackTrace();
			log.info(e.getMessage());
		}
		
		return null;
	}
}
