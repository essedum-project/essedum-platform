package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;
import javax.annotation.processing.Generated;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Getter;
import lombok.Setter;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.InferenceConfigV1;
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "endpointId",
    "modelId",
    "version",
    "inferenceConfig"
})
@Getter
@Setter
@Generated("jsonschema2pojo")
public class DeploymentBodyV1 {
	private String endpointId;
	private String modelId;
	private Integer version;
	private InferenceConfigV1 inferenceConfig;
}
