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

import java.sql.SQLException;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TimeZone;
import java.util.UUID;

import org.apache.commons.lang3.time.DateUtils;
import org.bouncycastle.util.encoders.DecoderException;
import org.json.JSONObject;
import org.quartz.CronExpression;
import org.quartz.CronScheduleBuilder;
import org.quartz.CronTrigger;
import org.quartz.JobBuilder;
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
import org.quartz.impl.matchers.GroupMatcher;
import org.quartz.impl.matchers.KeyMatcher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.scheduling.quartz.SchedulerFactoryBean;
import org.springframework.stereotype.Service;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.icip.icipwebeditor.job.constants.JobConstants;
import com.infosys.icets.icip.icipwebeditor.job.enums.JobStatus;
import com.infosys.icets.icip.icipwebeditor.job.enums.JobType;
import com.infosys.icets.icip.icipwebeditor.job.enums.RuntimeType;
import com.infosys.icets.icip.icipwebeditor.job.listener.ICIPJobSchedulerListener;
import com.infosys.icets.icip.icipwebeditor.job.model.ChainObject;
import com.infosys.icets.icip.icipwebeditor.job.model.ChainObject.ChainJobElement2.ChainJob2;
import com.infosys.icets.icip.icipwebeditor.job.model.ICIPChains;
import com.infosys.icets.icip.icipwebeditor.job.model.JobCredentials;
import com.infosys.icets.icip.icipwebeditor.job.model.JobModel;
import com.infosys.icets.icip.icipwebeditor.job.model.dto.JobModelDTO;
import com.infosys.icets.icip.icipwebeditor.job.model.dto.JobModelDTO.QuartzProperties;
import com.infosys.icets.icip.icipwebeditor.job.model.dto.JobModelDTO.QuartzProperties.QuartzJobDetails;
import com.infosys.icets.icip.icipwebeditor.job.model.dto.JobObjectDTO;
import com.infosys.icets.icip.icipwebeditor.job.model.dto.JobObjectDTO.Jobs;
import com.infosys.icets.icip.icipwebeditor.job.model.dto.JobParamsDTO;
import com.infosys.icets.icip.icipwebeditor.job.quartz.model.QrtzTriggers;
import com.infosys.icets.icip.icipwebeditor.job.quartz.repository.QrtzTriggersRepository;
import com.infosys.icets.icip.icipwebeditor.job.util.TimeUtils;
import com.infosys.icets.icip.icipwebeditor.model.ICIPStreamingServices;
import com.infosys.icets.icip.icipwebeditor.service.IICIPChainJobsService;
import com.infosys.icets.icip.icipwebeditor.service.IICIPChainsService;
import com.infosys.icets.icip.icipwebeditor.service.IICIPStreamingServiceService;
import com.infosys.icets.icip.icipwebeditor.service.JobScheduleService;

import lombok.Getter;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class JobScheduleServiceImpl.
 *
 * @author icets
 */

/**
 * Gets the timeutils.
 *
 * @return the timeutils
 */
@Getter
@Service
@RefreshScope
public class JobScheduleServiceImpl implements JobScheduleService {

	/** The scheduler factory bean. */
	private SchedulerFactoryBean schedulerFactoryBean;

	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;

	/** The enabled. */
	private boolean enabled;

	/** The qrtz triggers repository. */
	private QrtzTriggersRepository qrtzTriggersRepository;

	/** The pipeline service. */
	private ICIPPipelineService pipelineService;

	/** The i ICIP chains service. */
	private IICIPChainsService iICIPChainsService;

	/** The streaming services service. */
	private IICIPStreamingServiceService streamingServicesService;

	/** The i ICIP chain jobs service. */
	private IICIPChainJobsService iICIPChainJobsService;

	/** The timeutils. */
	private TimeUtils timeutils;

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(JobScheduleServiceImpl.class);

	/**
	 * Instantiates a new job schedule service impl.
	 *
	 * @param schedulerFactoryBean     the scheduler factory bean
	 * @param enabled                  the enabled
	 * @param qrtzTriggersRepository   the qrtz triggers repository
	 * @param timeutils                the timeutils
	 * @param pipelineService          the pipeline service
	 * @param iICIPChainsService       the i ICIP chains service
	 * @param streamingServicesService the streaming services service
	 * @param iICIPChainJobsService    the i ICIP chain jobs service
	 */
	public JobScheduleServiceImpl(SchedulerFactoryBean schedulerFactoryBean,
			@Value("${spring.quartz.enabled}") boolean enabled, QrtzTriggersRepository qrtzTriggersRepository,
			TimeUtils timeutils, ICIPPipelineService pipelineService, IICIPChainsService iICIPChainsService,
			IICIPStreamingServiceService streamingServicesService, IICIPChainJobsService iICIPChainJobsService) {
		super();
		this.schedulerFactoryBean = schedulerFactoryBean;
		this.enabled = enabled;
		this.qrtzTriggersRepository = qrtzTriggersRepository;
		this.timeutils = timeutils;
		this.pipelineService = pipelineService;
		this.iICIPChainsService = iICIPChainsService;
		this.streamingServicesService = streamingServicesService;
		this.iICIPChainJobsService = iICIPChainJobsService;
	}

	/**
	 * Generate job schedule object.
	 *
	 * @param jobCredentials the job credentials
	 * @param jobProperties  the job properties
	 * @param restProperties the rest properties
	 * @return the job model
	 */
	@Override
	public List<JobModel> generateJobModelList(List<JobCredentials> jobCredentials,
			List<JobModel.JobProperties> jobProperties, List<JobModel.RestProperties> restProperties) {
		logger.info("generating jobModel list");
		List<JobModel> jobModelList = new LinkedList<>();
		for (int index = 0, limit = jobCredentials.size(); index < limit; index++) {
			JobModel jobModel = new JobModel();
			JobCredentials jobCredential = jobCredentials.get(index);
			JobModel.JobProperties jobProperty = jobProperties.get(index);
			JobModel.RestProperties restProperty = restProperties.get(index);
			jobModel.setCname(jobCredential.getName());
			jobModel.setAlias(jobCredential.getAlias());
			jobModel.setParams(jobCredential.getParmas());
			jobModel.setOrg(jobCredential.getOrg());
			jobModel.setJobProperties(jobProperty);
			jobModel.setRestProperties(restProperty);
			jobModelList.add(jobModel);
		}
		return jobModelList;
	}

	/**
	 * Generate job details object.
	 *
	 * @param cname            the cname
	 * @param alias            the alias
	 * @param runtime          the runtime
	 * @param repeatType       the repeat type
	 * @param quartzProperties the quartz properties
	 * @return the job data model
	 */
	@Override
	public JobModelDTO generateJobModelDTO(String cname, String alias, String runtime, String repeatType,
			JobModelDTO.QuartzProperties quartzProperties, int jobTimeout, String remoteDatasourceName, String scheduleType) {
		JobModelDTO job = new JobModelDTO();
		job.setCname(cname);
		job.setAlias(alias);
		job.setRuntime(runtime);
		job.setRepeattype(repeatType);
		job.setQuartzProperties(quartzProperties);
		job.setJobtimeout(jobTimeout);
		job.setRemoteDatasourceName(remoteDatasourceName);
		job.setScheduleType(scheduleType);
		return job;
	}

