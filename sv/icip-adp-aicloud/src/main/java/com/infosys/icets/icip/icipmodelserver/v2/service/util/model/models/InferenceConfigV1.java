package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;
import javax.annotation.processing.Generated;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Getter;
import lombok.Setter;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.InferenceSpecV1;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.ServingSpecV1;
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "servingSpec",
    "inferenceSpec",
    "servingFramework"
})
@Getter
@Setter
@Generated("jsonschema2pojo")
public class InferenceConfigV1 {
	private String servingFramework;
	private ServingSpecV1 servingSpec;
	private InferenceSpecV1 inferenceSpec;
}
