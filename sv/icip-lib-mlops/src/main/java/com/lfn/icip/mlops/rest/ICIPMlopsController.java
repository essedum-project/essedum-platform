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

package com.lfn.icip.mlops.rest;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.imageio.ImageIO;

import org.apache.http.client.ClientProtocolException;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.api.errors.InvalidRemoteException;
import org.eclipse.jgit.api.errors.TransportException;
import org.json.JSONArray;
import org.json.JSONObject;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import com.lfn.ai.comm.lib.util.ICIPHeaderUtil;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.model.ICIPMlIntstance;
import com.lfn.icip.dataset.model.ICIPSchemaRegistry;
import com.lfn.icip.dataset.model.ICIPTags;
import com.lfn.icip.dataset.repository.ICIPDatasourceRepository;
import com.lfn.icip.dataset.service.ICIPMlIntstanceService;
import com.lfn.icip.dataset.service.IICIPDatasetService;
import com.lfn.icip.dataset.service.IICIPDatasourcePluginsService;
import com.lfn.icip.dataset.service.IICIPDatasourceService;
import com.lfn.icip.dataset.service.IICIPSchemaRegistryService;
import com.lfn.icip.dataset.service.IICIPTagsService;
import com.lfn.icip.dataset.service.impl.ICIPDatasetPluginsService;
import com.lfn.icip.icipmodelserver.v2.model.dto.ICIPPolyAIRequestWrapper;
import com.lfn.icip.icipmodelserver.v2.model.dto.ICIPPolyAIResponseWrapper;
import com.lfn.icip.icipmodelserver.v2.service.impl.ICIPEndpointPluginsService;
import com.lfn.icip.icipmodelserver.v2.service.impl.ICIPModelPluginsService;
import com.lfn.icip.icipwebeditor.constants.FileConstants;
import com.lfn.icip.icipwebeditor.constants.IAIJobConstants;
import com.lfn.icip.icipwebeditor.executor.sync.service.JobSyncExecutorService;
import com.lfn.icip.icipwebeditor.file.service.ICIPFileService;
import com.lfn.icip.icipwebeditor.fileserver.dto.ICIPChunkMetaData;
import com.lfn.icip.icipwebeditor.job.model.ICIPInternalJobs;
import com.lfn.icip.icipwebeditor.job.service.IICIPInternalJobsService;
import com.lfn.icip.icipwebeditor.model.ICIPAgentJobs;
import com.lfn.icip.icipwebeditor.model.ICIPAgents;
import com.lfn.icip.icipwebeditor.model.ICIPGroupModel;
import com.lfn.icip.icipwebeditor.model.ICIPGroups;
import com.lfn.icip.icipwebeditor.model.ICIPImageSaving;
import com.lfn.icip.icipwebeditor.model.ICIPJobs;
import com.lfn.icip.icipwebeditor.model.ICIPJobsPartial;
import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedEndpoint;
import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedModel;
import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedModelDS;
import com.lfn.icip.icipwebeditor.model.ICIPPartialAgentJobs;
import com.lfn.icip.icipwebeditor.model.ICIPPartialGroups;
import com.lfn.icip.icipwebeditor.model.ICIPPlugin;
import com.lfn.icip.icipwebeditor.model.ICIPPluginScript;
import com.lfn.icip.icipwebeditor.model.ICIPStreamingServices;
import com.lfn.icip.icipwebeditor.model.dto.ICIPDatasourceFilterDTO;
import com.lfn.icip.icipwebeditor.model.dto.ICIPMLFederatedEndpointDTO;
import com.lfn.icip.icipwebeditor.model.dto.ICIPMLFederatedModelDTO;
import com.lfn.icip.icipwebeditor.model.dto.ICIPStreamingServices2DTO;
import com.lfn.icip.icipwebeditor.model.dto.ICIPStreamingServicesDTO;
import com.lfn.icip.icipwebeditor.repository.ICIPMLFederatedEndpointRepository;
import com.lfn.icip.icipwebeditor.repository.ICIPMLFederatedModelsRepository;
import com.lfn.icip.icipwebeditor.service.ICIPImageSavingService;
import com.lfn.icip.icipwebeditor.service.IICIPAgentJobsService;
import com.lfn.icip.icipwebeditor.service.IICIPAgentService;
import com.lfn.icip.icipwebeditor.service.IICIPAppService;
import com.lfn.icip.icipwebeditor.service.IICIPEventJobMappingService;
import com.lfn.icip.icipwebeditor.service.IICIPJobRuntimePluginsService;
import com.lfn.icip.icipwebeditor.service.IICIPJobsService;
import com.lfn.icip.icipwebeditor.service.IICIPMLFederatedEndpointService;
import com.lfn.icip.icipwebeditor.service.IICIPMLFederatedModelService;
import com.lfn.icip.icipwebeditor.service.IICIPPartialGroupsService;
import com.lfn.icip.icipwebeditor.service.IICIPPluginDetailsService;
import com.lfn.icip.icipwebeditor.service.IICIPPluginScriptService;
import com.lfn.icip.icipwebeditor.service.IICIPPluginService;
import com.lfn.icip.icipwebeditor.service.IICIPStreamingServiceService;
import com.lfn.icip.icipwebeditor.service.IICIPTaggingService;
import com.lfn.icip.icipwebeditor.service.impl.GitHubService;
import com.lfn.icip.icipwebeditor.service.impl.ICIPPipelineService;
import com.lfn.icip.icipwebeditor.util.ICIPFedModelUtil;
import com.lfn.icip.mlops.constants.ICIPMlOpsConstants;
import com.lfn.icip.mlops.rest.service.impl.ICIPMlOpsRestAdapterService;

import io.micrometer.core.annotation.Timed;
//import liquibase.pro.license.keymgr.a;
import jakarta.transaction.Transactional;

@RestController
@Timed
@RequestMapping("/${icip.pathPrefix}/service/v1")
@RefreshScope
public class ICIPMlopsController {
	

	@Autowired
	private ICIPMLFederatedModelsRepository fedModelRepo;

	@Autowired
	private ICIPMLFederatedEndpointRepository fedEndpointRepo;

	@Autowired
	private ICIPDatasetPluginsService pluginService;
	
	/** The datasource plugin servce. */
	@Autowired
	private IICIPDatasourcePluginsService datasourcePluginServce;

	@Autowired
	private IICIPPluginDetailsService pluginDetailsService;

	@Autowired
	private ICIPModelPluginsService modelPluginService;

	@Autowired
	private IICIPPartialGroupsService iICIPPartialGroupsService;

	@Autowired
	private ICIPEndpointPluginsService endpointPluginService;

	@Autowired
	private IICIPDatasourceService datasourceService;

	@Autowired
	private IICIPDatasetService datasetService;

	@Autowired
	private IICIPMLFederatedModelService fedModelService;

	@Autowired
	private IICIPMLFederatedEndpointService fedEndpointService;

	@Autowired
	private IICIPStreamingServiceService streamingServicesService;

	@Autowired
	IICIPTaggingService taggingEntityService;

	@Autowired
	ICIPImageSavingService ICIPImageSavingService;

	@Autowired
	private IICIPTagsService tagsService;

	@Autowired
	private IICIPSchemaRegistryService schemasService;

	@Autowired
	private ICIPMlIntstanceService instanceService;

	@Autowired
	private IICIPPluginService pluginServices;
	

	private final Logger log = LoggerFactory.getLogger(IICIPTagsService.class);

	/** The Constant ENTITY_NAME. */
	private static final String ENTITY_NAME = "streamingServices";
	private IICIPPluginService pipelinePluginService;

	@Autowired
	private IICIPAgentService agentService;

	@Autowired
	private IICIPAgentJobsService iICIPAgentJobsService;

	@Autowired
	private IICIPJobsService iICIPJobsService;

	@Autowired
	private JobSyncExecutorService jobSyncExecutorService;

	@Autowired
	private IICIPEventJobMappingService eventMappingService;

	@Autowired
	private IICIPInternalJobsService iICIPInternalJobsService;

	@Autowired
	private ICIPFileService fileService;

	@Autowired
	private ICIPPipelineService pipelineService;

	@Autowired
	private IICIPJobRuntimePluginsService jobsRuntimePluginServce;

	/** The datasource repository. */
	@Autowired
	private ICIPDatasourceRepository datasourceRepository;

	@Autowired
	private IICIPDatasourceService iICIPDatasourceService;

