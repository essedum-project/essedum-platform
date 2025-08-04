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

package com.infosys.icets.iamp.usm.service.impl;

import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.X509Certificate;
import org.apache.http.ProtocolException;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManagerBuilder;
import org.apache.hc.client5.http.ssl.NoopHostnameVerifier;
import org.apache.hc.client5.http.ssl.SSLConnectionSocketFactoryBuilder;
import org.apache.hc.core5.ssl.SSLContextBuilder;
import org.apache.hc.core5.ssl.TrustStrategy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;


import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;

import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
@RefreshScope
public class EmailServiceImpl {

	@LeapProperty("icip.mailserver.url")
	private String mailserverUrl;

	@LeapProperty("icip.mailserver.enabled")
	private String mailserverEnabled;

	@Value("${mailserver.accesstoken}")
	private String accessToken;

	public Boolean sendMail(String to, String subject, String message, String cc)
			throws KeyManagementException, NoSuchAlgorithmException, KeyStoreException,ProtocolException {
		if (mailserverEnabled.equalsIgnoreCase("true")) {
			TrustStrategy acceptingTrustStrategy = (X509Certificate[] chain, String authType) -> true;
			CloseableHttpClient httpClient = HttpClients.custom().setConnectionManager(PoolingHttpClientConnectionManagerBuilder.create()
	                .setSSLSocketFactory(SSLConnectionSocketFactoryBuilder.create()
	                        .setSslContext(SSLContextBuilder.create()
	                                .loadTrustMaterial(acceptingTrustStrategy)
	                                .build())
	                        .setHostnameVerifier(NoopHostnameVerifier.INSTANCE)
	                        .build())
	                .build())
	        .build();
			HttpComponentsClientHttpRequestFactory requestFactory = new HttpComponentsClientHttpRequestFactory();
			requestFactory.setHttpClient(httpClient);
			RestTemplate restTemplate = new RestTemplate(requestFactory);

			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.MULTIPART_FORM_DATA);
			headers.add("access-token", accessToken);
			MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
			map.add("to", to);
			map.add("subject", subject);
			map.add("message", message);
			if( !(cc == null ||  cc.equals(""))) { 
				map.add("cc", cc);
			} 
			HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<MultiValueMap<String, String>>(map,
					headers);
			String url = String.format("%s%s", mailserverUrl, "/api/email/message");
			restTemplate.postForEntity(url, request, null);
			return true;
		} else {
			log.error("Mail server is down");
			return false;
		}
	}

}