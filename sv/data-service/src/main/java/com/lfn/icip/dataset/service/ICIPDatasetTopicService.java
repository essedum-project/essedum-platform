package com.lfn.icip.dataset.service;

import java.util.List;
import java.util.Map;

import com.lfn.icip.dataset.model.ICIPDatasetTopic;
import com.lfn.icip.dataset.model.dto.MlTopics;

import com.lfn.icip.dataset.model.ICIPDataset;
public interface ICIPDatasetTopicService {

	public ICIPDatasetTopic save(ICIPDatasetTopic icipDatasetTopic);

	public List<ICIPDatasetTopic> getDatasetTopicsByOrg(String org);

	public ICIPDatasetTopic getDatasetTopicByDatasetnameandTopicnamendOrg(String datasetid, String topicname,
			String org);

	List<ICIPDatasetTopic> getDatasetTopicByDatasetnameandOrg(String datasetid, String org);

	public ICIPDatasetTopic addOrUpdateTopic(MlTopics mlTopics);

	public Map<String, String> deleteTopicById(Integer id);

	public List<ICIPDataset> getDatasetsByTopics(String[] topics, String Org);

	public String softDeleteTopics(String topics, String org);
}