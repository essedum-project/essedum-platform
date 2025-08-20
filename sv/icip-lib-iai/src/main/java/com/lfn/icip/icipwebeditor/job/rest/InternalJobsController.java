package com.lfn.icip.icipwebeditor.job.rest;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.slf4j.MarkerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.lfn.ai.comm.lib.util.ICIPHeaderUtil;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.ai.comm.lib.util.annotation.service.ConstantsService;
import com.lfn.ai.comm.lib.util.logger.JobLogger;
import com.lfn.iamp.usm.domain.DashConstant;
import com.lfn.icip.dataset.jobs.ICIPTransformLoad;
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.service.impl.ICIPAdpService;
import com.lfn.icip.dataset.service.impl.ICIPDatasetService;
import com.lfn.icip.icipwebeditor.event.model.InternalEvent;
import com.lfn.icip.icipwebeditor.event.publisher.InternalEventPublisher;
import com.lfn.icip.icipwebeditor.event.service.InternalJobEventService;
import com.lfn.icip.icipwebeditor.job.enums.JobStatus;
import com.lfn.icip.icipwebeditor.job.jobs.DataCleanupJob;
import com.lfn.icip.icipwebeditor.job.jobs.DatasourceLivenessTest;
import com.lfn.icip.icipwebeditor.job.jobs.FileRemovalJob;
import com.lfn.icip.icipwebeditor.job.jobs.ICIPBulkCopyDatasets;
import com.lfn.icip.icipwebeditor.job.jobs.ICIPBulkCopyPipelines;
import com.lfn.icip.icipwebeditor.job.jobs.ICIPCopyCIPModules;
import com.lfn.icip.icipwebeditor.job.jobs.ICIPImportPipelines;
import com.lfn.icip.icipwebeditor.job.model.ICIPChains;
import com.lfn.icip.icipwebeditor.job.model.ICIPInternalJobs;
import com.lfn.icip.icipwebeditor.job.service.IICIPInternalJobsService;
import com.lfn.icip.icipwebeditor.job.util.InternalJob;
import com.lfn.icip.icipwebeditor.jobmodel.service.ICIPInternalJobsService;
import com.lfn.icip.icipwebeditor.service.impl.ICIPIaiService;
import com.lfn.icip.icipwebeditor.v1.dto.BaseEntity;
import com.lfn.icip.icipwebeditor.v1.service.IICIPSearchableService;

import io.micrometer.core.annotation.Timed;
import lombok.extern.log4j.Log4j2;
import reactor.core.publisher.Flux;

// TODO: Auto-generated Javadoc
/**
 * The Class InternalJobsController.
 */
@RestController
@RequestMapping("/${icip.pathPrefix}")

/** The Constant log. */
@Log4j2
public class InternalJobsController {

	/** The event service. */
	@Autowired
	private InternalEventPublisher eventService;

	/** The job event service. */
	@Autowired
	private InternalJobEventService jobEventService;

	/** The i ICIP dataset service. */
	@Autowired
	private ICIPDatasetService datasetService;
	
	@Autowired
	private ICIPAdpService iCIPAdpService;

	/** The i CIP iai service. */
	@Autowired
	private ICIPIaiService iCIPIaiService;
	
	@Autowired
	private IICIPSearchableService searchable;

	@Autowired
	private IICIPInternalJobsService internalJobService;

	@Autowired
	private ConstantsService dashConstantService;
	
	/** The scheduler status. */
	@EssedumProperty("icip.scheduler.pause.status")
	private String schedulerPauseStatus;
	
	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;
	
	/** The logger. */
	private final Logger logger = LoggerFactory.getLogger(JobLogger.class);
	
	/** The Constant joblogger. */
	private static final Logger joblogger = LoggerFactory.getLogger(JobLogger.class);

	/** The Constant FROM_PROJECT. */
	private static final String FROM_PROJECT = "fromProject";

	/** The Constant TO_PROJECT. */
	private static final String TO_PROJECT = "toProject";

	/** The Constant PROJECT_ID. */
	private static final String PROJECT_ID = "projectId";

	/** The Constant SUBMITTED_BY. */
	private static final String SUBMITTED_BY = "submittedBy";

