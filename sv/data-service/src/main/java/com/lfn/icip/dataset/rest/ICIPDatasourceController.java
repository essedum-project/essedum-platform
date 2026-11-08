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

package com.lfn.icip.dataset.rest;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.lfn.ai.comm.lib.util.ICIPHeaderUtil;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.ai.comm.lib.util.annotation.service.ConstantsService;
import com.lfn.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.lfn.iamp.usm.domain.DashConstant;
import com.lfn.icip.dataset.exception.DuplicateAliasException;
import com.lfn.icip.dataset.exception.SchedulerPausedException;
import com.lfn.icip.dataset.jobs.ICIPCreateDatasets;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.model.ICIPPartialDatasource;
import com.lfn.icip.dataset.model.dto.ICIPDatasourceDTO;
import com.lfn.icip.dataset.model.dto.ICIPDatasoureNameAliasTypeDTO;
import com.lfn.icip.dataset.service.IICIPDatasourcePluginsService;
import com.lfn.icip.dataset.service.IICIPDatasourceService;
import com.lfn.icip.icipwebeditor.event.model.InternalEvent;
import com.lfn.icip.icipwebeditor.event.publisher.InternalEventPublisher;
import com.lfn.icip.icipwebeditor.event.service.InternalJobEventService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * The Class ICIPDatasourceController.
 *
 * @author essedum
 */
@RestController
@Timed
@RequestMapping("/${icip.pathPrefix}/datasources")
@Tag(name= "datasources")
public class ICIPDatasourceController {

