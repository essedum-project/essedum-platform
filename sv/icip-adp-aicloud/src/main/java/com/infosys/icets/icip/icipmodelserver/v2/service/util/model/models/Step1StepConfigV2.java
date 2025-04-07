package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;

import java.util.ArrayList;

import org.json.JSONArray;
import org.json.JSONObject;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class Step1StepConfigV2 {
 ArrayList<String> entryPoint;
 ArrayList<String> stepArguments;
 String imageUri;
}
