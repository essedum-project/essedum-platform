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

package com.lfn.ai.comm.lib.util.swagger.client;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.lang.reflect.Type;
import java.net.URLConnection;
import java.net.URLEncoder;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.GeneralSecurityException;
import java.security.KeyStore;
import java.security.cert.Certificate;
import java.security.cert.CertificateFactory;
import java.text.DateFormat;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.net.ssl.KeyManager;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;

import com.lfn.ai.comm.lib.util.swagger.client.auth.ApiKeyAuth;
import com.lfn.ai.comm.lib.util.swagger.client.auth.Authentication;
import com.lfn.ai.comm.lib.util.swagger.client.auth.HttpBasicAuth;
import com.lfn.ai.comm.lib.util.swagger.client.auth.OAuth;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.internal.http.HttpMethod;
import okhttp3.logging.HttpLoggingInterceptor;
import okhttp3.logging.HttpLoggingInterceptor.Level;
import okio.BufferedSink;
import okio.Okio;

// Generated Swagger client. The parameter-count (S107), default base-URI (S1075, overridable via
// setBasePath) and temp-file (S5443, standard Files.createTempFile for response downloads) findings
// are inherent to the generated code and are intentionally suppressed.
@SuppressWarnings({ "java:S107", "java:S1075", "java:S5443" })
public class ApiClient {

	private static final String APPLICATION_JSON = "application/json";

	private String basePath = "http://ieai.marketplace.infosysapps.com/";
	private boolean debugging = false;
	private Map<String, String> defaultHeaderMap = new HashMap<>();
	private String tempFolderPath = null;

	private Map<String, Authentication> authentications;

	private DateFormat dateFormat;

	private InputStream sslCaCert;
	private boolean verifyingSsl;
	private KeyManager[] keyManagers;

	private OkHttpClient httpClient;
	private JSON json;
	private HttpLoggingInterceptor loggingInterceptor;

	/*
	 * Constructor for ApiClient
	 */
	public ApiClient() {
		httpClient = new OkHttpClient();

		verifyingSsl = true;

		json = new JSON();

		// Set default User-Agent.
		setUserAgent("Swagger-Codegen/1.0.0/java");

		// Setup authentications (key: authentication name, value: authentication).
		authentications = new HashMap<>();
		authentications.put("aiplat_auth", new OAuth());
		authentications.put("api_key", new ApiKeyAuth("header", "api_key"));
		// Prevent the authentications from being modified.
		authentications = Collections.unmodifiableMap(authentications);
	}

	/**
	 * Get base path
	 *
	 * @return Baes path
	 */
	public String getBasePath() {
		return basePath;
	}

	/**
	 * Set base path
	 *
	 * @param basePath Base path of the URL (e.g
	 *                 http://ieai.marketplace.infosysapps.com/
	 * @return An instance of OkHttpClient
	 */
	public ApiClient setBasePath(String basePath) {
		this.basePath = basePath;
		return this;
	}

	/**
	 * Get HTTP client
	 *
	 * @return An instance of OkHttpClient
	 */
	public OkHttpClient getHttpClient() {
		return httpClient;
	}

	/**
	 * Set HTTP client
	 *
	 * @param httpClient An instance of OkHttpClient
	 * @return Api Client
	 */
	public ApiClient setHttpClient(OkHttpClient httpClient) {
		this.httpClient = httpClient;
		return this;
	}

	/**
	 * Get JSON
	 *
	 * @return JSON object
	 */
	public JSON getJSON() {
		return json;
	}

	/**
	 * Set JSON
	 *
	 * @param json JSON object
	 * @return Api client
	 */
	public ApiClient setJSON(JSON json) {
		this.json = json;
		return this;
	}

	/**
	 * True if isVerifyingSsl flag is on
	 *
	 * @return True if isVerifySsl flag is on
	 */
	public boolean isVerifyingSsl() {
		return verifyingSsl;
	}

