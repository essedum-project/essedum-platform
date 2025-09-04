package com.lfn.icip.icipwebeditor.service.impl;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.StringReader;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.KeyManagementException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.UnrecoverableKeyException;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
import org.apache.http.util.EntityUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.properties.HttpClientUtil;
import com.lfn.icip.dataset.properties.ProxyProperties;
import com.lfn.icip.dataset.service.impl.ICIPDatasetPluginsService;
import com.lfn.icip.dataset.service.impl.ICIPDatasourceService;
import com.lfn.icip.dataset.service.util.IICIPDataSetServiceUtil.DATATYPE;
import com.lfn.icip.dataset.service.util.IICIPDataSetServiceUtil.SQLPagination;
import com.lfn.icip.dataset.util.ICIPRestPluginUtils;
import com.lfn.icip.icipwebeditor.model.ICIPPrompts;
import com.lfn.icip.icipwebeditor.service.ICIPPromptChatModel;
import com.lfn.icip.icipwebeditor.service.ICIPPromptService;

import software.amazon.awssdk.regions.Region;


import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.bedrock.BedrockAnthropicMessageChatModel;
import dev.langchain4j.model.bedrock.BedrockCohereChatModel;
import dev.langchain4j.model.bedrock.BedrockLlamaChatModel;
import dev.langchain4j.model.bedrock.BedrockMistralAiChatModel;
import dev.langchain4j.model.bedrock.BedrockTitanChatModel;
import dev.langchain4j.model.bedrock.internal.AbstractBedrockChatModel;
import dev.langchain4j.model.bedrock.internal.AbstractBedrockChatModel.AbstractBedrockChatModelBuilder;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.input.Prompt;
import dev.langchain4j.model.input.PromptTemplate;
import dev.langchain4j.model.language.LanguageModel;
import dev.langchain4j.model.output.Response;
import groovy.lang.Binding;
import groovy.lang.GroovyShell;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;

@Service("restchatmodel")
public class RestPromptProviderServiceImpl implements ICIPPromptChatModel {
		
	/** The Constant NOAUTH. */
	public static final String NOAUTH = "noauth";

	/** The Constant BASIC. */
	public static final String BASIC = "basicauth";

	/** The Constant PSTR. */
	private static final String PSTR = "password";

	/** The Constant OAUTH. */
	public static final String OAUTH = "oauth";

	/** The Constant Token. */
	public static final String TOKEN = "token";

	/** The Constant BEARER. */
	public static final String BEARER = "bearertoken";
	
	/** The proxy properties. */
	private ProxyProperties proxyProperties;

	@Autowired
	ICIPPromptService icipPromptService;
	
	@Autowired
	ICIPDatasourceService datasourceService;
	
	public RestPromptProviderServiceImpl(ProxyProperties proxyProperties) {
		super();
		this.proxyProperties = proxyProperties;
	}
	
	private static Logger logger = LoggerFactory.getLogger(RestPromptProviderServiceImpl.class);

