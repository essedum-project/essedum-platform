package com.lfn.icip.icipwebeditor.job.jobs;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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
import com.lfn.ai.comm.lib.util.logger.JobLogger;
import com.lfn.icip.dataset.service.impl.ICIPDatasetFilesService;
//import com.lfn.icip.exp.constants.ExperimentConstants;
import com.lfn.icip.icipwebeditor.job.enums.JobMetadata;
import com.lfn.icip.icipwebeditor.job.enums.JobStatus;
import com.lfn.icip.icipwebeditor.job.model.ICIPInternalJobs;
import com.lfn.icip.icipwebeditor.job.service.util.ICIPInitializeAnnotationServiceUtil;
import com.lfn.icip.icipwebeditor.job.util.InternalJob;
import com.lfn.icip.icipwebeditor.jobmodel.service.ICIPInternalJobsService;

import ch.qos.logback.classic.LoggerContext;

// TODO: Auto-generated Javadoc
/**
 * The Class FileRemovalJob.
 */
public class FileRemovalJob implements InternalJob {

	/** The logger. */
	private final Logger logger = LoggerFactory.getLogger(JobLogger.class);

	/** The Constant INTERNALJOBNAME. */
	private static final String INTERNALJOBNAME = "FileRemoval";

	/** The logging path. */
	@Value("${LOG_PATH}")
	private String loggingPath;

	/** The annotation util. */
	@Autowired
	private ICIPInitializeAnnotationServiceUtil annotationUtil;

	/** The internaljobs service. */
	@Autowired
	private ICIPInternalJobsService internaljobsService;

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
			deleteFiles(marker); // actual job
			internaljobsService.updateInternalJob(internalJob, JobStatus.COMPLETED.toString());
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
	 * Delete files.
	 *
	 * @param marker the marker
	 */
	private void deleteFiles(Marker marker) {
		logger.info(marker, "Deleting files...");
		int days = Integer.parseInt(annotationUtil.getDaysString());

		// jobLogFileDir
		try {
			ICIPUtils.deleteAllOlderFilesInDirectory(marker, annotationUtil.getFolderPath(), days, true);
		} catch (IOException ex) {
			logger.error(marker, ex.getMessage(), ex);
		}

		// fileuploadDir
		try {
			ICIPUtils.deleteAllOlderFilesInDirectory(marker, annotationUtil.getFileuploadDir(), days, false);
		} catch (IOException ex) {
			logger.error(marker, ex.getMessage(), ex);
		}

		// fileuploadDir/datasetfiles
		try {
			Path path = Paths.get(annotationUtil.getFileuploadDir(), ICIPDatasetFilesService.DATASETFILESPATH);
			ICIPUtils.deleteAllOlderFilesInDirectory(marker, path, days, true);
		} catch (IOException ex) {
			logger.error(marker, ex.getMessage(), ex);
		}

//		// fileuploadDir/orgbannerfiles
//		try {
//			Path path = Paths.get(annotationUtil.getFileuploadDir(), ExperimentConstants.ORGBANNERSDIRECTORY);
//			ICIPUtils.deleteAllOlderFilesInDirectory(marker, path, days, true);
//		} catch (IOException ex) {
//			logger.error(marker, ex.getMessage(), ex);
//		}
//
//		// fileuploadDir/projectimagefiles
//		try {
//			Path path = Paths.get(annotationUtil.getFileuploadDir(), ExperimentConstants.PROJECTIMAGESDIRECTORY);
//			ICIPUtils.deleteAllOlderFilesInDirectory(marker, path, days, true);
//		} catch (IOException ex) {
//			logger.error(marker, ex.getMessage(), ex);
//		}
//
//		// fileuploadDir/solutionfiles
//		try {
//			Path path = Paths.get(annotationUtil.getFileuploadDir(), ExperimentConstants.SOLUTIONFILESDIRECTORY);
//			ICIPUtils.deleteAllOlderFilesInDirectory(marker, path, days, true);
//		} catch (IOException ex) {
//			logger.error(marker, ex.getMessage(), ex);
//		}

		// temp
		try {
			Path path = Files.createTempDirectory("abc").getParent();
			ICIPUtils.deleteAllOlderFilesInDirectory(marker, path, days, true);
		} catch (IOException ex) {
			logger.error(marker, ex.getMessage(), ex);
		}

		// logs
		try {
			ICIPUtils.deleteAllOlderFilesInDirectory(marker, loggingPath, days, false);
		} catch (IOException ex) {
			logger.error(marker, ex.getMessage(), ex);
		}

		logger.info(marker, "Completed");
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
		return "/fileremoval";
	}

	/**
	 * Gets the description.
	 *
	 * @return the description
	 */
	@Override
	public String getDescription() {
		return "Job to remove all unwanted or older files";
	}

}
