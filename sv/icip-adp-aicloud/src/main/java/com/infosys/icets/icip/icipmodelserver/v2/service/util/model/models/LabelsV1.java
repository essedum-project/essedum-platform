package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;
import javax.annotation.processing.Generated;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Getter;
import lombok.Setter;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "name",
    "value"   
})
@Getter
@Setter
@Generated("jsonschema2pojo")
public class LabelsV1 {
	private String name;
	private String value;
}
