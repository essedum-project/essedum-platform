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

package com.lfn.icip.icipwebeditor.rest;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;
import java.util.concurrent.TimeUnit;

import javax.imageio.ImageIO;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.ai.comm.lib.util.annotation.service.ConstantsService;
import com.lfn.ai.comm.lib.util.exceptions.ApiError;
import com.lfn.ai.comm.lib.util.exceptions.ExceptionUtil;
import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.ai.comm.lib.util.service.UsmService;
import com.lfn.iamp.usm.domain.DashConstant;
import com.lfn.iamp.usm.domain.Users;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.repository.ICIPDatasourceRepository;
import com.lfn.icip.icipwebeditor.event.model.InternalEvent;
import com.lfn.icip.icipwebeditor.event.publisher.InternalEventPublisher;
import com.lfn.icip.icipwebeditor.executor.sync.service.JobSyncExecutorService;
import com.lfn.icip.icipwebeditor.job.model.ICIPChainJobs;
import com.lfn.icip.icipwebeditor.job.model.ICIPInternalJobs;
import com.lfn.icip.icipwebeditor.job.service.IICIPInternalJobsService;
import com.lfn.icip.icipwebeditor.model.ICIPAgentJobs;
import com.lfn.icip.icipwebeditor.model.ICIPJobs;
import com.lfn.icip.icipwebeditor.model.ICIPJobsPartial;
import com.lfn.icip.icipwebeditor.model.dto.IHiddenJobs;
import com.lfn.icip.icipwebeditor.model.dto.IJobLog;
import com.lfn.icip.icipwebeditor.service.IICIPAgentJobsService;
import com.lfn.icip.icipwebeditor.service.IICIPChainJobsService;
import com.lfn.icip.icipwebeditor.service.IICIPJobRuntimePluginsService;
import com.lfn.icip.icipwebeditor.service.IICIPJobsPluginsService;
import com.lfn.icip.icipwebeditor.service.IICIPJobsService;

import io.micrometer.core.annotation.Timed;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPJobsController.
 *
 * @author essedum
 */
