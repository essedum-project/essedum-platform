package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;

import com.google.gson.JsonArray;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class Container {
    private String imageUri;
    private List<String> command;
    private String healthProbeUri;
    private JSONArray labels;
    private JSONArray ports;
    private JSONArray envVariables;
  
}