	/**
	 * Configure whether to verify certificate and hostname when making https
	 * requests. Default to true. NOTE: Do NOT set to false in production code,
	 * otherwise you would face multiple types of cryptographic attacks.
	 *
	 * @param verifyingSsl True to verify TLS/SSL connection
	 * @return ApiClient
	 */
	public ApiClient setVerifyingSsl(boolean verifyingSsl) {
		this.verifyingSsl = verifyingSsl;
		applySslSettings();
		return this;
	}

	/**
	 * Get SSL CA cert.
	 *
	 * @return Input stream to the SSL CA cert
	 */
	public InputStream getSslCaCert() {
		return sslCaCert;
	}

	/**
	 * Configure the CA certificate to be trusted when making https requests. Use
	 * null to reset to default.
	 *
	 * @param sslCaCert input stream for SSL CA cert
	 * @return ApiClient
	 */
	public ApiClient setSslCaCert(InputStream sslCaCert) {
		this.sslCaCert = sslCaCert;
		applySslSettings();
		return this;
	}

	public KeyManager[] getKeyManagers() {
		return keyManagers;
	}

	/**
	 * Configure client keys to use for authorization in an SSL session. Use null to
	 * reset to default.
	 *
	 * @param managers The KeyManagers to use
	 * @return ApiClient
	 */
	public ApiClient setKeyManagers(KeyManager[] managers) {
		this.keyManagers = managers;
		applySslSettings();
		return this;
	}

	public DateFormat getDateFormat() {
		return dateFormat;
	}

	public ApiClient setDateFormat(DateFormat dateFormat) {
		this.json.setDateFormat(dateFormat);
		return this;
	}

	public ApiClient setSqlDateFormat(DateFormat dateFormat) {
		this.json.setSqlDateFormat(dateFormat);
		return this;
	}

	public ApiClient setOffsetDateTimeFormat(DateTimeFormatter dateFormat) {
		this.json.setOffsetDateTimeFormat(dateFormat);
		return this;
	}

	public ApiClient setLocalDateFormat(DateTimeFormatter dateFormat) {
		this.json.setLocalDateFormat(dateFormat);
		return this;
	}

	public ApiClient setLenientOnJson(boolean lenientOnJson) {
		this.json.setLenientOnJson(lenientOnJson);
		return this;
	}

	/**
	 * Get authentications (key: authentication name, value: authentication).
	 *
	 * @return Map of authentication objects
	 */
	public Map<String, Authentication> getAuthentications() {
		return authentications;
	}

	/**
	 * Get authentication for the given name.
	 *
	 * @param authName The authentication name
	 * @return The authentication, null if not found
	 */
	public Authentication getAuthentication(String authName) {
		return authentications.get(authName);
	}

	/**
	 * Helper method to set username for the first HTTP basic authentication.
	 *
	 * @param username Username
	 */
	public void setUsername(String username) {
		for (Authentication auth : authentications.values()) {
			if (auth instanceof HttpBasicAuth httpBasicAuth) {
				httpBasicAuth.setUsername(username);
				return;
			}
		}
		throw new IllegalStateException("No HTTP basic authentication configured!");
	}

	/**
	 * Helper method to set password for the first HTTP basic authentication.
	 *
	 * @param password Password
	 */
	public void setPassword(String password) {
		for (Authentication auth : authentications.values()) {
			if (auth instanceof HttpBasicAuth httpBasicAuth) {
				httpBasicAuth.setPassword(password);
				return;
			}
		}
		throw new IllegalStateException("No HTTP basic authentication configured!");
	}

	/**
	 * Helper method to set API key value for the first API key authentication.
	 *
	 * @param apiKey API key
	 */
	public void setApiKey(String apiKey) {
		for (Authentication auth : authentications.values()) {
			if (auth instanceof ApiKeyAuth apiKeyAuth) {
				apiKeyAuth.setApiKey(apiKey);
				return;
			}
		}
		throw new IllegalStateException("No API key authentication configured!");
	}

	/**
	 * Helper method to set API key prefix for the first API key authentication.
	 *
	 * @param apiKeyPrefix API key prefix
	 */
	public void setApiKeyPrefix(String apiKeyPrefix) {
		for (Authentication auth : authentications.values()) {
			if (auth instanceof ApiKeyAuth apiKeyAuth) {
				apiKeyAuth.setApiKeyPrefix(apiKeyPrefix);
				return;
			}
		}
		throw new IllegalStateException("No API key authentication configured!");
	}

