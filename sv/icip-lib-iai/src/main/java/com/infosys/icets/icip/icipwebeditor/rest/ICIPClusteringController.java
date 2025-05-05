package com.infosys.icets.icip.icipwebeditor.rest;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.icets.icip.icipwebeditor.model.ICIPClustering;
import com.infosys.icets.icip.icipwebeditor.service.ICIPClusteringService;
import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Hidden;

@RestController
@Timed
@Hidden
@RequestMapping(path = "/${icip.pathPrefix}/ClusteringWorkflow")
public class ICIPClusteringController {
	
	@Autowired
	ICIPClusteringService clusteringrService;
	
	//COMMENTED AS PART OF CODE CLEANUP
		
//	@PostMapping( "/save")
//	public ResponseEntity<ICIPClustering> saveWorker(@RequestParam(name = "project", required = true) String project,
//			@RequestBody String body ){
//		JSONObject reqBody= new JSONObject(body);
//		ICIPClustering agent = clusteringrService.saveWorker(project, reqBody);
//		return new ResponseEntity<>(agent,HttpStatus.OK);
//	}
//	
//	@GetMapping("/config/details")
//	public ResponseEntity<ICIPClustering> getWorkflow(
//			@RequestParam(name = "name") String name,
//			@RequestParam(name = "org") String org){
//		ICIPClustering agent= clusteringrService.getWorkflowConfigByNameAndOrg(name, org);
//		return new ResponseEntity<>(agent,HttpStatus.OK);
//	}

}
