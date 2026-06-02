package com.lfn.icip.icipwebeditor.service;


import org.json.JSONArray;


public interface IICIPTaggingService {

	String addTags(String tagIds, String entityId, String entityType,String organization);
	JSONArray getMappedTags(Integer entityId, String entityType,String organization);
	


}
