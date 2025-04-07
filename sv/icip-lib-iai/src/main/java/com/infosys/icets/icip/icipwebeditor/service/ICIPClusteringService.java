package com.infosys.icets.icip.icipwebeditor.service;

import org.json.JSONObject;

import com.infosys.icets.icip.icipwebeditor.model.ICIPClustering;

public interface ICIPClusteringService {

	ICIPClustering saveWorker(String org, JSONObject body);

	ICIPClustering getWorkflowConfigByNameAndOrg(String name, String org);
}
