package com.lfn.icip.icipmodelserver.v2.service.util.model.models;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.processing.Generated;


import org.json.JSONArray;
import org.json.JSONObject;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.google.gson.JsonObject;

import lombok.Getter;
import lombok.Setter;
//import net.minidev.json.JSONObject;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
	"bucket",
    "project_id",
    "name",
    "version",
    "credentials",
    "input_artifacts",
    "command",
    "storage",
    "configs"
})
@Getter
@Setter
@Generated("jsonschema2pojo")
public class RemoteBody {
    private String bucket;
    private String project_id;
    private String name;  
    private String version;
    private JSONObject credentials;
    private String input_artifacts;
    private String command;
    private String storage;
    private JSONObject configs;
    private JSONObject environment;
}