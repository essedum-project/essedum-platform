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

package com.lfn.icip.icipwebeditor.service.impl;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Blob;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import javax.sql.rowset.serial.SerialBlob;

import org.json.JSONException;
import org.json.JSONObject;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.json.JSONArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.ai.comm.lib.util.annotation.service.ConstantsService;
import com.lfn.ai.comm.lib.util.event.IAPIEvent;
import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.ai.comm.lib.util.logger.JobLogger;
import com.lfn.icip.dataset.model.MlInstance;
import com.lfn.icip.icipwebeditor.IICIPJobRuntimeServiceUtil;
import com.lfn.icip.icipwebeditor.event.factory.IAPIEventFactory;
import com.lfn.icip.icipwebeditor.event.model.PipelineEvent;
import com.lfn.icip.icipwebeditor.event.publisher.PipelineEventPublisher;
import com.lfn.icip.icipwebeditor.event.service.InternalJobEventService;
import com.lfn.icip.icipwebeditor.event.type.EventJobType;
import com.lfn.icip.icipwebeditor.factory.IICIPJobRuntimeServiceUtilFactory;
import com.lfn.icip.icipwebeditor.job.ICIPNativeServiceJob;
import com.lfn.icip.icipwebeditor.job.config.InternalJobListConfig;
import com.lfn.icip.icipwebeditor.job.model.ICIPChains;
import com.lfn.icip.icipwebeditor.job.util.InternalJob;
import com.lfn.icip.icipwebeditor.model.ICIPEventJobMapping;
import com.lfn.icip.icipwebeditor.model.ICIPStreamingServices;
import com.lfn.icip.icipwebeditor.repository.ICIPEventJobMappingRepository;
import com.lfn.icip.icipwebeditor.service.IICIPChainsService;
import com.lfn.icip.icipwebeditor.service.IICIPEventJobMappingService;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPEventJobMappingService.
 *
 * @author essedum
 */
@Service
public class ICIPEventJobMappingService implements IICIPEventJobMappingService {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPEventJobMappingService.class);

	/** The Constant joblogger. */
	private static final Logger joblogger = LoggerFactory.getLogger(JobLogger.class);

	/** The icip event mapping repositiory. */
	private ICIPEventJobMappingRepository icipEventMappingRepositiory;

	/** The pipeline service. */
	private ICIPStreamingServiceService pipelineService;
	
	@Autowired
	private ICIPPipelineService pipelineServ;

	/** The i ICIP chains service. */
	private IICIPChainsService iICIPChainsService;

	/** The internal job list config. */
	private InternalJobListConfig internalJobListConfig;

	/** The event factory. */
	private IAPIEventFactory eventFactory;

	/** The event service. */
	private PipelineEventPublisher eventService;

	/** The job event service. */
	private InternalJobEventService jobEventService;

	/** The api events. */
	@Autowired(required = false)
	private List<IAPIEvent> apiEvents;

	@EssedumProperty("icip.pipelineScript.directory")
	private String pipelineScriptPath;
	
	@Autowired
	private GitHubService githubservice;
	
	@Autowired
	private ConstantsService constantsService;

