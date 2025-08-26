package com.lfn.icip.icipmodelserver.v2.model.dto;

import java.util.Map;

import org.json.JSONObject;

import lombok.Data;

@Data
public class ICIPPolyAIResponseWrapper {
	private String type;
	private Map<String, String> uri;
	private Map<String, String> header;
	private String response;
}
