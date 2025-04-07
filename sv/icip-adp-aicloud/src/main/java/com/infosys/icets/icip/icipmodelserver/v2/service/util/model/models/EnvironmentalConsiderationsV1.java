package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;
import javax.annotation.processing.Generated;

import org.json.JSONArray;
import org.json.JSONObject;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Getter;
import lombok.Setter;
@JsonInclude(JsonInclude.Include.NON_NULL)

@Getter
@Setter
@Generated("jsonschema2pojo")
public class EnvironmentalConsiderationsV1 {
	private String hardwareType;
	private String hoursUsed;
	private String cloudProvider;
	private String computeRegion;
	private String carbonEmitted;
	
}
