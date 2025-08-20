package com.lfn.icip.icipwebeditor.job.service.impl;

import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.TimeZone;

import org.json.simple.JSONArray;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.quartz.CronScheduleBuilder;
import org.quartz.CronTrigger;
import org.quartz.JobDataMap;
import org.quartz.JobDetail;
import org.quartz.JobKey;
import org.quartz.ScheduleBuilder;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.SimpleScheduleBuilder;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.quartz.TriggerKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.scheduling.quartz.SchedulerFactoryBean;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.Gson;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.ai.comm.lib.util.annotation.service.ConstantsService;
import com.lfn.ai.comm.lib.util.logger.JobLogger;
import com.lfn.iamp.usm.domain.DashConstant;
import com.lfn.icip.icipwebeditor.fileserver.service.impl.FileServerService;
import com.lfn.icip.icipwebeditor.job.constants.JobConstants;
import com.lfn.icip.icipwebeditor.job.enums.JobType;
import com.lfn.icip.icipwebeditor.job.enums.RuntimeType;
import com.lfn.icip.icipwebeditor.job.model.dto.JobObjectDTO;
import com.lfn.icip.icipwebeditor.job.model.dto.JobObjectDTO.Jobs;
import com.lfn.icip.icipwebeditor.job.quartz.model.QrtzTriggers;
import com.lfn.icip.icipwebeditor.job.quartz.repository.QrtzTriggersRepository;
import com.lfn.icip.icipwebeditor.job.util.TimeUtils;

import ch.qos.logback.core.util.TimeUtil;
import lombok.extern.log4j.Log4j2;

// TODO: Auto-generated Javadoc
/**
 * The Class QuartzService.
 */
@Service
@Transactional
@RefreshScope

/** The Constant log. */
@Log4j2
public class QuartzService {

	/** The logger. */
	private final Logger logger = LoggerFactory.getLogger(JobLogger.class);

	/** The triggers repository. */
	private QrtzTriggersRepository triggersRepository;

	/** The scheduler. */
	private Scheduler scheduler;

	/** The fileserver service. */
	private FileServerService fileserverService;

	/** The folder path. */
	@EssedumProperty("icip.jobLogFileDir")
	private String folderPath;

	@Autowired
	private SchedulerFactoryBean schedulerFactoryBean;
	private TimeUtils timeutils;

	@Autowired
	private ConstantsService constantservice;

	/**
	 * 
	 * Instantiates a new quartz service.
	 *
	 * @param schedulerFactoryBean the scheduler factory bean
	 * @param triggersRepository   the triggers repository
	 * @param fileserverService    the fileserver service
	 */
	public QuartzService(SchedulerFactoryBean schedulerFactoryBean, QrtzTriggersRepository triggersRepository,
			FileServerService fileserverService) {
		this.scheduler = schedulerFactoryBean.getScheduler();
		this.triggersRepository = triggersRepository;
		this.fileserverService = fileserverService;
	}

