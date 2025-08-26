package com.lfn.icip.icipwebeditor.service;

import java.util.List;

import org.json.JSONObject;
import org.springframework.data.domain.Pageable;

import com.lfn.icip.icipwebeditor.model.ICIPMLAIWorker;

public interface ICIPMLAIWorkerService {
	
	ICIPMLAIWorker saveWorker(String org, JSONObject body);
	
	List<ICIPMLAIWorker> getAllAiWorkers(String project, Pageable paginate,String query);

	Long getAiWorkerCount(String project, String query);

	ICIPMLAIWorker getAiWorkerById(Integer org);

	ICIPMLAIWorker updateWorker(String name, String org, JSONObject body);

	ICIPMLAIWorker getAiWorkerByNameAndOrg(String name, String org);

	List<ICIPMLAIWorker> getAiWorkerByNameAndOrgAndTask(String name, String org, String task);

	String updateDefaultVersion(String name, String org, String task, String versionname);

	void deleteAiWorkerTaskVersion(Integer id);
	
	void deleteAllByNameAndOrg(String name, String org);
	
}
