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

package com.lfn.icip.icipwebeditor.executor.sync.service;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Timestamp;
import java.util.Date;
import java.util.List;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileItemFactory;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.mock.web.MockMultipartFile;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.icip.icipwebeditor.constants.AlertConstants;
import com.lfn.icip.icipwebeditor.constants.IAIJobConstants;
import com.lfn.icip.icipwebeditor.event.model.AlertEvent;
import com.lfn.icip.icipwebeditor.event.model.LogFileUploadEvent;
import com.lfn.icip.icipwebeditor.event.publisher.AlertEventPublisher;
import com.lfn.icip.icipwebeditor.event.publisher.LogFileUploadEventPublisher;
import com.lfn.icip.icipwebeditor.job.enums.JobStatus;
import com.lfn.icip.icipwebeditor.job.enums.RuntimeType;
import com.lfn.icip.icipwebeditor.job.model.ICIPChainJobsPartial;
import com.lfn.icip.icipwebeditor.job.service.util.ICIPInitializeAnnotationServiceUtil;
import com.lfn.icip.icipwebeditor.model.ICIPJobs;
import com.lfn.icip.icipwebeditor.model.ICIPJobsPartial;
import com.lfn.icip.icipwebeditor.model.ICIPPipelinePID;
import com.lfn.icip.icipwebeditor.model.ICIPStreamingServices;
import com.lfn.icip.icipwebeditor.repository.ICIPChainJobsPartialRepository;
import com.lfn.icip.icipwebeditor.repository.ICIPJobsPartialRepository;
import com.lfn.icip.icipwebeditor.repository.ICIPJobsRepository;
import com.lfn.icip.icipwebeditor.repository.ICIPPipelinePIDRepository;
import com.lfn.icip.icipwebeditor.repository.ICIPStreamingServicesRepository;
import com.lfn.icip.icipwebeditor.service.IICIPOutputArtifactsService;
import com.lfn.icip.icipwebeditor.service.IICIPStopJobService;
import com.lfn.icip.icipwebeditor.service.impl.ICIPOutputArtifactsService;
import com.lfn.icip.icipwebeditor.service.impl.ICIPRuntimeLoggerService;
import com.lfn.icip.icipwebeditor.service.impl.ICIPStopJobService;

import lombok.extern.log4j.Log4j2;

/**
 * The Class JobSyncExecutorService.
 */
@Log4j2
@Service
@RefreshScope
public class JobSyncExecutorService {

	private static final String REMOTE = "remote";

	private static final String EMR = "emr";

	private static final String AICLOUD = "aicloud";

	@Autowired
	ICIPChainJobsPartialRepository icipChainJobsPartialRepository;

	@Autowired
	private ICIPStopJobService stopJobService;
	/** The pipeline pid repository. */
	@Autowired
	private ICIPPipelinePIDRepository pipelinePidRepository;
	@Autowired
	private ICIPOutputArtifactsService outputArtifactsService;
	/** The i CIP jobs repository. */
	@Autowired
	private ICIPJobsRepository iCIPJobsRepository;
	@Autowired
	private ICIPJobsPartialRepository jobsPartialRepository;
	@Autowired
	private ICIPStreamingServicesRepository streamingServiceRepository;

	/** The alert constants. */
	@Autowired
	private AlertConstants alertConstants;

	/** The log file upload event publisher. */
	@Autowired
	@Qualifier("logFileUploadEventPublisherBean")
	private LogFileUploadEventPublisher.LogFileUploadService logFileUploadEventPublisher;

	/** The annotation service util. */
	@Autowired
	@Lazy
	private ICIPInitializeAnnotationServiceUtil annotationServiceUtil;

	/** The alert event publisher. */
	@Autowired
	@Qualifier("alertEventPublisherBean")
	private AlertEventPublisher.AlertService alertEventPublisher;

	/** The domain. */
	@EssedumProperty("icip.mailserver.domain")
	private String domain;

