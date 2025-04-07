package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;



	import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import javax.annotation.processing.Generated;

import org.json.JSONArray;
import org.json.JSONObject;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
	import com.fasterxml.jackson.annotation.JsonAnySetter;
	import com.fasterxml.jackson.annotation.JsonIgnore;
	import com.fasterxml.jackson.annotation.JsonInclude;
	import com.fasterxml.jackson.annotation.JsonProperty;
	import com.fasterxml.jackson.annotation.JsonPropertyOrder;

	@JsonInclude(JsonInclude.Include.NON_NULL)
	@JsonPropertyOrder({
	    "jobArgumentName",
	   
	   
	})
	
	@Generated("jsonschema2pojo")
	public class JobArgument {
	    private String name;
	    private String defaultValue;
	    private String dataType;
	    
	    public String getName() {
	        return name;
	    }
	    public void setName(String name) {
	        this.name = name;
	    }
	    public String getDefaultValue() {
	        return defaultValue;
	    }
	    public void setDefaultValue(String defaultValue) {
	        this.defaultValue = defaultValue;
	    }
	    public String getDataType() {
	        return dataType;
	    }
	    public void setDataType(String dataType) {
	        this.dataType = dataType;
	    }
	
//	   
//		public HashMap<String, String> getJobArgumentsNameList() {
//			HashMap<String,String> fieldList=new HashMap<>();
//			fieldList.put("input_file", "string");
//			fieldList.put("context_length", "int");
//			fieldList.put("train_batch_size", "int");
//			fieldList.put("eval_batch_size", "int");
//			fieldList.put("num_train_epochs", "int");
//			fieldList.put("save_steps", "int");
//			fieldList.put("fp16", "bool");
//			fieldList.put("stride", "int");
//			
//			
//			
//			return fieldList;
//			
//		}
	   
}
