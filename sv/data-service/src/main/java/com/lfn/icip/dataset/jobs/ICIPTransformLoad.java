package com.lfn.icip.dataset.jobs;

import java.io.IOException;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.json.JSONArray;
import org.json.JSONObject;
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
import com.lfn.icip.dataset.factory.IICIPDataSetServiceUtilFactory;
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.service.impl.ICIPDatasetService;
import com.lfn.icip.dataset.service.util.IICIPDataSetServiceUtil.DATATYPE;
import com.lfn.icip.dataset.service.util.IICIPDataSetServiceUtil.SQLPagination;
import com.lfn.icip.icipwebeditor.job.enums.JobMetadata;
import com.lfn.icip.icipwebeditor.job.model.ICIPInternalJobs;
import com.lfn.icip.icipwebeditor.job.service.IICIPInternalJobsService;

import ch.qos.logback.classic.LoggerContext;

public class ICIPTransformLoad implements Job{
	
	/** The logger. */
	private final Logger logger = LoggerFactory.getLogger(JobLogger.class);

	/** The jobs service. */
	@Autowired
	private IICIPInternalJobsService jobsService;

	/** The dataset repository. */
	@Autowired
	private ICIPDatasetService datasetService;

	/** The util. */
	@Autowired
	private IICIPDataSetServiceUtilFactory util;

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
			List<Map<String, ?>> map = (List<Map<String, ?>>) dataMap.get("data");
			String inpdataset = dataMap.getString("inpdataset");
			String outdataset = dataMap.getString("outdataset");
			Timestamp submittedOn = new Timestamp(new Date().getTime());
			String submittedBy = dataMap.getString("submittedBy");
			String org = dataMap.getString("org");
			internalJob = jobsService.createInternalJobs("ETL", uid, submittedBy, submittedOn, org);

			ICIPInternalJobs.MetaData metadata = new ICIPInternalJobs.MetaData();
			metadata.setTag(JobMetadata.USER.toString());
			internalJob = internalJob.updateMetadata(metadata);
			internalJob.setDataset(inpdataset);
			internalJob = jobsService.save(internalJob);

			LoggerContext loggerContext = (LoggerContext) LoggerFactory.getILoggerFactory();
			loggerContext.putProperty("marker", String.valueOf(internalJob.getId()));
			transformLoad(datasetService.getDataset(inpdataset, org),datasetService.getDataset(outdataset, org), marker, map, org);
			jobsService.updateInternalJob(internalJob, "COMPLETED");
		} catch (Exception ex) {
			logger.error(marker, ex.getMessage());
			try {
				jobsService.updateInternalJob(internalJob, "ERROR");
			} catch (IOException e) {
				logger.error(marker, e.getMessage());
			}
		}
	}

	private void transformLoad(ICIPDataset inpdataset, ICIPDataset outdataset, Marker marker, List<Map<String, ?>> map,
			String org) {
		try {
			
			String result = util.getDataSetUtil(inpdataset.getDatasource().getType().toLowerCase() + "ds").getDatasetData(inpdataset, new SQLPagination(0, 10, null, -1), DATATYPE.JSONHEADER, String.class);
			JSONArray response = new JSONObject(result).getJSONArray("result")!=null?new JSONObject(result).getJSONArray("result"):new JSONArray(result);
			util.getDataSetUtil(outdataset.getDatasource().getType().toLowerCase() + "ds").transformLoad(outdataset, marker, map,response);
		} catch (SQLException e) {
			logger.error(e.getMessage());
		}
		
	}

}