	@Autowired
	private IICIPPluginScriptService pluginScriptService;
	@Autowired
	private IICIPAppService appService;

	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPMlopsController.class);

	/** The Constant FED_MODIFIED_DATE. */
	private static final String FED_MODIFIED_DATE = "fed_modified_date";

	private ICIPPolyAIResponseWrapper model;

	@Autowired
	ICIPMlOpsRestAdapterService iCIPMlOpsRestAdapterService;
	@Autowired
	private GitHubService githubservice;

	/* Dataset */

	@PostMapping("/datasets")
	public ResponseEntity<String> datasetsCreate(@RequestBody String datasetbody,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestParam(name = "isCached", required = true) Boolean isCached,
			@RequestHeader Map<String, String> headers) throws ClientProtocolException, IOException, URISyntaxException

	{
		Map<String, String> params = new HashMap<String, String>();
		if (isCached) {
			String results = pluginService.getDataSetService(getDatasource(adapterInstance, project))
					.datasetsCreate(datasetbody, adapterInstance, project, headers, params);
			return ResponseEntity.status(200).body(results);
		} else {
			params.put(ICIPMlOpsConstants.IS_INSTANCE, isInstance);
			try {
				String results = iCIPMlOpsRestAdapterService.callPostMethod(adapterInstance,
						ICIPMlOpsConstants.PROJECTS_DATASETS_CREATE, project, headers, params, datasetbody);
				return ResponseEntity.status(200).body(results);
			} catch (Exception e) {
				return ResponseEntity.status(500).body(e.getMessage());
			}
		}
	}

	@GetMapping("/datasets/list")
	public ResponseEntity<String> getDatasetsList(
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "filter", required = false) String filter,
			@RequestParam(name = "orderBy", required = false) String orderBy,
			@RequestParam(name = "page", required = false, defaultValue = "1") String page,
			@RequestParam(name = "size", required = false, defaultValue = "10") String size,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isTemplate", required = false, defaultValue = "false") Boolean isTemplate,
			@RequestParam(name = "search", required = false) String search,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestParam(name = "isCached", required = true) Boolean isCached,
			@RequestHeader Map<String, String> headers)

	{
		Map<String, String> params = new HashMap<String, String>();
		if (isCached) {
			Pageable paginate = PageRequest.of(Integer.valueOf(page) - 1, Integer.valueOf(size));
			if (adapterInstance.equals("internal")) {
//				List<ICIPDataset> results = datasetService.getDatasetsByOrg(project);
				List<ICIPDataset> results = datasetService.getDatasetsByOrgandPage(project, search, paginate,
						isTemplate);
				String response = new JSONArray(results).toString();
				return ResponseEntity.status(200).body(response);
			} else {
				String results = pluginService.getDataSetService(getDatasource(adapterInstance, project))
						.getDatasetsList(adapterInstance, project, headers, params);

				return ResponseEntity.status(200).body(results);
			}
		} else {
			try {
				params.put(ICIPMlOpsConstants.IS_INSTANCE, isInstance);
				String results = iCIPMlOpsRestAdapterService.callGetMethod(adapterInstance,
						ICIPMlOpsConstants.PROJECTS_DATASETS_LIST_LIST, project, headers, params);
				return ResponseEntity.status(200).body(results);
			} catch (Exception e) {
				return ResponseEntity.status(500).body(e.getMessage());
			}
		}

	}

	@GetMapping("/datasets/{dataset_id}")
	public ResponseEntity<String> getDatasets(@PathVariable(name = "dataset_id", required = true) String datasetId,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestParam(name = "isCached", required = true) Boolean isCached,
			@RequestHeader Map<String, String> headers)

	{
		Map<String, String> params = new HashMap<String, String>();
		if (isCached) {
			String results = pluginService.getDataSetService(getDatasource(adapterInstance, project))
					.getDatasets(adapterInstance, project, headers, params);

			return ResponseEntity.status(200).body(results);
		} else {
			try {
				params.put(ICIPMlOpsConstants.IS_INSTANCE, isInstance);
				params.put(ICIPMlOpsConstants.DATASET_ID, datasetId);
				String results = iCIPMlOpsRestAdapterService.callGetMethod(adapterInstance,
						ICIPMlOpsConstants.PROJECTS_DATASETS_GET, project, headers, params);
				return ResponseEntity.status(200).body(results);
			} catch (Exception e) {
				return ResponseEntity.status(500).body(e.getMessage());
			}
		}
	}

	@DeleteMapping("/datasets/{dataset_id}")
	public ResponseEntity<String> deleteDataset(@PathVariable(name = "dataset_id", required = true) String datasetId,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestParam(name = "isCached", required = true) Boolean isCached,
			@RequestHeader Map<String, String> headers)
			throws ClientProtocolException, IOException, URISyntaxException {
		Map<String, String> params = new HashMap<String, String>();
		if (isCached) {
			String results = pluginService.getDataSetService(getDatasource(adapterInstance, project))
					.deleteDataset(adapterInstance, project, headers, params);

			return ResponseEntity.status(200).body(results);
		} else {
			try {
				params.put(ICIPMlOpsConstants.IS_INSTANCE, isInstance);
				params.put(ICIPMlOpsConstants.DATASET_ID, datasetId);
				String results = iCIPMlOpsRestAdapterService.callDeleteMethod(adapterInstance,
						ICIPMlOpsConstants.PROJECTS_DATASETS_DELETE, project, headers, params);
				return ResponseEntity.status(200).body(results);
			} catch (Exception e) {
				return ResponseEntity.status(500).body(e.getMessage());
			}
		}
	}

	@DeleteMapping("/models/delete/{model_id}")
	public ResponseEntity<String> deleteModel(@PathVariable(name = "model_id", required = true) int modelId,
			@RequestParam(name = "project", required = true) String project,
			@RequestHeader Map<String, String> headers) throws IOException {
		     JSONObject jsonObject =  new JSONObject();
			try {
			fedModelService.deleteModel(modelId, project);
			jsonObject.put("status", "Model is deleted");
			return ResponseEntity.status(200).body(jsonObject.toString());
			} catch (Exception e) {
				log.error("Error occured while deleting the model either model not found: "+ e.getMessage());
				jsonObject.put("status", "Model deletion failed");
				return ResponseEntity.status(500).body(jsonObject.toString());
			}
	}

	@PostMapping("/datasets/{dataset_id}/export")
	public ResponseEntity<String> exportDatasets(@RequestBody String datasetExportBody,
			@PathVariable(name = "dataset_id", required = true) String datasetId,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestParam(name = "isCached", required = true) Boolean isCached,
			@RequestHeader Map<String, String> headers)

	{
		Map<String, String> params = new HashMap<String, String>();
		if (isCached) {
			String results = pluginService.getDataSetService(getDatasource(adapterInstance, project))
					.exportDatasets(datasetExportBody, adapterInstance, project, headers, params);

			return ResponseEntity.status(200).body(results);
		} else {
			try {
				params.put(ICIPMlOpsConstants.IS_INSTANCE, isInstance);
				params.put(ICIPMlOpsConstants.DATASET_ID, datasetId);
				String results = iCIPMlOpsRestAdapterService.callPostMethod(adapterInstance,
						ICIPMlOpsConstants.PROJECTS_DATASETS_EXPORT_CREATE, project, headers, params,
						datasetExportBody);
				return ResponseEntity.status(200).body(results);
			} catch (Exception e) {
				return ResponseEntity.status(500).body(e.getMessage());
			}
		}
	}

	/* Endpoints */

	@PostMapping("/endpoints/register")
	public ResponseEntity<String> createEndpoint(@RequestBody String endpointstbody,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestParam(name = "isCached", required = false) Boolean isCached,
			@RequestHeader Map<String, String> headers) {

		    Map<String, String> params = new HashMap<String, String>();
			ICIPPolyAIRequestWrapper request = new ICIPPolyAIRequestWrapper();
			request.setOrganization(project);
			request.setName(adapterInstance);
			request.setParams(params);
			request.setBody(endpointstbody);
			ICIPMLFederatedEndpoint results;
			logger.info("Request for CreateEndpoint: " + request.toString());
			try {
                if (isCached) {
                    if (adapterInstance.equals("local")) {
                        results = modelPluginService.getModelService(adapterInstance).createEndpoint(request);

                    } else {
                        results = modelPluginService.getModelService(getDatasource(adapterInstance, project).getType())
                                .createEndpoint(request);
                    }

                    logger.info("Response for CreateEndpoint: " + results.toString());
                    if (results != null && results.getName() != null) {
                        fedEndpointService.saveEndpoint(results);
                        ICIPMLFederatedEndpoint endpointId = fedEndpointRepo
                                .findBySourceId(results.getSourceEndpointId().getSourceId());
                        results.setId(endpointId.getId());
                    } else {
                        if (results.getStatus() != null) {
                            if ("Endpoint Registered".equalsIgnoreCase(results.getStatus()))
                                return ResponseEntity.status(200).body(new JSONObject(results).toString());
                            else
                                return ResponseEntity.status(500).body(results.getStatus());
                        }
                    }
                    return ResponseEntity.status(200).body(new JSONObject(results).toString());
                } else {
                    params.put(ICIPMlOpsConstants.IS_INSTANCE, isInstance);
                    String response = iCIPMlOpsRestAdapterService.callPostMethod(adapterInstance,
                            ICIPMlOpsConstants.PROJECTS_ENDPOINTS_CREATE, project, headers, params,
                            endpointstbody);
                    return ResponseEntity.status(200).body(response);
                }
			} catch (Exception e) {
				logger.error(e.getMessage());
				return ResponseEntity.status(500).body(e.getMessage());

			}
		
	}

	@GetMapping("/endpoints/list")
	public ResponseEntity<String> getEndpointsListRequestParam(
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "type", required = false) String type,
			@RequestParam(name = "instance", required = false) String instance,
			@RequestParam(name = "tags", required = false) String tags,
			@RequestParam(name = "query", required = false) String query,
			@RequestParam(name = "page", required = false, defaultValue = "1") String page,
			@RequestParam(name = "size", required = false, defaultValue = "10") String size,
			@RequestParam(name = "orderBy", required = false) String orderBy,
			@RequestParam(name = "isCached", required = true) Boolean isCached,
			@RequestParam(name = "adapter_instance", required = false) String adapterInstance,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) throws IOException {

		if (isCached) {
			Pageable paginate = PageRequest.of(Integer.valueOf(page) - 1, Integer.valueOf(size));
			List<Integer> tagList = new ArrayList<>();
			if (tags != null) {
				String[] splitValues = tags.split(",");
				for (String t : splitValues) {
					tagList.add(Integer.parseInt(t));
				}
			} else
				tagList = null;

			List<ICIPMLFederatedEndpointDTO> results = fedEndpointService.getAllEndpointsByAdpateridAndOrganisation(
					instance, project, paginate, tagList, query, orderBy, type);
			String response = new JSONArray(results).toString();

			return ResponseEntity.status(200).body(response);
		}

		else {
			/*
			 * ICIPPolyAIRequestWrapper payload = new ICIPPolyAIRequestWrapper(); JSONObject
			 * content = new JSONObject(); content.put("datasource", instance);
			 * content.put("org", project); content.put("datasourceAlias", instance);
			 * payload.setRequest(content.toString()); try { List<ICIPMLFederatedEndpoint>
			 * results = modelPluginService .getModelService(getDatasource(instance,
			 * project).getType()).getSyncEndpointList(payload); String response = new
			 * JSONArray(results).toString();
			 * 
			 * return ResponseEntity.status(200).body(response); } catch (ParseException e)
			 * { return ResponseEntity.status(500).body(e.getMessage()); }
			 */
			try {
				Map<String, String> params = new HashMap<String, String>();
				params.put(ICIPMlOpsConstants.IS_INSTANCE, isInstance);
				String results = iCIPMlOpsRestAdapterService.callGetMethod(adapterInstance,
						ICIPMlOpsConstants.PROJECTS_ENDPOINTS_LIST_LIST, project, headers, params);
				return ResponseEntity.status(200).body(results);
			} catch (Exception e) {
				return ResponseEntity.status(500).body(e.getMessage());
			}
		}

	}

	@GetMapping("/endpoints/getAll/{org}")
	public ResponseEntity<String> getAllEndpointsByOrg(@PathVariable(name = "org") String org) {
		List<ICIPMLFederatedEndpointDTO> results = fedEndpointService.getAllEndpointsByOrganisation(org);
		String response = new JSONArray(results).toString();
		return ResponseEntity.status(200).body(response);
	}

	@GetMapping("/endpoints/{endpoint_id}")
	public ResponseEntity<String> readEndpoints(@PathVariable(name = "endpoint_id", required = true) String endpointId,
			@RequestParam(name = "instance", required = false) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isCached", required = true) Boolean isCached,
			@RequestParam(name = "adapter_instance", required = false) String adapter_instance,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) {
		Map<String, String> params = new HashMap<String, String>();
		if (isCached) {
			ICIPPolyAIRequestWrapper request = new ICIPPolyAIRequestWrapper();
			request.setHeader(headers);
			request.setOrganization(project);
			request.setName(adapterInstance);
			request.setParams(params);
			ICIPMLFederatedEndpointDTO results = fedEndpointService.getEndpointsByAdapterIdAndFedId(adapterInstance,
					endpointId, project);
			return ResponseEntity.status(200).body(new JSONObject(results).toString());
		} else {
			try {
				params.put(ICIPMlOpsConstants.IS_INSTANCE, isInstance);
				params.put(ICIPMlOpsConstants.ENDPOINT_ID, endpointId);
				String results = iCIPMlOpsRestAdapterService.callGetMethod(adapter_instance,
						ICIPMlOpsConstants.PROJECTS_ENDPOINTS_GET, project, headers, params);
				return ResponseEntity.status(200).body(results);
			} catch (Exception e) {
				return ResponseEntity.status(500).body(e.getMessage());
			}
		}
	}

