package com.infosys.icets.icip.icipwebeditor.rest;

import java.io.IOException;
import java.net.URISyntaxException;
import java.security.InvalidKeyException;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;

import org.apache.http.protocol.HTTP;
import org.json.JSONObject;
import org.json.simple.JSONValue;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.icets.ai.comm.lib.util.ICIPHeaderUtil;
import com.infosys.icets.icip.icipwebeditor.model.ICIPMLAIWorkerLogs;
import com.infosys.icets.icip.icipwebeditor.service.ICIPMLAIWorkerLogsService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Hidden;
//COMMENTED AS PART OF CODE CLEANUP
//@RestController
//@Timed
//@Hidden
//@RequestMapping(path = "/${icip.pathPrefix}/mlaiworkerlogs")
//public class ICIPMLAIWorkerLogsController {
//	
//	/** The Constant logger. */
//	private static final Logger logger = LoggerFactory.getLogger(ICIPMLAIWorkerLogs.class);
//
//	@Autowired
//	ICIPMLAIWorkerLogsService aiWorkerLogsService;
//	
//	
//	
//	@GetMapping("/count/{org}")
//	public ResponseEntity<Long> getMlAiWorkerLogsLen(@PathVariable(name = "org") String org) {
//		return new ResponseEntity<>(aiWorkerLogsService.logsCountByOrganization(org), HttpStatus.OK);
//	}
//
//	
//	@GetMapping("/count/{task}/{org}")
//	public ResponseEntity<Long> getMlAiWorkerJobsLenByTask(@PathVariable(name = "task") String task,
//			@PathVariable(name = "org") String org) {
//		return new ResponseEntity<>(aiWorkerLogsService.logsCountByTaskAndOrganization(task, org), HttpStatus.OK);
//	}
//	
//	@PostMapping( "/save")
//	public ResponseEntity<ICIPMLAIWorkerLogs> save(@RequestParam(name = "project", required = true) String project,
//			@RequestBody String body ){
//		JSONObject reqBody= new JSONObject(body);
//		ICIPMLAIWorkerLogs aiWorkerLog = aiWorkerLogsService.saveLog(project, reqBody);
//		return new ResponseEntity<>(aiWorkerLog,HttpStatus.OK);
//	}
//	
//}