	/**
	 * Gets the job details.
	 *
	 * @param jobTypeName    the job type name
	 * @param jobCredentials the job credentials
	 * @param jobProperties  the job properties
	 * @param restProperties the rest properties
	 * @param isChain        the is chain
	 * @param clazz          the clazz
	 * @param jobDesc        the job desc
	 * @param isAgent        the is agent
	 * @param corelid        the corelid
	 * @param jobname        the jobname
	 * @param isParallel     the is parallel
	 * @param isEvent        the is event
	 * @param isRunNow       the is run now
	 * @param alias          the alias
	 * @return the job details
	 */
	private JobDetail createQuartzJobDetail(String jobTypeName, List<JobCredentials> jobCredentials,
			List<JobModel.JobProperties> jobProperties, List<JobModel.RestProperties> restProperties, boolean isChain,
			Class clazz, String jobDesc, boolean isAgent, String corelid, String jobname, boolean isParallel,
			boolean isEvent, boolean isRunNow, String alias) {
		List<JobModel> jobModelList = this.generateJobModelList(jobCredentials, jobProperties, restProperties);
		return buildQuartzJobDetail(jobModelList, jobTypeName, clazz, jobDesc, isAgent, isChain, corelid, jobname,
				isParallel, isEvent, isRunNow, alias);
	}

	/**
	 * Schedule quartz job.
	 *
	 * @param booleanArray     the boolean array
	 * @param scheduler        the scheduler
	 * @param jobDetail        the job detail
	 * @param dateTime         the date time
	 * @param expression       the expression
	 * @param quartzJobDetails the quartz job details
	 * @param jobDesc          the job desc
	 * @throws SchedulerException the scheduler exception
	 */
	private void scheduleQuartzJob(boolean[] booleanArray, Scheduler scheduler, JobDetail jobDetail,
			ZonedDateTime dateTime, String expression, JobModelDTO.QuartzProperties.QuartzJobDetails quartzJobDetails,
			String jobDesc, String submittedBy) throws SchedulerException {

		boolean runNow = booleanArray[JobConstants.RUNNOW];
		boolean isCron = booleanArray[JobConstants.ISCRON];
		boolean isUpdate = booleanArray[JobConstants.ISUPDATE];

		String jobName = quartzJobDetails.getJobname();
		String jobGroup = quartzJobDetails.getJobgroup();

		if (runNow) {
			JobKey jobKey = jobDetail.getKey();
			scheduler.addJob(jobDetail, true);
			scheduler.triggerJob(jobKey);
		} else {
			Trigger trigger = null;
			TriggerKey triggerKey = TriggerKey.triggerKey(jobName, jobGroup + JobConstants.TRIGGERS);
			Trigger passingTrigger = isUpdate ? scheduler.getTrigger(triggerKey) : null;

			if (isCron) {
				trigger = this.buildCronJobTrigger(jobDetail, dateTime, expression, passingTrigger, jobDesc);
			} else {
				trigger = this.buildSimpleJobTrigger(jobDetail, dateTime, passingTrigger, jobDesc);
			}

			if (isUpdate) {
				scheduler.rescheduleJob(triggerKey, trigger);
			} else {
				scheduler.scheduleJob(jobDetail, trigger);
			}
		}

	}

	/**
	 * Builds the trigger.
	 *
	 * @param jobDetail  the job detail
	 * @param startAt    the start at
	 * @param expression the expression
	 * @param trigger    the trigger
	 * @param isCron     the is cron
	 * @param jobDesc    the job desc
	 * @return the trigger
	 */
	private Trigger buildTrigger(JobDetail jobDetail, ZonedDateTime startAt, String expression, Trigger trigger,
			boolean isCron, String jobDesc) {
		String name = trigger != null ? trigger.getKey().getName() : jobDetail.getKey().getName();
		String org = trigger != null ? trigger.getKey().getGroup() : jobDetail.getKey().getGroup();
		TimeZone timezone =TimeZone.getTimeZone(startAt.getZone());
		Date date = Date.from(startAt.toInstant());
		logger.debug("Timezone : {}", timezone);
		logger.debug("StartAt : {}", startAt);
		logger.debug("StartAt-Instant : {}", startAt.toInstant());
		logger.debug("StartAt-Date : {}", date);
		ScheduleBuilder scheduleBuilder = isCron
				? CronScheduleBuilder.cronSchedule(expression).withMisfireHandlingInstructionFireAndProceed()
						.inTimeZone(timezone)
				: SimpleScheduleBuilder.simpleSchedule().withMisfireHandlingInstructionFireNow();
		return TriggerBuilder.newTrigger().forJob(jobDetail).withIdentity(name, org).withDescription(jobDesc)
				.startAt(date).withSchedule(scheduleBuilder).build();
	}

	/**
	 * Creates the job params.
	 *
	 * @param timezone   the timezone
	 * @param org        the org
	 * @param params     the params
	 * @param isNative   the is native
	 * @param expression the expression
	 * @param tmpDate    the tmp date
	 * @param tmpTime    the tmp time
	 * @return the job create params
	 */
	private JobParamsDTO createJobParams(String timezone, String org, String params, String isNative, String expression,
			String tmpDate, String tmpTime, int jobTimeout, String datasource) {
		JobParamsDTO jobParams = new JobParamsDTO();
		jobParams.setExpression(expression);
		jobParams.setMyDate(tmpDate);
		jobParams.setMyTime(tmpTime);
		jobParams.setOrg(org);
		jobParams.setParams(params);
		jobParams.setTimeZone(timezone);
		jobParams.setIsNative(isNative);
		jobParams.setThresholdTime(jobTimeout);
		jobParams.setDatasourceName(datasource);
		return jobParams;
	}

	/**
	 * Generate time from date value.
	 *
	 * @param date the date
	 * @return the string
	 */
	private String generateTimeFromDateValue(LocalDateTime date) {
		return String.format("%s%d%s%d", "", date.getHour(), ":", date.getMinute());
	}

	/**
	 * Generate date from date value.
	 *
	 * @param date the date
	 * @return the string
	 */
	private String generateDateFromDateValue(LocalDateTime date) {
		return String.format("%s%d%s%d%s%d", "", date.getYear(), "-", date.getMonthValue(), "-", date.getDayOfMonth());
	}

	/**
	 * Gets the scheduled job details.
	 *
	 * @param restNodeId the rest node id
	 * @param jobDetail  the job detail
	 * @param corelid    the corelid
	 * @return the scheduled job details
	 */
	private JSONObject generateResponse(String restNodeId, JobDetail jobDetail, String corelid) {
		JSONObject obj = new JSONObject();
		obj.put("status", JobStatus.STARTED);
		obj.put("jobId", jobDetail.getKey().getName());
		obj.put("jobKey", jobDetail.getKey());
		obj.put(JobConstants.RESTNODEID, restNodeId);
		obj.put("corelid", corelid);
		return obj;
	}