	/** The Constant ORG. */
	private static final String ORG = "org";

	/**
	 * Bulk datasets copy.
	 *
	 * @param target    the target
	 * @param source    the source
	 * @param projectId the project id
	 * @param body      the body
	 */
	@PostMapping("/datasets/datasetsCopy/{target}/{source}")
	@Timed
	public ResponseEntity<?> bulkDatasetsCopy(@PathVariable("target") String target, @PathVariable("source") String source,
			@RequestParam(name = PROJECT_ID, required = true) String projectId,
			@RequestBody(required = true) String body) {
		schedulerPauseStatus = checkStatus("icip.scheduler.pause.status","Core");
		if(schedulerPauseStatus.equalsIgnoreCase("false")) {
			Gson gson = new Gson();
			JsonObject bodyElement = gson.fromJson(body, JsonObject.class);
			JsonArray datasets = bodyElement.get("datasets").getAsJsonArray();
			String toDatasource = bodyElement.get("todatasource").getAsString();
			Map<String, String> params = new HashMap<>();
			String delim = "@#";
			StringBuilder strDataset = new StringBuilder();
			datasets.forEach(dataset -> strDataset.append(dataset.getAsString()).append(delim));
			String dataset = strDataset.substring(0, strDataset.length() - delim.length());
			params.put(FROM_PROJECT, source);
			params.put(TO_PROJECT, target);
			params.put(PROJECT_ID, projectId);
			params.put(SUBMITTED_BY, ICIPUtils.getUser(claim));
			params.put(ORG, source);
			params.put("toDatasource", toDatasource);
			params.put("datasets", dataset);
			InternalEvent event = new InternalEvent(this, "BULKDATASESTCOPY", target, params, ICIPBulkCopyDatasets.class);
			eventService.getApplicationEventPublisher().publishEvent(event);
			return new ResponseEntity<>("BULKDATASESTCOPY triggered successfully", HttpStatus.OK);
		} else {
			return new ResponseEntity<>("Scheduler Paused", HttpStatus.CONFLICT);
		}
	}

	/**
	 * Bulk pipelines copy.
	 *
	 * @param target    the target
	 * @param source    the source
	 * @param projectId the project id
	 * @param body      the body
	 */
	@PostMapping("/streamingServices/pipelinesCopy/{target}/{source}")
	@Timed
	public ResponseEntity<?> bulkPipelinesCopy(@PathVariable("target") String target, @PathVariable("source") String source,
			@RequestParam(name = PROJECT_ID, required = true) String projectId,
			@RequestBody(required = true) String body) {
		schedulerPauseStatus = checkStatus("icip.scheduler.pause.status","Core");
		if(schedulerPauseStatus.equalsIgnoreCase("false")) {
			Gson gson = new Gson();
			JsonObject bodyElement = gson.fromJson(body, JsonObject.class);
			JsonArray pipelines = bodyElement.get("pipelines").getAsJsonArray();
			Map<String, String> params = new HashMap<>();
			String delim = "@#";
			StringBuilder strpipeline = new StringBuilder();
			pipelines.forEach(dataset -> strpipeline.append(dataset.getAsString()).append(delim));
			String pipeline = strpipeline.substring(0, strpipeline.length() - delim.length());
			params.put(FROM_PROJECT, source);
			params.put(TO_PROJECT, target);
			params.put(PROJECT_ID, projectId);
			params.put(SUBMITTED_BY, ICIPUtils.getUser(claim));
			params.put(ORG, source);
			params.put("pipelines", pipeline);
			InternalEvent event = new InternalEvent(this, "BULKPIPELINESCOPY", target, params, ICIPBulkCopyPipelines.class);
			eventService.getApplicationEventPublisher().publishEvent(event);
			return new ResponseEntity<>("BULKDATASESTCOPY triggered successfully", HttpStatus.OK);
		}else {
			return new ResponseEntity<>("Scheduler Paused", HttpStatus.CONFLICT);
		}
	}

	/**
	 * Run test datasources.
	 *
	 * @param body the body
	 */
	@PostMapping("/testDatasources")
	@Timed
	public void runDatasourceLivenessTest(@RequestBody String body) {
		jobEventService.runInternalJob(body, "DatasourceLivenessTest", DatasourceLivenessTest.class, new HashMap<>());
	}

