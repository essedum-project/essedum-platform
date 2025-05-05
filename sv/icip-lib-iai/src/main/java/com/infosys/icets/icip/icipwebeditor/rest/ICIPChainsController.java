/**
 * @ 2021 - 2022 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.icip.icipwebeditor.rest;

import java.util.List;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.google.gson.Gson;
import com.infosys.icets.icip.icipwebeditor.job.model.ChainObject;
import com.infosys.icets.icip.icipwebeditor.job.model.ICIPChains;
import com.infosys.icets.icip.icipwebeditor.service.IICIPChainsService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Hidden;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPChainsController.
 *
 * @author icets
 */
@RestController
@Timed
@Hidden
@RequestMapping(path = "/${icip.pathPrefix}/chain")
public class ICIPChainsController {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPChainsController.class);

	/** The i ICIP chains service. */
	@Autowired
	private IICIPChainsService iICIPChainsService;
	
	//COMMENTED AS PART OF CODE CLEANUP

//	/**
//	 * Save chain.
//	 *
//	 * @param body the body
//	 * @return the response entity
//	 */
//	@PostMapping(value = "/save", produces = "application/json")
//	public ResponseEntity<ICIPChains> saveChain(@RequestBody String body) {
//		try {
//			Gson gson = new Gson();
//			ChainObject chain = gson.fromJson(body, ChainObject.class);
//			ICIPChains job = new ICIPChains();
//			job.setDescription(chain.getJobDesc());
//			job.setJobName(chain.getJobName());
//			job.setJsonContent(gson.toJson(chain.getJsonContent()));
//			job.setOrganization(chain.getOrg());
//			job.setParallelchain(chain.getParallelchain());
//			job.setFlowjson(chain.getFlowjson());
//			return new ResponseEntity<>(iICIPChainsService.save(job), HttpStatus.OK);
//		} catch (Exception e) {
//			logger.error(e.getMessage());
//			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
//		}
//	}
//
//	/**
//	 * Update chain.
//	 *
//	 * @param jobName the job name
//	 * @param org     the org
//	 * @param body    the body
//	 * @return the response entity
//	 */
//	@PostMapping(value = "/update/{name}/{org}", produces = "application/json")
//	public ResponseEntity<ICIPChains> updateChain(@PathVariable("name") String jobName, @PathVariable("org") String org,
//			@RequestBody String body) {
//		try {
//			ICIPChains job = iICIPChainsService.findByNameAndOrganization(jobName, org);
//			Gson gson = new Gson();
//			ChainObject.InitialJsonContent chainObject = gson.fromJson(job.getJsonContent(),
//					ChainObject.InitialJsonContent.class);
//			ChainObject.ChainJobElement chainElement = gson.fromJson(new JSONObject(body).get("jsonContent").toString(), ChainObject.ChainJobElement.class);
//			chainObject.setElement(chainElement);
//			job.setJsonContent(gson.toJson(chainObject));
//			job.setFlowjson(new JSONObject(body).get("flowjson").toString());
//			return new ResponseEntity<>(iICIPChainsService.save(job), HttpStatus.OK);
//		} catch (Exception e) {
//			logger.error(e.getMessage());
//			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
//		}
//	}
//
//	/**
//	 * Update tree chain.
//	 *
//	 * @param jobName the job name
//	 * @param org     the org
//	 * @param body    the body
//	 * @return the response entity
//	 */
//	@PostMapping(value = "/update/tree/{name}/{org}", produces = "application/json")
//	public ResponseEntity<ICIPChains> updateTreeChain(@PathVariable("name") String jobName,
//			@PathVariable("org") String org, @RequestBody String body) {
//		try {
//			ICIPChains job = iICIPChainsService.findByNameAndOrganization(jobName, org);
//			job.setJsonContent(body);
//			return new ResponseEntity<>(iICIPChainsService.save(job), HttpStatus.OK);
//		} catch (Exception e) {
//			logger.error(e.getMessage());
//			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
//		}
//	}
//
//	/**
//	 * Gets the chain.
//	 *
//	 * @param org     the org
//	 * @param jobName the job name
//	 * @return the chain
//	 */
//	@GetMapping(value = "/name/{org}", produces = "application/json")
//	public ResponseEntity<ICIPChains> getChain(@PathVariable("org") String org,
//			@RequestParam(name = "jobName") String jobName) {
//		try {
//			return new ResponseEntity<>(iICIPChainsService.findByNameAndOrganization(jobName, org), HttpStatus.OK);
//		} catch (Exception e) {
//			logger.error(e.getMessage());
//			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
//		}
//	}
//
//	/**
//	 * Gets the jobs len.
//	 *
//	 * @param org the org
//	 * @return the jobs len
//	 */
//	
//	@GetMapping("/getById/{org}")
//	public ResponseEntity<Long> getJobsLen(@PathVariable(name = "org") String org) {
//		return new ResponseEntity<>( iICIPChainsService.countByOrganization(org), new HttpHeaders(), HttpStatus.OK);
//	}
//	
//	@PostMapping("/editNameAndDesc/{id}/{org}")
//	public ResponseEntity<ICIPChains> editNameAndDesc(@PathVariable(name = "org") String org,
//			@PathVariable(name = "id") String id,
//			@RequestParam String jobName,
//			@RequestParam String jobDesc) {
//		try {
//			Optional<ICIPChains> job = iICIPChainsService.findChainByID(Integer.parseInt(id));
//			ICIPChains chainjob= job.get();
//			chainjob.setDescription(jobDesc);
//			chainjob.setJobName(jobName);
//			return new ResponseEntity<>(iICIPChainsService.save(chainjob), HttpStatus.OK);
//
//		}
//		catch (Exception e) {
//			logger.error(e.getMessage());
//			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
//			// TODO: handle exception
//		}
//	}
//
//	/**
//	 * Delete job.
//	 *
//	 * @param id the id
//	 */
//	@DeleteMapping("/{id}")
//	public void deleteJob(@PathVariable(name = "id") String id) {
//		iICIPChainsService.deleteJob(Integer.parseInt(id));
//	}
//
//	/**
//	 * Gets the jobs by model.
//	 *
//	 * @param org  the org
//	 * @param page the page
//	 * @param size the size
//	 * @return the jobs by model
//	 */
//	@GetMapping("/{org}")
//	public ResponseEntity<List<ICIPChains>> getJobsByModel(@PathVariable(name = "org") String org,
//			@RequestParam(required = false, name = "page") String page,
//			@RequestParam(required = false, name = "filter") String filter,
//			@RequestParam(required = false, name = "size") String size) {
//		logger.info("Getting Jobs");
// 		List<ICIPChains> listJobs = null;
// 		if(filter.equalsIgnoreCase("undefined") || filter.isBlank() || filter.isEmpty()) {
// 			filter=null;
// 		}
//		if (page != null && !page.trim().isEmpty() && size != null && !size.trim().isEmpty()) {
//			listJobs = iICIPChainsService.getAllJobs(org, Integer.valueOf(page), Integer.valueOf(size));
//		} else {
//			listJobs = iICIPChainsService.getAllJobs(org,filter);
//		}
//		return new ResponseEntity<>(listJobs, new HttpHeaders(), HttpStatus.OK);
//	}
}
