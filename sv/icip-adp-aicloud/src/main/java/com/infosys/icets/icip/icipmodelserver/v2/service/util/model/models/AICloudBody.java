package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.processing.Generated;

//import org.apache.xerces.impl.xpath.XPath.Step;
import org.json.JSONArray;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.Getter;
import lombok.Setter;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "projectId",
    "version",
    "name",
    "description",
    "scope",
    "jobArguments",
    "Steps","scope"
})
@Getter
@Setter
@Generated("jsonschema2pojo")
public class AICloudBody {

	    private String projectId;
	    private Integer version;
	    private String name;
	    private String description;
	    private JSONArray jobArguments;
	    private JSONArray steps;
	    private String scope;


}
