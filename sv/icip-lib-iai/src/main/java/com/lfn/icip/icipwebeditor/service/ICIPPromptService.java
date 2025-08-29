package com.lfn.icip.icipwebeditor.service;

import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Marker;
import org.springframework.data.domain.Pageable;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.lfn.icip.icipwebeditor.model.ICIPPrompts;

public interface ICIPPromptService {

	List<ICIPPrompts> getAllPrompts(String project, Pageable paginate,String query);

	ICIPPrompts save( JSONObject body);

	void deleteById(Integer id);

	ICIPPrompts updateByID(Integer id, JSONObject body);
	
	ICIPPrompts saveExampleByID(Integer id, JSONObject body);

	ICIPPrompts getPromptById(Integer id);

	Long getPromptsCount(String project, String query);

	ICIPPrompts getPromptByNameAndOrg(String string, String string2);

	List<ICIPPrompts> getPromptsListByOrg(String project);
	
	String executeWorkflow(JSONObject jsonObject);

	JsonObject export(Marker marker, String source, JSONArray jsonArray);

	void importData(Marker marker, String target, JSONObject jsonObject);

	boolean copy(String fromProjectName, String toProjectId);
 
}