	/**
	 * Helper method to set access token for the first OAuth2 authentication.
	 *
	 * @param accessToken Access token
	 */
	public void setAccessToken(String accessToken) {
		for (Authentication auth : authentications.values()) {
			if (auth instanceof OAuth oauth) {
				oauth.setAccessToken(accessToken);
				return;
			}
		}
		throw new IllegalStateException("No OAuth2 authentication configured!");
	}

	/**
	 * Set the User-Agent header's value (by adding to the default header map).
	 *
	 * @param userAgent HTTP request's user agent
	 * @return ApiClient
	 */
	public ApiClient setUserAgent(String userAgent) {
		addDefaultHeader("User-Agent", userAgent);
		return this;
	}

	/**
	 * Add a default header.
	 *
	 * @param key   The header's key
	 * @param value The header's value
	 * @return ApiClient
	 */
	public ApiClient addDefaultHeader(String key, String value) {
		defaultHeaderMap.put(key, value);
		return this;
	}

	/**
	 * Check that whether debugging is enabled for this API client.
	 *
	 * @return True if debugging is enabled, false otherwise.
	 */
	public boolean isDebugging() {
		return debugging;
	}

	/**
	 * Enable/disable debugging for this API client.
	 *
	 * @param debugging To enable (true) or disable (false) debugging
	 * @return ApiClient
	 */
	public ApiClient setDebugging(boolean debugging) {
		if (debugging != this.debugging) {
			if (debugging) {
				loggingInterceptor = new HttpLoggingInterceptor();
				loggingInterceptor.setLevel(Level.BODY);
				httpClient.interceptors().add(loggingInterceptor);
			} else {
				httpClient.interceptors().remove(loggingInterceptor);
				loggingInterceptor = null;
			}
		}
		this.debugging = debugging;
		return this;
	}

	/**
	 * The path of temporary folder used to store downloaded files from endpoints
	 * with file response. The default value is <code>null</code>, i.e. using the
	 * system's default tempopary folder.
	 *
	 * @see <a href=
	 *      "https://docs.oracle.com/javase/7/docs/api/java/io/File.html#createTempFile">createTempFile</a>
	 * @return Temporary folder path
	 */
	public String getTempFolderPath() {
		return tempFolderPath;
	}

	/**
	 * Set the temporary folder path (for downloading files)
	 *
	 * @param tempFolderPath Temporary folder path
	 * @return ApiClient
	 */
	public ApiClient setTempFolderPath(String tempFolderPath) {
		this.tempFolderPath = tempFolderPath;
		return this;
	}

	/**
	 * Get connection timeout (in milliseconds).
	 *
	 * @return Timeout in milliseconds
	 */
	public int getConnectTimeout() {
		return httpClient.connectTimeoutMillis();
	}

	/**
	 * Get read timeout (in milliseconds).
	 *
	 * @return Timeout in milliseconds
	 */
	public int getReadTimeout() {
		return httpClient.readTimeoutMillis();
	}

	/**
	 * Get write timeout (in milliseconds).
	 *
	 * @return Timeout in milliseconds
	 */
	public int getWriteTimeout() {
		return httpClient.writeTimeoutMillis();
	}

	/**
	 * Format the given parameter object into string.
	 *
	 * @param param Parameter
	 * @return String representation of the parameter
	 */
	public String parameterToString(Object param) {
		if (param == null) {
			return "";
		} else if (param instanceof Date || param instanceof OffsetDateTime || param instanceof LocalDate) {
			// Serialize to json string and remove the " enclosing characters
			String jsonStr = json.serialize(param);
			return jsonStr.substring(1, jsonStr.length() - 1);
		} else if (param instanceof Collection) {
			StringBuilder b = new StringBuilder();
			for (Object o : (Collection<?>) param) {
				if (!b.isEmpty()) {
					b.append(",");
				}
				b.append(String.valueOf(o));
			}
			return b.toString();
		} else {
			return String.valueOf(param);
		}
	}

