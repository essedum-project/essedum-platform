package com.infosys.icets.icip.icipwebeditor.service.impl;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infosys.icets.icip.icipwebeditor.model.ICIPClustering;
import com.infosys.icets.icip.icipwebeditor.repository.clusteringRepository;
import com.infosys.icets.icip.icipwebeditor.service.ICIPClusteringService;

@Service
public class ICIPClusteringServiceImpl implements ICIPClusteringService {
	
	@Autowired
	private clusteringRepository clusteringRepository;

	@Override
	public ICIPClustering saveWorker(String org, JSONObject body) {
		ICIPClustering cluster = new ICIPClustering();
		cluster.setName(body.getString("name"));
		cluster.setAlias(body.getString("Alias"));
		cluster.setOrganization(org);
		cluster.setWorkflowDetails(body.getJSONObject("workflowDetails").toString());
		return clusteringRepository.save(cluster);
	}

	@Override
	public ICIPClustering getWorkflowConfigByNameAndOrg(String name, String org) {
		return clusteringRepository.findByNameAndOrganization(name, org);
	}

}
