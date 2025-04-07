package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;


	import java.util.ArrayList;
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
import com.google.gson.JsonObject;

import groovy.transform.EqualsAndHashCode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

	@JsonInclude(JsonInclude.Include.NON_NULL)
	@JsonPropertyOrder({
	    "name",
	    "artificatStorageType",
	    "inputArtifacts",
	    "stepDetails",
	    "stepArguments",
	    "environment",
	    "framework",
	    "preTrainedModelPath",
	    "outputArtifactBaseUri",
	    "metricDetails"
	})
	@Generated("jsonschema2pojo")
	@Getter
	@Setter
	@EqualsAndHashCode
	@NoArgsConstructor
	public class TrainingStep {
	    private String name;
	    private JSONObject inputArtifacts;
	    private JSONObject stepArguments ;
	    private JSONObject container;
	    private JSONObject framework;
	    private JSONObject preTrainedModelDetails;
	    private JSONObject metricDetails;
	    private String outputArtifactBaseUri;
	   
	    
}
