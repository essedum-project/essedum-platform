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
package com.infosys.icets.icip.icipwebeditor.rest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.JSONObject;
import org.quartz.SchedulerException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
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

import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;
import com.infosys.icets.ai.comm.lib.util.annotation.service.ConstantsService;
import com.infosys.icets.ai.comm.lib.util.exceptions.ApiError;
import com.infosys.icets.ai.comm.lib.util.exceptions.ExceptionUtil;
import com.infosys.icets.iamp.usm.domain.DashConstant;
//import com.infosys.icets.iamp.bcc.jobs.ICIPCopyBluePrintJob;
import com.infosys.icets.icip.icipwebeditor.constants.IAIJobConstants;
import com.infosys.icets.icip.icipwebeditor.event.model.InternalEvent;
import com.infosys.icets.icip.icipwebeditor.event.publisher.InternalEventPublisher;
import com.infosys.icets.icip.icipwebeditor.job.ICIPCopyTemplate;
import com.infosys.icets.icip.icipwebeditor.job.ICIPNativeServiceJob;
import com.infosys.icets.icip.icipwebeditor.job.model.JobUpdateParams;
import com.infosys.icets.icip.icipwebeditor.job.model.dto.JobModelDTO;
import com.infosys.icets.icip.icipwebeditor.job.model.dto.JobParamsDTO;
import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPJobRuntimePluginsService;
import com.infosys.icets.icip.icipwebeditor.service.impl.JobScheduleServiceImpl;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Hidden;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class JobScheduleController.
 *
 * @author icets
 */
@RestController
@Timed
@Hidden
@RequestMapping(path = "/${icip.pathPrefix}/schedule")
public class JobScheduleController {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(JobScheduleController.class);

	/** The job services. */
	@Autowired
	private JobScheduleServiceImpl jobServices;

	/** The job factory service. */
	@Autowired
	private ICIPJobRuntimePluginsService jobRuntimePluginService;
	
	@Autowired
	private InternalEventPublisher eventService;
	
	@Autowired
	private ConstantsService dashConstantService;

	@Value("${security.claim:#{null}}")
	private String claim;
	
	/** The scheduler status. */
	@LeapProperty("icip.scheduler.pause.status")
	private String schedulerPauseStatus;
	
	private static final String FROM_PROJECT = "fromProject";
	private static final String TO_PROJECT = "toProject";
	private static final String PROJECT_ID = "projectId";
	private static final String SUBMITTED_BY = "submittedBy";
	private static final String ORG = "org";
	
	/**
	 * Schedule pipeline.
	 *
	 * @param runtime the runtime
	 * @param cname   the cname
	 * @param runNow  the run now
	 * @param offset  the offset
	 * @param body    the body
	 * @return the response entity
	 */
	@PostMapping(value = "/scheduleJob/{runtime}/{cname}/{runNow}", produces = "application/json")
	public ResponseEntity<String> schedulePipeline(@PathVariable(name = "runtime") String runtime,
			@PathVariable(name = "cname") String cname, @PathVariable(name = "runNow") boolean runNow,
			@RequestParam(name = "runtimeType", required = false) String runtimeType,
			@RequestParam("offset") int offset, @RequestBody JobParamsDTO body) {
		try {
			logger.info("Request to schedule simple job");
			String corelid = ICIPUtils.generateCorrelationId();
			if (jobServices.createSimpleJob(runtime, cname, body.getAlias(), body, runNow, 
					jobRuntimePluginService.getClassType(runtimeType+"jobruntime"),
					corelid, offset) != null) {
				return ResponseEntity.ok(corelid);
			} else {
				return ResponseEntity.badRequest().body(IAIJobConstants.DATETIME_ERROR);
			}
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
		}
	}

