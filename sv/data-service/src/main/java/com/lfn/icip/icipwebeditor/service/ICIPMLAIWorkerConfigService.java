package com.lfn.icip.icipwebeditor.service;

import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Marker;
import org.springframework.data.domain.Pageable;

import com.google.gson.JsonObject;
import com.lfn.icip.icipwebeditor.model.ICIPMLAIWorkerConfig;

public interface ICIPMLAIWorkerConfigService {
	
	ICIPMLAIWorkerConfig save(String org, JSONObject body);
	
	List<ICIPMLAIWorkerConfig> getAllAiWorkerConfigs(String project, Pageable paginate,String query);

	Long getAiWorkerConfigCount(String project, String query);

	ICIPMLAIWorkerConfig getAiWorkerConfigByNameAndOrg(String name, String org);

	ICIPMLAIWorkerConfig update(String name, String org, JSONObject body);
	
	String getConfigNameById(Integer id);
	
	void deleteAiWorkerConfig(Integer id);

	ICIPMLAIWorkerConfig getAiWorkerConfigByAliasAndOrg(String alias, String org);
	
	JsonObject export(Marker marker, String source, JSONArray jsonArray);

	void importData(Marker marker, String target, JSONObject jsonObject);

	boolean copy(String fromProjectName, String toProjectId);
}
