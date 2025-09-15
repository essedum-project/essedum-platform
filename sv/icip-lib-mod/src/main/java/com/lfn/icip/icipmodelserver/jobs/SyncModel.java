package com.lfn.icip.icipmodelserver.jobs;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.json.JSONObject;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.slf4j.MarkerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.repository.ICIPDatasourceRepository;
import com.lfn.icip.icipmodelserver.constants.PipelineExposeConstants;
import com.lfn.icip.icipmodelserver.v2.model.dto.ICIPPolyAIRequestWrapper;
import com.lfn.icip.icipmodelserver.v2.service.IICIPModelPluginsService;
import com.lfn.icip.icipmodelserver.v2.service.util.IICIPModelServiceUtil;
import com.lfn.icip.icipwebeditor.job.enums.JobMetadata;
import com.lfn.icip.icipwebeditor.job.enums.JobStatus;
import com.lfn.icip.icipwebeditor.job.model.ICIPInternalJobs;
import com.lfn.icip.icipwebeditor.job.service.util.ICIPInitializeAnnotationServiceUtil;
import com.lfn.icip.icipwebeditor.job.util.InternalJob;
import com.lfn.icip.icipwebeditor.jobmodel.service.ICIPInternalJobsService;
import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedModel;
import com.lfn.icip.icipwebeditor.repository.ICIPMLFederatedModelsRepository;

import ch.qos.logback.classic.LoggerContext;

@Component("syncmodelinternaljob")
public class SyncModel implements InternalJob {

	private static final String INTERNALJOBNAME = "SyncModel";

	/** The logger. */
	private final Logger logger = LoggerFactory.getLogger(SyncModel.class);

	/** The logging path. */
	@Value("${LOG_PATH}")
	private String loggingPath;

	/** The annotation util. */
	@Autowired
	private ICIPInitializeAnnotationServiceUtil annotationUtil;

	/** The internaljobs service. */
	@Autowired
	private ICIPInternalJobsService internaljobsService;

	@Autowired
	private ICIPDatasourceRepository datasourceRepository;

	@Autowired
	private IICIPModelPluginsService modelPluginService;

	@Autowired
	private ICIPMLFederatedModelsRepository fedModelRepo;

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
			logger.info(marker, "Starting sync adapter instance for models");
			syncAdapterInstance(marker,org);
			logger.info(marker, "Completed - sync adapter instance for models");
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

