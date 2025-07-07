/**
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
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.google.gson.Gson;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.exceptions.ApiError;
import com.infosys.icets.ai.comm.lib.util.exceptions.ExceptionUtil;
import com.infosys.icets.icip.icipwebeditor.model.ICIPStreamingServices;
import com.infosys.icets.icip.icipwebeditor.service.IICIPStreamingServiceService;
import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPPipelineService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Hidden;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPPipelineController.
 *
 * @author icets
 */
@RestController
@Timed
@Hidden
@RequestMapping("/${icip.pathPrefix}/service/v1/pipeline")
public class ICIPPipelineNewController {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPPipelineNewController.class);

	/** The pipeline service. */
	@Autowired
	private ICIPPipelineService pipelineService;

	/** The streaming services service. */
	@Autowired
	private IICIPStreamingServiceService streamingServicesService;

	/**
	 * Trigger pipeline.
	 *
	 * @param cname  the cname
	 * @param org    the org
	 * @param offset the offset
	 * @param params the params
	 * @return the response entity
	 */
	@GetMapping(value = "/run/{cname}/{org}", produces = "application/json")
	public ResponseEntity<?> triggerPipeline(@PathVariable(name = "cname") String cname,
			@PathVariable(name = "org") String org, @RequestParam("offset") int offset,
			@RequestParam(name = "param", required = false) String params,
			@RequestParam(name = "datasourceName", required = false) String datasourceName) {
		ICIPStreamingServices ss = streamingServicesService.getICIPStreamingServices(cname, org);
		return pipelineService.createJob(ss.getType(), cname, ss.getAlias(), org, "local", params,
				ICIPUtils.generateCorrelationId(), offset,datasourceName,"");
	}

	/**
	 * Run pipeline.
	 *
	 * @param jobType the runtime
	 * @param cname   the cname
	 * @param org     the org
	 * @param runtime the is local
	 * @param params  the params
	 * @param offset the offset
	 * @param alias the alias
	 * @return the response entity
	 */
//	@GetMapping(value = "/execute")
//	public ResponseEntity<?> runPipeline(@RequestParam(name = "org", required = true) String org,
//			@RequestParam(name = "name", required = true) String cname,
//			@RequestParam(name = "datasource", required = true) String datasource) {
//		logger.info("Submitting the Pipeline to Job Server");
//		return pipelineService.createNewJob(cname,org,ICIPUtils.generateCorrelationId(),datasource);
//	}

	
	@GetMapping(value = "/run/{jobType}/{cname}/{org}/{runtime}")
	public ResponseEntity<?> runPipeline(@PathVariable(name = "jobType") String jobType,
			@PathVariable(name = "cname") String cname, @PathVariable(name = "org") String org,
			@PathVariable(name = "runtime") String runtime,
			@RequestParam(name = "param", required = false) String params, @RequestParam(name = "offset", required = false) int offset,
			@RequestParam(name = "alias", required = false) String alias,
			@RequestParam(name = "datasource", required = false) String datasource) {
		logger.info("Submitting the Pipeline to Job Server [isLocal : {}]", runtime);
		return pipelineService.createJob(jobType, cname, alias, org, runtime, params, ICIPUtils.generateCorrelationId(),
				offset,datasource,"");
	}
	
	/**
	 * Run agent.
	 *
	 * @param runtime the runtime
	 * @param cname   the cname
	 * @param org     the org
	 * @param offset the offset
	 * @param params  the params
	 * @return the response entity
	 */
	@GetMapping(value = "/runAgent/{runtime}/{cname}/{org}")
	public ResponseEntity<?> runAgent(@PathVariable(name = "runtime") String runtime,
			@PathVariable(name = "cname") String cname, @PathVariable(name = "org") String org,
			@RequestParam("offset") int offset, @RequestParam(name = "param", required = false) String params) {
		logger.info("Submitting the Agent Job");
		return pipelineService.createAgentJob(runtime, cname, org, params, ICIPUtils.generateCorrelationId(), offset);
	}

	/**
	 * Gets the pipeline.
	 *
	 * @param cname the cname
	 * @param org   the org
	 * @return the pipeline
	 */
	@GetMapping(value = "/get/{org}/{cname}", produces = "application/json")
	public @ResponseBody ResponseEntity<Object> getPipeline(@PathVariable(name = "cname") String cname,
			@PathVariable(name = "org") String org) {
		logger.info("Getting the Pipeline : {}", cname);
		return new ResponseEntity<>( pipelineService.populateSchemaDetails(pipelineService.getJson(cname, org), org), HttpStatus.OK);
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
		return new ResponseEntity<>(new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, rootcause.getMessage(), "error occurred").getMessage(), new HttpHeaders(), new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, rootcause.getMessage(), "error occurred").getStatus());
	}

	/**
	 * Gets the pipeline as JSON.
	 *
	 * @param pipelines the pipelines
	 * @param org       the org
	 * @return the pipeline
	 */
	@GetMapping(value = "/getPipelines/{org}", produces = "application/json")
	public @ResponseBody ResponseEntity<?> exportPipelines(@RequestParam(name = "cname") List<String> pipelines,
			@PathVariable(name = "org") String org) {
		return new ResponseEntity<>(new Gson().toJson(pipelineService.exportPipelines(org, pipelines)), HttpStatus.OK);
	}
}
