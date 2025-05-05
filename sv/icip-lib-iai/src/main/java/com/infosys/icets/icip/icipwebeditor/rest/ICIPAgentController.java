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

import java.net.URI;
import java.net.URISyntaxException;
import java.sql.SQLException;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.icets.ai.comm.lib.util.ICIPHeaderUtil;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.exceptions.ApiError;
import com.infosys.icets.ai.comm.lib.util.exceptions.ExceptionUtil;
import com.infosys.icets.icip.icipwebeditor.model.ICIPAgents;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPStreamingServicesDTO;
import com.infosys.icets.icip.icipwebeditor.service.IICIPAgentService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Hidden;

// TODO: Auto-generated Javadoc
/**
 * The Class ICIPAgentController.
 */
@RestController
@Timed
@Hidden
@RequestMapping(path = "/${icip.pathPrefix}/agents")
public class ICIPAgentController {

	/** The Constant ENTITY_NAME. */
	private static final String ENTITY_NAME = "agents";

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPAgentController.class);

	/** The streaming services service. */
	@Autowired
	private IICIPAgentService agentService;

	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;
	
	
	//COMMENTED AS PART OF CODE CLEANUP

	/**
	 * Gets the all pipelines.
	 *
	 * @return the all pipelines
	 */
//	@GetMapping(path = "/allPipelines")
//	public ResponseEntity<List<ICIPAgents>> getAllAgents() {
//		return new ResponseEntity<>(agentService.getAllAgents(), HttpStatus.OK);
//	}
//
//	/**
//	 * Gets the all pipelines by org.
//	 *
//	 * @param org the org
//	 * @return the all pipelines by org
//	 */
//	@GetMapping(path = "/allPipelinesByOrg")
//	public ResponseEntity<List<ICIPAgents>> getAllAgentsByOrg(@RequestParam(name = "org") String org) {
//		return new ResponseEntity<>(agentService.getAllAgentsByOrg(org), HttpStatus.OK);
//	}
//
//	/**
//	 * Gets the streaming services.
//	 *
//	 * @param id the id
//	 * @return the streaming services
//	 */
//	@GetMapping("/{id}")
//	public ResponseEntity<ICIPAgents> getAgent(@PathVariable(name = "id") Integer id) {
//		ICIPAgents agents = agentService.findOne(id);
//		logger.info("Fetching streaming services by id : {} ", id);
//		return new ResponseEntity<>(agents, new HttpHeaders(), HttpStatus.OK);
//	}
//
//	/**
//	 * Gets the streaming services.
//	 *
//	 * @param name the name
//	 * @param org  the org
//	 * @return the streaming services
//	 */
//	@GetMapping("/{nameStr}/{org}")
//	public ResponseEntity<ICIPAgents> getStreamingServices(@PathVariable(name = "nameStr") String name,
//			@PathVariable(name = "org") String org) {
//		logger.info("Fetching streaming services by name : {}-{}", name, org);
//		ICIPAgents agents = agentService.getICIPAgent(name, org);
//		return new ResponseEntity<>(agents, new HttpHeaders(), HttpStatus.OK);
//	}
//
//	/**
//	 * Gets the streaming services by group.
//	 *
//	 * @param group  the group
//	 * @param org    the org
//	 * @param page   the page
//	 * @param size   the size
//	 * @param search the search
//	 * @return the streaming services by group
//	 */
//	@GetMapping("/all/{group}")
//	public ResponseEntity<List<ICIPAgents>> getStreamingServicesByGroup(@PathVariable(name = "group") String group,
//			@RequestParam(required = true, name = "org") String org,
//			@RequestParam(name = "page", defaultValue = "0", required = false) String page,
//			@RequestParam(name = "size", defaultValue = "12", required = false) String size,
//			@RequestParam(name = "search", required = false) String search) {
//		long startTime = System.currentTimeMillis();
//		if (search == null || search.trim().isEmpty()) {
//			logger.info("Time for fetching pipelines: {}", (System.currentTimeMillis() - startTime));
//
//			return new ResponseEntity<>(agentService.getAgentsByGroupAndOrg(group, org, Integer.parseInt(page), Integer.parseInt(size)), new HttpHeaders(), HttpStatus.OK);
//		} else {
//			logger.info("Time for fetching pipelines: {}", (System.currentTimeMillis() - startTime));
//
//			return new ResponseEntity<>( agentService.getAgentsByGroupAndOrgAndSearch(group, org, search, Integer.parseInt(page),
//					Integer.parseInt(size)), new HttpHeaders(), HttpStatus.OK);
//		}
//	}
//
//	/**
//	 * Gets the streaming services len by group.
//	 *
//	 * @param group  the group
//	 * @param org    the org
//	 * @param search the search
//	 * @return the streaming services len by group
//	 */
//	@GetMapping("/all/len/{group}/{org}")
//	public ResponseEntity<Long> getStreamingServicesLenByGroup(@PathVariable(name = "group") String group,
//			@PathVariable(name = "org") String org, @RequestParam(name = "search", required = false) String search) {
//		long startTime = System.currentTimeMillis();
//		Long len;
//		if (search == null || search.trim().isEmpty()) {
//			len = agentService.getAgentsLenByGroupAndOrg(group, org);
//		} else {
//			len = agentService.getAgentsLenByGroupAndOrgAndSearch(group, org, search);
//		}
//		long endTime = System.currentTimeMillis();
//		logger.info("Time for fetching pipelines length: {}", (endTime - startTime));
//		return new ResponseEntity<>(len, new HttpHeaders(), HttpStatus.OK);
//	}
//
//	/**
//	 * Creates the streaming services.
//	 *
//	 * @param streamingServicesDTO the streaming services DTO
//	 * @param org                  the org
//	 * @return the response entity
//	 * @throws URISyntaxException the URI syntax exception
//	 * @throws SQLException       the SQL exception
//	 */
//	@PostMapping("/add")
//	public ResponseEntity<ICIPAgents> createAgent(@RequestBody ICIPStreamingServicesDTO streamingServicesDTO,
//			@RequestAttribute(required = false, name = "organization") String org)
//			throws URISyntaxException, SQLException {
//		logger.info("Creating Streaming Service : {}", streamingServicesDTO.getAlias());
//		streamingServicesDTO.setCreatedBy(ICIPUtils.getUser(claim));
//		ModelMapper modelmapper = new ModelMapper();
//		ICIPAgents streamingServices = modelmapper.map(streamingServicesDTO, ICIPAgents.class);
//		ICIPAgents result = agentService.save(streamingServices);
//		return ResponseEntity.created(new URI("/agents/" + result.getCid()))
//				.headers(ICIPHeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getCid().toString()))
//				.body(result);
//	}
//
//	/**
//	 * Update streaming services.
//	 *
//	 * @param streamingServicesDTO the streaming services DTO
//	 * @param org                  the org
//	 * @return the response entity
//	 * @throws URISyntaxException the URI syntax exception
//	 * @throws SQLException       the SQL exception
//	 */
//	@PutMapping("/update")
//	public ResponseEntity<ICIPAgents> updateStreamingServices(
//			@RequestBody ICIPStreamingServicesDTO streamingServicesDTO,
//			@RequestAttribute(required = false, name = "organization") String org)
//			throws URISyntaxException, SQLException {
//		if (streamingServicesDTO.getCid() == null) {
//			return createAgent(streamingServicesDTO, org);
//		}
//		streamingServicesDTO.setLastmodifiedby(ICIPUtils.getUser(claim));
//		logger.info("Updating streaming service : {}", streamingServicesDTO.getAlias());
//		ModelMapper modelmapper = new ModelMapper();
//		ICIPAgents streamingServices = modelmapper.map(streamingServicesDTO, ICIPAgents.class);
//		ICIPAgents result = agentService.update(streamingServices);
//		return ResponseEntity.ok()
//				.headers(ICIPHeaderUtil.createEntityUpdateAlert(ENTITY_NAME, streamingServices.getCid().toString()))
//				.body(result);
//	}
//
//	/**
//	 * Delete streaming services.
//	 *
//	 * @param id the id
//	 * @return the response entity
//	 * @throws SQLException the SQL exception
//	 */
//	@DeleteMapping("/delete/{id}")
//	public ResponseEntity<Void> deleteAgent(@PathVariable(name = "id") Integer id) throws SQLException {
//		agentService.delete(id);
//		logger.info("Deleting agent by Id : {}", id);
//		return ResponseEntity.ok().headers(ICIPHeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString()))
//				.build();
//	}
//
//	/**
//	 * Handle all.
//	 *
//	 * @param ex the ex
//	 * @return the response entity
//	 */
//	@ExceptionHandler(Exception.class)
//	public ResponseEntity<Object> handleAll(Exception ex) {
//		logger.error(ex.getMessage(), ex);
//		Throwable rootcause = ExceptionUtil.findRootCause(ex);
//		ApiError apiError = new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, rootcause.getMessage(), "error occurred");
//		return new ResponseEntity<>(apiError.getMessage(), new HttpHeaders(), apiError.getStatus());
//	}
//
//	/**
//	 * Gets the all pipelines names by org.
//	 *
//	 * @param org the org
//	 * @return the all pipelines by org
//	 */
//	@GetMapping(path = "/allPipelineNames")
//	public ResponseEntity<List<String>> getAllPipelineNamesByOrg(@RequestParam(name = "org") String org) {
//		List<String> pipelines = agentService.getAllAgentNamesByOrg(org);
//		return new ResponseEntity<>(pipelines, HttpStatus.OK);
//	}
}
