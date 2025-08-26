package com.infosys.icets.icip.icipwebeditor.job.model;

import org.json.JSONObject;



public class Properties{
	
private String description;	
private JSONObject properties;

private JSONObject codeConfiguration;
private String environmentId;	
private JSONObject environmentVariables;

private String compute;	
private String errorThreshold;
private JSONObject retrySettings;

private String miniBatchSize;
private String loggingLevel;
private JSONObject model;

private String maxConcurrencyPerInstance;
private String outputAction;
private String outputFileName;
private JSONObject resources;


}