   @Override
   public String postPromptToModel(JSONObject body) throws URISyntaxException, IOException,
			NoSuchAlgorithmException, InvalidKeyException, KeyManagementException, KeyStoreException {
	   
	    ICIPPrompts icipPrompt= icipPromptService.getPromptByNameAndOrg(body.getString("prompt_name"),body.getString("organization"));
		JSONObject jsonContent=new JSONObject(icipPrompt.getJson_content());
		String provider = body.getString("provider");
		Boolean isTransform = false;
		String transformScript = "";
		if(icipPrompt.getProviders() != null) {
		JSONArray providersArray = new JSONArray(icipPrompt.getProviders());
		for(int i = 0; i < providersArray.length(); i++)
		{
		      JSONObject obj = providersArray.getJSONObject(i);
		      if((obj.has("friendly_name") && obj.getString("friendly_name").equals(body.getString("provider"))) || obj.getString("name").equals(body.getString("provider")))
		    	  {
		    	  provider = obj.getString("name");
		    	  if(obj.optBoolean("transform")) {
		    		  isTransform = true;
		    		  transformScript = obj.optString("transformScript");
		    	  }
		    	  }
		      	
		      
		}
		}
		JSONArray arrayOfTemplates= jsonContent.getJSONArray("templates");
		String first_prompt="";
		for(int i=0;i<arrayOfTemplates.length();++i) {
			JSONObject template= arrayOfTemplates.getJSONObject(i);
			first_prompt+=template.getString("templatetext").replace("\n", "")
	                .trim();
//			if(i!=arrayOfTemplates.length()-1) {
//				first_prompt+=",";
//			}
		}	

    	JSONObject inputsVariables= body.getJSONObject("inputs");
	    Map<String,Object> mapOfInputVariable= new HashMap<>();
	    for(String i : inputsVariables.keySet()) {
		   mapOfInputVariable.put(i,inputsVariables.get(i) );
	    }
	  
		PromptTemplate final_promptTemplate = PromptTemplate.from(first_prompt);
		Prompt final_prompt = final_promptTemplate.apply(mapOfInputVariable);
		
		JSONObject model_config = body.getJSONObject("configuration");

		
		ICIPDatasource datasource= datasourceService.getDatasource(provider, body.getString("organization"));
		JSONObject connectionDetails = new JSONObject(datasource.getConnectionDetails());
		JSONObject authDetailsObj = new JSONObject(connectionDetails.optString("AuthDetails"));
		String userName = authDetailsObj.optString("username").trim();
		String password = authDetailsObj.optString(PSTR).trim();
		String authType = connectionDetails.optString("AuthType");
		String noProxyString = connectionDetails.optString("NoProxy");
		String authToken = null;
		String headerPrefix = authDetailsObj.optString("HeaderPrefix", "Bearer");
		String connType = connectionDetails.optString("ConnectionType");
		String urlString;
		boolean mtlsAdded = connectionDetails.optBoolean("CertsAdded");
		String certpath = connectionDetails.optString("CertPath");
		String keypass = connectionDetails.optString("KeyPass");
		
		urlString = connectionDetails.optString("Url");
		JSONObject conn_atributes = connectionDetails.getJSONObject("testDataset");
		JSONObject attributes = conn_atributes.getJSONObject("attributes");
		String headers = attributes.optString("Headers");
		String params = attributes.optString("QueryParams");
		String bodyType = attributes.optString("bodyType");
		String conn_body = attributes.get("Body").toString();
		conn_body = conn_body.isEmpty() ? conn_body : replaceBodyString(conn_body, model_config);
		conn_body = conn_body.replace("<prompt>", final_prompt.text()
				.replaceAll("\\s+", " ") // Replace multiple spaces with a single space
                .replaceAll("\n", "")    // Remove newlines
                .replaceAll("\\s{2,}", " ") // Replace multiple spaces with a single space
                .trim()
                .replace("\"", "\\\""));
		
		String encodedUrlString = URLEncoder.encode(urlString, StandardCharsets.UTF_8.toString());
		encodedUrlString = encodedUrlString.replace("+", "%20").replace("%2F", "/").replace("%3A", ":");
		urlString=encodedUrlString;
		
		URI uri = new URI(urlString.trim());
		HttpHost targetHost = new HttpHost(uri.getHost(), uri.getPort(), uri.getScheme());
		HttpClientContext context = null;

		ICIPRestPluginUtils.validateProxy(uri, noProxyString, proxyProperties);

		CloseableHttpClient httpclient = HttpClientUtil.getHttpClient(authType, userName, password, uri,
				proxyProperties, this.getSSLContext(mtlsAdded, certpath, keypass));

		CloseableHttpResponse response = null;
		response = ICIPRestPluginUtils.executePostRequest(uri, authToken, headerPrefix, conn_body, headers, params,
						context, httpclient, targetHost, bodyType);
		String resp = EntityUtils.toString(response.getEntity());
//		JSONObject resp_json = new JSONObject(resp);
//		if(resp_json.has("choices")) {
//		JSONArray choices = new JSONArray(resp_json.get("choices").toString());
//		String final_resp = "";
//		for (int i = 0; i < choices.length(); i++) {
//			JSONObject choice = new JSONObject(choices.get(i).toString());
//			final_resp+=choice.getString("text");
//		}
//		return final_resp;
//		}
		if(isTransform) {
			StringBuilder scriptBuilder = new StringBuilder();
			transformScript = transformScript.substring(0, transformScript.length());
			List<String> scriptLines = new ArrayList<String>(Arrays.asList(transformScript.split("\\\\n")));
	
			scriptLines.stream().filter(row -> !row.isEmpty()).forEach(row -> {
				scriptBuilder.append(row.replace("\\", "")).append("\n");
			});
			transformScript = scriptBuilder.toString();
	
			Binding binding = new Binding();
			binding.setProperty("response", resp);
	
			GroovyShell shell = new GroovyShell(binding);
			Object transformedResult = shell.evaluate(new StringReader(transformScript));
	
			resp = transformedResult.toString();
		}
		return resp;
    }
   
