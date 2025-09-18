/**
 * The MIT License (MIT)
 * Copyright © 2025 Essedum
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

package com.lfn.ai.comm.lib.util;

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
