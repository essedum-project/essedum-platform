package com.lfn.icip.icipwebeditor.service;

import java.util.List;
import java.util.Set;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Marker;
import org.springframework.data.domain.Pageable;

import com.google.gson.JsonObject;
import com.lfn.icip.icipwebeditor.model.ICIPMLTools;


public interface ICIPMLToolsService {

	ICIPMLTools saveTool(String org, JSONObject body);
	
	ICIPMLTools updateTool(String name, String org, JSONObject body);
	
	List<ICIPMLTools> getAllMlTools(String project, Pageable paginate,String query, List<String> category);

	Long getMLToolsCount(String project, String query, List<String> category);

	ICIPMLTools getMLToolByName(String name, String org);

	Boolean checkAlias(String string, String project);
	
	void deleteMlToolByName(String name, String org);

	Set<String> getUniqueCategories(String org);

	List<ICIPMLTools> getAllPaginatedMlTools(String project, Pageable paginate, String query, List<String> category);
	
	JsonObject export(Marker marker, String source, JSONArray jsonArray);

	void importData(Marker marker, String target, JSONObject jsonObject);

	boolean copy(String fromProjectName, String toProjectId);
}
