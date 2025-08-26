package com.lfn.icip.icipmodelserver.jobs;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Date;
import java.util.List;
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
import com.lfn.icip.icipmodelserver.constants.PipelineExposeConstants;
import com.lfn.icip.icipmodelserver.model.ICIPModelServers;
import com.lfn.icip.icipmodelserver.model.ICIPPipelineModel;
import com.lfn.icip.icipmodelserver.service.impl.ICIPModelServersService;
import com.lfn.icip.icipmodelserver.service.impl.ICIPPipelineModelService;
import com.lfn.icip.icipwebeditor.job.enums.JobMetadata;
import com.lfn.icip.icipwebeditor.job.enums.JobStatus;
import com.lfn.icip.icipwebeditor.job.model.ICIPInternalJobs;
import com.lfn.icip.icipwebeditor.job.service.util.ICIPInitializeAnnotationServiceUtil;
import com.lfn.icip.icipwebeditor.job.util.InternalJob;
import com.lfn.icip.icipwebeditor.jobmodel.service.ICIPInternalJobsService;

import ch.qos.logback.classic.LoggerContext;
import lombok.extern.log4j.Log4j2;

// TODO: Auto-generated Javadoc
/** The Constant log. */
@Log4j2
public class ModelInternalJob implements InternalJob {

	/** The logger. */
	private final Logger logger = LoggerFactory.getLogger(JobLogger.class);

	/** The Constant INTERNALJOBNAME. */
	private static final String INTERNALJOBNAME = "ModelInternalJobs";

	/** The model servers service. */
	@Autowired
	private ICIPModelServersService modelServersService;
	private static final String ICIPPipelineModel = null;

	/** The pipeline model service. */
	@Autowired
	private ICIPPipelineModelService pipelineModelService;

	/** The internal job service. */
	@Autowired
	private ICIPInternalJobsService internalJobService;

