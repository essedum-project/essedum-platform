package com.lfn.icip.dataset.service.impl;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.stereotype.Service;

import com.lfn.icip.dataset.constants.ICIPPluginConstants;
import com.lfn.icip.dataset.model.ICIPDataset2;
import com.lfn.icip.dataset.model.ICIPDatasetTopic;
import com.lfn.icip.dataset.model.ICIPTopic;
import com.lfn.icip.dataset.model.dto.MlTopics;
import com.lfn.icip.dataset.repository.ICIPDatasetRepository2;
import com.lfn.icip.dataset.repository.ICIPDatasetTopicRepository;
import com.lfn.icip.dataset.repository.ICIPTopicRepository;
import com.lfn.icip.dataset.service.ICIPDatasetTopicService;
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.service.IICIPDatasetService;
@Service
@RefreshScope
public class ICIPDatasetTopicServiceImpl implements ICIPDatasetTopicService {

	private static final Logger logger = LoggerFactory.getLogger(ICIPDatasetTopicServiceImpl.class);

	@Autowired
	private ICIPDatasetTopicRepository icipDatasetTopicRepository;

	@Autowired
	private ICIPDatasetRepository2 datasetRepository2;

	@Autowired
	private ICIPTopicRepository iCIPTopicRepository;
	
	@Autowired
	private IICIPDatasetService iicipDatasetService; 
	
	@Override
	public ICIPDatasetTopic save(ICIPDatasetTopic icipDatasetTopic) {
		
		return icipDatasetTopicRepository.save(icipDatasetTopic);
	}

	@Override
	public List<ICIPDatasetTopic> getDatasetTopicsByOrg(String org) {
		return icipDatasetTopicRepository.getByOrganization(org);
	}

	@Override
	public ICIPDatasetTopic getDatasetTopicByDatasetnameandTopicnamendOrg(String datasetid, String topicname,
			String org) {
		return icipDatasetTopicRepository.findByDatasetidAndTopicnameAndOrganization(datasetid, topicname, org);
	}

	@Override
	public List<ICIPDatasetTopic> getDatasetTopicByDatasetnameandOrg(String datasetid, String org) {
		return icipDatasetTopicRepository.findByDatasetidAndOrganization(datasetid, org);
	}

