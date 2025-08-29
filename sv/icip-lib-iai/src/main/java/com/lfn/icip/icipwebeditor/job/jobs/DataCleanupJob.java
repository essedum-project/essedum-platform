package com.lfn.icip.icipwebeditor.job.jobs;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.Date;
import java.util.UUID;

import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.slf4j.MarkerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.ai.comm.lib.util.logger.JobLogger;
import com.lfn.icip.icipwebeditor.job.enums.JobMetadata;
import com.lfn.icip.icipwebeditor.job.enums.JobStatus;
import com.lfn.icip.icipwebeditor.job.model.ICIPInternalJobs;
import com.lfn.icip.icipwebeditor.job.util.InternalJob;
import com.lfn.icip.icipwebeditor.jobmodel.service.ICIPAgentJobsService;
import com.lfn.icip.icipwebeditor.jobmodel.service.ICIPChainJobsService;
import com.lfn.icip.icipwebeditor.jobmodel.service.ICIPInternalJobsService;
import com.lfn.icip.icipwebeditor.jobmodel.service.ICIPJobsService;

import ch.qos.logback.classic.LoggerContext;

// TODO: Auto-generated Javadoc
/**
 * The Class DataCleanupJob.
 */
public class DataCleanupJob implements InternalJob {

	/** The logger. */
	private final Logger logger = LoggerFactory.getLogger(JobLogger.class);

	/** The Constant INTERNALJOBNAME. */
	private static final String INTERNALJOBNAME = "DataCleanup";

	/** The logging path. */
	@Value("${LOG_PATH}")
	private String loggingPath;

	/** The internaljobs service. */
	@Autowired
	private ICIPInternalJobsService internaljobsService;

	/** The jobs service. */
	@Autowired
	private ICIPJobsService jobsService;

	/** The chain jobs service. */
	@Autowired
	private ICIPChainJobsService chainJobsService;

	/** The agent jobs service. */
	@Autowired
	private ICIPAgentJobsService agentJobsService;

	/**
	 * Execute.
	 *
	 * @param context the context
	 * @throws JobExecutionException the job execution exception
	 */
	@Override
	public void execute(JobExecutionContext context) throws JobExecutionException {
		Marker marker = null;
		ICIPInternalJobs internalJob = null;
		try {
			String uid = ICIPUtils.removeSpecialCharacter(UUID.randomUUID().toString());
			marker = MarkerFactory.getMarker(uid);
			JobDataMap dataMap = context.getJobDetail().getJobDataMap();
			String submittedBy = dataMap.getString("submittedBy");
			String org = dataMap.getString("org");
			String corelid = dataMap.getOrDefault("corelid", ICIPUtils.generateCorrelationId()).toString();
			boolean runnow = dataMap.getBoolean("runnow");
			boolean isEvent = dataMap.getBoolean("event");
			Timestamp submittedOn = new Timestamp(new Date().getTime());
			internalJob = internaljobsService.createInternalJobs(INTERNALJOBNAME, uid, submittedBy, submittedOn, org);

			ICIPInternalJobs.MetaData metadata = new ICIPInternalJobs.MetaData();
			metadata.setTag(isEvent ? JobMetadata.EVENT.toString()
					: runnow ? JobMetadata.USER.toString() : JobMetadata.SCHEDULED.toString());
			internalJob = internalJob.updateMetadata(metadata);
			internalJob.setCorrelationid(corelid);
			internalJob = internaljobsService.save(internalJob);

			LoggerContext loggerContext = (LoggerContext) LoggerFactory.getILoggerFactory();
			loggerContext.putProperty("marker", String.valueOf(internalJob.getId()));
			boolean allDone = deleteOlderData(marker); // actual job
			internaljobsService.updateInternalJob(internalJob,
					allDone ? JobStatus.COMPLETED.toString() : JobStatus.ERROR.toString());
		} catch (Exception ex) {
			logger.error(marker, ex.getMessage(), ex);
			try {
				internaljobsService.updateInternalJob(internalJob, JobStatus.ERROR.toString());
			} catch (IOException e) {
				logger.error(marker, e.getMessage(), e);
			}
		}
	}

	/**
	 * Delete older data.
	 *
	 * @param marker the marker
	 * @return true, if successful
	 */
	private boolean deleteOlderData(Marker marker) {
		boolean allDone = true;
		try {
			logger.info(marker, "deleting chainjobs data...");
			chainJobsService.deleteOlderData();
		} catch (EssedumException ex) {
			allDone = false;
			logger.error(marker, ex.getMessage(), ex);
		}
		try {
			logger.info(marker, "deleting jobs data...");
			jobsService.deleteOlderData();
		} catch (EssedumException ex) {
			allDone = false;
			logger.error(marker, ex.getMessage(), ex);
		}
		try {
			logger.info(marker, "deleting agentjobs data...");
			agentJobsService.deleteOlderData();
		} catch (EssedumException ex) {
			allDone = false;
			logger.error(marker, ex.getMessage(), ex);
		}
		try {
			logger.info(marker, "deleting internaljobs data...");
			internaljobsService.deleteOlderData();
		} catch (EssedumException ex) {
			allDone = false;
			logger.error(marker, ex.getMessage(), ex);
		}
		return allDone;
	}

	/**
	 * Gets the name.
	 *
	 * @return the name
	 */
	@Override
	public String getName() {
		return INTERNALJOBNAME;
	}

	/**
	 * Gets the url.
	 *
	 * @return the url
	 */
	@Override
	public String getUrl() {
		return "/datacleanup";
	}

	/**
	 * Gets the description.
	 *
	 * @return the description
	 */
	@Override
	public String getDescription() {
		return "Job to clean all unwanted or older data";
	}

}