	/**
	 * Creates the chain job.
	 *
	 * @param jobs       the jobs
	 * @param icipChains the icip chains
	 * @param params     the params
	 * @param clazz      the clazz
	 * @param corelid    the corelid
	 * @param isEvent    the is event
	 * @param feoffset   the feoffset
	 * @return the JSON object
	 * @throws SchedulerException the scheduler exception
	 * @throws SQLException       the SQL exception
	 */
	@Override
	public JSONObject createChainJob(ChainJob2[] jobs, ICIPChains icipChains, String params, Class clazz,
			String corelid, boolean isEvent, int feoffset, String submittedBy,JSONObject datasourceName) throws SchedulerException, SQLException {
		logger.info("creating chain job");

		Gson gson = new Gson();
		ChainObject.InitialJsonContent2 initialChain = gson.fromJson(icipChains.getJsonContent(),
				ChainObject.InitialJsonContent2.class);

		Scheduler scheduler = schedulerFactoryBean.getScheduler();
		if (scheduler.isInStandbyMode() && initialChain.isRunNow()) {
			throw new SchedulerException(JobConstants.UNABLE_TO_PROCEED_IN_STANDBY_MODE);
		}
		if (submittedBy == null || submittedBy.trim().equalsIgnoreCase("Anonymous"))
			submittedBy = ICIPUtils.getUser(claim);
		String jobDesc = buildNewJobDescription(icipChains.getJobName(), icipChains.getOrganization(), submittedBy);

		boolean nullExpression = initialChain.getExpression() == null || initialChain.getExpression().trim().isEmpty();

		boolean[] booleanArray = new boolean[4];
		booleanArray[JobConstants.RUNNOW] = initialChain.isRunNow();
		booleanArray[JobConstants.ISCRON] = !nullExpression;
		booleanArray[JobConstants.ISUPDATE] = false;
		booleanArray[JobConstants.RESTNODEBOOLEAN] = false;

		JobModelDTO.QuartzProperties.QuartzJobDetails quartzJobDetails = new JobModelDTO.QuartzProperties.QuartzJobDetails(
				UUID.randomUUID().toString(), icipChains.getOrganization());

		List<JobModel.JobProperties> jobPropertiesList = new LinkedList<>();
		List<JobModel.RestProperties> restPropertiesList = new LinkedList<>();
		List<JobCredentials> jobCredentialsList = new LinkedList<>();

		ZoneId zoneid = ZoneId.ofOffset("", ZoneOffset.ofTotalSeconds(feoffset * 60 * -1));

		for (int i = 0, j = jobs.length; i < j; i++) {
			ChainJob2 job = jobs[i];
			JobModel.JobProperties jobProperties = new JobModel.JobProperties(job.getType(),
					initialChain.getExpression(), null, null, submittedBy, "true",
					(initialChain.getJobTimeout() != null && initialChain.getJobTimeout() > 0)
							? initialChain.getJobTimeout()
							: 0);
			JobModel.RestProperties restProperties = new JobModel.RestProperties();
			JobCredentials jobCredentials = new JobCredentials(job.getName(), icipChains.getOrganization(),
					job.getName(), params);

			jobPropertiesList.add(jobProperties);
			restPropertiesList.add(restProperties);
			jobCredentialsList.add(jobCredentials);
		}

		JobDetail jobDetail = createQuartzJobDetail(icipChains.getOrganization(), jobCredentialsList, jobPropertiesList,
				restPropertiesList, true, clazz, jobDesc, false, corelid, icipChains.getJobName(),
				icipChains.getParallelchain() == 1, isEvent, booleanArray[JobConstants.RUNNOW],
				icipChains.getJobName());

		ZonedDateTime dateTime = null;
		int dboffset = timeutils.getOffset();

		if (!initialChain.isRunNow()) {
			String userDate = initialChain.getMyDate();
			String userTime = initialChain.getMyTime();
			LocalDateTime date = createLocalDateTime(userDate, userTime);
			logger.debug("DB Offset : {}", dboffset);
			logger.debug("FE Offset : {}", feoffset);
			logger.debug("Date : {}", date);
			dateTime = ZonedDateTime.of(date, zoneid);
			logger.debug("Date with Offset : {}", date);
			logger.debug("DateTime : {}", dateTime);
		}
		if(datasourceName!=null) {
		jobDetail.getJobDataMap().put("datasourceName", datasourceName.toString());
		}
		return scheduleJobChild(booleanArray, quartzJobDetails, null, corelid, scheduler, icipChains.getOrganization(),
				nullExpression ? "" : initialChain.getExpression(), jobDetail, dateTime, jobDesc, submittedBy);

	}

	/**
	 * Schedule job.
	 *
	 * @param runtime          the runtime
	 * @param cname            the cname
	 * @param alias            the alias
	 * @param body             the body
	 * @param booleanArray     the boolean array
	 * @param quartzJobDetails the quartz job details
	 * @param restNodeId       the rest node id
	 * @param clazz            the clazz
	 * @param isAgent          the is agent
	 * @param corelid          the corelid
	 * @param isEvent          the is event
	 * @param feoffset         the feoffset
	 * @return the JSON object
	 * @throws SchedulerException the scheduler except ion
	 * @throws SQLException       the SQL exception
	 */
	private JSONObject scheduleJob(String runtime, String cname, String alias, JobParamsDTO body,
			boolean[] booleanArray, JobModelDTO.QuartzProperties.QuartzJobDetails quartzJobDetails, String restNodeId,
			Class clazz, boolean isAgent, String corelid, boolean isEvent, int feoffset, String submittedBy)
			throws SchedulerException, SQLException {
		Scheduler scheduler = schedulerFactoryBean.getScheduler();

		String org = body.getOrg();
		if (submittedBy == null || submittedBy.trim().equalsIgnoreCase("Anonymous"))
			submittedBy = ICIPUtils.getUser(claim);
		String expression = (body.getExpression() != null ? body.getExpression() : "");
		Integer jobTimeout = body.getThresholdTime();
		boolean isUpdate = booleanArray[JobConstants.ISUPDATE];
		boolean runNow = booleanArray[JobConstants.RUNNOW];

		ZoneId zoneid = ZoneId.ofOffset("", ZoneOffset.ofTotalSeconds(feoffset * 60 * -1));

		if (!isUpdate)
			restNodeId = UUID.randomUUID().toString();

		JobModel.RestProperties restProperties = new JobModel.RestProperties(booleanArray[JobConstants.RESTNODEBOOLEAN],
				restNodeId);
		JobCredentials jobCredentials = new JobCredentials(cname, org, alias,
				(body.getParams() != null ? body.getParams() : ""));
		JobModel.JobProperties jobProperties = new JobModel.JobProperties(runtime, expression, null, null, submittedBy,
				body.getIsNative(), jobTimeout);

		JobDetail jobDetail;
		ZonedDateTime dateTime = null;
		int dboffset = timeutils.getOffset();

		if (runNow) {
			if (scheduler.isInStandbyMode()) {
				throw new SchedulerException(JobConstants.UNABLE_TO_PROCEED_IN_STANDBY_MODE);
			}
		} else {
			String userDate = body.getMyDate();
			String userTime = body.getMyTime();
			logger.debug("User Date : {}", userDate);
			logger.debug("User Time : {}", userTime);
			LocalDateTime date = createLocalDateTime(userDate, userTime);
			logger.debug("Created Date : {}", date);
			logger.debug("DB Offset : {}", dboffset);
			logger.debug("FE Offset : {}", feoffset);
			jobProperties = jobProperties.updateDateTime(date, "");
			dateTime = ZonedDateTime.of(jobProperties.getDateTime(), zoneid);
			logger.debug("ZonedDateTime : {}", dateTime);
			if (dateTime.isBefore(ZonedDateTime.now(zoneid))) {
				return null;
			}
			if (isUpdate) {
				Gson gson = new Gson();
				JobDetail tmpJobDetail = scheduler
						.getJobDetail(new JobKey(quartzJobDetails.getJobname(), quartzJobDetails.getJobgroup()));
				String jobString = tmpJobDetail.getJobDataMap().getString(JobConstants.JOB_DATAMAP_VALUE);
				JobObjectDTO job = gson.fromJson(jobString, JobObjectDTO.class);
				job.setExpression(expression);
				job.setSubmittedBy(submittedBy);
				tmpJobDetail.getJobDataMap().put(JobConstants.JOB_DATAMAP_VALUE, gson.toJson(job));
				tmpJobDetail.getJobDataMap().put(JobConstants.DATETIME, date);
				tmpJobDetail.getJobDataMap().put(JobConstants.TIMEZONE, "");
				scheduler.addJob(tmpJobDetail, true);
			}
		}

		String jobDesc = buildNewJobDescription(cname, org, submittedBy);

		List<JobModel.JobProperties> jobPropertiesList = new LinkedList<>();
		List<JobModel.RestProperties> restPropertiesList = new LinkedList<>();
		List<JobCredentials> jobCredentialsList = new LinkedList<>();

		jobPropertiesList.add(jobProperties);
		restPropertiesList.add(restProperties);
		jobCredentialsList.add(jobCredentials);

		jobDetail = createQuartzJobDetail(org, jobCredentialsList, jobPropertiesList, restPropertiesList, false, clazz,
				jobDesc, isAgent, corelid, cname, false, isEvent, booleanArray[JobConstants.RUNNOW], alias);
		jobDetail.getJobDataMap().put("datasourceName", body.getDatasourceName());
		jobDetail.getJobDataMap().put("scheduleType", body.getScheduleType());
		return scheduleJobChild(booleanArray, quartzJobDetails, restNodeId, corelid, scheduler, org, expression,
				jobDetail, dateTime, jobDesc, submittedBy);
	}

