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
package com.infosys.icets.icip.icipwebeditor.job.jobs;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.Date;
import java.util.UUID;

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

import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.logger.JobLogger;
import com.infosys.icets.icip.dataset.service.impl.ICIPAdpService;
import com.infosys.icets.icip.icipwebeditor.job.enums.JobMetadata;
import com.infosys.icets.icip.icipwebeditor.job.enums.JobStatus;
import com.infosys.icets.icip.icipwebeditor.job.model.ICIPInternalJobs;
import com.infosys.icets.icip.icipwebeditor.jobmodel.service.ICIPInternalJobsService;
import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPIaiService;

import ch.qos.logback.classic.LoggerContext;
import lombok.Setter;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPDeleteProject.
 *
 * @author icets
 */

/**
 * Sets the logging path.
 *
 * @param loggingPath the new logging path
 */
@Setter
public class ICIPDeleteProject implements Job {

	/** The logger. */
	private final Logger logger = LoggerFactory.getLogger(JobLogger.class);

	/** The Constant INTERNALJOBNAME. */
	private static final String INTERNALJOBNAME = "DeleteProject";

	/** The i CIP adp service. */
	@Autowired
	private ICIPAdpService iCIPAdpService;

	/** The i CIP iai service. */
	@Autowired
	private ICIPIaiService iCIPIaiService;

//	/** The project service. */
//	@Autowired
//	private ProjectService projectService;

	/** The jobs service. */
	@Autowired
	private ICIPInternalJobsService jobsService;

	/** The logging path. */
	@Value("${LOG_PATH}")
	private String loggingPath;

	/**
	 * Delete project.
	 *
	 * @param marker  the marker
	 * @param project the project
	 * @return the boolean
	 */
	public Boolean deleteProject(Marker marker, String project) {
		logger.info(marker, "Deleting project {}", project);
		iCIPIaiService.deleteProject(marker, project);
		iCIPAdpService.deleteProject(marker, project);
//		Project Projectdelete = projectService.findByName(project);
//		if (Projectdelete == null) {
//			throw new EntityNotFoundException(Projectdelete + " Project not found");
//		}
		logger.info(marker, "Deleted project {}", project);
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
		Marker marker = null;
		ICIPInternalJobs internalJob = null;
		try {
			String uid = ICIPUtils.removeSpecialCharacter(UUID.randomUUID().toString());
			marker = MarkerFactory.getMarker(uid);
			JobDataMap dataMap = context.getJobDetail().getJobDataMap();
			String ProjectDelete = dataMap.getString("project");
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
			deleteProject(marker, ProjectDelete);
			jobsService.updateInternalJob(internalJob, JobStatus.COMPLETED.toString());
		} catch (Exception ex) {
			logger.error(marker, ex.getMessage());
			try {
				jobsService.updateInternalJob(internalJob, JobStatus.ERROR.toString());
			} catch (IOException e) {
				logger.error(marker, e.getMessage());
			}
		}
	}

}
