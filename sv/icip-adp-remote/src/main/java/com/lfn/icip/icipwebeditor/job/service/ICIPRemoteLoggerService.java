package com.lfn.icip.icipwebeditor.job.service;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.channels.FileChannel;
import java.nio.channels.FileLock;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.TimeZone;
import java.util.zip.GZIPInputStream;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.ai.comm.lib.util.swagger.client.JSON;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.service.IICIPDatasourcePluginsService;
import com.lfn.icip.dataset.service.IICIPDatasourceService;
import com.lfn.icip.dataset.service.util.IICIPDataSourceServiceUtil;
import com.lfn.icip.icipwebeditor.constants.IAIJobConstants;
import com.lfn.icip.icipwebeditor.constants.LoggerConstants;
import com.lfn.icip.icipwebeditor.job.service.util.ICIPInitializeAnnotationServiceUtil;
import com.lfn.icip.icipwebeditor.model.ICIPJobs;
import com.lfn.icip.icipwebeditor.model.ICIPJobsPartial;
import com.lfn.icip.icipwebeditor.repository.ICIPJobsRepository;
import com.lfn.icip.icipwebeditor.service.IICIPJobRuntimeLoggerService;

import lombok.extern.log4j.Log4j2;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

@Log4j2
@Service("remoteloggerservice")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@RefreshScope
public class ICIPRemoteLoggerService implements IICIPJobRuntimeLoggerService {

	/** The logger. */
	private final Logger logger = LoggerFactory.getLogger(ICIPRemoteLoggerService.class);

	@Autowired
	private IICIPDatasourceService dsService;

	@Autowired
	private IICIPDatasourcePluginsService dsPluginService;

	@Autowired
	private ICIPInitializeAnnotationServiceUtil annotationServiceUtil;

	@Autowired
	private ICIPJobsRepository iCIPJobsRepository;

	@Autowired
	private ICIPRemoteExecutorJob remoteJob;

	@Value("${jobexecutor.enabled}")
	private boolean jobExecutorEnabled;

	@Value("${jobexecutor.org}")
	private String jobExecutorOrg;

	FileOutputStream writer = null;

	public ICIPJobsPartial updateAndLogJob(ICIPJobsPartial job) {
		return updateRemoteJob(job);
	}

