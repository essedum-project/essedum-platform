/**
 * @ 2023 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.iamp.usm.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.google.gson.JsonObject;
import com.infosys.icets.ai.comm.lib.util.HeaderUtil;
import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.domain.UserProcessMapping;
import com.infosys.icets.iamp.usm.dto.UserProcessMappingDTO;
import com.infosys.icets.iamp.usm.service.impl.UserProcessServiceImpl;


@RestController
@RequestMapping("/api")
public class UserProcessMappingResource {
	
	private final Logger log = LoggerFactory.getLogger(UserProcessMappingResource.class);

	@Autowired
	private UserProcessServiceImpl userProcessService;

	@PostMapping("/UserProcessMapping")
	public ResponseEntity<?> createUserProcessMapping(
			@RequestBody UserProcessMappingDTO userRoleMapping) {
		
		if (userRoleMapping.getId() != null) {
			return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert("", "Id exists",
					"A new user process mapping cannot already have a Id")).body(null);
		}

		try {
			UserProcessMapping result = userProcessService.create(userRoleMapping);
			log.info("Request to save UserProcessMapping : {} : end");
			return ResponseEntity.created(new URI("/api/UserProcessMapping/" + result.getId()))
					.headers(HeaderUtil.createEntityCreationAlert("", result.getId().toString())).body(result);
		} catch (LeapException | URISyntaxException e) {
			return ResponseEntity.status(HttpStatus.OK).body(e.toString());
		}
		
	}



	@PutMapping("/UserProcessMapping/{id}/{activeStatus}")
	public ResponseEntity<String> updateUserStatusMapping(@PathVariable Integer id, @PathVariable Boolean activeStatus) 
	{
		log.info("Request to update Status of UserProcessMappings");
		UserProcessMapping result = userProcessService.updateStatus(id, activeStatus);
		return new ResponseEntity<>("updated User Process Mapping updated for id : " + result.getId(), HttpStatus.OK);

	}

	
	
	@GetMapping("/GetUserProcessMapping")
	
	public ResponseEntity<PageResponse<UserProcessMapping>> getAllUserMappings(@RequestParam("organization") String organization,@RequestParam("process") Optional<String> process, @RequestParam("role") Optional<String> roleMng, @RequestParam("user") Optional<String> user)	
	{
		
		 
			log.info("Request to get a page of UserProcessMappings");
			PageResponse<UserProcessMapping> pageResponse = userProcessService.getAllMappings(organization, process, roleMng, user);
			
			log.info("Request to get a page of UserProcessMappings");
			return new ResponseEntity<>(pageResponse, new HttpHeaders(), HttpStatus.OK);
				
	}

	@DeleteMapping("/UserProcessMapping/{id}")
	public ResponseEntity<?> deleteUserProcessMapping(@PathVariable Integer id) {
		userProcessService.deleteMapping(id);
		return new ResponseEntity<>(" User Process Mapping deleted for id : " + id, HttpStatus.OK);

	}
	
	@GetMapping("/UserProcessMapping/{organization}/{user}")
	public ResponseEntity<List<HashMap<String,String>>> findByUser(@PathVariable String organization,@PathVariable String user)
	{
		log.info("Request to get UserProcessMappings by logged-in user");
		List<HashMap<String,String>> result = userProcessService.findByUser(organization,user);
		return new ResponseEntity<>(result,new HttpHeaders(),HttpStatus.OK);
		
	}
	
	@GetMapping("/UserProcessMapping/UsersToDelegate/{organization}/{processKey}/{startTime}/{endTime}/{currentUser}")
	public ResponseEntity<String> findUserToDelegate(@PathVariable String organization,@PathVariable String processKey,
			@PathVariable String startTime, @PathVariable String endTime,@PathVariable String currentUser)
	{
		log.info("Request to get UserProcessMappings by logged-in user");
		JsonObject usersList = userProcessService.findAllUserToDelegate(organization, processKey, startTime, endTime,currentUser);
		return new ResponseEntity<>(usersList.toString(),new HttpHeaders(),HttpStatus.OK);
		
	}
	
	

}