@RestController
@Timed
@RequestMapping(path = "/${icip.pathPrefix}/jobs")
public class ICIPJobsController {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPJobsController.class);

	/** The i ICIP jobs service. */
	@Autowired
	private IICIPJobsService iICIPJobsService;

	/** The i ICIP chain jobs service. */
	@Autowired
	private IICIPChainJobsService iICIPChainJobsService;

	/** The i ICIP agent jobs service. */
	@Autowired
	private IICIPAgentJobsService iICIPAgentJobsService;

	/** The i ICIP internal jobs service. */
	@Autowired
	private IICIPInternalJobsService iICIPInternalJobsService;

	/** The job sync executor service. */
	@Autowired
	private JobSyncExecutorService jobSyncExecutorService;

	@Value("${security.claim:#{null}}")
	private String claim;
	
	/** The scheduler status. */
	@EssedumProperty("icip.scheduler.pause.status")
	private String schedulerPauseStatus;

	@Autowired
	private IICIPJobRuntimePluginsService jobsRuntimePluginServce;

	@Autowired
	private IICIPJobsPluginsService jobsPluginServce;

	@Autowired
	private UsmService usmservice;
	
	@Autowired
	private ConstantsService dashConstantService;

	/** The datasource repository. */
	@Autowired
	private ICIPDatasourceRepository datasourceRepository;
	
	@Autowired
	private InternalEventPublisher eventService;
	
	private static final String FROM_PROJECT = "fromProject";
	private static final String TO_PROJECT = "toProject";
	private static final String PROJECT_ID = "projectId";
	private static final String SUBMITTED_BY = "submittedBy";
	private static final String ORG = "org";

	/**
	 * Gets the jobs len.
	 *
	 * @param org the org
	 * @return the jobs len
	 */
	@GetMapping("/jobsLen/{org}")
	public ResponseEntity<Long> getJobsLen(@PathVariable(name = "org") String org) {
		return new ResponseEntity<>(iICIPJobsService.countByOrganization(org), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the streaming service jobs len.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the streaming service jobs len
	 */
	@GetMapping("/streamingLen/{nameStr}/{org}")
	public ResponseEntity<Long> getStreamingServiceJobsLen(@PathVariable(name = "nameStr") String name,
			@PathVariable(name = "org") String org) {
		return new ResponseEntity<>(iICIPJobsService.countByStreamingServiceAndOrganization(name, org),
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
	@GetMapping("/{nameStr}/{org}")
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
	
	@GetMapping("/downloadCsv/{org}")
	public ResponseEntity<String> getJobsByModel(
			@PathVariable(name = "org") String org,
			@RequestParam(required = false, name = "colsToDownload") String colsToDownload) {
		
		String csvData= iICIPJobsService.getCsvData(colsToDownload,org).toString();

		return new ResponseEntity<>(csvData.toString(), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the common jobs.
	 *
	 * @param org          the org
	 * @param page         the page
	 * @param size         the size
	 * @param filtercolumn the filtercolumn
	 * @param filtervalue  the filtervalue
	 * @param filterdate   the filterdate
	 * @param sortcolumn   the sortcolumn
	 * @param direction    the direction
	 * @return the common jobs
	 */
	@GetMapping("/common/{org}")
	public ResponseEntity<List<IJobLog>> getCommonJobs(@PathVariable(name = "org") String org,
			@RequestParam(required = false, name = "page", defaultValue = "0") Integer page,
			@RequestParam(required = false, name = "size", defaultValue = "15") Integer size,
			@RequestParam(required = false, name = "filtercolumn", defaultValue = "") String filtercolumn,
			@RequestParam(required = false, name = "filtervalue", defaultValue = "") String filtervalue,
			@RequestParam(required = false, name = "filterdate", defaultValue = "1980-12-12") String filterdate,
			@RequestParam(required = false, name = "sortcolumn", defaultValue = "submittedon") String sortcolumn,
			@RequestParam(required = false, name = "direction", defaultValue = "DESC") String direction,
			@RequestHeader(name = "Authorization") String value) {
		try {
			logger.info("Getting Common Jobs");
			String[] s = value.split("Bearer");
			String token = s[s.length - 1].trim();
			Users user = usmservice.findByUserLogin(ICIPUtils.getUser(claim), token);
			TimeZone tz = user.getTimezone() != null ? TimeZone.getTimeZone(user.getTimezone())
					: TimeZone.getTimeZone("Asia/Kolkata");

			long hours = TimeUnit.MILLISECONDS.toHours(tz.getRawOffset());
			long minutes = TimeUnit.MILLISECONDS.toMinutes(tz.getRawOffset()) - TimeUnit.HOURS.toMinutes(hours);
			String fmtTz = "";
			if (hours > 0) {
				fmtTz = String.format("+%02d:%02d", hours, minutes, tz.getID());
			} else {
				fmtTz = String.format("%02d:%02d", hours, minutes, tz.getID());
			}
			iICIPJobsService.getAllCommonJobsPartial(org, Integer.valueOf(page), Integer.valueOf(size));
			
			List<IJobLog> commonList = iICIPJobsService.getAllCommonJobs(org, page, size, filtercolumn, filtervalue,
					filterdate, fmtTz, sortcolumn, direction);
			return new ResponseEntity<>(commonList, HttpStatus.OK);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			return new ResponseEntity<>(new HttpHeaders(), HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Gets the common jobs len.
	 *
	 * @param org          the org
	 * @param filtercolumn the filtercolumn
	 * @param filtervalue  the filtervalue
	 * @param filterdate   the filterdate
	 * @return the common jobs len
	 */
	@GetMapping("/common/jobsLen/{org}")

	public ResponseEntity<Long> getCommonJobsLen(@PathVariable(name = "org") String org,
			@RequestParam(required = false, name = "filtercolumn", defaultValue = "") String filtercolumn,
			@RequestParam(required = false, name = "filtervalue", defaultValue = "") String filtervalue,
			@RequestParam(required = false, name = "filterdate", defaultValue = "1980-12-12") String filterdate,
			@RequestHeader(name = "Authorization") String value) {
		try {
			String[] s = value.split("Bearer");
			String token = s[s.length - 1].trim();
			Users user = usmservice.findByUserLogin(ICIPUtils.getUser(claim), token);
			TimeZone tz = user.getTimezone() != null ? TimeZone.getTimeZone(user.getTimezone())
					: TimeZone.getTimeZone("Asia/Kolkata");
			long hours = TimeUnit.MILLISECONDS.toHours(tz.getRawOffset());
			long minutes = TimeUnit.MILLISECONDS.toMinutes(tz.getRawOffset()) - TimeUnit.HOURS.toMinutes(hours);
			String fmtTz = "";
			if (hours > 0) {
				fmtTz = String.format("+%02d:%02d", hours, minutes, tz.getID());
			} else {
				fmtTz = String.format("%02d:%02d", hours, minutes, tz.getID());
			}

			Long jobsLen = iICIPJobsService.getCommonJobsLen(org, filtercolumn, filtervalue, filterdate, fmtTz);
			return new ResponseEntity<>(jobsLen, new HttpHeaders(), HttpStatus.OK);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			return new ResponseEntity<>(new HttpHeaders(), HttpStatus.BAD_REQUEST);
		}
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
	@GetMapping("/console/{jobId}")
	public ResponseEntity<ICIPJobs> getJobConsole(@PathVariable(name = "jobId") String jobId,
			@RequestParam(name = "offset", required = false, defaultValue = "0") int offset,
			@RequestParam(name = "org", required = true) String org,
			@RequestParam(name = "lineno", required = true) int lineno,
			@RequestParam(name = "status", required = true) String status) throws IOException {
		logger.debug("Getting Job response with log");

		return new ResponseEntity<>(iICIPJobsService.findByJobIdWithLog(jobId, offset, lineno, org, status),
				new HttpHeaders(), HttpStatus.OK);

	}
	@GetMapping("/consolelog/{corelid}")
	public ResponseEntity<ICIPJobs> getcorelidConsole(@PathVariable(name = "corelid") String corelid,
			@RequestParam(name = "offset", required = false, defaultValue = "0") int offset,
			@RequestParam(name = "org", required = true) String org,
			@RequestParam(name = "lineno", required = true) int lineno,
			@RequestParam(name = "status", required = true) String status) throws IOException {
		logger.debug("Getting Job response with log");

		return new ResponseEntity<>(iICIPJobsService.findByCorelIdWithLog(corelid, offset, lineno, org, status),
				new HttpHeaders(), HttpStatus.OK);

	}

	/**
	 * Gets the spark job console.
	 *
	 * @param jobId the job id
	 * @return the spark job console
	 */
	@GetMapping("/spark/{jobId}")
	public ResponseEntity<String> getSparkJobConsole(@PathVariable(name = "jobId") String jobId) {
		logger.debug("Getting Spark Job response");
		return new ResponseEntity<>(iICIPJobsService.getSparkLog(jobId), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Stop job.
	 *
	 * @param jobid the jobid
	 * @return the response entity
	 */
	@GetMapping("/stopJob/{jobid}")
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
	 * Gets the job by corelid.
	 *
	 * @param corelid the corelid
	 * @return the job by corelid
	 */
	@GetMapping("/corelid/{corelid}")
	public ResponseEntity<List<ICIPJobsPartial>> getJobByCorelid(@PathVariable(name = "corelid") String corelid) {
		logger.debug("Getting Job by corelid");
		return new ResponseEntity<>(iICIPJobsService.findByCorelid(corelid), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Hide log.
	 *
	 * @param jobtype the jobtype
	 * @param id      the id
	 * @param flag    the flag
	 * @return the response entity
	 */
	@GetMapping("/hide/{type}/{id}/{flag}")
	public ResponseEntity<String> hideLog(@PathVariable(name = "type") String jobtype,
			@PathVariable(name = "id") String id, @PathVariable(name = "flag") int flag) {
		try {
			switch (jobtype.toLowerCase()) {
			case "pipeline":
				ICIPJobs job = iICIPJobsService.findByJobId(id);
				job.setJobhide(flag);
				iICIPJobsService.save(job);
				break;
			case "chain":
				ICIPChainJobs chainjob = iICIPChainJobsService.findByJobId(id);
				chainjob.setJobhide(flag);
				iICIPChainJobsService.save(chainjob);
				break;
			case "agent":
				ICIPAgentJobs agentjob = iICIPAgentJobsService.findByJobId(id);
				agentjob.setJobhide(flag);
				iICIPAgentJobsService.save(agentjob);
				break;
			case "internal":
				ICIPInternalJobs internaljob = iICIPInternalJobsService.findByJobId(id);
				internaljob.setJobhide(flag);
				iICIPInternalJobsService.save(internaljob);
				break;
			default:
				throw new EssedumException("Invalid JobType");
			}
			return new ResponseEntity<>("done", new HttpHeaders(), HttpStatus.OK);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>(ex.getMessage(), new HttpHeaders(), HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Gets the common jobs.
	 *
	 * @param org the org
	 * @return the common jobs
	 */
	@GetMapping("/hiddenlogs/{org}")
	public ResponseEntity<List<IHiddenJobs>> getCommonJobs(@PathVariable(name = "org") String org) {
		logger.info("Getting Hidden Logs");
		return new ResponseEntity<>(iICIPJobsService.getAllHiddenLogs(org), HttpStatus.OK);
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
		return new ResponseEntity<>(
				new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, rootcause.getMessage(), "error occurred").getMessage(),
				new HttpHeaders(),
				new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, rootcause.getMessage(), "error occurred").getStatus());
	}

	@GetMapping(value = "/image", produces = MediaType.IMAGE_JPEG_VALUE)
	public ResponseEntity<?> getImage(@RequestParam(name = "path") String path) throws IOException {
		logger.debug("Getting image by path");
		BufferedImage bImage = ImageIO.read(new File(path));
		ByteArrayOutputStream bos = new ByteArrayOutputStream();
		ImageIO.write(bImage, "png", bos);
		byte[] data = bos.toByteArray();
		return new ResponseEntity<>(data, HttpStatus.OK);
	}

	/**
	 * Gets the runtime types.
	 *
	 * @param page the page
	 * @param size the size
	 * @return the types
	 */
	@GetMapping("/runtime/types/{org}")
	public ResponseEntity<String> getRuntimeTypes(
			@RequestParam(name = "page", defaultValue = "0", required = false) String page,
			@RequestParam(name = "size", defaultValue = "12", required = false) String size,
			@PathVariable(name = "org") String org) {
		
		
		JSONArray types = jobsRuntimePluginServce.getJobRuntimeJson();
		JSONArray runtimeList=new JSONArray();
		types.forEach(x->{
			String type = ((JSONObject)x).getString("type");
			if(type.equalsIgnoreCase("local")) {
				runtimeList.put(new JSONObject().put("type",type).put("dsName","").put("dsAlias", ""));
			}else {
			List<ICIPDatasource> datasources = datasourceRepository.findAllByTypeAndOrganization(type,org);
			if(datasources!=null && datasources.size()>=1) {
			datasources.parallelStream().forEach(ds->{
		    runtimeList.put(new JSONObject().put("type",type).put("dsName",ds.getName()).put("dsAlias", ds.getAlias()));
			});}	}
		});
		return ResponseEntity.ok().header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON.toString())
				.body(runtimeList.toString());
	}

	/**
	 * Gets the job types.
	 *
	 * @param page the page
	 * @param size the size
	 * @return the types
	 */
	@GetMapping("/job/types")
	public ResponseEntity<String> getJobTypes(
			@RequestParam(name = "page", defaultValue = "0", required = false) String page,
			@RequestParam(name = "size", defaultValue = "12", required = false) String size) {
		
		
		
		return ResponseEntity.ok().header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON.toString())
				.body(jobsPluginServce.getJobsJson().toString());
	}
	
	/**
	 * Gets the jobs status.
	 *
	 * @param jobid the jobid
	 * @return the jobs status
	 */
	@GetMapping("/jobstatus/{jobid}")
	public ResponseEntity<?> getJobsStatus(@PathVariable(name = "jobid") String jobid) {
		return new ResponseEntity<>(iICIPJobsService.getJobStatus(jobid), HttpStatus.OK);
	}
	
	/**
	 * Gets the event status.
	 *
	 * @param jobid the jobid
	 * @return the jobs status
	 */
	@GetMapping("/eventstatus/{corelid}")
	public ResponseEntity<?> getEventStatus(@PathVariable(name = "corelid") String corelid) {
		return new ResponseEntity<>(iICIPJobsService.getEventStatus(corelid), HttpStatus.OK);
	}
	
	@GetMapping("/remote/all/{org}")
    public ResponseEntity<?> getAllRemoteJobs(
            @PathVariable(name = "org") String org,
            @RequestParam(name = "url",required = true) String url) {
        try {
			return new ResponseEntity<>(iICIPJobsService.getAllRemoteJobs(url), new HttpHeaders(), HttpStatus.OK);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			return new ResponseEntity<>(e.getMessage(), new HttpHeaders(), HttpStatus.BAD_REQUEST);
		}
    }
	
	@GetMapping("/remote/log/{org}")
    public ResponseEntity<?> getRemoteLog(
            @PathVariable(name = "org") String org,
            @RequestParam(name = "jobId",required = true) String jobId,
            @RequestParam(name = "url",required = true) String url) {
        try {
			return new ResponseEntity<>(iICIPJobsService.getLogData(url,jobId), new HttpHeaders(), HttpStatus.OK);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			return new ResponseEntity<>(e.getMessage(), new HttpHeaders(), HttpStatus.BAD_REQUEST);
		}
    }
	
	@GetMapping("/remote/stopjob/{org}")
    public ResponseEntity<?> stopRemoteJob(
            @PathVariable(name = "org") String org,
            @RequestParam(name = "jobId",required = true) String jobId,
            @RequestParam(name = "url",required = true) String url) {
        try {
			return new ResponseEntity<>(iICIPJobsService.stopRemoteJob(url,jobId), new HttpHeaders(), HttpStatus.OK);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			return new ResponseEntity<>(e.getMessage(), new HttpHeaders(), HttpStatus.BAD_REQUEST);
		}
    }
	
	@PostMapping("/copyPipelines/{target}/{source}")
	@Timed
	@Transactional
	public ResponseEntity<?> runCopyPipelines(@PathVariable("target") String target, @PathVariable("source") String source,
			@RequestParam(name = PROJECT_ID, required = true) String projectId,
			@RequestBody(required = true) String org) {
		schedulerPauseStatus = checkStatus("icip.scheduler.pause.status","Core");
		if(schedulerPauseStatus.equalsIgnoreCase("false")) {
			Map<String, String> params = new HashMap<>();
			params.put(FROM_PROJECT, source);
			params.put(TO_PROJECT, target);
			params.put(PROJECT_ID, projectId);
			params.put(SUBMITTED_BY, ICIPUtils.getUser(claim));
			params.put(ORG, org);
	
			InternalEvent event_pipelines = new InternalEvent(this, "COPYPIPELINES", target, params, com.lfn.icip.icipwebeditor.job.jobs.ICIPCopyPipelinesJob.class);
			eventService.getApplicationEventPublisher().publishEvent(event_pipelines);
			return new ResponseEntity<>("Pipeline Copied Successfully", HttpStatus.OK);
		} else {
			return new ResponseEntity<>("Scheduler Paused", HttpStatus.CONFLICT);
		}
	}
	
	@PostMapping("/copyDatasets/{target}/{source}")
	@Timed
	@Transactional
	public ResponseEntity<?> runCopyDatasets(@PathVariable("target") String target, @PathVariable("source") String source,
			@RequestParam(name = PROJECT_ID, required = true) String projectId,
			@RequestBody(required = true) String org) {
		schedulerPauseStatus = checkStatus("icip.scheduler.pause.status","Core");
		if(schedulerPauseStatus.equalsIgnoreCase("false")) {
			Map<String, String> params = new HashMap<>();
			params.put(FROM_PROJECT, source);
			params.put(TO_PROJECT, target);
			params.put(PROJECT_ID, projectId);
			params.put(SUBMITTED_BY, ICIPUtils.getUser(claim));
			params.put(ORG, org);
	
			InternalEvent event_datsets = new InternalEvent(this, "COPYDATASETS", target, params, com.lfn.icip.icipwebeditor.job.jobs.ICIPCopyDatasetsJob.class);
			eventService.getApplicationEventPublisher().publishEvent(event_datsets);
			return new ResponseEntity<>("Dataset Copied Successfully", HttpStatus.OK);
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
