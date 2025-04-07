package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;
import javax.annotation.processing.Generated;

import org.json.JSONObject;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Getter;
import lombok.Setter;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "prefixUri" ,
    "predictUri",
    "explainUri",
    "feedbackUri"
})
@Getter
@Setter
@Generated("jsonschema2pojo")
public class ModelUrisV1 {
	private String predictUri;
	private String prefixUri;
	private String explainUri;
	private String feedbackUri;
}
