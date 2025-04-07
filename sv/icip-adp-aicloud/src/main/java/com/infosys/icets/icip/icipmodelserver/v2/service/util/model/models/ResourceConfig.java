package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;

import java.util.ArrayList;
import java.util.List;

import javax.annotation.processing.Generated;

import org.json.JSONArray;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.Getter;
import lombok.Setter;
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "computes",
    "volumeSizeinGB"
    
})
@Getter
@Setter
@Generated("jsonschema2pojo")
public class ResourceConfig {
    private JSONArray computes;
    private Integer volumeSizeinGB;

}
