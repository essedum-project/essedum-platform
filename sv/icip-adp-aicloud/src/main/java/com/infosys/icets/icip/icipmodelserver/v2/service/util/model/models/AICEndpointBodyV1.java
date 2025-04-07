package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;
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
	"contextUri",
	"name"
})
@Getter
@Setter
public class AICEndpointBodyV1 {
	private String projectId;
	private String name;
	private String contextUri;
}
