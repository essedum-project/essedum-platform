package com.infosys.icets.icip.icipwebeditor.job;

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
import org.springframework.stereotype.Component;

import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.logger.JobLogger;
import com.infosys.icets.icip.icipwebeditor.job.enums.JobMetadata;
import com.infosys.icets.icip.icipwebeditor.job.enums.JobStatus;
import com.infosys.icets.icip.icipwebeditor.job.model.ICIPInternalJobs;
import com.infosys.icets.icip.icipwebeditor.job.service.impl.QuartzService;
import com.infosys.icets.icip.icipwebeditor.job.util.InternalJob;
import com.infosys.icets.icip.icipwebeditor.jobmodel.service.ICIPInternalJobsService;

import ch.qos.logback.classic.LoggerContext;

// TODO: Auto-generated Javadoc
/**
 * The Class RescheduleExistingSchedulesJob.
 */
@Component("reschedulewithdstinternaljob")
public class RescheduleExistingSchedulesJobWithThreshold implements InternalJob {

	/** The logger. */
	private final Logger logger = LoggerFactory.getLogger(JobLogger.class);

	/** The Constant INTERNALJOBNAME. */
	private static final String INTERNALJOBNAME = "RescheduleWithDST";

	/** The internal job service. */
	@Autowired
	private ICIPInternalJobsService internalJobService;

	/** The quartz service. */
	@Autowired
	private QuartzService quartzService;

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
			Timestamp submittedOn = new Timestamp(new Date().getTime());
			JobDataMap dataMap = context.getJobDetail().getJobDataMap();
			String org = dataMap.getString("org");
			String submittedBy = dataMap.getString("submittedBy");
			boolean runnow = dataMap.getBoolean("runnow");
			boolean isEvent = dataMap.getBoolean("event");
			String corelid = dataMap.getOrDefault("corelid", ICIPUtils.generateCorrelationId()).toString();

			internalJob = internalJobService.createInternalJobs(INTERNALJOBNAME, uid, submittedBy, submittedOn, org);

			ICIPInternalJobs.MetaData metadata = new ICIPInternalJobs.MetaData();
			metadata.setTag(isEvent ? JobMetadata.EVENT.toString()
					: runnow ? JobMetadata.USER.toString() : JobMetadata.SCHEDULED.toString());
			internalJob = internalJob.updateMetadata(metadata);
			internalJob.setCorrelationid(corelid);
			internalJob = internalJobService.save(internalJob);

			LoggerContext loggerContext = (LoggerContext) LoggerFactory.getILoggerFactory();
			loggerContext.putProperty("marker", String.valueOf(internalJob.getId()));
			logger.info(marker, "Starting...");
			quartzService.rescheduleExistingSchedulesWithThreshold(marker,org);
			logger.info(marker, "Completed");
			internalJobService.updateInternalJob(internalJob, JobStatus.COMPLETED.toString());
		} catch (Exception ex) {
			logger.error(marker, ex.getMessage());
			try {
				internalJobService.updateInternalJob(internalJob, JobStatus.ERROR.toString());
			} catch (IOException e) {
				logger.error(marker, e.getMessage());
			}
		}
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
		return "/triggerInternalJobs";
	}

	/**
	 * Gets the description.
	 *
	 * @return the description
	 */
	@Override
	public String getDescription() {
		return "Job to reschedule existing schedules with threshold";
	}

}