	/**
	 * Formats the specified query parameter to a list containing a single
	 * {@code Pair} object.
	 *
	 * Note that {@code value} must not be a collection.
	 *
	 * @param name  The name of the parameter.
	 * @param value The value of the parameter.
	 * @return A list containing a single {@code Pair} object.
	 */
	public List<Pair> parameterToPair(String name, Object value) {
		List<Pair> params = new ArrayList<>();

		// preconditions
		if (name == null || name.isEmpty() || value == null || value instanceof Collection)
			return params;

		params.add(new Pair(name, parameterToString(value)));
		return params;
	}

	/**
	 * Formats the specified collection query parameters to a list of {@code Pair}
	 * objects.
	 *
	 * Note that the values of each of the returned Pair objects are
	 * percent-encoded.
	 *
	 * @param collectionFormat The collection format of the parameter.
	 * @param name             The name of the parameter.
	 * @param value            The value of the parameter.
	 * @return A list of {@code Pair} objects.
	 */
	public List<Pair> parameterToPairs(String collectionFormat, String name, Collection<?> value) {
		List<Pair> params = new ArrayList<>();

		// preconditions
		if (name == null || name.isEmpty() || value == null || value.isEmpty()) {
			return params;
		}

		// create the params based on the collection format
		if ("multi".equals(collectionFormat)) {
			for (Object item : value) {
				params.add(new Pair(name, escapeString(parameterToString(item))));
			}
			return params;
		}

		// collectionFormat is assumed to be "csv" by default
		String delimiter = ",";

		// escape all delimiters except commas, which are URI reserved
		// characters
		if ("ssv".equals(collectionFormat)) {
			delimiter = escapeString(" ");
		} else if ("tsv".equals(collectionFormat)) {
			delimiter = escapeString("\t");
		} else if ("pipes".equals(collectionFormat)) {
			delimiter = escapeString("|");
		}

		StringBuilder sb = new StringBuilder();
		for (Object item : value) {
			sb.append(delimiter);
			sb.append(escapeString(parameterToString(item)));
		}

		params.add(new Pair(name, sb.substring(delimiter.length())));

		return params;
	}

	/**
	 * Sanitize filename by removing path. e.g. ../../sun.gif becomes sun.gif
	 *
	 * @param filename The filename to be sanitized
	 * @return The sanitized filename
	 */
	public String sanitizeFilename(String filename) {
		return filename.replaceAll(".*[/\\\\]", "");
	}

	/**
	 * Check if the given MIME is a JSON MIME. JSON MIME examples: application/json
	 * application/json; charset=UTF8 APPLICATION/JSON application/vnd.company+json
	 * "* / *" is also default to JSON
	 * 
	 * @param mime MIME (Multipurpose Internet Mail Extensions)
	 * @return True if the given MIME is JSON, false otherwise.
	 */
	public boolean isJsonMime(String mime) {
		String jsonMime = "(?i)^(application/json|[^;/ \t]+/[^;/ \t]+[+]json)[ \t]*(;.*)?$";
		return mime != null && (mime.matches(jsonMime) || mime.equals("*/*"));
	}

	/**
	 * Select the Accept header's value from the given accepts array: if JSON exists
	 * in the given array, use it; otherwise use all of them (joining into a string)
	 *
	 * @param accepts The accepts array to select from
	 * @return The Accept header to use. If the given array is empty, null will be
	 *         returned (not to set the Accept header explicitly).
	 */
	public String selectHeaderAccept(String[] accepts) {
		if (accepts.length == 0) {
			return null;
		}
		for (String accept : accepts) {
			if (isJsonMime(accept)) {
				return accept;
			}
		}
		return StringUtil.join(accepts, ",");
	}

	/**
	 * Select the Content-Type header's value from the given array: if JSON exists
	 * in the given array, use it; otherwise use the first one of the array.
	 *
	 * @param contentTypes The Content-Type array to select from
	 * @return The Content-Type header to use. If the given array is empty, or
	 *         matches "any", JSON will be used.
	 */
	public String selectHeaderContentType(String[] contentTypes) {
		if (contentTypes.length == 0 || contentTypes[0].equals("*/*")) {
			return APPLICATION_JSON;
		}
		for (String contentType : contentTypes) {
			if (isJsonMime(contentType)) {
				return contentType;
			}
		}
		return contentTypes[0];
	}

