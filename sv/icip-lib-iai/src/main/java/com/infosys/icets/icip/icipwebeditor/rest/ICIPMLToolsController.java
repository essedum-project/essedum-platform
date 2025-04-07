package com.infosys.icets.icip.icipwebeditor.rest;

import java.io.IOException;
import java.net.URISyntaxException;
import java.security.InvalidKeyException;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

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
import com.infosys.icets.icip.icipwebeditor.model.ICIPMLTools;
import com.infosys.icets.icip.icipwebeditor.service.ICIPMLToolsService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Hidden;

@RestController
@Timed
@Hidden
@RequestMapping(path = "/${icip.pathPrefix}/mltools")
public class ICIPMLToolsController {
	
	@Autowired
	ICIPMLToolsService mlToolsService;
	
	@GetMapping("/getAllTools")
	public ResponseEntity<List<ICIPMLTools>> getAllMLTools(
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "page", required = false) String page,
			@RequestParam(name = "size", required = false) String size,
			@RequestParam(name = "query", required = false) String query,
			@RequestParam(name = "category", required = false) List<String> category) {
		
		if ((page == null || page.isEmpty()) || (size == null || size.isEmpty())){ 
			List<ICIPMLTools> mlToolsList = mlToolsService.getAllMlTools(project, null, query, category);
			return new ResponseEntity<>(mlToolsList, HttpStatus.OK);
		}
		Pageable paginate = PageRequest.of(Integer.valueOf(page) - 1, Integer.valueOf(size));
		List<ICIPMLTools> mlToolsList = mlToolsService.getAllPaginatedMlTools(project, paginate, query, category);
		return new ResponseEntity<>(mlToolsList, HttpStatus.OK);
	}
	
	@GetMapping("/list/count")
	public ResponseEntity<Long> getMlToolsCount(
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "query", required = false) String query,
			@RequestParam(name = "category", required = false) List<String> category
			){
		Long results= mlToolsService.getMLToolsCount(project,query, category);
		return ResponseEntity.status(200).body(results);
	}
	
	@PostMapping( "/save")
	public ResponseEntity<?> save(@RequestParam(name = "project", required = true) String project,
			@RequestBody String body ){
		JSONObject reqBody= new JSONObject(body);
		Boolean isAliasExist = mlToolsService.checkAlias(reqBody.getString("alias"), project);
		if(isAliasExist) {
			return ResponseEntity.status(500).body("Tool name already exist");
		}
		else {
			ICIPMLTools mltool = mlToolsService.saveTool(project, reqBody);
			return new ResponseEntity<>(mltool,HttpStatus.OK);
		}
	}
	
	@PostMapping( "/update/{name}/{organization}")
	public ResponseEntity<ICIPMLTools> update(@PathVariable(name = "name") String name,
			@PathVariable(name = "organization") String org,
			@RequestBody String body){
		JSONObject updateBody= new JSONObject(body);
		ICIPMLTools tool = mlToolsService.updateTool(name, org, updateBody);
		return new ResponseEntity<>(tool,HttpStatus.OK);
	}
	
	@GetMapping("/{name}/{org}")
	public ResponseEntity<ICIPMLTools> getMlToolByName(@PathVariable(name = "name") String name,
			@PathVariable(name = "org") String org){
		ICIPMLTools agent= mlToolsService.getMLToolByName(name, org);
		return new ResponseEntity<>(agent,HttpStatus.OK);
	}
	
	@DeleteMapping("/delete/{name}")
	public ResponseEntity<String> deleteMlToolByName(@PathVariable(name = "name") String name,
	@RequestParam(name= "org") String org){
		mlToolsService.deleteMlToolByName(name, org);
		return ResponseEntity.ok().headers(ICIPHeaderUtil.createEntityDeletionAlert("mltool", name))
				.build();
	}
	
	@GetMapping("/getAllToolCategory/{org}")
	public ResponseEntity<Set<String>> getUniqueCategories(@PathVariable(name = "org") String org){
		return new ResponseEntity<>(mlToolsService.getUniqueCategories(org),HttpStatus.OK);
	}
}