	@Override
	public ICIPDatasetTopic addOrUpdateTopic(MlTopics mlTopics) {
		ICIPTopic iCIPTopic = iCIPTopicRepository.findByTopicnameAndOrganization(mlTopics.getTopicName(),
				mlTopics.getOrganization());
		if (iCIPTopic == null) {
			iCIPTopic = new ICIPTopic();
			iCIPTopic.setTopicname(mlTopics.getTopicName());
			iCIPTopic.setOrganization(mlTopics.getOrganization());
			iCIPTopic.setAdapterinstance(mlTopics.getAdapterInstance());
			if (mlTopics.getAdapterInstance() != null && !mlTopics.getAdapterInstance().isEmpty())
				iCIPTopic = iCIPTopicRepository.save(iCIPTopic);
		}
		ICIPDatasetTopic iCIPDatasetTopic = new ICIPDatasetTopic();
		ICIPDataset2 datasetFromDb = datasetRepository2.findDatasetByNameAndOrganization(mlTopics.getDatasetId(),
				mlTopics.getOrganization());
		if (mlTopics.getTopicName() != null && datasetFromDb != null && iCIPTopic.getId() != null) {
			iCIPDatasetTopic = icipDatasetTopicRepository.findByDatasetidAndTopicnameAndOrganization(
					mlTopics.getDatasetId(), mlTopics.getTopicName(), mlTopics.getOrganization());
			if (iCIPDatasetTopic == null) {
				iCIPDatasetTopic = new ICIPDatasetTopic();
				iCIPDatasetTopic.setTopicname(iCIPTopic);
				iCIPDatasetTopic.setDatasetid(mlTopics.getDatasetId());
				iCIPDatasetTopic.setOrganization(mlTopics.getOrganization());
				iCIPDatasetTopic.setStatus("IN-PROGRESS");
				iCIPDatasetTopic.setLog("Request triggered.");
				if (mlTopics.getStartTime() != null) {
					iCIPDatasetTopic.setStartTime(mlTopics.getStartTime());
					iCIPDatasetTopic.setFinishTime(null);
					iCIPDatasetTopic.setDuration(null);
				} else {
					Calendar calendar = Calendar.getInstance();
					Date startDate = calendar.getTime();
					Timestamp startTime = new Timestamp(startDate.getTime());
					iCIPDatasetTopic.setStartTime(startTime);
				}
			} else {
				iCIPDatasetTopic.setStatus(mlTopics.getStatus());
				if ("IN-PROGRESS".equalsIgnoreCase(mlTopics.getStatus())) {
					iCIPDatasetTopic.setLog("Request triggered.");
					if (mlTopics.getStartTime() != null)
						iCIPDatasetTopic.setStartTime(mlTopics.getStartTime());
					else {
						Calendar calendar = Calendar.getInstance();
						Date startDate = calendar.getTime();
						Timestamp startTime = new Timestamp(startDate.getTime());
						iCIPDatasetTopic.setStartTime(startTime);
					}
					iCIPDatasetTopic.setFinishTime(null);
					iCIPDatasetTopic.setDuration(null);
				} else {
					if (mlTopics.getStartTime() != null)
						iCIPDatasetTopic.setStartTime(mlTopics.getStartTime());
					if (mlTopics.getFinishTime() != null)
						iCIPDatasetTopic.setFinishTime(mlTopics.getFinishTime());
					if (mlTopics.getDuration() != null)
						iCIPDatasetTopic.setDuration(mlTopics.getDuration());
				}

			}
			if (mlTopics.getDescription() != null && !mlTopics.getDescription().isEmpty())
				iCIPDatasetTopic.setDescription(mlTopics.getDescription());
			iCIPDatasetTopic = icipDatasetTopicRepository.save(iCIPDatasetTopic);

			if (mlTopics.getLog() != null && !mlTopics.getLog().isEmpty())
				iCIPDatasetTopic.setLog(mlTopics.getLog());
			iCIPDatasetTopic = icipDatasetTopicRepository.save(iCIPDatasetTopic);
		}else {
			return null;
		}

		return iCIPDatasetTopic;
	}

	@Override
	public Map<String, String> deleteTopicById(Integer id) {
		Map<String, String> response = new HashMap<>();
		try {
			@SuppressWarnings("deprecation")
			ICIPDatasetTopic iCIPDatasetTopic = icipDatasetTopicRepository.getById(id);
			if (iCIPDatasetTopic != null)
				icipDatasetTopicRepository.delete(iCIPDatasetTopic);
			response.put(ICIPPluginConstants.MESSAGE, ICIPPluginConstants.MESSAGE_SUCCESS);
			return response;
		} catch (Exception e) {
			logger.error("Error due to:{}", e.getMessage());
			response.put(ICIPPluginConstants.MESSAGE, ICIPPluginConstants.MESSAGE_FAILED);
			return response;
		}

	}
	public List<ICIPDataset> getDatasetsByTopics(String[] topics,String org) {
		Set<String> datasets = new HashSet<String>();
		for(String topic:topics) {
		List<ICIPDatasetTopic>icipDatasetTopics=	icipDatasetTopicRepository.findByTopicnameAndOrganization(topic,org);
		
		for(ICIPDatasetTopic icipDatasetTopic : icipDatasetTopics) {
			datasets.add(icipDatasetTopic.getDatasetid());
		}
		}
		List<ICIPDataset> icipDatasets = new ArrayList<>();
		for(String dataset:datasets) {
			ICIPDataset iCIPDataset = null;
			try {
				iCIPDataset = iicipDatasetService.getDataset(dataset, org);
			} catch (Exception e) {
				iCIPDataset = null;
			}
			if (iCIPDataset != null)
				icipDatasets.add(iCIPDataset);
		}
		return icipDatasets;
	}
	
	@Override
	public String softDeleteTopics(String topics, String org) {

		JSONObject response = new JSONObject();
		try {
			String[] topicsList = topics.split(",");
			for (String topic : topicsList) {
				ICIPTopic iCIPTopic = iCIPTopicRepository.findByTopicnameAndOrganization(topic, org);
				iCIPTopicRepository.delete(iCIPTopic);
			}
			response.put("response", "success");
			return response.toString();
		} catch (Exception e) {
			return null;
		}
	}
	

}
