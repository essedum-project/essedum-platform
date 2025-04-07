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
package com.infosys.icets.icip.icipwebeditor.job.rest;

import java.io.IOException;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.google.gson.Gson;
import com.infosys.icets.icip.icipwebeditor.job.config.InternalJobListConfig;
import com.infosys.icets.icip.icipwebeditor.job.model.ICIPInternalJobs;
import com.infosys.icets.icip.icipwebeditor.job.model.ICIPPartialInternalJobs;
import com.infosys.icets.icip.icipwebeditor.job.service.IICIPInternalJobsService;

import io.micrometer.core.annotation.Timed;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPInternalJobsController.
 *
 * @author icets
 */
@RestController
@Timed
@RequestMapping(path = "/${icip.pathPrefix}/internaljob")
public class ICIPInternalJobsController {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPInternalJobsController.class);

	/** The i ICIP jobs service. */
	@Autowired
	private IICIPInternalJobsService iICIPJobsService;

	/** The internal job list config. */
	@Autowired
	private InternalJobListConfig internalJobListConfig;

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
	public ResponseEntity<ICIPInternalJobs> getJobConsole(@PathVariable(name = "jobId") String jobId,
			@RequestParam(name = "offset", required = false, defaultValue = "0") int offset,
			@RequestParam(name = "org", required = true) String org,
			@RequestParam(name = "lineno", required = true) int lineno,
			@RequestParam(name = "status", required = true) String status) throws IOException {
		logger.debug("Getting Job console");
		return new ResponseEntity<>(iICIPJobsService.findByJobIdWithLog(jobId, offset, lineno, org, status), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the job .
	 *
	 * @param name the name
	 * @param org  the org
	 * @param page the page
	 * @param size the size
	 * @return the job console
	 */
	@GetMapping("/dataset/{name}/{org}")
	public ResponseEntity<List<ICIPPartialInternalJobs>> getJobByDataset(@PathVariable(name = "name") String name,
			@PathVariable(name = "org") String org, @RequestParam(required = false, name = "page") String page,
			@RequestParam(required = false, name = "size") String size) {
		logger.debug("Getting Job response by dataset");
		return new ResponseEntity<>(iICIPJobsService.findByDatasetName(name, org, Integer.valueOf(page),
				Integer.valueOf(size)), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the job by job name.
	 * 
	 * @param name the name
	 * @param org  the org
	 * @param page the page
	 * @param size the size
	 * @return the job by job name
	 */
	@GetMapping("/jobname/{name}/{org}")
	public ResponseEntity<List<ICIPPartialInternalJobs>> getJobByJobName(@PathVariable(name = "name") String name,
			@PathVariable(name = "org") String org, @RequestParam(required = false, name = "page") String page,
			@RequestParam(required = false, name = "size") String size) {
		logger.debug("Getting Job response by jobname");
		return new ResponseEntity<>(iICIPJobsService.findByJobName(name, org, Integer.valueOf(page),
				Integer.valueOf(size)), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the job console.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the job console
	 */
	@GetMapping("/dataset/len/{name}/{org}")
	public ResponseEntity<Long> getJobLenByDataset(@PathVariable(name = "name") String name,
			@PathVariable(name = "org") String org) {
		logger.debug("Getting length by dataset");
		return new ResponseEntity<>( iICIPJobsService.countByDatasetAndOrganization(name, org), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the job console.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the job console
	 */
	@GetMapping("/jobname/len/{name}/{org}")
	public ResponseEntity<Long> getJobLenByJobName(@PathVariable(name = "name") String name,
			@PathVariable(name = "org") String org) {
		logger.debug("Getting length by jobname");
		return new ResponseEntity<>(iICIPJobsService.countByJobNameAndOrganization(name, org), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the all internal jobs.
	 *
	 * @return the all internal jobs
	 */
	@GetMapping("/all")
	public ResponseEntity<String> getAllInternalJobs() {
		logger.debug("getting all internal jobs");
		return new ResponseEntity<>(new Gson().toJson(internalJobListConfig.getJobDetails()), HttpStatus.OK);
	}

	/**
	 * Gets the job .
	 *
	 * @param name the name
	 * @param jobName the job name
	 * @param org  the org
	 * @param page the page
	 * @param size the size
	 * @return the job console
	 */
	@GetMapping("/macrobase/{name}/{jobName}/{org}")
	public ResponseEntity<List<ICIPPartialInternalJobs>> getJobByDatasetMacrobase(
			@PathVariable(name = "name") String name, @PathVariable(name = "jobName") String jobName,
			@PathVariable(name = "org") String org, @RequestParam(required = false, name = "page") String page,
			@RequestParam(required = false, name = "size") String size) {
		logger.debug("Getting Job response by dataset");
		return new ResponseEntity<>(iICIPJobsService.findByDatasetNameAndJobName(name, jobName, org,
				Integer.valueOf(page), Integer.valueOf(size)), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the job console.
	 *
	 * @param name the name
	 * @param org  the org
	 * @param jobName the job name
	 * @return the job console
	 */
	@GetMapping("/macrobase/len/{name}/{jobName}/{org}")
	public ResponseEntity<Long> getJobLenByDatasetMacrobase(@PathVariable(name = "name") String name,
			@PathVariable(name = "org") String org, @PathVariable(name = "jobName") String jobName) {
		logger.debug("Getting length by dataset");
		return new ResponseEntity<>(iICIPJobsService.countByDatasetAndJobNameAndOrganization(name, jobName, org), new HttpHeaders(), HttpStatus.OK);
	}

}