	/**
	 * Change job property.
	 *
	 * @param job     the job
	 * @param outPath the out path
	 * @return true, if successful
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public boolean changeJobProperty(ICIPJobs job, Path outPath) throws IOException {
		Gson gson = new Gson();
		StringBuilder strBuilder = new StringBuilder(IAIJobConstants.STRING_BUILDER_CAPACITY);
		if (Files.exists(outPath)) {
			List<String> output = ICIPUtils.readFileFromLastLines(outPath, IAIJobConstants.READ_LINE_COUNT);
			output.forEach(line -> {
				strBuilder.append(line);
				strBuilder.append(System.getProperty(IAIJobConstants.LINE_SEPARATOR));
			});
			ICIPStreamingServices pipeline = streamingServiceRepository
					.findByNameAndOrganization(job.getStreamingService(), job.getOrganization());
			String status = getStatus(RuntimeType.valueOf(job.getType().toUpperCase()), strBuilder,
					job.getSubmittedBy(),
					(job.getType().toUpperCase().equals(RuntimeType.AGENTS)
							|| job.getType().toUpperCase().equals(RuntimeType.INTERNAL)
							|| job.getType().toUpperCase().equals(RuntimeType.BINARY)) ? job.getStreamingService()
									: pipeline.getAlias(),
					job.getOrganization(), outPath);

			job = readMetrics(job, outPath, gson);
			job.setJobStatus(status);
			logFileUploadEventPublisher.getApplicationEventPublisher().publishEvent(new LogFileUploadEvent(this,
					outPath.toAbsolutePath().toString(), job.getJobId(), job.getOrganization()));
		} else {
			job.setJobStatus(JobStatus.ERROR.toString());
			job.setLog("Configuration Error : Log File Not Found [Path : " + outPath.toAbsolutePath().toString() + "]");
		}
		job.setFinishtime(new Timestamp(new Date().getTime()));
		job = iCIPJobsRepository.save(job);
		return job.getJobStatus().equals(JobStatus.COMPLETED.toString());
	}

	/**
	 * Read metrics.
	 *
	 * @param job  the job
	 * @param path the path
	 * @param gson the gson
	 * @return the ICIP jobs
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public ICIPJobs readMetrics(ICIPJobs job, Path path, Gson gson) throws IOException {
		List<String> log = ICIPUtils.readFile(path);
		for (int index = 0, limit = log.size(); index < limit; index++) {
			String line = log.get(index);
			job = addMLFlowProperties(line, gson, job);
		}
		return job;
	}

	/**
	 * Adds the ML flow properties.
	 *
	 * @param line the line
	 * @param gson the gson
	 * @param job  the job
	 * @return the ICIP jobs
	 */
	private ICIPJobs addMLFlowProperties(String line, Gson gson, ICIPJobs job) {
		addParams(line, gson, job);
		addMetrics(line, gson, job);
		addImage(line, gson, job);
		addOutput(line, gson, job);
		return iCIPJobsRepository.save(job);
	}

	/**
	 * Adds the params.
	 *
	 * @param line the line
	 * @param gson the gson
	 * @param job  the job
	 */
	private void addParams(String line, Gson gson, ICIPJobs job) {
		String param = "PARAM::";
		int paramstart = line.indexOf(param);
		if (paramstart > -1) {
			String kv = line.substring(paramstart + param.length(), line.length());
			String[] kvarray = kv.split(":", 2);
			String jobmlflowparam = job.getJobparam();
			if (jobmlflowparam != null && !jobmlflowparam.trim().isEmpty()) {
				JsonObject json = gson.fromJson(jobmlflowparam, JsonObject.class);
				json.addProperty(kvarray[0], kvarray[1] != null ? kvarray[1] : "");
				job.setJobparam(gson.toJson(json));
			}
		}
	}

	/**
	 * Adds the params.
	 *
	 * @param line the line
	 * @param gson the gson
	 * @param job  the job
	 */
	private void addImage(String line, Gson gson, ICIPJobs job) {
		String param = "IMAGE::";
		int paramstart = line.indexOf(param);
		if (paramstart > -1) {
			String kv = line.substring(paramstart + param.length(), line.length());
			String[] kvarray = kv.split(":", 2);
			String jobmlflowparam = job.getImage();
			if (jobmlflowparam != null && !jobmlflowparam.trim().isEmpty()) {
				JsonObject json = gson.fromJson(jobmlflowparam, JsonObject.class);
				kvarray[1] = kvarray[1].replaceAll("\\\\", "/");
				json.addProperty(kvarray[0], kvarray[1] != null ? kvarray[1] : "");
				job.setImage(gson.toJson(json));
			}
		}
	}

