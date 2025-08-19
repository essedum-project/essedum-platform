package com.lfn.icip.dataset.jobs;

import java.io.IOException;
import java.sql.Timestamp;
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
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.service.impl.ICIPDatasetPluginsService;
import com.lfn.icip.dataset.service.impl.ICIPDatasetService;
import com.lfn.icip.dataset.service.impl.ICIPDatasourcePluginsService;
import com.lfn.icip.dataset.service.impl.ICIPDatasourceService;
import com.lfn.icip.icipwebeditor.job.enums.JobMetadata;
import com.lfn.icip.icipwebeditor.job.enums.JobStatus;
import com.lfn.icip.icipwebeditor.job.model.ICIPInternalJobs;
import com.lfn.icip.icipwebeditor.job.service.IICIPInternalJobsService;
import com.lfn.icip.icipwebeditor.job.util.InternalJob;

import ch.qos.logback.classic.LoggerContext;

import jakarta.persistence.*;

// TODO: Auto-generated Javadoc
/**
 * The Class ICIPCreateDatasets.
 */
@MappedSuperclass
public class ICIPCreateDatasets implements InternalJob{
	
	/** The logger. */
	private final Logger logger = LoggerFactory.getLogger(JobLogger.class);

	/** The Constant INTERNALJOBNAME. */
	private static final String INTERNALJOBNAME = "CreateDatasets";

	/** The i CIP adp service. */
	@Autowired
	private ICIPDatasourcePluginsService dsourcePluginService;
	
	@Autowired
	private ICIPDatasetPluginsService dsetPluginService;
	
	/** The jobs service. */
	@Autowired
	private IICIPInternalJobsService jobsService;
	
	/** The datasource service. */
	@Autowired
	private ICIPDatasourceService datasourceService;
	
	@Autowired
	private ICIPDatasetService datasetService;
	
	/** The logging path. */
	@Value("${LOG_PATH}")
	private String loggingPath;
	
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
			String datasourceName = dataMap.getString("datasource");
			String submittedBy = dataMap.getString("submittedBy");
			String org = dataMap.getString("org");
			ICIPDatasource datasource = datasourceService.getDatasource(datasourceName, org);
			String corelid = dataMap.getOrDefault("corelid", ICIPUtils.generateCorrelationId()).toString();
			boolean runnow = dataMap.getBoolean("runnow");
			boolean isEvent = dataMap.getBoolean("event");
			Timestamp submittedOn = new Timestamp(new Date().getTime());
			internalJob = jobsService.createInternalJobs(INTERNALJOBNAME, uid, submittedBy, submittedOn, org);

			ICIPInternalJobs.MetaData metadata = new ICIPInternalJobs.MetaData();
			metadata.setTag(isEvent ? JobMetadata.EVENT.toString()
					: runnow ? JobMetadata.USER.toString() : JobMetadata.SCHEDULED.toString());
			internalJob = internalJob.updateMetadata(metadata);
			internalJob.setCorrelationid(corelid);
			internalJob = jobsService.save(internalJob);
			LoggerContext loggerContext = (LoggerContext) LoggerFactory.getILoggerFactory();
			loggerContext.putProperty("marker", String.valueOf(internalJob.getId()));
			
			createDatasets(datasource, org, marker);
			
			jobsService.updateInternalJob(internalJob, JobStatus.COMPLETED.toString());
			
		} catch (Exception ex) {
			logger.error(marker, ex.getMessage(), ex);
			try {
				jobsService.updateInternalJob(internalJob, JobStatus.ERROR.toString());
			} catch (IOException e) {
				logger.error(marker, e.getMessage(), e);
			}
		}
	}
	
	/**
	 * Creates the datasets.
	 *
	 * @param datasource the datasource
	 * @param marker the marker
	 */
	private void createDatasets(ICIPDatasource datasource, String organization, Marker marker){
		
		logger.info(marker, "Creating "+datasource.getType().toLowerCase()+" datasets");
		try{
			dsourcePluginService.getDataSourceService(datasource).createDatasets(datasource, marker);
			List<ICIPDataset> datasets = datasourceService.getDatasetsByDatasource(datasource, organization);
			datasets.forEach( dataset -> {
				ICIPDataset updatedDataset = dsetPluginService.getDataSetService(dataset).updateDataset(dataset);
				datasetService.save(dataset.getId().toString(), updatedDataset);
			});
			logger.info(marker, "Datasets for "+datasource.getAlias()+" are successfully created");
		}catch(UnsupportedOperationException ex) {
			logger.error(ex.getMessage());
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
		return "/plugin/createDatasets";
	}

	/**
	 * Gets the description.
	 *
	 * @return the description
	 */
	@Override
	public String getDescription() {
		return "Job to create datasets";
	}

}
