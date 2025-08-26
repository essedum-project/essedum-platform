package com.lfn.icip.icipmodelserver.v2.service.util.model.models;

import javax.annotation.processing.Generated;

import org.json.simple.JSONObject;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.Getter;
import lombok.Setter;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "region_name",
    "aws_access_key_id",
    "aws_secret_access_key"
})
@Getter
@Setter
@Generated("jsonschema2pojo")
public class CredentialsS3 {
	    private String region_name;
	    private String aws_access_key_id;
	    private String aws_secret_access_key;  
}