	/**
	 * Schedule job child.
	 *
	 * @param booleanArray     the boolean array
	 * @param quartzJobDetails the quartz job details
	 * @param restNodeId       the rest node id
	 * @param corelid          the corelid
	 * @param scheduler        the scheduler
	 * @param org              the org
	 * @param expression       the expression
	 * @param jobDetail        the job detail
	 * @param dateTime         the date time
	 * @param jobDesc          the job desc
	 * @return the JSON object
	 * @throws SchedulerException the scheduler exception
	 */
	private JSONObject scheduleJobChild(boolean[] booleanArray,
			JobModelDTO.QuartzProperties.QuartzJobDetails quartzJobDetails, String restNodeId, String corelid,
			Scheduler scheduler, String org, String expression, JobDetail jobDetail, ZonedDateTime dateTime,
			String jobDesc, String submittedBy) throws SchedulerException {
		JobKey jobKey = jobDetail.getKey();
		scheduler.getListenerManager().addJobListener(new ICIPJobSchedulerListener(org + jobKey),
				KeyMatcher.keyEquals(jobKey));
		scheduleQuartzJob(booleanArray, scheduler, jobDetail, dateTime, expression, quartzJobDetails, jobDesc,
				submittedBy);
		return generateResponse(restNodeId, jobDetail, corelid);
	}

	/**
	 * Creates the simple job.
	 *
	 * @param runtime  the runtime
	 * @param cname    the cname
	 * @param alias    the alias
	 * @param body     the body
	 * @param runNow   the run now
	 * @param clazz    the clazz
	 * @param corelid  the corelid
	 * @param feoffset the feoffset
	 * @return the JSON object
	 * @throws SchedulerException the scheduler exception
	 * @throws SQLException       the SQL exception
	 */
	public JSONObject createSimpleJob(String runtime, String cname, String alias, JobParamsDTO body, boolean runNow,
			Class clazz, String corelid, int feoffset) throws SchedulerException, SQLException {
		return this.createSimpleJob(runtime, cname, alias, body, runNow, false, clazz, false, corelid, false, feoffset,
				ICIPUtils.getUser(claim));
	}

	/**
	 * Creates the agent job.
	 *
	 * @param runtime  the runtime
	 * @param cname    the cname
	 * @param alias    the alias
	 * @param body     the body
	 * @param runNow   the run now
	 * @param clazz    the clazz
	 * @param corelid  the corelid
	 * @param feoffset the feoffset
	 * @return the JSON object
	 * @throws SchedulerException the scheduler exception
	 * @throws SQLException       the SQL exception
	 */
	public JSONObject createAgentJob(String runtime, String cname, String alias, JobParamsDTO body, boolean runNow,
			Class clazz, String corelid, int feoffset, String submittedBy) throws SchedulerException, SQLException {
		return this.createSimpleJob(runtime, cname, alias, body, runNow, false, clazz, true, corelid, false, feoffset,
				submittedBy);
	}

	/**
	 * Creates the simple job.
	 *
	 * @param runtime  the runtime
	 * @param cname    the cname
	 * @param alias    the alias
	 * @param body     the body
	 * @param runNow   the run now
	 * @param restNode the rest node
	 * @param clazz    the clazz
	 * @param isAgent  the is agent
	 * @param corelid  the corelid
	 * @param isEvent  the is event
	 * @param feoffset the feoffset
	 * @return the JSON object
	 * @throws SchedulerException the scheduler exception
	 * @throws SQLException       the SQL exception
	 */
	@Override
	public JSONObject createSimpleJob(String runtime, String cname, String alias, JobParamsDTO body, boolean runNow,
			boolean restNode, Class clazz, boolean isAgent, String corelid, boolean isEvent, int feoffset,
			String submittedBy) throws SchedulerException, SQLException {
		logger.info("generating simple job");

		boolean[] booleanArray = new boolean[4];
		booleanArray[JobConstants.RUNNOW] = runNow;
		booleanArray[JobConstants.ISCRON] = false;
		booleanArray[JobConstants.ISUPDATE] = false;
		booleanArray[JobConstants.RESTNODEBOOLEAN] = restNode;

		JobModelDTO.QuartzProperties.QuartzJobDetails quartzJobDetails = new JobModelDTO.QuartzProperties.QuartzJobDetails(
				UUID.randomUUID().toString(), body.getOrg());

		return scheduleJob(runtime, cname, alias, body, booleanArray, quartzJobDetails, null, clazz, isAgent, corelid,
				isEvent, feoffset, submittedBy);
	}

	
	public JSONObject createNewSimpleJob(String runtime, String cname, String alias, JobParamsDTO body, boolean runNow,
			boolean restNode, Class clazz, boolean isAgent, String corelid, boolean isEvent, int feoffset,
			String submittedBy) throws SchedulerException, SQLException {
		logger.info("generating simple job");

		boolean[] booleanArray = new boolean[4];
		booleanArray[JobConstants.RUNNOW] = runNow;
		booleanArray[JobConstants.ISCRON] = false;
		booleanArray[JobConstants.ISUPDATE] = false;
		booleanArray[JobConstants.RESTNODEBOOLEAN] = restNode;

		JobModelDTO.QuartzProperties.QuartzJobDetails quartzJobDetails = new JobModelDTO.QuartzProperties.QuartzJobDetails(
				UUID.randomUUID().toString(), body.getOrg());

		return scheduleJob(runtime, cname, alias, body, booleanArray, quartzJobDetails, null, clazz, isAgent, corelid,
				isEvent, feoffset, submittedBy);
	}
	
