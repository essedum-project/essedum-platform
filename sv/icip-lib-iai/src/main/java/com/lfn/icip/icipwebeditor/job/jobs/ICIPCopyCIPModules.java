package com.lfn.icip.icipwebeditor.job.jobs;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Timestamp;
import java.util.Date;
import java.util.List;
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

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.logger.JobLogger;
import com.lfn.icip.dataset.service.impl.ICIPAdpService;
import com.lfn.icip.icipwebeditor.job.enums.JobMetadata;
import com.lfn.icip.icipwebeditor.job.enums.JobStatus;
import com.lfn.icip.icipwebeditor.job.model.ICIPInternalJobs;
import com.lfn.icip.icipwebeditor.jobmodel.service.ICIPInternalJobsService;
import com.lfn.icip.icipwebeditor.service.impl.ICIPIaiService;

import ch.qos.logback.classic.LoggerContext;

public class ICIPCopyCIPModules implements Job {
	
	/** The logger. */
	private final Logger logger = LoggerFactory.getLogger(JobLogger.class);

	/** The Constant INTERNALJOBNAME. */
	private static final String INTERNALJOBNAME = "CIPModules";

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
	 * Copy CopyModules.
	 *
	 * @param marker          the marker
	 * @param fromProjectName the from project name
	 * @param toProjectName   the to project name
	 * @param datasetProjectId the dataset project id
	 * @param datasets the datasets
	 * @param toDatasource the to datasource
	 * @return the boolean
	 */
	public Boolean copyModules(Marker marker, String source, JSONArray target, JSONArray modules) {
		target.forEach((tar) ->{
			logger.info(marker,"Executing copy modules for {} to {}", source, tar);
			iCIPAdpService.copyBlueprints(marker, source, tar.toString(), 0);
			iCIPIaiService.copyBlueprints(marker, source, tar.toString());
		});
		return true;
	}
	
	public Boolean exportModules(Marker marker, String source, JSONObject modules) {
		logger.info(marker,"Executing export modules to {}", source);
		iCIPAdpService.exportModules(marker, source, modules);
		iCIPIaiService.exportModules(marker, source, modules);
		return true;
	}
	
	public Boolean importModules(Marker marker, JSONArray target, String data) {
		JSONObject jsonData = new JSONObject(data);
		target.forEach((tar) ->{
			logger.info(marker,"Executing import modules to {}", tar);
			iCIPAdpService.importModules(marker, tar.toString(), jsonData.getJSONObject("ADP"));
			iCIPIaiService.importModules(marker, tar.toString(), jsonData.getJSONObject("IAI"));
		});
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
		String data = "";
		try {
			String uid = ICIPUtils.removeSpecialCharacter(UUID.randomUUID().toString());
			marker = MarkerFactory.getMarker(uid);
			JobDataMap dataMap = context.getJobDetail().getJobDataMap();
			String submittedBy = dataMap.getString("submittedBy");
			String org = context.getJobDetail().getKey().getGroup();
			String todo = dataMap.getString("todo").toUpperCase();
			Timestamp submittedOn = new Timestamp(new Date().getTime());
			internalJob = jobsService.createInternalJobs(todo+"_"+INTERNALJOBNAME, uid, submittedBy, submittedOn, org);
			if(dataMap.getString("filepath")!=null) {
				String filePath = dataMap.getString("filepath");
				Path path = Paths.get(filePath);
				try (FileInputStream fileIn = new FileInputStream(path.toFile())) {
					data = new String(fileIn.readAllBytes());
				}
			}
			
			ICIPInternalJobs.MetaData metadata = new ICIPInternalJobs.MetaData();
			metadata.setTag(JobMetadata.USER.toString());
			internalJob = internalJob.updateMetadata(metadata);
			internalJob = jobsService.save(internalJob);
			
			LoggerContext loggerContext = (LoggerContext) LoggerFactory.getILoggerFactory();
			loggerContext.putProperty("marker", String.valueOf(internalJob.getId()));
			
			logger.info(marker,"Executing on CIP Modules");
			Gson gson = new GsonBuilder().disableHtmlEscaping().create();
			JsonObject result = new JsonObject();
			if(todo.equalsIgnoreCase("COPY")) {
				String source = dataMap.getString("source");
				JSONArray target = new JSONArray(dataMap.getString("target"));
				JSONArray modules = new JSONArray(dataMap.getString("modules"));
				copyModules(marker,source,target,modules);
				jobsService.updateInternalJob(internalJob, JobStatus.COMPLETED.toString());
			}
			else if(todo.equalsIgnoreCase("IMPORT")) {
				JSONArray target = new JSONArray(dataMap.getString("target"));
				importModules(marker,target, data);
				jobsService.updateInternalJob(internalJob, JobStatus.COMPLETED.toString());
			}
			else if(todo.equalsIgnoreCase("EXPORT")) {
				String source = dataMap.getString("source");
				JSONObject modules = new JSONObject(dataMap.getString("modules"));
				exportModules(marker,source, modules);
				jobsService.updateInternalJob(internalJob, JobStatus.COMPLETED.toString());
			}
		}
		catch(Exception ex) {
			logger.error(marker, ex.getMessage());
			try {
				jobsService.updateInternalJob(internalJob, JobStatus.ERROR.toString());
			} catch (IOException e) {
				logger.error(marker, e.getMessage());
			}
		}
		
	}

}
