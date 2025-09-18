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

import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.Nullable;

public class RestClientUtil {

	private final static Logger log = LoggerFactory.getLogger(RestClientUtil.class);

	public static String restApiCall(String url, String token, String apiType, @Nullable String body)
			throws IOException {

		CloseableHttpClient httpClient = HttpClients.createDefault();

		if (apiType.toLowerCase().equals("get")) {
			HttpGet httpGet = new HttpGet(url);
			httpGet.addHeader("Authorization", "Bearer " + token);
			httpGet.addHeader("Content-Type", "application/json");
			CloseableHttpResponse httpResponse = httpClient.execute(httpGet);
			if (httpResponse.getStatusLine().getStatusCode() == 200
					|| httpResponse.getStatusLine().getStatusCode() == 201) {
				//log.info("Get Api call Success");
				return new String(httpResponse.getEntity().getContent().readAllBytes());
			} else {
				log.info("Get Api call Failed and error code is: " + httpResponse.getStatusLine().toString());
				return new String(httpResponse.getEntity().getContent().readAllBytes());
			}

		}

		else if (apiType.toLowerCase().equals("post")) {

			HttpPost httpPost = new HttpPost(url);
			httpPost.addHeader("Authorization", "Bearer " + token);
			httpPost.setEntity(new StringEntity(body));
			httpPost.setHeader("Accept", "application/json");
			httpPost.setHeader("Content-Type", "application/json");
			CloseableHttpResponse httpResponse = httpClient.execute(httpPost);
			if (httpResponse.getStatusLine().getStatusCode() == 200
					|| httpResponse.getStatusLine().getStatusCode() == 201) {
				log.info("Post Api call Success");
				return new String(httpResponse.getEntity().getContent().readAllBytes());
			} else {
				log.info("Post Api call Failed and error code is: " + httpResponse.getStatusLine().toString());
				return new String(httpResponse.getEntity().getContent().readAllBytes());
			}

		}

		else if (apiType.toLowerCase().equals("put")) {

			HttpPut httpPut = new HttpPut(url);
			httpPut.addHeader("Authorization", "Bearer " + token);
			httpPut.setEntity(new StringEntity(body));
			httpPut.setHeader("Accept", "application/json");
			httpPut.setHeader("Content-Type", "application/json");
			CloseableHttpResponse httpResponse = httpClient.execute(httpPut);
			if (httpResponse.getStatusLine().getStatusCode() == 200
					|| httpResponse.getStatusLine().getStatusCode() == 201) {
				log.info("Put Api call Success");
				return new String(httpResponse.getEntity().getContent().readAllBytes());
			} else {
				log.info("Put Api call Failed and error code is: " + httpResponse.getStatusLine().toString());
				return new String(httpResponse.getEntity().getContent().readAllBytes());
			}
		}

		else {
			return "Please provide appropriate apiType!";

		}

	}

	public static String getApiCall(String url, String token) throws IOException {

		CloseableHttpClient httpClient = HttpClients.createDefault();
		HttpGet httpGet = new HttpGet(url);
		httpGet.addHeader("Authorization", "Bearer " + token);
		httpGet.addHeader("Content-Type", "application/json");
		CloseableHttpResponse httpResponse = httpClient.execute(httpGet);
		if (httpResponse.getStatusLine().getStatusCode() == 200
				|| httpResponse.getStatusLine().getStatusCode() == 201) {
			//log.info("Get Api call Success");
		} else {
			log.info("Get Api call Failed and error code is: " + httpResponse.getStatusLine().toString());
		}

		return new String(httpResponse.getEntity().getContent().readAllBytes());

	}
	
	public static String getApiCallWithHeaders(String url, String token, Map<String, String> headers) throws IOException {

		CloseableHttpClient httpClient = HttpClients.createDefault();
		HttpGet httpGet = new HttpGet(url);
		 for (Map.Entry<String, String> entry : headers.entrySet()) {
			 httpGet.setHeader(entry.getKey(), entry.getValue());
		    }
		CloseableHttpResponse httpResponse = httpClient.execute(httpGet);
		if (httpResponse.getStatusLine().getStatusCode() == 200
				|| httpResponse.getStatusLine().getStatusCode() == 201) {
			//log.info("Get Api call Success");
		} else {
			log.info("Get Api call Failed and error code is: " + httpResponse.getStatusLine().toString());
		}

		return new String(httpResponse.getEntity().getContent().readAllBytes());

	}

	public static String postApiCall(String url, String token, String body) throws IOException {

		CloseableHttpClient httpClient = HttpClients.createDefault();
		HttpPost httpPost = new HttpPost(url);
		httpPost.addHeader("Authorization", "Bearer " + token);
		httpPost.setEntity(new StringEntity(body));
		httpPost.setHeader("Accept", "application/json");
		httpPost.setHeader("Content-Type", "application/json");
		CloseableHttpResponse httpResponse = httpClient.execute(httpPost);
		if (httpResponse.getStatusLine().getStatusCode() == 200
				|| httpResponse.getStatusLine().getStatusCode() == 201) {
			log.info("Post Api call Success");
		} else {
			log.info("Post Api call Failed and error code is: " + httpResponse.getStatusLine().toString());

		}
		return new String(httpResponse.getEntity().getContent().readAllBytes());

	}

	public static String putApiCall(String url,String token, Map<String, String> headers, String body) throws IOException {

		CloseableHttpClient httpClient = HttpClients.createDefault();
		HttpPut httpPut = new HttpPut(url);
		httpPut.setEntity(new StringEntity(body));
		 for (Map.Entry<String, String> entry : headers.entrySet()) {
			 httpPut.setHeader(entry.getKey(), entry.getValue());
		    }
		 
		CloseableHttpResponse httpResponse = httpClient.execute(httpPut);
		if (httpResponse.getStatusLine().getStatusCode() == 200
				|| httpResponse.getStatusLine().getStatusCode() == 201) {
			log.info("Put Api call Success");
		} else {
			log.info("Put Api call Failed and error code is: " + httpResponse.getStatusLine().toString());
		}

		return new String(httpResponse.getEntity().getContent().readAllBytes());

	}

	public static String deleteApiCall(String url, String token) throws IOException {
		CloseableHttpClient httpClient = HttpClients.createDefault();
		HttpDelete httpDelete = new HttpDelete(url);
		httpDelete.addHeader("Authorization", "Bearer " + token);
		httpDelete.setHeader("Content-Type", "application/json");
		CloseableHttpResponse httpResponse = httpClient.execute(httpDelete);

		if (httpResponse.getStatusLine().getStatusCode() == 200
				|| httpResponse.getStatusLine().getStatusCode() == 201) {
			log.info("Delete Api call Success");
		} else {
			log.info("Delete Api call Failed and error code is: " + httpResponse.getStatusLine().toString());
		}

		return new String(httpResponse.getEntity().getContent().readAllBytes());

	}

}
