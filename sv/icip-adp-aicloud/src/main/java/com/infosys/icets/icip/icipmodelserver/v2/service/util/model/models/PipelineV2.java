package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;

import org.json.JSONArray;
import org.json.JSONObject;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PipelineV2 {
String name;
Integer version;
String operator;
String runtime;
JSONArray dataStorage;
JSONObject volume;
JSONObject flow;
JSONObject variables;
JSONObject globalVariables;

}
