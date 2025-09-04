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

package com.lfn.icip.dataset.properties;

import java.net.URI;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.slf4j.Logger;

import com.lfn.icip.dataset.properties.ProxyProperties.HttpProxyConfiguration;

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
