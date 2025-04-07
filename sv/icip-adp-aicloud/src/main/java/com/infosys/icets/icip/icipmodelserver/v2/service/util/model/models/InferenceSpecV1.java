package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;
import javax.annotation.processing.Generated;

import org.json.JSONArray;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Getter;
import lombok.Setter;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.ResourceConfig;
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "minReplicaCount",
    "maxReplicaCount",
    "containerResourceConfig",
    "modelSpec"
})
@Getter
@Setter
@Generated("jsonschema2pojo")
public class InferenceSpecV1 {
	private Integer minReplicaCount;
	private Integer maxReplicaCount;
	private ResourceConfig containerResourceConfig;
	private JSONArray modelSpec;
}
