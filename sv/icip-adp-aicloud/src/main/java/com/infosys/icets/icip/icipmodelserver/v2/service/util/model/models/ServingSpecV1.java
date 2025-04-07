package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;
import javax.annotation.processing.Generated;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Getter;
import lombok.Setter;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.TritonSpecV1;
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "tritonSpec"  
})
@Getter
@Setter
@Generated("jsonschema2pojo")
public class ServingSpecV1 {
	private TritonSpecV1 tritonSpec;
}