   @Override
   public String postPromptFromEndpoint(JSONObject body, String restprovider, String org) throws IOException,
	NoSuchAlgorithmException, InvalidKeyException, KeyManagementException, KeyStoreException, URISyntaxException {
	   
	   String reqBody = body.toString();
		ICIPDatasource datasource = datasourceService.getDatasource(restprovider, org);
		JSONObject connectionDetails = new JSONObject(datasource.getConnectionDetails());
		String urlString = connectionDetails.optString("Url");
		JSONObject conn_atributes = connectionDetails.getJSONObject("testDataset");
		JSONObject attributes = conn_atributes.getJSONObject("attributes");
		JSONObject authDetailsObj = new JSONObject(connectionDetails.optString("AuthDetails"));
		String bodyType = attributes.optString("bodyType");
		String userName = authDetailsObj.optString("username").trim();
		String password = authDetailsObj.optString(PSTR).trim();
		String authType = connectionDetails.optString("AuthType");
		String noProxyString = connectionDetails.optString("NoProxy");
		String params = attributes.optString("QueryParams");

		String authToken = null;
		String headerPrefix = authDetailsObj.optString("HeaderPrefix", "Bearer");
		String connType = connectionDetails.optString("ConnectionType");
		boolean mtlsAdded = connectionDetails.optBoolean("CertsAdded");
		String certpath = connectionDetails.optString("CertPath");
		String keypass = connectionDetails.optString("KeyPass");
		String headers = attributes.optString("Headers");
		String encodedUrlString = URLEncoder.encode(urlString, StandardCharsets.UTF_8.toString());
		encodedUrlString = encodedUrlString.replace("+", "%20").replace("%2F", "/").replace("%3A", ":");
		urlString=encodedUrlString;
		URI uri = new URI(urlString.trim());
		HttpHost targetHost = new HttpHost(uri.getHost(), uri.getPort(), uri.getScheme());
		HttpClientContext context = null;
		ICIPRestPluginUtils.validateProxy(uri, noProxyString, proxyProperties);
		CloseableHttpClient httpclient = HttpClientUtil.getHttpClient(authType, userName, password, uri,
				proxyProperties, this.getSSLContext(mtlsAdded, certpath, keypass));
		CloseableHttpResponse response = null;
		response = ICIPRestPluginUtils.executePostRequest(uri, authToken, headerPrefix, reqBody, headers, params,
						context, httpclient, targetHost, bodyType);
		String resp = EntityUtils.toString(response.getEntity());
		
		return resp;
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


   private String replaceBodyString(String body, JSONObject attributes) {
		String replacedBody = body;
		String[] paramValues = parseBody(body);
		for (int i = 0; i < paramValues.length; i++) {
			String extparamValue = paramValues[i];
			extparamValue = extparamValue.substring(1, extparamValue.length() - 1);
			if (attributes.has(extparamValue) && attributes.get(extparamValue) != null) {
				body = body.replace('"'+paramValues[i]+'"', attributes.get(extparamValue).toString());
			}
		}

		return body;
	}
	
	
	private String[] parseBody(String qrystr) {
			List<String> allMatches = new ArrayList<>();
			Matcher m = Pattern.compile("\\<(.*?)\\>").matcher(qrystr);
			while (m.find()) {
				for (int i = 0; i < m.groupCount(); i++) {
					allMatches.add(m.group(i));
				}
			}
			return allMatches.toArray(new String[allMatches.size()]);
		}
   
	
}
