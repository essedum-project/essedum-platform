package com.lfn.icip.icipmodelserver.v2.model.dto;

import java.util.Map;

import org.json.JSONObject;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@Data
public class ICIPPolyAIRequestWrapper {
	private Integer id;
	private String name;
	private String type;
	private Map<String, String> uri;
	private Map<String, String> header;
	private Map<String, String> params;
	private String request;
	private String organization;
	private String body;
}
