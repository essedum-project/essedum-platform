package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;

import javax.annotation.processing.Generated;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.Getter;
import lombok.Setter;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "name",
    "argValue"   
})
@Getter
@Setter
@Generated("jsonschema2pojo")
public class RunArguments {
	    private String name;
	    private String argValue;
	    
//	    public String getName() {
//	        return name;
//	    }
//	    public void setName(String name) {
//	        this.name = name;
//	    }
//	    public String getArgValue() {
//	        return argValue;
//	    }
//	    public void setArgValue(String argValue) {
//	        this.argValue = argValue;
//	    }
	}
