package com.infosys.icets.icip.icipmodelserver.v2.service.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.security.InvalidKeyException;
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
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import javax.net.ssl.SSLContext;

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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.util.Base64Utils;

import com.amazonaws.SdkClientException;
import com.infosys.icets.icip.dataset.constants.ICIPPluginConstants;
import com.infosys.icets.icip.dataset.model.ICIPDataset;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;
import com.infosys.icets.icip.dataset.properties.HttpClientUtil;
import com.infosys.icets.icip.dataset.properties.ProxyProperties;
import com.infosys.icets.icip.dataset.service.impl.ICIPDatasetPluginsService;
import com.infosys.icets.icip.dataset.service.util.ICIPDataSourceServiceUtil;
import com.infosys.icets.icip.dataset.service.util.ICIPDataSourceServiceUtilRestAbstract;
import com.infosys.icets.icip.dataset.service.util.IICIPDataSetServiceUtil.DATATYPE;
import com.infosys.icets.icip.dataset.service.util.IICIPDataSetServiceUtil.SQLPagination;
import com.infosys.icets.icip.dataset.util.ICIPRestPluginUtils;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sagemaker.SageMakerClient;

@Component("awssagemakersource")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class ICIPDataSourceServiceUtilAWSServiceSageMaker extends ICIPDataSourceServiceUtilRestAbstract {

	private ProxyProperties proxyProperties;

	@Autowired
	private ICIPDatasetPluginsService datasetPluginService;

	public ICIPDataSourceServiceUtilAWSServiceSageMaker(ProxyProperties proxyProperties) {
		super(proxyProperties);
		this.proxyProperties = proxyProperties;
	}

	private static Logger logger = LoggerFactory.getLogger(ICIPDataSourceServiceUtilAWSServiceSageMaker.class);

	@Override
	public boolean testConnection(ICIPDatasource datasource) {
		JSONObject connectionDetails = new JSONObject(datasource.getConnectionDetails());
		JSONObject authDetails = connectionDetails.optJSONObject("AuthDetails");
		String accessKey = authDetails.optString("accesskey");
		String secretKey = authDetails.optString("secretkey");
		String regionName = authDetails.optString("region");
		String executionEnvironment = connectionDetails.optString("executionEnvironment");
		if (ICIPPluginConstants.REMOTE.equalsIgnoreCase(executionEnvironment)) {
			logger.info("Connection Test, executionEnvironment:{}", executionEnvironment);
			try (CloseableHttpResponse response = authenticate(datasource)) {

				if (response.getStatusLine().getStatusCode() == 200 || response.getStatusLine().getStatusCode() == 201
						|| response.getStatusLine().getStatusCode() == 204) {
					logger.info("Connection Successful");
					return true;
				}
			} catch (Exception e) {
				logger.error("Error while executing request:", e);
				return false;
			}
			return false;
		}
		try {

			Region region = Region.of(regionName);
			AwsCredentialsProvider credentialsProvider = StaticCredentialsProvider
					.create(AwsBasicCredentials.create(accessKey, secretKey));
			SageMakerClient sageMakerClient = SageMakerClient.builder().region(region)
					.credentialsProvider(credentialsProvider).build();
			logger.info("connection Successful");
			return true;
		} catch (SdkClientException e) {
			logger.error("unable to connect SageMaker" + e.getMessage());
			return false;
		} catch (Exception e) {
			logger.error("unable to connect SageMaker" + e.getMessage());
			return false;
		}
	}

	@Override
	public ICIPDatasource setHashcode(boolean isVault, ICIPDatasource datasource) throws NoSuchAlgorithmException {

		try {
		} catch (Exception e) {
			logger.error("Error while setting hashcode: ", e);
		}
		return datasource;
	}

	@Override
	public JSONObject getJson() {
		JSONObject ds = super.getJson();
		try {
			ds.put("type", "AWSSAGEMAKER");
			ds.put("category", "REST");
			JSONObject attributes = ds.getJSONObject(ICIPDataSourceServiceUtil.ATTRIBUTES);
			attributes.put("AuthType", "token");
			attributes.put("NoProxy", "false");
			attributes.put("ConnectionType", "ApiRequest");
			attributes.put("Url", "");
			attributes.put("fileId", "");
			attributes.put("AuthDetails", "{}");
			attributes.put("testDataset", "{\"name\":\"\",\"attributes\":{\"RequestMethod\":\"GET\",\"Headers\":\"{}\","
					+ "\"QueryParams\":\"{}\",\"Body\":\"\",\"Endpoint\":\"\"}}");
			attributes.put("tokenExpirationTime", "");
			attributes.put("objectKey", "");
			attributes.put("localFilePath", "");
			//attributes.put("datasource", "");
			attributes.put("bucketName", "");
			//attributes.put("projectId", "");
			attributes.put("storageType", "");
			attributes.put("userId", "");
			attributes.put("executionEnvironment", "Remote");
			JSONObject formats = new JSONObject();
//			formats.put("datasource", "datasourceDropdown");
//			formats.put("datasource-dp", "Datasource");
			formats.put("bucketName", "input");
			formats.put("bucketName-dp", "Bucket Name");
			formats.put("accessKey", "input");
			formats.put("accessKey-dp", "Access Key");
			formats.put("secretKey", "input");
			formats.put("secretKey-dp", "Secret Key");
			formats.put("region", "input");
			formats.put("region-dp", "Region");
//			formats.put("imageUri", "input");
//			formats.put("imageUri-dp", "imageUri");
			formats.put("roleArn", "input");
			formats.put("roleArn-dp", "roleArn");
//			formats.put("instanceType", "input");
//			formats.put("instanceType-dp", "instanceType"); 
			ds.put(ICIPDataSourceServiceUtil.ATTRIBUTES, attributes);
			ds.put("formats", formats);
		} catch (JSONException e) {
			logger.error("plugin attributes mismatch", e);
		}
		return ds;
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
		bodyMap.put("accesskey", connectionDetails.optString("accessKey"));
		bodyMap.put("secretkey", connectionDetails.optString("secretKey"));
		bodyMap.put("region", connectionDetails.optString("region"));
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
	public Long getAllModelObjectDetailsCount(List<ICIPDatasource> datasources, String searchModelName, String org) {
		// TODO Auto-generated method stub
		return null;
	}
}
