package com.lfn.icip.dataset.util;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;

import org.apache.http.HttpEntity;
import org.apache.http.HttpHost;
import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPatch;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.client.protocol.HttpClientContext;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.apache.tomcat.util.http.fileupload.FileUtils;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.base.Strings;
import com.lfn.icip.dataset.constants.ICIPPluginConstants;
import com.lfn.icip.dataset.properties.HttpClientUtil;
import com.lfn.icip.dataset.properties.ProxyProperties;
import com.lfn.icip.dataset.properties.ProxyProperties.HttpProxyConfiguration;


/**
 * final utils class for REST category plugins.
 */

public final class ICIPRestPluginUtils {
	
	/** The Constant log. */
    private static final Logger logger = LoggerFactory.getLogger(ICIPRestPluginUtils.class);
    
	/** The Constant METHOD. */
	private static final String AUTHMETHOD = "authMethod";
	
	/** The Constant AUTHURL. */
	private static final String AUTHURL = "authUrl";
    
    /**
     * Instantiates a new ICIP rest plugin utils.
     */
    private ICIPRestPluginUtils() {
    	
    }
    
	/**
	 * Validate proxy.
	 *
	 * @param uri the uri
	 * @param noProxyString the no proxy string
	 * @param proxyProperties the proxy properties
	 * @throws URISyntaxException the URI syntax exception
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public static void validateProxy(URI uri, String noProxyString, ProxyProperties proxyProperties) throws URISyntaxException, IOException {

		if (noProxyString.equalsIgnoreCase("true")) {
			HttpProxyConfiguration httpProxyConfiguration = proxyProperties.getHttpProxyConfiguration();
			logger.info("NO Proxy");
			String[] noProxy = { "*" + uri.getHost() + "*" };
			httpProxyConfiguration.setNoProxyHost(noProxy);
			proxyProperties.setHttpProxyConfiguration(httpProxyConfiguration);
		} else if (noProxyString.equalsIgnoreCase("false")) {
			HttpProxyConfiguration httpProxyConfiguration = proxyProperties.getHttpProxyConfiguration();
			String[] noProxy = {};
			httpProxyConfiguration.setNoProxyHost(noProxy);
			proxyProperties.setHttpProxyConfiguration(httpProxyConfiguration);
		} else {
			throw new IOException("Only True and False allowed for NoProxy");
		}
	}
	
	/**
	 * Gets the auth token.
	 *
	 * @param authDetails the auth details
	 * @param noProxyString the no proxy string
	 * @param proxyProperties the proxy properties
	 * @return the auth token
	 * @throws IOException Signals that an I/O exception has occurred.
	 * @throws URISyntaxException the URI syntax exception
	 */
	public static String getAuthToken(JSONObject authDetails, String noProxyString, ProxyProperties proxyProperties) 
			throws IOException, URISyntaxException {

		String authUrl = authDetails.optString(AUTHURL);
		String authParams = authDetails.optString("authParams");
		String authHeaders = authDetails.optString("authHeaders");
		String apimethod = authDetails.has(AUTHMETHOD) == true ? authDetails.getString(AUTHMETHOD) : "GET";
		URI uri = new URI(authUrl);
		JSONObject tempParamsObj = new JSONObject(authParams);
		JSONObject paramsObj = new JSONObject();
		for (String paramKey : tempParamsObj.keySet()) {
			if (!tempParamsObj.optString(paramKey).isEmpty())
				paramsObj.put(paramKey,tempParamsObj.optString(paramKey));		
		}

		try {

			ICIPRestPluginUtils.validateProxy(uri, noProxyString, proxyProperties);
			CloseableHttpClient httpclient = HttpClientUtil.getHttpClient("OAUTH", "", "", uri, proxyProperties,null);

			if (apimethod.toUpperCase(Locale.ENGLISH).equals("GET")) {

				StringBuilder bld = new StringBuilder();
				for (String key : paramsObj.keySet()) {
					bld.append(key + "=" + paramsObj.getString(key) + "&");
				}
				String query = bld.toString();
				if (query.trim().length() > 0 && query.endsWith("&")) {
					query = query.substring(0, query.lastIndexOf('&'));
					uri = new URI(uri.getScheme(), uri.getAuthority(), uri.getPath(), query, null);
				}
				HttpHost target = new HttpHost(uri.getHost(), uri.getPort(), uri.getScheme());
				HttpGet httpget = new HttpGet(uri.toString());
				CloseableHttpResponse response = httpclient.execute(target, httpget);
				logger.info("GET api type auth token generated");
				return EntityUtils.toString(response.getEntity());

			} else if (apimethod.toUpperCase().equals("POST")) {
				HttpHost target = new HttpHost(uri.getHost(), uri.getPort(), uri.getScheme());
				HttpPost httppost = new HttpPost(uri);
				List<NameValuePair> nvps = new ArrayList<>();

				if (authHeaders.trim().length() > 0) {
					JSONObject headersObj = new JSONObject(authHeaders);
					Iterator<String> keys = headersObj.keys();
					while (keys.hasNext()) {
						String key = keys.next();
						httppost.addHeader(key, (String) headersObj.get(key));
					}
				}

				JSONObject entityObj = new JSONObject(authParams);
				for (String authKey : entityObj.keySet()) {
					nvps.add(new BasicNameValuePair(authKey, entityObj.optString(authKey)));
				}

				httppost.setEntity(new UrlEncodedFormEntity(nvps, StandardCharsets.UTF_8));
				CloseableHttpResponse response = httpclient.execute(target, httppost);
				String resp = EntityUtils.toString(response.getEntity());
				if(response.getStatusLine().getStatusCode() == 200 || response.getStatusLine().getStatusCode() == 201 )
					return resp;
				else
					throw new Exception(resp);
			} else {
				logger.info("invalid authrntication request method! ->" + apimethod);
			}
		} catch (Exception ex) {
			logger.error("Error while getting access token:",ex);
		}

		return null;

	}
	