	/**
	 * Adds the metrics.
	 *
	 * @param line the line
	 * @param gson the gson
	 * @param job  the job
	 */
	private void addMetrics(String line, Gson gson, ICIPJobs job) {
		String metric = "METRIC::";
		int metricstart = line.indexOf(metric);
		if (metricstart > -1) {
			String kv = line.substring(metricstart + metric.length(), line.length());
			String[] kvarray = kv.split(":", 2);
			String jobmlflowmetric = job.getJobmetric();
			if (jobmlflowmetric != null && !jobmlflowmetric.trim().isEmpty()) {
				JsonObject json = gson.fromJson(jobmlflowmetric, JsonObject.class);
				json.addProperty(kvarray[0], kvarray[1] != null ? kvarray[1] : "");
				job.setJobmetric(gson.toJson(json));
			}
		}
	}

	/**
	 * Adds the output.
	 *
	 * @param line the line
	 * @param gson the gson
	 * @param job  the job
	 */

	private void addOutput(String line, Gson gson, ICIPJobs job) {
		String output = "OUTPUT::";
		int outputstart = line.indexOf(output);
		if (outputstart > -1) {
			String kv = line.substring(outputstart + output.length(), line.length());
			String[] kvarray = kv.split(":", 2);
			String jobmlflowoutput = job.getOutput();
			if (jobmlflowoutput != null && !jobmlflowoutput.trim().isEmpty()) {
				JsonObject json = gson.fromJson(jobmlflowoutput, JsonObject.class);
				json.addProperty(kvarray[0], kvarray[1] != null ? kvarray[1] : "");
				job.setOutput(gson.toJson(json));
			}
		}

	}

	/**
	 * Gets the status.
	 *
	 * @param runtime        the runtime
	 * @param stringBuilder2 the string builder 2
	 * @param submittedBy    the submitted by
	 * @param cname          the cname
	 * @param org            the org
	 * @param logFilePath
	 * @return the status
	 * @throws IOException
	 */
	public String getStatus(RuntimeType runtime, StringBuilder stringBuilder2, String submittedBy, String cname,
			String org, Path logFilePath) throws IOException {
		File file = new File(logFilePath.toAbsolutePath().toString());
		// add as a part of springupgrade

//		FileItemFactory factory = new DiskFileItemFactory(16, null);
//		FileItem fileItem = factory.createItem("file", "text/plain", true, file.getName());
//		int bytesRead = 0;
//		byte[] buffer = new byte[8192];
//		FileInputStream fis = null;
//		try {
//			fis = new FileInputStream(file);
//			OutputStream os = fileItem.getOutputStream();
//			while ((bytesRead = fis.read(buffer, 0, 8192)) != -1) {
//				os.write(buffer, 0, bytesRead);
//			}
//			if (os != null) {
//				os.close();
//			}
//			if (fis != null) {
//				fis.close();
//			}
//		} catch (IOException e) {
//			log.error(e.getMessage());
//		} finally {
//			if (fis != null) {
//				safeClose(fis);
//			}
//		}
		MultipartFile attachments = null;

		try (FileInputStream input = new FileInputStream(file)) {
			attachments = new MockMultipartFile("file", file.getName(), "text/plain", input);
		} catch (Exception e) {
			log.error(e.getMessage());
		}

		if (runtime.equals(RuntimeType.BINARY) || runtime.equals(RuntimeType.AGENTS)
				|| runtime.equals(RuntimeType.INTERNAL)) {
			callAlertEvent(false, submittedBy, alertConstants.getPIPELINE_SUCCESS_MAIL_SUBJECT(),
					alertConstants.getPIPELINE_SUCCESS_MAIL_MESSAGE(),
					alertConstants.getPIPELINE_SUCCESS_NOTIFICATION_MESSAGE(), cname, org, attachments);
			return JobStatus.COMPLETED.toString();
		} else {
			if (stringBuilder2.toString().toLowerCase().contains("completed")) {
				callAlertEvent(false, submittedBy,
						alertConstants.getPIPELINE_SUCCESS_MAIL_SUBJECT() + "_" + JobStatus.COMPLETED.toString() + "_"
								+ org + "_" + cname,
						alertConstants.getPIPELINE_SUCCESS_MAIL_MESSAGE(),
						alertConstants.getPIPELINE_SUCCESS_NOTIFICATION_MESSAGE(), cname, org, attachments);
				return JobStatus.COMPLETED.toString();
			}
			callAlertEvent(true, submittedBy,
					alertConstants.getPIPELINE_ERROR_MAIL_SUBJECT() + "_" + JobStatus.ERROR.toString() + "_" + org + "_"
							+ cname,
					alertConstants.getPIPELINE_ERROR_MAIL_MESSAGE(),
					alertConstants.getPIPELINE_ERROR_NOTIFICATION_MESSAGE(), cname, org, attachments);
			return JobStatus.ERROR.toString();
		}
	}

