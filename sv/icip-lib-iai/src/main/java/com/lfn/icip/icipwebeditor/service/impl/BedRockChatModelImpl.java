package com.lfn.icip.icipwebeditor.service.impl;

import java.io.StringReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.service.impl.ICIPDatasourceService;
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

@Service("awsbedrockchatmodel")
public class BedRockChatModelImpl implements ICIPPromptChatModel {
		
	@Autowired
	ICIPPromptService icipPromptService;
	
	@Autowired
	ICIPDatasourceService datasourceService;
   @Override
   public String postPromptToModel(JSONObject body) {
	   
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

		

	    String accessKey=config.get("accessKey").toString();
	    String secretKey=config.get("secretKey").toString();
	    
	    String model=config.getString("model");
	    String region=config.get("region").toString();
	    String modelType= config.getString("modelType");
	    ChatLanguageModel bedrockChatModel = null;
	    if(modelType.equalsIgnoreCase("Meta-Llama")) {
	    	bedrockChatModel = BedrockLlamaChatModel
                .builder().credentialsProvider(awsCredentialsProvider(accessKey,secretKey))
                .temperature(Double.valueOf(model_config.get("temperature").toString()))
                .maxTokens(Integer.valueOf(model_config.get("max_tokens").toString()))
                .region(Region.of(region))
                .model(model)
                .maxRetries(1)
                .topP(Float.valueOf(model_config.get("top_p").toString()))
                .build();
	    }
	    else if(modelType.equalsIgnoreCase("Anthropic")) {
	         bedrockChatModel = BedrockAnthropicMessageChatModel
            .builder().credentialsProvider(awsCredentialsProvider(accessKey,secretKey))
            .temperature(Double.valueOf(model_config.get("temperature").toString()))
            .maxTokens(Integer.valueOf(model_config.get("max_tokens").toString()))
            .region(Region.of(region))
            .model(model)
            .maxRetries(1)
            .topP(Float.valueOf(model_config.get("top_p").toString()))
            .build();
	    }
//		    else if(modelType.equalsIgnoreCase("AI21")) {
//		    
//		    }
	    else if(modelType.equalsIgnoreCase("Cohere")) {
	        bedrockChatModel = BedrockCohereChatModel
	                .builder().credentialsProvider(awsCredentialsProvider(accessKey,secretKey))
	                .temperature(Double.valueOf(model_config.get("temperature").toString()))
	                .maxTokens(Integer.valueOf(model_config.get("max_tokens").toString()))
	                .region(Region.of(region))
	                .model(model)
	                .maxRetries(1)
	                .topP(Float.valueOf(model_config.get("top_p").toString()))
	                .build();
	    }
	    else if(modelType.equalsIgnoreCase("Titan")) {
	    	bedrockChatModel = BedrockTitanChatModel
	                .builder().credentialsProvider(awsCredentialsProvider(accessKey,secretKey))
	                .temperature(Double.valueOf(model_config.get("temperature").toString()))
	                .maxTokens(Integer.valueOf(model_config.get("max_tokens").toString()))
	                .region(Region.of(region))
	                .model(model)
	                .maxRetries(1)
	                .topP(Float.valueOf(model_config.get("top_p").toString()))
	                .build();
	    }
	    else if(modelType.equalsIgnoreCase("Mistral")) {
	    	bedrockChatModel = BedrockMistralAiChatModel
	                .builder().credentialsProvider(awsCredentialsProvider(accessKey,secretKey))
	                .temperature(Double.valueOf(model_config.get("temperature").toString()))
	                .maxTokens(Integer.valueOf(model_config.get("max_tokens").toString()))
	                .region(Region.of(region))
	                .model(model)
	                .maxRetries(1)
	                .topP(Float.valueOf(model_config.get("top_p").toString()))
	                .build();
	    }
	  

	    

//	        Response<AiMessage> response = bedrockChatModel.generate(UserMessage.from(text));
        Response<AiMessage> response = bedrockChatModel.generate(UserMessage.from(final_prompt.text()));
        String resp = response.content().text();
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
	
        
        return  resp;

    }


    
    public AwsCredentialsProvider awsCredentialsProvider(String accessKey,String secretKey) {
        AwsCredentialsProvider awsCredentialsProvider = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey));
        return awsCredentialsProvider;
    }

	@Override
	public String postPromptFromEndpoint(JSONObject jsonObject, String restProvider, String org) {
		// TODO Auto-generated method stub
		return null;
	}
}