	/**
	 * Run data cleanup.
	 *
	 * @param body the body
	 */
	@PostMapping("/datacleanup")
	@Timed
	public void runDataCleanup(@RequestBody String body) {
		jobEventService.runInternalJob(body, "DataCleanup", DataCleanupJob.class, new HashMap<>());
	}

	/**
	 * Run file removal.
	 *
	 * @param body the body
	 */
	@PostMapping("/fileremoval")
	@Timed
	public void runFileRemoval(@RequestBody String body) {
		jobEventService.runInternalJob(body, "FileRemoval", FileRemovalJob.class, new HashMap<>());
	}

	/**
	 * Import pipelines.
	 *
	 * @param file the file
	 * @param org  the org
	 */
	@PostMapping("/importPipelines/{org}")
	@Timed
	public ResponseEntity<?> importPipelines(@RequestBody MultipartFile file, @PathVariable("org") String org) {
		
		schedulerPauseStatus = checkStatus("icip.scheduler.pause.status","Core");
		if(schedulerPauseStatus.equalsIgnoreCase("false")) {
			try {
				Path tmppath = java.nio.file.Files.createTempDirectory("tmpZipFiles");
				file.transferTo(new File(tmppath.toString()));
				Map<String, String> params = new HashMap<>();
				params.put(SUBMITTED_BY, ICIPUtils.getUser(claim));
				params.put(ORG, org);
				params.put("filepath", tmppath.toString());
				InternalEvent event = new InternalEvent(this, "IMPORTPIPELINES", org, params, ICIPImportPipelines.class);
				eventService.getApplicationEventPublisher().publishEvent(event);
				return new ResponseEntity<>("pipeline imported", HttpStatus.OK);
			} catch (IOException e) {
				log.error("Exception {}:{}", e.getClass().getName(), e.getMessage());
				return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
			}
		} else {
			return new ResponseEntity<>("Scheduler Paused", HttpStatus.CONFLICT);
		}
	}

	@PostMapping("/transformLoad")
	@Timed
	public void transformLoad(@RequestBody String reqbody) {
		JSONObject reqBody = new JSONObject(new JSONObject(reqbody).get("reqBody").toString());
		String inpdataset = reqBody.getString("inpdataset");
		String org = reqBody.getString("org");
		int index = (int) reqBody.get("index");
		ICIPDataset inpDatasetObj = datasetService.getDataset(inpdataset, org);
		String taskdetails = inpDatasetObj.getTaskdetails() != null ? inpDatasetObj.getTaskdetails() : "[]";
		JSONArray taskArray = new JSONArray(taskdetails);
		ArrayList<Map<String, ?>> body = new ArrayList<>();

		JSONArray array = new JSONArray(new JSONObject(taskArray.get(index).toString()).get("body").toString());
		String outdataset = new JSONObject(taskArray.get(index).toString()).get("outdataset").toString();
		array.forEach(obj -> {
			Map<String, ?> map;
			try {
				map = new ObjectMapper().readValue(obj.toString(), HashMap.class);
				body.add(map);
			} catch (JsonProcessingException e) {
				log.error(e.getMessage());
			}

		});

		Map params = new HashMap<>();
		params.put("data", body);
		params.put("org", org);
		params.put("inpdataset", inpdataset);
		params.put("outdataset", outdataset);
		jobEventService.runInternalJob(reqbody, "ETL", ICIPTransformLoad.class, params);
	}

	@PostMapping("/triggerInternalJobs")
	@Timed
	public void runInternalJob(@RequestBody String reqbody) {
		JSONObject reqBody = new JSONObject(reqbody);
		String jobName = reqBody.get("reqBody").toString();
        InternalJob job = internalJobService.getInternalJobService(jobName.toLowerCase());
        jobEventService.runInternalJob(reqbody, jobName, job.getClass(), new HashMap<>());
	}
	
