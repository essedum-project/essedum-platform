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

import java.io.IOException;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.icets.ai.comm.lib.util.exceptions.ApiError;
import com.infosys.icets.ai.comm.lib.util.exceptions.ExceptionUtil;
import com.infosys.icets.icip.icipwebeditor.model.ICIPAgentJobs;
import com.infosys.icets.icip.icipwebeditor.model.ICIPPartialAgentJobs;
import com.infosys.icets.icip.icipwebeditor.service.IICIPAgentJobsService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Hidden;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPAgentJobsController.
 *
 * @author icets
 */
@RestController
@Timed
@Hidden
@RequestMapping(path = "/${icip.pathPrefix}/agentjobs")
public class ICIPAgentJobsController {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPAgentJobsController.class);

	/** The i ICIP jobs service. */
	@Autowired
	private IICIPAgentJobsService iICIPAgentJobsService;

	/**
	 * Gets the jobs len.
	 *
	 * @param org the org
	 * @return the jobs len
	 */
	@GetMapping("/jobsLen/{org}")
	public ResponseEntity<Long> getJobsLen(@PathVariable(name = "org") String org) {
		return new ResponseEntity<>(iICIPAgentJobsService.countByOrganization(org), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the streaming service jobs len.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the streaming service jobs len
	 */
	@GetMapping("/streamingLen/{nameStr}/{org}")
	public ResponseEntity<Long> getStreamingServiceJobsLen(@PathVariable(name = "nameStr") String name,
			@PathVariable(name = "org") String org) {
		return new ResponseEntity<>(iICIPAgentJobsService.countByCnameAndOrganization(name, org), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the jobs by model.
	 *
	 * @param name the name
	 * @param org  the org
	 * @param page the page
	 * @param size the size
	 * @return the jobs by model
	 */
	@GetMapping("/{nameStr}/{org}")
	public ResponseEntity<List<ICIPPartialAgentJobs>> getJobsByModel(@PathVariable(name = "nameStr") String name,
			@PathVariable(name = "org") String org, @RequestParam(required = false, name = "page") String page,
			@RequestParam(required = false, name = "size") String size) {
		if (name.equals("all")) {
			logger.info("Getting Jobs");
		} else {
			logger.info("Getting Jobs for Streaming Service  : {}", name);
		}
		return new ResponseEntity<>(iICIPAgentJobsService.getJobsByService(name, Integer.valueOf(page), Integer.valueOf(size), org), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the job console.
	 *
	 * @param jobId the job id
	 * @param offset the offset
	 * @param org the org
	 * @param lineno the lineno
	 * @param status the status
	 * @return the job console
	 * @throws IOException 
	 */
	@GetMapping("/console/{jobId}")
	public ResponseEntity<ICIPAgentJobs> getJobConsole(@PathVariable(name = "jobId") String jobId,
			@RequestParam(name = "offset", required = false, defaultValue = "0") int offset,
			@RequestParam(name = "org", required = true) String org,
			@RequestParam(name = "lineno", required = true) int lineno,
			@RequestParam(name = "status", required = true) String status) throws IOException {
		logger.debug("Getting Job response with log");

		return new ResponseEntity<>(iICIPAgentJobsService.findByJobIdWithLog(jobId, offset, lineno, org, status), new HttpHeaders(), HttpStatus.OK);

	}

	/**
	 * Gets the job by corelid.
	 *
	 * @param corelid the corelid
	 * @return the job by corelid
	 */
	@GetMapping("/corelid/{corelid}")
	public ResponseEntity<List<ICIPPartialAgentJobs>> getJobByCorelid(@PathVariable(name = "corelid") String corelid) {
		logger.debug("Getting Job by corelid");
		return new ResponseEntity<>(iICIPAgentJobsService.findByCorelid(corelid), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Stop job.
	 *
	 * @param jobid the jobid
	 * @return the response entity
	 */
	@GetMapping("/stopJob/{jobid}")
	public ResponseEntity<Void> stopJob(@PathVariable(name = "jobid") String jobid) {
		logger.info("Request to stop job");
		try {
			iICIPAgentJobsService.stopLocalJob(jobid);
			return new ResponseEntity<>(new HttpHeaders(), HttpStatus.OK);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			return new ResponseEntity<>(new HttpHeaders(), HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Handle all.
	 *
	 * @param ex the ex
	 * @return the response entity
	 */
	@ExceptionHandler(Exception.class)
	public ResponseEntity<Object> handleAll(Exception ex) {
		logger.error(ex.getMessage(), ex);
		Throwable rootcause = ExceptionUtil.findRootCause(ex);
		return new ResponseEntity<>( new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, rootcause.getMessage(), "error occurred").getMessage(), new HttpHeaders(),  new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, rootcause.getMessage(), "error occurred").getStatus());
	}

}
