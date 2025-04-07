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
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.Container;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.Artifacts;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.ModelMetadataV1;

//@JsonInclude(JsonInclude.Include.NON_NULL)
//@JsonPropertyOrder({
//  "projectId",
//  "version",
//  "name",
//  "description",
//  "artifacts",
//  "container"
//})
@Getter
@Setter
public class AICRegBodyV1 {
	private String projectId;
    private Integer version;
    private String name;
    private String description;
    private Container container;
    private Artifacts artifacts;
    //private ModelMetadataV1 metadata;

}
