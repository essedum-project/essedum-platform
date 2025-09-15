package com.lfn.icip.icipwebeditor.service.impl;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.service.impl.ICIPDatasourceService;
import com.lfn.icip.icipwebeditor.model.ICIPPrompts;
import com.lfn.icip.icipwebeditor.service.ICIPPromptChatModel;
import com.lfn.icip.icipwebeditor.service.ICIPPromptService;

import ch.qos.logback.classic.Logger;

import java.io.StringReader;
import java.security.KeyStore;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;

import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.input.Prompt;
import dev.langchain4j.model.input.PromptTemplate;
import dev.langchain4j.model.output.Response;
import dev.langchain4j.model.vertexai.VertexAiGeminiChatModel;
import groovy.lang.Binding;
import groovy.lang.GroovyShell;

@Service("vertexaichatmodel")
public class VertexAiServiceImpl implements ICIPPromptChatModel {


	@Autowired
	ICIPPromptService icipPromptService;
	
	@Autowired
	ICIPDatasourceService datasourceService;
	
	@EssedumProperty("icip.certificateCheck")
	private String certificateCheck;
	
	@Override
	public String postPromptToModel(JSONObject body) {
		
		try {
//	        TrustManager[] trustAllCerts = new TrustManager[]{
//	                new X509TrustManager() {
//	                    public X509Certificate[] getAcceptedIssuers() {
//	                        return null;
//	                    }
//	                    public void checkClientTrusted(X509Certificate[] certs, String authType) {
//	                    }
//	                    public void checkServerTrusted(X509Certificate[] certs, String authType) {
//	                    }
//	                }
//	            };
				TrustManager[] trustAllCerts = getTrustAllCerts();
	            SSLContext sc = SSLContext.getInstance("SSL");
	            sc.init(null, trustAllCerts, new java.security.SecureRandom());
	            HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
	 
	            HostnameVerifier allHostsValid = (hostname, session) -> true;
	            HttpsURLConnection.setDefaultHostnameVerifier(allHostsValid);
	        }catch (Exception e) {
	            System.err.println("Failed to bypass SSL verification: " + e.getMessage());
	            e.printStackTrace();
	        }
		
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
			first_prompt+= template.getString("templatevalue")+":"+template.getString("templatetext");
			if(i!=arrayOfTemplates.length()-1) {
				first_prompt+=",";
			}
		}	
	
		JSONObject inputsVariables= body.getJSONObject("inputs");
	    Map<String,Object> mapOfInputVariable= new HashMap<>();
	    for(String i : inputsVariables.keySet()) {
		   mapOfInputVariable.put(i,inputsVariables.get(i) );
	    }
	  
		PromptTemplate final_promptTemplate = PromptTemplate.from(first_prompt);
		Prompt final_prompt = final_promptTemplate.apply(mapOfInputVariable);
		
		ICIPDatasource datasource= datasourceService.getDatasource(provider, body.getString("organization"));
		JSONObject config= new JSONObject(datasource.getConnectionDetails());
		JSONObject model_config = body.getJSONObject("configuration");
		ChatLanguageModel model = VertexAiGeminiChatModel.builder()
	            .project(config.getString("projectId"))
	            .location(config.getString("location"))
	            .modelName(config.getString("modelName"))
	            .temperature(Float.valueOf(model_config.get("temperature").toString()))
	            .maxOutputTokens(Integer.valueOf(model_config.get("max_tokens").toString()))
	            .topK(2)
	            .topP(Float.valueOf(model_config.get("top_p").toString()))
	            .build();
		String Answer = "";
	    try {
	    	 Response<AiMessage> response= model.generate(UserMessage.from(final_prompt.text()));
	//        System.out.println("RESPONSE:\n" + response);
	        Answer = response.content().text();
	    } catch (Exception e) {
	//        Log("Error generating response: " + e.getMessage());
	        Answer = "Exception in response: "+e.toString();
	        e.printStackTrace();
	    }
	    
	    if(isTransform) {
			StringBuilder scriptBuilder = new StringBuilder();
			transformScript = transformScript.substring(0, transformScript.length());
			List<String> scriptLines = new ArrayList<String>(Arrays.asList(transformScript.split("\\\\n")));

			scriptLines.stream().filter(row -> !row.isEmpty()).forEach(row -> {
				scriptBuilder.append(row.replace("\\", "")).append("\n");
			});
			transformScript = scriptBuilder.toString();

			Binding binding = new Binding();
			binding.setProperty("response", Answer);

			GroovyShell shell = new GroovyShell(binding);
			Object transformedResult = shell.evaluate(new StringReader(transformScript));

			Answer = transformedResult.toString();
		}

	    
		return Answer;
	}
	
	private TrustManager[] getTrustAllCerts() throws Exception {
		//logger.info("certificateCheck value: {}", certificateCheck);
		if("true".equalsIgnoreCase(certificateCheck)) {
			// Load the default trust store
		    TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
		    trustManagerFactory.init((KeyStore) null);
	
		    // Get the trust managers from the factory
		    TrustManager[] trustManagers = trustManagerFactory.getTrustManagers();
	
		    // Ensure we have at least one X509TrustManager
		    for (TrustManager trustManager : trustManagers) {
		        if (trustManager instanceof X509TrustManager) {
		            return new TrustManager[] { (X509TrustManager) trustManager };
		        }
		    }
	
		    throw new IllegalStateException("No X509TrustManager found. Please install the certificate in keystore");
		}else {
			TrustManager[] trustAllCerts = new TrustManager[] { new X509TrustManager() {
				@Override
				public void checkClientTrusted(java.security.cert.X509Certificate[] chain, String authType) {
				}
	
				@Override
				public void checkServerTrusted(java.security.cert.X509Certificate[] chain, String authType) {
				}
	
				@Override
				public java.security.cert.X509Certificate[] getAcceptedIssuers() {
					return new java.security.cert.X509Certificate[] {};
				}
			} };
			return trustAllCerts;
		}   
	}

	@Override
	public String postPromptFromEndpoint(JSONObject jsonObject, String restprovider, String org) {
		// TODO Auto-generated method stub
		return null;
	}
	}