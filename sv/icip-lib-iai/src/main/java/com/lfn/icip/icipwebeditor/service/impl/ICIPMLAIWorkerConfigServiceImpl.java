package com.lfn.icip.icipwebeditor.service.impl;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.logger.JobLogger;
import com.lfn.ai.comm.lib.util.service.dto.support.NameEncoderService;
import com.lfn.icip.icipwebeditor.model.ICIPMLAIWorkerConfig;
import com.lfn.icip.icipwebeditor.repository.ICIPMLAIWorkerConfigRepository;
import com.lfn.icip.icipwebeditor.service.ICIPMLAIWorkerConfigService;
import com.lfn.icip.icipwebeditor.service.ICIPMLToolsService;

@Service
public class ICIPMLAIWorkerConfigServiceImpl implements ICIPMLAIWorkerConfigService{
	
	@Autowired
	private ICIPMLAIWorkerConfigRepository aiworkerconfigRepository;
	
	@Autowired
	private ICIPMLToolsService aiWorkerToolService;
	
	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;
	
	/** The log. */
	private final Logger log = LoggerFactory.getLogger(JobLogger.class);
	
	@Override
	public ICIPMLAIWorkerConfig save(String org, JSONObject body) {
		ICIPMLAIWorkerConfig aiworkerConfig = aiworkerconfigRepository.findByNameAndOrganization(body.getString("alias"), org);
		if(aiworkerConfig == null) {
			aiworkerConfig = new ICIPMLAIWorkerConfig();
		}
		aiworkerConfig.setCreatedby(ICIPUtils.getUser(claim));
		aiworkerConfig.setCreatedon(Timestamp.from(Instant.now()));
		aiworkerConfig.setAlias(body.getString("alias"));
		aiworkerConfig.setName(body.getString("alias"));
		aiworkerConfig.setOrganization(org);
		aiworkerConfig.setDescription(body.optString("description"));
		aiworkerConfig.setLlm(body.optString("llm"));
		aiworkerConfig.setKnowledgeBase(body.optString("knowledgeBase"));
		aiworkerConfig.setPlanner(body.optString("planner"));
		aiworkerConfig.setValidator(body.optString("validator"));
		aiworkerConfig.setExecutor(body.optString("executor"));
		aiworkerConfig.setGenerator(body.optString("generator"));
//		JSONObject taskGroup = body.getJSONObject("taskGroup");
//		aiworkerConfig.setTask(body.getString("task"));
//		aiworkerConfig.setUserInputs(body.getJSONArray("userInputs").toString());
//		aiworkerConfig.setBots(body.getString("bots"));
		aiworkerConfig.setTaskGroup(body.getString("taskGroup"));
		aiworkerConfig.setLastmodifiedby(ICIPUtils.getUser(claim));
		aiworkerConfig.setLastmodifiedon(Timestamp.from(Instant.now()));
		
		return aiworkerconfigRepository.save(aiworkerConfig);
	}

	@Override
	public List<ICIPMLAIWorkerConfig> getAllAiWorkerConfigs(String project, Pageable paginate, String query) {
		
		return aiworkerconfigRepository.getAllAIWorkerConfigByOrg(project, paginate, query);
		
	}
	
	@Override
	public Long getAiWorkerConfigCount(String project, String query) {
		
		Long count = aiworkerconfigRepository.getAiWorkerConfigCountByOrg(project, query);
		return count;
		
	}

	@Override
	public ICIPMLAIWorkerConfig getAiWorkerConfigByNameAndOrg(String name, String org) {
//		return aiworkerconfigRepository.findById(id).get();
		return aiworkerconfigRepository.findByNameAndOrganization(name, org);
	}
	
	@Override
	public ICIPMLAIWorkerConfig getAiWorkerConfigByAliasAndOrg(String alias, String org) {
//		return aiworkerconfigRepository.findById(id).get();
		return aiworkerconfigRepository.findByAliasAndOrganization(alias, org);
	}