	/**
	 * Creates the cron job.
	 *
	 * @param runtime  the runtime
	 * @param cname    the cname
	 * @param alias    the alias
	 * @param body     the body
	 * @param clazz    the clazz
	 * @param corelid  the corelid
	 * @param isEvent  the is event
	 * @param feoffset the feoffset
	 * @return true, if successful
	 * @throws SchedulerException the scheduler exception
	 * @throws SQLException       the SQL exception
	 */
	public JSONObject createCronJob(String runtime, String cname, String alias, JobParamsDTO body, Class clazz,
			String corelid, boolean isEvent, int feoffset) throws SchedulerException, SQLException {
		logger.info("generating cron job");

		boolean[] booleanArray = new boolean[4];
		booleanArray[JobConstants.RUNNOW] = false;
		booleanArray[JobConstants.ISCRON] = true;
		booleanArray[JobConstants.ISUPDATE] = false;
		booleanArray[JobConstants.RESTNODEBOOLEAN] = false;

		JobModelDTO.QuartzProperties.QuartzJobDetails quartzJobDetails = new JobModelDTO.QuartzProperties.QuartzJobDetails(
				UUID.randomUUID().toString(), body.getOrg());

		return scheduleJob(runtime, cname, alias, body, booleanArray, quartzJobDetails, null, clazz, false, corelid,
				isEvent, feoffset, ICIPUtils.getUser(claim));
	}

	/**
	 * Builds the job detail.
	 *
	 * @param jobSchedules the job schedules
	 * @param groupName    the group name
	 * @param clazz        the clazz
	 * @param jobDesc      the job desc
	 * @param isAgent      the is agent
	 * @param isChain      the is chain
	 * @param corelid      the corelid
	 * @param jobname      the jobname
	 * @param isParallel   the is parallel
	 * @param isEvent      the is event
	 * @param isRunNow     the is run now
	 * @param alias        the alias
	 * @return the job detail
	 */
	@Override
	public JobDetail buildQuartzJobDetail(List<JobModel> jobSchedules, String groupName, Class clazz, String jobDesc,
			boolean isAgent, boolean isChain, String corelid, String jobname, boolean isParallel, boolean isEvent,
			boolean isRunNow, String alias) {
		logger.info("generating jobDetail object");

		List<JobObjectDTO.Jobs> jobList = new LinkedList<>();

		for (int index = 0, limit = jobSchedules.size(); index < limit; index++) {
			JobModel jobSchedule = jobSchedules.get(index);
			JobObjectDTO.Jobs jobObject = new Jobs(jobSchedule.getCname(),
					RuntimeType.valueOf(jobSchedule.getJobProperties().getRuntime().toUpperCase()),
					jobSchedule.getParams(), jobSchedule.getRestProperties().isRestNode(),
					jobSchedule.getRestProperties().getRestNodeId());
			jobList.add(jobObject);
		}

		JobObjectDTO nativeJobObject = new JobObjectDTO(null, jobname,
				jobSchedules.get(jobSchedules.size() - 1).getOrg(), alias,
				jobSchedules.get(jobSchedules.size() - 1).getJobProperties().getSubmittedBy(), jobList,
				getJobType(isAgent, isChain), corelid,
				jobSchedules.get(jobSchedules.size() - 1).getJobProperties().getExpression(),
				!Boolean.parseBoolean(jobSchedules.get(jobSchedules.size() - 1).getJobProperties().getIsNative()),
				isParallel, isEvent, isRunNow,
				jobSchedules.get(jobSchedules.size() - 1).getJobProperties().getThresholdTime());

		JobDataMap jobDataMap = new JobDataMap();
		jobDataMap.put(JobConstants.JOB_DATAMAP_VALUE, new Gson().toJson(nativeJobObject));
		jobDataMap.put("jobTimeout", jobSchedules.get(jobSchedules.size() - 1).getJobProperties().getThresholdTime());

		return JobBuilder.newJob(clazz).withIdentity(UUID.randomUUID().toString(), groupName).withDescription(jobDesc)
				.usingJobData(jobDataMap).storeDurably().build();
	}

	/**
	 * Gets the job type.
	 *
	 * @param isAgent the is agent
	 * @param isChain the is chain
	 * @return the job type
	 */
	private JobType getJobType(boolean isAgent, boolean isChain) {
		if (isChain) {
			return JobType.CHAIN;
		}
		if (isAgent) {
			return JobType.AGENT;
		}
		return JobType.PIPELINE;
	}

	/**
	 * Builds the cron job trigger.
	 *
	 * @param jobDetail  the job detail
	 * @param startAt    the start at
	 * @param expression the expression
	 * @param trigger    the trigger
	 * @param jobDesc    the job desc
	 * @return the trigger
	 */
	@Override
	public Trigger buildCronJobTrigger(JobDetail jobDetail, ZonedDateTime startAt, String expression, Trigger trigger,
			String jobDesc) {
		logger.info("generating cron trigger");
		return buildTrigger(jobDetail, startAt, expression, trigger, true, jobDesc);
	}

	/**
	 * Builds the job trigger.
	 *
	 * @param jobDetail the job detail
	 * @param startAt   the start at
	 * @param trigger   the trigger
	 * @param jobDesc   the job desc
	 * @return the trigger
	 */
	@Override
	public Trigger buildSimpleJobTrigger(JobDetail jobDetail, ZonedDateTime startAt, Trigger trigger, String jobDesc) {
		logger.info("generating simple trigger");
		return buildTrigger(jobDetail, startAt, null, trigger, false, jobDesc);
	}

	/**
	 * Gets the job by name.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the job by name
	 * @throws SchedulerException the scheduler exception
	 */

	@Override
	public List<JobDataMap> getScheduledJobsData(String org) throws SchedulerException {
		Scheduler scheduler = schedulerFactoryBean.getScheduler();
		Set<JobKey> keys = scheduler.getJobKeys(GroupMatcher.jobGroupEquals(org));
		Iterator<JobKey> iterator = keys.iterator();
		List<JobDataMap> jobDataList = new ArrayList<>();
		while (iterator.hasNext()) {
			JobKey jobKey = iterator.next();
			Gson gson = new Gson();
			JobDataMap dataMap = scheduler.getJobDetail(jobKey).getJobDataMap();
			dataMap.put("jobName", jobKey.getName());
			String jobString = dataMap.getString(JobConstants.JOB_DATAMAP_VALUE);
			JobObjectDTO jobObject = gson.fromJson(jobString, JobObjectDTO.class);
			JobModelDTO.QuartzProperties.QuartzJobDetails quartzJobDetails = new JobModelDTO.QuartzProperties.QuartzJobDetails(
					jobKey.getName(), jobKey.getGroup());
			JobModelDTO.QuartzProperties quartzProperties = new JobModelDTO.QuartzProperties(quartzJobDetails, null,
					null, dataMap.getString(JobConstants.DATETIME), null);
			JobModelDTO job = generateJobModelDTO(jobObject.getName(), jobObject.getAlias(),
					jobObject.getJobs().get(jobObject.getJobs().size() - 1).getRuntime().toString(),
					jobObject.getExpression(), quartzProperties, dataMap.getInt("jobTimeout"), dataMap.getString("remoteDatasourceName"),
					dataMap.getString("scheduleType"));
			List<Trigger> triggers = (List<Trigger>) scheduler.getTriggersOfJob(jobKey);
			if (!triggers.isEmpty()) {
				Date scheduleTime = triggers.get(0).getStartTime();
				Date nextFireTime = triggers.get(0).getNextFireTime();
				Date lastFiredTime = triggers.get(0).getPreviousFireTime();
				quartzProperties.setLastexecution(format(lastFiredTime, 0));
				quartzProperties.setNextexecution(format(nextFireTime, 0));
				quartzProperties.setStartexecution(format(scheduleTime, 0));
				job.setQuartzProperties(quartzProperties);
			}
			if (job.getQuartzProperties().getNextexecution() != null) {
				dataMap.put("QuartzProperties", job.getQuartzProperties());
				jobDataList.add(dataMap);
			}

		}

		return jobDataList;
	}