	/**
	 * Reschedule existing schedules.
	 *
	 * @param marker the marker
	 * @throws Exception the exception
	 */
	public void rescheduleExistingSchedules(Marker marker) throws Exception {
		logger.info(marker, "Getting all triggers");
		List<QrtzTriggers> triggers = triggersRepository.findAll();
		for (QrtzTriggers trigger : triggers) {
			TriggerKey triggerKey = TriggerKey.triggerKey(trigger.getTriggerName(), trigger.getTriggerGroup());
			JobKey jobKey = JobKey.jobKey(trigger.getJobName(), trigger.getJobGroup());
			logger.info(marker, "Checking Job : {}.{}", jobKey.getName(), jobKey.getGroup());
			boolean isPaused = trigger.getTriggerState().equals(Trigger.TriggerState.PAUSED.toString());
			if (!isPaused) {
				scheduler.pauseTrigger(triggerKey);
			}
			JobDetail jobDetail = scheduler.getJobDetail(jobKey);
			JobDataMap jobDataMap = jobDetail.getJobDataMap();
			if (!valid(marker, jobDataMap)) {
				logger.info(marker, "Invalid Job, Rescheduling...");
				String cname = jobDataMap.getString(JobConstants.CNAME);
				String org = jobDataMap.getString(JobConstants.ORG);
				String submittedBy = jobDataMap.getString(JobConstants.SUBMITTEDBY);
				String expression = jobDataMap.getString(JobConstants.EXPRESSION);
				String params = jobDataMap.getString(JobConstants.PARAMS) != null
						? jobDataMap.getString(JobConstants.PARAMS)
						: "";
				int thresholdTime = jobDataMap.getInt("threshold");
				boolean chain = jobDataMap.getBoolean(JobConstants.CHAIN);
				boolean isAgent = jobDataMap.getBoolean(JobConstants.AGENT);
				RuntimeType runtime = RuntimeType.valueOf(jobDataMap.getString(JobConstants.RUNTIME).toUpperCase());
				String restNodeId = jobDataMap.getString(JobConstants.RESTNODEID);
				boolean isRestNode = jobDataMap.getBoolean(JobConstants.RESTNODE);
				String chainname = jobDataMap.getString(JobConstants.CHAINNAME);
				List<Jobs> jobslist = new ArrayList<>();
				jobslist.add(new Jobs(cname, runtime, params, isRestNode, restNodeId));
				if (chain) {
					logger.info(marker, "Found Chain");
					List<JobKey> keys = getJobsFromChainListener(marker, jobKey);
					for (JobKey key : keys) {
						JobDetail newjobDetail = scheduler.getJobDetail(key);
						JobDataMap newjobDataMap = newjobDetail.getJobDataMap();
						String newcname = newjobDataMap.getString(JobConstants.CNAME);
						String newparams = newjobDataMap.getString(JobConstants.PARAMS) != null
								? newjobDataMap.getString(JobConstants.PARAMS)
								: "";
						RuntimeType newruntime = RuntimeType
								.valueOf(newjobDataMap.getString(JobConstants.RUNTIME).toUpperCase());
						String newrestNodeId = newjobDataMap.getString(JobConstants.RESTNODEID);
						boolean newisRestNode = newjobDataMap.getBoolean(JobConstants.RESTNODE);
						jobslist.add(new Jobs(newcname, newruntime, newparams, newisRestNode, newrestNodeId));
					}
				}
				JobType jobType = chain ? JobType.CHAIN : isAgent ? JobType.AGENT : JobType.PIPELINE;
				new JobObjectDTO(null, chain ? chainname : cname, org, chain ? chainname : cname, submittedBy, jobslist,
						jobType, ICIPUtils.generateCorrelationId(), expression, false, false, false, false,
						thresholdTime);
				JobObjectDTO jobObjectDTO = new JobObjectDTO(null, chain ? chainname : cname, org,
						chain ? chainname : cname, submittedBy, jobslist, jobType, ICIPUtils.generateCorrelationId(),
						expression, false, false, false, false, thresholdTime);
				jobDataMap.put(JobConstants.JOB_DATAMAP_VALUE, new Gson().toJson(jobObjectDTO));
				logger.info(marker, "Format changed");
				scheduler.addJob(jobDetail, true);
				logger.info(marker, "Rescheduled");
			} else {
				logger.info(marker, "Valid job-data");
			}
			if (!isPaused) {
				scheduler.resumeTrigger(triggerKey);
			}
		}
	}

	/**
	 * Valid.
	 *
	 * @param marker     the marker
	 * @param jobDataMap the job data map
	 * @return true, if successful
	 */
	private boolean valid(Marker marker, JobDataMap jobDataMap) {
		logger.info(marker, "Checking if jobdata is valid or not...");
		return jobDataMap.containsKey(JobConstants.JOB_DATAMAP_VALUE);
	}

	/**
	 * Gets the jobs from chain listener.
	 *
	 * @param marker the marker
	 * @param jobKey the job key
	 * @return the jobs from chain listener
	 * @throws Exception the exception
	 */
	private List<JobKey> getJobsFromChainListener(Marker marker, JobKey jobKey) throws Exception {
		String filename = ICIPUtils.removeSpecialCharacter(jobKey.toString());
		java.nio.file.Path path = Paths.get(folderPath, JobConstants.CHAIN_LISTENER_FILE, filename + ".json");
		java.nio.file.Files.createDirectories(path.getParent());
		if (java.nio.file.Files.exists(path)) {
			log.debug("reading chain listener json file [locally] : {}", path);
			logger.info(marker, "reading chain listener json file [locally] : {}", path);
			return getJobsFromChainListenerChild(path);
		} else {
			log.debug("downloading file...");
			logger.info(marker, "downloading file...");
			byte[] bytes = fileserverService.download(filename, filename + ".json", jobKey.getGroup());
			java.nio.file.Files.createFile(path);
			try (OutputStream os = new FileOutputStream(path.toFile())) {
				os.write(bytes);
			}
			log.debug("reading chain listener json file [remotely] : {}", path);
			logger.info(marker, "reading chain listener json file [remotely] : {}", path);
			return getJobsFromChainListenerChild(path);
		}
	}