	/**
	 * Parses the params.
	 *
	 * @param params the params
	 * @return the list
	 */
	public static List<NameValuePair> parseParams(String params) {

		JSONArray paramsArr = new JSONArray(params);
		List<NameValuePair> nvps = new ArrayList<>();
		for (int len = 0; len < paramsArr.length(); len++) {
			JSONObject paramsObj = paramsArr.getJSONObject(len);
			nvps.add(new BasicNameValuePair(paramsObj.optString(ICIPPluginConstants.KEY).trim(), paramsObj.optString(ICIPPluginConstants.VALUE).trim()));
		}
		return nvps;
	}
	
	/**
	 * Execute get request.
	 *
	 * @param uri the uri
	 * @param authToken the auth token
	 * @param headerPrefix the header prefix
	 * @param body the body
	 * @param headers the headers
	 * @param params the params
	 * @param context the context
	 * @param httpclient the httpclient
	 * @param targetHost the target host
	 * @return the closeable http response
	 * @throws URISyntaxException the URI syntax exception
	 * @throws ClientProtocolException the client protocol exception
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public static CloseableHttpResponse executeGetRequest(URI uri, String authToken, String headerPrefix, String body, 
			String headers, String params, HttpClientContext context , CloseableHttpClient httpclient,
			HttpHost targetHost) throws URISyntaxException, ClientProtocolException, IOException {
		
		HttpGet httpget = new HttpGet(uri.toString());
		
		if(!Strings.isNullOrEmpty(authToken))
			httpget.addHeader("Authorization", headerPrefix + " " + authToken);
		
		if (!headers.trim().isEmpty()) {
			JSONArray headersArr = new JSONArray(headers);
			for(int len = 0; len<headersArr.length(); len ++) {
				JSONObject headersObj =  headersArr.getJSONObject(len);
				httpget.addHeader(headersObj.optString(ICIPPluginConstants.KEY).trim(), headersObj.optString(ICIPPluginConstants.VALUE).trim());
			}
		}
		
		if (!params.trim().isEmpty()) {
			List<NameValuePair> nvps = parseParams(params);
			
			URI paramsUri = new URIBuilder(httpget.getURI())
					.addParameters(nvps)
					.build();
			httpget.setURI(paramsUri);
		}
		
		if (context != null)
			return httpclient.execute(targetHost, httpget, context);
		else
			return httpclient.execute(targetHost, httpget);
	}
	
	/**
	 * Execute post request.
	 *
	 * @param uri the uri
	 * @param authToken the auth token
	 * @param headerPrefix the header prefix
	 * @param body the body
	 * @param headers the headers
	 * @param params the params
	 * @param context the context
	 * @param httpclient the httpclient
	 * @param targetHost the target host
	 * @return the closeable http response
	 * @throws URISyntaxException the URI syntax exception
	 * @throws ClientProtocolException the client protocol exception
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public static CloseableHttpResponse executePostRequest(URI uri, String authToken, String headerPrefix, String body, 
			String headers, String params, HttpClientContext context , CloseableHttpClient httpclient,
			HttpHost targetHost, String bodyType) throws URISyntaxException, ClientProtocolException, IOException {
		
		HttpPost post = new HttpPost(uri.toString());
		String uploadDirecoryPath = null;
		if(!Strings.isNullOrEmpty(authToken))
			post.addHeader("Authorization", headerPrefix + " " + authToken);
		
		if(!body.isEmpty()) {
			if(!body.trim().isEmpty() && bodyType.equals("x-www-form-urlencoded")){
			 List<NameValuePair> nameValuePairList = new ArrayList<NameValuePair>();
			 JSONArray bodyArr = new JSONArray(body);
	           for (int len = 0; len<bodyArr.length(); len ++) {
	        	   JSONObject bodyObj =  bodyArr.getJSONObject(len);
	               nameValuePairList.add(new BasicNameValuePair(bodyObj.optString(ICIPPluginConstants.KEY).trim(), bodyObj.optString(ICIPPluginConstants.VALUE).trim()));
	           }
	           UrlEncodedFormEntity formEntity = new UrlEncodedFormEntity(nameValuePairList, "utf-8");
	           formEntity.setContentType("application/x-www-form-urlencoded; charset=UTF-8");
	           post.setEntity(formEntity);
			} else if (!body.trim().isEmpty() && bodyType.equalsIgnoreCase(ICIPPluginConstants.FILE)) {
				JSONObject reqObj = new JSONObject(body);
				String isForTest = reqObj.optString(ICIPPluginConstants.IS_FOR_TEST);
				if (isForTest == null || isForTest.isEmpty())
					uploadDirecoryPath = reqObj.optString(ICIPPluginConstants.UPLOAD_DIRECORY_PATH);
				String fileParamName = reqObj.optString(ICIPPluginConstants.FILE_PARAM_NAME);
				if (fileParamName == null || fileParamName.isEmpty())
					fileParamName = ICIPPluginConstants.FILE_LOWER_CASE;
				File file = new File(reqObj.optString(ICIPPluginConstants.UPLOAD_FILE_PATH));
				MultipartEntityBuilder multipartEntityBuilder = MultipartEntityBuilder.create();
				multipartEntityBuilder.addBinaryBody(fileParamName, file, ContentType.DEFAULT_BINARY, file.getName());
				HttpEntity entity = multipartEntityBuilder.build();
				post.setEntity(entity);
			}
			else {
				StringEntity entity = new StringEntity(body, "UTF-8");
				post.setEntity(entity);
				}
		}
		
		if (!headers.trim().isEmpty()) {
			JSONArray headersArr = new JSONArray(headers);
			for (int len = 0; len < headersArr.length(); len++) {
				JSONObject headersObj = headersArr.getJSONObject(len);
				if ((ICIPPluginConstants.FILE.equalsIgnoreCase(bodyType) && !ICIPPluginConstants.CONTENT_TYPE
						.equalsIgnoreCase(headersObj.optString(ICIPPluginConstants.KEY)))
						|| !ICIPPluginConstants.FILE.equalsIgnoreCase(bodyType)) {
					post.addHeader(headersObj.optString(ICIPPluginConstants.KEY).trim(),
							headersObj.optString(ICIPPluginConstants.VALUE).trim());
				}
			}
		}
		
		if (params.trim().length() > 0) {
			List<NameValuePair> nvps = parseParams(params);
			URI paramsUri = new URIBuilder(post.getURI())
					.addParameters(nvps)
					.build();
			post.setURI(paramsUri);
		}
		
		CloseableHttpResponse resp;
		
		if (context != null)
			resp = httpclient.execute(targetHost ,post, context);
		else
			resp = httpclient.execute(targetHost, post);
		
		if (bodyType.equalsIgnoreCase(ICIPPluginConstants.FILE)) {
			if (uploadDirecoryPath != null && !uploadDirecoryPath.isEmpty()) {
				try {
					File directory = new File(uploadDirecoryPath);
					FileUtils.cleanDirectory(directory);
				} catch (Exception e) {
					logger.error("Error because of:{} at class:{} and line:{}", e.getMessage(),
							e.getStackTrace()[0].getClass(), e.getStackTrace()[0].getLineNumber());
				}
			}
		}
		
		return resp;
	}

	/**
	 * Execute put request.
	 *
	 * @param uri the uri
	 * @param authToken the auth token
	 * @param headerPrefix the header prefix
	 * @param body the body
	 * @param headers the headers
	 * @param params the params
	 * @param context the context
	 * @param httpclient the httpclient
	 * @param targetHost the target host
	 * @return the closeable http response
	 * @throws URISyntaxException the URI syntax exception
	 * @throws ClientProtocolException the client protocol exception
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public static CloseableHttpResponse executePutRequest(URI uri, String authToken, String headerPrefix, String body, 
			String headers, String params, HttpClientContext context , CloseableHttpClient httpclient,
			HttpHost targetHost) throws URISyntaxException, ClientProtocolException, IOException {
		
		HttpPut httpput = new HttpPut(uri.toString());
		
		if(!Strings.isNullOrEmpty(authToken))
			httpput.addHeader("Authorization", headerPrefix + " " + authToken);
		
		if(!body.isEmpty()) {
			StringEntity entity = new StringEntity(body);
			httpput.setEntity(entity);
		}
		if (headers.trim().length() > 0) {
			JSONArray headersArr = new JSONArray(headers);				
			for(int len = 0; len<headersArr.length(); len ++) {
				JSONObject headersObj =  headersArr.getJSONObject(len);
				httpput.addHeader(headersObj.optString(ICIPPluginConstants.KEY).trim(), headersObj.optString(ICIPPluginConstants.VALUE).trim());
			}
		}
		
		if (params.trim().length() > 0) {
			List<NameValuePair> nvps = parseParams(params);
			URI paramsUri = new URIBuilder(httpput.getURI())
					.addParameters(nvps)
					.build();
			httpput.setURI(paramsUri);
		}
		
		if (context != null)
			return httpclient.execute(targetHost ,httpput, context);
		else
			return httpclient.execute(targetHost, httpput);
	}
	
	/**
	 * Execute delete request.
	 *
	 * @param uri the uri
	 * @param authToken the auth token
	 * @param headerPrefix the header prefix
	 * @param body the body
	 * @param headers the headers
	 * @param params the params
	 * @param context the context
	 * @param httpclient the httpclient
	 * @param targetHost the target host
	 * @return the closeable http response
	 * @throws URISyntaxException the URI syntax exception
	 * @throws ClientProtocolException the client protocol exception
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public static CloseableHttpResponse executeDeleteRequest(URI uri, String authToken, String headerPrefix, String body, 
			String headers, String params, HttpClientContext context , CloseableHttpClient httpclient,
			HttpHost targetHost) throws URISyntaxException, ClientProtocolException, IOException {
		
		HttpDelete httpdelete = new HttpDelete(uri.toString());

		if (!Strings.isNullOrEmpty(authToken))
			httpdelete.addHeader("Authorization", headerPrefix + " " + authToken);

		if (headers.trim().length() > 0) {
			JSONArray headersArr = new JSONArray(headers);
			for (int len = 0; len < headersArr.length(); len++) {
				JSONObject headersObj = headersArr.getJSONObject(len);
				httpdelete.addHeader(headersObj.optString(ICIPPluginConstants.KEY), headersObj.optString(ICIPPluginConstants.VALUE));
			}
		}

		if (params.trim().length() > 0) {
			List<NameValuePair> nvps = parseParams(params);
			URI paramsUri = new URIBuilder(httpdelete.getURI()).addParameters(nvps).build();
			httpdelete.setURI(paramsUri);
		}

		CloseableHttpResponse res = null;
		if (context != null)
			res = httpclient.execute(targetHost, httpdelete, context);
		else
			res = httpclient.execute(targetHost, httpdelete);

//		if (flag == 0) {
//			HttpPost createTemp = new HttpPost(uri.toString());
//
//		}

		return res;
	}
	
	public static CloseableHttpResponse executePatchRequest(URI uri, String authToken, String headerPrefix, String body, 
			String headers, String params, HttpClientContext context , CloseableHttpClient httpclient,
			HttpHost targetHost) throws URISyntaxException, ClientProtocolException, IOException {
		
		HttpPatch post = new HttpPatch(uri.toString());
		
		if(!Strings.isNullOrEmpty(authToken))
			post.addHeader("Authorization", headerPrefix + " " + authToken);
		
		if(!body.isEmpty()) {
			StringEntity entity = new StringEntity(body);
			post.setEntity(entity);
		}
		
		if (!headers.trim().isEmpty()) {
			JSONArray headersArr = new JSONArray(headers);			
			for(int len = 0; len<headersArr.length(); len ++) {
				JSONObject headersObj =  headersArr.getJSONObject(len);
				post.addHeader(headersObj.optString(ICIPPluginConstants.KEY).trim(), headersObj.optString(ICIPPluginConstants.VALUE).trim());
			}
		}
		
		if (params.trim().length() > 0) {
			List<NameValuePair> nvps = parseParams(params);
			URI paramsUri = new URIBuilder(post.getURI())
					.addParameters(nvps)
					.build();
			post.setURI(paramsUri);
		}
		
		CloseableHttpResponse resp;
		
		if (context != null)
			resp = httpclient.execute(targetHost ,post, context);
		else
			resp = httpclient.execute(targetHost, post);
		
		
		return resp;
	}
	
}
