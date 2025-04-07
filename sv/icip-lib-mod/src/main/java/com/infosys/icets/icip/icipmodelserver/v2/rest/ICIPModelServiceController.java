/**
 * @ 2020 - 2021 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.icip.icipmodelserver.v2.rest;

import java.io.IOException;
import java.text.ParseException;
import java.util.List;

import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.icets.icip.icipmodelserver.model.ICIPPipelineModel;
import com.infosys.icets.icip.icipmodelserver.v2.model.dto.ICIPPolyAIRequestWrapper;
import com.infosys.icets.icip.icipmodelserver.v2.model.dto.ICIPPolyAIResponseWrapper;
import com.infosys.icets.icip.icipmodelserver.v2.service.impl.ICIPModelPluginsService;
import com.infosys.icets.icip.icipwebeditor.model.ICIPMLFederatedEndpoint;
import com.infosys.icets.icip.icipwebeditor.model.ICIPMLFederatedModel;

import io.micrometer.core.annotation.Timed;

import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;
import com.infosys.icets.icip.dataset.service.IICIPDatasourceService;


// TODO: Auto-generated Javadoc
/**
 * The Class ICIPPipelineModelController.
 *
 * @author icets
 */
@RestController
@Timed
@RequestMapping(path = "/${icip.pathPrefix}/modelservice")
public class ICIPModelServiceController {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPModelServiceController.class);

	@Autowired
	private ICIPModelPluginsService modelPluginService;
	
	@Autowired
	private IICIPDatasourceService dsService;
	/**
	 * Gets the types.
	 *
	 * @param page the page
	 * @param size the size
	 * @return the types
	 */
	@GetMapping("types")
	public ResponseEntity<String> getTypes(
			@RequestParam(name = "page", defaultValue = "0", required = false) String page,
			@RequestParam(name = "size", defaultValue = "12", required = false) String size) {
		return ResponseEntity.ok().header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON.toString()).body(
				modelPluginService.getModelServiceJson(Integer.parseInt(page), Integer.parseInt(size)).toString());
	}

	@PostMapping("listRegisteredModels")
	public ResponseEntity<ICIPPolyAIResponseWrapper> listRegisteredModels(@RequestBody ICIPPolyAIRequestWrapper request) throws IOException, JSONException, LeapException, Exception {
		logger.info("List Registered Models");
		JSONObject requestJSON = new JSONObject(request.getRequest());
		return ResponseEntity.ok().header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON.toString())
				.body(modelPluginService.getModelService(dsService.getDatasource(requestJSON.getString("datasource"), requestJSON.getString("org")).getType()).listRegisteredModel(request));	}

	
	@PostMapping("getRegisteredModel")
	public ResponseEntity<ICIPPolyAIResponseWrapper> getRegisteredModel(@RequestBody ICIPPolyAIRequestWrapper request)throws IOException, JSONException, LeapException, Exception {
		logger.info("Getting Registered Model");
		JSONObject requestJSON = new JSONObject(request.getRequest());
		return ResponseEntity.ok().header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON.toString())
				.body(modelPluginService.getModelService(dsService.getDatasource(requestJSON.getString("datasource"), requestJSON.getString("org")).getType()).getRegisteredModel(request));
	}

	
	@PostMapping("renameRegisteredModel")
	public ResponseEntity<ICIPPipelineModel> renameRegisteredModel() {
		logger.info("Getting Model Servers");
//			return new ResponseEntity<>(modelServerService.findAll(), new HttpHeaders(), HttpStatus.OK);
		return null;
	}

	// TODO implementation
	@PostMapping("updateRegisteredModel")
	public ResponseEntity<ICIPPipelineModel> updateRegisteredModel() {
		logger.info("Getting Model Servers");
//			return new ResponseEntity<>(modelServerService.findAll(), new HttpHeaders(), HttpStatus.OK);
		return null;
	}

	// TODO implementation
	@PostMapping("deleteRegisteredModel")
	public ResponseEntity<ICIPPipelineModel> deleteRegisteredModel() {
		logger.info("Getting Model Servers");
//			return new ResponseEntity<>(modelServerService.findAll(), new HttpHeaders(), HttpStatus.OK);
		return null;
	}

	@PostMapping("registerModel")
	public ResponseEntity<ICIPMLFederatedModel> registerModel(@RequestBody ICIPPolyAIRequestWrapper request)
			throws IOException, LeapException, Exception {
		logger.info("Register Model");
		JSONObject requestJSON = new JSONObject(request.getRequest());
		return ResponseEntity.ok().header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON.toString())
				.body(modelPluginService.getModelService(dsService.getDatasource(requestJSON.getString("datasource"), requestJSON.getString("org")).getType()).registerModel(request));
	}

	@PostMapping("getLatestModelVersionModel")
	public ResponseEntity<ICIPPipelineModel> getLatestModelVersionRegisteredModel() {
		logger.info("Getting Model Servers");
//			return new ResponseEntity<>(modelServerService.findAll(), new HttpHeaders(), HttpStatus.OK);
		return null;
	}

	@PostMapping("createEndPointConfig")
	public ResponseEntity<ICIPPipelineModel> createEndPointConfig() {
		logger.info("Getting Model Servers");
//			return new ResponseEntity<>(modelServerService.findAll(), new HttpHeaders(), HttpStatus.OK);
		return null;
	}

	@PostMapping("deleteEndPointConfig")
	public ResponseEntity<ICIPPipelineModel> deleteEndPointConfig() {
		logger.info("Getting Model Servers");
//			return new ResponseEntity<>(modelServerService.findAll(), new HttpHeaders(), HttpStatus.OK);
		return null;
	}

	@PostMapping("listEndpointConfigs")
	public ResponseEntity<ICIPPipelineModel> listEndpointConfigs() {
		logger.info("Getting Model Servers");
//			return new ResponseEntity<>(modelServerService.findAll(), new HttpHeaders(), HttpStatus.OK);
		return null;
	}

	@PostMapping("listEndpoints")
	public ResponseEntity<ICIPPolyAIResponseWrapper> listEndpoints(@RequestBody ICIPPolyAIRequestWrapper request) throws IOException, JSONException, LeapException, Exception{
		logger.info("List Endpoints");
		JSONObject requestJSON = new JSONObject(request.getRequest());
		return ResponseEntity.ok().header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON.toString())
				.body(modelPluginService.getModelService(dsService.getDatasource(requestJSON.getString("datasource"), requestJSON.getString("org")).getType()).listEndpoints(request));
	}

	@PostMapping("createEndPoint")
	public ResponseEntity<ICIPMLFederatedEndpoint> createEndPoint(@RequestBody ICIPPolyAIRequestWrapper request)throws IOException, LeapException, Exception {
		logger.info("Create Endpoint");
		JSONObject requestJSON = new JSONObject(request.getRequest());
		return ResponseEntity.ok().header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON.toString())
				.body(modelPluginService.getModelService(dsService.getDatasource(requestJSON.getString("datasource"), requestJSON.getString("org")).getType()).createEndpoint(request));
	}
	@PostMapping("getEndpoint")
	public ResponseEntity<ICIPPolyAIResponseWrapper> getEndpoint(@RequestBody ICIPPolyAIRequestWrapper request) throws IOException, JSONException, LeapException, Exception {
		logger.info("Getting Endpoint");
		JSONObject requestJSON = new JSONObject(request.getRequest());
		return ResponseEntity.ok().header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON.toString())
				.body(modelPluginService.getModelService(dsService.getDatasource(requestJSON.getString("datasource"), requestJSON.getString("org")).getType()).getEndpoint(request));
	}
	
	@PostMapping("deployModel")
	public ResponseEntity<ICIPPolyAIResponseWrapper> deployModel(@RequestBody ICIPPolyAIRequestWrapper request) throws IOException, LeapException, Exception {
		logger.info("Deploy Model");
		//JSONObject requestJSON = new JSONObject(request.getRequest());
		return ResponseEntity.ok().header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON.toString())
				.body(modelPluginService.getModelService(dsService.getDatasource(request.getName(), request.getOrganization()).getType()).deployModel(request));
	}
	
	@PostMapping("getDeploymentStatus")
	public ResponseEntity<ICIPPolyAIResponseWrapper> getDeploymentStatus(@RequestBody ICIPPolyAIRequestWrapper request) throws IOException, JSONException, LeapException, Exception {
		logger.info("Getting Deployment Status");
		JSONObject requestJSON = new JSONObject(request.getRequest());
		return ResponseEntity.ok().header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON.toString())
				.body(modelPluginService.getModelService(dsService.getDatasource(requestJSON.getString("datasource"), requestJSON.getString("org")).getType()).getDeploymentStatus(request));
	}

	@PostMapping("deleteEndPoint")
	public ResponseEntity<ICIPPipelineModel> deleteEndPoint() {
		logger.info("Getting Model Servers");
//			return new ResponseEntity<>(modelServerService.findAll(), new HttpHeaders(), HttpStatus.OK);
		return null;
	}
	
		
}