	@PostMapping("/copyCip/{org}")
	@Timed
	public ResponseEntity<?> copyBlueprintCip(@PathVariable("org") String org, 
			@RequestBody String reqbody) {
		schedulerPauseStatus = checkStatus("icip.scheduler.pause.status","Core");
		if(schedulerPauseStatus.equalsIgnoreCase("false")) {
			JSONObject reqBody = new JSONObject(reqbody);
			String source = reqBody.getString("source");
			JSONArray target = reqBody.getJSONArray("target");
			JSONArray modules = reqBody.getJSONArray("modules");
			Map<String, String> params = new HashMap<>();
			params.put("source", source);
			params.put("target", target.toString());
			params.put(SUBMITTED_BY, ICIPUtils.getUser(claim));
			params.put("org", org);
			params.put("todo", "copy");
			params.put("modules", modules.toString());
			try {
				InternalEvent event = new InternalEvent(this, "COPY_CIP", org, params, ICIPCopyCIPModules.class);
				eventService.getApplicationEventPublisher().publishEvent(event);
				return new ResponseEntity<>("done", HttpStatus.OK);
			} catch (Exception e) {
				logger.error(e.getMessage());
				return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
			}
		} else {
			return new ResponseEntity<>("Scheduler Paused", HttpStatus.CONFLICT);
		}
	}
	
	@PostMapping("/exportCip/{org}")
	@Timed
	public ResponseEntity<?> exportCip(@PathVariable("org") String org, @RequestBody String reqbody) {
		schedulerPauseStatus = checkStatus("icip.scheduler.pause.status","Core");
		if(schedulerPauseStatus.equalsIgnoreCase("false")) {
			Marker marker = null;
			JSONObject reqBody = new JSONObject(reqbody);
			String source = reqBody.getString("source");
			JSONObject modules = reqBody.getJSONObject("modules");
			joblogger.info(marker,"Exporting data from {}",source);
			Map<String, String> params = new HashMap<>();
			params.put("source", source);
			params.put(SUBMITTED_BY, ICIPUtils.getUser(claim));
			params.put("org", org);
			params.put("todo", "export");
			params.put("modules", modules.toString());
			InternalEvent event = new InternalEvent(this, "EXPORT_CIP", org, params, ICIPCopyCIPModules.class);
			eventService.getApplicationEventPublisher().publishEvent(event);
			try {
				logger.info(marker,"Executing export modules from {}", source);
				JsonObject jsnObj = new JsonObject();
				jsnObj.add("ADP", iCIPAdpService.exportAdp(marker, source, modules));
				jsnObj.add("IAI", iCIPIaiService.exportIai(marker, source, modules));
				Gson gson = new Gson();
				String result = gson.toJson(jsnObj);
				return new ResponseEntity<>(result, HttpStatus.OK);
			} catch (Exception e) {
				log.error("Exception {}:{}", e.getClass().getName(), e.getMessage());
				return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
			}
		} else {
			return new ResponseEntity<>("Scheduler Paused", HttpStatus.CONFLICT);
		}
	}
	
	@PostMapping("/importCip/{org}")
	@Timed
	public ResponseEntity<?> importCip(@PathVariable("org") String org, 
			@RequestPart(value = "file", required = false) MultipartFile file,
			@RequestPart(value = "target", required = false) String target) {
		schedulerPauseStatus = checkStatus("icip.scheduler.pause.status","Core");
		if(schedulerPauseStatus.equalsIgnoreCase("false")) {
			try {
				Path tmppath = java.nio.file.Files.createTempDirectory("tmpZipFiles");
				file.transferTo(new File(tmppath.toString()));
				Map<String, String> params = new HashMap<>();
				params.put("target", target);
				params.put(SUBMITTED_BY, ICIPUtils.getUser(claim));
				params.put("org", org);
				params.put("todo", "import");
				params.put("filepath", tmppath.toString());
				InternalEvent event = new InternalEvent(this, "IMPORT_CIP", org, params, ICIPCopyCIPModules.class);
				eventService.getApplicationEventPublisher().publishEvent(event);
				return new ResponseEntity<>("IMPORTED Successfully", HttpStatus.OK);
			} catch (IOException e) {
				log.error("Exception {}:{}", e.getClass().getName(), e.getMessage());
				return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
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

}
