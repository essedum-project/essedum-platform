package com.infosys.icets.icip.dataset.rest;

import java.util.List;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.icets.icip.dataset.model.ICIPDatasetTopic;
import com.infosys.icets.icip.dataset.model.dto.MlTopics;
import com.infosys.icets.icip.dataset.model.ICIPDataset;
import com.infosys.icets.icip.dataset.model.ICIPDataset2;
import com.infosys.icets.icip.dataset.model.ICIPDatasetTopic;
import com.infosys.icets.icip.dataset.service.ICIPDatasetTopicService;

import io.micrometer.core.annotation.Timed;

@RestController
@Timed
@RequestMapping("/${icip.pathPrefix}/mldatasettopics")
@RefreshScope
public class ICIPDatasetTopicController {

	private static final Logger logger = LoggerFactory.getLogger(ICIPDatasetController.class);

	@Autowired
	private ICIPDatasetTopicService icipDatasetTopicService;

	
	@GetMapping("/{org}")
	public ResponseEntity<List<ICIPDatasetTopic>> getAllDatasetTopicsByOrganization(@PathVariable(name = "org", required = true)String org){
		return new ResponseEntity<List<ICIPDatasetTopic>>(icipDatasetTopicService.getDatasetTopicsByOrg(org),new HttpHeaders(), HttpStatus.OK);
	}
	
	@GetMapping("/{datasetid}/{topicname}/{org}")
	public ResponseEntity<ICIPDatasetTopic> getDatasetTopicByDatasetidAndTopicnameAndOrganization(
			@PathVariable(name = "org", required = true) String org,
			@PathVariable(name = "datasetid", required = true) String datasetid,
			@PathVariable(name = "topicname", required = true) String topicname) {
		return new ResponseEntity<ICIPDatasetTopic>(
				icipDatasetTopicService.getDatasetTopicByDatasetnameandTopicnamendOrg(datasetid, topicname, org),
				new HttpHeaders(), HttpStatus.OK);
	}

	@GetMapping("/{datasetid}/{org}")
	public ResponseEntity<List<ICIPDatasetTopic>> getDatasetTopicByDatasetidAndOrganization(
			@PathVariable(name = "org", required = true) String org,
			@PathVariable(name = "datasetid", required = true) String datasetid) {
		return new ResponseEntity<List<ICIPDatasetTopic>>(
				icipDatasetTopicService.getDatasetTopicByDatasetnameandOrg(datasetid, org), new HttpHeaders(),
				HttpStatus.OK);
	}

	@PostMapping("/add")
	public ResponseEntity<ICIPDatasetTopic> createDatasetTopicMapping(@RequestBody ICIPDatasetTopic icipDatasetTopic) {

		return new ResponseEntity<ICIPDatasetTopic>(icipDatasetTopicService.save(icipDatasetTopic), new HttpHeaders(),
				HttpStatus.OK);
	}

	@PostMapping("/addOrUpdateTopic")
	public ResponseEntity<ICIPDatasetTopic> addOrUpdateTopic(@RequestBody MlTopics mlTopics) {
		logger.info("addOrUpdateTopic called for:{}-{}", mlTopics.getDatasetId(), mlTopics.getOrganization());
		return new ResponseEntity<ICIPDatasetTopic>(icipDatasetTopicService.addOrUpdateTopic(mlTopics),
				new HttpHeaders(), HttpStatus.OK);
	}
	@PostMapping("/getDatasetsByTopics/{org}")
	public ResponseEntity<List<ICIPDataset>> getDatasetsByTopics(@RequestBody Map<String,String> topicsMap,
			@PathVariable(name = "org", required = true) String org){
		String[] topics = topicsMap.get("topics").split(",");
		return new ResponseEntity<List<ICIPDataset>>(icipDatasetTopicService.getDatasetsByTopics(topics,org),new HttpHeaders(),HttpStatus.OK);
	}
	
	@DeleteMapping("/softDeleteTopics/{org}")
	public ResponseEntity<String> softDeleteTopics(@RequestParam(name = "topics", required = false) String topics,
			@PathVariable(name = "org", required = true) String org) {
		logger.info("Soft Deleting Topics:{}", topics);
		return new ResponseEntity<String>(icipDatasetTopicService.softDeleteTopics(topics, org), new HttpHeaders(),
				HttpStatus.OK);
	}
}