	@Override
	public JobModelDTO getJobByQuartzJobId(String name, String org) throws SchedulerException {
		logger.info("getting jobdatamodel by name : {}", name);
		Scheduler scheduler = schedulerFactoryBean.getScheduler();
		Set<JobKey> keys = scheduler.getJobKeys(GroupMatcher.jobGroupEquals(org));
		Iterator<JobKey> iterator = keys.iterator();
		while (iterator.hasNext()) {
			JobKey jobKey = iterator.next();
			Gson gson = new Gson();
			JobDataMap dataMap = scheduler.getJobDetail(jobKey).getJobDataMap();
			String jobString = dataMap.getString(JobConstants.JOB_DATAMAP_VALUE);
			JobObjectDTO jobObject = gson.fromJson(jobString, JobObjectDTO.class);
			if (jobObject.getName().equals(name)) {
				JobModelDTO.QuartzProperties.QuartzJobDetails quartzJobDetails = new JobModelDTO.QuartzProperties.QuartzJobDetails(
						jobKey.getName(), jobKey.getGroup());
				JobModelDTO.QuartzProperties quartzProperties = new JobModelDTO.QuartzProperties(quartzJobDetails, null,
						null, dataMap.getString(JobConstants.DATETIME), null);
				JobModelDTO job = generateJobModelDTO(jobObject.getName(), jobObject.getAlias(),
						jobObject.getJobs().get(jobObject.getJobs().size() - 1).getRuntime().toString(),
						jobObject.getExpression(), quartzProperties, dataMap.getInt("jobTimeout"), 
						dataMap.getString("remoteDatasourceName"), dataMap.getString("scheduleType"));
				List<Trigger> triggers = (List<Trigger>) scheduler.getTriggersOfJob(jobKey);
				if (!triggers.isEmpty()) {
					Date scheduleTime = triggers.get(0).getStartTime();
					Date nextFireTime = triggers.get(0).getNextFireTime();
					Date lastFiredTime = triggers.get(0).getPreviousFireTime();
					quartzProperties.setLastexecution(format(lastFiredTime, 0));
					quartzProperties.setNextexecution(format(nextFireTime, 0));
					quartzProperties.setStartexecution(format(scheduleTime, 0));
					job.setQuartzProperties(quartzProperties);
				}
				if (job.getQuartzProperties().getNextexecution() != null) {
					return job;
				}
			}
		}
		return null;
	}

	@Override
	public JobModelDTO getJobByCorelId(String corelId, String org) throws SchedulerException {
		// logger.info("getting jobdatamodel by name : {}", name);

		Scheduler scheduler = schedulerFactoryBean.getScheduler();
		Set<JobKey> keys = scheduler.getJobKeys(GroupMatcher.jobGroupEquals(org));
		Iterator<JobKey> iterator = keys.iterator();
		while (iterator.hasNext()) {
			JobKey jobKey = iterator.next();
			Gson gson = new Gson();
			JobDataMap dataMap = scheduler.getJobDetail(jobKey).getJobDataMap();
			String refId = dataMap.getString("corelId");

			if (refId != null && refId.equals(corelId)) {

				String jobString = dataMap.getString(JobConstants.JOB_DATAMAP_VALUE);
				JobObjectDTO jobObject = gson.fromJson(jobString, JobObjectDTO.class);
				JobModelDTO.QuartzProperties.QuartzJobDetails quartzJobDetails = new JobModelDTO.QuartzProperties.QuartzJobDetails(
						jobKey.getName(), jobKey.getGroup());
				JobModelDTO.QuartzProperties quartzProperties = new JobModelDTO.QuartzProperties(quartzJobDetails, null,
						null, dataMap.getString(JobConstants.DATETIME), null);
				JobModelDTO job = generateJobModelDTO(jobObject.getName(), jobObject.getAlias(),
						jobObject.getJobs().get(jobObject.getJobs().size() - 1).getRuntime().toString(),
						jobObject.getExpression(), quartzProperties, dataMap.getInt("jobTimeout"),
						dataMap.getString("remoteDatasourceName"), dataMap.getString("scheduleType"));
				List<Trigger> triggers = (List<Trigger>) scheduler.getTriggersOfJob(jobKey);
				if (!triggers.isEmpty()) {
					Date scheduleTime = triggers.get(0).getStartTime();
					Date nextFireTime = triggers.get(0).getNextFireTime();
					Date lastFiredTime = triggers.get(0).getPreviousFireTime();
					quartzProperties.setLastexecution(format(lastFiredTime, 0));
					quartzProperties.setNextexecution(format(nextFireTime, 0));
					quartzProperties.setStartexecution(format(scheduleTime, 0));
					job.setQuartzProperties(quartzProperties);
				}
				if (job.getQuartzProperties().getNextexecution() != null) {
					return job;
				}
			}
		}

		return null;
	}

	/**
	 * Update one time job.
	 *
	 * @param quartzJobDetails the quartz job details
	 * @param date             the date
	 * @param timezone         the timezone
	 * @param cronExpression   the cron expression
	 * @param classMap         the class map
	 * @param corelid          the corelid
	 * @param feoffset         the feoffset
	 * @param jobTimeout
	 * @return true, if successful
	 * @throws SchedulerException the scheduler exception
	 * @throws SQLException       the SQL exception
	 */
	@Override
	public JSONObject updateJob(JobModelDTO.QuartzProperties.QuartzJobDetails quartzJobDetails, LocalDateTime date,
			String timezone, String cronExpression, Class classType, String corelid, int feoffset, int jobTimeout, String datasource)
			throws SchedulerException, SQLException {
		logger.info("updating one time job");

		boolean[] booleanArray = new boolean[4];

		String jobName = quartzJobDetails.getJobname();
		String jobGroup = quartzJobDetails.getJobgroup();

		Scheduler scheduler = schedulerFactoryBean.getScheduler();

		for (JobKey jobKey : scheduler.getJobKeys(GroupMatcher.jobGroupEquals(jobGroup))) {
			if (jobKey.getName().equals(jobName)) {
				JobDataMap dataMap = scheduler.getJobDetail(jobKey).getJobDataMap();
				Gson gson = new Gson();
				String jobString = dataMap.getString(JobConstants.JOB_DATAMAP_VALUE);
				JobObjectDTO jobObject = gson.fromJson(jobString, JobObjectDTO.class);
				String cname = jobObject.getName();
				String alias = jobObject.getAlias();
				String runtime = jobObject.getJobs().get(jobObject.getJobs().size() - 1).getRuntime().toString();
				String org = jobObject.getOrg();
				String params = jobObject.getJobs().get(jobObject.getJobs().size() - 1).getParams();
				boolean isRemote = jobObject.isRemote();
				String isNative = String.valueOf(!isRemote);
				String tmpDate = generateDateFromDateValue(date);
				String tmpTime = generateTimeFromDateValue(date);
				JobParamsDTO body = createJobParams(timezone, org, params, isNative, cronExpression, tmpDate, tmpTime,
						jobTimeout, datasource);

				booleanArray[JobConstants.RUNNOW] = false;
				booleanArray[JobConstants.ISCRON] = cronExpression != null && !cronExpression.trim().isEmpty();

				JSONObject result;
				if (booleanArray[JobConstants.ISCRON]) {
					result = createCronJob(runtime, cname, alias, body, classType, corelid, false, feoffset);
				} else {
					result = createSimpleJob(runtime, cname, alias, body, booleanArray[JobConstants.RUNNOW], classType,
							corelid, feoffset);
				}
				if (result != null) {
					deleteJob(jobName, jobGroup);
				}
				return result;
			}
		}

		JSONObject obj = new JSONObject();
		obj.put("status", "INVALID");
		return obj;
	}

