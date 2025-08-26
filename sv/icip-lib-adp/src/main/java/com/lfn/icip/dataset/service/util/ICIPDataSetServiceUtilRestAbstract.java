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

import org.python.util.PythonInterpreter;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.StringReader;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.KeyException;
import java.security.KeyManagementException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.UnrecoverableKeyException;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import javax.net.ssl.SSLContext;

import org.apache.commons.io.FileUtils;
import org.apache.commons.text.StringSubstitutor;
import org.apache.http.HttpHost;
import org.apache.http.ParseException;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.AuthCache;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.protocol.HttpClientContext;
import org.apache.http.conn.ssl.TrustStrategy;
import org.apache.http.impl.auth.BasicScheme;
import org.apache.http.impl.client.BasicAuthCache;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.ssl.SSLContexts;
import org.apache.http.util.EntityUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;
import org.json.XML;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.Base64Utils;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.auth.http.HttpTransportFactory;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.oauth2.ServiceAccountCredentials;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.lfn.ai.comm.lib.util.dto.ResolvedSecret;
import com.lfn.ai.comm.lib.util.dto.Secret;
import com.lfn.ai.comm.lib.util.service.SecretsManagerService;
import com.lfn.icip.dataset.constants.ICIPPluginConstants;
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.model.dto.CustomHttpResponse;
import com.lfn.icip.dataset.model.dto.MlTopics;
import com.lfn.icip.dataset.properties.HttpClientUtil;
import com.lfn.icip.dataset.properties.ProxyProperties;
import com.lfn.icip.dataset.properties.ProxyProperties.HttpProxyConfiguration;
import com.lfn.icip.dataset.service.ICIPDatasetTopicService;
import com.lfn.icip.dataset.service.impl.ICIPDatasetService;
import com.lfn.icip.dataset.service.impl.ICIPDatasourceService;
import com.lfn.icip.dataset.util.ICIPRestPluginUtils;
import com.lfn.icip.icipwebeditor.fileserver.service.impl.FileServerService;
import com.jayway.jsonpath.Configuration;
import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;
import com.jayway.jsonpath.MapFunction;

import groovy.lang.Binding;
import groovy.lang.GroovyShell;

/**
 * The Class ICIPDataSetServiceUtilRestAbstract.
 */

public abstract class ICIPDataSetServiceUtilRestAbstract extends ICIPDataSetServiceUtil {

	private static final ExecutorService executorService=Executors.newCachedThreadPool();
	
	/** The Constant RECORDCOLUMNDISPLAYNAME. */
	private static final String RECORDCOLUMNDISPLAYNAME = "$..recordcolumndisplayname";

	/** The logger. */
	private static Logger logger = LoggerFactory.getLogger(ICIPDataSetServiceUtilRestAbstract.class);

	/** The Constant REQUESTMETHOD. */
	public static final String REQUESTMETHOD = "RequestMethod";

	/** The Constant RECORDCOLUMNNAME. */
	private static final String RECORDCOLUMNNAME = "$..recordcolumnname";
	@Autowired
	private ICIPDatasourceService datasourceService;

	/** The fileserverservice. */
	@Autowired
	private FileServerService fileserverservice;

	/** The Constant PSTR. */
	private static final String PSTR = "password";

	/** The Constant BASIC. */
	public static final String BASIC = "basicauth";

	/** The Constant OAUTH. */
	public static final String OAUTH = "oauth";

	/** The Constant Token. */
	public static final String TOKEN = "token";

	/** The Constant APIKEY. */
	public static final String APIKEY = "apikey";

	/** The Constant BEARER. */
	public static final String BEARER = "bearertoken";

	/** The Constant NOAUTH. */
	public static final String NOAUTH = "noauth";

	/** The Constant TOKENELEMENT. */
	private static final String TOKENELEMENT = "tokenElement";

	/** The Constant API. */
	private static final String API = "EndPoint";

	/** The Constant BODY. */
	private static final String BODY = "Body";

	/** The Constant QPARAMS. */
	private static final String QPARAMS = "QueryParams";

	/** The Constant SCRIPT. */
	private static final String SCRIPT = "TransformationScript";

	/** The Constant BIGQUERY. */
	public static final String BIGQUERY = "bigquery";

	/** The Constant BIGQUERY. */
	public static final String HMAC = "hmac";

	/** The Constant HTTP_TRANSPORT. */
	static final HttpTransport HTTP_TRANSPORT = new NetHttpTransport();

	/** The Constant HTTP_TRANSPORT_FACTORY. */
	static final HttpTransportFactory HTTP_TRANSPORT_FACTORY = new DefaultHttpTransportFactory();

	@Value("${icip.fileuploadDir}")
	private static String fileUploadPath;

	/** The proxy properties. */
	private ProxyProperties proxyProperties;

	/** The flag. */
	public int flag = 0;

	private static boolean isTokenUpdated = false;

	@Autowired
	private ICIPDatasetService datasetService;
	
	@Autowired
	private ICIPDatasetTopicService icipDatasetTopicService;
	
	@Autowired
	private SecretsManagerService smService;

	/**
	 * Instantiates a new ICIP data set service util rest.
	 *
	 * @param proxyProperties the proxy properties
	 */
	public ICIPDataSetServiceUtilRestAbstract(ProxyProperties proxyProperties) {
		super();
		this.proxyProperties = proxyProperties;
	}

	/**
	 * A factory for creating DefaultHttpTransport objects.
	 */
	/*
	 * creates http transport
	 */
	static class DefaultHttpTransportFactory implements HttpTransportFactory {

		/**
		 * Creates the.
		 *
		 * @return the http transport
		 */
		public HttpTransport create() {
			return HTTP_TRANSPORT;
		}
	}

	/**
	 * Gets the json.
	 *
	 * @return the json
	 */
	@Override
	public JSONObject getJson() {
		JSONObject ds = new JSONObject();
		try {
			ds.put("type", "REST");
			JSONObject attributes = new JSONObject();
			attributes.put(API, "");
			attributes.put(QPARAMS, "");
			attributes.put(REQUESTMETHOD, "");
			attributes.put("Headers", "");
			attributes.put(BODY, "");
			attributes.put("params", "");
			attributes.put(SCRIPT, "");
			JSONObject position = new JSONObject();
			position.put(API, 0);
			position.put(QPARAMS, 1);
			position.put(REQUESTMETHOD, 2);
			position.put("Headers", 3);
			position.put(BODY, 4);
			position.put("params", 5);
			position.put(SCRIPT, 6);
			ds.put("attributes", attributes);
			ds.put("position", position);
		} catch (JSONException e) {
			logger.error("error", e);
		}
		logger.info("setting plugin attributes with default values");
		return ds;
	}

