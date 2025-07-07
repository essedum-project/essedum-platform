package com.infosys.icets.icip.mlops.rest.service.impl;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.http.HttpEntity;
import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.ssl.SSLContextBuilder;
import org.apache.http.ssl.TrustStrategy;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.infosys.icets.icip.dataset.constants.ICIPPluginConstants;

@Service
public class ICIPMlOpsRestAdapterService {

	/** The leap url. */
	@Value("${LEAP_ULR}")
	private String referer;
	
	/** The icip pathPrefix. */
	@Value("${icip.pathPrefix}")
	private String icipPathPrefix;

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPMlOpsRestAdapterService.class);

	public String callGetMethod(String adaptername, String methodname, String org, Map<String, String> headers,
			Map<String, String> params) throws ClientProtocolException, IOException, URISyntaxException,
			NoSuchAlgorithmException, KeyStoreException, KeyManagementException {
		String host = getHostFromHeader(headers);
		if (host == null || host.isEmpty()) {
			/* Taking LEAP URL Path as host if referer is not present in the headers */
			host = referer;
			logger.info("referer generated:{}", host);
		} else {
			logger.info("referer taken from headers:{}", host);
		}
		SSLContextBuilder builder = new SSLContextBuilder();
		builder.loadTrustMaterial(null, new TrustStrategy() {
			@Override
			public boolean isTrusted(X509Certificate[] chain, String authType) throws CertificateException {
				return true;
			}
		});
		SSLConnectionSocketFactory sslsf = new SSLConnectionSocketFactory(builder.build());
		CloseableHttpClient httpClient = HttpClients.custom().setSSLSocketFactory(sslsf).build();
		HttpGet httpGet = new HttpGet(
				host + icipPathPrefix + "/adapters/" + adaptername + "/" + methodname + "/" + org);
		for (Map.Entry<String, String> header : headers.entrySet()) {
			httpGet.addHeader(header.getKey(), header.getValue());
		}
		List<NameValuePair> nvpList = new ArrayList<>(params.size());
		for (Map.Entry<String, String> param : params.entrySet()) {
			nvpList.add(new BasicNameValuePair(param.getKey(), param.getValue()));
		}
		URI paramsUri = new URIBuilder(httpGet.getURI()).addParameters(nvpList).build();
		httpGet.setURI(paramsUri);
		return EntityUtils.toString(httpClient.execute(httpGet).getEntity());
	}

	public String callPostMethod(String adaptername, String methodname, String org, Map<String, String> headers,
			Map<String, String> params, String body) throws ClientProtocolException, IOException, URISyntaxException,
			NoSuchAlgorithmException, KeyStoreException, KeyManagementException {
		String host = getHostFromHeader(headers);
		if (host == null || host.isEmpty()) {
			/* Taking LEAP URL Path as host if referer is not present in the headers */
			host = referer;
			logger.info("referer generated:{}", host);
		} else {
			logger.info("referer taken from headers:{}", host);
		}
		SSLContextBuilder builder = new SSLContextBuilder();

		builder.loadTrustMaterial(null, new TrustStrategy() {
			@Override
			public boolean isTrusted(X509Certificate[] chain, String authType) throws CertificateException {
				return true;
			}
		});
		SSLConnectionSocketFactory sslsf = new SSLConnectionSocketFactory(builder.build());
		CloseableHttpClient httpClient = HttpClients.custom().setSSLSocketFactory(sslsf).build();
		HttpPost httpPost = new HttpPost(
				host + icipPathPrefix + "/adapters/" + adaptername + "/" + methodname + "/" + org);
		for (Map.Entry<String, String> header : headers.entrySet()) {
			if (!"Content-Length".equalsIgnoreCase(header.getKey()))
				httpPost.addHeader(header.getKey(), header.getValue());
		}
		List<NameValuePair> nvpList = new ArrayList<>(params.size());
		for (Map.Entry<String, String> param : params.entrySet()) {
			nvpList.add(new BasicNameValuePair(param.getKey(), param.getValue()));
		}
		URI paramsUri = new URIBuilder(httpPost.getURI()).addParameters(nvpList).build();
		httpPost.setURI(paramsUri);

		HttpEntity bodyEntity = new StringEntity(body);
		httpPost.setEntity(bodyEntity);

		return EntityUtils.toString(httpClient.execute(httpPost).getEntity());
	}

	public String callDeleteMethod(String adaptername, String methodname, String org, Map<String, String> headers,
			Map<String, String> params) throws ClientProtocolException, IOException, URISyntaxException,
			NoSuchAlgorithmException, KeyStoreException, KeyManagementException {
		String host = getHostFromHeader(headers);
		if (host == null || host.isEmpty()) {
			/* Taking LEAP URL Path as host if referer is not present in the headers */
			host = referer;
			logger.info("referer generated:{}", host);
		} else {
			logger.info("referer taken from headers:{}", host);
		}
		SSLContextBuilder builder = new SSLContextBuilder();
		builder.loadTrustMaterial(null, new TrustStrategy() {
			@Override
			public boolean isTrusted(X509Certificate[] chain, String authType) throws CertificateException {
				return true;
			}
		});
		SSLConnectionSocketFactory sslsf = new SSLConnectionSocketFactory(builder.build());
		CloseableHttpClient httpClient = HttpClients.custom().setSSLSocketFactory(sslsf).build();
		HttpDelete httpDelete = new HttpDelete(
				host + icipPathPrefix + "/adapters/" + adaptername + "/" + methodname + "/" + org);
		for (Map.Entry<String, String> header : headers.entrySet()) {
			httpDelete.addHeader(header.getKey(), header.getValue());
		}
		List<NameValuePair> nvpList = new ArrayList<>(params.size());
		for (Map.Entry<String, String> param : params.entrySet()) {
			nvpList.add(new BasicNameValuePair(param.getKey(), param.getValue()));
		}
		URI paramsUri = new URIBuilder(httpDelete.getURI()).addParameters(nvpList).build();
		httpDelete.setURI(paramsUri);

		return EntityUtils.toString(httpClient.execute(httpDelete).getEntity());
	}

	private String getHostFromHeader(Map<String, String> headers) {
		String hostFromHeader = null;
		hostFromHeader = headers.get(ICIPPluginConstants.REFERER_TITLE_CASE);
		if (hostFromHeader == null || hostFromHeader.isEmpty()) {
			hostFromHeader = headers.get(ICIPPluginConstants.REFERER_LOWER_CASE);
		}
		return hostFromHeader;
	}
}