	@Override
	public ICIPMLAIWorkerConfig update(String name ,String org, JSONObject body) {
		ICIPMLAIWorkerConfig aiworkerConfig = aiworkerconfigRepository.findByNameAndOrganization(name, org);
		aiworkerConfig.setAlias(body.getString("alias"));
		aiworkerConfig.setDescription(body.getString("description"));
		aiworkerConfig.setLlm(body.getString("llm"));
		aiworkerConfig.setKnowledgeBase(body.getString("knowledgeBase"));
		aiworkerConfig.setPlanner(body.getString("planner"));
		aiworkerConfig.setValidator(body.getString("validator"));
		aiworkerConfig.setExecutor(body.getString("executor"));
		aiworkerConfig.setGenerator(body.getString("generator"));
//		JSONObject taskGroup = body.getJSONObject("task_group");
//		aiworkerConfig.setTask(body.getString("task"));
//		aiworkerConfig.setUserInputs(body.getJSONArray("userInputs").toString());
//		aiworkerConfig.setBots(body.getString("bots"));
		aiworkerConfig.setTaskGroup(body.getString("taskGroup"));
		aiworkerConfig.setLastmodifiedby(ICIPUtils.getUser(claim));
		aiworkerConfig.setLastmodifiedon(Timestamp.from(Instant.now()));
		
		return aiworkerconfigRepository.save(aiworkerConfig);
	}
	
	@Override
	public String getConfigNameById(Integer id) {
		@SuppressWarnings("deprecation")
		ICIPMLAIWorkerConfig config = aiworkerconfigRepository.getById(id);
		return config.getName();
	}
	
	@Override
	public void deleteAiWorkerConfig(Integer id) {
		aiworkerconfigRepository.deleteById(id);
	}

	@Override
	public JsonObject export(Marker marker, String source, JSONArray workerNames) {
		JsonObject jsnObj = new JsonObject();
		try {
			log.info(marker,"Exporting aiWorkers started");
			Gson gson = new GsonBuilder().disableHtmlEscaping().create();
			List<ICIPMLAIWorkerConfig> workers = new ArrayList<>();
			List<String> wkNames = new ArrayList();
			workerNames.forEach(name ->{
				wkNames.add(name.toString());
				workers.add(aiworkerconfigRepository.findByNameAndOrganization(name.toString(),source));
			});

			JSONArray toolNames = new JSONArray(aiworkerconfigRepository.getDistinctToolByWorkerAndOrg(wkNames,source));
			jsnObj.add("workerTools", aiWorkerToolService.export(marker, source, toolNames));
			
			jsnObj.add("mlaiworkerconfig", gson.toJsonTree(workers));
			log.info(marker, "Exported workers successfully");
		}catch(Exception ex) {
			log.error(marker, "Error in exporting worker");
			log.error(marker, ex.getMessage());
		}
		return jsnObj;
	}

	@Override
	public void importData(Marker marker, String target, JSONObject jsonObject) {
		Gson g = new Gson();
		try {
			log.info(marker, "Importing worker started");
			JsonArray workerConfigs = g.fromJson(jsonObject.get("mlaiworkerconfig").toString(), JsonArray.class);
			if(jsonObject.has("workerTools")) {
				aiWorkerToolService.importData(marker, target, jsonObject.getJSONObject("workerTools"));
			}
			workerConfigs.forEach(x ->{
				ICIPMLAIWorkerConfig worker = g.fromJson(x, ICIPMLAIWorkerConfig.class);
				worker.setId(null);
				worker.setOrganization(target);
				try {
					aiworkerconfigRepository.save(worker);
				}
				catch(Exception ex) {
					log.error(marker, "Error in importing duplicate workerConfig {}",worker.getName());
				}
			});
		}catch(Exception ex) {
			log.error(marker, "Error in importing worker");
			log.error(marker, ex.getMessage());
		}
	}

	@Override
	public boolean copy(String fromProjectName, String toProjectId) {
		List<ICIPMLAIWorkerConfig> workerConfigList = aiworkerconfigRepository.findByOrganization(fromProjectName);
		workerConfigList.stream().forEach(worker ->{
			worker.setId(null);
			worker.setOrganization(toProjectId);
			try {
				aiworkerconfigRepository.save(worker);
			}
			catch(Exception ex) {
				log.error("Error in importing duplicate workerConfig {}",worker.getName());
			}
		});
		return true;
	}

	
}