	/**
	 * Escape the given string to be used as URL query value.
	 *
	 * @param str String to be escaped
	 * @return Escaped string
	 */
	public String escapeString(String str) {
		try {
			return URLEncoder.encode(str, "utf8").replace("+", "%20");
		} catch (UnsupportedEncodingException e) {
			return str;
		}
	}

	/**
	 * Deserialize response body to Java object, according to the return type and
	 * the Content-Type response header.
	 *
	 * @param <T>        Type
	 * @param response   HTTP response
	 * @param returnType The type of the Java object
	 * @return The deserialized Java object
	 * @throws ApiException If fail to deserialize response body, i.e. cannot read
	 *                      response body or the Content-Type of the response is not
	 *                      supported.
	 */
	@SuppressWarnings("unchecked")
	public <T> T deserialize(Response response, Type returnType) throws ApiException {
		if (response == null || returnType == null) {
			return null;
		}

		if ("byte[]".equals(returnType.toString())) {
			// Handle binary response (byte array).
			try {
				return (T) response.body().bytes();
			} catch (IOException e) {
				throw new ApiException(e);
			}
		} else if (returnType.equals(File.class)) {
			// Handle file downloading.
			return (T) downloadFileFromResponse(response);
		}

		String respBody;
		try {
			if (response.body() != null)
				respBody = response.body().string();
			else
				respBody = null;
		} catch (IOException e) {
			throw new ApiException(e);
		}

		if (respBody == null || "".equals(respBody)) {
			return null;
		}

		String contentType = response.headers().get("Content-Type");
		if (contentType == null) {
			// ensuring a default content type
			contentType = APPLICATION_JSON;
		}
		if (isJsonMime(contentType)) {
			return json.deserialize(respBody, returnType);
		} else if (returnType.equals(String.class)) {
			// Expecting string, return the raw response body.
			return (T) respBody;
		} else {
			throw new ApiException("Content type \"" + contentType + "\" is not supported for type: " + returnType,
					response.code(), response.headers().toMultimap(), respBody);
		}
	}

	/**
	 * Serialize the given Java object into request body according to the object's
	 * class and the request Content-Type.
	 *
	 * @param obj         The Java object
	 * @param contentType The request Content-Type
	 * @return The serialized request body
	 * @throws ApiException If fail to serialize the given object
	 */
	@SuppressWarnings("deprecation")
	public RequestBody serialize(Object obj, String contentType) throws ApiException {
		if (obj instanceof byte[] byteArray) {
			// Binary (byte array) body parameter support.
			return RequestBody.create(MediaType.parse(contentType), byteArray);
		} else if (obj instanceof File file) {
			// File body parameter support.
			return RequestBody.create(MediaType.parse(contentType), file);
		} else if (isJsonMime(contentType)) {
			String content;
			if (obj != null) {
				content = json.serialize(obj);
			} else {
				content = "";
			}
			return RequestBody.create(MediaType.parse(contentType), content);
		} else {
			throw new ApiException("Content type \"" + contentType + "\" is not supported");
		}
	}

	/**
	 * Download file from the given response.
	 *
	 * @param response An instance of the Response object
	 * @throws ApiException If fail to read file content from response and write to
	 *                      disk
	 * @return Downloaded file
	 */
	public File downloadFileFromResponse(Response response) throws ApiException {
		try {
			File file = prepareDownloadFile(response);
			BufferedSink sink = Okio.buffer(Okio.sink(file));
			sink.writeAll(response.body().source());
			sink.close();
			return file;
		} catch (IOException e) {
			throw new ApiException(e);
		}
	}

