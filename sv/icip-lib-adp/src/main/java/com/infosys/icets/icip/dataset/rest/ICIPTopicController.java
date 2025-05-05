package com.infosys.icets.icip.dataset.rest;

import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.infosys.icets.icip.dataset.model.ICIPDatasetTopic;
import com.infosys.icets.icip.dataset.model.ICIPTopic;
import com.infosys.icets.icip.dataset.model.dto.MlTopics;
import com.infosys.icets.icip.dataset.model.dto.MlTopicsFAQs;
import com.infosys.icets.icip.dataset.service.ICIPDatasetTopicService;
//import com.infosys.icets.icip.dataset.service.ICIPTopicService;

import io.micrometer.core.annotation.Timed;
//COMMENTED AS PART OF CODE CLEANUP
//@RestController
//@Timed
//@RequestMapping("/${icip.pathPrefix}/mltopics")
//@RefreshScope
//public class ICIPTopicController {
//	private static final Logger logger = LoggerFactory.getLogger(ICIPDatasetController.class);
//
//	@Autowired
//	private ICIPTopicService icipTopicService;
//
//	@Autowired
//	private ICIPDatasetTopicService icipDatasetTopicService;
//	
//	

//	@GetMapping("/{org}")
//	public ResponseEntity<List<ICIPTopic>> getTopicsByOrg(@PathVariable(name = "org", required = true) String org) {
//		return new ResponseEntity<List<ICIPTopic>>(icipTopicService.fetchTopicsByOrg(org), new HttpHeaders(),
//				HttpStatus.OK);
//	}
//
//	@GetMapping("/{topicname}/{org}")
//	public ResponseEntity<ICIPTopic> getTopicByTopicNameAndOrg(@PathVariable(name = "org", required = true) String org,
//			@PathVariable(name = "topicname", required = true) String topicname) {
//		return new ResponseEntity<ICIPTopic>(icipTopicService.fetchTopicByTopicnameandOrg(topicname, org),
//				new HttpHeaders(), HttpStatus.OK);
//
//	}
//
//	@PostMapping("/add")
//	public ResponseEntity<ICIPTopic> saveTopic(@RequestBody ICIPTopic icipTopic) {
//
//		return new ResponseEntity<ICIPTopic>(icipTopicService.save(icipTopic), new HttpHeaders(), HttpStatus.OK);
//	}
//
//	@PostMapping("/addOrUpdateTopic")
//	public ResponseEntity<ICIPDatasetTopic> addOrUpdateTopic(@RequestBody MlTopics mlTopics) {
//		logger.info("addOrUpdateTopic called for:{}-{}", mlTopics.getDatasetId(), mlTopics.getOrganization());
//		ICIPDatasetTopic iCIPDatasetTopic = icipDatasetTopicService.addOrUpdateTopic(mlTopics);
//		if (iCIPDatasetTopic != null)
//			return new ResponseEntity<ICIPDatasetTopic>(iCIPDatasetTopic, new HttpHeaders(), HttpStatus.OK);
//		else
//			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
//
//	}
//
//	@DeleteMapping("/deleteTopicById/{id}")
//	public ResponseEntity<Map<String, String>> deleteTopicById(@PathVariable("id") Integer id) {
//		logger.info("deleting topic id:{}", id);
//		try {
//			icipDatasetTopicService.deleteTopicById(id);
//			return new ResponseEntity<>(icipDatasetTopicService.deleteTopicById(id), new HttpHeaders(), HttpStatus.OK);
//		} catch (Exception t) {
//			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
//		}
//	}
//
//	@GetMapping("/list/activeMltopicsByOrg/{org}")
//	public ResponseEntity<List<ICIPTopic>> activeMltopicsByOrg(
//			@PathVariable(name = "org", required = true) String org) {
//		return new ResponseEntity<List<ICIPTopic>>(icipTopicService.activeMltopicsByOrg(org), new HttpHeaders(),
//				HttpStatus.OK);
//	}
//	
//	@PostMapping("/addOrUpdateTopicSuggestedQueries")
//	public ResponseEntity<ICIPTopic> addOrUpdateTopicFAQs(@RequestBody MlTopicsFAQs addOrUpdateTopicFAQs) {
//		logger.info("addOrUpdateTopicSuggestedQueries called for:{}-{}", addOrUpdateTopicFAQs.getTopicname(), addOrUpdateTopicFAQs.getOrganization());
//		return new ResponseEntity<ICIPTopic>(icipTopicService.addOrUpdateTopicFAQs(addOrUpdateTopicFAQs),
//				new HttpHeaders(), HttpStatus.OK);
//	}
//
//}
