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

package com.infosys.icets.icip.icipwebeditor.service.impl;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Locale;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;
import com.infosys.icets.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.infosys.icets.ai.comm.lib.util.logger.JobLogger;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;
import com.infosys.icets.icip.dataset.service.IICIPDatasetService;
import com.infosys.icets.icip.dataset.service.IICIPDatasourceService;
import com.infosys.icets.icip.dataset.service.IICIPSchemaRegistryService;
import com.infosys.icets.icip.dataset.service.impl.ICIPDatasetService;
import com.infosys.icets.icip.dataset.service.impl.ICIPSchemaRegistryService;
import com.infosys.icets.icip.icipwebeditor.constants.IAIJobConstants;
import com.infosys.icets.icip.icipwebeditor.factory.IICIPJobRuntimeServiceUtilFactory;
import com.infosys.icets.icip.icipwebeditor.job.ICIPNativeServiceJob;
import com.infosys.icets.icip.icipwebeditor.job.enums.RuntimeType;
import com.infosys.icets.icip.icipwebeditor.job.model.dto.JobParamsDTO;
import com.infosys.icets.icip.icipwebeditor.model.ICIPBinaryFiles;
import com.infosys.icets.icip.icipwebeditor.model.ICIPNativeScript;
import com.infosys.icets.icip.icipwebeditor.model.ICIPStreamingServices;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPBinaryFilesDTO;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPJobServerResponse;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPNativeScriptDTO;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPStreamingServicesRepository;
import com.infosys.icets.icip.icipwebeditor.service.IICIPNativeScriptService;
import com.infosys.icets.icip.icipwebeditor.service.IICIPStreamingServiceService;
import com.infosys.icets.icip.icipwebeditor.service.aspect.IAIResolverAspect;
import com.infosys.icets.icip.icipwebeditor.util.ICIPJsonVisitor;
import com.infosys.icets.icip.icipwebeditor.util.ICIPJsonVisitorGetRequiredJars;
import com.infosys.icets.icip.icipwebeditor.util.ICIPJsonVisitorRewrite;
import com.infosys.icets.icip.icipwebeditor.util.ICIPJsonVisitorRewriteDataset;
import com.infosys.icets.icip.icipwebeditor.util.ICIPJsonWalker;
import com.infosys.icets.icip.icipwebeditor.v1.dto.BaseEntity;
import com.infosys.icets.icip.icipwebeditor.v1.service.IICIPSearchable;
import com.jayway.jsonpath.JsonPath;

import jline.internal.Log;
import reactor.core.publisher.Flux;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPPipelineService.
 *
 * @author icets
 */
