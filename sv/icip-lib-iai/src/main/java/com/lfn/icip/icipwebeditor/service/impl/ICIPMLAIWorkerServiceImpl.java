package com.lfn.icip.icipwebeditor.service.impl;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.icip.icipwebeditor.model.ICIPMLAIWorker;
import com.lfn.icip.icipwebeditor.model.ICIPMLAIWorkerConfig;
import com.lfn.icip.icipwebeditor.repository.ICIPMLAIWorkerRepository;
import com.lfn.icip.icipwebeditor.service.ICIPMLAIWorkerService;

@Service
public class ICIPMLAIWorkerServiceImpl implements ICIPMLAIWorkerService{

	@Autowired
	private ICIPMLAIWorkerRepository aiworkerRepository;
	
	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;
	
	@Override
	public ICIPMLAIWorker saveWorker(String org, JSONObject body) {
		ICIPMLAIWorker aiworker = new ICIPMLAIWorker();
		aiworker.setCreatedby(ICIPUtils.getUser(claim));
		aiworker.setCreatedon(Timestamp.from(Instant.now()));
		aiworker.setAlias(body.getString("alias"));
		aiworker.setName(body.getString("name"));
		aiworker.setOrganization(org);
		aiworker.setDescription(body.getString("description"));
		aiworker.setTask(body.getString("task"));
		aiworker.setInputsjson(body.getJSONObject("inputsjson").toString());
		aiworker.setSop(body.getString("sop"));
		aiworker.setPlan(body.getString("plan"));
		aiworker.setValidationResult(body.getString("validationresults"));
		aiworker.setLanggraphJson(body.optJSONObject("langgraphJson").toString());
		aiworker.setWorkflowSteps(body.getJSONObject("workflowsteps").toString());
		aiworker.setBpm(body.getString("bpm"));
		aiworker.setLastmodifiedby(ICIPUtils.getUser(claim));
		aiworker.setLastmodifiedon(Timestamp.from(Instant.now()));
		aiworker.setNavigateUrl(body.getString("Navigate_Url"));
		aiworker.setConfiguration(body.getJSONObject("configuration").toString());
		aiworker.setVersionname(body.getString("versionname").toString());
		aiworker.setIsdefault(body.getBoolean("isdefault"));


		return aiworkerRepository.save(aiworker);
	}

	@Override
	public List<ICIPMLAIWorker> getAllAiWorkers(String project, Pageable paginate, String query) {
		return aiworkerRepository.getAllAIWorkerByOrg(project, paginate, query);
	}

	@Override
	public Long getAiWorkerCount(String project, String query) {
		Long count = aiworkerRepository.getAiWorkerCountByOrg(project, query);
		return count;
	}

	@Override
	public ICIPMLAIWorker getAiWorkerByNameAndOrg(String name, String org) {
		
		return aiworkerRepository.findByNameAndOrganization(name, org);
	}

	@Override
	public List<ICIPMLAIWorker> getAiWorkerByNameAndOrgAndTask(String name, String org, String task) {
		
		return aiworkerRepository.findByNameAndOrganizationAndTask(name, org, task);
	}
	
	@Override
	public ICIPMLAIWorker updateWorker(String name, String org, JSONObject body) {
		ICIPMLAIWorker aiworker = new ICIPMLAIWorker();
		if(body.has("old_name")) {
			aiworker = aiworkerRepository.findByNameAndOrganizationAndTaskAndVersionname(name, org, body.getString("task"),body.getString("old_name"));
		}else {
			aiworker = aiworkerRepository.findByNameAndOrganizationAndTaskAndVersionname(name, org, body.getString("task"),body.getString("versionname"));
		}
		aiworker.setAlias(body.getString("alias"));
		aiworker.setDescription(body.getString("description"));
		aiworker.setTask(body.getString("task"));
		aiworker.setInputsjson(body.getJSONObject("inputsjson").toString());
		aiworker.setSop(body.getString("sop"));
		aiworker.setPlan(body.getString("plan"));
		aiworker.setValidationResult(body.getString("validationresults"));
		aiworker.setLanggraphJson(body.optJSONObject("langgraphJson").toString());
		aiworker.setWorkflowSteps(body.getJSONObject("workflowsteps").toString());
		aiworker.setBpm(body.getString("bpm"));
		aiworker.setLastmodifiedby(ICIPUtils.getUser(claim));
		aiworker.setLastmodifiedon(Timestamp.from(Instant.now()));
		aiworker.setNavigateUrl(body.getString("Navigate_Url"));
		aiworker.setConfiguration(body.getJSONObject("configuration").toString());
		aiworker.setVersionname(body.getString("versionname"));
		aiworker.setIsdefault(body.getBoolean("isdefault"));

		
		return aiworkerRepository.save(aiworker);
	}

	@Override
	public ICIPMLAIWorker getAiWorkerById(Integer id) {
		return aiworkerRepository.findById(id).get();
	}
	@Override
	public String updateDefaultVersion(String name, String org, String task, String versionname) {
		try {
			aiworkerRepository.setDefaultVersionOfTask(name, org, task);
			ICIPMLAIWorker aiworker = aiworkerRepository.findByNameAndOrganizationAndTaskAndVersionname(name, org, task, versionname);
			aiworker.setIsdefault(true);
			aiworkerRepository.save(aiworker);
			return "SUCCESS";

		}catch(Exception e) {
			return "ERROR";
		}
	}
	
	@Override
	public void deleteAiWorkerTaskVersion(Integer id) {
//		try {
//			aiworkerRepository.deleteByNameAndOrganizationAndTaskAndVersionname(name, org, task, versionname);
//			return "DELETED";
//		}catch(Exception e) {
//			return "ERROR";
//		}
		aiworkerRepository.deleteById(id);
	}

	@Override
	public void deleteAllByNameAndOrg(String name, String org) {
		aiworkerRepository.deleteByNameAndOrganization(name, org);
	}
}
