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

import dev.langchain4j.model.azure.AzureOpenAiChatModel;
import dev.langchain4j.model.azure.AzureOpenAiTokenizer;
import dev.langchain4j.model.input.Prompt;
import dev.langchain4j.model.input.PromptTemplate;
import groovy.lang.Binding;
import groovy.lang.GroovyShell;


@Service("azureopenaichatmodel")
public class AzureOpenAiServiceImpl implements ICIPPromptChatModel {

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
  AzureOpenAiChatModel model = AzureOpenAiChatModel.builder()
              .endpoint(config.getString("endpoint"))
              .apiKey(config.getString("apiKey"))
              .deploymentName(config.getString("deploymentName"))
              .tokenizer(new AzureOpenAiTokenizer(config.getString("gptVersion")))
              .temperature(Double.valueOf(model_config.get("temperature").toString()))
              .maxTokens(Integer.valueOf(model_config.get("max_tokens").toString()))
              .frequencyPenalty(Double.valueOf(model_config.get("frequency_penalty").toString()))
              .presencePenalty(Double.valueOf(model_config.get("presence_penalty").toString()))
              .topP(Double.valueOf(model_config.get("top_p").toString()))
              .logRequestsAndResponses(true)
              .build();

      

  String response = model.generate(final_prompt.text());

//  Response<AiMessage> response = model.generate(UserMessage.from(prompt_template));
  if(isTransform) {
		StringBuilder scriptBuilder = new StringBuilder();
		transformScript = transformScript.substring(0, transformScript.length());
		List<String> scriptLines = new ArrayList<String>(Arrays.asList(transformScript.split("\\\\n")));

		scriptLines.stream().filter(row -> !row.isEmpty()).forEach(row -> {
			scriptBuilder.append(row.replace("\\", "")).append("\n");
		});
		transformScript = scriptBuilder.toString();

		Binding binding = new Binding();
		binding.setProperty("response", response);

		GroovyShell shell = new GroovyShell(binding);
		Object transformedResult = shell.evaluate(new StringReader(transformScript));

		response = transformedResult.toString();
	}
 

  return response;
 }
  @Override
  public String postPromptFromEndpoint(JSONObject jsonObject, String restprovider, String org) {
    // TODO Auto-generated method stub
    return null;
  }
}
 