	/**
	 * Test connection.
	 *
	 * @param dataset the dataset
	 * @return true, if successful
	 */
	@Override
	public boolean testConnection(ICIPDataset dataset) {
		String message = null;
		try (CloseableHttpResponse response = executeRequest(dataset)) {
			if (response != null)
				message = EntityUtils.toString(response.getEntity());
			if (response != null && (response.getStatusLine().getStatusCode() == 200
					|| response.getStatusLine().getStatusCode() == 201
					|| response.getStatusLine().getStatusCode() == 204)) {
				return true;
			}

			if (new JSONObject(dataset.getAttributes()).optString(REQUESTMETHOD).equalsIgnoreCase("delete")) {
				if (response != null && (response.getStatusLine().getStatusCode() == 404))
					return true;
			}

		} catch (Exception e) {
			logger.error("Connection request failed: \n ", message);
		}
		return false;
	}

	/**
	 * Execute request.
	 *
	 * @param dataset the dataset
	 * @return the closeable http response
	 * @throws URISyntaxException
	 * @throws IOException
	 * @throws NoSuchAlgorithmException
	 * @throws InvalidKeyException
	 * @throws KeyStoreException
	 * @throws KeyManagementException
	 * @throws Exception                the exception
	 */
	public CloseableHttpResponse executeRequest(ICIPDataset dataset) throws URISyntaxException, IOException,
			NoSuchAlgorithmException, InvalidKeyException, KeyManagementException, KeyStoreException {

		JSONObject connectionDetails = new JSONObject(dataset.getDatasource().getConnectionDetails());
		JSONObject attributes = new JSONObject(dataset.getAttributes());
		JSONObject authDetailsObj = new JSONObject(connectionDetails.optString("AuthDetails"));
		String authType = connectionDetails.optString("AuthType");
		String noProxyString = connectionDetails.optString("NoProxy");
		String authToken = null;
		String headerPrefix = authDetailsObj.optString("HeaderPrefix", "Bearer");
		String connType = connectionDetails.optString("ConnectionType");
		String urlString;
		boolean mtlsAdded = connectionDetails.optBoolean("CertsAdded");
		String certpath = connectionDetails.optString("CertPath");
		String keypass = connectionDetails.optString("KeyPass");
		if (connType.equalsIgnoreCase("apirequest")) {

			if (attributes.optString("Url").startsWith("http"))
				urlString = attributes.optString("Url").trim();
			else
				urlString = connectionDetails.optString("Url").trim() + attributes.optString("Url").trim();
		} else
			urlString = connectionDetails.optString("Url") + attributes.optString("Endpoint");
		if (connType.equalsIgnoreCase("apirequest"))
			urlString = formUrlStringFromDsrcAndDset(urlString,
					connectionDetails.optString(ICIPPluginConstants.URL).trim(),
					attributes.optString(ICIPPluginConstants.URL).trim());
		urlString = replaceUrlString(urlString, attributes);
		String userName = authDetailsObj.optString("username").trim();
		String password = authDetailsObj.optString(PSTR).trim();
		String method = attributes.optString(REQUESTMETHOD);
		String headers = attributes.optString("Headers");
		String params = attributes.optString("QueryParams");
		String body = attributes.optString("Body");
		String bodyType = attributes.optString("bodyType");
		if (ICIPPluginConstants.FILE.equalsIgnoreCase(bodyType)) {
			String fileParamName = attributes.optString(ICIPPluginConstants.FILE_PARAM_NAME);
			if (fileParamName == null || fileParamName.isEmpty()) {
				JSONObject reqBody = new JSONObject(body);
				reqBody.put(ICIPPluginConstants.FILE_PARAM_NAME, ICIPPluginConstants.FILE_LOWER_CASE);
				body = reqBody.toString();
			} else {
				JSONObject reqBody = new JSONObject(body);
				reqBody.put(ICIPPluginConstants.FILE_PARAM_NAME, fileParamName);
				if (reqBody != null)
					body = reqBody.toString();
			}
		}
		body = body.isEmpty() ? body : replaceBodyString(body, attributes);
		String leapparams = attributes.optString("EssedumParams");
		String fileId = connectionDetails.optString("fileid").trim();

		String encodedUrlString = URLEncoder.encode(urlString, StandardCharsets.UTF_8.toString());
		encodedUrlString = encodedUrlString.replace("+", "%20").replace("%2F", "/").replace("%3A", ":");
		urlString=encodedUrlString;
		
		URI uri = new URI(urlString.trim());
		HttpHost targetHost = new HttpHost(uri.getHost(), uri.getPort(), uri.getScheme());
		HttpClientContext context = null;

		switch (authType.toLowerCase(Locale.ENGLISH)) {

		case NOAUTH:
			logger.info("No Authentication applied");
			break;
		case BASIC:

			logger.info("BasicScheme Authentiction");
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
						logger.info("new access token generated");
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
			ICIPDataset datasetObj = new ICIPDataset();
			JSONObject tokenDataset = new JSONObject(authDetailsObj.get("tokenDataset").toString());
			datasetObj.setAlias(tokenDataset.optString("alias"));
			datasetObj.setName(tokenDataset.optString("name"));

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
			datasetObj.setDatasource(dsrc);

			datasetObj.setOrganization(tokenDataset.optString("organization"));
			datasetObj.setAttributes(tokenDataset.optString("attributes"));
			datasetObj.setId(tokenDataset.getInt("id"));
			String results = getDatasetData(datasetObj, new SQLPagination(0, 10, null, 0), DATATYPE.DATA, String.class);
			authToken = results;
			break;
		case BEARER:
			logger.info("Using auth token for authentication");
			authToken = authDetailsObj.optString("authToken");
			break;

		case BIGQUERY:

			byte[] content = null;
			try {

				String httpProxyHost, httpProxyPort;
				HttpProxyConfiguration httpProxyConfiguration = proxyProperties.getHttpProxyConfiguration();
				httpProxyHost = httpProxyConfiguration.getProxyHost();
				httpProxyPort = String.valueOf(httpProxyConfiguration.getProxyPort());
				if (noProxyString.equalsIgnoreCase("false")) {
					System.setProperty("http.proxyHost", httpProxyHost);
					System.setProperty("http.proxyPort", httpProxyPort);
					System.setProperty("https.proxyHost", httpProxyHost);
					System.setProperty("https.proxyPort", httpProxyPort);
				}

				content = fileserverservice.download(fileId, "1", dataset.getDatasource().getOrganization());
				File tempFile = new File(fileUploadPath + "/bigqueryAuth.json");
				FileUtils.writeByteArrayToFile(tempFile, content);
				FileInputStream fileInpStream = null;
				try {

					fileInpStream = new FileInputStream(tempFile);
					GoogleCredentials bigQueryCredentials = ServiceAccountCredentials
							.fromStream(fileInpStream, HTTP_TRANSPORT_FACTORY)
							.createScoped(ICIPPluginConstants.CREDENTIALSCOPES);
					bigQueryCredentials.refreshIfExpired();
					authToken = bigQueryCredentials.getAccessToken() != null
							? bigQueryCredentials.getAccessToken().getTokenValue()
							: "";
				} finally {
					if (fileInpStream != null) {
						fileInpStream.close();
					}
				}
				tempFile.delete();

			} catch (Exception ex) {
				logger.error("BigQuery connection error: ", ex);
			}

			break;
		case HMAC:
			String secKey = authDetailsObj.optString("secretKey");
			String algorithm = "HmacSHA256";
			String data = authDetailsObj.optString("input");
			String epochNow = String.valueOf(Instant.now().getEpochSecond());
			data = data.replace("{timestamp}", epochNow);
			data = replaceUrlString(data, attributes);
			data = data.replace("{api}", uri.getPath());
			SecretKeySpec secretKeySpec = new SecretKeySpec(secKey.getBytes(), algorithm);
			Mac mac = Mac.getInstance(algorithm);
			mac.init(secretKeySpec);
			byte[] encRes = mac.doFinal(data.getBytes());
			String authCode = new String(Base64Utils.encode(encRes));
			String authPrefix = authDetailsObj.optString("authPrefix");
			if (headers.isEmpty())
				headers = "[]";
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

		ICIPRestPluginUtils.validateProxy(uri, noProxyString, proxyProperties);

		CloseableHttpClient httpclient = HttpClientUtil.getHttpClient(authType, userName, password, uri,
				proxyProperties, this.getSSLContext(mtlsAdded, certpath, keypass));

		CloseableHttpResponse response = null;
		if (urlString != null && urlString.contains("/Ingest")) {
			if (body != null && body.startsWith("{")) {
				final String authToken1 = authToken;
				final String body1 = body;
				final String headers1 = headers;
				final HttpClientContext context1 = context;
				executorService.submit(() -> {
					performIngestAndPersistStatus(uri, authToken1, headerPrefix, body1, headers1, params, context1,
							httpclient, targetHost, bodyType);
				});
				response = new CustomHttpResponse();
				return response;
			}
		}
		try {

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
			case "PATCH":
				response = ICIPRestPluginUtils.executePatchRequest(uri, authToken, headerPrefix, body, headers, params,
						context, httpclient, targetHost);
				break;
			default:
				break;
			}
		} catch (Exception ex) {
			logger.error("Connection Error :\n ", ex);
		}

		if (response != null && response.getStatusLine() != null && response.getStatusLine().getStatusCode() >= 200
				&& response.getStatusLine().getStatusCode() <= 205 && dataset.getId() != null) {
			dataset = this.updateDataset(dataset);
			if (isTokenUpdated)
				datasetService.save(dataset.getId().toString(), dataset);
		}

		return response;
	}
	
