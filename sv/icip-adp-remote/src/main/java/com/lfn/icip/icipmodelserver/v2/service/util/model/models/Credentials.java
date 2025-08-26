package com.lfn.icip.icipmodelserver.v2.service.util.model.models;

import javax.annotation.processing.Generated;

import org.json.simple.JSONObject;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.Getter;
import lombok.Setter;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "endpoint",
    "access_key",
    "secret_key"
})
@Getter
@Setter
@Generated("jsonschema2pojo")
public class Credentials {
	    private String endpoint;
	    private String access_key;
	    private String secret_key;  
}
