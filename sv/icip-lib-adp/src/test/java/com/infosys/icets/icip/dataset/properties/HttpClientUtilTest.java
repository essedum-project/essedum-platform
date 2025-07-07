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
package com.infosys.icets.icip.dataset.properties;

import java.net.URI;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.slf4j.Logger;

import com.infosys.icets.icip.dataset.properties.ProxyProperties.HttpProxyConfiguration;

public class HttpClientUtilTest {

	String authType;
	String username;
	String pwd;
	URI uri;
	ProxyProperties proxyProperties;

	@InjectMocks
	HttpClientUtil httpClientUtil;
	@Mock
	private Logger logger;
	
	HttpProxyConfiguration httpProxyConfiguration;
/*
	@BeforeAll
	void setUp() throws Exception {

		authType = "BasicAuth";
		username = "admin";
		pwd = "admin";
		uri = new URI("https://www.google.com/");
		proxyProperties = new ProxyProperties();
		httpProxyConfiguration = new HttpProxyConfiguration();
		httpProxyConfiguration.setProxyHost("10.81.82.184");
		httpProxyConfiguration.setProxyPort(80);
		httpProxyConfiguration.setProxyUser(null);
		httpProxyConfiguration.setProxyPassword(null);
		proxyProperties.setHttpProxyConfiguration(httpProxyConfiguration);
	}*/


/*	@Test
	public void testGetHttpClient() throws Exception {
		String result="test";
		assertEquals(httpClientUtil.getHttpClient(authType,username,pwd,uri,proxyProperties).toString(),result);
	}
*/
}