	/** The annotation service util. */
	@Autowired
	private ICIPInitializeAnnotationServiceUtil annotationServiceUtil;

	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;

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
			bootstrapModel(marker, org);
			uploadCheck(marker, org);
			updateServerStatus(marker);
			logger.info(marker, "Completed");
			internalJobService.updateInternalJob(internalJob, JobStatus.COMPLETED.toString());
		} catch (Exception ex) {
			logger.error(marker, ex.getMessage());
			log.error(ex.getMessage(), ex);
			try {
				internalJobService.updateInternalJob(internalJob, JobStatus.ERROR.toString());
			} catch (IOException e) {
				logger.error(marker, e.getMessage());
			}
		}
	}

	/**
	 * Bootstrap model.
	 *
	 * @param marker the marker
	 * @param org the org
	 */
	private void bootstrapModel(Marker marker, String org) {
		logger.info(marker, "Bootstrap Inactive Model Running ...");
		try {
			List<ICIPPipelineModel> pipelineModelsList = this.pipelineModelService.findByStatusAndOrg(0, org);
			if (pipelineModelsList != null && !pipelineModelsList.isEmpty()) {
				pipelineModelsList.parallelStream().filter(r -> r != null && r.getLocalupload() != null
						&& r.getServerupload() != null && r.getLocalupload() == 100 && r.getServerupload() == 100)
						.forEach(pipelineModel -> {
							logger.info(marker, "Bootstraping Model - {}", pipelineModel.getModelname());
							try {
								Path path = Paths.get(annotationServiceUtil.getFolderPath(),
										PipelineExposeConstants.BOOTSTRAPCALL, pipelineModel.getFileid());
								if (Files.exists(path)) {
									updateTime(pipelineModel, path, marker);
								} else {
									callBootstrap(pipelineModel, this.modelServersService, marker);
								}
							} catch (InterruptedException e) {
								logger.error(marker, e.getMessage(), e);
								Thread.currentThread().interrupt();
							} catch (Exception ex) {
								logger.error(marker, ex.getMessage(), ex);
							}
						});
			} else {
				logger.info(marker, "Found 0 model to bootstrap");
			}
		} catch (Exception ex) {
			logger.error(marker, ex.getMessage(), ex);
		}
	}

	/**
	 * Upload check.
	 *
	 * @param marker the marker
	 * @param org the org
	 */
	private void uploadCheck(Marker marker, String org) {
		logger.info(marker, "Upload Check Running ...");
		try {
			List<ICIPPipelineModel> pipelineModelsList = this.pipelineModelService.findRunningOrFailedUploads(org);
			if (pipelineModelsList != null && !pipelineModelsList.isEmpty()) {
				pipelineModelsList.parallelStream().forEach(model -> {
					try {
						logger.info(marker, "Checking Failed Files for model - {}", model.getModelname());
						this.pipelineModelService.callFailCheck(model, marker);
					} catch (InterruptedException ex) {
						logger.error(marker, ex.getMessage(), ex);
						Thread.currentThread().interrupt();
					} catch (Exception e) {
						logger.error(marker, e.getMessage(), e);
					}
				});
			} else {
				logger.info(marker, "Found 0 file to upload");
			}
		} catch (Exception ex) {
			logger.error(marker, ex.getMessage(), ex);
		}
	}

	/**
	 * Update server status.
	 *
	 * @param marker the marker
	 */
	private void updateServerStatus(Marker marker) {
		logger.info(marker, "ModelServer Status Check Running ...");
		try {
			List<ICIPModelServers> modelServersList = this.modelServersService.findInactiveModelServers();
			if (modelServersList != null && !modelServersList.isEmpty()) {
				modelServersList.parallelStream().forEach(modelServer -> {
					List<ICIPPipelineModel> pipelineModels = this.pipelineModelService
							.findByModelServer(modelServer.getId());
					pipelineModels.parallelStream().forEach(pipelineModel -> {
						pipelineModel.setStatus(0);
						pipelineModel.setModelserver(null);
						this.pipelineModelService.save(pipelineModel);
						logger.error(marker, "Setting modelserver as null for model {}", pipelineModel.getModelname());
					});
					logger.info(marker, "delete model server : {}", modelServer.getId());
					this.modelServersService.delete(modelServer);
				});
			} else {
				logger.info(marker, "Found 0 inactive model server");
			}
		} catch (Exception ex) {
			logger.error(marker, ex.getMessage(), ex);
		}
	}

	/**
	 * Update time.
	 *
	 * @param pipelineModel the pipeline model
	 * @param path          the path
	 * @param marker the marker
	 * @throws Exception the exception
	 */
	private void updateTime(ICIPPipelineModel pipelineModel, Path path, Marker marker) throws Exception {
		String read = Files.readAllLines(path).get(0);
		Timestamp oldTimestamp = Timestamp.valueOf(read);
		Timestamp currentTimestamp = Timestamp.from(Instant.now());
		long milliseconds1 = oldTimestamp.getTime();
		long milliseconds2 = currentTimestamp.getTime();
		long diff = milliseconds2 - milliseconds1;
		long diffSeconds = diff / 1000;
		long bootstrapacktime = 300;
		if (diffSeconds >= bootstrapacktime) {
			String status = "";
			if (pipelineModel.getModelserver() != null) {
				status = this.pipelineModelService.checkBootstrap(pipelineModel);
			}
			switch (status) {
			case "RUNNING":
				Files.write(path, currentTimestamp.toString().getBytes());
				break;
			case "ERROR":
				callBootstrap(pipelineModel, this.modelServersService, marker);
				break;
			default:
				logger.error(marker,
						"Invalid Status : Getting {} as status from modelserver [VALID STATUS - RUNNING | ERROR]",
						status);
				Files.deleteIfExists(path);
			}
		}
	}

	/**
	 * Call bootstrap.
	 *
	 * @param pipelineModel       the pipeline model
	 * @param modelServersService the model servers service
	 * @param marker the marker
	 * @throws Exception the exception
	 */
	private void callBootstrap(ICIPPipelineModel pipelineModel, ICIPModelServersService modelServersService,
			Marker marker) throws Exception {
		ICIPModelServers modelServer = modelServersService.resolveModelServer();
		if (modelServer != null) {
			logger.info(marker, "Bootstrap called - Server {}", modelServer.getId());
			pipelineModelService.callBootstrap(pipelineModel, modelServer, marker);
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
		return "/modeljobs/all";
	}

	/**
	 * Gets the description.
	 *
	 * @return the description
	 */
	@Override
	public String getDescription() {
		return "Job to run bootstrap in model server, check failed upload and update the model server status";
	}

}