	public ICIPJobsPartial updateRemoteJob(ICIPJobsPartial job) {
		Path writeLogFilePath;
		JSONObject jobmetadata = new JSONObject(job.getJobmetadata());
		if (jobmetadata.has("tag") && jobmetadata.get("tag").toString().equalsIgnoreCase("CHAIN")) {
			writeLogFilePath = Paths.get(annotationServiceUtil.getFolderPath(),
					String.format(LoggerConstants.STRING_STRING_STRING,
							"/logs/" + IAIJobConstants.CHAINLOGPATH + "/" + job.getCorrelationid() + "/",
							job.getJobId(), IAIJobConstants.OUTLOG));
		} else {
			writeLogFilePath = Paths.get(annotationServiceUtil.getFolderPath(),
					String.format(LoggerConstants.STRING_DECIMAL_STRING, IAIJobConstants.PIPELINELOGPATH, job.getId(),
							IAIJobConstants.OUTLOG));
		}
		ICIPJobs job2save = iCIPJobsRepository.findById(job.getId()).get();
		/*
		 * FileOutputStream writer = null; FileLock lock = null; FileChannel channel =
		 * null; try { writer = new FileOutputStream(writeLogFilePath.toString());
		 * channel = writer.getChannel(); channel.truncate(0); if (channel.isOpen()) {
		 * try { lock = channel.tryLock(); if (lock == null) { return job; } } catch
		 * (Exception e) { logger.error("Exception", e.getMessage()); return job; }
		 */
		try (FileOutputStream writer = new FileOutputStream(writeLogFilePath.toString());
				FileChannel channel = writer.getChannel()) {

			channel.truncate(0);
			if (channel.isOpen()) {
				try (FileLock lock = channel.tryLock()) {
					if (lock == null) {
						return job; // Lock could not be acquired
					}

					org.json.JSONObject jobMetaData = new org.json.JSONObject(job.getJobmetadata());
					ICIPDatasource dsObject = dsService.getDatasource(jobMetaData.getString("datasourceName"),
							job.getOrganization());
					org.json.JSONObject connDetails = new org.json.JSONObject(dsObject.getConnectionDetails());
					logger.info("Alias Name is " + dsObject.getAlias());
					String status = job.getJobStatus();
					logger.info(" jobExecutorEnabled, status {},{} ", jobExecutorEnabled, status);
					String taskId = null;
					if (jobMetaData.has("taskId")) {
						logger.info("jobMetaData has taskId");
						taskId = jobMetaData.getString("taskId");
					}
					logger.info(" taskId value {} ", taskId);
					Boolean executeEnable = jobExecutorEnabled;
					if (jobExecutorEnabled) {
						executeEnable = jobExecutorEnabled;
					} else {
						List<String> jobExecutorOrgList = Arrays.asList(jobExecutorOrg.split(","));
						executeEnable = !jobExecutorOrgList.contains(job.getOrganization());
					}
					if (jobExecutorEnabled || Objects.nonNull(taskId)) {
						logger.info("Getting the task status");
						org.json.JSONObject responseObj = remoteJob.getTaskStatus(taskId, connDetails);
						status = responseObj.get("task_status").toString();
						logger.info("Status fetched is " + status);
						org.json.JSONObject logs = null;
						if (status.equalsIgnoreCase("COMPLETED") || status.equalsIgnoreCase("ERROR")) {
							org.json.JSONObject res = remoteJob.getLog(jobMetaData.getString("taskId"), connDetails);
							logger.info("Log response fetched is " + res);
							logs = new org.json.JSONObject(res.get("logs").toString());
							logger.info("logs fetched is " + logs.length());
						}
						switch (status) {
						case "RUNNING":
							if (job != null && writer != null && logs != null) {
								String response1 = readLogsandWriteToLogFile(job, logs, writer, status);
								return job;
							} else {
								logger.error("Job or writer is null during RUNNING status.");
								return job;
							}
						case "Submitted":
							return job;
						case "COMPLETED":
							if (jobMetaData.has("logFilePath")) {
								if (job != null && logs != null && writer != null) {
									String response = readLogsandWriteToLogFile(job, logs, writer, status);
									String responseTime = responseObj.getString("finished");
									String submittedTimestamp = responseObj.getString("started");
									String timestampValue = responseObj.get("timestamp").toString();

									/*
									 * responseTime = responseTime.replaceFirst(" ", "T"); LocalDateTime dateTime =
									 * LocalDateTime.parse(responseTime, DateTimeFormatter.ISO_DATE_TIME); ZoneId
									 * gmtZoneId = ZoneId.of("GMT"); ZoneId istZoneId = ZoneId.of("Asia/Kolkata");
									 * dateTime =
									 * dateTime.atZone(gmtZoneId).withZoneSameInstant(istZoneId).toLocalDateTime();
									 * SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");
									 * sdf.setTimeZone(TimeZone.getTimeZone("IST"));
									 */

									DateTimeFormatter submittedFormatter = DateTimeFormatter
											.ofPattern("yyyy-MM-dd HH:mm:ss.SSSSSSXXX");
									ZonedDateTime submittedDateTime = ZonedDateTime.parse(submittedTimestamp,
											submittedFormatter);
									double timestampMillis = Double.parseDouble(timestampValue) * 1000;
									ZonedDateTime plusNanos = submittedDateTime
											.plusNanos((long) (timestampMillis * 1_000_000L));
									Timestamp timestamp = Timestamp.from(plusNanos.toInstant());
									try {
//							Date finishedTime = sdf.parse(dateTime.toString());
										job.setJobStatus("COMPLETED");
										job.setFinishtime(timestamp);
										job2save.setJobStatus("COMPLETED");
										job2save.setFinishtime(timestamp);
									} catch (JSONException e) {
										logger.error("Exception", e.getMessage());
									}

									iCIPJobsRepository.save(job2save);

								}
								return job;
							} else {
								logger.error("Job, logs, or writer is null during COMPLETED status.");
								return job;
							}
						case "WAITING":
							String responses = readLogsandWriteToLogFile(job, logs, writer, status);
							job.setJobStatus("WAITING");
							job.setJobStatus("WAITING");
							iCIPJobsRepository.save(job2save);
							return job;

						case "ERROR":
							if (job != null && logs != null && writer != null) {
								String responseTime = responseObj.getString("finished");
								String submittedTimestamp = responseObj.getString("started");
								String timestampValue = responseObj.get("timestamp").toString();
								/*
								 * responseTime = responseTime.replaceFirst(" ", "T"); LocalDateTime dateTime =
								 * LocalDateTime.parse(responseTime, DateTimeFormatter.ISO_DATE_TIME); ZoneId
								 * gmtZoneId = ZoneId.of("GMT"); ZoneId istZoneId = ZoneId.of("Asia/Kolkata");
								 * dateTime =
								 * dateTime.atZone(gmtZoneId).withZoneSameInstant(istZoneId).toLocalDateTime();
								 * 
								 * SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");
								 * sdf.setTimeZone(TimeZone.getTimeZone("IST"));
								 */

								DateTimeFormatter submittedFormatter = DateTimeFormatter
										.ofPattern("yyyy-MM-dd HH:mm:ss.SSSSSSXXX");
								ZonedDateTime submittedDateTime = ZonedDateTime.parse(submittedTimestamp,
										submittedFormatter);
								double timestampMillis = Double.parseDouble(timestampValue) * 1000;
								ZonedDateTime plusNanos = submittedDateTime
										.plusNanos((long) (timestampMillis * 1_000_000L));
								Timestamp timestamp = Timestamp.from(plusNanos.toInstant());

								try {
//						Date finishedTime = sdf.parse(dateTime.toString());
									if (job != null && logs != null && writer != null) {
										String response = readLogsandWriteToLogFile(job, logs, writer, status);
									} else {
										logger.error("Job, logs, or writer is null during COMPLETED status.");
										return job;
									}
									job2save.setJobStatus("ERROR");
									job2save.setFinishtime(timestamp);
									iCIPJobsRepository.save(job2save);
									job.setJobStatus("ERROR");
									job.setFinishtime(timestamp);
								} catch (JSONException e) {
									logger.error("Exception", e.getMessage());
								}
								return job;
							} else {
								logger.error("Job, logs, or writer is null during COMPLETED status.");
								return job;
							}
						case "CANCELLED":
							String responseTime2 = responseObj.getString("finished");
							String submittedTimestamp2 = responseObj.getString("started");
							String timestampValue2 = responseObj.get("timestamp").toString();
							/*
							 * responseTime2 = responseTime2.replaceFirst(" ", "T"); LocalDateTime dateTime2
							 * = LocalDateTime.parse(responseTime2, DateTimeFormatter.ISO_DATE_TIME); ZoneId
							 * gmtZoneId2 = ZoneId.of("GMT"); ZoneId istZoneId2= ZoneId.of("Asia/Kolkata");
							 * dateTime2 =
							 * dateTime2.atZone(gmtZoneId2).withZoneSameInstant(istZoneId2).toLocalDateTime(
							 * );
							 * 
							 * SimpleDateFormat sdf2 = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");
							 * sdf2.setTimeZone(TimeZone.getTimeZone("IST"));
							 */
							/*
							 * DateTimeFormatter formatter2 =
							 * DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSSSSSXXX"); LocalDateTime
							 * currentDateTime2 = LocalDateTime.parse(responseTime2, formatter2); Timestamp
							 * timestamp2 = Timestamp.valueOf(currentDateTime2);
							 */

							DateTimeFormatter submittedFormatter2 = DateTimeFormatter
									.ofPattern("yyyy-MM-dd HH:mm:ss.SSSSSSXXX");
							ZonedDateTime submittedDateTime2 = ZonedDateTime.parse(submittedTimestamp2,
									submittedFormatter2);
							double timestampMillis2 = Double.parseDouble(timestampValue2) * 1000;
							ZonedDateTime plusNanos2 = submittedDateTime2
									.plusNanos((long) (timestampMillis2 * 1_000_000L));
							Timestamp timestamp2 = Timestamp.from(plusNanos2.toInstant());

							try {
//						Date finishedTime = sdf2.parse(dateTime2.toString());
								if (job != null && writer != null) {
									String response = readLogsandWriteToLogFile(job, logs, writer, status);
								} else {
									logger.error("Job, logs, or writer is null during COMPLETED status.");
									return job;
								}
								job2save.setJobStatus("CANCELLED");
								job2save.setFinishtime(timestamp2);
								iCIPJobsRepository.save(job2save);
								job.setJobStatus("ERROR");
								job.setFinishtime(timestamp2);
							} catch (JSONException e) {
								logger.error("Exception", e.getMessage());
							}
							return job;
						default:
							return job;
						}
					} else {
						return job;
					}

				}
			}
		} catch (IOException | JSONException | EssedumException e1) {
			String error = "Error in Job Execution : " + e1.getMessage()
					+ System.getProperty(IAIJobConstants.LINE_SEPARATOR) + e1.toString();
			job2save.setJobStatus("ERROR");
			job2save.setFinishtime(new Timestamp(System.currentTimeMillis()));
			iCIPJobsRepository.save(job2save);
			job.setJobStatus("ERROR");
			job.setFinishtime(new Timestamp(System.currentTimeMillis()));
			try {
				writer.write(error.getBytes());
			} catch (IOException e) {
				logger.error("Exception", e.getMessage());
			}

		} catch (Exception e2) {
			String error = "Error in Job Execution : " + e2.getMessage();
			job2save.setJobStatus("ERROR");
			job2save.setFinishtime(new Timestamp(System.currentTimeMillis()));
			iCIPJobsRepository.save(job2save);
			job.setJobStatus("ERROR");
			job.setFinishtime(new Timestamp(System.currentTimeMillis()));
			try {
				writer.write(error.getBytes());
			} catch (IOException e) {
				logger.error("Exception", e.getMessage());
			}
		}

		return job;

	}

