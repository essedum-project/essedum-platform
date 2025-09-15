/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

package com.lfn.icip.icipmodelserver.rest;

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

import com.lfn.ai.comm.lib.util.ICIPHeaderUtil;
import com.lfn.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.lfn.ai.comm.lib.util.exceptions.ApiError;
import com.lfn.ai.comm.lib.util.exceptions.ExceptionUtil;
import com.lfn.icip.dataset.service.IICIPDatasetService;
import com.lfn.icip.dataset.service.IICIPDatasourceService;
import com.lfn.icip.dataset.service.IICIPSchemaRegistryService;
import com.lfn.icip.icipmodelserver.service.IICIPPipelineModelService;
import com.lfn.icip.icipwebeditor.model.ICIPGroupModel;
import com.lfn.icip.icipwebeditor.service.IICIPAgentService;
import com.lfn.icip.icipwebeditor.service.IICIPGroupModelService;
import com.lfn.icip.icipwebeditor.service.IICIPStreamingServiceService;

import io.micrometer.core.annotation.Timed;

/**
 * The Class ICIPGroupModelController.
 *
 * @author essedum
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