	/** The Constant ENTITY_NAME. */
	private static final String ENTITY_NAME = "datasources";

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPDatasourceController.class);

	/** The i ICIP datasource service. */
	@Autowired
	private IICIPDatasourceService iICIPDatasourceService;

	/** Approval workflow service (project/org/platform admin approval chain). */
	@Autowired
	private com.lfn.icip.dataset.service.impl.DatasourceApprovalWorkflowService approvalWorkflowService;

	@Autowired
	private ConstantsService dashConstantService;

	/** The datasource plugin servce. */
	@Autowired
	private IICIPDatasourcePluginsService datasourcePluginServce;
	
	@Autowired
	private InternalJobEventService jobEvtService;
	
	@Autowired
	private InternalEventPublisher eventService;

	/** The is vault enabled. */
	@Value("${spring.cloud.vault.enabled}")
	private boolean isVaultEnabled;

	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;
	
	/** The scheduler status. */
	@EssedumProperty("icip.scheduler.pause.status")
	private String schedulerPauseStatus;

	/**
	 * Gets the datasources.
	 *
	 * @param org the org
	 * @return the datasources
	 */
	@GetMapping("/all")
	public ResponseEntity<List<ICIPDatasource>> getDatasources(@RequestParam("org") String org) {
		logger.info("Fetching datasource for {}", org);
		List<ICIPDatasource> datasources = iICIPDatasourceService.findByOrganization(org);
		List<ICIPDatasource> coreDatasources = iICIPDatasourceService.findByOrganization("Core");
		List<ICIPDatasource> finalDatasources = new ArrayList<>();
		finalDatasources.addAll(datasources);
		coreDatasources.forEach(ds -> {
			if (!finalDatasources.contains(ds))
				finalDatasources.add(ds);
		});
		return new ResponseEntity<>(finalDatasources, new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the datasources.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the datasources
	 */
	@GetMapping("/search/{name}")
	public ResponseEntity<List<ICIPDatasource>> getDatasources(@PathVariable("name") String name,
			@RequestParam(required = true) String org) {
		List<ICIPDatasource> datasources = iICIPDatasourceService.searchDatasources(name, org);
		return new ResponseEntity<>(datasources, new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the datasources by group.
	 *
	 * @param group the group
	 * @param org   the org
	 * @return the datasources by group
	 */
	@GetMapping("/all/{group}")
	public ResponseEntity<List<ICIPDatasource>> getDatasourcesByGroup(@PathVariable(name = "group") String group,
			@RequestParam(required = true) String org) {
		logger.info("Fetching datasource from getDatasourcesByGroup");
		List<ICIPDatasource> datasources = iICIPDatasourceService.getDatasourcesByGroupAndOrg(org, group);
		return new ResponseEntity<>(datasources, new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the datasource.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the datasource
	 */
	@GetMapping("/{nameStr}/{org}")
	public ResponseEntity<ICIPPartialDatasource> getDatasource(@PathVariable(name = "nameStr") String name,
			@PathVariable(name = "org") String org) {
		logger.info("Fetching datasource ");
		ICIPPartialDatasource datasource = iICIPDatasourceService.getPartialDatasource(name, org);
		datasource.setConnectionDetails("{}");
		return new ResponseEntity<>(datasource, new HttpHeaders(), HttpStatus.OK);
	}
	@GetMapping("/get/{nameStr}/{org}")
	public ResponseEntity<ICIPPartialDatasource> getDatasourceObject(@PathVariable(name = "nameStr") String name,
			@PathVariable(name = "org") String org) {
		logger.info("Fetching datasource ");
		ICIPPartialDatasource datasource = iICIPDatasourceService.getPartialDatasource(name, org);
		return new ResponseEntity<>(datasource, new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the groups len.
	 *
	 * @return the groups len
	 */
	@GetMapping("/all/len")
	public ResponseEntity<String> getGroupsLen() {
		logger.info("Getting Groups Length");
		int len = datasourcePluginServce.getDatasourceCount();
		return new ResponseEntity<>(String.valueOf(len), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the datasource by type.
	 *
	 * @param type the type
	 * @param org  the org
	 * @return the datasource by type
	 */
	@GetMapping("/type/{type}")
	public ResponseEntity<List<ICIPDatasource>> getDatasourceByType(@PathVariable(name = "type") String type,
			@RequestParam(name = "org") String org) {
		logger.info("Fetching datasource by type : {}", type);
		List<ICIPDatasource> datasource = iICIPDatasourceService.getDatasourceByType(type, org);
		return new ResponseEntity<>(datasource, new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the paginated datasource by type.
	 *
	 * @param type   the type
	 * @param org    the org
	 * @param page   the page
	 * @param size   the size
	 * @param search the search
	 * @return the paginated datasource by type
	 */
	@GetMapping("/type/paginated/{type}")
	public ResponseEntity<List<ICIPDatasource>> getPaginatedDatasourceByType(@PathVariable(name = "type") String type,
			@RequestParam(name = "org") String org,
			@RequestParam(name = "interfacetype") String interfacetype,
			@RequestParam(name = "page", defaultValue = "0", required = false) String page,
			@RequestParam(name = "size", defaultValue = "12", required = false) String size,
			@RequestParam(name = "search", required = false) String search) {
		logger.info("Fetching datasource by type : {}", type);
		List<ICIPDatasource> datasource = iICIPDatasourceService.getPaginatedDatasourceByTypeAndSearch(type, org,
				interfacetype, search, Integer.parseInt(page), Integer.parseInt(size));
		return new ResponseEntity<>(datasource, new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the datasource count by type.
	 *
	 * @param type   the type
	 * @param org    the org
	 * @param search the search
	 * @return the datasource count by type
	 */
	@GetMapping("/type/count/{type}")
	public ResponseEntity<Long> getDatasourceCountByType(@PathVariable(name = "type") String type,
			@RequestParam(name = "org") String org, @RequestParam(name = "search", required = false) String search) {
		logger.info("Fetching datasource count by type : {}", type);
		Long datasource = iICIPDatasourceService.getDatasourceCountByType(type, org, search);
		return new ResponseEntity<>(datasource, new HttpHeaders(), HttpStatus.OK);
	}
	/**
	 * Gets the datasource count by Interfacetype.
	 *
	 * @param type   the Interfacetype
	 * @param org    the org
	 * @param search the search
	 * @return the datasource count by Interfacetype
	 */
	@GetMapping("/interfacetype/count/{type}/{interfacetype}")
	public ResponseEntity<Long> getDatasourceCountByInterfacetype(@PathVariable(name = "type") String type,@PathVariable(name = "interfacetype") String interfacetype,
			@RequestParam(name = "org") String org, @RequestParam(name = "search", required = false) String search) {
		logger.info("Fetching datasource count by interfacetype : {}", interfacetype);
		Long datasource = iICIPDatasourceService.getDatasourceCountByInterfacetype(type,interfacetype, org, search);
		return new ResponseEntity<>(datasource, new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the datasource count by name and type.
	 *
	 * @param name the name
	 * @param type the type
	 * @param org  the org
	 * @return the datasource count by name and type
	 */
	@GetMapping("/type/search/count/{name}/{type}")
	public ResponseEntity<Long> getDatasourceCountByNameAndType(@PathVariable(name = "name") String name,
			@PathVariable(name = "type") String type, @RequestParam(name = "org") String org) {
		logger.info("Fetching datasource count by type : {}", type);
		Long datasource = iICIPDatasourceService.getDatasourceCountByNameAndType(name, type, org);
		return new ResponseEntity<>(datasource, new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the datasource by name search.
	 *
	 * @param name the name
	 * @param type the type
	 * @param org  the org
	 * @param page the page
	 * @param size the size
	 * @return the datasource by name search
	 */
	@GetMapping("/type/search/{name}/{type}")
	public ResponseEntity<List<ICIPDatasource>> getDatasourceByNameSearch(@PathVariable(name = "name") String name,
			@PathVariable(name = "type") String type, @RequestParam(name = "org") String org,
			@RequestParam(name = "page", defaultValue = "0", required = false) String page,
			@RequestParam(name = "size", defaultValue = "12", required = false) String size) {
		List<ICIPDatasource> datasource = iICIPDatasourceService.getDatasourceByNameSearch(name, org, type,
				Integer.parseInt(page), Integer.parseInt(size));
		return new ResponseEntity<>(datasource, new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Creates the datasource.
	 *
	 * @param idOrName      the id or name
	 * @param datasourceDTO the datasource DTO
	 * @return the response entity
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 */
	@PostMapping("/add")
	public ResponseEntity<ICIPDatasource> createDatasource(@RequestBody ICIPDatasourceDTO datasourceDTO)
			throws NoSuchAlgorithmException {
		schedulerPauseStatus = checkStatus("icip.scheduler.pause.status","Core");
		if(schedulerPauseStatus.equalsIgnoreCase("true")) {
			throw new SchedulerPausedException("Scheduler is currently paused. Please try again later.");
		}

		String org = datasourceDTO.getOrganization();
		logger.info("creating datasource ");
		datasourceDTO.setOrganization(org);
		datasourceDTO.setLastmodifiedby(ICIPUtils.getUser(claim));
		datasourceDTO.setLastmodifieddate(Timestamp.from(Instant.now()));
		logger.debug("loading modelmapper");
		ModelMapper modelmapper = new ModelMapper();
		ICIPDatasource datasource = modelmapper.map(datasourceDTO, ICIPDatasource.class);
		// New datasources must start in the approval workflow as DRAFT (visible only to creator)
		// — existing rows rely on the DB default (PUBLISHED) for backward compatibility.
		datasource.setApprovalStatus("DRAFT");
		logger.debug("create datasource method called");
		Boolean isAliasExist = iICIPDatasourceService.checkAlias(datasourceDTO.getAlias(),datasourceDTO.getOrganization());

		if(isAliasExist) {
			throw new DuplicateAliasException("Connection name '" + datasourceDTO.getAlias() + "' already exists. Please use a unique name.");
		}

		datasource = datasourcePluginServce.getDataSourceService(datasource).updateDatasource(datasource);
		datasource = iICIPDatasourceService.save(null, datasource);

		Map<String, String> params = new HashMap<>();
		params.put("datasource", datasource.getName());
		params.put("submittedBy", ICIPUtils.getUser(claim));
		params.put("org", datasource.getOrganization());
		InternalEvent event = new InternalEvent(this, "CREATEDATASETS", datasource.getOrganization(), params, ICIPCreateDatasets.class);
		eventService.getApplicationEventPublisher().publishEvent(event);

		return ResponseEntity.ok().headers(ICIPHeaderUtil.createEntityCreationAlert(ENTITY_NAME, datasource.getName()))
				.body(datasource);
	}
	
	private String checkStatus(String key, String org) {
		String resVal = "false";
		DashConstant res = dashConstantService.getByKeys(key,org);
		if(res != null) {
			resVal = res.getValue();
		}
		return resVal;
	}
	
	@PostMapping("/save/{idOrName}")
	public ResponseEntity<ICIPDatasource> saveDatasource(@PathVariable(name = "idOrName") String idOrName,
			@RequestBody ICIPDatasourceDTO datasourceDTO) throws NoSuchAlgorithmException {
		String org = datasourceDTO.getOrganization();
		logger.info("saving datasource ");
		datasourceDTO.setOrganization(org);
		datasourceDTO.setLastmodifiedby(ICIPUtils.getUser(claim));
		datasourceDTO.setLastmodifieddate(Timestamp.from(Instant.now()));
		logger.debug("loading modelmapper");
		ModelMapper modelmapper = new ModelMapper();
		ICIPDatasource datasource = modelmapper.map(datasourceDTO, ICIPDatasource.class);
		logger.debug("save method called");
		datasource = datasourcePluginServce.getDataSourceService(datasource).updateDatasource(datasource);
		datasource = iICIPDatasourceService.save(idOrName, datasource);
		return ResponseEntity.ok().headers(ICIPHeaderUtil.createEntityCreationAlert(ENTITY_NAME, datasource.getName()))
				.body(datasource);
	}

	/**
	 * Delete datasource.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the response entity
	 */
	@DeleteMapping("/delete/{nameStr}/{org}")
	public ResponseEntity<Void> deleteDatasource(@PathVariable(name = "nameStr") String name,
			@PathVariable(name = "org") String org) {
		logger.info("deleting datasource ");
		iICIPDatasourceService.delete(name, org);
		return ResponseEntity.ok().headers(ICIPHeaderUtil.createEntityDeletionAlert(ENTITY_NAME, name)).build();
	}

	/**
	 * Test connection.
	 *
	 * @param datasourceDTO the datasource DTO
	 * @return the response entity
	 */
	@PostMapping(path = "/test")
	public ResponseEntity<Void> testConnection(@RequestBody ICIPDatasourceDTO datasourceDTO) {
		logger.info("testing datasource conection: {}", datasourceDTO.getName());
		ModelMapper modelmapper = new ModelMapper();
		ICIPDatasource datasource = modelmapper.map(datasourceDTO, ICIPDatasource.class);
		boolean isTested = datasourcePluginServce.getDataSourceService(datasource).testConnection(datasource);
		if (isTested)
			return ResponseEntity.ok().build();

		return ResponseEntity.badRequest().build();
	}

	/**
	 * Gets the types.
	 *
	 * @param page the page
	 * @param size the size
	 * @return the types
	 */
	@GetMapping("/types")
	public ResponseEntity<String> getTypes(
			@RequestParam(name = "page", defaultValue = "0", required = false) String page,
			@RequestParam(name = "size", defaultValue = "12", required = false) String size) {
		return ResponseEntity.ok().header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON.toString()).body(
				datasourcePluginServce.getDataSourcesJson(Integer.parseInt(page), Integer.parseInt(size)).toString());
	}

	/**
	 * Gets the types by name.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the types by name
	 */
	@GetMapping("/types/{name}/{org}")
	public ResponseEntity<List<ICIPDatasource>> getTypesByName(@PathVariable(name = "name") String name,
			@PathVariable(name = "org") String org) {
		List<ICIPDatasource> datasource=iICIPDatasourceService.getDatasourcesByOrgAndName(org, name);
		return ResponseEntity.ok().header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON.toString())
				.body(datasource);
	}

	/**
	 * Gets the datasource names.
	 *
	 * @param org the org
	 * @return the datasource names
	 */
	@GetMapping("/names")
	public ResponseEntity<List<NameAndAliasDTO>> getDatasourceNameAndAlias(
			@RequestParam(required = true, name = "org") String org) {
		List<NameAndAliasDTO> datasources = iICIPDatasourceService.findNameAndAliasByOrganization(org);
		return new ResponseEntity<>(datasources, new HttpHeaders(),
				HttpStatus.OK);
	}

	/**
	 * Checks if is local active.
	 *
	 * @return the response entity
	 */
	@GetMapping("/isVaultEnabled")
	public ResponseEntity<Boolean> isLocalActive() {
		return new ResponseEntity<>(isVaultEnabled, HttpStatus.OK);
	}



	/**
	 * Gets the docs.
	 *
	 * @param pluginType the plugin type
	 * @param org the org
	 * @return the docs
	 */
	@GetMapping("/getDocs/{pluginType}/{org}")
	public String getDocs(@PathVariable(name = "pluginType") String pluginType,
			@PathVariable(name = "org") String org) {
		ICIPDatasource plugin = new ICIPDatasource();
		plugin.setType(pluginType);
		plugin.setConnectionDetails("");
		plugin.setOrganization(org);
		String doc = "";
		try {
			doc = datasourcePluginServce.getDataSourceService(plugin).getDocs(pluginType.toLowerCase().trim());
		} catch (IOException e) {
			logger.error("Error in reading documentation file: \n", e);
		}
		return doc;
	}
	
	@PostMapping("/syncDatasets/{datasourceType}")
	public void runSyncDatasetsjob(@RequestBody String body, 
			@PathVariable(name = "datasourceType") String datasourceType) {
		
		String jobName = null;
		String userName = ICIPUtils.getUser(claim);
		Gson gson = new Gson();
		JsonObject bodyElement = gson.fromJson(body, JsonObject.class);
		String organization = bodyElement.get("org").toString();
		Map<String, String> reqParamMap = new HashMap<>();
		JsonArray datasourceNames = new JsonArray();
		
		try {
			
			List<ICIPDatasource> datasources = iICIPDatasourceService.getDatasourceByType(datasourceType, organization);
			
			if(datasources!=null && datasources.size()>0) {
				
				ICIPDatasource sampleDs = iICIPDatasourceService.getDatasource("LEOSNWWQ57786", organization);
				
				datasources.forEach( datasource -> {
					datasourceNames.add(datasource.getName());
				});
			
				bodyElement.add("datasourceNames", datasourceNames);
				bodyElement.addProperty("submittedBy", userName);
				jobName = datasourcePluginServce.getDataSourceService(sampleDs).getSyncDatasetJobName(sampleDs);
				
				jobEvtService.runInternalJob(body, "SyncDatasets", Class.forName(jobName) , reqParamMap);
			}
		}catch(ClassNotFoundException ex) {
			logger.error("Internal job not found : "+ jobName);
		}
		
	}
	
	@GetMapping("/get/adapterTypes")
	public ResponseEntity<List<String>> getAdapterTypes() {
		logger.info("Fetching adapter datasource ");
		List<String> adapterTypes = iICIPDatasourceService.getAdapterTypes();
		return new ResponseEntity<>(adapterTypes, new HttpHeaders(), HttpStatus.OK);
	}
	
	@GetMapping("/getadapters/{org}")
	public ResponseEntity<List<ICIPDatasource>> getAdaptersByOrg(@PathVariable(name = "org") String org) {
		logger.info("Fetching adapter datasource ");
		List<ICIPDatasource> adapterTypes = iICIPDatasourceService.getAdaptersByOrg(org);
		return new ResponseEntity<>(adapterTypes, new HttpHeaders(), HttpStatus.OK);
	}
	
	@GetMapping("/getpromptsprovider/{org}")
	public ResponseEntity<List<ICIPDatasoureNameAliasTypeDTO>> getPromptsProviderByOrg(@PathVariable(name = "org") String org) {
		logger.info("Fetching prompt providers");
		List<ICIPDatasoureNameAliasTypeDTO> promptProviders = iICIPDatasourceService.getPromptsProviderByOrg(org);
		return new ResponseEntity<>(promptProviders, new HttpHeaders(), HttpStatus.OK);
	}

	@GetMapping("/getRestProvidersForEndpoint/{org}")
	public ResponseEntity<List<ICIPDatasource>> getForEndpointConnectionsByOrg(@PathVariable(name = "org") String org) {
		logger.info("Fetching connections ForEndpoints");
		List<ICIPDatasource> connList = iICIPDatasourceService.getForEndpointConnectionsByOrg(org);
		return new ResponseEntity<>(connList, new HttpHeaders(), HttpStatus.OK);
	}

	// ==================== APPROVAL ENDPOINTS ====================

	@PostMapping("/approval/project/submit")
	public ResponseEntity<java.util.Map<String, Object>> submitForApproval(
			@RequestBody java.util.Map<String, Object> request,
			jakarta.servlet.http.HttpServletRequest httpRequest) {
		java.util.Map<String, Object> response = new java.util.HashMap<>();
		try {
			if (!request.containsKey("resourceId") || !request.containsKey("projectId")) {
				response.put("success", false);
				response.put("message", "Missing resourceId or projectId");
				return ResponseEntity.status(400).body(response);
			}
			Integer resourceId = ((Number) request.get("resourceId")).intValue();
			Integer projectId = ((Number) request.get("projectId")).intValue();

			ICIPDatasource datasource = iICIPDatasourceService.getDatasource(resourceId);
			if (datasource == null) {
				response.put("success", false);
				response.put("message", "Datasource not found with ID: " + resourceId);
				return ResponseEntity.status(404).body(response);
			}

			String currentStatus = datasource.getApprovalStatus();
			if (currentStatus != null && !"DRAFT".equals(currentStatus) && !"PROJECT_REJECTED".equals(currentStatus)) {
				response.put("success", false);
				response.put("message", "Only DRAFT or PROJECT_REJECTED datasources can be submitted for approval");
				return ResponseEntity.status(400).body(response);
			}

			datasource.setApprovalStatus("PENDING_PROJECT_APPROVAL");
			datasource.setProjectId(projectId);
			iICIPDatasourceService.savedatasource(datasource);

			response.put("success", true);
			response.put("message", "Datasource submitted for project approval");
			response.put("resourceId", resourceId);
			response.put("status", "PENDING_PROJECT_APPROVAL");
			logger.info("[Approval] Datasource {} submitted for project approval", resourceId);
			return ResponseEntity.ok(response);

		} catch (Exception e) {
			logger.error("[Approval] Error submitting datasource for approval", e);
			response.put("success", false);
			response.put("message", "Error submitting for approval: " + e.getMessage());
			return ResponseEntity.status(500).body(response);
		}
	}

	@PostMapping("/approval/project/approve/{resourceId}")
	public ResponseEntity<java.util.Map<String, Object>> approveProjectApproval(
			@PathVariable Integer resourceId,
			@RequestBody(required = false) java.util.Map<String, Object> request,
			@RequestParam(value = "rank", required = false) String rank,
			@RequestHeader(value = "roleId", required = false) String roleId,
			jakarta.servlet.http.HttpServletRequest httpRequest) {
		java.util.Map<String, Object> response = new java.util.HashMap<>();
		try {
			ICIPDatasource datasource = iICIPDatasourceService.getDatasource(resourceId);
			if (datasource == null) {
				response.put("success", false);
				response.put("message", "Datasource not found with ID: " + resourceId);
				return ResponseEntity.status(404).body(response);
			}

			Integer projectId = null;
			if (request != null) {
				Object pid = request.get("projectId");
				if (pid instanceof Number) {
					projectId = ((Number) pid).intValue();
				} else if (pid instanceof String && !((String) pid).isEmpty()) {
					try {
						projectId = Integer.parseInt((String) pid);
					} catch (NumberFormatException nfe) {
						logger.warn("[Approval] Invalid projectId format: {}", pid);
					}
				}
			}

			String userRank = (rank != null && !rank.isEmpty()) ? rank : roleId;
			if (userRank == null || userRank.isEmpty()) {
				response.put("success", false);
				response.put("message", "Missing user rank");
				return ResponseEntity.status(403).body(response);
			}

			ICIPDatasource result = approvalWorkflowService.approveProjectApproval(resourceId, projectId, userRank);
			response.put("success", true);
			response.put("message", "Datasource project approval approved");
			response.put("status", result.getApprovalStatus());
			logger.info("[Approval] Datasource {} approved at project level", resourceId);
			return ResponseEntity.ok(response);
		} catch (IllegalAccessError e) {
			response.put("success", false);
			response.put("message", e.getMessage());
			return ResponseEntity.status(403).body(response);
		} catch (IllegalStateException | IllegalArgumentException e) {
			response.put("success", false);
			response.put("message", e.getMessage());
			return ResponseEntity.status(400).body(response);
		} catch (Exception e) {
			logger.error("[Approval] Error approving datasource", e);
			response.put("success", false);
			response.put("message", "Error approving: " + e.getMessage());
			return ResponseEntity.status(500).body(response);
		}
	}

	@PostMapping("/approval/project/reject/{resourceId}")
	public ResponseEntity<java.util.Map<String, Object>> rejectProjectApproval(
			@PathVariable Integer resourceId,
			@RequestParam(value = "rank", required = false) String rank,
			@RequestHeader(value = "roleId", required = false) String roleId,
			jakarta.servlet.http.HttpServletRequest httpRequest) {
		java.util.Map<String, Object> response = new java.util.HashMap<>();
		try {
			ICIPDatasource datasource = iICIPDatasourceService.getDatasource(resourceId);
			if (datasource == null) {
				response.put("success", false);
				response.put("message", "Datasource not found with ID: " + resourceId);
				return ResponseEntity.status(404).body(response);
			}

			String userRank = (rank != null && !rank.isEmpty()) ? rank : roleId;
			if (userRank == null || userRank.isEmpty()) {
				response.put("success", false);
				response.put("message", "Missing user rank");
				return ResponseEntity.status(403).body(response);
			}

			ICIPDatasource result = approvalWorkflowService.rejectProjectApproval(resourceId, userRank);
			response.put("success", true);
			response.put("message", "Datasource project approval rejected");
			response.put("status", result.getApprovalStatus());
			logger.info("[Approval] Datasource {} rejected at project level", resourceId);
			return ResponseEntity.ok(response);
		} catch (IllegalAccessError e) {
			response.put("success", false);
			response.put("message", e.getMessage());
			return ResponseEntity.status(403).body(response);
		} catch (IllegalStateException | IllegalArgumentException e) {
			response.put("success", false);
			response.put("message", e.getMessage());
			return ResponseEntity.status(400).body(response);
		} catch (Exception e) {
			logger.error("[Approval] Error rejecting datasource", e);
			response.put("success", false);
			response.put("message", "Error rejecting: " + e.getMessage());
			return ResponseEntity.status(500).body(response);
		}
	}

	@GetMapping("/approval/project-admin/list")
	public ResponseEntity<java.util.List<ICIPDatasource>> getPendingApprovalList(
			@RequestParam String projectId,
			@RequestParam(required = false) String rank,
			jakarta.servlet.http.HttpServletRequest httpRequest) {
		try {
			String org = httpRequest.getHeader("organisation");
			if (org == null || org.isEmpty()) {
				org = httpRequest.getHeader("Organization");
			}
			if (org == null || org.isEmpty()) {
				org = httpRequest.getHeader("ProjectName");
			}
			logger.info("[Approval] Fetching pending approval list for org={}, projectId={}", org, projectId);
			if (org == null || org.isEmpty()) {
				logger.warn("[Approval] No organisation header found in request, returning empty list");
				return ResponseEntity.ok(java.util.Collections.emptyList());
			}
			java.util.List<ICIPDatasource> all = iICIPDatasourceService.findByOrganization(org);
			java.util.List<ICIPDatasource> pending = all.stream()
				.filter(ds -> "PENDING_PROJECT_APPROVAL".equals(ds.getApprovalStatus()))
				.collect(java.util.stream.Collectors.toList());
			logger.info("[Approval] Found {} pending datasources for org={}", pending.size(), org);
			return ResponseEntity.ok(pending);
		} catch (Exception e) {
			logger.error("[Approval] Error fetching pending approval list", e);
			return ResponseEntity.status(500).build();
		}
	}

	/**
	 * GET /approval/draft-resources?projectId=X&rank=2
	 * PROJECT_APPROVED datasources available for the Project Admin to submit to Org Admin.
	 */
	@GetMapping("/approval/draft-resources")
	public ResponseEntity<?> getDraftResources(
			@RequestParam Integer projectId,
			@RequestParam(required = false) String rank,
			@RequestHeader(value = "roleId", required = false) String roleId) {
		try {
			String userRank = (rank != null && !rank.isEmpty()) ? rank : roleId;
			if (userRank == null || userRank.isEmpty()) {
				return ResponseEntity.status(403).body(java.util.Map.of("error", "Missing user rank"));
			}

			java.util.List<ICIPDatasource> resources = approvalWorkflowService.getDraftResources(projectId, userRank);
			logger.info("[Approval] Retrieved {} PROJECT_APPROVED datasources for projectId {}", resources.size(), projectId);
			return ResponseEntity.ok(java.util.Map.of("success", true, "data", resources, "count", resources.size()));
		} catch (Exception e) {
			logger.error("[Approval] Error getting draft datasource resources", e);
			return ResponseEntity.status(500).body(java.util.Map.of("error", "Internal server error: " + e.getMessage()));
		}
	}

	/**
	 * POST /approval/org/submit
	 * Project Admin submits an approved datasource to Org Admin (PROJECT_APPROVED -> PENDING_ORG_APPROVAL).
	 */
	@PostMapping("/approval/org/submit")
	public ResponseEntity<?> submitForOrgApproval(
			@RequestBody java.util.Map<String, Object> request,
			@RequestParam(value = "rank", required = false) String rank,
			@RequestHeader(value = "roleId", required = false) String roleId) {
		try {
			Integer resourceId = (Integer) request.get("resourceId");
			if (resourceId == null) {
				return ResponseEntity.status(400).body(java.util.Map.of("error", "resourceId is required"));
			}

			Integer organizationId = null;
			Object orgObj = request.get("organizationId");
			if (orgObj instanceof Number) {
				organizationId = ((Number) orgObj).intValue();
			} else if (orgObj instanceof String) {
				try {
					organizationId = Integer.parseInt((String) orgObj);
				} catch (NumberFormatException e) {
					logger.warn("[Approval] Invalid organizationId format: {}", orgObj);
				}
			}
			if (organizationId == null) {
				return ResponseEntity.status(400).body(java.util.Map.of("error", "organizationId is required"));
			}

			String userRank = (rank != null && !rank.isEmpty()) ? rank : roleId;
			if (userRank == null || userRank.isEmpty()) {
				return ResponseEntity.status(403).body(java.util.Map.of("error", "Missing user rank"));
			}

			ICIPDatasource result = approvalWorkflowService.submitForOrgApproval(resourceId, organizationId, userRank);
			logger.info("[Approval] Datasource {} submitted to org {} for approval", resourceId, organizationId);
			return ResponseEntity.ok(java.util.Map.of(
				"success", true,
				"message", "Connection submitted to organization for approval",
				"resourceId", resourceId,
				"organizationId", organizationId,
				"status", result.getApprovalStatus()
			));
		} catch (IllegalAccessError e) {
			return ResponseEntity.status(403).body(java.util.Map.of("error", e.getMessage()));
		} catch (IllegalStateException | IllegalArgumentException e) {
			return ResponseEntity.status(400).body(java.util.Map.of("error", e.getMessage()));
		} catch (Exception e) {
			logger.error("[Approval] Error submitting datasource to org", e);
			return ResponseEntity.status(500).body(java.util.Map.of("error", "Internal server error: " + e.getMessage()));
		}
	}

	/**
	 * POST /approval/org/approve/{resourceId}
	 * Org Admin approves org-level publishing (PENDING_ORG_APPROVAL -> ORG_APPROVED).
	 */
	@PostMapping("/approval/org/approve/{resourceId}")
	public ResponseEntity<?> approveOrgApproval(
			@PathVariable Integer resourceId,
			@RequestParam(value = "rank", required = false) String rank,
			@RequestHeader(value = "roleId", required = false) String roleId) {
		try {
			String userRank = (rank != null && !rank.isEmpty()) ? rank : roleId;
			if (userRank == null || userRank.isEmpty()) {
				return ResponseEntity.status(403).body(java.util.Map.of("error", "Missing user rank"));
			}

			ICIPDatasource result = approvalWorkflowService.approveOrgApproval(resourceId, userRank);
			logger.info("[Approval] Datasource {} approved at org level", resourceId);
			return ResponseEntity.ok(java.util.Map.of(
				"success", true,
				"message", "Connection approved at organization level",
				"resourceId", resourceId,
				"status", result.getApprovalStatus()
			));
		} catch (IllegalAccessError e) {
			return ResponseEntity.status(403).body(java.util.Map.of("error", e.getMessage()));
		} catch (IllegalStateException | IllegalArgumentException e) {
			return ResponseEntity.status(400).body(java.util.Map.of("error", e.getMessage()));
		} catch (Exception e) {
			logger.error("[Approval] Error org-approving datasource", e);
			return ResponseEntity.status(500).body(java.util.Map.of("error", "Internal server error: " + e.getMessage()));
		}
	}

	/**
	 * POST /approval/org/reject/{resourceId}
	 * Org Admin rejects (PENDING_ORG_APPROVAL -> ORG_REJECTED).
	 */
	@PostMapping("/approval/org/reject/{resourceId}")
	public ResponseEntity<?> rejectOrgApproval(
			@PathVariable Integer resourceId,
			@RequestParam(value = "rank", required = false) String rank,
			@RequestHeader(value = "roleId", required = false) String roleId) {
		try {
			String userRank = (rank != null && !rank.isEmpty()) ? rank : roleId;
			if (userRank == null || userRank.isEmpty()) {
				return ResponseEntity.status(403).body(java.util.Map.of("error", "Missing user rank"));
			}

			ICIPDatasource result = approvalWorkflowService.rejectOrgApproval(resourceId, userRank);
			logger.info("[Approval] Datasource {} rejected at org level", resourceId);
			return ResponseEntity.ok(java.util.Map.of(
				"success", true,
				"message", "Connection rejected at organization level",
				"resourceId", resourceId,
				"status", result.getApprovalStatus()
			));
		} catch (IllegalAccessError e) {
			return ResponseEntity.status(403).body(java.util.Map.of("error", e.getMessage()));
		} catch (IllegalStateException | IllegalArgumentException e) {
			return ResponseEntity.status(400).body(java.util.Map.of("error", e.getMessage()));
		} catch (Exception e) {
			logger.error("[Approval] Error org-rejecting datasource", e);
			return ResponseEntity.status(500).body(java.util.Map.of("error", "Internal server error: " + e.getMessage()));
		}
	}

	/**
	 * POST /approval/platform/submit
	 * Org Admin submits an ORG_APPROVED datasource to Platform Admin (ORG_APPROVED -> PENDING_PLATFORM_APPROVAL).
	 */
	@PostMapping("/approval/platform/submit")
	public ResponseEntity<?> submitForPlatformApproval(
			@RequestBody java.util.Map<String, Object> request,
			@RequestParam(value = "rank", required = false) String rank,
			@RequestHeader(value = "roleId", required = false) String roleId) {
		try {
			Integer resourceId = (Integer) request.get("resourceId");
			if (resourceId == null) {
				return ResponseEntity.status(400).body(java.util.Map.of("error", "resourceId is required"));
			}

			String userRank = (rank != null && !rank.isEmpty()) ? rank : roleId;
			if (userRank == null || userRank.isEmpty()) {
				return ResponseEntity.status(403).body(java.util.Map.of("error", "Missing user rank"));
			}

			ICIPDatasource result = approvalWorkflowService.submitForPlatformApproval(resourceId, userRank);
			logger.info("[Approval] Datasource {} submitted for platform approval", resourceId);
			return ResponseEntity.ok(java.util.Map.of(
				"success", true,
				"message", "Connection submitted to Platform Admin for approval",
				"resourceId", resourceId,
				"status", result.getApprovalStatus()
			));
		} catch (IllegalAccessError e) {
			return ResponseEntity.status(403).body(java.util.Map.of("error", e.getMessage()));
		} catch (IllegalStateException | IllegalArgumentException e) {
			return ResponseEntity.status(400).body(java.util.Map.of("error", e.getMessage()));
		} catch (Exception e) {
			logger.error("[Approval] Error submitting datasource to platform", e);
			return ResponseEntity.status(500).body(java.util.Map.of("error", "Internal server error: " + e.getMessage()));
		}
	}

	/**
	 * POST /approval/platform/approve/{resourceId}
	 * Platform Admin approves and publishes globally (PENDING_PLATFORM_APPROVAL -> PUBLISHED).
	 */
	@PostMapping("/approval/platform/approve/{resourceId}")
	public ResponseEntity<?> approvePlatformApproval(
			@PathVariable Integer resourceId,
			@RequestParam(value = "rank", required = false) String rank,
			@RequestHeader(value = "roleId", required = false) String roleId) {
		try {
			String userRank = (rank != null && !rank.isEmpty()) ? rank : roleId;
			if (userRank == null || userRank.isEmpty()) {
				return ResponseEntity.status(403).body(java.util.Map.of("error", "Missing user rank"));
			}

			ICIPDatasource result = approvalWorkflowService.approvePlatformApproval(resourceId, userRank);
			logger.info("[Approval] Datasource {} published globally", resourceId);
			return ResponseEntity.ok(java.util.Map.of(
				"success", true,
				"message", "Connection published globally",
				"resourceId", resourceId,
				"status", result.getApprovalStatus()
			));
		} catch (IllegalAccessError e) {
			return ResponseEntity.status(403).body(java.util.Map.of("error", e.getMessage()));
		} catch (IllegalStateException | IllegalArgumentException e) {
			return ResponseEntity.status(400).body(java.util.Map.of("error", e.getMessage()));
		} catch (Exception e) {
			logger.error("[Approval] Error platform-approving datasource", e);
			return ResponseEntity.status(500).body(java.util.Map.of("error", "Internal server error: " + e.getMessage()));
		}
	}

	/**
	 * POST /approval/platform/reject/{resourceId}
	 * Platform Admin rejects (PENDING_PLATFORM_APPROVAL -> PLATFORM_REJECTED).
	 */
	@PostMapping("/approval/platform/reject/{resourceId}")
	public ResponseEntity<?> rejectPlatformApproval(
			@PathVariable Integer resourceId,
			@RequestParam(value = "rank", required = false) String rank,
			@RequestHeader(value = "roleId", required = false) String roleId) {
		try {
			String userRank = (rank != null && !rank.isEmpty()) ? rank : roleId;
			if (userRank == null || userRank.isEmpty()) {
				return ResponseEntity.status(403).body(java.util.Map.of("error", "Missing user rank"));
			}

			ICIPDatasource result = approvalWorkflowService.rejectPlatformApproval(resourceId, userRank);
			logger.info("[Approval] Datasource {} rejected at platform level", resourceId);
			return ResponseEntity.ok(java.util.Map.of(
				"success", true,
				"message", "Connection rejected",
				"resourceId", resourceId,
				"status", result.getApprovalStatus()
			));
		} catch (IllegalAccessError e) {
			return ResponseEntity.status(403).body(java.util.Map.of("error", e.getMessage()));
		} catch (IllegalStateException | IllegalArgumentException e) {
			return ResponseEntity.status(400).body(java.util.Map.of("error", e.getMessage()));
		} catch (Exception e) {
			logger.error("[Approval] Error platform-rejecting datasource", e);
			return ResponseEntity.status(500).body(java.util.Map.of("error", "Internal server error: " + e.getMessage()));
		}
	}

	/**
	 * GET /approval/org-admin/list?organizationId=X&rank=3
	 * Datasources pending Org Admin approval.
	 */
	@GetMapping("/approval/org-admin/list")
	public ResponseEntity<?> getOrgAdminApprovals(
			@RequestParam Integer organizationId,
			@RequestParam(required = false) String rank,
			@RequestHeader(value = "roleId", required = false) String roleId) {
		try {
			String userRank = (rank != null && !rank.isEmpty()) ? rank : roleId;
			if (userRank == null || userRank.isEmpty()) {
				return ResponseEntity.status(403).body(java.util.Map.of("error", "Missing rank parameter"));
			}

			java.util.List<ICIPDatasource> approvals = approvalWorkflowService.getOrgAdminApprovals(organizationId, userRank);
			logger.info("[Approval] Retrieved {} datasource approval requests for org admin, organizationId={}", approvals.size(), organizationId);
			return ResponseEntity.ok(java.util.Map.of("success", true, "data", approvals, "count", approvals.size()));
		} catch (Exception e) {
			logger.error("[Approval] Error getting org admin datasource approvals", e);
			return ResponseEntity.status(500).body(java.util.Map.of("error", "Internal server error: " + e.getMessage()));
		}
	}

	/**
	 * GET /approval/org-admin/draft-resources?organizationId=X&rank=3
	 * ORG_APPROVED datasources available for Platform Admin submission.
	 */
	@GetMapping("/approval/org-admin/draft-resources")
	public ResponseEntity<?> getOrgAdminDraftResources(
			@RequestParam Integer organizationId,
			@RequestParam(required = false) String rank,
			@RequestHeader(value = "roleId", required = false) String roleId) {
		try {
			String userRank = (rank != null && !rank.isEmpty()) ? rank : roleId;
			if (userRank == null || userRank.isEmpty()) {
				return ResponseEntity.status(403).body(java.util.Map.of("error", "Missing user rank"));
			}

			java.util.List<ICIPDatasource> resources = approvalWorkflowService.getOrgAdminDraftResources(organizationId, userRank);
			logger.info("[Approval] Retrieved {} ORG_APPROVED datasources for organizationId {}", resources.size(), organizationId);
			return ResponseEntity.ok(java.util.Map.of("success", true, "data", resources, "count", resources.size()));
		} catch (Exception e) {
			logger.error("[Approval] Error getting org-admin draft datasource resources", e);
			return ResponseEntity.status(500).body(java.util.Map.of("error", "Internal server error: " + e.getMessage()));
		}
	}

	/**
	 * GET /approval/platform-admin/list?rank=4
	 * Datasources pending Platform Admin approval (global publishing requests).
	 */
	@GetMapping("/approval/platform-admin/list")
	public ResponseEntity<?> getPlatformAdminApprovals(
			@RequestParam(required = false) String rank,
			@RequestHeader(value = "roleId", required = false) String roleId) {
		try {
			String userRank = (rank != null && !rank.isEmpty()) ? rank : roleId;
			if (userRank == null || userRank.isEmpty()) {
				return ResponseEntity.status(403).body(java.util.Map.of("error", "Missing rank parameter"));
			}

			java.util.List<ICIPDatasource> approvals = approvalWorkflowService.getPlatformAdminApprovals(userRank);
			logger.info("[Approval] Retrieved {} datasource approval requests for platform admin", approvals.size());
			return ResponseEntity.ok(java.util.Map.of("success", true, "data", approvals, "count", approvals.size()));
		} catch (Exception e) {
			logger.error("[Approval] Error getting platform admin datasource approvals", e);
			return ResponseEntity.status(500).body(java.util.Map.of("error", "Internal server error: " + e.getMessage()));
		}
	}

	/**
	 * GET /approval/catalog?projectId=X&orgId=Y
	 * Approved datasources visible to a user: PROJECT_APPROVED in their project
	 * + ORG_APPROVED/PENDING_PLATFORM_APPROVAL in their org + globally PUBLISHED.
	 */
	@GetMapping("/approval/catalog")
	public ResponseEntity<?> getCatalog(
			@RequestParam(required = false) Integer projectId,
			@RequestParam(required = false) Integer orgId) {
		try {
			java.util.List<ICIPDatasource> items = approvalWorkflowService.getCatalogResources(projectId, orgId);
			return ResponseEntity.ok(items);
		} catch (Exception e) {
			logger.error("[Catalog] Error fetching datasource catalog", e);
			return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
		}
	}

	/**
	 * POST /approval/clone/{resourceId}
	 * Clone an approved/published connection into a new DRAFT connection named
	 * {@code <base>-v<n>}. The original stays untouched; the clone must go
	 * through the approval chain again.
	 */
	@PostMapping("/approval/clone/{resourceId}")
	public ResponseEntity<?> cloneDatasource(
			@PathVariable Integer resourceId,
			@RequestBody(required = false) java.util.Map<String, Object> request,
			@RequestParam(required = false) Integer projectId,
			@RequestParam(required = false) String username,
			@RequestHeader(value = "user-login", required = false) String userLogin) {
		try {
			Integer effectiveProjectId = projectId;
			if (effectiveProjectId == null && request != null && request.get("projectId") instanceof Number) {
				effectiveProjectId = ((Number) request.get("projectId")).intValue();
			}
			String currentUser = (username != null && !username.isEmpty()) ? username : userLogin;
			if ((currentUser == null || currentUser.isEmpty()) && request != null && request.get("username") != null) {
				currentUser = request.get("username").toString();
			}

			ICIPDatasource clone = approvalWorkflowService.cloneDatasource(resourceId, effectiveProjectId, currentUser);
			return ResponseEntity.ok(java.util.Map.of("success", true, "data", clone));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(404).body(java.util.Map.of("error", e.getMessage()));
		} catch (IllegalStateException e) {
			return ResponseEntity.status(409).body(java.util.Map.of("error", e.getMessage()));
		} catch (Exception e) {
			logger.error("[Approval] Error cloning datasource {}", resourceId, e);
			return ResponseEntity.status(500).body(java.util.Map.of("error", "Internal server error: " + e.getMessage()));
		}
	}
}
