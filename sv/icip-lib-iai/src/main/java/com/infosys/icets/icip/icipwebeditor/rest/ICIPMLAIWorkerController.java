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
import com.infosys.icets.icip.icipwebeditor.model.ICIPMLAIWorker;
import com.infosys.icets.icip.icipwebeditor.model.ICIPMLAIWorkerConfig;
import com.infosys.icets.icip.icipwebeditor.model.ICIPPrompts;
import com.infosys.icets.icip.icipwebeditor.service.ICIPMLAIWorkerConfigService;
import com.infosys.icets.icip.icipwebeditor.service.ICIPMLAIWorkerService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Hidden;

@RestController
@Timed
@Hidden
@RequestMapping(path = "/${icip.pathPrefix}/mlaiworker")
public class ICIPMLAIWorkerController {
	
	@Autowired
	ICIPMLAIWorkerConfigService mlaiworkerConfigService;
	
	@Autowired
	ICIPMLAIWorkerService mlaiworkerService;
	
	/**
	 * -------------------------MLAIWorkerConfig---------------
	 */
	@GetMapping("/config/getAll")
	public ResponseEntity<List<ICIPMLAIWorkerConfig>> getAllAiWorkerConfig(
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "page", required = false, defaultValue = "1") String page,
			@RequestParam(name = "size", required = false, defaultValue = "10") String size,
			@RequestParam(name = "query", required = false) String query
			){
		Pageable paginate = PageRequest.of(Integer.valueOf(page) - 1, Integer.valueOf(size));
		List<ICIPMLAIWorkerConfig> aiworkerConfigList = mlaiworkerConfigService.getAllAiWorkerConfigs(project, paginate,query);
		return new ResponseEntity<>(aiworkerConfigList,HttpStatus.OK);
	}
	
	@GetMapping("/config/count")
	public ResponseEntity<Long> getAiWorkerConfigCount(
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "query", required = false) String query
			){
		Long results= mlaiworkerConfigService.getAiWorkerConfigCount(project,query);
		return ResponseEntity.status(200).body(results);
	}
	
	@PostMapping( "/config/save")
	public ResponseEntity<?> save(@RequestParam(name = "project", required = true) String project,
			@RequestBody String body ){
		JSONObject reqBody= new JSONObject(body);
		ICIPMLAIWorkerConfig agentPresent = mlaiworkerConfigService.getAiWorkerConfigByNameAndOrg(reqBody.getString("alias"), project);
		if(agentPresent == null) {
			ICIPMLAIWorkerConfig agentPresentwithAlias = mlaiworkerConfigService.getAiWorkerConfigByAliasAndOrg(reqBody.getString("alias"), project);
			if(agentPresentwithAlias == null) {
				ICIPMLAIWorkerConfig agent = mlaiworkerConfigService.save(project, reqBody);
				return new ResponseEntity<>(agent,HttpStatus.OK);
			}else {
				return new ResponseEntity<>("Alias already exists",HttpStatus.CONFLICT);
			}
		}
		else {
			return new ResponseEntity<>("Alias already exists",HttpStatus.CONFLICT);
		}
	}
	
	@PostMapping( "/config/update/{name}/{organization}")
	public ResponseEntity<?> update(@PathVariable(name = "name") String name,
			@PathVariable(name = "organization") String org,
			@RequestBody String body){
		JSONObject updateBody= new JSONObject(body);
		ICIPMLAIWorkerConfig agentPresentwithName = mlaiworkerConfigService.getAiWorkerConfigByNameAndOrg(updateBody.getString("alias"), org);
		ICIPMLAIWorkerConfig agentPresentwithAlias = mlaiworkerConfigService.getAiWorkerConfigByAliasAndOrg(updateBody.getString("alias"), org);

		if(agentPresentwithName == null && agentPresentwithAlias == null) {
			ICIPMLAIWorkerConfig agent = mlaiworkerConfigService.update(name, org, updateBody);
			return new ResponseEntity<>(agent,HttpStatus.OK);
		}
		else if(agentPresentwithName != null && agentPresentwithName.getName().equalsIgnoreCase(name)) {
			ICIPMLAIWorkerConfig agent = mlaiworkerConfigService.update(name, org, updateBody);
			return new ResponseEntity<>(agent,HttpStatus.OK);
		}
		else if(agentPresentwithAlias!= null && agentPresentwithAlias.getName().equalsIgnoreCase(name)) {
			ICIPMLAIWorkerConfig agent = mlaiworkerConfigService.update(name, org, updateBody);
			return new ResponseEntity<>(agent,HttpStatus.OK);
		}
		else {
			return new ResponseEntity<>("Alias already exists",HttpStatus.CONFLICT);
		}
	}
	
	@GetMapping("/config/{name}/{org}")
	public ResponseEntity<ICIPMLAIWorkerConfig> getAiWorkerConfigById(@PathVariable(name = "name") String name,
			@PathVariable(name = "org") String org){
		ICIPMLAIWorkerConfig agent= mlaiworkerConfigService.getAiWorkerConfigByNameAndOrg(name, org);
		return new ResponseEntity<>(agent,HttpStatus.OK);
	}
	
	@DeleteMapping("/config/delete/{id}/{org}")
	public ResponseEntity<String> deleteAiWorkerConfig(@PathVariable(name = "id") Integer id,
			@PathVariable(name = "org") String org){
		String workerName = mlaiworkerConfigService.getConfigNameById(id);
		mlaiworkerConfigService.deleteAiWorkerConfig(id);
		mlaiworkerService.deleteAllByNameAndOrg(workerName,org);
		return ResponseEntity.ok().headers(ICIPHeaderUtil.createEntityDeletionAlert("AiWorker", id.toString()))
				.build();
	}
	
	/**
	 * -------------------------MLAIWorker----------------
	 */
	
	@GetMapping("/getAll")
	public ResponseEntity<List<ICIPMLAIWorker>> getAllAiWorkers(
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "page", required = false, defaultValue = "1") String page,
			@RequestParam(name = "size", required = false, defaultValue = "10") String size,
			@RequestParam(name = "query", required = false) String query
			){
		Pageable paginate = PageRequest.of(Integer.valueOf(page) - 1, Integer.valueOf(size));
		List<ICIPMLAIWorker> aiworkerConfigList = mlaiworkerService.getAllAiWorkers(project, paginate,query);
		return new ResponseEntity<>(aiworkerConfigList,HttpStatus.OK);
	}
	
	@GetMapping("/count")
	public ResponseEntity<Long> getAiWorkerCount(
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "query", required = false) String query
			){
		Long results= mlaiworkerService.getAiWorkerCount(project,query);
		return ResponseEntity.status(200).body(results);
	}
	
	@PostMapping( "/save")
	public ResponseEntity<ICIPMLAIWorker> saveWorker(@RequestParam(name = "project", required = true) String project,
			@RequestBody String body ){
		JSONObject reqBody= new JSONObject(body);
		ICIPMLAIWorker agent = mlaiworkerService.saveWorker(project, reqBody);
		return new ResponseEntity<>(agent,HttpStatus.OK);
	}
	
	@PostMapping( "/update/{name}/{organization}")
	public ResponseEntity<ICIPMLAIWorker> updateWorker(@PathVariable(name = "name") String name,
			@PathVariable(name = "organization") String org,
			@RequestBody String body){
		JSONObject updateBody= new JSONObject(body);
		ICIPMLAIWorker agent = mlaiworkerService.updateWorker(name, org, updateBody);
		return new ResponseEntity<>(agent,HttpStatus.OK);
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<ICIPMLAIWorker> getAiWorkerConfigById(@PathVariable(name = "id") Integer id){
			//@PathVariable(name = "org") String org){
		ICIPMLAIWorker agent= mlaiworkerService.getAiWorkerById(id);
		return new ResponseEntity<>(agent,HttpStatus.OK);
	}
	
	@GetMapping("/{name}/{org}/{task}")
	public ResponseEntity<List<ICIPMLAIWorker>> getAiWorkerByNameAndOrgAndTask(@PathVariable(name = "name") String name,
			@PathVariable(name = "org") String org,
			@PathVariable(name = "task") String task){
		List<ICIPMLAIWorker> agent= mlaiworkerService.getAiWorkerByNameAndOrgAndTask(name, org, task);
		return new ResponseEntity<>(agent,HttpStatus.OK);
	}
	
	@GetMapping("/{name}/{org}")
	public ResponseEntity<ICIPMLAIWorker> getAiWorkerByNameAndOrg(@PathVariable(name = "name") String name,
			@PathVariable(name = "org") String org){
		ICIPMLAIWorker agent= mlaiworkerService.getAiWorkerByNameAndOrg(name, org);
		return new ResponseEntity<>(agent,HttpStatus.OK);
	}
	
	@GetMapping("/setTaskDefaultVersion/{name}/{org}/{task}/{versionname}")
	public ResponseEntity<String> getAiWorkerByNameAndOrg(@PathVariable(name = "name") String name,
			@PathVariable(name = "org") String org,
			@PathVariable(name = "task") String task,
			@PathVariable(name = "versionname") String versionname){
		String status= mlaiworkerService.updateDefaultVersion(name, org, task, versionname);
		return new ResponseEntity<>(status,HttpStatus.OK);
	}
	
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<String> deleteAiWorkerTaskVersion(@PathVariable(name = "id") Integer id){
		
//		String status = mlaiworkerService.deleteAiWorkerTaskVersion(id);
//		return new ResponseEntity<>(status,HttpStatus.OK);
		mlaiworkerService.deleteAiWorkerTaskVersion(id);
		return ResponseEntity.ok().headers(ICIPHeaderUtil.createEntityDeletionAlert("AiWorker", id.toString()))
				.build();
	}

}