	/**
	 * Gets the jobs from chain listener child.
	 *
	 * @param path the path
	 * @return the jobs from chain listener child
	 * @throws IOException    Signals that an I/O exception has occurred.
	 * @throws ParseException the parse exception
	 */
	private List<JobKey> getJobsFromChainListenerChild(java.nio.file.Path path) throws IOException, ParseException {
		try (FileReader rd = new FileReader(path.toFile())) {
			Object jsonData = new JSONParser().parse(rd);
			org.json.simple.JSONObject requiredJson = (org.json.simple.JSONObject) jsonData;
			JSONArray chains = (JSONArray) requiredJson.get("chains");
			return getJobKeyList(chains);
		}
	}

	/**
	 * Gets the job key list.
	 *
	 * @param chains the chains
	 * @return the job key list
	 */
	private List<JobKey> getJobKeyList(JSONArray chains) {
		List<JobKey> keys = new ArrayList<>();
		for (int i = 0, j = chains.size(); i < j; i++) {
			keys.add(getJobKeyFromChains(i, chains));
		}
		return keys;
	}

	/**
	 * Gets the job key from chains.
	 *
	 * @param index  the index
	 * @param chains the chains
	 * @return the job key from chains
	 */
	private JobKey getJobKeyFromChains(int index, JSONArray chains) {
		org.json.simple.JSONObject json = (org.json.simple.JSONObject) chains.get(index);
		return new JobKey(json.get("name").toString(), json.get("group").toString());
	}

	public void rescheduleExistingSchedulesWithThreshold(Marker marker, String organization) throws Exception {

		List<? extends QrtzTriggers> triggers = triggersRepository.findByJobGroup(organization);
		String	timezoneOffsetvalue = constantservice.findByKeys("rescheduleTimezoneDST", organization);
	      if(!timezoneOffsetvalue.isBlank()&&!timezoneOffsetvalue.equalsIgnoreCase("null")) {
		triggers.stream().filter(trigger -> trigger.getTriggerType().equalsIgnoreCase("CRON")).forEach(trigger -> {

			try {
				Trigger triggerOld = schedulerFactoryBean.getScheduler()
						.getTrigger(new TriggerKey(trigger.getTriggerName(), trigger.getTriggerGroup()));
				CronTrigger cronTrigger = (CronTrigger) triggerOld;
				if (cronTrigger.getTimeZone().getID().startsWith("GMT+")) {

					String cronExpr = cronTrigger.getCronExpression();
					String timezoneOffset = cronTrigger.getTimeZone().getID();
					JobDetail job = schedulerFactoryBean.getScheduler()
							.getJobDetail(new JobKey(trigger.getJobName(), trigger.getJobGroup()));
					TriggerBuilder<? extends Trigger> newTriggerB = triggerOld.getTriggerBuilder();
					String tz = timezoneOffsetvalue.replace("'", "");
					ZoneId id = ZoneId.of(timezoneOffsetvalue);

					TimeZone timeZone = TimeZone.getTimeZone(id);

					ScheduleBuilder scheduleBuilder = CronScheduleBuilder.cronSchedule(cronExpr)
							.withMisfireHandlingInstructionFireAndProceed().inTimeZone(timeZone);
					Trigger newTrigger = newTriggerB.forJob(job).startAt(cronTrigger.getStartTime())
							.withSchedule(scheduleBuilder).build();
					Date newt = scheduler.rescheduleJob(triggerOld.getKey(), newTrigger);
					//System.out.println(newt);
				}
			} catch (SchedulerException e) {
				//System.out.println(e);
				logger.error(e.getMessage());
			}

		});
	      }
	}



}