//    @Autowired
//    private IICIPJobRuntimeServiceUtilFactory jobRuntimeFactory;

	@Autowired
	private ApplicationContext context;

	@Value("${security.claim:#{null}}")
	private String claim;

	private Class runtime;

	/**
	 * Instantiates a new ICIP event job mapping service.
	 *
	 * @param icipEventMappingRepositiory the icip event mapping repositiory
	 * @param pipelineService             the pipeline service
	 * @param iICIPChainsService          the i ICIP chains service
	 * @param internalJobListConfig       the internal job list config
	 * @param eventService                the event service
	 * @param jobEventService             the job event service
	 * @param eventFactory                the event factory
	 */
	public ICIPEventJobMappingService(ICIPEventJobMappingRepository icipEventMappingRepositiory,
			ICIPStreamingServiceService pipelineService, IICIPChainsService iICIPChainsService,
			InternalJobListConfig internalJobListConfig, PipelineEventPublisher eventService,
			InternalJobEventService jobEventService, IAPIEventFactory eventFactory) {
		super();
		this.icipEventMappingRepositiory = icipEventMappingRepositiory;
		this.pipelineService = pipelineService;
		this.iICIPChainsService = iICIPChainsService;
		this.internalJobListConfig = internalJobListConfig;
		this.eventService = eventService;
		this.jobEventService = jobEventService;
		this.eventFactory = eventFactory;
	}

	/**
	 * Find by event name.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP event job mapping
	 */
	@Override
	public ICIPEventJobMapping findByEventName(String name, String org) {
		logger.info("Finding Event Job Mapping By EventName : {}", name);
		return icipEventMappingRepositiory.findByEventnameAndOrganization(name, org);
	}

	/**
	 * Find by org.
	 *
	 * @param org the org
	 * @return the list
	 */
	@Override
	public List<ICIPEventJobMapping> findByOrg(String org) {
		logger.info("Finding All Event Job Mapping [by Org]");
		return icipEventMappingRepositiory.findByOrganization(org);
	}

	/**
	 * Find by org and search.
	 *
	 * @param org    the org
	 * @param search the search
	 * @param page   the page
	 * @param size   the size
	 * @return the list
	 */
	@Override
	public List<ICIPEventJobMapping> findByOrgAndSearch(String org, String search, int page, int size) {
		logger.info("Finding All Event Job Mapping [by Org and Search]");
		return icipEventMappingRepositiory.findByOrgAndSearch(org, search, PageRequest.of(page, size));
	}

	/**
	 * Count by org and search.
	 *
	 * @param org    the org
	 * @param search the search
	 * @return the list
	 */
	@Override
	public Long countByOrgAndSearch(String org, String search) {
		logger.info("Counting All Event Job Mapping");
		return icipEventMappingRepositiory.countByOrgAndSearch(org, search);
	}

	/**
	 * Find by id.
	 *
	 * @param id the id
	 * @return the ICIP event job mapping
	 */
	@Override
	public ICIPEventJobMapping findById(Integer id) {
		logger.info("Finding Event Job Mapping By ID : {}", id);
		Optional<ICIPEventJobMapping> optionalEvent = icipEventMappingRepositiory.findById(id);
		return optionalEvent.isPresent() ? optionalEvent.get() : null;
	}

	/**
	 * Save.
	 *
	 * @param event the event
	 * @return the ICIP event job mapping
	 */
	@Override
	public ICIPEventJobMapping save(ICIPEventJobMapping event) {
		logger.info("Saving Event Job Mapping");
		return icipEventMappingRepositiory.save(event);
	}

	/**
	 * Delete.
	 *
	 * @param id the id
	 */
	@Override
	public void delete(Integer id) {
		logger.info("Deleting Event Job Mapping By ID : {}", id);
		icipEventMappingRepositiory.deleteById(id);
	}

	/**
	 * Delete.
	 *
	 * @param name the name
	 * @param org  the org
	 */
	@Override
	public void delete(String name, String org) {
		logger.info("Deleting Event Job Mapping By Name : {}", name);
		icipEventMappingRepositiory.delete(icipEventMappingRepositiory.findByEventnameAndOrganization(name, org));
	}

	/**
	 * Checks if is valid event.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return true, if is valid event
	 */
	@Override
	public boolean isValidEvent(String name, String org) {
		ICIPEventJobMapping eventJobMap = findByEventName(name, org);
		if (eventJobMap != null) {
			String jobDetails = eventJobMap.getJobdetails();
			Gson gson = new Gson();

			JsonArray jobDetailsArray = gson.fromJson(jobDetails, JsonArray.class);
			int length = jobDetailsArray.size();
			for (int i = 0; i < length; i++) {
				JsonElement jobElement = jobDetailsArray.get(i);
				JsonObject jobObject = gson.fromJson(jobElement, JsonObject.class);

				String jobType = jobObject.get("type").getAsString();
				String jobName = jobObject.get("name").getAsString();

				String job = jobName.trim();
				switch (EventJobType.valueOf(jobType.trim().toUpperCase())) {
				case CHAIN:
					ICIPChains chain = iICIPChainsService.findByNameAndOrganization(job, eventJobMap.getOrganization());
					return chain != null;
				case INTERNAL:
					JsonArray array = internalJobListConfig.getJobDetails();
					if (array != null && array.size() > 0) {
						for (int index = 0; index < array.size(); index++) {
							JsonObject obj = array.get(index).getAsJsonObject();
							if (obj.get("name").getAsString().equals(job)) {
								return true;
							}
						}
					}
					return false;
				case API:
					return eventFactory.getAPIEvent(job) != null;
				case PIPELINE:
				default:
					ICIPStreamingServices pipeline = pipelineService.getICIPStreamingServices(job,
							eventJobMap.getOrganization());
					return pipeline != null;
				}
			}

		}
		return false;
	}

	/**
	 * Copy.
	 *
	 * @param marker        the marker
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @return true, if successful
	 */
	@Override
	public boolean copy(Marker marker, String fromProjectId, String toProjectId) {
		joblogger.info(marker, "Fetching events for Entity {}", fromProjectId);
		List<ICIPEventJobMapping> event = icipEventMappingRepositiory.findByOrganization(fromProjectId);
		List<ICIPEventJobMapping> toMod = event.parallelStream().map(model -> {
			model.setId(null);
			model.setOrganization(toProjectId);
			return model;
		}).collect(Collectors.toList());
		toMod.stream().forEach(model -> {
			try {
				icipEventMappingRepositiory.save(model);
			} catch (DataIntegrityViolationException e) {
				joblogger.error(marker, e.getMessage());
			}
		});
		return true;
	}

	@Override
	public boolean copytemplate(Marker marker, String fromProjectId, String toProjectId) {
		joblogger.info(marker, "Fetching events for Entity {}", fromProjectId);
		List<ICIPEventJobMapping> event = icipEventMappingRepositiory.findByOrganizationAndInterfacetype(fromProjectId,
				"template");
		List<ICIPEventJobMapping> toMod = event.parallelStream().map(model -> {
			model.setId(null);
			model.setOrganization(toProjectId);
			return model;
		}).collect(Collectors.toList());
		toMod.stream().forEach(model -> {
			try {
				icipEventMappingRepositiory.save(model);
			} catch (DataIntegrityViolationException e) {
				joblogger.error(marker, e.getMessage());
			}
		});
		return true;
	}

	/**
	 * Delete.
	 *
	 * @param project the project
	 */
	@Override
	public void delete(String project) {
		icipEventMappingRepositiory.deleteByProject(project);
	}

	/**
	 * Trigger.
	 *
	 * @param name    the name
	 * @param org     the org
	 * @param corelid the corelid
	 * @param params  the params
	 * @return the string
	 * @throws EssedumException the essedum exception
	 */
	@Override
	public String trigger(String name, String org, String corelid, String params, String datasourceName)
			throws EssedumException {
		name = name.trim();
		logger.info("request to trigger job event");
		if (isValidEvent(name, org)) {
			if (corelid == null || corelid.trim().isEmpty()) {
				corelid = ICIPUtils.generateCorrelationId();
			}
			ICIPEventJobMapping eventJobMap = findByEventName(name, org);
			try {
				if (eventJobMap.getBody() != null && !eventJobMap.getBody().isEmpty()) {
					JSONObject eventBody = new JSONObject(eventJobMap.getBody());
					if (eventBody != null) {
						JSONObject paramsObject = new JSONObject(params);
						if (paramsObject != null && !paramsObject.isEmpty()) {
							Iterator<String> keys = paramsObject.keys();
							while (keys != null && keys.hasNext()) {
								String key = keys.next();
								eventBody.put(key, paramsObject.get(key));
							}
							params = eventBody.toString();
						}
					}
				}
			} catch (JSONException e) {
				logger.error(e.getMessage(), e);
			}
			String jobDetails = eventJobMap.getJobdetails();
			Gson gson = new GsonBuilder().disableHtmlEscaping().create();

			JsonArray jobDetailsArray = gson.fromJson(jobDetails, JsonArray.class);
			int length = jobDetailsArray.size();
			for (int i = 0; i < length; i++) {
				JsonElement jobElement = jobDetailsArray.get(i);
				JsonObject jobObject = gson.fromJson(jobElement, JsonObject.class);

				String jobType = jobObject.get("type").getAsString();
				String jobName = jobObject.get("name").getAsString();
				String jobRuntime;
				if (jobObject.get("runtime") == null) {
					jobRuntime = "localjobruntime";
				} else {
					JsonObject jobObjects;
					jobObjects = (JsonObject) jobObject.get("runtime");
					jobRuntime = jobObjects.get("type").getAsString().toLowerCase() + "jobruntime";
				}

				if (EventJobType.valueOf(jobType.trim().toUpperCase()).equals(EventJobType.INTERNAL)) {
					String job = jobName.trim();
					Set<Class<? extends InternalJob>> classes = internalJobListConfig.getClasses();
					Class[] reqclazz = new Class[] { null };
					classes.stream().forEach(clazz -> {
						try {
							InternalJob internaljob = clazz.newInstance();
							if (internaljob.getName().equals(job)) {
								reqclazz[0] = clazz;
								return;
							}
						} catch (IllegalAccessException | InstantiationException e) {
							logger.error(e.getMessage(), e);
						}
					});
					Map<String, String> dataMap = new HashMap<>();
					JsonObject json = gson.fromJson(params, JsonObject.class);
					if (json.has("data")) {
						JsonObject data = json.get("data").getAsJsonObject();
						data.keySet().forEach(key -> dataMap.put(key, gson.toJson(data.get(key))));
					} else if (json.has("jsondata")) {
						dataMap.put("jsondata", json.get("jsondata").toString());
					}
					Map<String, String> hashmap = new HashMap<>();
					hashmap.put("corelid", corelid);
					hashmap.putAll(dataMap);
					jobEventService.runInternalJob(params, job, reqclazz[0], hashmap);
				} else if (EventJobType.valueOf(jobType.trim().toUpperCase()).equals(EventJobType.API)) {
					String job = jobName.trim();
					IAPIEvent event = eventFactory.getAPIEvent(job);
					event.run(params);
				} else {
					ICIPJobRuntimePluginsService pluginService = context.getBean(ICIPJobRuntimePluginsService.class);
					PipelineEvent event = new PipelineEvent(this, name, org, params,
							pluginService.getClassType(jobRuntime), corelid, ICIPUtils.getUser(claim), datasourceName);
					eventService.getApplicationEventPublisher().publishEvent(event);
				}
			}
			String remoteScript = null;
			try {
				remoteScript = constantsService.getByKeys("icip.script.github.enabled", org).getValue();
			}catch(NullPointerException ex) {
				remoteScript = "false";
			}catch(Exception ex) {
				logger.error(ex.getMessage());
			}
			
			if (name.contains("generateScript") && remoteScript.equals("true")) {
				JsonObject paramsObj = gson.fromJson(params, JsonObject.class);

				File scriptPath = new File(paramsObj.get("scriptPath").getAsString());
				
				Git git = null;
				Boolean result = false;
				
				try {
					git = githubservice.getGitHubRepository(org);
					result = githubservice.pull(git);
				}
				catch(GitAPIException | IOException e) {
					logger.error(e.getMessage());
				}

				
				File[] files = scriptPath.listFiles();
				for (File file : files) {
					try{
						Path path = Paths.get(file.getPath());
						byte[] fileBytes = Files.readAllBytes(path);
						Blob blob = new SerialBlob(fileBytes);
						if(result!=false) {
							
							githubservice.updateFileInLocalRepo(blob, paramsObj.get("pipelineName").getAsString(), org,file.getName());			
						}
						
					}
					catch(IOException | SQLException e) {
						logger.error(e.getMessage());
					}
				}
				try {
					githubservice.push(git,"Script pushed");
				}
				catch(GitAPIException | IOException e) {
					logger.error(e.getMessage());
				}

			}

			return corelid;
		}
		throw new EssedumException("Invalid Event Details");
	}

	/**
	 * Gets the api classes.
	 *
	 * @return the api classes
	 */
	@Override
	public List<String> getApiClasses() {
		List<String> result = new ArrayList<>();
		apiEvents.stream().forEach(event -> {
			result.add(event.getName());
		});
		return result;
	}

	@Override
	public void setClass(Class<?> classType) {
		this.runtime = classType;

	}

	public JsonObject export(Marker marker, String source, JSONArray modNames) {
		JsonObject jsnObj = new JsonObject();
		try {
			joblogger.info(marker, "Exporting events started");
			Gson gson = new GsonBuilder().disableHtmlEscaping().create();
//			List<ICIPEventJobMapping> events = icipEventMappingRepositiory.findByOrganization(source);
			List<ICIPEventJobMapping> events = new ArrayList<>();
			modNames.forEach(eventName -> {
				events.add(icipEventMappingRepositiory.findByEventnameAndOrganization(eventName.toString(), source));
			});
			List<ICIPChains> evtrelatedChains = new ArrayList<>();
			List<ICIPStreamingServices> mlpipelines = new ArrayList<>();

			events.stream().forEach(evt -> {
				JsonArray jobDetailsArray = gson.fromJson(evt.getJobdetails(), JsonArray.class);
				JsonElement ele = jobDetailsArray.get(0);
				JsonObject obj = gson.fromJson(ele, JsonObject.class);
				String jobName = obj.get("name").getAsString();
				String jobType = obj.get("type").getAsString();
				if (jobType.equalsIgnoreCase("CHAIN")) {
					ICIPChains chain = iICIPChainsService.findByNameAndOrganization(jobName, evt.getOrganization());
					evtrelatedChains.add(chain);
				} else if (jobType.equalsIgnoreCase("PIPELINE")) {
					ICIPStreamingServices pipeline2 = pipelineService.getICIPStreamingServices(jobName,
							evt.getOrganization());
					mlpipelines.add(pipeline2);
				}
//				case INTERNAL:
//					JsonArray array = internalJobListConfig.getJobDetails();
//	                if (array != null && array.size() > 0) {
//	                    for (int index = 0; index < array.size(); index++) {
//	                        JsonObject obj = array.get(index).getAsJsonObject();
//	                        if (obj.get("name").getAsString().equals(jobName)) {
//	                        }
//	                    }
//	                }
//				case API:
//					eventFactory.getAPIEvent(jobName);
//				case PIPELINE:
//					ICIPStreamingServices pipeline1 = pipelineService.getICIPStreamingServices(jobName, evt.getOrganization());
//					evtrelatedpipeline.add(pipeline1);
//					break;
			});
			jsnObj.add("mleventjobmapping", gson.toJsonTree(events));
			if (evtrelatedChains != null)
				jsnObj.add("evtrelatedChains", gson.toJsonTree(evtrelatedChains));
			if (mlpipelines != null) {
				jsnObj.add("mlpipelines", gson.toJsonTree(mlpipelines));
				jsnObj.add("mlpipelinenativescriptentity",gson.toJsonTree("[]"));
				jsnObj.add("mlpipelinebinaryentity",gson.toJsonTree("[]"));
			}
			joblogger.info(marker, "Exported events successfully");
		} catch (Exception ex) {
			joblogger.error(marker, "Error in exporting events");
			joblogger.error(marker, ex.getMessage());
		}
		return jsnObj;
	}

	public void importData(Marker marker, String target, JSONObject jsonObject) {
		Gson g = new Gson();
		try {
			joblogger.info(marker, "Importing events started");
			JsonArray events = g.fromJson(jsonObject.get("mleventjobmapping").toString(), JsonArray.class);
			events.forEach(x -> {
				ICIPEventJobMapping evt = g.fromJson(x, ICIPEventJobMapping.class);
				evt.setOrganization(target);
				evt.setId(null);
				try {
					icipEventMappingRepositiory.save(evt);
				} catch (DataIntegrityViolationException de) {
					joblogger.error(marker, "Error in importing duplicate events {}", evt.getEventname());
				}
			});
			if(jsonObject.has("mlpipelines")) {
				pipelineServ.importData(marker, target, jsonObject,"chain");
			}
			joblogger.info(marker, "Imported events successfully");
		} catch (Exception ex) {
			joblogger.error(marker, "Error in importing events");
			joblogger.error(marker, ex.getMessage());
		}
	}

}