/* @ 2021 - 2022 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.icip.adapter.rest;

import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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

import com.infosys.icets.icip.adapter.service.MlInstancesService;
import com.infosys.icets.icip.dataset.model.MlInstance;

import io.micrometer.core.annotation.Timed;

/**
 * The Class MlInstancesController.
 *
 * @author icets
 */
@RestController
@Timed
@RequestMapping("/${icip.pathPrefix}/mlinstances")
@RefreshScope
public class MlInstancesController {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(MlInstancesController.class);

	@Autowired
	MlInstancesService mlInstancesService;

	@PostMapping("/add")
	public ResponseEntity<MlInstance> createMlInstance(@RequestBody MlInstance mlInstance)
			throws NoSuchAlgorithmException {
		logger.info("creating MlInstance:{}", mlInstance.getName());
		return new ResponseEntity<>(mlInstancesService.save(mlInstance), new HttpHeaders(), HttpStatus.OK);
	}

	@PostMapping("/update")
	public ResponseEntity<MlInstance> updateMlAdapter(@RequestBody MlInstance mlInstance)
			throws NoSuchAlgorithmException {
		logger.info("updating MlInstance:{}", mlInstance.getName());
		return new ResponseEntity<>(mlInstancesService.updateMlInstance(mlInstance), new HttpHeaders(), HttpStatus.OK);
	}

	/* Fetches MlInstances By Name and Organization */
	@GetMapping("/getMlInstanceByNameAndOrganization/{name}/{org}")
	public ResponseEntity<MlInstance> getMlAdapteByNameAndOrganization(
			@PathVariable(name = "name", required = true) String name,
			@PathVariable(name = "org", required = true) String org) {
		return new ResponseEntity<>(mlInstancesService.getMlInstanceByNameAndOrganization(name, org), new HttpHeaders(),
				HttpStatus.OK);
	}

	/* Fetches MlInstance Filters By Organization */
	@GetMapping("/getFiltersByOrganization/{org}")
	public ResponseEntity<Map<String, Object>> getFiltersByOrganization(
			@PathVariable(name = "org", required = true) String org) {
		logger.info("fetching MlInstance Filters by org:{}", org);
		return new ResponseEntity<Map<String, Object>>(mlInstancesService.getFiltersByOrganization(org),
				new HttpHeaders(), HttpStatus.OK);
	}

	@DeleteMapping("/delete/{name}/{org}")
	public ResponseEntity<Map<String, String>> deleteMlInstanceByNameAndOrganization(
			@PathVariable(name = "name", required = true) String name,
			@PathVariable(name = "org", required = true) String org) {
		logger.info("deleting MlInstance:{}", name);
		return new ResponseEntity<Map<String, String>>(
				mlInstancesService.deleteMlInstanceByNameAndOrganization(name, org), new HttpHeaders(), HttpStatus.OK);
	}
	
	/* Fetches MlInstances By Name and Organization */
	@GetMapping("/getMlInstanceNamesByAdapterNameAndOrganization/{adapterName}/{org}")
	public ResponseEntity<List<String>> getMlInstanceByAdapterNameAndOrganization(
			@PathVariable(name = "adapterName", required = true) String adapterName,
			@PathVariable(name = "org", required = true) String org) {
		return new ResponseEntity<>(mlInstancesService.getMlInstanceNamesByAdapterNameAndOrganization(adapterName, org), new HttpHeaders(),
				HttpStatus.OK);
	}
	
	@GetMapping("/getMlInstanceNamesByOrganization/{org}")
	public ResponseEntity<List<String>> getMlInstanceNamesByOrganization(
			@PathVariable(name = "org", required = true) String org) {
		return new ResponseEntity<>(mlInstancesService.getMlInstanceNamesByOrganization(org), new HttpHeaders(),
				HttpStatus.OK);
	}
	
	@GetMapping("/getMethodsByInstanceAndOrganization/{instanceName}/{org}")
	public ResponseEntity<Map<String, Object>> getMethodNamesByInstanceAndOrganization(
			@PathVariable(name = "instanceName", required = true) String instanceName,
			@PathVariable(name = "org", required = true) String org) {
		return new ResponseEntity<>(mlInstancesService.getMethodsByInstanceAndOrganization(instanceName, org),
				new HttpHeaders(), HttpStatus.OK);
	}
	
	@GetMapping("/getMlInstancesBySpecTemDomNameAndOrg/{spectemplatedomainname}/{org}")
	public ResponseEntity<List<MlInstance>> getMlInstancesBySpecTemDomNameAndOrg(
			@PathVariable(name = "spectemplatedomainname", required = true) String spectemplatedomainname,
			@PathVariable(name = "org", required = true) String org) {
		logger.info("fetching MlInstances for spectemplatedomainname:{}", spectemplatedomainname);
		return new ResponseEntity<>(mlInstancesService.getMlInstanceBySpecTemDomNameAndOrg(spectemplatedomainname, org),
				new HttpHeaders(), HttpStatus.OK);
	}

	@GetMapping("/changeOrderBySpecTemDomNameAndInstancNameAndOrg/{spectemplatedomainname}/{instanceName}/{orderPriority}/{org}")
	public ResponseEntity<List<MlInstance>> changeOrderBySpecTemDomNameAndInstancNameAndOrg(
			@PathVariable(name = "spectemplatedomainname", required = true) String spectemplatedomainname,
			@PathVariable(name = "instanceName", required = true) String instanceName,
			@PathVariable(name = "orderPriority", required = true) Integer orderPriority,
			@PathVariable(name = "org", required = true) String org) {
		logger.info("Change Order Priority for spectemplatedomainname:{},instanceName:{}", spectemplatedomainname,
				instanceName);
		return new ResponseEntity<>(mlInstancesService.changeOrderPriorityBySpecTemDomNameAndInstancNameAndOrg(
				spectemplatedomainname, instanceName, orderPriority, org), new HttpHeaders(), HttpStatus.OK);
	}
	
	//Pagenition logic for implementations
	
	@GetMapping("/getMlInstanceCount/{org}")
	public ResponseEntity<Long> getMlAdaptesByOrganizatioCount(
			@PathVariable(name = "org", required = true) String org,
			@RequestParam(name = "adaptername", required = false) String adaptername,
			@RequestParam(name = "connection", required = false) String connection,
			@RequestParam(name = "query", required = false) String query) {
		logger.info("fetching MlInstance for org:{}", org);
		return new ResponseEntity<>(mlInstancesService.getMlInstanceCountByOrganization(org,adaptername, connection, query), new HttpHeaders(),
				HttpStatus.OK);
	}

	
	@GetMapping("/getMlInstanceByOrganization/{org}")
	public ResponseEntity<List<MlInstance>> getMlAdaptesByOrganization(
			@PathVariable(name = "org", required = true) String org,
			@RequestParam(name = "adaptername", required = false) String adaptername,
			@RequestParam(name = "connection", required = false) String connection,
			@RequestParam(name = "query", required = false) String query,
		    @RequestParam(name = "page", required = false) Integer page,
		    @RequestParam(name = "size",required = false) Integer size) {
		logger.info("fetching MlInstance for org:{}", org);
		Pageable pageable = (page==null||size==null) ? null : PageRequest.of(Math.max(page - 1, 0), size);
		return new ResponseEntity<>(mlInstancesService.getMlInstanceByOrganization(org, adaptername, connection, query, pageable), new HttpHeaders(),
				HttpStatus.OK);
	}

}