@Service("pipelineservice")
@RefreshScope
public class ICIPPipelineService implements IICIPSearchable{

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPPipelineService.class);

	/** The Constant joblogger. */
	private static final Logger joblogger = LoggerFactory.getLogger(JobLogger.class);

	/** The rest template. */
	private final RestTemplate restTemplate;

	/** The streaming services service. */
	private IICIPStreamingServiceService streamingServicesService;

	/** The schema registry service. */
	private IICIPSchemaRegistryService schemaRegistryService;

	/** The dataset service. */
	private IICIPDatasetService datasetService;

	/** The datassource service. */
	private IICIPDatasourceService datassourceService;

	/** The group modal service. */
	private ICIPGroupModelService groupModalService;

	/** The native script service. */
	private IICIPNativeScriptService nativeScriptService;

	/** The binary files service. */
	private ICIPBinaryFilesService binaryFilesService;

	/** The job scheduler service. */
	private JobScheduleServiceImpl jobSchedulerService;
	
	@Autowired
	private IICIPDatasourceService dsService;

	/** The resolver. */
	private IAIResolverAspect resolver;

	/** The job factory. */
	private IICIPJobRuntimeServiceUtilFactory jobRuntimeFactory;
	
	@Autowired
	private ICIPStreamingServicesRepository streamingServicesRepository;
	
	@Autowired
	private IICIPAppServiceImpl appService;


	/** The sjs host. */
	@LeapProperty("icip.sparkServer.host")
	private String sjsHost;

	/** The sjs port. */
	@LeapProperty("icip.sparkServer.port")
	private String sjsPort;

	/** The sjs app name. */
	@LeapProperty("icip.sparkServer.appName")
	private String sjsAppName;

	/** The sjs jar location. */
	@LeapProperty("icip.sparkServer.requiredJarsLocation")
	private String sjsJarLocation;

	/** The sjs python context. */
	@LeapProperty("icip.sparkServer.pythonContext")
	private String sjsPythonContext;

	/** Claim. */
	@Value("${security.claim:#{null}}")
	private String claim;

	
	final String TYPE="PIPELINE";
	/**
	 * Instantiates a new ICIP pipeline service.
	 *
	 * @param restTemplateBuilder      the rest template builder
	 * @param streamingServicesService the streaming services service
	 * @param schemaRegistryService    the schema registry service
	 * @param datasetService           the dataset service
	 * @param datassourceService       the datassource service
	 * @param groupModalService        the group modal service
	 * @param nativeScriptService      the native script service
	 * @param binaryFilesService       the binary files service
	 * @param jobSchedulerService      the job scheduler service
	 * @param resolver                 the resolver
	 */
	public ICIPPipelineService(RestTemplateBuilder restTemplateBuilder,
			ICIPStreamingServiceService streamingServicesService, ICIPSchemaRegistryService schemaRegistryService,
			ICIPDatasetService datasetService, IICIPDatasourceService datassourceService,
			ICIPGroupModelService groupModalService, IICIPNativeScriptService nativeScriptService,
			ICIPBinaryFilesService binaryFilesService, JobScheduleServiceImpl jobSchedulerService,
			IAIResolverAspect resolver, IICIPJobRuntimeServiceUtilFactory jobRuntimeFactory) {
		super();
		this.restTemplate = restTemplateBuilder.build();
		this.streamingServicesService = streamingServicesService;
		this.schemaRegistryService = schemaRegistryService;
		this.datasetService = datasetService;
		this.datassourceService = datassourceService;
		this.groupModalService = groupModalService;
		this.nativeScriptService = nativeScriptService;
		this.binaryFilesService = binaryFilesService;
		this.jobSchedulerService = jobSchedulerService;
		this.resolver = resolver;
		this.jobRuntimeFactory = jobRuntimeFactory;
	}

	/**
	 * Creates the context.
	 *
	 * @param contextId      the context id
	 * @param contextFactory the context factory
	 * @param requiredJars   the required jars
	 * @return the completable future
	 * @throws URISyntaxException the URI syntax exception
	 */
	@Async
	public CompletableFuture<ICIPJobServerResponse> createContext(String contextId, String contextFactory,
			Set<String> requiredJars) throws URISyntaxException {
		String evalRequiredJars = (requiredJars != null && !requiredJars.isEmpty())
				? "&dependent-jar-uris=" + this.getRequiredJarWithLocation(requiredJars)
				: "";
		String url = new URI("http", null, sjsHost, Integer.parseInt(sjsPort), "/contexts/" + contextId,
				"context-factory=" + contextFactory + evalRequiredJars, null).toString();
		logger.info("Creating Context for {}", contextId);

		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);

		HttpEntity<String> entity = new HttpEntity<>("", headers);

		ResponseEntity<ICIPJobServerResponse> results = restTemplate.postForEntity(url, entity,
				ICIPJobServerResponse.class);
		return CompletableFuture.completedFuture(results.getBody());
	}

	/**
	 * Submit job.
	 *
	 * @param contextId the context id
	 * @param data      the data
	 * @return the completable future
	 * @throws URISyntaxException the URI syntax exception
	 */
	@Async
	public CompletableFuture<ICIPJobServerResponse> submitJob(String contextId, String data) throws URISyntaxException {
		String url = new URI("http", null, sjsHost, Integer.parseInt(sjsPort), "/jobs",
				"appName=" + sjsAppName + "&classPath=com.infosys.icets.IcspSparkSessionJob&context=" + contextId, null)
				.toString();
		logger.info("Submitting Spark Job with Context Id {}", contextId);
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		HttpEntity<String> entity = new HttpEntity<>(data, headers);
		ResponseEntity<ICIPJobServerResponse> results = restTemplate.postForEntity(url, entity,
				ICIPJobServerResponse.class);
		ICIPJobServerResponse response = results.getBody();
		return CompletableFuture.completedFuture(response);
	}

	/**
	 * Submit job.
	 *
	 * @param appName   the app name
	 * @param mainClass the main class
	 * @param data      the data
	 * @return the completable future
	 * @throws URISyntaxException the URI syntax exception
	 */
	@Async
	public CompletableFuture<ICIPJobServerResponse> submitJob(String appName, String mainClass, String data)
			throws URISyntaxException {
		String url = new URI("http", null, sjsHost, Integer.parseInt(sjsPort), "/jobs",
				"appName=" + appName + "&classPath=" + mainClass, null).toString();
		logger.info("Submitting Spark Job & URL is {}", url);
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		HttpEntity<String> entity = new HttpEntity<>(data, headers);
		ResponseEntity<ICIPJobServerResponse> results = restTemplate.postForEntity(url, entity,
				ICIPJobServerResponse.class);
		return CompletableFuture.completedFuture(results.getBody());
	}

	/**
	 * Gets the job status.
	 *
	 * @param jobId the job id
	 * @return the job status
	 * @throws URISyntaxException the URI syntax exception
	 */
	@Async
	public CompletableFuture<ICIPJobServerResponse> getJobStatus(String jobId) throws URISyntaxException {
		String url = new URI("http", null, sjsHost, Integer.parseInt(sjsPort), "/jobs/" + jobId, null, null).toString();
		logger.info("Fetching job status for: {}", url);
		ResponseEntity<ICIPJobServerResponse> results = restTemplate.getForEntity(url, ICIPJobServerResponse.class);
		return CompletableFuture.completedFuture(results.getBody());
	}

	/**
	 * Populate schema details.
	 *
	 * @param data the data
	 * @param org  the org
	 * @return the string
	 */
	public String populateSchemaDetails(String data, String org) {
		logger.info("Populating Schema Details");
		Gson gson = new Gson();
		ICIPJsonVisitor<? extends JsonElement> rewriter = new ICIPJsonVisitorRewrite(schemaRegistryService);
		JsonElement result = ICIPJsonWalker.rewrite(gson.fromJson(data, JsonElement.class), rewriter, org);
		return result.toString();
	}

	/**
	 * Populate dataset details.
	 *
	 * @param data the data
	 * @param org  the org
	 * @return the string
	 */
	public String populateDatasetDetails(String data, String org) {
		logger.info("Populating Dataset Details");
		Gson gson = new Gson();
		ICIPJsonVisitor<? extends JsonElement> rewriter = new ICIPJsonVisitorRewriteDataset(datasetService);
		JsonElement result = ICIPJsonWalker.rewriteDataset(gson.fromJson(data, JsonElement.class), rewriter, org);
		return result.toString();
	}

	/**
	 * Populate attribute details.
	 *
	 * @param data  the data
	 * @param param the param
	 * @return the string
	 */
	public String populateAttributeDetails(String data, String param) {
		try {
			JSONObject plugin = new JSONObject(data);
			JSONObject params = new JSONObject(param);
			JSONArray entities = params.names();
			JSONObject json = (JSONObject) plugin.get("input_string");
			JSONArray elements = json.getJSONArray(IAIJobConstants.ELEMENTS);
			JSONArray elementsCopy = json.getJSONArray(IAIJobConstants.ELEMENTS);

			if (entities != null) {
				for (int j = 0; j < entities.length(); j++) {
					int index = 0;
					for (int z = 0; z < elements.length(); z++) {
						JSONObject e = (JSONObject) elements.get(z);
						JSONObject attributes = (JSONObject) e.get(IAIJobConstants.ATTRIBUTES);
						String name = "";
						Object value;
						if (e.has("name") && e.get("name").toString().replaceAll("\\s", "")
								.equalsIgnoreCase(entities.get(j).toString().replaceAll("\\s", ""))) {
							JSONObject paramsArr = (JSONObject) params.get((String) entities.get(j));
							JSONArray keys = paramsArr.names();
							for (int i = 0; i < keys.length(); ++i) {
								name = keys.getString(i);
								value = paramsArr.get(name);
								attributes.put(name, value);
							}
							e.put(IAIJobConstants.ATTRIBUTES, attributes);
							elementsCopy.put(index, e);
							if (elementsCopy.length() > (z + 1)) {
								for (int k = z + 1; k < elements.length(); k++) {
									JSONObject nexte = (JSONObject) elementsCopy.get(k);
									if (nexte.has("context")) {
										JSONArray context = (JSONArray) nexte.get("context");
										for (int c = 0; c < context.length(); c++) {
											if (context.getJSONObject(c).has(name)) {
												context.put(c, attributes);
											}

										}
										nexte.put("context", context);
										elementsCopy.put(k, nexte);
									}
								}
							}
						}

						index++;
					}
				}
			}

			json.put(IAIJobConstants.ELEMENTS, elementsCopy);
			plugin.put("input_string", json);
			return plugin.toString();
		} catch (JSONException e) {
			logger.error("Error ", e);
		}
		return null;
	}

	/**
	 * Gets the json.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the json
	 */
	public String getJson(String name, String org) {
		logger.info("Getting JSON for Streaming Service : {}", name);
		ICIPStreamingServices streamingServiceItem = new ICIPStreamingServices();
		streamingServiceItem.setName(name);
		streamingServiceItem.setOrganization(org);
		String data = streamingServicesService.getStreamingServices(streamingServiceItem).getJsonContent();
		return resolver.resolveDatasourceData(data, org);
	}

	/**
	 * Gets the version.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the version
	 */
	public Integer getVersion(String name, String org) {
		logger.info("Getting Version for Streaming Service : {}", name);
		ICIPStreamingServices streamingServiceItem = new ICIPStreamingServices();
		streamingServiceItem.setName(name);
		streamingServiceItem.setOrganization(org);
		return streamingServicesService.getStreamingServices(streamingServiceItem).getVersion();
	}

	/**
	 * Gets the required jar with location.
	 *
	 * @param requiredJars the required jars
	 * @return the required jar with location
	 */
	public String getRequiredJarWithLocation(Set<String> requiredJars) {
		List<String> requireJarList = requiredJars.stream().map(jar -> sjsJarLocation + jar + ".jar")
				.collect(Collectors.toList());
		String requireJarListString = requireJarList.toString().replaceAll("\\s+", "");
		return requireJarListString.substring(1, requireJarListString.length() - 1);
	}

	/**
	 * Gets the required jars.
	 *
	 * @param data the data
	 * @param org  the org
	 * @return the required jars
	 * @throws Exception the exception
	 */
	public Set<String> getRequiredJars(String data, String org) throws Exception {
		Gson gson = new Gson();
		ICIPJsonVisitorGetRequiredJars visitor = new ICIPJsonVisitorGetRequiredJars();
		ICIPJsonWalker.walk(gson.fromJson(data, JsonElement.class), visitor, org);
		return visitor.getRequiredJars();
	}

	/**
	 * Attach context.
	 *
	 * @param type the type
	 * @param data the data
	 * @return the json element
	 */
	public JsonElement attachContext(RuntimeType type, String data) {
		String settings = "context-settings";
		Gson gson = new Gson();
		JsonObject dataJson = (JsonObject) gson.fromJson(data, JsonElement.class);
		JsonObject spark = new JsonObject();
		switch (type) {
		case SCRIPT:
			spark.add(settings, gson.fromJson(sjsPythonContext, JsonObject.class));
			break;
		case DRAGANDDROP:
			spark.add(settings, gson.fromJson(sjsPythonContext, JsonObject.class));
			break;
		default:
			break;
		}
		dataJson.add("spark", spark);
		return dataJson;
	}

	/**
	 * Submit dagster job.
	 *
	 * @param data the data
	 * @return the completable future
	 * @throws URISyntaxException the URI syntax exception
	 */
	@Async
	public CompletableFuture<ICIPJobServerResponse> submitDagsterJob(String data) throws URISyntaxException {
		String url = new URI("http", null, null, null).toString();
		logger.info("Submitting Dagster Job: {}", url);
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		HttpEntity<String> entity = new HttpEntity<>(data, headers);
		ResponseEntity<ICIPJobServerResponse> results = restTemplate.postForEntity(url, entity,
				ICIPJobServerResponse.class);
		ICIPJobServerResponse response = results.getBody();
		return CompletableFuture.completedFuture(response);
	}

	/**
	 * Copy.
	 *
	 * @param marker        the marker
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @return true, if successful
	 */
	public boolean copy(Marker marker, String fromProjectId, String toProjectId) {
		try {
			List<NameAndAliasDTO> sservices = streamingServicesService.findByOrganization(fromProjectId);
			sservices.stream().forEach(sservice -> {
				ICIPStreamingServices sserviceObj = streamingServicesService.getICIPStreamingServices(sservice.getName(),
						fromProjectId);
				try {
				sserviceObj.setCid(null);
				sserviceObj.setOrganization(toProjectId);
	
				streamingServicesService.save(sserviceObj, joblogger, marker);
				}
				catch (Exception e) {
					logger.error("Error in pipeline saving Copy Blueprint {}", e.getMessage());
				}
				
			});
		}
		catch(Exception E) {
			logger.error("Error in pipeline plaiservice");

		}
		return true;
	}
	
	public boolean copytemplate(Marker marker, String fromProjectId, String toProjectId) {
		List<NameAndAliasDTO> sservices = streamingServicesService.findByInterfacetypeAndOrganization("template",fromProjectId);
		logger.info("Length of mlpipeline with template {}---{}",sservices.size());

		sservices.stream().forEach(sservice -> {
			try {
			ICIPStreamingServices sserviceObj = streamingServicesService.getICIPStreamingServices(
					sservice.getName(), fromProjectId);
			sserviceObj.setCid(null);
			sserviceObj.setOrganization(toProjectId);
			streamingServicesService.save(sserviceObj, joblogger, marker);
			}
			catch(Exception E) {
				logger.error("Error in pipeline plaiservice");

			}
		});
		return true;
	}

	/**
	 * Delete.
	 *
	 * @param project the project
	 */
	public void delete(String project) {
		streamingServicesService.delete(project);
	}

	/**
	 * Copy pipelines.
	 *
	 * @param marker          the marker
	 * @param fromProjectName the from project name
	 * @param toProjectName   the to project name
	 * @param pipelines       the pipelines
	 */
	public void copyPipelines(Marker marker, String fromProjectName, String toProjectName, List<String> pipelines) {
		List<NameAndAliasDTO> sservices = streamingServicesService.findByOrganization(fromProjectName);
		final AtomicInteger countInsertedRows = new AtomicInteger(0);

		pipelines.forEach(pipeline -> {
			ICIPStreamingServices pipelineObj = null;

			try {
				pipelineObj = streamingServicesService.getICIPStreamingServicesRefactored(pipeline, fromProjectName);

			} catch (Exception e) {
				countInsertedRows.incrementAndGet();
				// joblogger.info(marker," {} was not copied as it is empty." , pipeline );
			}
			if (pipelineObj != null) {

				if (streamingServicesService.getAllPipelineNamesByOrg(toProjectName).stream()
						.filter(d -> d.getName().equals(pipeline)).count() > 0) {
					joblogger.info(marker, "{} pipeline already present", pipeline);
				} else // if (pipelines.contains(pipeline.getName()))
				{

					if (pipelineObj.getType().equalsIgnoreCase("binary")) {
						savePipeline(pipelineObj, toProjectName, null, fromProjectName, marker);
					} else {
						if (pipelineObj.getJsonContent() != null) {
							List<String> dsrc = JsonPath.read(pipelineObj.getJsonContent(), "$..datasource.name");
							dsrc = dsrc.stream().distinct().collect(Collectors.toList());
							dsrc.stream()
									.filter(y -> datassourceService.findNameAndAliasByOrganization(toProjectName)
											.stream().filter(d -> d.equals(y)).count() == 0)
									.collect(Collectors.toList());
							if (!dsrc.isEmpty()) {
								joblogger.info(marker, "Configure {} datasources for pipeline {}", dsrc,
										pipelineObj.getAlias());
								dsrc.clear();
							}
							List<String> schema = JsonPath.read(pipelineObj.getJsonContent(), "$..schema.name");
							schema = schema.stream().distinct().collect(Collectors.toList());
							savePipeline(pipelineObj, toProjectName, schema, fromProjectName, marker);
							dsrc.clear();
							schema.clear();

						}
					}
				}

			}
		});
		if (countInsertedRows.intValue() > 0) {
			joblogger.info(marker, " {} pipelines not copied as they are empty.", countInsertedRows);
		}
	}

	/**
	 * Save pipeline.
	 *
	 * @param pipe        the pipe
	 * @param toProject   the to project
	 * @param schemas     the schemas
	 * @param fromProject the from project
	 * @param marker      the marker
	 * @return true, if successful
	 */
	public boolean savePipeline(ICIPStreamingServices pipe, String toProject, List<String> schemas, String fromProject,
			Marker marker) {
		if (pipe.getType().equalsIgnoreCase("binary")) {
			ICIPBinaryFiles binary = binaryFilesService.findByNameAndOrg(pipe.getName(), fromProject);
			binary.setId(null);
			binary.setOrganization(toProject);
			binaryFilesService.save(binary);
			pipe.setOrganization(toProject);
			pipe.setCid(null);
			streamingServicesService.save(pipe, joblogger, marker);
			groupModalService.copyGroupModel(marker, fromProject, toProject, pipe.getName(), null);
		} else if (pipe.getType().equalsIgnoreCase("nativescript")) {
			ICIPNativeScript nativescript = nativeScriptService.findByNameAndOrg(pipe.getName(), fromProject);
			nativescript.setId(null);
			nativescript.setOrganization(toProject);
			nativeScriptService.save(nativescript);
			pipe.setOrganization(toProject);
			pipe.setCid(null);
			streamingServicesService.save(pipe, joblogger, marker);
			schemas.forEach(schema -> {
				schemaRegistryService.copySelected(marker, fromProject, toProject, schema);
			});
			groupModalService.copyGroupModel(marker, fromProject, toProject, pipe.getName(), schemas);
		} else {
			try {
				pipe.setOrganization(toProject);
				pipe.setCid(null);
				pipe.setCreatedBy(ICIPUtils.getUser(claim));
				pipe.setCreatedDate(new Timestamp(System.currentTimeMillis()));
				pipe.setLastmodifieddate(new Timestamp(System.currentTimeMillis()));
				pipe.setLastmodifiedby(ICIPUtils.getUser(claim));
				streamingServicesService.save(pipe, joblogger, marker);
				schemas.forEach(schema -> {
					schemaRegistryService.copySelected(marker, fromProject, toProject, schema);
				});
				groupModalService.copyGroupModel(marker, fromProject, toProject, pipe.getName(), schemas);
			} catch (Exception e) {
				logger.error(e.getMessage(), e);
			}
		}
		return true;
	}

	/**
	 * Gets the pipelines.
	 *
	 * @param org       the org
	 * @param pipelines the pipelines
	 * @return the pipelines
	 */
	public JsonObject exportPipelines(String org, List<String> pipelines) {
		List<ICIPStreamingServices> pipes = new ArrayList<>();
		List<ICIPNativeScriptDTO> nativeFile = new ArrayList<>();
		List<ICIPBinaryFilesDTO> binaryFile = new ArrayList<>();
		Gson gson = new GsonBuilder().disableHtmlEscaping().create();
		JsonObject jsnObj = new JsonObject();
		pipelines.forEach(x -> {
			ICIPStreamingServices pipeline = streamingServicesService.getICIPStreamingServices(x, org);
			pipeline.setCreatedBy("");
			pipeline.setCreatedDate(null);
			pipeline.setLastmodifieddate(null);
			pipeline.setLastmodifiedby("");

			pipes.add(pipeline);
			if (pipeline.getType().equalsIgnoreCase("nativescript")) {
				ICIPNativeScript nativescript = nativeScriptService.findByNameAndOrg(pipeline.getName(), org);
				try {
					nativeFile.add(nativescript.toDTO());
				} catch (IOException | SQLException e) {
					logger.error(e.getMessage(), e);
				}
			} else if (pipeline.getType().equalsIgnoreCase("binary")) {
				ICIPBinaryFiles binary = binaryFilesService.findByNameAndOrg(pipeline.getName(), org);
				try {
					binaryFile.add(binary.toDTO());
				} catch (IOException | SQLException e) {
					logger.error(e.getMessage(), e);
				}
			}

		});
		jsnObj.addProperty("pipelines", gson.toJson(pipes));
		jsnObj.addProperty("nativeFile", gson.toJson(nativeFile));
		jsnObj.addProperty("binaryFile", gson.toJson(binaryFile));
		return jsnObj;
	}
	
	public JsonObject export(Marker marker, String source, JSONArray modNames, String interfacetype) {
		JsonObject jsnObj = new JsonObject();
		
		try {
			joblogger.info(marker,"Exporting {} started",interfacetype);
			Gson gson = new GsonBuilder().disableHtmlEscaping().create();
			List<ICIPStreamingServices> pipes = new ArrayList<>();
			List<ICIPStreamingServices> pipelines = new ArrayList<>();
			List<ICIPNativeScriptDTO> nativeFile = new ArrayList<>();
			List<ICIPBinaryFilesDTO> binaryFile = new ArrayList<>();
			List<String> abc = new ArrayList<>();
			
			modNames.forEach(alias -> {
				pipelines.add(streamingServicesRepository.findByAliasAndInterfacetypeAndOrganization(alias.toString(),interfacetype, source));
			});
			
			pipelines.forEach(x -> {
				abc.add(x.getName());
				x.setCreatedBy("");
				x.setCreatedDate(null);
				x.setLastmodifieddate(null);
				x.setLastmodifiedby("");
				pipes.add(x);
				
				if(x.getType().equalsIgnoreCase("nativescript")) {
					ICIPNativeScript nativescript = nativeScriptService.findByNameAndOrg(x.getName(), source);
					try {
						if(nativescript != null) {
							ICIPNativeScriptDTO natives = nativescript.toDTO();
							String s = gson.toJson(natives.getFilescript());
//							JsonObject jsnObj1 = new JsonObject(natives.getFilescript());
//							natives.setFilescript(natives.getFilescript().toString());
							nativeFile.add(natives);
						}
					} catch (IOException | SQLException e) {
						logger.error(e.getMessage(), e);
					}
				}
				else if(x.getType().equalsIgnoreCase("binary")) {
					ICIPBinaryFiles binary = binaryFilesService.findByNameAndOrg(x.getName(), source);
					try {
						if(binary != null)
						binaryFile.add(binary.toDTO());
					} catch (IOException | SQLException e) {
						logger.error(e.getMessage(), e);
					}
				}
			});
			jsnObj.add("mlpipelines", gson.toJsonTree(pipes));
			if(nativeFile != null)
			jsnObj.add("mlpipelinenativescriptentity", gson.toJsonTree(nativeFile));
			if(binaryFile != null)
			jsnObj.add("mlpipelinebinaryentity", gson.toJsonTree(binaryFile));
			if(interfacetype.equalsIgnoreCase("App")) {
				JSONArray appNames = new JSONArray(abc);
				jsnObj.add("appdetails",appService.export(marker, source, appNames));
			}
			joblogger.info(marker, "Exported {} successfully",interfacetype);
		}
		catch(Exception ex) {
			joblogger.error(marker, "Error in exporting {}",interfacetype);
			joblogger.error(marker, ex.getMessage());
		}
		return jsnObj;
	}
	
	public void importData(Marker marker, String target, JSONObject jsonObject, String interfacetype) {
		Gson g = new Gson();
		try {
			joblogger.info(marker, "Importing {} started", interfacetype);
			JsonArray pipelines = g.fromJson(jsonObject.get("mlpipelines").toString(), JsonArray.class);
			JsonArray nativeScripts = g.fromJson(jsonObject.get("mlpipelinenativescriptentity").toString(), JsonArray.class);
			JsonArray binaryScripts = g.fromJson(jsonObject.get("mlpipelinebinaryentity").toString(), JsonArray.class);
			pipelines.forEach(x -> {
				ICIPStreamingServices pipe = g.fromJson(x, ICIPStreamingServices.class);
				ICIPStreamingServices pipelinePresent = streamingServicesService.findbyNameAndOrganization(pipe.getName(), target);
				pipe.setCreatedBy(ICIPUtils.getUser(claim));
				pipe.setCreatedDate(new Timestamp(System.currentTimeMillis()));
				pipe.setLastmodifieddate(new Timestamp(System.currentTimeMillis()));
				pipe.setLastmodifiedby(ICIPUtils.getUser(claim));
				pipe.setCid(null);
				pipe.setOrganization(target);
				try {
					if(pipelinePresent == null)
					streamingServicesService.save(pipe);
				}
				catch(Exception de) {
					joblogger.error(marker, "Error in importing duplicate {} {}",interfacetype,pipe.getAlias());
				}
			});
			nativeScripts.forEach(x -> {
				ICIPNativeScriptDTO nativeS = g.fromJson(x, ICIPNativeScriptDTO.class);
				nativeS.setId(null);
				nativeS.setOrganization(target);
				try {
					ICIPNativeScript nativescriptPresent = nativeScriptService.findByNameAndOrg(nativeS.getCname(), target);
					ICIPNativeScript nativeToSave = nativeS.toEntity();
					if(nativescriptPresent == null)
					nativeScriptService.save(nativeToSave);
				}
				catch(Exception de) {
					joblogger.error(marker, "Error in importing duplicate nativeScript {}",nativeS.getCname());
				}
			});
			if(interfacetype == "App") {
				appService.importData(marker, target, jsonObject.getJSONObject("appdetails"));
			}
			joblogger.info(marker, "Imported {} successfully", interfacetype);
		}
		catch(Exception ex) {
			joblogger.error(marker, "Error in importing {}",interfacetype);
			joblogger.error(marker, ex.getMessage());
		}
	}

	/**
	 * Creates the job.
	 *
	 * @param runtime  the runtime
	 * @param cname    the cname
	 * @param alias    the alias
	 * @param org      the org
	 * @param isLocal  the is local
	 * @param params   the params
	 * @param corelid  the corelid
	 * @param feoffset the feoffset
	 * @param datasource 
	 * @return the response entity
	 */
	public ResponseEntity<?> createJob(String jobType, String cname, String alias, String org, String runtime,
			String params, String corelid, int feoffset, String datasource, String workerlogId) {
		JobParamsDTO body = new JobParamsDTO();
		if(!runtime.toLowerCase(Locale.ENGLISH).startsWith("local")) {
		body.setDatasourceName(datasource);}
		body.setIsNative("false");
		body.setOrg(org);
		
		body.setParams(params);
		if(runtime.equals("true") || runtime.equals("false") || runtime.equalsIgnoreCase("local") ) {
			body.setIsNative("true");
			body.setDatasourceName("null");
			runtime="local";
			}
		try {
			return new ResponseEntity<>(this.jobSchedulerService.createSimpleJob(jobType, cname, alias, body, true,
					jobRuntimeFactory.getJobRuntimeServiceUtil(runtime.toLowerCase() + "jobruntime").getClass(), corelid, feoffset),
					HttpStatus.OK);
		} catch (Exception e) {
			logger.error(e.getMessage());
			return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Creates the job.
	 *
	 * @param runtime  the runtime
	 * @param cname    the cname
	 * @param alias    the alias
	 * @param org      the org
	 * @param isLocal  the is local
	 * @param params   the params
	 * @param corelid  the corelid
	 * @param feoffset the feoffset
	 * @param datasource 
	 * @return the response entity
	 */
	public ResponseEntity<?> createNewJob(String cname, String org,
			String corelid, String datasource) {
		ICIPDatasource dsObject = dsService.getDatasource(datasource, org);
		String runtime = dsObject.getName();
		JobParamsDTO body = new JobParamsDTO();
		if(!runtime.toLowerCase().startsWith("local")) {
		body.setDatasourceName(datasource);}
		body.setIsNative("false");
		body.setOrg(org);
		
//		body.setParams(params);
		if(runtime.equals("true") || runtime.equals("false") || runtime.equalsIgnoreCase("local") ) {
			body.setIsNative("true");
			body.setDatasourceName("null");
			runtime="local";
			}
		try {
			return new ResponseEntity<>(this.jobSchedulerService.createSimpleJob("remote", cname, "", body, true,
					jobRuntimeFactory.getJobRuntimeServiceUtil(runtime.toLowerCase() + "jobruntime").getClass(), corelid, -330),
					HttpStatus.OK);
		} catch (Exception e) {
			logger.error(e.getMessage());
			return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Creates the agent job.
	 *
	 * @param runtime  the runtime
	 * @param cname    the cname
	 * @param org      the org
	 * @param params   the params
	 * @param corelid  the corelid
	 * @param feoffset the feoffset
	 * @return the response entity
	 */
	public ResponseEntity<?> createAgentJob(String runtime, String cname, String org, String params, String corelid,
			int feoffset) {
		JobParamsDTO body = new JobParamsDTO();
		body.setIsNative("true");
		body.setOrg(org);
		body.setParams(params);
		try {
			return new ResponseEntity<>(this.jobSchedulerService.createAgentJob(runtime, cname, cname, body, true,
					ICIPNativeServiceJob.class, corelid, feoffset, ICIPUtils.getUser(claim)), HttpStatus.OK);
		} catch (Exception e) {
			logger.error(e.getMessage());
			return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
		}
	}

	public ICIPStreamingServices  updatePipelineMetadata(JSONObject metadata,String pipelineName,String organisation,Integer version)
	{
		ICIPStreamingServices mlpipelineObj = streamingServicesRepository.findByNameAndOrganization(pipelineName, organisation);
		String metaObj = mlpipelineObj.getPipelineMetadata();
		 JSONObject metaJSON =new JSONObject();
		if(metaObj!=null) {
		metaJSON=new JSONObject(metaObj);
		metaJSON.clear();
		metaJSON.put(version.toString(),metadata);}
		else {
			metaJSON.put(version.toString(),metadata);
		}
		mlpipelineObj.setPipelineMetadata(metaJSON.toString());
		mlpipelineObj.setVersion(version);
		return streamingServicesRepository.save(mlpipelineObj);
	}
	public String getPipelineId(String version,String pipelineName,String organisation) {
		ICIPStreamingServices mlpipelineObj = streamingServicesRepository.findByNameAndOrganization(pipelineName, organisation);
		String metaObj = mlpipelineObj.getPipelineMetadata();
		try {
			if(metaObj!=null) {
				JSONObject metaJSON = new JSONObject(metaObj);
				JSONObject versionDetails = (JSONObject) metaJSON.get(version);
				if(versionDetails.has("aiCloudpipelineId"))
			return	versionDetails.get("aiCloudpipelineId").toString();
		}} catch(JSONException e) {
			Log.error("Error while fetching pipelineId"+e);
			
		}
		return null;
	}
	public String getTaskId(String version,String pipelineName,String organisation) {
		ICIPStreamingServices mlpipelineObj = streamingServicesRepository.findByNameAndOrganization(pipelineName, organisation);
		String metaObj = mlpipelineObj.getPipelineMetadata();
		try {
			if(metaObj!=null) {
				JSONObject metaJSON = new JSONObject(metaObj);
				JSONObject versionDetails = (JSONObject) metaJSON.get(version);
				if(versionDetails.has("taskId"))
			return	versionDetails.get("taskId").toString();
		}} catch(JSONException e) {
			Log.error("Error while fetching taskId"+e);
			
		}
		return null;
	}
	public String getStepId(String version,String pipelineName,String organisation) {
		ICIPStreamingServices mlpipelineObj = streamingServicesRepository.findByNameAndOrganization(pipelineName, organisation);
		String metaObj = mlpipelineObj.getPipelineMetadata();
		try {
			if(metaObj!=null) {
				JSONObject metaJSON = new JSONObject(metaObj);
				JSONObject versionDetails = (JSONObject) metaJSON.get(version);
				if(versionDetails.has("stepId"))
			return	versionDetails.get("stepId").toString();
		}} catch(JSONException e) {
			Log.error("Error while fetching stepId"+e);
			
		}
		return null;
	}

	@Override
	public  Flux<BaseEntity> getObjectByIDTypeAndOrganization(String type, Integer id, String organization) {
	return Flux.just(streamingServicesRepository.findById((id)).get()).defaultIfEmpty(new ICIPStreamingServices()).map(s->{
		BaseEntity entity= new BaseEntity();
		entity.setAlias(s.getAlias());
		entity.setData(new JSONObject(s).toString());
		entity.setDescription(s.getDescription());
		entity.setId(s.getCid());
		entity.setType(TYPE);
		return entity;
		
		
	});
	}

	@Override
	public Flux<BaseEntity> getAllObjectsByOrganization(String organization, String search, Pageable page) {
		try {
	return Flux.fromIterable(streamingServicesRepository.findByOrganization(search, organization,page)).parallel().map(s->{
		BaseEntity entity= new BaseEntity();
		entity.setAlias(s.getAlias());
		entity.setData(new JSONObject(s).toString());
		entity.setDescription(s.getDescription());
		entity.setId(s.getCid());
		entity.setType(TYPE);
		return entity;
	}).sequential()	;
	    } catch (Exception e) {
	        logger.error("Error while parsing Pipeline--->", e);
	        return Flux.empty();
	    }
		
	}

	@Override
	public String getType() {
		return TYPE; 
	}
	
}
