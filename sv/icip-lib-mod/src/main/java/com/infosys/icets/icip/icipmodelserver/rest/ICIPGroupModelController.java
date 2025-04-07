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
package com.infosys.icets.icip.icipmodelserver.rest;

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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.icets.ai.comm.lib.util.ICIPHeaderUtil;
import com.infosys.icets.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.infosys.icets.ai.comm.lib.util.exceptions.ApiError;
import com.infosys.icets.ai.comm.lib.util.exceptions.ExceptionUtil;
import com.infosys.icets.icip.dataset.service.IICIPDatasetService;
import com.infosys.icets.icip.dataset.service.IICIPDatasourceService;
import com.infosys.icets.icip.dataset.service.IICIPSchemaRegistryService;
import com.infosys.icets.icip.icipmodelserver.service.IICIPPipelineModelService;
import com.infosys.icets.icip.icipwebeditor.model.ICIPGroupModel;
import com.infosys.icets.icip.icipwebeditor.service.IICIPAgentService;
import com.infosys.icets.icip.icipwebeditor.service.IICIPGroupModelService;
import com.infosys.icets.icip.icipwebeditor.service.IICIPStreamingServiceService;

import io.micrometer.core.annotation.Timed;

/**
 * The Class ICIPGroupModelController.
 *
 * @author icets
 */
@RestController
@Timed
@RequestMapping(path = "/${icip.pathPrefix}/entities")
public class ICIPGroupModelController {

	/** The Constant ENTITY_NAME. */
	private static final String ENTITY_NAME = "entities";

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPGroupModelController.class);

	/** The i ICIP model service. */
	@Autowired
	private IICIPGroupModelService iICIPModelService;

	/** The schema service. */
	@Autowired
	private IICIPSchemaRegistryService schemaService;
	
	/** The dataset service. */
	@Autowired
	private IICIPDatasetService datasetService;
	
	/** The pipeline service. */
	@Autowired
	private IICIPStreamingServiceService pipelineService;
	
	/** The datasource service. */
	@Autowired
	private IICIPDatasourceService datasourceService;
	
	/** The model service. */
	@Autowired
	private IICIPPipelineModelService modelService;
	
	/** The agent service. */
	@Autowired
	private IICIPAgentService agentService;


	/**
	 * Gets the entities.
	 *
	 * @param type the type
	 * @param org  the org
	 * @return the entities
	 */
	@GetMapping("/all/{type}")
	public ResponseEntity<List<ICIPGroupModel>> getEntities(@PathVariable(name = "type") String type,
			@RequestParam(name = "org", required = true) String org) {
		logger.info("Getting Entities by Type : {}", type);
		return new ResponseEntity<>( iICIPModelService.getAllEntitiesByOrgAndType(org, type), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the entities by group.
	 *
	 * @param entityType the entity type
	 * @param group      the group
	 * @param org        the org
	 * @return the entities by group
	 */
	@GetMapping("/all/{entityType}/{group}")
	public ResponseEntity<List<NameAndAliasDTO>> getEntitiesByGroup(@PathVariable(name = "entityType") String entityType,
			@PathVariable(name = "group") String group, @RequestParam(name = "org", required = true) String org) {
		if(entityType.equals("schema"))
			return new ResponseEntity<>(schemaService.getNameAndAlias(group, org), new HttpHeaders(), HttpStatus.OK);
		if(entityType.equals("dataset"))
			return new ResponseEntity<>(datasetService.getNameAndAlias(group, org), new HttpHeaders(), HttpStatus.OK);
		if(entityType.equals("agent"))
			return new ResponseEntity<>(agentService.getNameAndAlias(group, org), new HttpHeaders(), HttpStatus.OK);
		if(entityType.equals("datasource"))
			return new ResponseEntity<>(datasourceService.getNameAndAlias(group, org), new HttpHeaders(), HttpStatus.OK);
		if(entityType.equals("model"))
			return new ResponseEntity<>(modelService.getNameAndAlias(group, org), new HttpHeaders(), HttpStatus.OK);
		return new ResponseEntity<>(pipelineService.getNameAndAlias(group, org), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Export.
	 *
	 * @param entityType the entity type
	 * @param org        the org
	 * @param entities   the entities
	 * @return the response entity
	 */
	@PostMapping("/export/{entityType}/{org}")
	public ResponseEntity<List<List<ICIPGroupModel>>> export(@PathVariable(name = "entityType") String entityType,
			@PathVariable(name = "org") String org, @RequestBody List<String> entities) {
	
		return new ResponseEntity<>(iICIPModelService.exportGroupModel(org, entityType, entities), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Adds the entities.
	 *
	 * @param entityType the entity type
	 * @param organization the organization
	 * @param name       the name
	 * @param groups     the groups
	 * @return the response entity
	 */
	@PostMapping("/add/{entityType}/{organization}/{entity}")
	public ResponseEntity<Boolean> addEntities(@PathVariable(name = "entityType") String entityType,
			@PathVariable(name = "organization") String organization, @PathVariable(name = "entity") String name,
			@RequestBody List<String> groups) {
		logger.info("Adding Entity : {}", name);		
		return new ResponseEntity<>(iICIPModelService.save(entityType, name, organization, groups), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Delete entity.
	 *
	 * @param entityType the entity type
	 * @param entity     the entity
	 * @param org        the org
	 * @return the response entity
	 */
	@PostMapping("/delete/{entityType}/{entity}")
	public ResponseEntity<Void> deleteEntity(@PathVariable(name = "entityType") String entityType,
			@PathVariable(name = "entity") String entity, @RequestBody(required = true) String org) {
		logger.info("deleting entity : {}", entity);
		iICIPModelService.delete(entity, entityType, org);
		return ResponseEntity.ok().headers(ICIPHeaderUtil.createEntityDeletionAlert(ENTITY_NAME, entity)).build();
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

}