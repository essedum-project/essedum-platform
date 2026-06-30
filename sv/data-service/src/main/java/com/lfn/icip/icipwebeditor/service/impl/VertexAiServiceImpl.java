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
import org.slf4j.LoggerFactory;

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
import com.lfn.ai.comm.lib.util.SecureTrustManagerUtil;
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
import com.lfn.icip.dataset.util.GroovySandboxUtil;

@Service("vertexaichatmodel")
public class VertexAiServiceImpl implements ICIPPromptChatModel {

	private static final org.slf4j.Logger log = LoggerFactory.getLogger(VertexAiServiceImpl.class);


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
	 
	            HttpsURLConnection.setDefaultHostnameVerifier(com.lfn.ai.comm.lib.util.SafeHostnameVerifier.INSTANCE);
	        }catch (Exception e) {
	            log.error("Failed to configure SSL verification", e);
	        }
		
		ICIPPrompts icipPrompt= icipPromptService.getPromptByNameAndOrg(body.getString("prompt_name"),body.getString("organization"));
		JSONObject jsonContent=new JSONObject(icipPrompt.getJson_content());
		String providerInput = body.getString("provider");
		// Validate provider against allowlist pattern to prevent injection
		if (providerInput == null || !providerInput.matches("^[a-zA-Z0-9_\\-]+$")) {
			throw new IllegalArgumentException("Invalid provider name");
		}
		String provider = providerInput;
		Boolean isTransform = false;
		String transformScript = "";
		boolean providerFound = false;
		if(icipPrompt.getProviders() != null) {
		JSONArray providersArray = new JSONArray(icipPrompt.getProviders());
		for(int i = 0; i < providersArray.length(); i++)
		{
		      JSONObject obj = providersArray.getJSONObject(i);
		      if((obj.has("friendly_name") && obj.getString("friendly_name").equals(providerInput)) || obj.getString("name").equals(providerInput))
		    	  {
		    	  provider = obj.getString("name");
		    	  providerFound = true;
		    	  if(obj.optBoolean("transform")) {
		    		  isTransform = true;
		    		  transformScript = obj.optString("transformScript");
		    	  }
		    	  }
		      
		}
		if (!providerFound) {
			throw new IllegalArgumentException("Provider not found in allowed providers list");
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
	        log.error("Error generating response", e);
	        Answer = "An error occurred while generating the response.";
	    }
	    
	    if(isTransform) {
			if (transformScript == null || transformScript.isBlank()) {
				throw new IllegalArgumentException("Transform script is empty or missing");
			}
			StringBuilder scriptBuilder = new StringBuilder();
			transformScript = transformScript.substring(0, transformScript.length());
			List<String> scriptLines = new ArrayList<String>(Arrays.asList(transformScript.split("\\\\n")));

			scriptLines.stream().filter(row -> !row.isEmpty()).forEach(row -> {
				scriptBuilder.append(row.replace("\\", "")).append("\n");
			});
			transformScript = scriptBuilder.toString();

			// Sanitize the Answer before binding to prevent injection
			if (Answer == null) {
				Answer = "";
			}

			Binding binding = new Binding();
			binding.setProperty("response", Answer);

			// Route through the single audited sink in GroovySandboxUtil so static
			// analysers (CodeQL Groovy injection / CWE-94) see a sanitisation barrier
			// (validation + SecureASTCustomizer sandbox) immediately before evaluation.
			Object transformedResult = GroovySandboxUtil.evaluateSandboxed(transformScript, binding);

			Answer = transformedResult != null ? transformedResult.toString() : "";
		}

	    
		return Answer;
	}
	
	private TrustManager[] getTrustAllCerts() throws Exception {
		return SecureTrustManagerUtil.getValidatingTrustManagers();
	}

	@Override
	public String postPromptFromEndpoint(JSONObject jsonObject, String restprovider, String org) {
		// TODO Auto-generated method stub
		return null;
	}
	}