	/**
	 * Call alert event.
	 *
	 * @param isError             the is error
	 * @param submittedBy         the submitted by
	 * @param mailSubject         the mail subject
	 * @param mailMessage         the mail message
	 * @param notificationMessage the notification message
	 * @param cname               the cname
	 * @param org                 the org
	 * @param attachments
	 * @param outPath
	 */
	public void callAlertEvent(boolean isError, String submittedBy, String mailSubject, String mailMessage,
			String notificationMessage, String cname, String org, MultipartFile attachments) {
		AlertEvent alertEvent = new AlertEvent(this,
				isError ? Boolean.parseBoolean(alertConstants.getPIPELINE_ERROR_MAIL_ENABLED())
						: Boolean.parseBoolean(alertConstants.getPIPELINE_SUCCESS_MAIL_ENABLED()),
				String.format(AlertConstants.EMAIL_FORMAT, submittedBy, domain), mailSubject,
				String.format(AlertConstants.MESSAGE_FORMAT, mailMessage, cname, org),
				isError ? Boolean.parseBoolean(alertConstants.getPIPELINE_ERROR_NOTIFICATION_ENABLED())
						: Boolean.parseBoolean(alertConstants.getPIPELINE_SUCCESS_NOTIFICATION_ENABLED()),
				submittedBy, AlertConstants.NOTIFICATION_SEVERITY, AlertConstants.NOTIFICATION_SOURCE,
				String.format(AlertConstants.MESSAGE_FORMAT, notificationMessage, cname, org), false,
				attachments != null ? attachments : null);
		alertEventPublisher.getApplicationEventPublisher().publishEvent(alertEvent);
	}

	/**
	 * Call alert on status.
	 *
	 * @param submittedBy the submitted by
	 * @param cname       the cname
	 * @param org         the org
	 * @param newStatus   the new status
	 */
	public void callAlertOnStatus(String submittedBy, String cname, String org, String newStatus) {
		if (newStatus.equals(JobStatus.COMPLETED.toString())) {
			callAlertEvent(false, submittedBy, alertConstants.getPIPELINE_SUCCESS_MAIL_SUBJECT(),
					alertConstants.getPIPELINE_SUCCESS_MAIL_MESSAGE(),
					alertConstants.getPIPELINE_SUCCESS_NOTIFICATION_MESSAGE(), cname, org, null);
		} else {
			callAlertEvent(true, submittedBy, org + ":" + alertConstants.getPIPELINE_ERROR_MAIL_SUBJECT(),
					alertConstants.getPIPELINE_ERROR_MAIL_MESSAGE(),
					alertConstants.getPIPELINE_ERROR_NOTIFICATION_MESSAGE(), cname, org, null);
		}
	}