	/**
	 * Prepare file for download
	 *
	 * @param response An instance of the Response object
	 * @throws IOException If fail to prepare file for download
	 * @return Prepared file for the download
	 */
	public File prepareDownloadFile(Response response) throws IOException {
		String filename = null;
		String contentDisposition = response.header("Content-Disposition");
		if (contentDisposition != null && !"".equals(contentDisposition)) {
			// Get filename from the Content-Disposition header.
			Pattern pattern = Pattern.compile("filename=['\"]?([^'\"\\s]+)['\"]?");
			Matcher matcher = pattern.matcher(contentDisposition);
			if (matcher.find()) {
				filename = sanitizeFilename(matcher.group(1));
			}
		}

		String prefix = null;
		String suffix = null;
		if (filename == null) {
			prefix = "download-";
			suffix = "";
		} else {
			int pos = filename.lastIndexOf(".");
			if (pos == -1) {
				prefix = filename + "-";
			} else {
				prefix = filename.substring(0, pos) + "-";
				suffix = filename.substring(pos);
			}
			// File.createTempFile requires the prefix to be at least three characters long
			if (prefix.length() < 3)
				prefix = "download-";
		}

		if (tempFolderPath == null)
			return Files.createTempFile(prefix, suffix).toFile();
		else
			return Files.createTempFile(Paths.get(tempFolderPath), prefix, suffix).toFile();
	}

	/**
	 * {@link #execute(Call, Type)}
	 *
	 * @param <T>  Type
	 * @param call An instance of the Call object
	 * @throws ApiException If fail to execute the call
	 * @return ApiResponse&lt;T&gt;
	 */
	public <T> ApiResponse<T> execute(Call call) throws ApiException {
		return execute(call, null);
	}

	/**
	 * Execute HTTP call and deserialize the HTTP response body into the given
	 * return type.
	 *
	 * @param returnType The return type used to deserialize HTTP response body
	 * @param <T>        The return type corresponding to (same with) returnType
	 * @param call       Call
	 * @return ApiResponse object containing response status, headers and data,
	 *         which is a Java object deserialized from response body and would be
	 *         null when returnType is null.
	 * @throws ApiException If fail to execute the call
	 */
	public <T> ApiResponse<T> execute(Call call, Type returnType) throws ApiException {
		try {
			Response response = call.execute();
			T data = handleResponse(response, returnType);
			return new ApiResponse<>(response.code(), response.headers().toMultimap(), data);
		} catch (IOException e) {
			throw new ApiException(e);
		}
	}

	/**
	 * {@link #executeAsync(Call, Type, ApiCallback)}
	 *
	 * @param <T>      Type
	 * @param call     An instance of the Call object
	 * @param callback ApiCallback&lt;T&gt;
	 */
	public <T> void executeAsync(Call call, ApiCallback<T> callback) {
		executeAsync(call, null, callback);
	}

	/**
	 * Execute HTTP call asynchronously.
	 *
	 * @see #execute(Call, Type)
	 * @param <T>        Type
	 * @param call       The callback to be executed when the API call finishes
	 * @param returnType Return type
	 * @param callback   ApiCallback
	 */
	@SuppressWarnings("unchecked")
	public <T> void executeAsync(Call call, final Type returnType, final ApiCallback<T> callback) {
		call.enqueue(new Callback() {
			
			@Override
			public void onFailure(Call call, IOException e) {
				callback.onFailure(new ApiException(e), 0, null);
			}

			@Override
			public void onResponse(Call call, Response response) throws IOException {
				T result;
				try {
					result = (T) handleResponse(response, returnType);
				} catch (ApiException e) {
					callback.onFailure(e, response.code(), response.headers().toMultimap());
					return;
				}
				callback.onSuccess(result, response.code(), response.headers().toMultimap());
			}
		});
	}