	private String readLogsandWriteToLogFile(ICIPJobsPartial job, JSONObject outputLog, FileOutputStream writer,
			String status) {
		if (job == null || writer == null || outputLog == null) {
			logger.error("Job or writer is null in readLogsandWriteToLogFile.");
			return null;
		}
		try {

			Path writeLogFilePath;
			JSONObject jobmetadata = new JSONObject(job.getJobmetadata());
			if (jobmetadata.has("tag") && jobmetadata.get("tag").toString().equalsIgnoreCase("CHAIN")) {
				writeLogFilePath = Paths.get(annotationServiceUtil.getFolderPath(),
						String.format(LoggerConstants.STRING_DECIMAL_STRING,
								"/logs/" + IAIJobConstants.CHAINLOGPATH + "/" + job.getCorrelationid() + "/",
								job.getId(), IAIJobConstants.OUTLOG));
			} else {
				writeLogFilePath = Paths.get(annotationServiceUtil.getFolderPath(),
						String.format(LoggerConstants.STRING_DECIMAL_STRING, IAIJobConstants.PIPELINELOGPATH,
								job.getId(), IAIJobConstants.OUTLOG));
			}

			if (status.equalsIgnoreCase("waiting")) {
				writer.write("The job is queued, i.e., in the waiting stage. Please wait.".getBytes());
				return "success";
			}

			if (status.equalsIgnoreCase("error")) {
				String logs = outputLog.getString("content");
				if (logs != null && "Log not found".equals(logs)) {
					writer.write(
							"Logs Not found.Issue with Job executor.Please re-run the pipeline with the same or diffrent executor"
									.getBytes());
					return "success";
				} else if (logs.isEmpty() || logs == null) {
					writer.write(
							"No Logs Available.Could be issue with job executor while running. Please re-run the pipeline with the same or diffrent executor"
									.getBytes());
					return "success";
				}
			} else if (status.equalsIgnoreCase("completed")) {
				String logs = outputLog.getString("content");
				if (logs != null && "Log not found".equals(logs)) {
					writer.write(
							"The job was executed successfully, but logs were not found. Please re-run the pipeline"
									.getBytes());
					return "success";
				} else if (logs.isEmpty() || logs == null) {
					writer.write(
							"The job was executed successfully, but the executor could not generate logs at this time. Please re-run the pipeline."
									.getBytes());
					return "success";
				}
			}

			if (outputLog.has("content"))
				logger.info("Logs >>>" + outputLog.getString("content").getBytes());
			writer.write(outputLog.getString("content").getBytes());
			writer.write(10);

			return "success";

		} catch (Exception e) {
			logger.error("Exception", e.getMessage());
			return null;
		}

	}

}