	private void syncAdapterInstance(Marker marker,String org) {
		// bring all datasources by organization
		List<ICIPDatasource> dsList = datasourceRepository.findAllByOrganization(org);
		// get models services by datasource type
		dsList.stream().parallel().forEach(ds -> {
			String dsType = ds.getType();
			Boolean isRemoteVMexecutionRequired = false;
			if (!PipelineExposeConstants.REST.equalsIgnoreCase(dsType)) {
				JSONObject connectionDetails = new JSONObject(ds.getConnectionDetails());
				String executionEnvironment = connectionDetails
						.optString(PipelineExposeConstants.EXECUTION_ENVIRONMENT);
				if (PipelineExposeConstants.REMOTE.equalsIgnoreCase(executionEnvironment)) {
					isRemoteVMexecutionRequired = true;
					logger.info(marker,"Found Remote exec conn: {}", ds.getAlias());
				}
			}
			if (isRemoteVMexecutionRequired) {
				try {
					IICIPModelServiceUtil modelService = null;
					modelService = modelPluginService.getModelService(ds.getType());
					ICIPPolyAIRequestWrapper payloadObj = new ICIPPolyAIRequestWrapper();
					JSONObject contentPayload = new JSONObject();
					contentPayload.put("datasource", ds.getName());
					contentPayload.put("org", ds.getOrganization());
					contentPayload.put("datasourceAlias", ds.getAlias());
					contentPayload.put(PipelineExposeConstants.EXECUTION_ENVIRONMENT, PipelineExposeConstants.REMOTE);
					payloadObj.setRequest(contentPayload.toString());
					List<ICIPMLFederatedModel> modelList = modelService.getSyncModelList(payloadObj);
					this.syncModelsOfRemoteDS(marker,ds, modelList);
				} catch (Exception e) {
					logger.error(marker,"Error while syncing models:{}", e.getMessage());
				}
			} else {
				IICIPModelServiceUtil modelService = null;
				try {
					modelService = modelPluginService.getModelService(ds.getType());
				} catch (Exception e) {
					//not logging as this could be a false positive
					logger.error(marker,"Error might be a false positive. Proceeding with caution.:{}", e.getMessage());
				}
				// checking if model service exists for datasource
				if (modelService != null) {
					try {
						// then for that model service sync model
						logger.info(marker, "Starting syncing for ModelService- "+modelService.getJson().toString()+" Datasource- "+ds.getAlias());
						ICIPPolyAIRequestWrapper payload = new ICIPPolyAIRequestWrapper();
						JSONObject content = new JSONObject();
						content.put("datasource", ds.getName());
						content.put("org", ds.getOrganization());
						content.put("datasourceAlias", ds.getAlias());
						payload.setRequest(content.toString());
						List<ICIPMLFederatedModel> modelList = modelService.getSyncModelList(payload);
						String response = syncModels(modelList);
						if (response.equals("error")) {
							logger.error(marker,"Error in syncing models for datasource" + ds.getName()+" Name- "+ds.getAlias());
						}else if(response.equals("success")) {
							logger.info(marker,"Syncing is done for ModelService- "+modelService.getJson().toString()+" Datasource- "+ds.getAlias());
						}
					} catch (Exception e) {
						// TODO Auto-generated catch block
						logger.error(marker,e.getMessage());
					}
				}

			}
		});
	}

	private void syncModelsOfRemoteDS(Marker marker,ICIPDatasource ds, List<ICIPMLFederatedModel> modelsFromAWSRemote) {
		try {
			List<ICIPMLFederatedModel> modelsFromDB = fedModelRepo
					.findByDatasourceNameAndOrganisaton(ds.getOrganization(), ds.getName());
			List<String> modelsNamesPresentInAWS = new ArrayList<>();
			if (modelsFromAWSRemote != null && !modelsFromAWSRemote.isEmpty() && modelsFromAWSRemote.size() > 0) {
				String responseSyncModels = syncModels(modelsFromAWSRemote);
				if (responseSyncModels.equals("error")) {
					logger.error(marker,"Error in syncing models for datasource{}", ds.getName());
				}
				modelsFromAWSRemote.stream().forEach(model -> {
					modelsNamesPresentInAWS.add(model.getModelName());
				});
				if (modelsNamesPresentInAWS != null && !modelsNamesPresentInAWS.isEmpty()) {
					List<ICIPMLFederatedModel> modelsToBeUpdatedAsDelete = new ArrayList<>();
					if (modelsFromDB != null && !modelsFromDB.isEmpty()) {
						modelsFromDB.stream().forEach(modelDB -> {
							if (!modelsNamesPresentInAWS.contains(modelDB.getModelName())) {
								ICIPMLFederatedModel modelToBeUpdatedAsDelete = modelDB;
								modelsToBeUpdatedAsDelete.add(modelToBeUpdatedAsDelete);
							}
						});
					}
					String response = syncModels(modelsToBeUpdatedAsDelete);
					if (response.equals("error")) {
						logger.error(marker,"Error in syncing models not available in cloud for datasource:{}", ds.getName());
					}
				}
			}
		} catch (Exception e) {
			logger.error(marker,"Error in syncing models :{}", e.getMessage());
		}
	}

	private String syncModels(List<ICIPMLFederatedModel> modelList) {
		try {
			fedModelRepo.saveAll(modelList);
			return "success";
		} catch (Exception e) {
			logger.error(e.getMessage());
			return "error";
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
		return "Job to sync adapter instance with model";
	}
}
