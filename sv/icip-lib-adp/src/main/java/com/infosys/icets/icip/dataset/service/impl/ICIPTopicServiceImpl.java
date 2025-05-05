package com.infosys.icets.icip.dataset.service.impl;

import java.util.List;

import org.json.JSONArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.stereotype.Service;

import com.infosys.icets.icip.dataset.model.ICIPTopic;
import com.infosys.icets.icip.dataset.model.dto.MlTopicsFAQs;
import com.infosys.icets.icip.dataset.repository.ICIPTopicRepository;
//import com.infosys.icets.icip.dataset.service.ICIPTopicService;
//COMMENTED AS PART OF CODE CLEANUP
//@Service
//@RefreshScope
//public class ICIPTopicServiceImpl implements ICIPTopicService {
//	private static final Logger logger = LoggerFactory.getLogger(ICIPDatasetTopicServiceImpl.class);
//
//	@Autowired
//	private ICIPTopicRepository icipTopicRepository;
//
//	@Override
//	public ICIPTopic save(ICIPTopic icipTopic) {
//		return icipTopicRepository.save(icipTopic);
//
//	}
//
//	@Override
//	public List<ICIPTopic> fetchTopicsByOrg(String org) {
//		return icipTopicRepository.findByOrganization(org);
//	}
//
//	@Override
//	public ICIPTopic fetchTopicByTopicnameandOrg(String topicname, String org) {
//		return icipTopicRepository.findByTopicnameAndOrganization(topicname, org);
//	}
//
//	@Override
//	public List<ICIPTopic> activeMltopicsByOrg(String org) {
//		logger.info("Fetching active Mltopics for:{}", org);
//		return icipTopicRepository.activeMltopicsByOrg(org);
//	}
//
//	@Override
//	public ICIPTopic addOrUpdateTopicFAQs(MlTopicsFAQs addOrUpdateTopicFAQs) {
//		ICIPTopic iCIPTopic=icipTopicRepository.findByTopicnameAndOrganization(addOrUpdateTopicFAQs.getTopicname(), addOrUpdateTopicFAQs.getOrganization());
//		JSONArray jsonArray = new JSONArray(addOrUpdateTopicFAQs.getSuggested_queries());
//		iCIPTopic.setSuggested_queries(jsonArray.toString());
//		icipTopicRepository.save(iCIPTopic);
//		return iCIPTopic;
//	}
//
//}
