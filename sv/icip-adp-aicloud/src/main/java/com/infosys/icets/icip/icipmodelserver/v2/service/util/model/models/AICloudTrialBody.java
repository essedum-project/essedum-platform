package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;

import java.util.ArrayList;
import java.util.List;

import javax.annotation.processing.Generated;

import org.json.JSONArray;
import org.json.JSONObject;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.Getter;
import lombok.Setter;


@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "projectId",
    "pipelineId",
    "name",
    "description",
    "modelName",
    "modelVersion",
    "runArguments",
    "resourceConfig",
    "experimentConfig"
    
})
@Getter
@Setter
@Generated("jsonschema2pojo")
public class AICloudTrialBody {
	 private String projectId;
	    private String pipelineId;
	    private String name;
	    private String description;
	    private String modelName;
	    private String modelVersion;
	    private JSONArray runArguments;
	    private JSONObject resourceConfig;
	    private JSONObject experimentConfig;
	    
//	    public String getProjectId() {
//	        return projectId;
//	    }
//	    public void setProjectId(String projectId) {
//	        this.projectId = projectId;
//	    }
//	    public String getPipelineId() {
//	        return pipelineId;
//	    }
//	    public void setPipelineId(String pipelineId) {
//	        this.pipelineId = pipelineId;
//	    }
//	    public String getName() {
//	        return name;
//	    }
//	    public void setName(String name) {
//	        this.name = name;
//	    }
//	    public String getDescription() {
//	        return description;
//	    }
//	    public void setDescription(String description) {
//	        this.description = description;
//	    }
//	    public String getModelName() {
//	        return modelName;
//	    }
//	    public void setModelName(String modelName) {
//	        this.modelName = modelName;
//	    }
//	    public String getModelVersion() {
//	        return modelVersion;
//	    }
//	    public void setModelVersion(String modelVersion) {
//	        this.modelVersion = modelVersion;
//	    }
//	    public JSONArray getRunArguments() {
//	        return runArguments;
//	    }
//	    public void setRunArguments(JSONArray runArguments) {
//	        this.runArguments = runArguments;
//	    }
//	    public ResourceConfig getResourceConfig() {
//	        return resourceConfig;
//	    }
//	    public void setResourceConfig(ResourceConfig resourceConfig) {
//	        this.resourceConfig = resourceConfig;
//	    }
//	    public ExperimentConfig getExperimentConfig() {
//	        return experimentConfig;
//	    }
//	    public void setExperimentConfig(ExperimentConfig experimentConfig) {
//	        this.experimentConfig = experimentConfig;
//	    }
	}