//	@DeleteMapping("/endpoints/{endpoint_id}")
//	public ResponseEntity<String> deleteEndpoints(
//			@PathVariable(name = "endpoint_id", required = true) String endpointId,
//			@RequestParam(name = "cloud_provider", required = true) String adapterInstance,
//			@RequestParam(name = "project", required = true) String project,
//			@RequestHeader Map<String, String> headers) {
//		Map<String, String> params = new HashMap<String, String>();
//		ICIPPolyAIRequestWrapper request = new ICIPPolyAIRequestWrapper();
//		request.setHeader(headers);
//		request.setOrganization(project);
//		request.setName(adapterInstance);
//		request.setParams(params);
//		ICIPPolyAIResponseWrapper results = endpointPluginService
//				.getMlopsEndpointService(getDatasource(adapterInstance, project).getType()).deleteEndpoints(request);
//
//		return ResponseEntity.status(200).body(results.getResponse());
//	}

	@PostMapping("/endpoints/updateEndpoint")
	public ResponseEntity<String> updateEndpoint(@RequestBody Map<String, String> fedObj) throws IOException {
		ObjectMapper mapper = new ObjectMapper();
		ICIPMLFederatedEndpointDTO fedDto = mapper.convertValue(fedObj, ICIPMLFederatedEndpointDTO.class);
		ICIPMLFederatedEndpointDTO response = fedEndpointService.updateEndpoint(fedDto);
		if (response != null)
			return ResponseEntity.status(200).body(new JSONObject(response).toString());
		else
			return ResponseEntity.status(500).body("");
	}

	@DeleteMapping("/endpoints/{endpoint_id}/delete")
	public ResponseEntity<String> deleteEndpoint(@PathVariable(name = "endpoint_id", required = true) String endpointId,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isCached", required = true) Boolean isCached,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) throws IOException, EssedumException {
		if (isCached) {
			ICIPPolyAIRequestWrapper request = new ICIPPolyAIRequestWrapper();
			request.setOrganization(project);
			request.setName(adapterInstance);
			request.setBody(endpointId);
			logger.info("Request - DeleteEndpoint: " + request);

			try {
//				ICIPPolyAIResponseWrapper results = modelPluginService
//						.getModelService(getDatasource(adapterInstance, project).getType()).deleteEndpoint(request);
				ICIPPolyAIResponseWrapper results;
				if (adapterInstance.equalsIgnoreCase("local")) {
					results = modelPluginService.getModelService(adapterInstance).deleteEndpoint(request);

				} else {
					ICIPDatasource datasource = getDatasource(adapterInstance, project);
					if (datasource == null) {
						ICIPMLFederatedEndpointDTO endDto = new ICIPMLFederatedEndpointDTO();
						endDto.setAdapterId(adapterInstance);
						endDto.setOrganisation(project);
						endDto.setSourceId(endpointId);
						fedEndpointService.updateIsDelEndpoint(endDto);
						JSONObject respObj = new JSONObject();
						respObj.put("msg", "Endpoint is deleted");
						return ResponseEntity.status(200).body(respObj.toString());
					}
					results = modelPluginService.getModelService(getDatasource(adapterInstance, project).getType())
							.deleteEndpoint(request);
				}
				if (results != null && results.getType() != null && results.getType().contains(ICIPMlOpsConstants.VM)) {
					if (ICIPMlOpsConstants.VM_SUCCESS.equalsIgnoreCase(results.getType()))
						return ResponseEntity.status(200).body(results.getResponse());
					else if (ICIPMlOpsConstants.VM_FAILED.equalsIgnoreCase(results.getType()))
						return ResponseEntity.status(500).body(results.getResponse());
				}
				logger.info("Response - DeleteEndpoint: {}", results.toString());
				return ResponseEntity.status(200).body(new JSONObject(results).toString());
			} catch (Exception e) {
				logger.error(e.getMessage());
				return ResponseEntity.status(500).body(e.getMessage());
			}
		} else {
			Map<String, String> params = new HashMap<String, String>();
			try {
				params.put(ICIPMlOpsConstants.IS_INSTANCE, isInstance);
				params.put(ICIPMlOpsConstants.ENDPOINT_ID, endpointId);
				String results = iCIPMlOpsRestAdapterService.callDeleteMethod(adapterInstance,
						ICIPMlOpsConstants.PROJECTS_ENDPOINTS_DELETE, project, headers, params);
				return ResponseEntity.status(200).body(results);
			} catch (Exception e) {
				return ResponseEntity.status(500).body(e.getMessage());
			}
		}
	}

	@DeleteMapping("/model/deleteDeployment")
	public ResponseEntity<String> deleteDeployment(
			@RequestParam(name = "deployment_id", required = false) String deploymentId,
			@RequestParam(name = "model_id", required = true) String modelId,
			@RequestParam(name = "version", required = true) String version,
			@RequestParam(name = "cloud_provider", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project, @RequestHeader Map<String, String> headers)
			throws IOException, EssedumException {
		Map<String, String> params = new HashMap<String, String>();
		ICIPPolyAIRequestWrapper request = new ICIPPolyAIRequestWrapper();
		request.setHeader(headers);
		request.setOrganization(project);
		request.setName(adapterInstance);
		JSONObject body = new JSONObject();
		if ((deploymentId != null)) {
			if (!deploymentId.isEmpty())
				body.put("deploymentId", deploymentId);
		}
		body.put("modelId", modelId);
		body.put("version", version);
		request.setBody(body.toString());
		logger.info("Request - DeleteDeployment: " + request);
		ICIPPolyAIResponseWrapper results;
		try {
			results = modelPluginService.getModelService(getDatasource(adapterInstance, project).getType())
					.deleteDeployment(request);
			logger.info("Response - DeleteDeployment: " + results.toString());
			return ResponseEntity.status(200).body(new JSONObject(results).toString());
		} catch (Exception e) {
			logger.error(e.getMessage());
			return ResponseEntity.status(500).body(e.getMessage());
		}
	}

	@PostMapping("/endpoints/{endpoint_id}/deploy_model")
	public ResponseEntity<String> endpointsDeployModel(@RequestBody String endpointsdeploybody,
			@PathVariable(name = "endpoint_id", required = true) String endpointId,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isCached", required = true) Boolean isCached,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) {
		Map<String, String> params = new HashMap<String, String>();
		if (isCached) {
			ICIPPolyAIRequestWrapper request = new ICIPPolyAIRequestWrapper();
			request.setHeader(headers);
			request.setOrganization(project);
			request.setName(adapterInstance);
			request.setParams(params);
			request.setBody(endpointsdeploybody);
			ICIPPolyAIResponseWrapper results = endpointPluginService
					.getMlopsEndpointService(getDatasource(adapterInstance, project).getType())
					.endpointsDeployModel(request);

			return ResponseEntity.status(200).body(results.getResponse());
		} else {
			try {
				params.put(ICIPMlOpsConstants.IS_INSTANCE, isInstance);
				params.put(ICIPMlOpsConstants.ENDPOINT_ID, endpointId);
				String results = iCIPMlOpsRestAdapterService.callPostMethod(adapterInstance,
						ICIPMlOpsConstants.PROJECTS_ENDPOINTS_DEPLOY_MODEL_CREATE, project, headers, params,
						endpointsdeploybody);
				return ResponseEntity.status(200).body(results);
			} catch (Exception e) {
				return ResponseEntity.status(500).body(e.getMessage());
			}
		}
	}

    @PostMapping("/models/register")
    public ResponseEntity<String> modelRegister(@RequestBody String endpointsdeploybody,
                                                       @RequestParam(name = "adapter_instance", required = true) String adapterInstance,
                                                       @RequestParam(name = "project", required = true) String project,
                                                       @RequestParam(name = "isCached", required = true) Boolean isCached,
                                                       @RequestParam(name = "isInstance", required = false) String isInstance,
                                                       @RequestHeader Map<String, String> headers) throws Exception {
        Map<String, String> params = new HashMap<String, String>();
        if (isCached) {
            ICIPPolyAIRequestWrapper request = new ICIPPolyAIRequestWrapper();
            request.setHeader(headers);
            request.setOrganization(project);
            request.setName(adapterInstance);
            request.setParams(params);
            request.setBody(endpointsdeploybody);
            ICIPMLFederatedModel results = modelPluginService.getModelService(getDatasource(adapterInstance, project).getType())
                    .registerModel(request);

            return ResponseEntity.status(200).body(results.toString());
        } else {
            try {
                params.put(ICIPMlOpsConstants.IS_INSTANCE, isInstance);
                String results = iCIPMlOpsRestAdapterService.callPostMethod(adapterInstance,
                        ICIPMlOpsConstants.PROJECTS_MODELS_REGISTER_CREATE, project, headers, params,
                        endpointsdeploybody);
                return ResponseEntity.status(200).body(results);
            } catch (Exception e) {
                return ResponseEntity.status(500).body(e.getMessage());
            }
        }
    }

	@GetMapping("/endpoints/listAdapterEndpoints")

	public ResponseEntity<String> getEndpointsList(@RequestParam(name = "app_org", required = true) String appOrg,
			@RequestParam(name = "adapter_id", required = true) String adapterId) {

		JSONArray uniqueList = fedEndpointService.getUniqueEndpoints(adapterId, appOrg);

		return ResponseEntity.status(200).body(uniqueList.toString());
	}

	@PostMapping("/endpoints/{endpoint_id}/explain")
	public ResponseEntity<String> explainEndpoints(@RequestBody String endpointsexplainbody,
			@PathVariable(name = "endpoint_id", required = true) String endpointId,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isCached", required = true) Boolean isCached,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) {

		Map<String, String> params = new HashMap<String, String>();
		if (isCached) {
			ICIPPolyAIRequestWrapper request = new ICIPPolyAIRequestWrapper();
			request.setHeader(headers);
			request.setOrganization(project);
			request.setName(adapterInstance);
			request.setParams(params);
			request.setBody(endpointsexplainbody);
			ICIPPolyAIResponseWrapper results = endpointPluginService
					.getMlopsEndpointService(getDatasource(adapterInstance, project).getType())
					.explainEndpoints(request);

			return ResponseEntity.status(200).body(results.getResponse());
		} else {
			try {
				params.put(ICIPMlOpsConstants.IS_INSTANCE, isInstance);
				params.put(ICIPMlOpsConstants.ENDPOINT_ID, endpointId);
				String results = iCIPMlOpsRestAdapterService.callPostMethod(adapterInstance,
						ICIPMlOpsConstants.PROJECTS_ENDPOINTS_EXPLAIN_CREATE, project, headers, params,
						endpointsexplainbody);
				return ResponseEntity.status(200).body(results);
			} catch (Exception e) {
				return ResponseEntity.status(500).body(e.getMessage());
			}
		}
	}

	@PostMapping("/endpoints/{endpoint_id}/infer")
	public ResponseEntity<String> inferEndpoints(@RequestBody String inferEndpointbody,
			@PathVariable(name = "endpoint_id", required = true) String endpointId,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isCached", required = true) Boolean isCached,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) {
		Map<String, String> params = new HashMap<String, String>();
		if (isCached) {
			ICIPPolyAIRequestWrapper request = new ICIPPolyAIRequestWrapper();
			request.setHeader(headers);
			request.setOrganization(project);
			request.setName(adapterInstance);
			request.setParams(params);
			request.setBody(inferEndpointbody);
			ICIPPolyAIResponseWrapper results = endpointPluginService
					.getMlopsEndpointService(getDatasource(adapterInstance, project).getType()).inferEndpoints(request);

			return ResponseEntity.status(200).body(results.getResponse());
		} else {
			try {
				params.put(ICIPMlOpsConstants.IS_INSTANCE, isInstance);
				params.put(ICIPMlOpsConstants.ENDPOINT_ID, endpointId);
				String results = iCIPMlOpsRestAdapterService.callPostMethod(adapterInstance,
						ICIPMlOpsConstants.PROJECTS_ENDPOINTS_INFER_CREATE, project, headers, params,
						inferEndpointbody);
				return ResponseEntity.status(200).body(results);
			} catch (Exception e) {
				return ResponseEntity.status(500).body(e.getMessage());
			}
		}
	}

	@PostMapping("/endpoints/{endpoint_id}/undeploy_models")
	public ResponseEntity<String> endpointsUndeployModels(@RequestBody String endpointsUndeploybody,
			@PathVariable(name = "endpoint_id", required = true) String endpointId,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isCached", required = true) Boolean isCached,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) {
		Map<String, String> params = new HashMap<String, String>();
		if (isCached) {
			ICIPPolyAIRequestWrapper request = new ICIPPolyAIRequestWrapper();
			request.setHeader(headers);
			request.setOrganization(project);
			request.setName(adapterInstance);
			request.setParams(params);
			request.setBody(endpointsUndeploybody);
			ICIPPolyAIResponseWrapper results = endpointPluginService
					.getMlopsEndpointService(getDatasource(adapterInstance, project).getType())
					.endpointsUndeployModels(request);

			return ResponseEntity.status(200).body(results.getResponse());
		} else {
			try {
				params.put(ICIPMlOpsConstants.IS_INSTANCE, isInstance);
				params.put(ICIPMlOpsConstants.ENDPOINT_ID, endpointId);
				String results = iCIPMlOpsRestAdapterService.callPostMethod(adapterInstance,
						ICIPMlOpsConstants.PROJECTS_ENDPOINTS_UNDEPLOY_MODELS_CREATE, project, headers, params,
						endpointsUndeploybody);
				return ResponseEntity.status(200).body(results);
			} catch (Exception e) {
				return ResponseEntity.status(500).body(e.getMessage());
			}
		}
	}

	@GetMapping("/models/list/{org}")
	public ResponseEntity<String> listModels(@PathVariable(name = "org") String org,
			@RequestParam(name = "connectionname", required = false) String connectionName,
			@RequestParam(name = "searchquery", required = false) String searchQuery,
			@RequestParam(name = "page", required = false) Integer page,
			@RequestParam(name = "size", required = false) Integer size,
			@RequestHeader Map<String, String> headers) throws IOException {
			logger.info("fetch models for org: {}", org );
			Pageable pageable = (page==null||size==null) ? null : PageRequest.of(Math.max(page - 1, 0), size);
			List<ICIPMLFederatedModelDS> results = fedModelService.getAllOptionalModelsByOrg(org,connectionName, searchQuery, pageable);
			String response = new JSONArray(results).toString();
			return ResponseEntity.status(200).body(response);
    }
	
	@GetMapping("/models/getfilters/{org}")
	public ResponseEntity<String> getModelFilters(@PathVariable("org") String org)
	{
		List<ICIPDatasourceFilterDTO> results = fedModelService.getModelFilters(org);
		String response = new JSONArray(results).toString();
		return ResponseEntity.status(200).body(response);
	}
	
	@GetMapping("/models/count/{org}")
	public ResponseEntity<Long> getAllModelsCount(@PathVariable(name = "org") String org,
			@RequestParam(name = "connectionname", required = false) String connectionName,
			@RequestParam(name = "searchquery", required = false) String searchQuery) {
		Long results = fedModelService.getAllModelsCountByOrganisationOptionals(org, connectionName, searchQuery);
		return ResponseEntity.status(200).body(results);
	}

			
	

	@GetMapping("/models/getAll/{org}")
	public ResponseEntity<String> getAllModelByOrg(@PathVariable(name = "org") String org) {
		List<ICIPMLFederatedModelDTO> results = fedModelService.getAllModelsByOrganisation(org);
		String response = new JSONArray(results).toString();
		return ResponseEntity.status(200).body(response);
	}

	@GetMapping("/models/getModel")
	public ResponseEntity<String> getModel(
			@RequestParam(name = "modelid", required = true) int modelId,
			@RequestParam(name = "project", required = true) String project) throws IOException {
		ICIPMLFederatedModelDS response = fedModelService.getModelByModelId(modelId, project);
		if (response != null) {
			return ResponseEntity.status(200).body(new JSONObject(response).toString());
		}
		else {
			return ResponseEntity.status(500).body("");
		}
	}

	@PostMapping("/models/updateModel")
	public ResponseEntity<String> updateModel(@RequestBody ICIPMLFederatedModelDTO fedModelObj) throws IOException {
		ICIPMLFederatedModelDTO response = fedModelService.updateModel(fedModelObj);
		if (response != null)
			return ResponseEntity.status(200).body(new JSONObject(response).toString());
		else
			return ResponseEntity.status(500).body("");
	}

	@GetMapping("/models/getRegisterModelJson")
	public ResponseEntity<String> getRegisterModelJson(

			@RequestParam(name = "adapter_instance", required = false) String adapterInstance,
			@RequestParam(name = "project", required = true) String project) throws IOException {
		if (adapterInstance.equals("local")) {

			JSONObject results = modelPluginService.getModelService(adapterInstance).getRegisterModelJson();
			return ResponseEntity.status(200).body(results.toString());
		} else {

			JSONObject results = modelPluginService.getModelService(getDatasource(adapterInstance, project).getType())
					.getRegisterModelJson();

			return ResponseEntity.status(200).body(results.toString());
		}
	}

	@GetMapping("/endpoints/getRegisterEndpointJson")
	public ResponseEntity<String> getEndpointJson(
			@RequestParam(name = "adapter_instance", required = false) String adapterInstance,
			@RequestParam(name = "project", required = true) String project) throws IOException {
		ICIPDatasource datasource = getDatasource(adapterInstance, project);
		JSONObject results = new JSONObject();
		if (adapterInstance.equals("local")) {
			results = modelPluginService.getModelService(adapterInstance).getEndpointJson();
			return ResponseEntity.status(200).body(results.toString());
		} else {
			results = modelPluginService.getModelService(datasource.getType()).getEndpointJson();
		}
		if ("AWSSAGEMAKER".equalsIgnoreCase(datasource.getType())) {
			JSONObject connectionDetails = new JSONObject(datasource.getConnectionDetails());
			String executionEnvironment = connectionDetails.optString(ICIPMlOpsConstants.EXECUTION_ENVIRONMENT);
			if (ICIPMlOpsConstants.REMOTE.equalsIgnoreCase(executionEnvironment)) {
				results.remove("attributes");
				results.put("attributes", results.opt("attributesForVM"));
				results.remove("attributesForVM");
			}
		}
		return ResponseEntity.status(200).body(results.toString());
	}

	@GetMapping("/models/getDeployModelJson")
	public ResponseEntity<String> getModelDeployJson(
			@RequestParam(name = "adapter_instance", required = false) String adapterInstance,
			@RequestParam(name = "project", required = true) String project) throws IOException {
		ICIPPolyAIResponseWrapper response = new ICIPPolyAIResponseWrapper();
		ICIPDatasource datasource = getDatasource(adapterInstance, project);
		JSONObject results = modelPluginService.getModelService(datasource.getType()).getDeployModelJson();
		if ("AWSSAGEMAKER".equalsIgnoreCase(datasource.getType())) {
			JSONObject connectionDetails = new JSONObject(datasource.getConnectionDetails());
			String executionEnvironment = connectionDetails.optString(ICIPMlOpsConstants.EXECUTION_ENVIRONMENT);
			if (ICIPMlOpsConstants.REMOTE.equalsIgnoreCase(executionEnvironment)) {
				results.remove("attributes");
				results.put("attributes", results.opt("attributesForVM"));
				results.remove("attributesForVM");
			}
		}
		return ResponseEntity.status(200).body(results.toString());
	}

	@GetMapping("/models/{model_id}")
	public ResponseEntity<String> readModels(@PathVariable(name = "model_id", required = true) String modelId,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "version_id", required = false) String versionID,
			@RequestParam(name = "filter", required = false) String filter,
			@RequestParam(name = "isCached", required = true) Boolean isCached,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) throws IOException, EssedumException, Exception {
		Map<String, String> params = new HashMap<String, String>();
		if (isCached) {
			ICIPPolyAIRequestWrapper request = new ICIPPolyAIRequestWrapper();
			request.setHeader(headers);
			request.setOrganization(project);
			request.setName(adapterInstance);
			request.setParams(params);
			ICIPPolyAIResponseWrapper results = modelPluginService
					.getModelService(getDatasource(adapterInstance, project).getType()).getRegisteredModel(request);

			return ResponseEntity.status(200).body(results.getResponse());
		} else {
			try {
				params.put(ICIPMlOpsConstants.IS_INSTANCE, isInstance);
				params.put(ICIPMlOpsConstants.MODEL_ID, modelId);
				String results = iCIPMlOpsRestAdapterService.callGetMethod(adapterInstance,
						ICIPMlOpsConstants.PROJECTS_MODELS_GET, project, headers, params);
				return ResponseEntity.status(200).body(results);
			} catch (Exception e) {
				return ResponseEntity.status(500).body(e.getMessage());
			}
		}
	}

	@DeleteMapping("/models/{model_id}")
	public ResponseEntity<String> deleteModel(@PathVariable(name = "model_id", required = true) String modelId,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isCached", required = true) Boolean isCached,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) throws IOException {
		Map<String, String> params = new HashMap<String, String>();
		if (isCached) {
			ICIPPolyAIRequestWrapper request = new ICIPPolyAIRequestWrapper();
			request.setHeader(headers);
			request.setOrganization(project);
			request.setName(adapterInstance);
			request.setParams(params);
			ICIPPolyAIResponseWrapper results = null;

			return ResponseEntity.status(200).body(results.getResponse());
		} else {
			try {
				params.put(ICIPMlOpsConstants.IS_INSTANCE, isInstance);
				params.put(ICIPMlOpsConstants.MODEL_ID, modelId);
				String results = iCIPMlOpsRestAdapterService.callDeleteMethod(adapterInstance,
						ICIPMlOpsConstants.PROJECTS_MODELS_DELETE, project, headers, params);
				return ResponseEntity.status(200).body(results);
			} catch (Exception e) {
				return ResponseEntity.status(500).body(e.getMessage());
			}
		}
	}

	@PostMapping("/models/{model_id}/export")
	public ResponseEntity<String> exportModels(@RequestBody String exportModelsbody,
			@PathVariable(name = "model_id", required = true) String modelId,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isCached", required = true) Boolean isCached,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) throws IOException {
		Map<String, String> params = new HashMap<String, String>();
		if (isCached) {
			ICIPPolyAIRequestWrapper request = new ICIPPolyAIRequestWrapper();
			request.setHeader(headers);
			request.setOrganization(project);
			request.setName(adapterInstance);
			request.setParams(params);
			request.setBody(exportModelsbody);
			logger.info("Request for ModelDeployment: " + request.toString());
			try {
				ICIPPolyAIResponseWrapper results = modelPluginService
						.getModelService(getDatasource(adapterInstance, project).getType()).deployModel(request);
				logger.info("Response for ModelDeployemnt: " + results.toString());
				return ResponseEntity.status(200).body(results.getResponse());
			} catch (Exception e) {
				logger.error(e.getMessage());
				return ResponseEntity.status(500).body(e.getMessage());
			}
		} else {
			try {
				params.put(ICIPMlOpsConstants.IS_INSTANCE, isInstance);
				params.put(ICIPMlOpsConstants.MODEL_ID, modelId);
				String results = iCIPMlOpsRestAdapterService.callPostMethod(adapterInstance,
						ICIPMlOpsConstants.PROJECTS_MODELS_EXPORT_CREATE, project, headers, params, exportModelsbody);
				return ResponseEntity.status(200).body(results);
			} catch (Exception e) {
				return ResponseEntity.status(500).body(e.getMessage());
			}
		}
	}

	@GetMapping("models/listAdapters")
	public ResponseEntity<String> listModelAdapters(@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "adapterType", required = false) String adapterType) throws IOException {
		JSONArray datasourceList = new JSONArray();
		JSONArray models = modelPluginService.getModelServiceJson(0, 0);
		if (adapterType == null) {
			models.forEach(model -> {
				if (model != null) {
					String type = ((JSONObject) model).getString("type");
					List<ICIPDatasource> datasources = datasourceService.findAllByTypeAndOrganization(type, project);
					if (datasources != null && datasources.size() >= 1) {
						datasources.forEach(ds -> {
							datasourceList.put(new JSONObject().put("name", ds.getName()).put("alias", ds.getAlias()));
						});
					}
				}
			});
		} else {
			List<String> adapterList = Arrays.asList(adapterType.split(","));
			models.forEach(model -> {
				if (model != null) {
					String type = ((JSONObject) model).getString("type");
					adapterList.forEach((e) -> {
						if (type.equalsIgnoreCase(e)) {
							List<ICIPDatasource> datasources = datasourceService.findAllByTypeAndOrganization(type,
									project);
							if (datasources != null && datasources.size() >= 1) {
								datasources.forEach(ds -> {
									datasourceList.put(
											new JSONObject().put("name", ds.getName()).put("alias", ds.getAlias()));
								});
							}
						}
					});
				}
			});
		}
		return ResponseEntity.status(200).body(datasourceList.toString());
	}

	@GetMapping("models/listAdapterTypes")
	public ResponseEntity<String> listModelAdapterTypes() throws IOException {
		JSONArray models = modelPluginService.getModelServiceJson(0, 0);
		JSONArray adapterTypeList = new JSONArray();
		models.forEach(model -> {
			if (model != null) {
				adapterTypeList.put(new JSONObject().put("name", ((JSONObject) model).getString("type")));
			}
		});
		return ResponseEntity.status(200).body(adapterTypeList.toString());
	}
	
	/**
	 * Gets the searched objects.
	 *
	 * @param datasetName        the dataset name
	 * @param projectName        the project name
	 * @param size               the size
	 * @param page               the page
	 * @param sortEvent          the sort event
	 * @param sortOrder          the sort order
	 * @param searchParams       the search params
	 * @param selectClauseParams the select clause params
	 * @return the searched objects
	 */
	@GetMapping(path = "models/fileData")
	public ResponseEntity<?> getfileData(@RequestParam(required = true, name = "modelName") String modelName,
			@RequestParam(required = true, name = "fileName") String fileName,
	        @RequestParam(required = true, name = "org") String org)
			 {
		ResponseEntity<?> resp;
		try {
			return iCIPMlOpsRestAdapterService.getS3FileData(modelName,fileName,org);
			
		} catch (Exception e) {
			resp = new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
			logger.error("EXCEPTION:", e.getMessage());
		}
		return resp;
	}
	
	@PostMapping(path = "models/upload")
	public ResponseEntity<?> uploadModel(@RequestBody ICIPMLFederatedModel requestBody,
			@RequestParam(required = false, name = "fileUploaded") String fileUploaded){
		ResponseEntity<?> resp;
		try {
			return iCIPMlOpsRestAdapterService.uploadModel(requestBody,fileUploaded);	
		} catch (Exception e) {
			resp = new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
			logger.error("EXCEPTION:", e.getMessage());
		}
		return resp;
	}

	@GetMapping("endpoints/listAdapters")
	public ResponseEntity<String> listEndpointAdapters(@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "adapterType", required = false) String adapterType) throws IOException {
		JSONArray datasourceList = new JSONArray();
		JSONArray models = modelPluginService.getModelServiceJson(0, 0);
		if (adapterType == null) {
			models.forEach(model -> {
				if (model != null) {
					String type = ((JSONObject) model).getString("type");
					List<ICIPDatasource> datasources = datasourceService.findAllByTypeAndOrganization(type, project);
					if (datasources != null && datasources.size() >= 1) {
						datasources.forEach(ds -> {
							datasourceList.put(new JSONObject().put("name", ds.getName()).put("alias", ds.getAlias()));
						});
					}
				}
			});
		} else {
			models.forEach(model -> {
				if (model != null) {
					String type = ((JSONObject) model).getString("type");
					if (type.equalsIgnoreCase(adapterType)) {
						List<ICIPDatasource> datasources = datasourceService.findAllByTypeAndOrganization(type,
								project);
						if (datasources != null && datasources.size() >= 1) {
							datasources.forEach(ds -> {
								datasourceList
										.put(new JSONObject().put("name", ds.getName()).put("alias", ds.getAlias()));
							});
						}
					}
				}
			});
		}
		return ResponseEntity.status(200).body(datasourceList.toString());
	}

	@GetMapping("endpoints/listAdapterTypes")
	public ResponseEntity<String> listEndpointAdapterTypes() throws IOException {
		JSONArray models = modelPluginService.getModelServiceJson(0, 0);
		ArrayList<String> adapterTypeList = new ArrayList<String>();
		models.forEach(model -> {
			if (model != null) {
				adapterTypeList.add(((JSONObject) model).getString("type"));
			}
		});
		return ResponseEntity.status(200).body(adapterTypeList.toArray().toString());
	}

	/* Training pipeline */

	@PostMapping("/pipelines/training/automl")
	public ResponseEntity<String> createTrainingPipelines(@RequestBody String pipelinebody,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isCached", required = true) Boolean isCached,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) {
		Map<String, String> params = new HashMap<String, String>();
		if (isCached) {
			String results = pluginService.getDataSetService(getDatasource(adapterInstance, project))
					.createTrainingPipelines(pipelinebody, adapterInstance, project, headers, params);

			return ResponseEntity.status(200).body(results);
		} else {
			try {
				params.put(ICIPMlOpsConstants.IS_INSTANCE, isInstance);
				String results = iCIPMlOpsRestAdapterService.callPostMethod(adapterInstance,
						ICIPMlOpsConstants.TRAINING_AUTOML_SIMPLIFIED_CREATE, project, headers, params, pipelinebody);
				return ResponseEntity.status(200).body(results);
			} catch (Exception e) {
				return ResponseEntity.status(500).body(e.getMessage());
			}
		}
	}

	@PostMapping("/pipelines/training/custom_script")
	public ResponseEntity<String> trainingCustomScriptCreate(@RequestBody String trainingCustomScriptbody,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isCached", required = true) Boolean isCached,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) {
		Map<String, String> params = new HashMap<String, String>();
		if (isCached) {
			String results = pluginService.getDataSetService(getDatasource(adapterInstance, project))
					.trainingCustomScriptCreate(trainingCustomScriptbody, adapterInstance, project, headers, params);

			return ResponseEntity.status(200).body(results);
		} else {
			try {
				params.put(ICIPMlOpsConstants.IS_INSTANCE, isInstance);
				String results = iCIPMlOpsRestAdapterService.callPostMethod(adapterInstance,
						ICIPMlOpsConstants.TRAINING_CUSTOM_SCRIPT_CREATE, project, headers, params,
						trainingCustomScriptbody);
				return ResponseEntity.status(200).body(results);
			} catch (Exception e) {
				return ResponseEntity.status(500).body(e.getMessage());
			}
		}
	}

	@GetMapping("/pipelines/training/list")
	public ResponseEntity<String> listTraining(
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "type", required = false) String type,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "page", required = false, defaultValue = "1") String page,
			@RequestParam(name = "size", required = false, defaultValue = "10") String size,
			@RequestParam(name = "orderBy", required = false) String orderBy,
			@RequestParam(name = "isCached", required = true) Boolean isCached,
			@RequestParam(name = "query", required = false) String query,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestParam(name = "interfacetype", required = false) String interfacetype,
			@RequestParam(name = "tags", required = false) String tags,

			@RequestHeader Map<String, String> headers) {
		Map<String, String> params = new HashMap<String, String>();
		if (isCached) {
			if (adapterInstance.equals("internal")) {
				Pageable paginate = PageRequest.of(Integer.valueOf(page) - 1, Integer.valueOf(size));
				List<Integer> tagList = new ArrayList<>();
				if (tags != null) {
					String[] splitValues = tags.split(",");
					for (String t : splitValues) {
						tagList.add(Integer.parseInt(t));
					}
				} else
					tagList = null;

				List<ICIPStreamingServices2DTO> results = streamingServicesService.getAllPipelinesByTypeAndOrg(project,
						paginate, query, tagList, orderBy, type, interfacetype);
				String response = new JSONArray(results).toString();
				return ResponseEntity.status(200).body(response);
			} else {
				String results = pluginService.getDataSetService(getDatasource(adapterInstance, project))
						.listTraining(adapterInstance, project, headers, params);

				return ResponseEntity.status(200).body(results);
			}
		} else {
			try {
				params.put(ICIPMlOpsConstants.IS_INSTANCE, isInstance);
				String results = iCIPMlOpsRestAdapterService.callGetMethod(adapterInstance,
						ICIPMlOpsConstants.TRAINING_ISTLIST, project, headers, params);
				return ResponseEntity.status(200).body(results);
			} catch (Exception e) {
				return ResponseEntity.status(500).body(e.getMessage());
			}
		}
	}

	@GetMapping("/pipelines/count")
	public ResponseEntity<Long> countPipelines(
			@RequestParam(name = "cloud_provider", required = true) String adapterInstance,
			@RequestParam(name = "type", required = false) String type,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "page", required = false, defaultValue = "1") String page,
			@RequestParam(name = "size", required = false, defaultValue = "10") String size,
			@RequestParam(name = "orderBy", required = false) String orderBy,
			@RequestParam(name = "isCached", required = true) Boolean isCached,
			@RequestParam(name = "query", required = false) String query,
			@RequestParam(name = "tags", required = false) String tags,
			@RequestParam(name = "interfacetype", required = false) String interfacetype,
			@RequestHeader Map<String, String> headers) {
		Map<String, String> params = new HashMap<String, String>();
		Pageable paginate = PageRequest.of(Integer.valueOf(page) - 1, Integer.valueOf(size));
		List<Integer> tagList = new ArrayList<>();
		if (tags != null) {
			String[] splitValues = tags.split(",");
			for (String t : splitValues) {
				tagList.add(Integer.parseInt(t));
			}
		} else
			tagList = null;

		Long results = streamingServicesService.getPipelinesCountByTypeAndOrg(project, query, tagList, orderBy, type,
				interfacetype);
//			String response = new JSONArray(results).toString();
		return ResponseEntity.status(200).body(results);
	}

	@PostMapping("/pipelines/training/train")
	public ResponseEntity<String> createTrain(@RequestBody String trainbody,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isCached", required = true) Boolean isCached,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) {
		Map<String, String> params = new HashMap<String, String>();
		if (isCached) {
			String results = pluginService.getDataSetService(getDatasource(adapterInstance, project))
					.createTrain(trainbody, adapterInstance, project, headers, params);

			return ResponseEntity.status(200).body(results);
		} else {
			try {
				params.put(ICIPMlOpsConstants.IS_INSTANCE, isInstance);
				String results = iCIPMlOpsRestAdapterService.callPostMethod(adapterInstance,
						ICIPMlOpsConstants.TRAINING_TRAIN_CREATE, project, headers, params, trainbody);
				return ResponseEntity.status(200).body(results);
			} catch (Exception e) {
				return ResponseEntity.status(500).body(e.getMessage());
			}
		}
	}

	@GetMapping("/pipelines/training/{training_job_id}/cancel")
	public ResponseEntity<String> trainingCancelList(
			@PathVariable(name = "training_job_id", required = true) String trainingJobId,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isCached", required = true) Boolean isCached,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) {
		Map<String, String> params = new HashMap<String, String>();
		if (isCached) {
			String results = pluginService.getDataSetService(getDatasource(adapterInstance, project))
					.trainingCancelList(adapterInstance, project, headers, params);

			return ResponseEntity.status(200).body(results);
		} else {
			try {
				params.put(ICIPMlOpsConstants.IS_INSTANCE, isInstance);
				params.put(ICIPMlOpsConstants.TRAINING_JOB_ID, trainingJobId);
				String results = iCIPMlOpsRestAdapterService.callGetMethod(adapterInstance,
						ICIPMlOpsConstants.TRAINING_CANCEL_LIST, project, headers, params);
				return ResponseEntity.status(200).body(results);
			} catch (Exception e) {
				return ResponseEntity.status(500).body(e.getMessage());
			}
		}
	}

	@DeleteMapping("projects_pipelines/{training_job_id}/delete")
	public ResponseEntity<String> deleteTraining(
			@PathVariable(name = "training_job_id", required = true) String trainingJobId,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isCached", required = true) Boolean isCached,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) {
		Map<String, String> params = new HashMap<String, String>();
		if (isCached) {
			String results = pluginService.getDataSetService(getDatasource(adapterInstance, project))
					.deleteTraining(adapterInstance, project, headers, params);

			return ResponseEntity.status(200).body(results);
		} else {
			try {
				params.put(ICIPMlOpsConstants.IS_INSTANCE, isInstance);
				params.put(ICIPMlOpsConstants.TRAINING_JOB_ID, trainingJobId);
				String results = iCIPMlOpsRestAdapterService.callDeleteMethod(adapterInstance,
						ICIPMlOpsConstants.TRAINING_DELETE, project, headers, params);
				return ResponseEntity.status(200).body(results);
			} catch (Exception e) {
				return ResponseEntity.status(500).body(e.getMessage());
			}
		}
	}

	@GetMapping("/pipelines/training/{training_job_id}/get")
	public ResponseEntity<String> getTrainingList(
			@PathVariable(name = "training_job_id", required = true) String trainingJobId,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isCached", required = true) Boolean isCached,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) {
		Map<String, String> params = new HashMap<String, String>();
		if (isCached) {
			String results = pluginService.getDataSetService(getDatasource(adapterInstance, project))
					.getTrainingList(adapterInstance, project, headers, params);

			return ResponseEntity.status(200).body(results);
		} else {
			try {
				params.put(ICIPMlOpsConstants.IS_INSTANCE, isInstance);
				params.put(ICIPMlOpsConstants.TRAINING_JOB_ID, trainingJobId);
				String results = iCIPMlOpsRestAdapterService.callGetMethod(adapterInstance,
						ICIPMlOpsConstants.TRAINING_GET_LIST, project, headers, params);
				return ResponseEntity.status(200).body(results);
			} catch (Exception e) {
				return ResponseEntity.status(500).body(e.getMessage());
			}
		}
	}

	/* Inference pipeline */

	@PostMapping("/pipelines/inference/")
	public ResponseEntity<String> createInferencePipeline(@RequestBody String inferencePipelinebody,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isCached", required = true) Boolean isCached,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) {
		Map<String, String> params = new HashMap<String, String>();
		if (isCached) {
			String results = pluginService.getDataSetService(getDatasource(adapterInstance, project))
					.createInferencePipeline(inferencePipelinebody, adapterInstance, project, headers, params);

			return ResponseEntity.status(200).body(results);
		} else {
			try {
				params.put(ICIPMlOpsConstants.IS_INSTANCE, isInstance);
				String results = iCIPMlOpsRestAdapterService.callPostMethod(adapterInstance,
						ICIPMlOpsConstants.PROJECTS_INFERENCEPIPELINES_CREATE, project, headers, params,
						inferencePipelinebody);
				return ResponseEntity.status(200).body(results);
			} catch (Exception e) {
				return ResponseEntity.status(500).body(e.getMessage());
			}
		}
	}

	@GetMapping("/pipelines/inference/list")
	public ResponseEntity<String> listInferencePipeline(
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "filter", required = false) String filter,
			@RequestParam(name = "orderBy", required = false) String orderBy,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isCached", required = true) Boolean isCached,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) {
		Map<String, String> params = new HashMap<String, String>();
		if (isCached) {
			String results = pluginService.getDataSetService(getDatasource(adapterInstance, project))
					.listInferencePipeline(adapterInstance, project, headers, params);

			return ResponseEntity.status(200).body(results);
		} else {
			try {
				params.put(ICIPMlOpsConstants.IS_INSTANCE, isInstance);
				String results = iCIPMlOpsRestAdapterService.callGetMethod(adapterInstance,
						ICIPMlOpsConstants.PROJECTS_INFERENCEPIPELINES_LIST_LIST, project, headers, params);
				return ResponseEntity.status(200).body(results);
			} catch (Exception e) {
				return ResponseEntity.status(500).body(e.getMessage());
			}
		}
	}

	@DeleteMapping("/pipelines/inference/{inference_job_id}")
	public ResponseEntity<String> deleteInferencePipeine(
			@PathVariable(name = "inference_job_id", required = true) String inferenceJobId,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isCached", required = true) Boolean isCached,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers)
			throws ClientProtocolException, IOException, URISyntaxException {
		Map<String, String> params = new HashMap<String, String>();
		if (isCached) {
			String results = pluginService.getDataSetService(getDatasource(adapterInstance, project))
					.deleteInferencePipeine(adapterInstance, project, headers, params);
			return ResponseEntity.status(200).body(results);
		} else {
			try {
				params.put(ICIPMlOpsConstants.IS_INSTANCE, isInstance);
				params.put(ICIPMlOpsConstants.INFERENCE_JOB_ID, inferenceJobId);
				String results = iCIPMlOpsRestAdapterService.callDeleteMethod(adapterInstance,
						ICIPMlOpsConstants.PROJECTS_INFERENCEPIPELINES_DELETE, project, headers, params);
				return ResponseEntity.status(200).body(results);
			} catch (Exception e) {
				return ResponseEntity.status(500).body(e.getMessage());
			}
		}
	}

	@PostMapping("/pipelines/inference/{inference_job_id}/cancel")
	public ResponseEntity<String> inferencePipelineCancel(@RequestBody String cancelPipelinebody,
			@PathVariable(name = "inference_job_id", required = true) String inferenceJobId,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isCached", required = true) Boolean isCached,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) {
		Map<String, String> params = new HashMap<String, String>();
		if (isCached) {
			String results = pluginService.getDataSetService(getDatasource(adapterInstance, project))
					.inferencePipelineCancel(cancelPipelinebody, adapterInstance, project, headers, params);

			return ResponseEntity.status(200).body(results);
		} else {
			try {
				params.put(ICIPMlOpsConstants.IS_INSTANCE, isInstance);
				params.put(ICIPMlOpsConstants.INFERENCE_JOB_ID, inferenceJobId);
				String results = iCIPMlOpsRestAdapterService.callPostMethod(adapterInstance,
						ICIPMlOpsConstants.PROJECTS_INFERENCEPIPELINES_CANCEL, project, headers, params,
						cancelPipelinebody);
				return ResponseEntity.status(200).body(results);
			} catch (Exception e) {
				return ResponseEntity.status(500).body(e.getMessage());
			}
		}
	}

	@PostMapping("/pipelines/inference/{inference_job_id}/get")
	public ResponseEntity<String> getInferencePipelineList(@RequestBody String getPipelinebody,
			@PathVariable(name = "inference_job_id", required = true) String inferenceJobId,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isCached", required = true) Boolean isCached,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) {
		Map<String, String> params = new HashMap<String, String>();
		if (isCached) {
			String results = pluginService.getDataSetService(getDatasource(adapterInstance, project))
					.getInferencePipelineList(getPipelinebody, adapterInstance, project, headers, params);

			return ResponseEntity.status(200).body(results);
		} else {
			try {
				params.put(ICIPMlOpsConstants.IS_INSTANCE, isInstance);
				params.put(ICIPMlOpsConstants.INFERENCE_JOB_ID, inferenceJobId);
				String results = iCIPMlOpsRestAdapterService.callPostMethod(adapterInstance,
						ICIPMlOpsConstants.PROJECTS_INFERENCEPIPELINES_GET, project, headers, params, getPipelinebody);
				return ResponseEntity.status(200).body(results);
			} catch (Exception e) {
				return ResponseEntity.status(500).body(e.getMessage());
			}
		}
	}

	public ICIPDatasource getDatasource(String datasource, String org) {
		return datasourceService.getDatasource(datasource, org);

	}

	@GetMapping("/endpoints/list/count")
	public ResponseEntity<Long> getAllEndpointsCount(@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "type", required = false) String type,
			@RequestParam(name = "instance", required = false) String instance,
			@RequestParam(name = "tags", required = false) String tags,
			@RequestParam(name = "query", required = false) String query,
			@RequestParam(name = "orderBy", required = false) String orderBy,
			@RequestParam(name = "isCached", required = true) Boolean isCached) throws IOException {
		List<Integer> tagList = new ArrayList<>();
		if (tags != null) {
			String[] splitValues = tags.split(",");
			for (String t : splitValues) {
				tagList.add(Integer.parseInt(t));
			}
		} else
			tagList = null;

		Long results = fedEndpointService.getAllModelsCountByAdpateridAndOrganisation(instance, project, tagList, query,
				orderBy, type);

		return ResponseEntity.status(200).body(results);

	}

	@GetMapping("/datasets/list/count")
	public ResponseEntity<Long> getAllDatasetsCount(@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "datasource", required = false) String datasource,
			@RequestParam(name = "isTemplate", required = false) Boolean isTemplate,
			@RequestParam(name = "query", required = false) String query) throws IOException {
		if (datasource != null) {
			Long results = datasetService.getAllDatasetsCountByOrganisationAndDatasource(project, query, datasource);
			return ResponseEntity.status(200).body(results);
		} else {
			Long results = datasetService.getAllDatasetsCountByOrganisation(project, query, isTemplate);
			return ResponseEntity.status(200).body(results);
		}
	}

	@GetMapping("/datasets/list/datasource")
	public ResponseEntity<List<ICIPDataset>> getAllDatasetByDatasource(
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "datasource", required = true) String datasource,
			@RequestParam(name = "search", required = false) String search,
			@RequestParam(name = "page", required = false, defaultValue = "1") String page,
			@RequestParam(name = "size", required = false, defaultValue = "10") String size) throws IOException {
		Pageable paginate = PageRequest.of(Integer.valueOf(page) - 1, Integer.valueOf(size));
		List<ICIPDataset> results = datasetService.getAllDatasetsByDatasource(project, datasource, search, paginate);
		return ResponseEntity.status(200).body(results);

	}

	@GetMapping("tags/fetchAll")
	@Timed
	public ResponseEntity<List<ICIPTags>> getAllTags(@RequestParam(name = "project", required = false) String project,
			@RequestParam(name = "service", required = false) String service) {
		List<ICIPTags> result;
		if (!(project == null || service == null)) {
			result = tagsService.getAllTagsByProjectAndService(project, service);
		} else {
			result = tagsService.getTags();
		}
		return new ResponseEntity<>(result, HttpStatus.OK);

	}

	@PostMapping("/tags/addTag")
	public ResponseEntity<ICIPTags> addTag(@RequestBody ICIPTags alltag) {
		ICIPTags results = tagsService.addTags(alltag);

		return ResponseEntity.status(200).body(results);
	}

	@PostMapping("/tags/updateTag/{id}")
	public ResponseEntity<ICIPTags> updateTag(@RequestBody ICIPTags alltag, @PathVariable(name = "id") Integer id) {
		ICIPTags results = tagsService.updateTags(id, alltag);

		return ResponseEntity.status(200).body(results);
	}

	@DeleteMapping("/tags/delete/{id}")
	public ResponseEntity<Void> deleteTag(@PathVariable(name = "id") Integer id) {
		tagsService.deleteTags(id);

//		return ResponseEntity.status(200).body(results);
		return ResponseEntity.ok().headers(ICIPHeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString()))
				.build();
	}

	@GetMapping("/schemas/list")
	public ResponseEntity<String> getSchemasList(@RequestParam(name = "filter", required = false) String filter,
			@RequestParam(name = "orderBy", required = true) String orderBy,
			@RequestParam(name = "project", required = true) String project, @RequestHeader Map<String, String> headers)

	{
		Map<String, String> params = new HashMap<String, String>();
		List<ICIPSchemaRegistry> results = schemasService.fetchAllByOrgAndQuery(filter, project);
//		List<ICIPSchemaRegistry> results = schemasService.fetchAllByOrg(project);
		String response = new JSONArray(results).toString();
		return ResponseEntity.status(200).body(response);
	}

	@GetMapping("/adapters/list")
	public ResponseEntity<String> getAdaptersList(@RequestParam(name = "filter", required = true) String filter,
			@RequestParam(name = "orderBy", required = true) String orderBy,
			@RequestParam(name = "project", required = true) String project, @RequestHeader Map<String, String> headers)

	{
		Map<String, String> params = new HashMap<String, String>();
		List<ICIPDatasource> results = datasourceService.getAdaptersByOrg(project);
		String response = new JSONArray(results).toString();
		return ResponseEntity.status(200).body(response);

	}

	@GetMapping("/datasources/list")
	public ResponseEntity<List<ICIPDatasource>> getDatasourcesList(@RequestParam(name = "type", required = false) String type,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "nameoralias", required = false) String nameoralias,
			@RequestParam(name = "page", required = false) Integer page,
	        @RequestParam(name = "size",required = false) Integer size){
		Pageable pageable = (page==null||size==null) ? null : PageRequest.of(Math.max(page - 1, 0), size);
		return ResponseEntity.status(200)
				.body(datasourceService.getDataSourceByOptionalParameters(project, type, nameoralias, pageable).getContent());
		
	}
	
	
	@GetMapping("/datasources/count")
	public ResponseEntity<Long> getDatasourcesCount(@RequestParam(name = "type", required = false) String type,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "nameoralias", required = false) String nameoralias ){
		return ResponseEntity.status(200)
				.body(datasourceService.getDataSourceCountByOptionalParameters(project, type, nameoralias));
		
	}
	
	
	@GetMapping("/instances/list")
	public ResponseEntity<String> getInstancesList(@RequestParam(name = "filter", required = true) String filter,
			@RequestParam(name = "orderBy", required = true) String orderBy,
			@RequestParam(name = "project", required = true) String project, @RequestHeader Map<String, String> headers)

	{
		Map<String, String> params = new HashMap<String, String>();
		List<ICIPMlIntstance> results = instanceService.getICIPMlIntstancesByOrg(project);
		String response = new JSONArray(results).toString();
		return ResponseEntity.status(200).body(response);

	}

	@GetMapping("/streamingServices/{nameStr}/{org}")
	public ResponseEntity<ICIPStreamingServices> getStreamingServices(@PathVariable(name = "nameStr") String name,
			@PathVariable(name = "org") String org) {
		logger.info("Fetching streaming services by name : {}-{}", name, org);
		return new ResponseEntity<>(streamingServicesService.getICIPStreamingServices(name, org), new HttpHeaders(),
				HttpStatus.OK);
	}

	@GetMapping("/streamingServicesByAlias/{alias}/{org}")
	public ResponseEntity<String> getStreamingServicesByAlias(@PathVariable(name = "alias") String alias,
			@PathVariable(name = "org") String org) {
		logger.info("Fetching streaming services by alias : {}-{}", alias, org);
		logger.info(streamingServicesService.getICIPStreamingServicesByAlias(alias, org));
		return ResponseEntity.status(200)
				.body(streamingServicesService.getICIPStreamingServicesByAlias(alias, org).toString());
	}

	@PostMapping("/add/tags")
	public ResponseEntity<String> gettaging(
//			@RequestBody String tagIds,
			@RequestParam(name = "tagIds", required = true) String tagIds,
			@RequestParam(name = "entityId", required = true) String entityId,
			@RequestParam(name = "entityType", required = true) String entityType,
			@RequestParam(name = "organization", required = true) String organization) {
		Map<String, String> params = new HashMap<String, String>();
		String results = taggingEntityService.addTags(tagIds, entityId, entityType, organization);

		return ResponseEntity.status(200).body(results);
	}

	@PostMapping("/streamingServices/add")
	@Transactional
	public ResponseEntity<?> createStreamingServices(@RequestBody ICIPStreamingServicesDTO streamingServicesDTO,
			@RequestAttribute(required = false, name = "organization") String org)
			throws URISyntaxException, SQLException {
		logger.info(streamingServicesDTO.getAlias());
		List<ICIPStreamingServices> existlist = streamingServicesService
				.getPipelinesByAliasAndOrg(streamingServicesDTO.getAlias(), streamingServicesDTO.getOrganization());
		if (existlist.isEmpty()) {
			logger.info("Creating Streaming Service : {}", streamingServicesDTO.getName());
			streamingServicesDTO.setCreatedBy(ICIPUtils.getUser(claim));
			streamingServicesDTO.setLastmodifiedby(ICIPUtils.getUser(claim));
			streamingServicesDTO.setLastmodifieddate(Timestamp.from(Instant.now()));
			ModelMapper modelmapper = new ModelMapper();
			ICIPStreamingServices streamingServices = modelmapper.map(streamingServicesDTO,
					ICIPStreamingServices.class);
			ICIPStreamingServices result = streamingServicesService.save(streamingServices);
			return ResponseEntity.created(new URI("/streamingServices/" + result.getCid()))
					.headers(ICIPHeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getCid().toString()))
					.body(result);
		} else {
			return ResponseEntity.status(400).body("Display name already exists.");
		}

	}

	@GetMapping("/groups/all")
	public ResponseEntity<List<ICIPPartialGroups>> getGroups(@RequestParam(name = "org", required = true) String org,
			@RequestParam(name = "page", defaultValue = "0", required = false) String page,
			@RequestParam(name = "size", defaultValue = "12", required = false) String size) {
		logger.info("Getting Groups by Organization [/all] : {} ", org);
		return new ResponseEntity<>(iICIPPartialGroupsService.getGroups(org), new HttpHeaders(), HttpStatus.OK);
	}

	@PostMapping("/save/image")
	public ResponseEntity<ICIPImageSaving> saveImage(@RequestBody ICIPImageSaving iCIPImageSaving) {
		ICIPImageSaving results = ICIPImageSavingService.saveImage(iCIPImageSaving);
		return ResponseEntity.status(200).body(results);
	}

	@PutMapping("/image/update")
	public ResponseEntity<ICIPImageSaving> updateImage(@RequestBody ICIPImageSaving iCIPImageSaving) {
		ICIPImageSaving results = ICIPImageSavingService.updateImage(iCIPImageSaving);
		return ResponseEntity.status(200).body(results);
	}

	@GetMapping("/getMappedTags")
	public ResponseEntity<String> geMappedTags(@RequestParam(name = "entityId", required = true) int entityId,
			@RequestParam(name = "entityType", required = true) String entityType,
			@RequestParam(name = "organization", required = true) String organization) {

		JSONArray results = taggingEntityService.getMappedTags(entityId, entityType, organization);

		return ResponseEntity.status(200).body(results.toString());
	}

	@GetMapping("/plugin/all/{pluginType}/{org}")
	public ResponseEntity<?> getPlugin(@PathVariable(name = "pluginType") String pluginType,
			@PathVariable(name = "org") String org) {
		logger.info("Getting Plugin type : {}", pluginType);
		return new ResponseEntity<>(pluginDetailsService.fetchByTypeAndOrg(pluginType, org), new HttpHeaders(),
				HttpStatus.OK);
	}

	/**
	 * Creates the streaming services.
	 *
	 * @param streamingServicesDTO the streaming services DTO
	 * @param org                  the org
	 * @return the response entity
	 * @throws URISyntaxException the URI syntax exception
	 * @throws SQLException       the SQL exception
	 */
	/**
	 * Update streaming services.
	 *
	 * @param streamingServicesDTO the streaming services DTO
	 * @param org                  the org
	 * @return the response entity
	 * @throws URISyntaxException     the URI syntax exception
	 * @throws SQLException           the SQL exception
	 * @throws IOException
	 * @throws GitAPIException
	 * @throws TransportException
	 * @throws InvalidRemoteException
	 */
	@PutMapping("/streamingServices/update")
	public ResponseEntity<?> updateStreamingServices(@RequestBody ICIPStreamingServicesDTO streamingServicesDTO,
			@RequestAttribute(required = false, name = "organization") String org) throws URISyntaxException,
			SQLException, InvalidRemoteException, TransportException, GitAPIException, IOException {
		if (streamingServicesDTO.getCid() == null) {
			return createStreamingServices(streamingServicesDTO, org);
		}
		streamingServicesDTO.setLastmodifiedby(ICIPUtils.getUser(claim));
		streamingServicesDTO.setLastmodifieddate(Timestamp.from(Instant.now()));
		if (streamingServicesDTO.getAlias() == null || streamingServicesDTO.getAlias().trim().isEmpty()) {
			streamingServicesDTO.setAlias(streamingServicesDTO.getName());
		} else {
			streamingServicesDTO.setAlias(streamingServicesDTO.getAlias());
		}
		logger.info("Updating streaming service : {}", streamingServicesDTO.getName());
		ModelMapper modelmapper = new ModelMapper();
		ICIPStreamingServices streamingServices = modelmapper.map(streamingServicesDTO, ICIPStreamingServices.class);
		ICIPStreamingServices result = streamingServicesService.update(streamingServices);
		return ResponseEntity.ok().headers(
				ICIPHeaderUtil.createEntityUpdateAlert("streamingServices", streamingServices.getCid().toString()))
				.body(result);
	}

	@GetMapping("/plugin/allPlugins/{org}")
	public ResponseEntity<List<ICIPPlugin>> getPlugins(@PathVariable(name = "org") String org) {
		logger.info("Getting all plugins");
		return new ResponseEntity<>(pipelinePluginService.findByOrg(org), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the streaming services.
	 *
	 * @param id the id
	 * @return the streaming services
	 */
	@GetMapping("/streamingServices/{id}")
	public ResponseEntity<ICIPStreamingServices> getStreamingServices(@PathVariable(name = "id") Integer id) {
		logger.info("Fetching streaming services by id : {} ", id);
		return new ResponseEntity<>(streamingServicesService.findOne(id), new HttpHeaders(), HttpStatus.OK);
	}

	@PostMapping(value = "/streamingServices/saveJson/{name}/{org}")
	public ResponseEntity<?> savePipelineJson(@PathVariable(value = "name") String name,
			@PathVariable(value = "org") String org, @RequestBody String body) {
		JSONObject obj = new JSONObject();
		String path = streamingServicesService.savePipelineJson(name, org, body);
		obj.append("path", path);
		return new ResponseEntity<>(obj.toString(), new HttpHeaders(), HttpStatus.OK);

	}

	/**
	 * Gets the streaming services.
	 *
	 * @param id the id
	 * @return the streaming services
	 */
	@GetMapping("/agents/{id}")
	public ResponseEntity<ICIPAgents> getAgent(@PathVariable(name = "id") Integer id) {
		ICIPAgents agents = agentService.findOne(id);
		logger.info("Fetching streaming services by id : {} ", id);
		return new ResponseEntity<>(agents, new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the streaming service jobs len.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the streaming service jobs len
	 */
	@GetMapping("/agentjobs/streamingLen/{nameStr}/{org}")
	public ResponseEntity<Long> getAgentStreamingServiceJobsLen(@PathVariable(name = "nameStr") String name,
			@PathVariable(name = "org") String org) {
		return new ResponseEntity<>(iICIPAgentJobsService.countByCnameAndOrganization(name, org), new HttpHeaders(),
				HttpStatus.OK);
	}

	/**
	 * Gets the streaming service jobs len.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the streaming service jobs len
	 */
	@GetMapping("/jobs/streamingLen/{nameStr}/{org}")
	public ResponseEntity<Long> getStreamingServiceJobsLen(@PathVariable(name = "nameStr") String name,
			@PathVariable(name = "org") String org) {
		return new ResponseEntity<>(iICIPJobsService.countByStreamingServiceAndOrganization(name, org),
				new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the job console.
	 *
	 * @param jobId  the job id
	 * @param offset the offset
	 * @param org    the org
	 * @param lineno the lineno
	 * @param status the status
	 * @return the job console
	 * @throws IOException
	 */
	@GetMapping("/agentjobs/console/{jobId}")
	public ResponseEntity<ICIPAgentJobs> getAgentJobConsole(@PathVariable(name = "jobId") String jobId,
			@RequestParam(name = "offset", required = false, defaultValue = "0") int offset,
			@RequestParam(name = "org", required = true) String org,
			@RequestParam(name = "lineno", required = true) int lineno,
			@RequestParam(name = "status", required = true) String status) throws IOException {
		logger.debug("Getting Job response with log");

		return new ResponseEntity<>(iICIPAgentJobsService.findByJobIdWithLog(jobId, offset, lineno, org, status),
				new HttpHeaders(), HttpStatus.OK);

	}

	/**
	 * Gets the job console.
	 *
	 * @param jobId  the job id
	 * @param offset the offset
	 * @param org    the org
	 * @param lineno the lineno
	 * @param status the status
	 * @return the job console
	 * @throws IOException
	 */
	@GetMapping("/jobs/console/{jobId}")
	public ResponseEntity<ICIPJobs> getJobConsole(@PathVariable(name = "jobId") String jobId,
			@RequestParam(name = "offset", required = false, defaultValue = "0") int offset,
			@RequestParam(name = "org", required = true) String org,
			@RequestParam(name = "lineno", required = true) int lineno,
			@RequestParam(name = "status", required = true) String status) throws IOException {
		logger.debug("Getting Job response with log");

		return new ResponseEntity<>(iICIPJobsService.findByJobIdWithLog(jobId, offset, lineno, org, status),
				new HttpHeaders(), HttpStatus.OK);

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
	@GetMapping("/agentjobs/{nameStr}/{org}")
	public ResponseEntity<List<ICIPPartialAgentJobs>> getAgentJobsByModel(@PathVariable(name = "nameStr") String name,
			@PathVariable(name = "org") String org, @RequestParam(required = false, name = "page") String page,
			@RequestParam(required = false, name = "size") String size) {
		if (name.equals("all")) {
			logger.info("Getting Jobs");
		} else {
			logger.info("Getting Jobs for Streaming Service  : {}", name);
		}
		return new ResponseEntity<>(
				iICIPAgentJobsService.getJobsByService(name, Integer.valueOf(page), Integer.valueOf(size), org),
				new HttpHeaders(), HttpStatus.OK);
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
	@GetMapping("/jobs/{nameStr}/{org}")
	public ResponseEntity<List<ICIPJobsPartial>> getJobsByModel(@PathVariable(name = "nameStr") String name,
			@PathVariable(name = "org") String org, @RequestParam(required = false, name = "page") String page,
			@RequestParam(required = false, name = "size") String size) {
		List<ICIPJobsPartial> listJobs = null;
		if (name.equals("all")) {
			logger.info("Getting Jobs");
			listJobs = iICIPJobsService.getAllJobsPartial(org, Integer.valueOf(page), Integer.valueOf(size));
		} else {
			logger.info("Getting Jobs for Streaming Service  : {}", name);
			listJobs = iICIPJobsService.getJobsPartialByService(name, Integer.valueOf(page), Integer.valueOf(size),
					org);
		}
		return new ResponseEntity<>(listJobs, new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Stop job.
	 *
	 * @param jobid the jobid
	 * @return the response entity
	 */
	@GetMapping("/jobs/stopJob/{jobid}")
	public ResponseEntity<Void> stopJob(@PathVariable(name = "jobid") String jobid) {
		logger.info("Request to stop job");
		try {
			jobSyncExecutorService.stopLocalJob(jobid);
			return new ResponseEntity<>(new HttpHeaders(), HttpStatus.OK);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			return new ResponseEntity<>(new HttpHeaders(), HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * output artifacts.
	 *
	 * @param jobid the jobid
	 * @return the response entity
	 */
	@GetMapping("/jobs/outputArtifacts/{jobid}")
	public ResponseEntity<String> outputArtifact(@PathVariable(name = "jobid") String jobid) {
		logger.info("Request to outputArtifacts");
		try {

			return new ResponseEntity<>(jobSyncExecutorService.outputArtifacts(jobid).toString(), new HttpHeaders(),
					HttpStatus.OK);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			return new ResponseEntity<>(new HttpHeaders(), HttpStatus.BAD_REQUEST);
		}
	}

	@GetMapping("/jobs/outputArtifactscorelid/{corelid}")
	public ResponseEntity<String> outputArtifacts(@PathVariable(name = "corelid") String corelid) {
		logger.info("Request to outputArtifacts");
		try {

			return new ResponseEntity<>(jobSyncExecutorService.outputArtifactsCorelid(corelid).toString(),
					new HttpHeaders(), HttpStatus.OK);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			return new ResponseEntity<>(new HttpHeaders(), HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Gets the all pipelines names by org.
	 *
	 * @param org the org
	 * @return the all pipelines by org
	 */
	@GetMapping(path = "/streamingServices/allPipelineNames")
	public ResponseEntity<List<NameAndAliasDTO>> getAllPipelineNamesByOrg(@RequestParam(name = "org") String org) {

		return new ResponseEntity<>(streamingServicesService.getAllPipelineNamesByOrg(org), HttpStatus.OK);
	}

	@GetMapping(path = "/streamingServices/generatedScript")
	public ResponseEntity<?> getGeneratedScript(@RequestParam(name = "name") String name,
			@RequestParam(name = "org") String org) {
		JSONObject fileObj = null;
		fileObj = streamingServicesService.getGeneratedScript(name, org);

		return new ResponseEntity<>(fileObj.toString(), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Trigger post event.
	 *
	 * @param name    the name
	 * @param org     the org
	 * @param corelid the corelid
	 * @param params  the params
	 * @param payload the payload
	 * @return the response entity
	 */
	@PostMapping(value = "/event/trigger/{name}", produces = "application/json")
	public ResponseEntity<String> triggerPostEvent(@PathVariable("name") String name,
			@RequestParam(name = "org") String org, @RequestParam(name = "corelid", required = false) String corelid,
			@RequestParam(name = "datasourceName", required = false) String datasourceName,
			@RequestBody String payload) {
		try {
			Gson gson = new GsonBuilder().disableHtmlEscaping().create();
			if (payload == null || payload.trim().equalsIgnoreCase("null") || payload.trim().isEmpty()) {
				payload = "{}";
			}
			JsonObject json = gson.fromJson(payload, JsonObject.class);
			payload = gson.toJson(json);
			return new ResponseEntity<>(eventMappingService.trigger(name, org, corelid, payload, datasourceName),
					HttpStatus.OK);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			return new ResponseEntity<>("Triggering Error!", HttpStatus.BAD_REQUEST);
		}
	}

	@GetMapping(path = "/streamingServices/readAllScripts")
	public ResponseEntity<?> getAllScripts(@RequestParam(name = "name") String name,
			@RequestParam(name = "org") String org) {
		JSONObject fileObj = null;
		fileObj = streamingServicesService.getAllScripts(name, org);

		return new ResponseEntity<>(fileObj.toString(), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the job by corelid.
	 *
	 * @param corelid the corelid
	 * @return the job by corelid
	 */
	@GetMapping("/jobs/corelid/{corelid}")
	public ResponseEntity<List<ICIPJobsPartial>> getJobByCorelid(@PathVariable(name = "corelid") String corelid) {
		logger.debug("Getting Job by corelid");
		return new ResponseEntity<>(iICIPJobsService.findByCorelid(corelid), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the job console.
	 *
	 * @param jobId  the job id
	 * @param offset the offset
	 * @param org    the org
	 * @param lineno the lineno
	 * @param status the status
	 * @return the job console
	 * @throws IOException
	 */
	@GetMapping("/internaljob/console/{jobId}")
	public ResponseEntity<ICIPInternalJobs> getInternalJobConsole(@PathVariable(name = "jobId") String jobId,
			@RequestParam(name = "offset", required = false, defaultValue = "0") int offset,
			@RequestParam(name = "org", required = true) String org,
			@RequestParam(name = "lineno", required = true) int lineno,
			@RequestParam(name = "status", required = true) String status) throws IOException {
		logger.debug("Getting Job console");
		return new ResponseEntity<>(iICIPInternalJobsService.findByJobIdWithLog(jobId, offset, lineno, org, status),
				new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Download pipeline log file.
	 *
	 * @param id the id
	 * @return the response entity
	 */
	@GetMapping(path = "/file/download/log/pipeline", produces = FileConstants.OCTET_STREAM)
	public ResponseEntity<byte[]> downloadPipelineLogFile(@RequestParam(name = "id", required = true) String id) {
		logger.info("post request to download pipeline log");
		try {
			byte[] bytesArray = fileService.downloadLogFile(id, IAIJobConstants.PIPELINELOGPATH);
			return ResponseEntity.ok().contentLength(bytesArray.length)
					.header(HttpHeaders.CONTENT_TYPE, FileConstants.OCTET_STREAM)
					.header(HttpHeaders.CONTENT_DISPOSITION, FileConstants.ATTACHMENT + id + ".log").body(bytesArray);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	@GetMapping(value = "/jobs/image", produces = MediaType.IMAGE_JPEG_VALUE)
	public ResponseEntity<?> getImage(@RequestParam(name = "path") String path) throws IOException {
		logger.debug("Getting image by path");
		BufferedImage bImage = ImageIO.read(new File(path));
		ByteArrayOutputStream bos = new ByteArrayOutputStream();
		ImageIO.write(bImage, "png", bos);
		byte[] data = bos.toByteArray();
		return new ResponseEntity<>(data, HttpStatus.OK);
	}

	/**
	 * Run pipeline.
	 *
	 * @param jobType the runtime
	 * @param cname   the cname
	 * @param org     the org
	 * @param runtime the is local
	 * @param params  the params
	 * @param offset  the offset
	 * @param alias   the alias
	 * @return the response entity
	 */
	@GetMapping(value = "/pipeline/run-pipeline/{jobType}/{cname}/{org}/{runtime}")
	public ResponseEntity<?> runPipeline(@PathVariable(name = "jobType") String jobType,
			@PathVariable(name = "cname") String cname, @PathVariable(name = "org") String org,
			@PathVariable(name = "runtime") String runtime,
			@RequestParam(name = "param", required = false) String params,
			@RequestParam(name = "offset", required = false) int offset,
			@RequestParam(name = "alias", required = false) String alias,
			@RequestParam(name = "datasource", required = false) String datasource,
			@RequestParam(name = "workerlogId", required = false) String workerlogId) {
		logger.info("Submitting the Pipeline to Job Server [isLocal : {}]", runtime);
		String corelid = ICIPUtils.generateCorrelationId();
//		return pipelineService.createJob(jobType, cname, alias, org, runtime, params, ICIPUtils.generateCorrelationId(),
//				offset,datasource);
		ResponseEntity<?> response = pipelineService.createJob(jobType, cname, alias, org, runtime, params, corelid,
				offset, datasource, workerlogId);
		logger.info("run output");
		logger.info(response.toString());

		return new ResponseEntity<>(response.getBody().toString(), HttpStatus.OK);
	}

	/**
	 * Gets the runtime types.
	 *
	 * @param page the page
	 * @param size the size
	 * @return the types
	 */
	@GetMapping("/jobs/runtime/types/{org}")
	public ResponseEntity<String> getRuntimeTypes(
			@RequestParam(name = "page", defaultValue = "0", required = false) String page,
			@RequestParam(name = "size", defaultValue = "12", required = false) String size,
			@PathVariable(name = "org") String org) {

		JSONArray types = jobsRuntimePluginServce.getJobRuntimeJson();
		JSONArray runtimeList = new JSONArray();
		types.forEach(x -> {
			String type = ((JSONObject) x).getString("type");
			if (type.equalsIgnoreCase("local")) {
				runtimeList.put(new JSONObject().put("type", type).put("dsName", "").put("dsAlias", ""));
			} else {

				List<ICIPDatasource> datasources = datasourceRepository.findAllByTypeAndOrganization(type, org);
				if (datasources != null && datasources.size() >= 1) {
					datasources.parallelStream().forEach(ds -> {
						runtimeList.put(new JSONObject().put("type", type).put("dsName", ds.getName()).put("dsAlias",
								ds.getAlias()));
					});
				}
			}
		});
		JSONArray runtimeListFinal = new JSONArray();
		for (int i = 0; i < runtimeList.length(); i++) {
			JSONObject obj = runtimeList.getJSONObject(i);
			if (obj.has("dsName")) {
				ICIPDatasource datasource = iICIPDatasourceService.getDatasource(obj.getString("dsName"), org);
				
			
				
				if (datasource != null && datasource.getForruntime() != null) {
					if (datasource.getForruntime() == true) {
						runtimeListFinal.put(new JSONObject().put("type", datasource.getType())
								.put("dsName", datasource.getName()).put("dsAlias", datasource.getAlias()));
					}
				}
				
				if (datasource != null && datasource.getForapp() != null) {
					if (datasource.getForapp() == true) {
						
						runtimeListFinal.put(new JSONObject().put("type", datasource.getType())
								.put("dsName", datasource.getName()).put("dsAlias", datasource.getAlias())
								.put("dsCapability","app"));
					}
				}
				
			}
		}
		return ResponseEntity.ok().header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON.toString())
				.body(runtimeListFinal.toString());
	}

	/**
	 * Gets the spark job console.
	 *
	 * @param jobId the job id
	 * @return the spark job console
	 */
	@GetMapping("/jobs/spark/{jobId}")
	public ResponseEntity<String> getSparkJobConsole(@PathVariable(name = "jobId") String jobId) {
		logger.debug("Getting Spark Job response");
		return new ResponseEntity<>(iICIPJobsService.getSparkLog(jobId), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the datasources.
	 *
	 * @param org the org
	 * @return the datasources
	 */
	@GetMapping("/datasources/all")
	public ResponseEntity<List<ICIPDatasource>> getDatasources(@RequestParam(name = "org", required = false) String org) {
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
	 * Gets the schemas.
	 *
	 * @param org the org
	 * @return the schemas
	 */
	@GetMapping("/schemaRegistry/schemas")
	public ResponseEntity<List<NameAndAliasDTO>> getSchemas(@RequestParam(name = "org") String org) {
		logger.info("Get all schema of organziation {}", org);
		return new ResponseEntity<>(schemasService.getSchemaNamesByOrg(org), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the schema registry iai.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the schema registry iai
	 */
	@GetMapping("/schemaRegistry/schemas/{nameStr}/{org}")
	public ResponseEntity<ICIPSchemaRegistry> getSchemaByName(@PathVariable(name = "nameStr") String name,
			@PathVariable(name = "org") String org) {
		return new ResponseEntity<>(schemasService.getSchemaByName(name, org), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Save plugin.
	 *
	 * @param script     the script
	 * @param pluginName the plugin name
	 * @param type       the type
	 * @return the response entity
	 * @throws URISyntaxException the URI syntax exception
	 */
	@PostMapping("/pluginscript/add/{name}/{pluginName}/{type}")
	public ResponseEntity<ICIPPluginScript> savePlugin(@RequestBody String script,
			@PathVariable(name = "name") String name, @PathVariable(name = "pluginName") String pluginName,
			@PathVariable(name = "type") String type) throws URISyntaxException {
		logger.info("Saving plugin : {}", pluginName);
		return new ResponseEntity<>(pluginScriptService.save(name, script, type, pluginName), new HttpHeaders(),
				HttpStatus.OK);
	}

	@GetMapping("/datasources/getadapters/{org}")
	public ResponseEntity<List<ICIPDatasource>> getAdaptersByOrg(@PathVariable(name = "org") String org) {
		logger.info("Fetching adapter datasource ");
		List<ICIPDatasource> adapterTypes = iICIPDatasourceService.getAdaptersByOrg(org);
		return new ResponseEntity<>(adapterTypes, new HttpHeaders(), HttpStatus.OK);
	}

	@GetMapping("/pluginbytype/{type}/{org}")
	public ResponseEntity<ICIPPlugin> getPlugins(@PathVariable(name = "type") String type,
			@PathVariable(name = "org") String org) {
		logger.info("Getting all plugins");
		ICIPPlugin result = pipelinePluginService.getPluginByTypeAndOrg(type, org);
		return new ResponseEntity<>(result, new HttpHeaders(), HttpStatus.OK);
	}

	@GetMapping("/groups/all/{entityType}/{entity}")
	public ResponseEntity<List<ICIPGroups>> getGroupsForEntity(@PathVariable(name = "entityType") String entityType,
			@PathVariable("entity") String entity, @RequestParam(name = "org", required = true) String org) {
		List<ICIPGroupModel> groups = iICIPPartialGroupsService.getAllGroupsByOrgAndEntity(org, entity, entityType);
		logger.info("Getting Groups for Entity :{} ", groups);
		List grps = new ArrayList<>();
		groups.forEach(grp -> grps.add(grp.getGroups()));
		return new ResponseEntity<>(grps, new HttpHeaders(), HttpStatus.OK);
	}

	@GetMapping("/get/image/{name}/{org}")
	public ResponseEntity<ICIPImageSaving> getAppImage(@PathVariable(name = "name", required = true) String name,
			@PathVariable(name = "org", required = true) String org) {
		return new ResponseEntity<>(ICIPImageSavingService.getByNameAndOrg(name, org), new HttpHeaders(),
				HttpStatus.OK);

	}

	@GetMapping("/streamingServices/template/{name}/{org}")
	public ResponseEntity<ICIPStreamingServices> getTemplate(@PathVariable(name = "name", required = true) String name,
			@PathVariable(name = "org", required = true) String org) {
		return new ResponseEntity<>(streamingServicesService.getTemplateByName(name, org), new HttpHeaders(),
				HttpStatus.OK);

	}

	@GetMapping("/streamingServices/getTypes/{org}")
	public ResponseEntity<List<String>> getPipelinesTypes(@PathVariable(name = "org") String org) {
		logger.info("Fetching pipeline types");
		List<String> types = streamingServicesService.getPipelinesTypeByOrganization(org);
		logger.info(types.toString());
		return new ResponseEntity<>(types, new HttpHeaders(), HttpStatus.OK);
	}

	@GetMapping("/streamingServices/allPipelinesByOrg/{org}")
	public ResponseEntity<String> getallPipelinesByOrg(@PathVariable(name = "org") String org) {
		logger.info("Fetching pipeline types");
		List<ICIPStreamingServices2DTO> results = streamingServicesService.getAllPipelinesByOrg(org);
		String response = new JSONArray(results).toString();
		return ResponseEntity.status(200).body(response);

	}

	@GetMapping("/datasources/getTypes/{org}")
	public ResponseEntity<List<String>> getDatasourcesTypes(@PathVariable(name = "org") String org) {
		logger.info("Fetching datasources types");
		List<String> types = iICIPDatasourceService.getDatasourcesTypeByOrganization(org);
		logger.info(types.toString());
		return new ResponseEntity<>(types, new HttpHeaders(), HttpStatus.OK);
	}

	@GetMapping("/pipelines/{type}/{interfacetype}/{org}")
	public ResponseEntity<String> getPipelineByTypeAndInterface(@PathVariable("type") String type,
			@PathVariable("interfacetype") String interfacetype, @PathVariable("org") String org) {

		List<ICIPStreamingServices2DTO> results = streamingServicesService.getAllPipelinesByType(type, org,
				interfacetype);
		String response = new JSONArray(results).toString();
		return ResponseEntity.status(200).body(response);
	}

	@GetMapping("/pipelines/{interfacetype}/{org}")
	public ResponseEntity<String> getPipelineByInterfacetype(@PathVariable("interfacetype") String interfacetype,
			@PathVariable("org") String org) {

		List<ICIPStreamingServices2DTO> results = streamingServicesService.getAllPipelinesByInterfacetype(interfacetype,
				org);
		String response = new JSONArray(results).toString();
		return ResponseEntity.status(200).body(response);
	}

	@GetMapping("/templates/list")
	public ResponseEntity<String> listTemplates(
			@RequestParam(name = "cloud_provider", required = true) String adapterInstance,
			@RequestParam(name = "type", required = false) String type,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "page", required = false, defaultValue = "1") String page,
			@RequestParam(name = "size", required = false, defaultValue = "10") String size,
			@RequestParam(name = "orderBy", required = false) String orderBy,
			@RequestParam(name = "isCached", required = true) Boolean isCached,
			@RequestParam(name = "query", required = false) String query, @RequestHeader Map<String, String> headers) {
		Map<String, String> params = new HashMap<String, String>();
		if (adapterInstance.equals("internal")) {
			Pageable paginate = PageRequest.of(Integer.valueOf(page) - 1, Integer.valueOf(size));

			List<ICIPStreamingServices2DTO> results = streamingServicesService.getAllTemplatesByTypeAndOrg(project,
					paginate, query, orderBy, type);
			String response = new JSONArray(results).toString();
			return ResponseEntity.status(200).body(response);
		} else {
			String results = pluginService.getDataSetService(getDatasource(adapterInstance, project))
					.listTraining(adapterInstance, project, headers, params);

			return ResponseEntity.status(200).body(results);
		}
	}

	@GetMapping("/templates/count")
	public ResponseEntity<Long> countTemplates(
			@RequestParam(name = "cloud_provider", required = true) String adapterInstance,
			@RequestParam(name = "type", required = false) String type,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "page", required = false, defaultValue = "1") String page,
			@RequestParam(name = "size", required = false, defaultValue = "10") String size,
			@RequestParam(name = "orderBy", required = false) String orderBy,
			@RequestParam(name = "isCached", required = true) Boolean isCached,
			@RequestParam(name = "query", required = false) String query, @RequestHeader Map<String, String> headers) {
		Map<String, String> params = new HashMap<String, String>();
		Pageable paginate = PageRequest.of(Integer.valueOf(page) - 1, Integer.valueOf(size));

		Long results = streamingServicesService.getTemplatesCountByTypeAndOrg(project, query, orderBy, type);
//			String response = new JSONArray(results).toString();
		return ResponseEntity.status(200).body(results);
	}

	@PostMapping("/saveFile/{org}")
	public ResponseEntity<?> saveAppFile(@PathVariable("org") String org,
			@RequestPart(value = "file", required = false) MultipartFile file,
			@RequestPart(value = "chunkMetadata", required = false) String metadata) throws Exception {
		ObjectMapper mapper = new ObjectMapper();
		ICIPChunkMetaData chunkMetaData = mapper.readValue(metadata, ICIPChunkMetaData.class);
		String id = chunkMetaData.getFileName();
		appService.uploadFile(file, id, chunkMetaData, org);
		JSONObject response = new JSONObject();
		response.append("file", id);
		return new ResponseEntity<>(response.toString(), HttpStatus.OK);
	}

	@GetMapping("/getAppsType")
	public ResponseEntity<List<String>> getAppsType() {
		logger.info("Fetching pipeline types");
		List<String> types = appService.getAppsType();
		logger.info(types.toString());
		return new ResponseEntity<>(types, new HttpHeaders(), HttpStatus.OK);
	}

	@GetMapping("/videolist")
	public ResponseEntity<String> getVideoDatasetsList(@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "views", required = true) String views) {
		try {
			List<ICIPDataset> results = datasetService.getDatasetsByOrgandViews(project, views);
			String response = new JSONArray(results).toString();
			return ResponseEntity.status(200).body(response);

		} catch (Exception e) {
			return ResponseEntity.status(500).body(e.getMessage());
		}

	}

	@GetMapping("/fetchmodels")
	public ResponseEntity<String> getModelsByFedId(@RequestParam(name = "org", required = true) String org,
			@RequestParam(name = "fed_Name", required = true) String fedName) {
		try {
			List<ICIPMLFederatedModelDTO> results = fedModelService.getModelByFedModelNameAndOrg(fedName, org);
			String response = new JSONArray(results).toString();
			return ResponseEntity.status(200).body(response);

		} catch (Exception e) {
			return ResponseEntity.status(500).body(e.getMessage());
		}
	}

	@GetMapping("/fetchEndpoint")
	public ResponseEntity<String> getEndpointByFedId(@RequestParam(name = "org", required = true) String org,
			@RequestParam(name = "fed_Name", required = true) String fedName) {
		try {
			List<ICIPMLFederatedEndpointDTO> results = fedEndpointService.getEndpointByFedNameAndOrg(fedName, org);
			String response = new JSONArray(results).toString();
			return ResponseEntity.status(200).body(response);

		} catch (Exception e) {
			return ResponseEntity.status(500).body(e.getMessage());
		}
	}

	@GetMapping("/fetchPipeline")
	public ResponseEntity<String> getEndpointByName(@RequestParam(name = "org", required = true) String org,
			@RequestParam(name = "name", required = true) String name) {
		try {
			List<ICIPStreamingServices2DTO> results = streamingServicesService.getPipelineByNameAndOrg(name, org);
			String response = new JSONArray(results).toString();
			return ResponseEntity.status(200).body(response);

		} catch (Exception e) {
			return ResponseEntity.status(500).body(e.getMessage());
		}
	}

	@GetMapping("/fetchDatasource")
	public ResponseEntity<String> getDatasourceByName(@RequestParam(name = "org", required = true) String org,
			@RequestParam(name = "name", required = true) String name) {
		try {
			List<ICIPDatasource> results = datasourceService.findByNameAndOrg(name, org);
			String response = new JSONArray(results).toString();
			return ResponseEntity.status(200).body(response);

		} catch (Exception e) {
			return ResponseEntity.status(500).body(e.getMessage());
		}
	}

	@PostMapping("/pipeline/publish/{pipelinename}/{org}/{type}")
	public ResponseEntity<String> publisPipeline(@PathVariable(name = "pipelinename") String pipelineName,
			@PathVariable(name = "org") String org, @PathVariable(name = "type") String type)
			throws TransportException, GitAPIException, IOException {
		String message = "";
		try {
			message = githubservice.publishPipeline(pipelineName, org, type);
		} catch (IOException | GitAPIException e) {
			logger.error("Error publishing pipeline" + e.getMessage());
			return new ResponseEntity<>("Error while Publishing Pipeline", HttpStatus.INTERNAL_SERVER_ERROR);
		}

		return new ResponseEntity<>(message, HttpStatus.OK);
	}
}