	/**
	 * Handle the given response, return the deserialized object when the response
	 * is successful.
	 *
	 * @param <T>        Type
	 * @param response   Response
	 * @param returnType Return type
	 * @throws ApiException If the response has a unsuccessful status code or fail
	 *                      to deserialize the response body
	 * @return Type
	 */
	public <T> T handleResponse(Response response, Type returnType) throws ApiException {
		if (response.isSuccessful()) {
			if (returnType == null || response.code() == 204) {
				// returning null if the returnType is not defined,
				// or the status code is 204 (No Content)
				if (response.body() != null) {
					response.body().close();
				}
				return null;
			} else {
				return deserialize(response, returnType);
			}
		} else {
			String respBody = null;
			if (response.body() != null) {
				try {
					respBody = response.body().string();
				} catch (IOException e) {
					throw new ApiException(response.message(), e, response.code(), response.headers().toMultimap());
				}
			}
			throw new ApiException(response.message(), response.code(), response.headers().toMultimap(), respBody);
		}
	}

	/**
	 * Build HTTP call with the given options.
	 *
	 * @param path                    The sub-path of the HTTP URL
	 * @param method                  The request method, one of "GET", "HEAD",
	 *                                "OPTIONS", "POST", "PUT", "PATCH" and "DELETE"
	 * @param queryParams             The query parameters
	 * @param collectionQueryParams   The collection query parameters
	 * @param body                    The request body object
	 * @param headerParams            The header parameters
	 * @param formParams              The form parameters
	 * @param authNames               The authentications to apply
	 * @param progressRequestListener Progress request listener
	 * @return The HTTP call
	 * @throws ApiException If fail to serialize the request body object
	 */
	public Call buildCall(String path, String method, List<Pair> queryParams, List<Pair> collectionQueryParams,
			Object body, Map<String, String> headerParams, Map<String, Object> formParams, String[] authNames,
			ProgressRequestBody.ProgressRequestListener progressRequestListener) throws ApiException {
		Request request = buildRequest(path, method, queryParams, collectionQueryParams, body, headerParams, formParams,
				authNames, progressRequestListener);

		return httpClient.newCall(request);
	}

	/**
	 * Build an HTTP request with the given options.
	 *
	 * @param path                    The sub-path of the HTTP URL
	 * @param method                  The request method, one of "GET", "HEAD",
	 *                                "OPTIONS", "POST", "PUT", "PATCH" and "DELETE"
	 * @param queryParams             The query parameters
	 * @param collectionQueryParams   The collection query parameters
	 * @param body                    The request body object
	 * @param headerParams            The header parameters
	 * @param formParams              The form parameters
	 * @param authNames               The authentications to apply
	 * @param progressRequestListener Progress request listener
	 * @return The HTTP request
	 * @throws ApiException If fail to serialize the request body object
	 */
	@SuppressWarnings("deprecation")
	public Request buildRequest(String path, String method, List<Pair> queryParams, List<Pair> collectionQueryParams,
			Object body, Map<String, String> headerParams, Map<String, Object> formParams, String[] authNames,
			ProgressRequestBody.ProgressRequestListener progressRequestListener) throws ApiException {
		updateParamsForAuth(authNames, queryParams, headerParams);

		final String url = buildUrl(path, queryParams, collectionQueryParams);
		final Request.Builder reqBuilder = new Request.Builder().url(url);
		processHeaderParams(headerParams, reqBuilder);

		String contentType = headerParams.get("Content-Type");
		// ensuring a default content type
		if (contentType == null) {
			contentType = APPLICATION_JSON;
		}

		RequestBody reqBody = null;
		if (HttpMethod.permitsRequestBody(method)) {
			if (body == null) {
				if (!"DELETE".equals(method)) {
					// use an empty request body (for POST, PUT and PATCH)
					reqBody = RequestBody.create(MediaType.parse(contentType), ""); //NOSONAR
				}
			} else {
				reqBody = serialize(body, contentType);
			}
		}

		return reqBuilder.method(method, reqBody).build();
	}

	/**
	 * Build full URL by concatenating base path, the given sub path and query
	 * parameters.
	 *
	 * @param path                  The sub path
	 * @param queryParams           The query parameters
	 * @param collectionQueryParams The collection query parameters
	 * @return The full URL
	 */
	public String buildUrl(String path, List<Pair> queryParams, List<Pair> collectionQueryParams) {
		final StringBuilder url = new StringBuilder();
		url.append(basePath).append(path);

		// support (constant) query string in `path`, e.g. "/posts?draft=1"
		appendQueryParams(url, queryParams, true);
		// collection query parameter values are already escaped as part of parameterToPairs
		appendQueryParams(url, collectionQueryParams, false);

		return url.toString();
	}