	/**
	 * Cron schedule pipeline.
	 *
	 * @param runtime the runtime
	 * @param cname   the cname
	 * @param offset  the offset
	 * @param body    the body
	 * @return the response entity
	 * @throws SchedulerException the scheduler exception
	 */
	@PostMapping(value = "/cronScheduleJob/{runtime}/{cname}", produces = "application/json")
	public ResponseEntity<String> cronSchedulePipeline(@PathVariable(name = "runtime") String runtime,
			@PathVariable(name = "cname") String cname, @RequestParam("offset") int offset,
			@RequestParam(name = "runtimeType", required = false) String runtimeType,
			@RequestBody JobParamsDTO body) throws SchedulerException {
		try {
			logger.info("Request to schedule cron job");
			String corelid = ICIPUtils.generateCorrelationId();
			if(runtimeType!=null) {
				if (jobServices.createCronJob(runtime, cname, body.getAlias(), body,
						jobRuntimePluginService.getClassType(runtimeType+"jobruntime"), corelid, false, offset) != null)
					return ResponseEntity.ok(corelid);
				else
					return ResponseEntity.badRequest().body(IAIJobConstants.DATETIME_ERROR);
			}
			else {
				if (jobServices.createCronJob(runtime, cname, body.getAlias(), body,
						jobRuntimePluginService.getClassType(runtime), corelid, false, offset) != null)
					return ResponseEntity.ok(corelid);
				else
					return ResponseEntity.badRequest().body(IAIJobConstants.DATETIME_ERROR);
			
			}

		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
		}
	}