	/**
	 * Find all jobs.
	 *
	 * @param org    the org
	 * @param offset the offset
	 * @param search the search
	 * @return the list
	 * @throws SchedulerException the scheduler exception
	 * @throws SQLException       the SQL exception
	 * @throws DecoderException   the decoder exception
	 */
////	@Override
//	public List<JobModelDTO> findAllJobs(String org, int offset) throws SchedulerException, SQLException {
//		logger.info("getting list of jobdatamodels");
//		return findAllScheduledJobs(org, offset, null);
//	}

	@Override
	public List<JobModelDTO> findAllJobs(String org, int offset, String search) throws SchedulerException, SQLException {
		logger.info("getting list of jobdatamodels");
		return findAllScheduledJobs(org, offset, search);
	}
	
	/**
	 * Find all scheduled jobs.
	 *
	 * @param org    the org
	 * @param offset the offset
	 * @param serach the serach
	 * @return the list
	 */
	
	private List<JobModelDTO> findAllScheduledJobs(String org, int offset, String search) {
	    List<JobModelDTO> jobs = new ArrayList<>();
	    int beoffset = timeutils.getOffset();
	    ZoneId zoneid = ZoneId.ofOffset("", ZoneOffset.ofTotalSeconds(beoffset * 60 * -1));

	    List<? extends QrtzTriggers> triggers = qrtzTriggersRepository.findByJobGroup(org);
	    triggers.stream()
	    		.sorted(Comparator.comparing(QrtzTriggers::getStartTime).reversed())
	            .filter(trigger -> trigger.getNextFireTime() > ZonedDateTime.now(zoneid).toEpochSecond())
	            .filter(trigger -> search == null || search.isEmpty() || containsSearchValue(trigger, search))
	            .forEach(trigger -> {
	                try {
	                    Trigger tgr = schedulerFactoryBean.getScheduler()
	                            .getTrigger(new TriggerKey(trigger.getTriggerName(), trigger.getTriggerGroup()));
	                    JobDataMap dataMap = schedulerFactoryBean.getScheduler()
	                            .getJobDetail(new JobKey(trigger.getJobName(), trigger.getJobGroup())).getJobDataMap();
	                    JobModelDTO dataModel = generateJobModelDTO(trigger.getJobName(), trigger.getJobGroup(),
	                            dataMap, tgr, trigger.getTriggerState(), offset);
	                    jobs.add(dataModel);
	                } catch (SchedulerException e) {
	                    logger.error("Exception in getting scheduled job: {}", e.getMessage(), e);
	                }
	            });
	    return jobs; 
	}

	private boolean containsSearchValue(QrtzTriggers trigger, String search) {
	    JobDataMap dataMap;
		try {
			dataMap = schedulerFactoryBean.getScheduler()
			        .getJobDetail(new JobKey(trigger.getJobName(), trigger.getJobGroup())).getJobDataMap();
			
		    if(dataMap.get("JOB") != null) {
		    	JsonObject jsonObj = JsonParser.parseString(dataMap.getString("JOB")).getAsJsonObject();
		    	if(jsonObj.has("alias")) {
		    		if(jsonObj.get("alias").toString().toLowerCase().contains(search))
		    			return true;
		    	}
		        
		    }
		} catch (SchedulerException e) {
            logger.error("Exception in getting scheduled job: {}", e.getMessage(), e);			
		}
	    return false;
	}

	/**
	 * Generate job data model object.
	 *
	 * @param name     the name
	 * @param group    the group
	 * @param dataMap  the data map
	 * @param trigger  the trigger
	 * @param status   the status
	 * @param feoffset the feoffset
	 * @return the job data model
	 */
	private JobModelDTO generateJobModelDTO(String name, String group, JobDataMap dataMap, Trigger trigger,
			String status, int feoffset) {
		int dboffset = timeutils.getOffset();
		int serveroffset = 0 - (ZonedDateTime.now().getOffset().getTotalSeconds() / 60);
		int offset = trigger.getStartTime().getTimezoneOffset() - feoffset;
		logger.debug("Trigger Offset : {}", trigger.getStartTime().getTimezoneOffset());
		logger.debug("DB Offset : {}", dboffset);
		logger.debug("FE Offset : {}", feoffset);
		logger.debug("Net Offset : {}", offset);
		logger.debug("Server Offset : {}", serveroffset);
		QuartzJobDetails quartzJobDetails = new QuartzJobDetails(name, group);
		QuartzProperties quartzProperties = new QuartzProperties(quartzJobDetails,
				format(trigger.getPreviousFireTime(), offset), format(trigger.getNextFireTime(), offset),
				format(trigger.getStartTime(), offset), status);
		Gson gson = new Gson();
		Integer jobTimeout = 0;
		if (dataMap.containsKey("jobTimeout") && dataMap.get("jobTimeout") != null)
			jobTimeout = (Integer) dataMap.get("jobTimeout");
		String jobString = dataMap.getString(JobConstants.JOB_DATAMAP_VALUE);
		JobObjectDTO job = gson.fromJson(jobString, JobObjectDTO.class);
		String remoteDatasourceName = "";
		if (dataMap.containsKey("datasourceName") && dataMap.get("datasourceName") != null)
			remoteDatasourceName =(String) dataMap.get("datasourceName");
//		default scheduleType is pipeline
		String scheduleType = "pipeline";
		if (dataMap.containsKey("JOB") && dataMap.get("JOB") != null) {
			JSONObject obj = new JSONObject(dataMap.get("JOB").toString());
			scheduleType = obj.getString("jobType").toLowerCase();
		}
		return generateJobModelDTO(job.getName(), job.getAlias(),
				job.getJobs().get(job.getJobs().size() - 1).getRuntime().toString(), job.getExpression(),
				quartzProperties, jobTimeout, remoteDatasourceName, scheduleType);
	}

	/**
	 * Delete the identified Job from the Scheduler - and any associated Triggers.
	 *
	 * @param jobName  the job name
	 * @param jobGroup the job group
	 * @return true, if successful
	 */
	@Override
	public boolean deleteJob(String jobName, String jobGroup) {
		logger.info("deleting job");
		JobKey jkey = new JobKey(jobName, jobGroup);
		try {
			return schedulerFactoryBean.getScheduler().deleteJob(jkey);
		} catch (SchedulerException e) {
			logger.error("SchedulerException while deleting job with key : {} message : {}", jobName, e.getMessage());
			return false;
		}
	}

