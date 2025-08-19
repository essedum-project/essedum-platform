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

package com.infosys.icets.icip.dataset.jobs;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.Date;
import java.util.List;
import java.util.Map;
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
import com.infosys.icets.icip.dataset.factory.IICIPDataSetServiceUtilFactory;
import com.infosys.icets.icip.dataset.model.ICIPDataset;
import com.infosys.icets.icip.dataset.service.impl.ICIPDatasetService;
import com.infosys.icets.icip.icipwebeditor.job.enums.JobMetadata;
import com.infosys.icets.icip.icipwebeditor.job.model.ICIPInternalJobs;
import com.infosys.icets.icip.icipwebeditor.job.service.IICIPInternalJobsService;

import ch.qos.logback.classic.LoggerContext;
import lombok.Setter;

// TODO: Auto-generated Javadoc
/**
 * Sets the logging path.
 */

/**
 * Sets the logging path.
 *
 * @param loggingPath the new logging path
 */
@Setter
public class ICIPLoadDataset implements Job {

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
	 * Load dataset.
	 *
	 * @param dataset   the dataset
	 * @param marker    the marker
	 * @param map       the map
	 * @param id        the id
	 * @param projectId the project id
	 * @param overwrite the overwrite
	 * @param org       the org
	 * @return the boolean
	 * @throws Exception the exception
	 */
	public Boolean loadDataset(ICIPDataset dataset, Marker marker, List<Map<String, ?>> map, String id, int projectId,
			boolean overwrite, String org) throws Exception {
		logger.info(marker, "Loading dataset");
		util.getDataSetUtil(dataset.getDatasource().getType().toLowerCase() + "ds").loadDataset(dataset, marker, map,
				id, projectId, overwrite, org);
		logger.info(marker, "Dataset loaded");
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
			List<Map<String, ?>> map = (List<Map<String, ?>>) dataMap.get("data");
			String id = dataMap.getString("id");
			int projectId = dataMap.getInt("projectId");
			String datasetName = dataMap.getString("dataset");
			boolean overwrite = dataMap.getBoolean("overwrite");
			Timestamp submittedOn = new Timestamp(new Date().getTime());
			String submittedBy = dataMap.getString("submittedBy");
			String org = dataMap.getString("org");
			internalJob = jobsService.createInternalJobs("LoadDataset", uid, submittedBy, submittedOn, org);

			ICIPInternalJobs.MetaData metadata = new ICIPInternalJobs.MetaData();
			metadata.setTag(JobMetadata.USER.toString());
			internalJob = internalJob.updateMetadata(metadata);
			internalJob.setDataset(datasetName);
			internalJob = jobsService.save(internalJob);

			LoggerContext loggerContext = (LoggerContext) LoggerFactory.getILoggerFactory();
			loggerContext.putProperty("marker", String.valueOf(internalJob.getId()));
			loadDataset(datasetService.getDataset(datasetName, org), marker, map, id, projectId, overwrite, org);
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

}
