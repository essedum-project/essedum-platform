package com.lfn.icip.icipwebeditor.job;


import java.io.IOException;

import java.sql.Timestamp;
import java.util.Date;
import java.util.UUID;

import jakarta.persistence.EntityNotFoundException;

import org.quartz.Job;
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
import com.lfn.ai.comm.lib.util.logger.JobLogger;
//import com.lfn.iamp.bcc.service.CopyBlueprintService;
import com.lfn.icip.dataset.service.impl.ICIPAdpService;
import com.lfn.icip.icipwebeditor.job.enums.JobMetadata;
import com.lfn.icip.icipwebeditor.job.enums.JobStatus;
import com.lfn.icip.icipwebeditor.job.model.ICIPInternalJobs;
import com.lfn.icip.icipwebeditor.jobmodel.service.ICIPInternalJobsService;
import com.lfn.icip.icipwebeditor.service.impl.ICIPIaiService;

import ch.qos.logback.classic.LoggerContext;
import lombok.Setter;

// 
/**
 * The Class ICIPCopyBluePrintJob.
 *
 * @author essedum
 */
@Setter
public class ICIPCopyTemplate implements Job {

	/** The logger. */
	private final Logger logger = LoggerFactory.getLogger(JobLogger.class);

	private static final String INTERNALJOBNAME = "CopyTemplate";

	/** The i CIP adp service. */
	@Autowired
	private ICIPAdpService iCIPAdpService;

	/** The i CIP iai service. */
	@Autowired
	private ICIPIaiService iCIPIaiService;

	/** The jobs service. */
	@Autowired
	private ICIPInternalJobsService jobsService;


	/** The logging path. */
	@Value("${LOG_PATH}")
	private String loggingPath;

	/**
	 * Copy blueprints.
	 *
	 * @param marker          the marker
	 * @param fromProjectName the from project name
	 * @param toProjectName   the to project name
	 * @return the boolean
	 */
	public Boolean copyTemplate(Marker marker, String fromProjectName, String toProjectName, int datasetProjectId) {
		logger.info("Executing copy template for {} to {} marker {}", fromProjectName, toProjectName,marker);
		try {
		iCIPAdpService.copytemplate(marker, fromProjectName, toProjectName, datasetProjectId);
		}
		catch(Exception E) {
			logger.error(E.getMessage());
		}
		try {
			iCIPIaiService.copytemplate(marker, fromProjectName, toProjectName);
			}
			catch(Exception E) {
				logger.error(E.getMessage());
			}

		return true;
	}

	/**
	 * Execute.
	 *
	 * @param context the context
	 * @throws JobExecutionException the job execution exception
	 */
	@Override
	public void execute(JobExecutionContext context) throws JobExecutionException {
		logger.info("Entered execute in ICIPCopyTemplate",context);
		Marker marker = null;
		ICIPInternalJobs internalJob = null;
		try {
			String uid = ICIPUtils.removeSpecialCharacter(UUID.randomUUID().toString());
			marker = MarkerFactory.getMarker(uid);
			JobDataMap dataMap = context.getJobDetail().getJobDataMap();
			String fromProjectName = dataMap.getString("fromProject");
			String toProjectName = dataMap.getString("toProject");
			int datasetProjectId = Integer.parseInt(dataMap.getString("projectId"));
			String submittedBy = dataMap.getString("submittedBy");
			String org = dataMap.getString("org");
			Timestamp submittedOn = new Timestamp(new Date().getTime());
			internalJob = jobsService.createInternalJobs(INTERNALJOBNAME, uid, submittedBy, submittedOn, org);

			ICIPInternalJobs.MetaData metadata = new ICIPInternalJobs.MetaData();
			metadata.setTag(JobMetadata.USER.toString());
			internalJob = internalJob.updateMetadata(metadata);
			internalJob = jobsService.save(internalJob);

			LoggerContext loggerContext = (LoggerContext) LoggerFactory.getILoggerFactory();
			loggerContext.putProperty("marker", String.valueOf(internalJob.getId()));
			copyTemplate(marker, fromProjectName, toProjectName, datasetProjectId);
			jobsService.updateInternalJob(internalJob, JobStatus.COMPLETED.toString());
		} catch (IOException ex) {
			logger.error(marker, ex.getMessage(), ex);
			try {
				jobsService.updateInternalJob(internalJob, JobStatus.ERROR.toString());
			} catch (IOException e) {
				logger.error(marker, e.getMessage(), e);
			}
		}
	}

}