	/**
	 * Append the given query parameters to the URL being built.
	 *
	 * @param url         The URL builder to append to
	 * @param params      The query parameters to append
	 * @param escapeValue Whether the parameter values need to be escaped
	 */
	private void appendQueryParams(StringBuilder url, List<Pair> params, boolean escapeValue) {
		if (params == null || params.isEmpty()) {
			return;
		}
		String prefix = url.indexOf("?") == -1 ? "?" : "&";
		for (Pair param : params) {
			if (param.getValue() == null) {
				continue;
			}
			url.append(prefix);
			prefix = "&";
			String value = parameterToString(param.getValue());
			url.append(escapeString(param.getName())).append("=").append(escapeValue ? escapeString(value) : value);
		}
	}

	/**
	 * Set header parameters to the request builder, including default headers.
	 *
	 * @param headerParams Header parameters in the ofrm of Map
	 * @param reqBuilder   Reqeust.Builder
	 */
	public void processHeaderParams(Map<String, String> headerParams, Request.Builder reqBuilder) {
		for (Entry<String, String> param : headerParams.entrySet()) {
			reqBuilder.header(param.getKey(), parameterToString(param.getValue()));
		}
		for (Entry<String, String> header : defaultHeaderMap.entrySet()) {
			if (!headerParams.containsKey(header.getKey())) {
				reqBuilder.header(header.getKey(), parameterToString(header.getValue()));
			}
		}
	}

	/**
	 * Update query and header parameters based on authentication settings.
	 *
	 * @param authNames    The authentications to apply
	 * @param queryParams  List of query parameters
	 * @param headerParams Map of header parameters
	 */
	public void updateParamsForAuth(String[] authNames, List<Pair> queryParams, Map<String, String> headerParams) {
		for (String authName : authNames) {
			Authentication auth = authentications.get(authName);
			if (auth == null)
				throw new IllegalArgumentException("Authentication undefined: " + authName);
			auth.applyToParams(queryParams, headerParams);
		}
	}

	/**
	 * Guess Content-Type header from the given file (defaults to
	 * "application/octet-stream").
	 *
	 * @param file The given file
	 * @return The guessed Content-Type
	 */
	public String guessContentTypeFromFile(File file) {
		String contentType = URLConnection.guessContentTypeFromName(file.getName());
		if (contentType == null) {
			return "application/octet-stream";
		} else {
			return contentType;
		}
	}

	/**
	 * Apply SSL related settings to httpClient according to the current values of
	 * verifyingSsl and sslCaCert.
	 */
	@SuppressWarnings("unused")
	private void applySslSettings() {
		try {
			TrustManager[] trustManagers = null;
			if (sslCaCert != null) {
				char[] password = null; // Any password will work.
				CertificateFactory certificateFactory = CertificateFactory.getInstance("X.509");
				Collection<? extends Certificate> certificates = certificateFactory.generateCertificates(sslCaCert);
				if (certificates.isEmpty()) {
					throw new IllegalArgumentException("expected non-empty set of trusted certificates");
				}
				KeyStore caKeyStore = newEmptyKeyStore(password);
				int index = 0;
				for (Certificate certificate : certificates) {
					String certificateAlias = "ca" + Integer.toString(index++);
					caKeyStore.setCertificateEntry(certificateAlias, certificate);
				}
				TrustManagerFactory trustManagerFactory = TrustManagerFactory
						.getInstance(TrustManagerFactory.getDefaultAlgorithm());
				trustManagerFactory.init(caKeyStore);
				trustManagers = trustManagerFactory.getTrustManagers();
			}
		} catch (GeneralSecurityException e) {
			throw new IllegalStateException(e);
		}
	}

	private KeyStore newEmptyKeyStore(char[] password) throws GeneralSecurityException {
		try {
			KeyStore keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
			keyStore.load(null, password);
			return keyStore;
		} catch (IOException e) {
			throw new AssertionError(e);
		}
	}
}
