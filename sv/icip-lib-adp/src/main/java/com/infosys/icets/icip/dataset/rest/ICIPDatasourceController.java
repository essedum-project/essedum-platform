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

package com.infosys.icets.icip.dataset.rest;

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
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.infosys.icets.ai.comm.lib.util.ICIPHeaderUtil;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;
import com.infosys.icets.ai.comm.lib.util.annotation.service.ConstantsService;
import com.infosys.icets.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.infosys.icets.ai.comm.lib.util.exceptions.ApiError;
import com.infosys.icets.ai.comm.lib.util.exceptions.ExceptionUtil;
import com.infosys.icets.iamp.usm.domain.DashConstant;
import com.infosys.icets.icip.dataset.jobs.ICIPCreateDatasets;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;
import com.infosys.icets.icip.dataset.model.ICIPPartialDatasource;
import com.infosys.icets.icip.dataset.model.dto.ICIPDatasourceDTO;
import com.infosys.icets.icip.dataset.model.dto.ICIPDatasoureNameAliasTypeDTO;
import com.infosys.icets.icip.dataset.service.IICIPDatasourcePluginsService;
import com.infosys.icets.icip.dataset.service.IICIPDatasourceService;
import com.infosys.icets.icip.icipwebeditor.event.model.InternalEvent;
import com.infosys.icets.icip.icipwebeditor.event.publisher.InternalEventPublisher;
import com.infosys.icets.icip.icipwebeditor.event.service.InternalJobEventService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * The Class ICIPDatasourceController.
 *
 * @author icets
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
	@LeapProperty("icip.scheduler.pause.status")
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
	public ResponseEntity<?> createDatasource(@RequestBody ICIPDatasourceDTO datasourceDTO) 
			throws NoSuchAlgorithmException {
		schedulerPauseStatus = checkStatus("icip.scheduler.pause.status","Core");
		if(schedulerPauseStatus.equalsIgnoreCase("false")) {
			String org = datasourceDTO.getOrganization();
			logger.info("creating datasource ");
			datasourceDTO.setOrganization(org);
			datasourceDTO.setLastmodifiedby(ICIPUtils.getUser(claim));
			datasourceDTO.setLastmodifieddate(Timestamp.from(Instant.now()));
			logger.debug("loading modelmapper");
			ModelMapper modelmapper = new ModelMapper();
			ICIPDatasource datasource = modelmapper.map(datasourceDTO, ICIPDatasource.class);
			logger.debug("create datasource method called");
			Boolean isAliasExist = iICIPDatasourceService.checkAlias(datasourceDTO.getAlias(),datasourceDTO.getOrganization());
			
			if(isAliasExist) {
				return ResponseEntity.status(502).body("Connection Name Already Exist");
			}
			else {
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
		} else {
			return new ResponseEntity<>("Scheduler Paused", HttpStatus.CONFLICT);
		}
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
	 * Handle all.
	 *
	 * @param ex the ex
	 * @return the response entity
	 */
	@ExceptionHandler(Exception.class)
	public ResponseEntity<Object> handleAll(Exception ex) {
		logger.error(ex.getMessage(), ex);
		Throwable rootcause = ExceptionUtil.findRootCause(ex);
		ApiError apiError = new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, rootcause.getMessage(), "error occurred");
		return new ResponseEntity<>("There is an application error, please contact the application admin", new HttpHeaders(), apiError.getStatus());
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
}
