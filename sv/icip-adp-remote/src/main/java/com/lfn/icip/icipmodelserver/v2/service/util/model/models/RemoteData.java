package com.lfn.icip.icipmodelserver.v2.service.util.model.models;

import javax.annotation.processing.Generated;

import org.json.JSONObject;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.Getter;
import lombok.Setter;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "bucket",
    "project_id",
    "name",
    "version",
    "credentials",
    "input_artifacts",
    "command"
})
@Getter
@Setter
@Generated("jsonschema2pojo")
public class RemoteData {
	    private String bucket;
	    private String project_id;
	    private String name;  
	    private String version;
	    private JSONObject credentials;
	    private String input_artifacts;
	    private String command;
}