	private void performIngestAndPersistStatus(URI uri, String authToken, String headerPrefix, String body,
			String headers, String params, HttpClientContext context, CloseableHttpClient httpclient,
			HttpHost targetHost, String bodyType)

	{
		Calendar calendar = Calendar.getInstance();
		Date startDate = calendar.getTime();
		Timestamp startTime = new Timestamp(startDate.getTime());
		String resp = null;
		JSONObject bodyObj = new JSONObject(body);
		String datasetId = bodyObj.optString("dataset_id");
		String organization = bodyObj.optString("organization");
		String indexName = bodyObj.optString("index_name");
		try {
			CloseableHttpResponse response = ICIPRestPluginUtils.executePostRequest(uri, authToken, headerPrefix, body,
					headers, params, context, httpclient, targetHost, bodyType);
			resp = EntityUtils.toString(response.getEntity());
			if (indexName == null || indexName.isEmpty()) {
				if (bodyObj.has("config")) {
					JSONObject config = new JSONObject(bodyObj.get("config").toString());
					if (config.has("VectorStoreConfig")) {
						JSONObject vectorStoreConfig = new JSONObject(config.get("VectorStoreConfig").toString());
						indexName = vectorStoreConfig.optString("index_name");
					}
				}
			}
			MlTopics mlTopic = new MlTopics();
			mlTopic.setDatasetId(datasetId);
			mlTopic.setOrganization(organization);
			mlTopic.setTopicName(indexName);
			mlTopic.setStartTime(startTime);
			calendar = Calendar.getInstance();
			Date endDate = calendar.getTime();
			Timestamp endTime = new Timestamp(endDate.getTime());
			mlTopic.setFinishTime(endTime);
			long durationInMilliSeconds = endDate.getTime() - startDate.getTime();
			long HH = TimeUnit.MILLISECONDS.toHours(durationInMilliSeconds);
			long MM = TimeUnit.MILLISECONDS.toMinutes(durationInMilliSeconds) % 60;
			long SS = TimeUnit.MILLISECONDS.toSeconds(durationInMilliSeconds) % 60;
			long sss = TimeUnit.MILLISECONDS.toMillis(durationInMilliSeconds) % 1000;
			String duration = String.format("%02d:%02d:%02d.%03d", HH, MM, SS, sss);
			mlTopic.setDuration(duration);
			if (response != null && response.getStatusLine() != null
					&& response.getStatusLine().getStatusCode() == 200) {
				mlTopic.setStatus("COMPLETED");
				mlTopic.setLog(resp);
			} else {
				mlTopic.setStatus("ERROR");
				mlTopic.setLog(resp);
			}
			icipDatasetTopicService.addOrUpdateTopic(mlTopic);
		} catch (Exception e) {
			logger.error("Error in:{}", e.getMessage());
			MlTopics mlTopic = new MlTopics();
			mlTopic.setDatasetId(datasetId);
			mlTopic.setOrganization(organization);
			mlTopic.setTopicName(indexName);
			mlTopic.setStatus("ERROR");
			mlTopic.setLog(resp);
			mlTopic.setStartTime(startTime);
			calendar = Calendar.getInstance();
			Date endDate = calendar.getTime();
			Timestamp endTime = new Timestamp(endDate.getTime());
			mlTopic.setFinishTime(endTime);
			long durationInMilliSeconds = endDate.getTime() - startDate.getTime();
			long HH = TimeUnit.MILLISECONDS.toHours(durationInMilliSeconds);
			long MM = TimeUnit.MILLISECONDS.toMinutes(durationInMilliSeconds) % 60;
			long SS = TimeUnit.MILLISECONDS.toSeconds(durationInMilliSeconds) % 60;
			long sss = TimeUnit.MILLISECONDS.toMillis(durationInMilliSeconds) % 1000;
			String duration = String.format("%02d:%02d:%02d.%03d", HH, MM, SS, sss);
			mlTopic.setDuration(duration);
			if (resp == null)
				mlTopic.setLog("Upstream API is down or not reachable");
			icipDatasetTopicService.addOrUpdateTopic(mlTopic);
		}
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

	private String replaceBodyString(String body, JSONObject attributes) {
		String replacedBody = body;
		String[] paramValues = parseBody(body);
		for (int i = 0; i < paramValues.length; i++) {
			String extparamValue = paramValues[i];
			extparamValue = extparamValue.substring(2, extparamValue.length() - 2);
			if (attributes.has("EssedumParams") && attributes.get("EssedumParams") != null) {
				JSONArray leapparams = new JSONArray(attributes.get("EssedumParams").toString());
				for (int j = 0; j < leapparams.length(); j++) {
					if (leapparams.getJSONObject(j) != null
							&& leapparams.getJSONObject(j).optString("key").equals(extparamValue)) {
						body = body.replace(paramValues[i], leapparams.getJSONObject(j).getString("value"));
					}
				}

			}
		}

		return body;
	}

	private String[] parseBody(String qrystr) {
		List<String> allMatches = new ArrayList<>();
		Matcher m = Pattern.compile("\\{\\{(.*?)\\}\\}").matcher(qrystr);
		while (m.find()) {
			for (int i = 0; i < m.groupCount(); i++) {
				allMatches.add(m.group(i));
			}
		}
		return allMatches.toArray(new String[allMatches.size()]);
	}

	private String replaceUrlString(String url, JSONObject attributes) {
		String newUrl = url;
		String[] paramValues = parseQuery(url);
		for (int i = 0; i < paramValues.length; i++) {
			String extparamValue = paramValues[i];
			extparamValue = extparamValue.substring(1, extparamValue.length() - 1);
			if (attributes.has("PathVariables") && attributes.get("PathVariables") != null) {
				JSONArray leapparams = new JSONArray(attributes.get("PathVariables").toString());
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
	public ICIPDataset updateDataset(ICIPDataset dataset) {

		ICIPDatasource datasource = dataset.getDatasource();
		JSONObject connectionDetails = new JSONObject(datasource.getConnectionDetails());
		JSONObject authDetailsObj = new JSONObject(connectionDetails.optString("AuthDetails"));
		String authType = connectionDetails.optString("AuthType");
		String noProxyString = connectionDetails.optString("NoProxy");

		String authToken = null, tokenExp = connectionDetails.optString("tokenExpirationTime");
		JSONObject tokenObj = null;

		if (authType.equalsIgnoreCase(OAUTH) && (tokenExp.isEmpty()
				|| new Timestamp(Instant.now().toEpochMilli()).after(Timestamp.valueOf(tokenExp)))) {

			try {
				authToken = ICIPRestPluginUtils.getAuthToken(authDetailsObj, noProxyString, proxyProperties);

				Timestamp tokenExpirationTime = null;
				tokenObj = new JSONObject(authToken);
				if (authDetailsObj.has("tokenElement") && authDetailsObj.optString("tokenElement").length() > 0) {
					authToken = tokenObj.optString(authDetailsObj.optString("tokenElement"));
				}
				if (tokenObj.has("expires_in") && !tokenObj.get("expires_in").toString().isEmpty()) {
					tokenExpirationTime = new Timestamp(
							Instant.now().toEpochMilli() + tokenObj.getLong("expires_in") * 1000);
					connectionDetails.put("access_token", authToken);
					connectionDetails.put("tokenExpirationTime", tokenExpirationTime);
					datasource.setConnectionDetails(connectionDetails.toString());
					dataset.setDatasource(datasource);
					logger.info("access token updated in datasource connection details");
					isTokenUpdated = true;
				}
			} catch (JSONException | IOException | URISyntaxException jse) {
				logger.error("exception: ", jse);
			}
		} else {
			isTokenUpdated = false;
		}

		return dataset;
	}

	/**
	 * Gets the data as string.
	 *
	 * @param dataset the dataset
	 * @param limit   the limit
	 * @return the data as string
	 * @throws IOException
	 * @throws ParseException
	 */
	public String getDataAsString(CloseableHttpResponse response, String resp, ICIPDataset dataset, int limit)
			throws ParseException, IOException {

		String schemaStr = dataset.getSchema() != null ? dataset.getSchema().getSchemavalue() : "[]";

		if (response.getEntity().getContentType() != null
				&& response.getEntity().getContentType().toString().contains("xml")) {
			resp = XML.toJSONObject(resp).toString();
		}

//				if (!schemaStr.equals("[]") && !schemaStr.isEmpty()) {
//				
//					JSONArray schema = new JSONArray(schemaStr);
//					JSONObject attributes = new JSONObject(dataset.getAttributes());
//					List<String> colvals = JsonPath.read(schema.toString(), RECORDCOLUMNNAME);
//					if (response.getEntity().getContentType().toString().contains("xml")) {
//						resp= parseXmlAsString(dataset, attributes, colvals, resp);
//					} else if (response.getEntity().getContentType().toString().contains("json")) {
//						resp = parseJsonAsString(dataset, attributes, colvals, resp);
//					}
//				}

		return resp;

	}

	/**
	 * Parses the xml as string.
	 *
	 * @param dataset    the dataset
	 * @param attributes the attributes
	 * @param colvals    the colvals
	 * @param resp       the resp
	 * @return the string
	 */

	/**
	 * Parses the json.
	 *
	 * @param dataset    the dataset
	 * @param attributes the attributes
	 * @param colvals    the colvals
	 * @param resp       the resp
	 * @return the string
	 */
	private String parseJsonAsString(ICIPDataset dataset, JSONObject attributes, List<String> colvals, String resp) {
		DocumentContext document;
		if (attributes.has(TOKENELEMENT) && attributes.getString(TOKENELEMENT) != null
				&& !attributes.getString(TOKENELEMENT).trim().isEmpty()) {
			document = JsonPath.parse(JsonPath.read(resp, attributes.getString(TOKENELEMENT)).toString());
		} else {
			document = JsonPath.parse(resp);
		}

		@SuppressWarnings("unchecked")
		MapFunction mapFunction1 = (Object currentValue, Configuration configuration) -> {
			List<Object> o = new ArrayList<>();
			if (currentValue instanceof LinkedHashMap<?, ?>) {
				LinkedHashMap<String, Object> i = (LinkedHashMap<String, Object>) currentValue;
				colvals.forEach(val -> o.add(i.get(val)));
			}
			return o;
		};
		return returnJsonAsString(dataset, document, mapFunction1);
	}

	/**
	 * Return json.
	 *
	 * @param dataset      the dataset
	 * @param document     the document
	 * @param mapFunction1 the map function 1
	 * @return the string
	 */
	private String returnJsonAsString(ICIPDataset dataset, DocumentContext document, MapFunction mapFunction1) {
		JsonPath path = JsonPath.compile("*");
		net.minidev.json.JSONArray arr = new net.minidev.json.JSONArray();
		Object tmpJson = document.json();
		if (tmpJson instanceof LinkedHashMap<?, ?>) {
			arr.add(tmpJson);
		} else {
			arr = (net.minidev.json.JSONArray) tmpJson;
		}

		document = JsonPath.parse(arr.toJSONString());
		net.minidev.json.JSONArray arr1 = document.map(path, mapFunction1).json();
		JSONArray schema = dataset.getSchema() != null ? new JSONArray(dataset.getSchema().getSchemavalue())
				: new JSONArray();
		List<String> columnNames = JsonPath.read(schema.toString(), RECORDCOLUMNDISPLAYNAME);
		arr1.add(0, columnNames);
		return arr1.toJSONString();

	}

	private HashMap<String, Object> getMapFromObject(JSONObject json) {

		JSONObject obj = json;
		HashMap<String, Object> map = new HashMap<>();
		obj.keySet().forEach(key -> {
			map.put(key, String.valueOf(obj.get(key)));
		});

		return map;
	}

	/**
	 * Gets the data with limit.
	 * 
	 * @param resp
	 * @param response
	 *
	 * @param dataset  the dataset
	 * @param limit    the limit
	 * @return the data with limit
	 * @throws Exception
	 */
	public List<Map<String, Object>> getDataWithLimit(CloseableHttpResponse response, String resp, ICIPDataset dataset,
			int limit) throws Exception {

		JSONObject attributes = new JSONObject(dataset.getAttributes());
		if (!attributes.getBoolean("transformData")) {
			throw new Exception("Transform Script is required to configure widgets for rest datasets!");
		}

		Object json = new JSONTokener(resp).nextValue();

		List<Map<String, Object>> respMapList = new ArrayList<>();

		if (json instanceof JSONArray) {
			JSONArray respArray = new JSONArray(resp);
			for (int i = 0; i < respArray.length(); i++) {
				JSONObject obj = respArray.getJSONObject(i);
				respMapList.add(getMapFromObject(obj));
			}
		} else if (json instanceof JSONObject) {
			JSONObject obj = new JSONObject(resp);
			respMapList.add(getMapFromObject(obj));
		}

		return respMapList;
	}

	/**
	 * Parses the xml.
	 *
	 * @param dataset    the dataset
	 * @param attributes the attributes
	 * @param colvals    the colvals
	 * @param resp       the resp
	 * @return the string
	 */

	/**
	 * Parses the json.
	 *
	 * @param dataset    the dataset
	 * @param attributes the attributes
	 * @param colvals    the colvals
	 * @param resp       the resp
	 * @return the string
	 */
	private List<Map<String, Object>> parseJson(ICIPDataset dataset, JSONObject attributes, List<String> colvals,
			String resp) {
		DocumentContext document;
		if (attributes.has(TOKENELEMENT) && attributes.getString(TOKENELEMENT) != null
				&& !attributes.getString(TOKENELEMENT).trim().isEmpty()) {
			document = JsonPath.parse(JsonPath.read(resp, attributes.getString(TOKENELEMENT)).toString());
		} else {
			document = JsonPath.parse(resp);
		}

		@SuppressWarnings("unchecked")
		MapFunction mapFunction1 = (Object currentValue, Configuration configuration) -> {
			List<Object> o = new ArrayList<>();
			if (currentValue instanceof LinkedHashMap<?, ?>) {
				LinkedHashMap<String, Object> i = (LinkedHashMap<String, Object>) currentValue;
				colvals.forEach(val -> o.add(i.get(val)));
			}
			return o;
		};
		return returnJson(dataset, document, mapFunction1);
	}

	/**
	 * Return json.
	 *
	 * @param dataset      the dataset
	 * @param document     the document
	 * @param mapFunction1 the map function 1
	 * @return the string
	 */
	@SuppressWarnings("unchecked")
	private List<Map<String, Object>> returnJson(ICIPDataset dataset, DocumentContext document,
			MapFunction mapFunction1) {
		JsonPath path = JsonPath.compile("*");
		net.minidev.json.JSONArray arr = new net.minidev.json.JSONArray();
		Object tmpJson = document.json();
		if (tmpJson instanceof LinkedHashMap<?, ?>) {
			arr.add(tmpJson);
		} else {
			arr = (net.minidev.json.JSONArray) tmpJson;
		}
		document = JsonPath.parse(arr.toJSONString());
		net.minidev.json.JSONArray arr1 = document.map(path, mapFunction1).json();
		JSONArray schema = dataset.getSchema() != null ? new JSONArray(dataset.getSchema().getSchemavalue())
				: new JSONArray();
		List<String> columnNames = JsonPath.read(schema.toString(), RECORDCOLUMNDISPLAYNAME);
		arr1.add(0, columnNames);
		List<String> listOfKeys = (List<String>) arr1.get(0);
		List<Map<String, Object>> listofMaps = new ArrayList<>();
		for (int i = 0; i < arr1.size(); i++) {
			List<String> row = (List<String>) arr1.get(i);
			Map<String, Object> map = new LinkedHashMap<>();
			for (int j = 0; j < row.size(); j++) {
				map.put(listOfKeys.get(j), String.valueOf(row.get(j)));
			}

			listofMaps.add(map);
		}
		listofMaps.remove(0);
		return listofMaps;
	}

	/**
	 * Gets the data as json array.
	 * 
	 * @param resp
	 * @param response
	 *
	 * @param dataset  the dataset
	 * @param limit    the limit
	 * @return the data as json array
	 * @throws Exception
	 */
	public JSONArray getDataAsJsonArray(CloseableHttpResponse response, String resp, ICIPDataset dataset, int limit)
			throws Exception {
		List<Map<String, Object>> map = getDataWithLimit(response, resp, dataset, limit);
		JSONArray jsonArray = new JSONArray();
		for (Map<String, Object> data : map) {
			JSONObject obj = new JSONObject(data);
			jsonArray.put(obj);
		}
		return jsonArray;
	}

	/**
	 * Gets the data count.
	 *
	 * @param dataset the dataset
	 * @return the data count
	 */
	@Override
	public Long getDataCount(ICIPDataset dataset) {
		throw new UnsupportedOperationException();
	}
	
	private String resolveAllSecretsIfAny(String jsonBody, String org) {
		if (jsonBody.contains(ICIPPluginConstants.STRING_DOLLAR)) {
			Map<String, String> valuesMap = extractPlaceholders(jsonBody, org);
			// Replace placeholders
			StringSubstitutor sub = new StringSubstitutor(valuesMap);
			String resolvedString = sub.replace(jsonBody);
			return resolvedString;
		} else {
			return jsonBody;
		}
	}

	public Map<String, String> extractPlaceholders(String jsonString, String org) {
		Map<String, String> valuesMap = new HashMap<>();
		Pattern pattern = Pattern.compile(ICIPPluginConstants.SECRETS_PATTERN);
		Matcher matcher = pattern.matcher(jsonString);
		while (matcher.find()) {
			String placeholder = matcher.group(1);
			String resolvedValue = null;
			resolvedValue = this.resolveSecret(placeholder, org);
			if (resolvedValue == null) {
				resolvedValue = placeholder;
			}
			valuesMap.put(placeholder, resolvedValue);
		}
		return valuesMap;
	}

	public String resolveSecret(String key, String project) {
		Secret secret = new Secret();
		secret.setKey(key);
		secret.setOrganization(project);
		try {
			ResolvedSecret resolved = smService.resolveSecret(secret);
			if (Boolean.TRUE.equals(resolved.getIsResolved())) {
				return resolved.getResolvedSecret();
			} else {
				Secret secretFromCore = new Secret();
				secretFromCore.setKey(key);
				secretFromCore.setOrganization(ICIPPluginConstants.PROJECT_CORE);
				ResolvedSecret resolvedsecretFromCore = smService.resolveSecret(secretFromCore);
				if (Boolean.TRUE.equals(resolvedsecretFromCore.getIsResolved())) {
					return resolvedsecretFromCore.getResolvedSecret();
				} else {
					return null;
				}
			}
		} catch (KeyException e) {
			try {
				Secret secretFromCore = new Secret();
				secretFromCore.setKey(key);
				secretFromCore.setOrganization(ICIPPluginConstants.PROJECT_CORE);
				ResolvedSecret resolvedsecretFromCore = smService.resolveSecret(secretFromCore);
				if (Boolean.TRUE.equals(resolvedsecretFromCore.getIsResolved())) {
					return resolvedsecretFromCore.getResolvedSecret();
				} else {
					return null;
				}
			} catch (KeyException e2) {
				return null;
			}
		}
	}

	/**
	 * Gets the dataset data.
	 *
	 * @param <T>        the generic type
	 * @param dataset    the dataset
	 * @param pagination the pagination
	 * @param datatype   the datatype
	 * @param clazz      the clazz
	 * @return the dataset data
	 */
	@SuppressWarnings("unchecked")
	@Override
	public <T> T getDatasetData(ICIPDataset dataset, SQLPagination pagination, DATATYPE datatype, Class<T> clazz) {

		String responseData = null;
		dataset.setAttributes(resolveAllSecretsIfAny(dataset.getAttributes(), dataset.getOrganization()));
		JSONObject attributes1 = new JSONObject(dataset.getAttributes());
		JSONObject attributes2 = new JSONObject(dataset.getAttributes());

		if (attributes1.has("transformScriptData") && attributes1.getBoolean("transformScriptData")) {
			String responseData1 = null;
			try {
				responseData1 = executeScript(dataset);
				return (T) responseData1;
			} catch (Exception e) {
				logger.error(e.getMessage());
				responseData1 = String.format("{\"Script Error\" : \"%s\"}", e.getMessage());
				return (T) responseData1;

			}
		}

		logger.info("Dataset before preprocessing.{}", dataset);

		if (attributes2.has("pretransformData") && attributes2.getBoolean("pretransformData")) {

			String prescript = attributes2.getString("preTransformationScript");
			String Body = attributes2.optString("Body");
			JSONArray QueryParams = attributes2.getJSONArray("QueryParams");
			JSONArray Headers = attributes2.getJSONArray("Headers");
			String bodyType = attributes2.optString("bodyType");
			JSONArray PathVariables = new JSONArray();
			String inputUrl = "";
			JSONArray ConfigVariables = new JSONArray();
            logger.info(attributes2.toString());
			if (attributes2.has("PathVariables")) {
				PathVariables = attributes2.getJSONArray("PathVariables");
			}
			if (attributes2.has("Url")) {
				inputUrl = attributes2.getString("Url");
			}
			if (attributes2.has("ConfigVariables")) {
				ConfigVariables = attributes2.getJSONArray("ConfigVariables");
			}

			StringBuilder prescriptBuilder = new StringBuilder();
			prescript = prescript.substring(1, prescript.length() - 1);
			List<String> prescriptLines = new ArrayList<String>(Arrays.asList(prescript.split("\\\\n")));

			prescriptLines.stream().filter(row -> !row.isEmpty()).forEach(row -> {
				prescriptBuilder.append(row.replace("\\", "")).append("\n");
			});
			prescript = prescriptBuilder.toString();

			Binding binding = new Binding();
			binding.setProperty("Body", Body);
			binding.setProperty("QueryParams", QueryParams);
			binding.setProperty("Headers", Headers);
			binding.setProperty("bodyType", bodyType);
			binding.setProperty("PathVariables", PathVariables);
			binding.setProperty("Url", inputUrl);
			binding.setProperty("ConfigVariables", ConfigVariables);

			GroovyShell shell = new GroovyShell(binding);
			Object transformedResult = shell.evaluate(new StringReader(prescript));

			JSONObject transformedattr = new JSONObject(transformedResult.toString());
			logger.info("Transformedattr--->{}", transformedattr);
			QueryParams = transformedattr.getJSONArray("QueryParams");
			Headers = transformedattr.getJSONArray("Headers");
			PathVariables = transformedattr.getJSONArray("PathVariables");
			ConfigVariables = transformedattr.getJSONArray("ConfigVariables");
			attributes2.put("Body", transformedattr.getJSONObject("Body").toString());
			attributes2.put("QueryParams", QueryParams);
			attributes2.put("Headers", Headers);
			attributes2.put("bodyType", transformedattr.getString("bodyType"));
			attributes2.put("PathVariables", PathVariables);
			attributes2.put("Url", transformedattr.getString("Url"));
			attributes2.put("ConfigVariables", ConfigVariables);

			dataset.setAttributes(attributes2.toString());

			logger.info("Dataset after preprocessing.{}", dataset);
		}

		try  {
			CloseableHttpResponse response = executeRequest(dataset);
			JSONObject attributes = new JSONObject(dataset.getAttributes());
			String resp = EntityUtils.toString(response.getEntity());
			logger.info(resp);
			if (response != null && (response.getStatusLine().getStatusCode() == 200
					|| response.getStatusLine().getStatusCode() == 201
					|| response.getStatusLine().getStatusCode() == 204)) {

				if (attributes1.has("transformData") && attributes.getBoolean("transformData")) {

					logger.info("REST getDatasetData before groovy {}", response);

					String script = attributes.getString("TransformationScript");
					StringBuilder scriptBuilder = new StringBuilder();
					script = script.substring(1, script.length() - 1);
					List<String> scriptLines = new ArrayList<String>(Arrays.asList(script.split("\\\\n")));

					scriptLines.stream().filter(row -> !row.isEmpty()).forEach(row -> {
						scriptBuilder.append(row.replace("\\", "")).append("\n");
					});
					script = scriptBuilder.toString();

					Binding binding = new Binding();
					binding.setProperty("inputJson", resp);

					GroovyShell shell = new GroovyShell(binding);
					Object transformedResult = shell.evaluate(new StringReader(script));

					resp = transformedResult.toString();
					logger.info("REST getDatasetData after groovy {}", resp);
				}

				if (clazz.equals(String.class)) {
					logger.info("REST getDatasetData String {}", resp);
					return (T) getDataAsString(response, resp, dataset, pagination.getSize());
				} else if (clazz.equals(List.class)) {
					logger.info("REST getDatasetData List {}", resp);
					return (T) getDataWithLimit(response, resp, dataset, pagination.getSize());
				} else if (clazz.equals(JSONArray.class)) {
					logger.info("REST getDatasetData JSONArray {}", resp);
					return (T) getDataAsJsonArray(response, resp, dataset, pagination.getSize());
				}
				logger.info("REST getDatasetData None {}", resp);
				return (T) getDataAsString(response, resp, dataset, pagination.getSize());
			} else {
				responseData = resp;
				throw new Exception(resp);
			}
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return(T) ex.getMessage();
		}finally {
		logger.info("REST getDatasetData final {}", responseData);
//		return (T) responseData;
		}
	}

	public String executeScript(ICIPDataset dataset) {
		String response = null;
		ICIPDatasource datasource = dataset.getDatasource();
		JSONObject datasource_attributes = new JSONObject(datasource.getConnectionDetails());
		String url = datasource_attributes.getString("Url");
		JSONObject attributes = new JSONObject(dataset.getAttributes());
		String transformScript = attributes.getString("transformScriptTransformationScript");
		String ScriptType = attributes.getString("ScriptType");

		String Body = attributes.optString("Body");
		String bodyType = attributes.optString("bodyType");
		
		StringBuilder transformScriptBuilder = new StringBuilder();
		transformScript = transformScript.substring(1, transformScript.length() - 1);
		List<String> transformScriptLines = new ArrayList<String>(Arrays.asList(transformScript.split("\\\\n")));

		transformScriptLines.stream().filter(row -> !row.isEmpty()).forEach(row -> {
			transformScriptBuilder.append(row.replace("\\", "")).append("\n");
		});
		transformScript = transformScriptBuilder.toString();
		Binding binding = new Binding();
		binding.setProperty("Body", Body);
		binding.setProperty("ConnectionDetails", datasource_attributes.toString());
		if (ScriptType.equals("Groovy")) {
			GroovyShell shell = new GroovyShell(binding);
			Object transformedResult = shell.evaluate(new StringReader(transformScript));
			logger.info("transformedResult--->{}", transformedResult);
			response = transformedResult.toString();
		}

		if (ScriptType.equals("Python")) {
			if (attributes.has("isRemoteExecution") && attributes.getBoolean("isRemoteExecution") == true) {
				Boolean isRemoteExecution = attributes.getBoolean("isRemoteExecution");
				ICIPDatasource remoteExecutor=	datasourceService.getDatasource(attributes.getString("remoteConnectionName"),datasource.getOrganization());
				JSONObject connectionDetails = new JSONObject(remoteExecutor.getConnectionDetails());
				JSONObject authDetailsObj = new JSONObject(connectionDetails.optString("AuthDetails"));
				String authType = connectionDetails.optString("AuthType");
				String noProxyString = connectionDetails.optString("NoProxy");
				String authToken = null;
				String headerPrefix = authDetailsObj.optString("HeaderPrefix", "Bearer");
				String connType = connectionDetails.optString("ConnectionType");
				String urlString;
				boolean mtlsAdded = connectionDetails.optBoolean("CertsAdded");
				String certpath = connectionDetails.optString("CertPath");
				String keypass = connectionDetails.optString("KeyPass");;
				URL extractURL=null;
				try {
					extractURL = new URL(connectionDetails.optString("Url"));
				} catch (MalformedURLException e1) {
					// TODO Auto-generated catch block
					logger.error(e1.getMessage());
				}
						String host = extractURL.getProtocol().concat("://").concat(extractURL.getHost());
				if (extractURL.getPort() != -1)
					host = host.concat(":").concat(String.valueOf(extractURL.getPort()));
				
				urlString = host + ICIPPluginConstants.SCRIPT_REMOTE_ENDPOINT_PATH;
				urlString = replaceUrlString(urlString, attributes);
				String userName = authDetailsObj.optString("username").trim();
				String password = authDetailsObj.optString(PSTR).trim();
				String method = attributes.optString(REQUESTMETHOD);
				String headers = attributes.optString("Headers");
				String params = attributes.optString("QueryParams");
				String body = attributes.optString("Body");
				body = body.isEmpty() ? body : replaceBodyString(body, attributes);
				String leapparams = attributes.optString("EssedumParams");
				String fileId = connectionDetails.optString("fileid").trim();

				URI uri = null;
				try {
					uri = new URI(urlString.trim());
				} catch (URISyntaxException e) {
					// TODO Auto-generated catch block
					logger.error(e.getMessage());
				}
				HttpHost targetHost = new HttpHost(uri.getHost(), uri.getPort(), uri.getScheme());
				HttpClientContext context = null;

				switch (authType.toLowerCase(Locale.ENGLISH)) {

				case NOAUTH:
					logger.info("No Authentication applied");
					break;
				case BASIC:

					logger.info("BasicScheme Authentiction");
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
						try {
							authToken = ICIPRestPluginUtils.getAuthToken(authDetailsObj, noProxyString, proxyProperties);
						} catch (IOException e) {
							// TODO Auto-generated catch block
							logger.error(e.getMessage());
						} catch (URISyntaxException e) {
							// TODO Auto-generated catch block
							logger.error(e.getMessage());
						}

						JSONObject tokenObj = null;
						try {
							tokenObj = new JSONObject(authToken);
							if (authDetailsObj.has("tokenElement") && authDetailsObj.optString("tokenElement").length() > 0) {
								authToken = tokenObj.optString(authDetailsObj.optString("tokenElement"));
								logger.info("new access token generated");
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
					ICIPDataset datasetObj = new ICIPDataset();
					JSONObject tokenDataset = new JSONObject(authDetailsObj.get("tokenDataset").toString());
					datasetObj.setAlias(tokenDataset.optString("alias"));
					datasetObj.setName(tokenDataset.optString("name"));

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
					datasetObj.setDatasource(dsrc);

					datasetObj.setOrganization(tokenDataset.optString("organization"));
					datasetObj.setAttributes(tokenDataset.optString("attributes"));
					datasetObj.setId(tokenDataset.getInt("id"));
					String results = getDatasetData(datasetObj, new SQLPagination(0, 10, null, 0), DATATYPE.DATA, String.class);
					authToken = results;
					break;
				case BEARER:
					logger.info("Using auth token for authentication");
					authToken = authDetailsObj.optString("authToken");
					break;

				case BIGQUERY:

					byte[] content = null;
					try {

						String httpProxyHost, httpProxyPort;
						HttpProxyConfiguration httpProxyConfiguration = proxyProperties.getHttpProxyConfiguration();
						httpProxyHost = httpProxyConfiguration.getProxyHost();
						httpProxyPort = String.valueOf(httpProxyConfiguration.getProxyPort());
						if (noProxyString.equalsIgnoreCase("false")) {
							System.setProperty("http.proxyHost", httpProxyHost);
							System.setProperty("http.proxyPort", httpProxyPort);
							System.setProperty("https.proxyHost", httpProxyHost);
							System.setProperty("https.proxyPort", httpProxyPort);
						}

						content = fileserverservice.download(fileId, "1", dataset.getDatasource().getOrganization());
						File tempFile = new File(fileUploadPath + "/bigqueryAuth.json");
						FileUtils.writeByteArrayToFile(tempFile, content);
						FileInputStream fileInpStream = null;
						try {

							fileInpStream = new FileInputStream(tempFile);
							GoogleCredentials bigQueryCredentials = ServiceAccountCredentials
									.fromStream(fileInpStream, HTTP_TRANSPORT_FACTORY)
									.createScoped(ICIPPluginConstants.CREDENTIALSCOPES);
							bigQueryCredentials.refreshIfExpired();
							authToken = bigQueryCredentials.getAccessToken() != null
									? bigQueryCredentials.getAccessToken().getTokenValue()
									: "";
						} finally {
							if (fileInpStream != null) {
								fileInpStream.close();
							}
						}
						tempFile.delete();

					} catch (Exception ex) {
						logger.error("BigQuery connection error: ", ex);
					}

					break;
				case HMAC:
					String secKey = authDetailsObj.optString("secretKey");
					String algorithm = "HmacSHA256";
					String data = authDetailsObj.optString("input");
					String epochNow = String.valueOf(Instant.now().getEpochSecond());
					data = data.replace("{timestamp}", epochNow);
					data = replaceUrlString(data, attributes);
					data = data.replace("{api}", uri.getPath());
					SecretKeySpec secretKeySpec = new SecretKeySpec(secKey.getBytes(), algorithm);
					Mac mac = null;
					try {
						mac = Mac.getInstance(algorithm);
					} catch (NoSuchAlgorithmException e) {
						// TODO Auto-generated catch block
						logger.error(e.getMessage());
					}
					try {
						mac.init(secretKeySpec);
					} catch (InvalidKeyException e) {
						// TODO Auto-generated catch block
						logger.error(e.getMessage());
					}
					byte[] encRes = mac.doFinal(data.getBytes());
					String authCode = new String(Base64Utils.encode(encRes));
					String authPrefix = authDetailsObj.optString("authPrefix");
					if (headers.isEmpty())
						headers = "[]";
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

				try {
					ICIPRestPluginUtils.validateProxy(uri, noProxyString, proxyProperties);
				} catch (URISyntaxException e) {
					// TODO Auto-generated catch block
					logger.error(e.getMessage());
				} catch (IOException e) {
					// TODO Auto-generated catch block
					logger.error(e.getMessage());
				}

				CloseableHttpClient httpclient = null;
				try {
					httpclient = HttpClientUtil.getHttpClient(authType, userName, password, uri,
							proxyProperties, this.getSSLContext(mtlsAdded, certpath, keypass));
				} catch (KeyManagementException | NoSuchAlgorithmException | KeyStoreException | IOException e) {
					// TODO Auto-generated catch block
					logger.error(e.getMessage());
				}
                JSONObject requestBody= new JSONObject();
                if(attributes.has("imports")) {
                requestBody.put("Imports", attributes.get("imports"));
                }else {
                	 requestBody.put("Imports", new ArrayList<String>()); 	
                }
                if(attributes.has("imports")) {
                	requestBody.put("Requirements", attributes.get("requirements"));
                        }else {
                    	 requestBody.put("Requirements", new ArrayList<String>()); 	
                    }
                requestBody.put("Body",body);
                requestBody.put("ConnectionDetails",datasource_attributes.toString());
                requestBody.put("Script",transformScript);
            //)
				CloseableHttpResponse response1= null;
						try {
							JSONArray headerArray = new JSONArray(headers);
							JSONObject content = new JSONObject();
							content.put("key","Content-Type");
							content.put("value","application/json");
							headerArray.put(content);
							headers = headerArray.toString();
							response1= ICIPRestPluginUtils.executePostRequest(uri, authToken, headerPrefix, requestBody.toString(), headers, params,
									context, httpclient, targetHost, bodyType);
							logger.info(response1.toString());
							Reader jr = new InputStreamReader(response1.getEntity().getContent());
						    response = new Gson().fromJson(jr, JsonObject.class).get("logs").toString();
							
						} catch (URISyntaxException | IOException e) {
							// TODO Auto-generated catch block
							logger.error(e.getMessage());
						}
						
			
			} else {
				PythonInterpreter pyInterp = new PythonInterpreter();
				pyInterp.exec(transformScript);
				if (attributes.has("imports") && attributes.get("imports") != null) {
					JSONArray Imports = new JSONArray(attributes.get("imports").toString());
					for (int j = 0; j < Imports.length(); j++) {
						if (Imports.getJSONObject(j) != null && Imports.getJSONObject(j).optString("key") != null) {
//						System.out.println(Imports.getJSONObject(j).getString("key"));
							pyInterp.exec(Imports.getJSONObject(j).getString("key"));
						}
					}
				}
				String func_call = String.format("execute('%s','%s')", datasource_attributes.toString(),Body);
				Object res = pyInterp.eval(func_call);
				response = res.toString();
			}
		}

		return response;
	}
	
	private String formUrlStringFromDsrcAndDset(String urlString, String dsrcUrl, String dsetUrl) {
		String newUrl = urlString;
		String host = "";
		String path = "";
		URL dsrcUrlObj;
		try {
			dsrcUrlObj = new URL(dsrcUrl);
			host = dsrcUrlObj.getProtocol().concat("://").concat(dsrcUrlObj.getHost());
			if (dsrcUrlObj.getPort() != -1)
				host = host.concat(":").concat(String.valueOf(dsrcUrlObj.getPort()));
			if (dsetUrl.startsWith("http")) {
				URL dsetUrlObj = new URL(dsetUrl);
				String dsethost = "";
				dsethost = dsetUrlObj.getProtocol().concat("://").concat(dsetUrlObj.getHost());
				if (dsrcUrlObj.getPort() != -1)
					dsethost = dsethost.concat(":").concat(String.valueOf(dsetUrlObj.getPort()));
				path = dsetUrl.replace(dsethost, "");
			} else {
				path = dsetUrl;
			}
			newUrl = host.concat(path);
		} catch (MalformedURLException e) {
			logger.error("Error in forming URL {}", e.getMessage());
			return newUrl;
		}
		return newUrl;
	}
	
}