	/**
	 * Stop local job.
	 *
	 * @param jobid the jobid
	 * @throws EssedumException the essedum exception
	 */
	public void stopLocalJob(String jobid) throws EssedumException {
		if (icipChainJobsPartialRepository.findByJobId(jobid) != null) {
			ICIPChainJobsPartial groupedjobs = icipChainJobsPartialRepository.findByJobId(jobid);
			String jobmetadata = groupedjobs.getJobmetadata();
			String correlationId = groupedjobs.getCorrelationid();
			JSONObject jsonObj = new JSONObject(jobmetadata);
			String tag = jsonObj.getString("tag");
			List<ICIPJobsPartial> chainJobs = null;
			chainJobs = jobsPartialRepository.findByCorrelationid(correlationId);
			System.out.println(chainJobs);
			chainJobs.stream().parallel().forEach(chainjob -> {
				String[] parts = chainjob.getRuntime().split("-");
				if (chainjob.getRuntime().toLowerCase().startsWith(AICLOUD)
						|| chainjob.getRuntime().toLowerCase().startsWith(REMOTE)
						|| chainjob.getRuntime().toLowerCase().startsWith(EMR)) {
					if (chainjob.getFinishtime() == null) {
						IICIPStopJobService stopJobServices = stopJobService
								.getStopJobService(parts[0].toLowerCase() + "stopjobservice");
						if (stopJobServices != null) {
							try {
								chainjob = stopJobServices.stopPipelineJobs(chainjob);
							} catch (EssedumException e) {
								e.printStackTrace();
							}
						}
					}
				}
			});

		} else {
			ICIPJobsPartial job = jobsPartialRepository.findByJobId(jobid);
			String[] parts = job.getRuntime().split("-");
			if (job.getRuntime().toLowerCase().startsWith(AICLOUD) || job.getRuntime().toLowerCase().startsWith(REMOTE)
					|| job.getRuntime().toLowerCase().startsWith(EMR)) {
				if (job.getFinishtime() == null) {
					IICIPStopJobService stopJobServices = stopJobService
							.getStopJobService(parts[0].toLowerCase() + "stopjobservice");
					if (stopJobServices != null) {
						job = stopJobServices.stopPipelineJobs(job);
					}
				}
			}
		}
	}

	public JSONObject outputArtifacts(String jobid) throws EssedumException {

		ICIPJobsPartial job = jobsPartialRepository.findByJobId(jobid);
		String[] parts = job.getRuntime().split("-");
		JSONObject outputArtifact = new JSONObject();
		if (job.getRuntime().toLowerCase().startsWith(AICLOUD) || job.getRuntime().toLowerCase().startsWith(REMOTE)
				|| job.getRuntime().toLowerCase().startsWith(EMR)) {
			// if (job.getFinishtime() == null) {
			IICIPOutputArtifactsService outputArtifactsServices = outputArtifactsService
					.getOutputArtifactsService(parts[0].toLowerCase() + "outputartifactsservice");
			if (outputArtifactsServices != null) {
				outputArtifact = outputArtifactsServices.findOutputArtifacts(job);
			}
		}
		return outputArtifact;
	}

	public JSONObject outputArtifactsCorelid(String corelid) throws EssedumException {

		ICIPJobsPartial job = jobsPartialRepository.findByCorelId(corelid);
		String[] parts = job.getRuntime().split("-");
		JSONObject outputArtifact = new JSONObject();
		if (job.getRuntime().toLowerCase().startsWith(AICLOUD) || job.getRuntime().toLowerCase().startsWith(REMOTE)
				|| job.getRuntime().toLowerCase().startsWith(EMR)) {
			// if (job.getFinishtime() == null) {
			IICIPOutputArtifactsService outputArtifactsServices = outputArtifactsService
					.getOutputArtifactsService(parts[0].toLowerCase() + "outputartifactsservice");
			if (outputArtifactsServices != null) {
				outputArtifact = outputArtifactsServices.findOutputArtifacts(job);
			}
		}
		return outputArtifact;
	}

	public static void safeClose(FileInputStream fis) {
		if (fis != null) {
			try {
				fis.close();
			} catch (IOException e) {
				log.error(e.getMessage());
			}
		}
	}
}
