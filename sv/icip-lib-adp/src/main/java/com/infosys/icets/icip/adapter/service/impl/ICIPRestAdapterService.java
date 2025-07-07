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
package com.infosys.icets.icip.adapter.service.impl;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.commons.io.FileUtils;
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
import org.springframework.web.multipart.MultipartFile;

import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;
import com.infosys.icets.icip.dataset.constants.ICIPPluginConstants;


@Service
public class ICIPRestAdapterService {
		
	/** The folder path. */
	@LeapProperty("icip.fileuploadDir")
	private String folderPath;
	
	/** The icip pathPrefix. */
	@Value("${icip.pathPrefix}")
	private String icipPathPrefix;
	
	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPRestAdapterService.class);

	public String callGetMethod(String host, String adaptername, String methodname, String org,
			Map<String, String> headers, Map<String, String> params)
			throws ClientProtocolException, IOException, URISyntaxException, NoSuchAlgorithmException, KeyStoreException, KeyManagementException {
		SSLContextBuilder builder = new SSLContextBuilder();
		builder.loadTrustMaterial(null, new TrustStrategy() {
			 @Override
			 public boolean isTrusted(X509Certificate[] chain, String authType) throws CertificateException {return true;}});
		SSLConnectionSocketFactory sslsf = new SSLConnectionSocketFactory(
				 builder.build());
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

	public String callPostMethod(String host, String adaptername, String methodname, String org,
			Map<String, String> headers, Map<String, String> params, String body)
			throws ClientProtocolException, IOException, URISyntaxException, NoSuchAlgorithmException, KeyStoreException, KeyManagementException {
		SSLContextBuilder builder = new SSLContextBuilder();

		builder.loadTrustMaterial(null, new TrustStrategy() {
			 @Override
			 public boolean isTrusted(X509Certificate[] chain, String authType) throws CertificateException {return true;}});
		SSLConnectionSocketFactory sslsf = new SSLConnectionSocketFactory(
				 builder.build());
		CloseableHttpClient httpClient = HttpClients.custom().setSSLSocketFactory(sslsf).build();
		HttpPost httpPost = new HttpPost(
				host + icipPathPrefix + "/adapters/" + adaptername + "/" + methodname + "/" + org);
		for (Map.Entry<String, String> header : headers.entrySet()) {
			if(!"Content-Length".equalsIgnoreCase(header.getKey()))
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

	public String callDeleteMethod(String host, String adaptername, String methodname, String org,
			Map<String, String> headers, Map<String, String> params)
			throws ClientProtocolException, IOException, URISyntaxException, NoSuchAlgorithmException, KeyStoreException, KeyManagementException {
		SSLContextBuilder builder = new SSLContextBuilder();
		builder.loadTrustMaterial(null, new TrustStrategy() {
			 @Override
			 public boolean isTrusted(X509Certificate[] chain, String authType) throws CertificateException {return true;}});
		SSLConnectionSocketFactory sslsf = new SSLConnectionSocketFactory(
				 builder.build());
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
	
	public Map<String, String> uploadTempFileForAdapter(MultipartFile file, String org, String adapterName,
			String methodName) {
		Map<String, String> resUploadTemp = new HashMap<>();
		String fileid = org.concat("/" + adapterName);
		fileid = fileid.concat("/" + methodName);
		String chunkIndex = String.valueOf(file.getOriginalFilename());
		String s = "/";
		if (folderPath.charAt(folderPath.length() - 1) == '/') {
			s = "";
		}
		String filePath = String.format("%s%s%s/%s", folderPath, s, fileid, chunkIndex);
		String directoryPath = String.format("%s%s%s", folderPath, s, fileid);
		Path path = Paths.get(filePath);
		try {
			/* Clean files at Specified Directory Path */
			Files.createDirectories(path.getParent());
			File directory = new File(directoryPath);
			FileUtils.cleanDirectory(directory);

			/* Copy file to server path */
			Files.write(path, file.getBytes());
			resUploadTemp.put(ICIPPluginConstants.UPLOAD_DIRECORY_PATH, directoryPath);
			resUploadTemp.put(ICIPPluginConstants.UPLOAD_FILE_PATH, filePath);
			resUploadTemp.put(ICIPPluginConstants.FILE, file.getOriginalFilename());
		} catch (IOException e) {
			logger.error("Error because of:{} at class:{} and line:{}", e.getMessage(), e.getStackTrace()[0].getClass(),
					e.getStackTrace()[0].getLineNumber());
			if (logger.isDebugEnabled()) {
				logger.error("Error due to:", e);
			}
		}
		return resUploadTemp;
	}
}
