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
package com.lfn.icip.dataset.service.util;

import java.security.NoSuchAlgorithmException;
import java.security.UnrecoverableKeyException;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import javax.net.ssl.SSLContext;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.security.InvalidKeyException;
import java.security.KeyManagementException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.AuthCache;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.protocol.HttpClientContext;
import org.apache.http.conn.ssl.TrustStrategy;
import org.apache.http.impl.auth.BasicScheme;
import org.apache.http.impl.client.BasicAuthCache;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.ssl.SSLContexts;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.util.Base64Utils;

import com.google.gson.JsonObject;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.icip.dataset.constants.ICIPPluginConstants;
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.properties.HttpClientUtil;
import com.lfn.icip.dataset.properties.ProxyProperties;
import com.lfn.icip.dataset.service.impl.ICIPDatasetPluginsService;
import com.lfn.icip.dataset.service.util.IICIPDataSetServiceUtil.DATATYPE;
import com.lfn.icip.dataset.service.util.IICIPDataSetServiceUtil.SQLPagination;
import com.lfn.icip.dataset.util.ICIPRestPluginUtils;

//
/**
 * The Class ICIPDataSourceServiceUtilAzure.
 *
 * @author lfn
 */
@Component("azuresource")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class ICIPDataSourceServiceUtilAzure extends ICIPDataSourceServiceUtilRestAbstract {
	
	@Autowired
	private ICIPDatasetPluginsService datasetPluginService;
	
	/** The logger. */
	private static Logger logger = LoggerFactory.getLogger(ICIPDataSourceServiceUtilAzure.class);
	
	/** The Constant PSTR. */
	private static final String PSTR = "password"; // Compliant
	
	/** The proxy properties. */
	private ProxyProperties proxyProperties;

	/**
	 * Instantiates a new ICIP data source service util rest.
	 *
	 * @param proxyProperties the proxy properties
	 */
	public ICIPDataSourceServiceUtilAzure(ProxyProperties proxyProperties) {
		super(proxyProperties);
		this.proxyProperties = proxyProperties;
	}
	/**
	 * Test connection.
	 *
	 * @param datasource the datasource
	 * @return true, if successful
	 */
	@Override
	public boolean testConnection(ICIPDatasource datasource) {
		JSONObject connectionDetails = new JSONObject(datasource.getConnectionDetails());
		connectionDetails.optJSONObject("AuthDetails");
		
		String executionEnvironment = connectionDetails.optString("executionEnvironment");
		if (ICIPPluginConstants.REMOTE.equalsIgnoreCase(executionEnvironment)) {
			logger.info("Connection Test, executionEnvironment:{}", executionEnvironment);
		try (CloseableHttpResponse response = authenticate(datasource)) {
			System.out.println(response.getStatusLine().getStatusCode());
			if (response.getStatusLine().getStatusCode() == 200) {
				return true;
			}
		} catch (KeyManagementException | NoSuchAlgorithmException | KeyStoreException | IOException
				| URISyntaxException e) {
			logger.error(e.getMessage());
		} catch (Exception e1) {
			e1.printStackTrace();
		}
		return false;
		
		}
		return false;
			
	}

	
	/**
	 * Gets the json.
	 *
	 * @return the json
	 */
	@Override
	public JSONObject getJson() {
		//getJson method is for the attributes that come in ui, which are required.
		JSONObject ds = super.getJson();
		try {
			ds.put("type", "AZURE");
			ds.put("category", "REST");
			JSONObject attributes = ds.getJSONObject(ICIPDataSourceServiceUtil.ATTRIBUTES);
			attributes.put("AuthType", "NoAuth");
			attributes.put("NoProxy", "true");
			attributes.put("ConnectionType", "ApiSpec");
			attributes.put("Url" , "");
			attributes.put("AuthDetails", "{}");
			attributes.put("testDataset", "{\"name\":\"\",\"attributes\":{\"RequestMethod\":\"POST\",\"Headers\":\"\","
					+ "\"QueryParams\":\"{}\",\"Body\":\"\",\"Endpoint\":\"\"}}");
			
			
			attributes.put("tokenExpirationTime", "");
			attributes.put("objectKey", "");
			attributes.put("localFilePath", "");
			attributes.put("datasource", "");
			attributes.put("bucketName", "");
			//attributes.put("projectId", "");
			attributes.put("storageType", "");
			attributes.put("userId", "");
			attributes.put("executionEnvironment", "Native");
			JSONObject formats = new JSONObject();

			formats.put("batchEndpointsName", "input");
			formats.put("batchEndpointsName-dp", "Batch Endpoints Name");
			formats.put("inferencePipeline_api-version", "input");
			formats.put("inferencePipeline_api-version-dp", "Inference Pipeline Api Version");
			formats.put("resourceGroupName", "input");
			formats.put("resourceGroupName-dp", "Resource Group Name");
			formats.put("datasets_api-version", "input");
			formats.put("datasets_api-version-dp", "Datasets Api Version");
			formats.put("trainingPipeline_api-version", "input");
			formats.put("trainingPipeline_api-version-dp", "Training Pipeline Api Version");
			formats.put("endpoints_api-version", "input");
			formats.put("endpoints_api-version-dp", "Endpoints Api Version");
			formats.put("workspaceName", "input");
			formats.put("workspaceName-dp", "Workspace Name"); 
			formats.put("subscriptionId", "input");
			formats.put("subscriptionId-dp", "Subscription ID");
			formats.put("models_api-version", "input");
			formats.put("models_api-version-dp", "Models Api Version");
			
			ds.put(ICIPDataSourceServiceUtil.ATTRIBUTES, attributes);
			ds.put("formats", formats);
		} catch (JSONException e) {
			logger.error("plugin attributes mismatch", e);
		}
		return ds;
	}
	
	@Override
	public ICIPDatasource setHashcode(boolean isVault, ICIPDatasource datasource) throws NoSuchAlgorithmException {
		JsonObject obj = new JsonObject();
		JSONObject connectionDetails = new JSONObject(datasource.getConnectionDetails());
		String pstr = connectionDetails.optString(PSTR, "");
		String vaultkey = connectionDetails.optString(ICIPDataSourceServiceUtil.VAULTKEY, null);
		if (vaultkey != null && !vaultkey.trim().isEmpty()) {
			obj.addProperty(ICIPDataSourceServiceUtil.VAULTKEY, vaultkey);
		} else {
			if (!pstr.isEmpty() && !pstr.startsWith("enc")) {
				obj.addProperty(PSTR, pstr);
			}
		}
		
		String username = connectionDetails.optString("username");
		String url = connectionDetails.optString("url");
		obj.addProperty("userName", username);
		obj.addProperty("url", url);
		String objString = obj.toString();
		datasource.setDshashcode(ICIPUtils.createHashString(objString));
		return datasource;
	}
	
	@Override
	public JSONObject isTabularViewSupported(ICIPDatasource datasource) {
		return new JSONObject("{Tabular View:false}");
	}
	
	@Override
	public void createDatasets(ICIPDatasource datasource, Marker marker) {
		
		JSONObject content = this.readJsonFile(datasource);
		
		String baseUrl = content.optJSONArray("servers").getJSONObject(0).optString("url");
		JSONObject paths = content.optJSONObject("paths");
		Iterator<String> itr = paths.keys();
		
		while(itr.hasNext()) {
			
			String path = itr.next();
			String requestUrl = baseUrl + path;
			JSONObject apiSpecObj = paths.optJSONObject(path);
			Set<String> reqMethods = apiSpecObj.keySet();
			
			for(String method : reqMethods){
				
				JSONObject reqObj = apiSpecObj.optJSONObject(method);
				JSONArray qParams = new JSONArray();
				
				if(reqObj.has("parameters")) {
					JSONArray queryParamArr = reqObj.optJSONArray("parameters");
					for(int len = 0; len<queryParamArr.length(); len++) {
						JSONObject paramsObj = queryParamArr.getJSONObject(len);
						if(paramsObj.optString("in").equalsIgnoreCase("query")) {
							JSONObject temp = new JSONObject();
							temp.put("value", paramsObj.optString("example"));
							temp.put("key", paramsObj.optString("name"));
							qParams.put(temp);
						}
					}
				}
				
				JSONObject attributes = new JSONObject();
				attributes.put("Url", requestUrl);
				attributes.put("QueryParams", qParams);
				attributes.put("transformData", false);
				attributes.put("TransformationScript", "[]");
				
				attributes.put("RequestMethod", method.toUpperCase());
				
				if(method.equalsIgnoreCase("post")) {
					
					JSONObject reqBody = new JSONObject();
					JSONObject reqBodyContent = reqObj.optJSONObject("requestBody").optJSONObject("content");
					String contentType = reqBodyContent.keys().next();
					JSONObject values = reqBodyContent.optJSONObject(contentType).optJSONObject("example");
					for(String key : values.keySet()) {
						reqBody.put(key, values.optString(key));
					}
					
					attributes.put("Body", reqBody.toString());
					JSONArray headers = new JSONArray();
					JSONObject headersObj = new JSONObject("{\"value\":\"\",\"key\":\"Content-Type\"}");
					headersObj.put("value", contentType);
					headers.put(headersObj);
					
					attributes.put("Headers", headers);
					attributes.put("bodyType", "JSON");
					attributes.put("bodyOption", "raw");
				}
				
				ICIPDataset dataset = new ICIPDataset();
				
				dataset.setDatasource(datasource);
				dataset.setOrganization(datasource.getOrganization());
				dataset.setType("r");
				dataset.setDescription(reqObj.optString("summary"));
				dataset.setAlias(reqObj.optString("operationId"));
				dataset.setAttributes(attributes.toString());
				
				pluginService.save(null, dataset);
				logger.info(marker, "Dataset successfully created : "+ dataset.getAlias());
					
			}
		}
	}
	
	protected CloseableHttpResponse authenticate(ICIPDatasource datasource) throws URISyntaxException, IOException,
	NoSuchAlgorithmException, InvalidKeyException, KeyManagementException, KeyStoreException {

		JSONObject connectionDetails = new JSONObject(datasource.getConnectionDetails());
		JSONObject authDetailsObj = new JSONObject(connectionDetails.optString("AuthDetails"));
		String authType = connectionDetails.optString("AuthType");
		String noProxyString = connectionDetails.optString("NoProxy");
		String urlString = connectionDetails.optString("Url").trim();
		String userName = authDetailsObj.optString("username").trim();
		String password = authDetailsObj.optString("password");
		String testDataset = new JSONObject(connectionDetails.optString("testDataset")).optString("attributes");
		String method = "POST";
		String headers = new JSONObject(testDataset).optString("Headers");
		JSONArray headersArray = new JSONArray();
		Boolean isContentTypePresent = false;
		if (headers != null && !headers.isEmpty()) {
			headersArray = new JSONObject(testDataset).getJSONArray("Headers");
			if (headersArray != null) {
				for (Object o : headersArray) {
					JSONObject jsonLineItem = (JSONObject) o;
					if ("Content-Type".equalsIgnoreCase(jsonLineItem.getString(ICIPPluginConstants.KEY)))
						isContentTypePresent = true;
				}
			}
		}
		if (!isContentTypePresent) {
			JSONObject headerObj = new JSONObject();
			headerObj.put(ICIPPluginConstants.KEY, "Content-Type");
			headerObj.put(ICIPPluginConstants.VALUE, "application/json");
			headersArray.put(headerObj);
			headers = headersArray.toString();
		}
		
		String params = new JSONObject(testDataset).optString("QueryParams");
		
		Map<String, String> bodyMap = new HashMap<>();
		bodyMap.put("batchEndpointsName", connectionDetails.optString("batchEndpointsName"));
		bodyMap.put("inferencePipeline_api-version", connectionDetails.optString("inferencePipeline_api-version"));
		bodyMap.put("resourceGroupName", connectionDetails.optString("resourceGroupName"));
		//bodyMap.put("private_key", connectionDetails.optString("private_key").replace("\\n", "\n"));
		bodyMap.put("datasets_api-version", connectionDetails.optString("datasets_api-version"));
		bodyMap.put("trainingPipeline_api-version", connectionDetails.optString("trainingPipeline_api-version"));
		bodyMap.put("endpoints_api-version", connectionDetails.optString("endpoints_api-version"));
		bodyMap.put("workspaceName", connectionDetails.optString("workspaceName"));
		bodyMap.put("subscriptionId", connectionDetails.optString("subscriptionId"));
		bodyMap.put("models_api-version", connectionDetails.optString("models_api-version"));
//		bodyMap.put("regionName", connectionDetails.optString("regionName"));
		String body = JSONObject.valueToString(bodyMap);
		
		String bodyType = new JSONObject(testDataset).optString("bodyType").trim();
		String authToken = null;
		String headerPrefix = authDetailsObj.optString("HeaderPrefix", "Bearer");
		boolean mtlsAdded = connectionDetails.optBoolean("CertsAdded");
		String certpath = connectionDetails.optString("CertPath");
		String keypass = connectionDetails.optString("KeyPass");
		urlString = replaceUrlString(urlString, new JSONObject(testDataset));
		URI uri = new URI(urlString);
		
		HttpHost targetHost = new HttpHost(uri.getHost(), uri.getPort(), uri.getScheme());
		HttpClientContext context = null;
		
		ICIPRestPluginUtils.validateProxy(uri, noProxyString, proxyProperties);
		
		switch (authType.toLowerCase(Locale.ENGLISH)) {
		
		case NOAUTH:
			break;
		
		case BASIC:
		
			CredentialsProvider credsProvider = new BasicCredentialsProvider();
			credsProvider.setCredentials(new AuthScope(uri.getHost(), uri.getPort()),
					new UsernamePasswordCredentials(userName, password));
			AuthCache authCache = new BasicAuthCache();
			BasicScheme basicAuth = new BasicScheme();
			authCache.put(targetHost, basicAuth);
			context = HttpClientContext.create();
			context.setCredentialsProvider(credsProvider);
			context.setAuthCache(authCache);
			break;
		
		case OAUTH:
		
			String tokenExp = connectionDetails.optString("tokenExpirationTime");
		
			if (tokenExp.isEmpty() || new Timestamp(Instant.now().toEpochMilli()).after(Timestamp.valueOf(tokenExp))) {
				authToken = ICIPRestPluginUtils.getAuthToken(authDetailsObj, noProxyString, proxyProperties);
		
				JSONObject tokenObj = null;
				try {
					tokenObj = new JSONObject(authToken);
					if (authDetailsObj.has("tokenElement") && authDetailsObj.optString("tokenElement").length() > 0) {
						authToken = tokenObj.optString(authDetailsObj.optString("tokenElement"));
						logger.info("New access token generated");
					}
		
				} catch (JSONException jse) {
					logger.error("exception: ", jse);
				}
		
			} else {
				authToken = connectionDetails.optString("access_token");
				logger.info("existing access token used");
			}
		
			break;
		
		case TOKEN:
			ICIPDataset dataset = new ICIPDataset();
			JSONObject tokenDataset = new JSONObject(authDetailsObj.get("tokenDataset").toString());
			dataset.setAlias(tokenDataset.optString("alias"));
			dataset.setName(tokenDataset.optString("name"));
		
			ICIPDatasource dsrc = new ICIPDatasource();
			JSONObject dsrcObj = new JSONObject(tokenDataset.get("datasource").toString());
			dsrc.setName(dsrcObj.optString("name"));
			dsrc.setAlias(dsrcObj.optString("alias"));
			dsrc.setConnectionDetails(dsrcObj.optString("connectionDetails"));
			dsrc.setDshashcode(dsrcObj.optString("dshashcode"));
			dsrc.setSalt(dsrcObj.optString("salt"));
			dsrc.setCategory(dsrcObj.optString("category"));
			dsrc.setType(dsrcObj.optString("type"));
			dsrc.setId(dsrcObj.getInt("id"));
			dataset.setDatasource(dsrc);
		
			dataset.setOrganization(tokenDataset.optString("organization"));
			dataset.setAttributes(tokenDataset.optString("attributes"));
			dataset.setId(tokenDataset.getInt("id"));
			try {
				String results = datasetPluginService.getDataSetService(dataset).getDatasetData(dataset,
						new SQLPagination(0, 1, null, 0), DATATYPE.JSONHEADER, String.class);
				authToken = results;
			} catch (SQLException e) {
				logger.error(e.getMessage());
			}
			break;
		
		case BEARER:
			authToken = authDetailsObj.optString("authToken");
			break;
		
		case HMAC:
		
			String secKey = authDetailsObj.optString("secretKey");
			String algorithm = authDetailsObj.optString("algorithm");
			String data = authDetailsObj.optString("input");
			String epochNow = String.valueOf(Instant.now().getEpochSecond());
			data.replace("{timestamp}", epochNow);
			SecretKeySpec secretKeySpec = new SecretKeySpec(secKey.getBytes(), algorithm);
			Mac mac = Mac.getInstance(algorithm);
			mac.init(secretKeySpec);
			byte[] encRes = mac.doFinal(data.getBytes());
			String authCode = new String(Base64Utils.encode(encRes));
			String authPrefix = authDetailsObj.optString("authPrefix");
			JSONArray headersArr = new JSONArray(headers);
			JSONObject timestamp = new JSONObject();
			timestamp.put("key", "Timestamp");
			timestamp.put("value", epochNow);
			JSONObject authorization = new JSONObject();
			authorization.put("key", "Authorization");
			authorization.put("value", authPrefix + authCode);
			headersArr.put(timestamp);
			headersArr.put(authorization);
			headers = headersArr.toString();
		
			break;
		
		default:
			break;
		}
		
		CloseableHttpClient httpclient = HttpClientUtil.getHttpClient(authType, userName, password, uri,
				proxyProperties, this.getSSLContext(mtlsAdded, certpath, keypass));
		
		CloseableHttpResponse response = null;
		switch (method.toUpperCase(Locale.ENGLISH)) {
		
		case "GET":
			response = ICIPRestPluginUtils.executeGetRequest(uri, authToken, headerPrefix, body, headers, params,
					context, httpclient, targetHost);
			break;
		case "POST":
			response = ICIPRestPluginUtils.executePostRequest(uri, authToken, headerPrefix, body, headers, params,
					context, httpclient, targetHost, bodyType);
			break;
		case "PUT":
			response = ICIPRestPluginUtils.executePutRequest(uri, authToken, headerPrefix, body, headers, params,
					context, httpclient, targetHost);
			break;
		case "DELETE":
			response = ICIPRestPluginUtils.executeDeleteRequest(uri, authToken, headerPrefix, body, headers, params,
					context, httpclient, targetHost);
			break;
		default:
			break;
		}
		
		return response;
		}
		
		private KeyStore getKeystore(boolean mtlsAdded, String keyStorePath, String keystorepass) throws IOException {
		
		KeyStore keyStore = null;
		if (mtlsAdded) {
			FileInputStream instream = new FileInputStream(new File(keyStorePath));
			try {
				keyStore = KeyStore.getInstance("JKS");
				keyStore.load(instream, keystorepass.toCharArray());
		
			} catch (KeyStoreException | NoSuchAlgorithmException | CertificateException e) {
				logger.error("error in keystore" + e.getClass() + e.getMessage());
		
			} finally {
				try {
					instream.close();
				} catch (Exception e) {
					logger.error(e.getMessage());
				}
			}
		}
		
		return keyStore;
		
		}
		
		private SSLContext getSSLContext(boolean mtlsAdded, String keyStorePath, String keystorepass) throws IOException {
		KeyStore keystore = this.getKeystore(mtlsAdded, keyStorePath, keystorepass);
		SSLContext sslContext = null;
		if (keystore != null) {
			try {
				sslContext = SSLContexts.custom().loadKeyMaterial(keystore, keystorepass.toCharArray())
						.loadTrustMaterial(keystore, new TrustStrategy() {
							@Override
							public boolean isTrusted(X509Certificate[] arg0, String arg1) throws CertificateException {
								return true;
							}
						}).build();
			} catch (UnrecoverableKeyException | NoSuchAlgorithmException | KeyStoreException
					| KeyManagementException e) {
				logger.error(e.getMessage(), e);
			}
		}
		return sslContext;
		}
		
		private String replaceUrlString(String url, JSONObject attributes) {
			String newUrl = url;
			String[] paramValues = parseQuery(url);
			for (int i = 0; i < paramValues.length; i++) {
				String extparamValue = paramValues[i];
				extparamValue = extparamValue.substring(1, extparamValue.length() - 1);
				if (attributes.has("LeapParams") && attributes.get("LeapParams") != null) {
					JSONArray leapparams = new JSONArray(attributes.get("LeapParams").toString());
					for (int j = 0; j < leapparams.length(); j++) {
						if (leapparams.getJSONObject(j) != null
								&& leapparams.getJSONObject(j).optString("key").equals(extparamValue)) {
							newUrl = newUrl.replace(paramValues[i], leapparams.getJSONObject(j).getString("value"));
						}
					}

				}
			}
			url = newUrl;
			return url;
		}
		
		private String[] parseQuery(String qrystr) {
			List<String> allMatches = new ArrayList<>();
			Matcher m = Pattern.compile("\\{(.*?)\\}").matcher(qrystr);
			while (m.find()) {
				for (int i = 0; i < m.groupCount(); i++) {
					allMatches.add(m.group(i));
				}
			}
			return allMatches.toArray(new String[allMatches.size()]);
		}
		@Override
		public List<Map<String, Object>> getCustomModels(String org, List<ICIPDatasource> connectionsList, Integer page,
				Integer size, String query) {
			// TODO Auto-generated method stub
			return null;
		}
		@Override
		public Long getAllModelObjectDetailsCount(List<ICIPDatasource> datasources, String searchModelName,
				String org) {
			// TODO Auto-generated method stub
			return null;
		}
}