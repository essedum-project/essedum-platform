package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;
import javax.annotation.processing.Generated;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Getter;
import lombok.Setter;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.DependencyFileRepoV1;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "dependencyFileRepo"  
})
@Getter
@Setter
@Generated("jsonschema2pojo")
public class TritonServingConfigV1 {
	private DependencyFileRepoV1 dependencyFileRepo;
}