	/**
	 * Pause job.
	 *
	 * @param jobName  the job name
	 * @param jobGroup the job group
	 * @param flag     the flag
	 * @return true, if successful
	 * @throws SchedulerException the scheduler exception
	 */
	@Override
	public boolean pauseJob(String jobName, String jobGroup, boolean flag) throws SchedulerException {
		JobKey jobKey = new JobKey(jobName, jobGroup);
		Scheduler scheduler = schedulerFactoryBean.getScheduler();
		if (flag) {
			scheduler.pauseJob(jobKey);
		} else {
			/* Resume Job */
			Trigger triggerOld = scheduler.getTrigger(new TriggerKey(jobName, jobGroup));
			if (triggerOld != null) {
				/* triggerOld will be null for non repeat jobs */
				try {
					CronTrigger cronTrigger = (CronTrigger) triggerOld;
					String cronExpr = cronTrigger.getCronExpression();
					/* generating next trigger time based on cron expression */
					Date nextTriggerTime = cronTrigger.getNextFireTime();
					Date currentTime = new Date();
					if (nextTriggerTime.before(currentTime)) {
						logger.info("Next fire time is in the past :{}", nextTriggerTime);
						/*
						 * Logic to update the next fire time to a future valid time based on the Cron
						 * Expression and updating job status to WAITING to resume job
						 */
						CronExpression cron;
						try {
							cron = new CronExpression(cronExpr);
							Date newNextFireTime = cron.getNextValidTimeAfter(currentTime);
							logger.info("Updated next fire time to: {}", newNextFireTime);
							List<QrtzTriggers> listQrtzTriggers = qrtzTriggersRepository.findByJobGroup(jobGroup);
							Optional<QrtzTriggers> result = listQrtzTriggers.stream()
									.filter(obj -> jobName.equals(obj.getTriggerName())).findFirst();
							result.ifPresent(obj -> {
								QrtzTriggers qrtzTriggers = obj;
								qrtzTriggers.setNextFireTime(newNextFireTime.getTime());
								qrtzTriggers.setTriggerState("WAITING");
								qrtzTriggersRepository.save(qrtzTriggers);
							});

						} catch (Exception e) {
							logger.error("Error beacuse of :{}", e.getMessage());
							return false;
						}
					} else {
						/*
						 * Proceeding to resume job since next fire time is upcoming
						 */
						scheduler.resumeJob(jobKey);
						logger.info("Next fire time is upcoming:{} ", nextTriggerTime);
					}
				} catch (Exception e) {
					/* if any exception occurred this will resume job in old way */
					scheduler.resumeJob(jobKey);
					return true;
				}
			} else {
				scheduler.resumeJob(jobKey);
			}
		}
		return true;
	}

	public boolean pauseAllJob(String jobGroup, boolean flag) throws SchedulerException {
		// TODO Auto-generated method stub
		JobKey jobKey = new JobKey(jobGroup);
		Scheduler scheduler = schedulerFactoryBean.getScheduler();

		if (flag) {
			scheduler.pauseTriggers(GroupMatcher.triggerGroupEquals(jobGroup));
		} else {
			scheduler.resumeTriggers(GroupMatcher.triggerGroupEquals(jobGroup));
		}
		return true;
	}

	/**
	 * Stop a job.
	 *
	 * @param jobKey   the job key
	 * @param groupKey the group key
	 * @return true, if successful
	 */
	@Override
	public boolean stopJob(String jobKey, String groupKey) {
		try {
			Scheduler scheduler = schedulerFactoryBean.getScheduler();
			JobKey jkey = new JobKey(jobKey, groupKey);
			return scheduler.interrupt(jkey);
		} catch (SchedulerException e) {
			logger.error(e.getMessage());
		}
		return false;
	}

	/**
	 * Retry job.
	 *
	 * @param name     the name
	 * @param org      the org
	 * @param type     the type
	 * @param runtime  the is local
	 * @param feoffset the feoffset
	 * @param datasourceName 
	 * @throws Exception the exception
	 */
	@Override
	public void retryJob(String name, String org, String type, String runtime, int feoffset, String datasourceName) throws Exception {
		switch (type.toLowerCase()) {
		case "pipeline":
			ICIPStreamingServices pipeline = streamingServicesService.getICIPStreamingServices(name, org);
			if (runtime.equals("true") || runtime.equals("false"))
				runtime = "local";
			pipelineService.createJob(pipeline.getType(), name, pipeline.getAlias(), org, runtime, "{}",
					ICIPUtils.generateCorrelationId(), feoffset,datasourceName,"");
			break;
		case "chain":
			Gson gson = new Gson();
			ICIPChains chain = iICIPChainsService.findByNameAndOrganization(name, org);
			ChainObject.InitialJsonContent2 chainObject = gson.fromJson(chain.getJsonContent(),
					ChainObject.InitialJsonContent2.class);
			String body = gson.toJson(chainObject.getElement());
			iICIPChainJobsService.runChain(name, org, body, true, feoffset,datasourceName);
			break;
		case "agent":
			pipelineService.createAgentJob(RuntimeType.AGENTS.toString(), name, org, "{}",
					ICIPUtils.generateCorrelationId(), feoffset);
			break;
		default:
			break;
		}
	}

	/**
	 * Creates the local date time.
	 *
	 * @param date the date
	 * @param time the time
	 * @return the local date time
	 */
	public LocalDateTime createLocalDateTime(String date, String time) {
		String[] tmpDates = date.split("-");
		int yyyy = Integer.parseInt(tmpDates[0]);
		int mm = Integer.parseInt(tmpDates[1]);
		int dd = Integer.parseInt(tmpDates[2]);
		String[] tmpTime = time.split(":");
		int hr = Integer.parseInt(tmpTime[0]);
		int min = Integer.parseInt(tmpTime[1]);
		return LocalDateTime.of(yyyy, mm, dd, hr, min);
	}

	/**
	 * Format.
	 *
	 * @param date   the date
	 * @param offset the offset
	 * @return the string
	 */
	private String format(Date date, int offset) {
		logger.debug("Date Format");
		if (date != null) {
			logger.debug("Date : {}", date);
			date = DateUtils.addMinutes(date, offset);
			logger.debug("Date with offset: {}", date);
			SimpleDateFormat formatter = new SimpleDateFormat("EEE, d MMM yyyy HH:mm:ss");
			String dateformat = formatter.format(date);
			logger.debug("Formatted Date : {}", dateformat);
			return dateformat;
		}
		return null;
	}

	/**
	 * Initialize quartz scheduler.
	 *
	 * @param org the org
	 */
	@Override
	public void initializeQuartzScheduler(String org) {
		try {
			schedulerFactoryBean.getScheduler().standby();
			if (!enabled) {
				logger.info("Quartz Scheduler is on standby mode");
			}
		} catch (SchedulerException e) {
			logger.error("Unable to configure quartz scheduler : {} - {}", e.getMessage(), e);
		} finally {
			if (enabled) {
				logger.debug("starting scheduler ...");
				try {
					schedulerFactoryBean.getScheduler().start();
				} catch (SchedulerException e) {
					logger.error(e.getMessage(), e);
				}
			}
		}
	}

	/**
	 * Creates the job desc.
	 *
	 * @param name the name
	 * @param org  the org
	 * @param user the user
	 * @return the string
	 */
	private String buildNewJobDescription(String name, String org, String user) {
		return "Job : " + name + " [Organization : " + org + "] - Submitted By : " + user;
	}

}