	/**
	 * Update cron job.
	 *
	 * @param offset the offset
	 * @param body   the body
	 * @return the response entity
	 * @throws Exception the exception
	 */
	@PostMapping(value = "/updateJob", produces = "application/json")
	public ResponseEntity<String> updateCronJob(@RequestParam("runtimeType") String runtimeType, @RequestParam("offset") int offset, @RequestBody JobUpdateParams body)
			throws Exception {
		logger.info("Request to update job");
		try {
			LocalDateTime date = jobServices.createLocalDateTime(body.getDate(), body.getTime());
			String timezone = body.getTimezone();
			Integer jobTimeout = body.getThresholdTime();
			String cronExpression = body.getExpression();
			String datasource = body.getDatasourceName();
			JobModelDTO.QuartzProperties.QuartzJobDetails quartzJobDetails = new JobModelDTO.QuartzProperties.QuartzJobDetails(
					body.getJobName(), body.getJobGroup());
			String corelid = ICIPUtils.generateCorrelationId();
			JSONObject result = jobServices.updateJob(quartzJobDetails, date, timezone, cronExpression,
					jobRuntimePluginService.getClassType(runtimeType+"jobruntime"), corelid, offset, jobTimeout, datasource);
			if (result != null)
				return ResponseEntity.ok(corelid);
			else
				return ResponseEntity.badRequest().body(IAIJobConstants.DATETIME_ERROR);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Halt job.
	 *
	 * @param jobName  the job name
	 * @param jobGroup the job group
	 * @param flag     the flag
	 * @return the response entity
	 */
	@GetMapping(value = "/scheduleJob/pause/{jobname}/{jobgroup}/{flag}")
	public ResponseEntity<Boolean> haltJob(@PathVariable(name = "jobname") String jobName,
			@PathVariable(name = "jobgroup") String jobGroup, @PathVariable(name = "flag") boolean flag) {
		logger.info("Request to halt job");
		try {
			return ResponseEntity.ok(jobServices.pauseJob(jobName, jobGroup, flag));
		} catch (Exception ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
		}
	}

	@GetMapping(value = "/scheduleJob/pauseAll/{jobgroup}/{flag}")
	public ResponseEntity<Boolean> haltAllJobs(@PathVariable(name = "jobgroup") String jobGroup,
			@PathVariable(name = "flag") boolean flag) {
		logger.info("Request to halt job");
		try {
			return ResponseEntity.ok(jobServices.pauseAllJob(jobGroup, flag));
		} catch (Exception ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
		}
	}

	/**
	 * Delete job.
	 *
	 * @param jobName  the job name
	 * @param jobGroup the job group
	 * @return the response entity
	 */
	@DeleteMapping(value = "/scheduleJob/delete/{jobname}/{jobgroup}")
	public ResponseEntity<Boolean> deleteJob(@PathVariable(name = "jobname") String jobName,
			@PathVariable(name = "jobgroup") String jobGroup) {
		logger.info("Request to delete job");
		return ResponseEntity.ok(jobServices.deleteJob(jobName, jobGroup));
	}

	/**
	 * Gets the all jobs.
	 *
	 * @param org    the org
	 * @param offset the offset
	 * @return the all jobs
	 */
	@GetMapping(value = "/scheduleJob/all/{org}")
	public ResponseEntity<List<JobModelDTO>> getAllJobs(@PathVariable(name = "org") String org,
			@RequestParam("offset") int offset,
			@RequestParam(name = "searchText", required = false) String search) {
		logger.info("Request to get all scheduled jobs");
		try {
			if(search != null && !search.isEmpty()) {
				return ResponseEntity.ok(jobServices.findAllJobs(org, offset, search));
			} else {
				return ResponseEntity.ok(jobServices.findAllJobs(org, offset, null));				
			}
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
		}
	}

	/**
	 * Gets the job by name.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the job by name
	 * @throws SchedulerException the scheduler exception
	 */
	@GetMapping(value = "/scheduleJob/name/{name}/{org}")
	public ResponseEntity<JobModelDTO> getJobByName(@PathVariable(name = "name") String name,
			@PathVariable(name = "org") String org) throws SchedulerException {
		logger.info("Request to get scheduled job by name : {}", name);
		return ResponseEntity.ok(jobServices.getJobByQuartzJobId(name, org));
	}

	/**
	 * Retry job.
	 *
	 * @param name   the name
	 * @param org    the org
	 * @param runtime   the type
	 * @param offset the offset
	 * @param local  the local
	 * @return the response entity
	 */
	@GetMapping(value = "/retryJob/{name}/{org}/{type}")
	public ResponseEntity<String> retryJob(@PathVariable(name = "name") String name,
			@PathVariable(name = "org") String org, @PathVariable(name = "type") String runtime,
			@RequestParam("offset") int offset,
			@RequestParam(name = "local", required = false, defaultValue = "local") String local,
			@RequestParam(name = "datasourceName" , required = false, defaultValue = "null") String datasourceName
			) {
		try {
			logger.info("Request to retry job [{} : {} : {}]", name, org, runtime);
			jobServices.retryJob(name, org, runtime, Boolean.toString(local.equalsIgnoreCase("local")), offset,datasourceName);
			return ResponseEntity.ok("Done");
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
		}
	}

	/**
	 * Checks if is quartz enabled.
	 *
	 * @return the response entity
	 */
	@GetMapping(value = "/quartz")
	public ResponseEntity<Boolean> isQuartzEnabled() {
		logger.info("Request to get quartz status");
		return ResponseEntity.ok(jobServices.isEnabled());
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

//	This is the copy template controller --> jobs/ICIPCopyTemplate
	@PostMapping("/copytemplate/{target}/{source}")
	@Timed
	public ResponseEntity<?> runCopyTemplate(@PathVariable("target") String target, @PathVariable("source") String source,
			@RequestParam(name = PROJECT_ID, required = true) String projectId,
			@RequestBody(required = true) String org) {
		schedulerPauseStatus = checkStatus("icip.scheduler.pause.status","Core");
		if(schedulerPauseStatus.equalsIgnoreCase("false")) {
			logger.info("Copy template controller is called source-->{} target-->{}  id-->{} org-->{} user-->{}",source,target,projectId,org,ICIPUtils.getUser(claim));
			Map<String, String> params = new HashMap<>();
			params.put(FROM_PROJECT, source);
			params.put(TO_PROJECT, target);
			params.put(PROJECT_ID, projectId);
			params.put(SUBMITTED_BY, ICIPUtils.getUser(claim));
			params.put(ORG, org);
			InternalEvent event = new InternalEvent(this, "COPYTEMPLATE", target, params, ICIPCopyTemplate.class);
			eventService.getApplicationEventPublisher().publishEvent(event);
			return new ResponseEntity<>("Copy Template Successful", HttpStatus.OK);
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
