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

package com.infosys.icets.icip.icipwebeditor.jobmodel.service;

import java.io.FileOutputStream;
import java.nio.file.*;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import org.apache.commons.io.input.Tailer;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonSyntaxException;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;
import com.infosys.icets.ai.comm.lib.util.annotation.service.ConstantsService;
import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;
import com.infosys.icets.icip.dataset.service.IICIPDatasourcePluginsService;
import com.infosys.icets.icip.dataset.service.IICIPDatasourceService;
import com.infosys.icets.icip.icipwebeditor.constants.IAIJobConstants;
import com.infosys.icets.icip.icipwebeditor.constants.LoggerConstants;
import com.infosys.icets.icip.icipwebeditor.event.model.LogFileDownloadEvent;
import com.infosys.icets.icip.icipwebeditor.event.publisher.LogFileDownloadEventPublisher;
import com.infosys.icets.icip.icipwebeditor.fileserver.service.impl.FileServerService;
import com.infosys.icets.icip.icipwebeditor.job.constants.JobConstants;
import com.infosys.icets.icip.icipwebeditor.job.enums.JobMetadata;
import com.infosys.icets.icip.icipwebeditor.job.enums.JobStatus;
import com.infosys.icets.icip.icipwebeditor.job.model.ICIPInternalJobs.MetaData;
import com.infosys.icets.icip.icipwebeditor.job.service.util.ICIPInitializeAnnotationServiceUtil;
import com.infosys.icets.icip.icipwebeditor.model.ICIPJobs;
import com.infosys.icets.icip.icipwebeditor.model.ICIPJobsPartial;
import com.infosys.icets.icip.icipwebeditor.model.dto.IHiddenJobs;
import com.infosys.icets.icip.icipwebeditor.model.dto.IJobLog;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPJobsPartialRepository;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPJobsRepository;
import com.infosys.icets.icip.icipwebeditor.service.IICIPJobRuntimeLoggerService;
import com.infosys.icets.icip.icipwebeditor.service.IICIPJobsService;
import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPRuntimeLoggerService;

import lombok.extern.log4j.Log4j2;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPJobsService.
 *
 * @author icets
 */
@Log4j2
@Service
@Transactional
@RefreshScope
public class ICIPJobsService implements IICIPJobsService {

	/** The Constant REMOTE. */
	private static final String REMOTE = "remote";

	private static final String EMR = "emr";

	private static final String AICLOUD = "aicloud";

	/** The Constant SUBMITTED_ON. */
	private static final String SUBMITTED_ON = "submittedOn";

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPJobsService.class);

	/** The i CIP jobs repository. */
	@Autowired
	private ICIPJobsRepository iCIPJobsRepository;

	/** The folder th. */
	@LeapProperty("icip.jobLogFileDir")
	private String folderPath;

	/** The spark host. */
	@LeapProperty("icip.sparkServer.host")
	private String sparkHost;

	/** The spark port. */
	@LeapProperty("icip.sparkServer.port")
	private String sparkPort;

	/** The days string. */
	@LeapProperty("icip.cleanup.deletion.days")
	private String daysString;

	/** The jobs partial repository. */
	@Autowired
	private ICIPJobsPartialRepository jobsPartialRepository;
	@Autowired
	private IICIPDatasourceService dsService;
	/** The file server service. */
	@Autowired
	private FileServerService fileServerService;

	/** The log file download event publisher. */
	@Autowired
	@Qualifier("logFileDownloadEventPublisherBean")
	private LogFileDownloadEventPublisher.LogFileDownloadService logFileDownloadEventPublisher;

	@Autowired
	private ConstantsService constantService;

	@Autowired
	private ICIPRuntimeLoggerService jobRuntimeLoggerService;

	/**
	 * Instantiates a new ICIP jobs service.
	 *
	 * @param iCIPJobsRepository the i CIP jobs repository
	 */
//	public ICIPJobsService(ICIPJobsRepository iCIPJobsRepository) {
//		super();
//		this.iCIPJobsRepository = iCIPJobsRepository;
//	}

	/**
	 * Save.
	 *
	 * @param iCIPJobs the i CIP jobs
	 * @return the ICIP jobs
	 */
	public ICIPJobs save(ICIPJobs iCIPJobs) {
		logger.info("Saving job by Id {}", iCIPJobs.getJobId());
		return iCIPJobsRepository.save(iCIPJobs);
	}

	/**
	 * Rename project.
	 *
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @return true, if successful
	 */
	@Override
	public boolean renameProject(String fromProjectId, String toProjectId) {
		List<ICIPJobsPartial> dsets = jobsPartialRepository.findByOrganization(fromProjectId);
		dsets.stream().forEach(ds -> {
			Optional<ICIPJobs> optionalJob = iCIPJobsRepository.findById(ds.getId());
			if (optionalJob.isPresent()) {
				ICIPJobs job = optionalJob.get();
				job.setOrganization(toProjectId);
				iCIPJobsRepository.save(job);
			}
		});
		return true;
	}

	/**
	 * Gets the spark log.
	 *
	 * @param jobId the job id
	 * @return the spark log
	 */
	@Override
	public String getSparkLog(String jobId) {
		final String uri = "http://" + sparkHost + ":" + sparkPort + "/jobs/" + jobId;
		return new org.springframework.web.client.RestTemplate().getForObject(uri, String.class);
	}

	/**
	 * Gets the jobs by service.
	 *
	 * @param servicename the servicename
	 * @param page        the page
	 * @param size        the size
	 * @param org         the org
	 * @return the jobs by service
	 */
	@Override
	public List<ICIPJobs> getJobsByService(String servicename, int page, int size, String org) {
		Pageable paginate = PageRequest.of(page, size, Sort.by(SUBMITTED_ON).descending());
		List<ICIPJobsPartial> jobs = jobsPartialRepository.findByStreamingServiceAndOrganization(servicename, org,
				paginate);
		List<ICIPJobs> listJobs = new ArrayList<>();
		jobs.forEach(j -> {
			Optional<ICIPJobs> optionalJob = iCIPJobsRepository.findById(j.getId());
			if (optionalJob.isPresent()) {
				ICIPJobs job = optionalJob.get();
//              if (job.getRuntime().equalsIgnoreCase(REMOTE)) {
//                  String result = this.getSparkLog(job.getJobId());
//                  if (result != null) {
//                      JsonObject resultObj = new Gson().fromJson(result, JsonObject.class);
//                      job.setJobStatus(resultObj.get("status").getAsString());
//                  }
//              }
				listJobs.add(job);
			}
		});
		return listJobs;
	}

	/**
	 * Find by job id.
	 *
	 * @param jobId the job id
	 * @return the ICIP jobs
	 */
	@Override
	public ICIPJobs findByJobId(String jobId) {
		logger.info("Fetching job by Id {}", jobId);
		return iCIPJobsRepository.findByJobId(jobId);
	}

	/**
	 * Find by job id with log.
	 *
	 * @param jobId  the job id
	 * @param offset the offset
	 * @param lineno the lineno
	 * @param org    the org
	 * @param status the status
	 * @return the ICIP jobs
	 * @throws IOException
	 */
	@Override
	public ICIPJobs findByJobIdWithLog(String jobId, int offset, int lineno, String org, String status)
			throws IOException {
		logger.info("Fetching ICIPJobs by JobId {}", jobId);

		String constantLimit = constantService.findByKeys("icip.log.offset", org);
		long limit;
		if (!constantLimit.trim().isEmpty()) {
			limit = Long.parseLong(constantLimit);
		} else {
			limit = 50000;
		}
		String log = "";
		String log1 = "";

		ICIPJobsPartial job = jobsPartialRepository.findByJobIdBuffered(jobId,
				(offset * ICIPUtils.LETTER_IN_A_SENTENCE * limit) + 1, ICIPUtils.LETTER_IN_A_SENTENCE * limit);
		String originalHashParams = job.getHashparams();
		logger.info("Fetching ICIPJobs originalHashParams" + originalHashParams);
//		org.json.JSONObject jobMetaData = new org.json.JSONObject(job.getJobmetadata());
//		ICIPDatasource dsObject = dsService.getDatasource(jobMetaData.getString("datasourceName"),
//				job.getOrganization());
//		org.json.JSONObject connDetails = new org.json.JSONObject(dsObject.getConnectionDetails());
		org.json.JSONObject logs = null;
		Path path = null;

		try {

			MetaData metadata = new Gson().fromJson(job.getJobmetadata(), MetaData.class);
			if (metadata.getTag().equals(JobMetadata.CHAIN.toString())) {
				path = Paths.get(folderPath, IAIJobConstants.LOGPATH, IAIJobConstants.CHAINLOGPATH,
						job.getCorrelationid(), String.format("%s%s", job.getJobId(), IAIJobConstants.OUTLOG));
			} else {
				path = Paths.get(folderPath, String.format(LoggerConstants.STRING_DECIMAL_STRING,
						IAIJobConstants.PIPELINELOGPATH, job.getId(), IAIJobConstants.OUTLOG));
			}

			logger.info("Fetching ICIPJobs Path" + path);
			if (job.getRuntime().startsWith("Remote") && status.equalsIgnoreCase(JobStatus.RUNNING.toString())) {
				org.json.JSONObject jobMetaData = new org.json.JSONObject(job.getJobmetadata());
				ICIPDatasource dsObject = dsService.getDatasource(jobMetaData.getString("datasourceName"),
						job.getOrganization());

				org.json.JSONObject connDetails = new org.json.JSONObject(dsObject.getConnectionDetails());

				org.json.JSONObject res = getLog(jobMetaData.getString("taskId"), connDetails);
				logs = new org.json.JSONObject(res.get("logs").toString());
				FileOutputStream fs = new FileOutputStream(path.toString());
				fs.write(logs.toString().getBytes());
				fs.close();

				ICIPJobs result = job.toICIPJobs(logs.toString());
				logger.info("Fetching ICIPJobs result" + result);
				if (result.getHashparams().equals(originalHashParams)) {
					result.setHashparams("");
				}
				return result;
			}
			if (Files.exists(path)) {
				// Here, hashparams is used as placeholder for first line of log
				// organization is used as placeholder for last line of log
				// jobmetadata is used as placeholder for [already] read line count

				ICIPUtils.BufferResult bufferResult = ICIPUtils.bufferedReadFileAsStringBuilder(path, offset, limit);
				logger.info("Fetching ICIPJobs bufferResult.getFirstLine()" + bufferResult.getFirstLine());
				job.setHashparams(bufferResult.getFirstLine());
				log = bufferResult.getStringBuilder().toString();
				logger.info("Fetching ICIPJobs logs" + log);
				List<String> loglist = ICIPUtils.readFile(path);
				String concatenatedString = "";
				for (String word : loglist) {
					if (containsJsonString(word)) {
						word = removeCredentialAndEnvironmentKey(word);
					}
					concatenatedString += word + '\n';
				}
				log1 = concatenatedString;
				if (log1.length() >= log.length()) {
					log = log1;
				}

//              if(log.equals("")) {
//                  List<String> loglist = ICIPUtils.readFile(path);
//                  String concatenatedString = "";
//                  for(String word: loglist){
//                      concatenatedString += word+'\n';
//                  }
//                  log = concatenatedString;
//              }
				logger.info("Fetching ICIPJobs logs" + log);
				job.setJobmetadata(String.valueOf(bufferResult.getLine()));
				job.setOrganization(bufferResult.getLastLine());

			} else {
				if (!status.equalsIgnoreCase(JobStatus.RUNNING.toString())) {
					try {
						String downloadMessage = "Downloading log file from fileserver, please wait or come back again in some time..."
								+ System.lineSeparator();
						if (!JobConstants.PROGRESS_MAP.containsKey(job.getJobId())) {
							String countStr = fileServerService.getLastIndex(job.getJobId(), job.getOrganization());
							int count = Integer.parseInt(countStr);
							if (count >= offset) {
								logFileDownloadEventPublisher.getApplicationEventPublisher()
										.publishEvent(new LogFileDownloadEvent(this, path.toAbsolutePath().toString(),
												count, job.getJobId(), job.getOrganization()));
							}
						}
						downloadMessage += "Progress : [" + JobConstants.PROGRESS_MAP.get(job.getJobId()) + "%]"
								+ System.lineSeparator();
						job.setHashparams(downloadMessage);
						job.setOrganization(downloadMessage);
					} catch (Exception ex) {
						logger.error("Unable to fetch logs from fileserver : {}", ex.getMessage());
					}
				} else {
					logger.error("File Not Found");
				}
			}
		} catch (Exception ex) {
			logger.error("File Not Exists : {}", ex.getMessage());
		}
		ICIPJobs result = job.toICIPJobs(log);

		if (result.getLog().equals("")) {
			log = "Unable to write logs at this time. Please try again";
			result.setLog(log);
		}
		String jobStatus = result.getJobStatus();

		logger.info("Fetching ICIPJobs result" + result);
		if (result.getHashparams().equals(originalHashParams)) {
			result.setHashparams("");
		}
		return result;
	}

	private static boolean containsJsonString(String str) {
		try {
			JsonParser.parseString(str);
			return true;
		} catch (JsonSyntaxException e) {
			// Check for JSON substrings
			int startIndex = str.indexOf("{");
			while (startIndex != -1) {
				int endIndex = str.lastIndexOf("}");
				if (endIndex != -1 && endIndex > startIndex) {
					String potentialJson = str.substring(startIndex, endIndex + 1);
					try {
						JsonParser.parseString(potentialJson);
						return true;
					} catch (JsonSyntaxException ex) {
						logger.error("JsonSyntaxException occurred while replacing JSON string", ex);
					}
					startIndex = str.indexOf("{", endIndex);
				} else {
					break;
				}
			}
			return false;
		}
	}

	private static String removeCredentialAndEnvironmentKey(String str) {
		try {
			JsonElement jsonElement = JsonParser.parseString(str);
			if (jsonElement.isJsonObject()) {
				JsonObject jsonObject = jsonElement.getAsJsonObject();
				if (jsonObject.has("credentials")) {
					jsonObject.remove("credentials");
				}
				if (jsonObject.has("environment")) {
					jsonObject.remove("environment");
				}
				return jsonObject.toString();
			}
		} catch (JsonSyntaxException e) {
			// Check for JSON substrings
			int startIndex = str.indexOf("{");
			while (startIndex != -1) {
				int endIndex = str.lastIndexOf("}");
				if (endIndex != -1 && endIndex > startIndex) {
					String potentialJson = str.substring(startIndex, endIndex + 1);
					try {
						JsonElement jsonElement = JsonParser.parseString(potentialJson);
						if (jsonElement.isJsonObject()) {
							JsonObject jsonObject = jsonElement.getAsJsonObject();
							if (jsonObject.has("credentials")) {
								jsonObject.remove("credentials");
							}
							if (jsonObject.has("environment")) {
								jsonObject.remove("environment");
							}
							str = str.replace(potentialJson, jsonObject.toString());
						}
					} catch (JsonSyntaxException ex) {
						logger.error("JsonSyntaxException occurred while replacing JSON string", ex);
					}
					startIndex = str.indexOf("{", endIndex);
				} else {
					break;
				}
			}
		}
		return str;
	}

	public TrustManager[] getTrustAllCerts() {
		TrustManager[] trustAllCerts = new TrustManager[] { new X509TrustManager() {
			@Override
			public void checkClientTrusted(java.security.cert.X509Certificate[] chain, String authType) {
			}

			@Override
			public void checkServerTrusted(java.security.cert.X509Certificate[] chain, String authType) {
			}

			@Override
			public java.security.cert.X509Certificate[] getAcceptedIssuers() {
				return new java.security.cert.X509Certificate[] {};
			}
		} };
		return trustAllCerts;
	}

	public SSLContext getSslContext(TrustManager[] trustAllCerts) {
		SSLContext sslContext = null;
		try {
			sslContext = SSLContext.getInstance("TLSv1.2");

			sslContext.init(null, trustAllCerts, new java.security.SecureRandom());
		} catch (KeyManagementException | NoSuchAlgorithmException e) {
			log.error(e.getMessage(), e);
		}
		return sslContext;
	}

	private JSONObject getLog(String taskId, JSONObject connDetails) throws LeapException {
		// TODO Auto-generated method stub
		logger.info("Inside getLog");
		String url = connDetails.get("Url").toString() + "/" + taskId + "/getLog";
		logger.info("getLog URL " + url);
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);
		OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
		newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
		newBuilder.hostnameVerifier((hostname, session) -> true);
		OkHttpClient client = newBuilder.build();
		Request requestokHttp = new Request.Builder().url(url).addHeader("accept", "application/json").build();
		logger.info("getLog request " + requestokHttp.toString());
		Response response = null;
		try {
			response = client.newCall(requestokHttp).execute();
			logger.info("getLog response " + response);
			logger.info("getLog response code " + response.code());
			logger.info("getLog response body " + response.body());
			if (response.code() == 200) {
				JSONObject responsebody = new JSONObject(response.body().string());

				return responsebody;
			} else if (response.code() == 400) {
				throw new LeapException("Remote get task Log for taskid " + taskId);
			} else {
				throw new LeapException("Remote get task log for  " + taskId + " Response Code " + response.code()
						+ "Response Body" + response.body());
			}

		} catch (Exception e) {
			throw new LeapException("Error in getLog:" + e.getMessage() + "Task Id is:" + taskId);

		}
		// return null;
	}

	@Override
	public ICIPJobs findByCorelIdWithLog(String corelid, int offset, int lineno, String org, String status)
			throws IOException {
		logger.info("Fetching ICIPJobs by corelid {}", corelid);
		String constantLimit = constantService.findByKeys("icip.log.offset", org);
		long limit;
		if (!constantLimit.trim().isEmpty()) {
			limit = Long.parseLong(constantLimit);
		} else {
			limit = 50000;
		}
		String log = "";
		String log1 = "";

		ICIPJobsPartial job = jobsPartialRepository.findByCorelIdBuffered(corelid,
				(offset * ICIPUtils.LETTER_IN_A_SENTENCE * limit) + 1, ICIPUtils.LETTER_IN_A_SENTENCE * limit);
		String originalHashParams = job.getHashparams();
		logger.info("Fetching ICIPJobs originalHashParams" + originalHashParams);
		try {
			Path path;
			MetaData metadata = new Gson().fromJson(job.getJobmetadata(), MetaData.class);
			if (metadata.getTag().equals(JobMetadata.CHAIN.toString())) {
				path = Paths.get(folderPath, IAIJobConstants.LOGPATH, IAIJobConstants.CHAINLOGPATH,
						job.getCorrelationid(), String.format("%s%s", job.getCorrelationid(), IAIJobConstants.OUTLOG));
			} else {
				path = Paths.get(folderPath, String.format(LoggerConstants.STRING_DECIMAL_STRING,
						IAIJobConstants.PIPELINELOGPATH, job.getId(), IAIJobConstants.OUTLOG));
			}
			logger.info("Fetching ICIPJobs Path" + path);
			if (Files.exists(path)) {
				// Here, hashparams is used as placeholder for first line of log
				// organization is used as placeholder for last line of log
				// jobmetadata is used as placeholder for [already] read line count

				ICIPUtils.BufferResult bufferResult = ICIPUtils.bufferedReadFileAsStringBuilder(path, offset, limit);
				logger.info("Fetching ICIPJobs bufferResult.getFirstLine()" + bufferResult.getFirstLine());
				job.setHashparams(bufferResult.getFirstLine());
				log = bufferResult.getStringBuilder().toString();
				logger.info("Fetching ICIPJobs logs" + log);

				List<String> loglist = ICIPUtils.readFile(path);
				String concatenatedString = "";
				for (String word : loglist) {
					concatenatedString += word + '\n';
				}
				log1 = concatenatedString;
				if (log1.length() >= log.length()) {
					log = log1;
				}

//              if(log.equals("")) {
//                  List<String> loglist = ICIPUtils.readFile(path);
//                  String concatenatedString = "";
//                  for(String word: loglist){
//                      concatenatedString += word+'\n';
//                  }
//                  log = concatenatedString;
//              }
				logger.info("Fetching ICIPJobs logs" + log);
				job.setJobmetadata(String.valueOf(bufferResult.getLine()));
				job.setOrganization(bufferResult.getLastLine());
			} else {
				if (!status.equalsIgnoreCase(JobStatus.RUNNING.toString())) {
					try {
						String downloadMessage = "Downloading log file from fileserver, please wait or come back again in some time..."
								+ System.lineSeparator();
						if (!JobConstants.PROGRESS_MAP.containsKey(job.getCorrelationid())) {
							String countStr = fileServerService.getLastIndex(job.getCorrelationid(),
									job.getOrganization());
							int count = Integer.parseInt(countStr);
							if (count >= offset) {
								logFileDownloadEventPublisher.getApplicationEventPublisher()
										.publishEvent(new LogFileDownloadEvent(this, path.toAbsolutePath().toString(),
												count, job.getCorrelationid(), job.getOrganization()));
							}
						}
						downloadMessage += "Progress : [" + JobConstants.PROGRESS_MAP.get(job.getCorrelationid()) + "%]"
								+ System.lineSeparator();
						job.setHashparams(downloadMessage);
						job.setOrganization(downloadMessage);
					} catch (Exception ex) {
						logger.error("Unable to fetch logs from fileserver : {}", ex.getMessage());
					}
				} else {
					logger.error("File Not Found");
				}
			}
		} catch (Exception ex) {
			logger.error("File Not Exists : {}", ex.getMessage());
		}
		ICIPJobs result = job.toICIPJobs(log);
		logger.info("Fetching ICIPJobs result" + result);
		if (result.getHashparams().equals(originalHashParams)) {
			result.setHashparams("");
		}
		return result;
	}

	/**
	 * Gets the all jobs.
	 *
	 * @param org  the org
	 * @param page the page
	 * @param size the size
	 * @return the all jobs
	 */
	@Override
	public List<ICIPJobs> getAllJobs(String org, int page, int size) {
		logger.info("Getting jobs in Page {}", page);
		Pageable paginate = PageRequest.of(page, size, Sort.by(SUBMITTED_ON).descending());
		Page<ICIPJobs> jobs = iCIPJobsRepository.findByOrganization(org, paginate);
		List<ICIPJobs> listJobs = new ArrayList<>();
		jobs.forEach(j -> {
			if (j.getRuntime().equalsIgnoreCase(REMOTE)) {
				// TO-DO remote job implementation
			}
			listJobs.add(j);
		});
		return listJobs;
	}

	/**
	 * Count by streaming service and organization.
	 *
	 * @param streamingService the streaming service
	 * @param org              the org
	 * @return the long
	 */
	@Override
	public Long countByStreamingServiceAndOrganization(String streamingService, String org) {
		return iCIPJobsRepository.countByStreamingServiceAndOrganization(streamingService, org);
	}

	/**
	 * Count by organization.
	 *
	 * @param org the org
	 * @return the long
	 */
	@Override
	public Long countByOrganization(String org) {
		return iCIPJobsRepository.countByOrganization(org);
	}

	/**
	 * Copy.
	 *
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @return true, if successful
	 */
	@Override
	public boolean copy(String fromProjectId, String toProjectId) {
		logger.info("Fetching jobs for Entity {}", fromProjectId);
		List<ICIPJobsPartial> icGrps = jobsPartialRepository.findByOrganization(fromProjectId);
		List<ICIPJobs> toGrps = icGrps.parallelStream().map(grp -> {
			Optional<ICIPJobs> optionalJob = iCIPJobsRepository.findById(grp.getId());
			if (optionalJob.isPresent()) {
				ICIPJobs job = optionalJob.get();
				job.setId(null);
				job.setOrganization(toProjectId);
				return job;
			}
			return null;
		}).collect(Collectors.toList());
		toGrps.stream().forEach(grp -> iCIPJobsRepository.save(grp));
		return true;
	}

	/**
	 * Gets the all common jobs.
	 *
	 * @param org          the org
	 * @param page         the page
	 * @param size         the size
	 * @param filtercolumn the filtercolumn
	 * @param filtervalue  the filtervalue
	 * @param filterdate   the filterdate
	 * @param sortcolumn   the sortcolumn
	 * @param direction    the direction
	 * @return the all common jobs
	 */
	@Override
	public List<IJobLog> getAllCommonJobs(String org, int page, int size, String filtercolumn, String filtervalue,
			String filterdate, String tz, String sortcolumn, String direction) {
		logger.info("Fetching common jobs list");
		return iCIPJobsRepository.getAllCommonJobsnew(org, filtercolumn, filtervalue, filterdate,
				PageRequest.of(page, size, direction.equalsIgnoreCase("DESC") ? Sort.by(sortcolumn).descending()
						: Sort.by(sortcolumn).ascending()));
	}

	/**
	 * Gets the common jobs len.
	 *
	 * @param org          the org
	 * @param filtercolumn the filtercolumn
	 * @param filtervalue  the filtervalue
	 * @param filterdate   the filterdate
	 * @return the common jobs len
	 */
	@Override
	public Long getCommonJobsLen(String org, String filtercolumn, String filtervalue, String filterdate, String tz) {
		logger.info("Fetching common jobs length");
		return iCIPJobsRepository.getCommonJobsLenNew(org, filtercolumn, filtervalue, filterdate);
	}

	/**
	 * Find by job name and organization by submission.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP jobs
	 */
	@Override
	public ICIPJobs findByJobNameAndOrganizationBySubmission(String name, String org) {
		return iCIPJobsRepository.findByJobNameAndOrganizationBySubmission(name, org);
	}

	/**
	 * Find by job name and organization by last submission.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP jobs
	 */
	@Override
	public ICIPJobs findByJobNameAndOrganizationByLastSubmission(String name, String org) {
		return iCIPJobsRepository.findByJobNameAndOrganizationByLastSubmission(name, org);
	}

	/**
	 * Gets the jobs by service.
	 *
	 * @param servicename the servicename
	 * @param page        the page
	 * @param size        the size
	 * @param org         the org
	 * @return the jobs by service
	 */
	@Override
	public List<ICIPJobsPartial> getJobsPartialByService(String servicename, int page, int size, String org) {
		Pageable paginate = PageRequest.of(page, size, Sort.by(SUBMITTED_ON).descending());
		List<ICIPJobsPartial> jobs = jobsPartialRepository.findByStreamingServiceAndOrganization(servicename, org,
				paginate);
		List<ICIPJobsPartial> listJobs = new ArrayList<>();
		Gson gson = new Gson();
		jobs.stream().parallel().forEach(j -> {
			String[] parts = j.getRuntime().split("-");
			// if (j.getRuntime().equalsIgnoreCase(AICLOUD) ||
			// j.getRuntime().equalsIgnoreCase(REMOTE) ||
			// j.getRuntime().equalsIgnoreCase(EMR)) {
			if (j.getRuntime().toLowerCase().startsWith(AICLOUD) || j.getRuntime().toLowerCase().startsWith(REMOTE)
					|| j.getRuntime().toLowerCase().startsWith(EMR)) {
				if (j.getFinishtime() == null) {
					IICIPJobRuntimeLoggerService runtimeloggerService = jobRuntimeLoggerService
							.getJobRuntimeLoggerService(parts[0].toLowerCase() + "loggerservice");
					if (runtimeloggerService != null)
						j = runtimeloggerService.updateAndLogJob(j);
				}
			}
			listJobs.add(j);
		});
		return listJobs;
	}

	/**
	 * Gets the all jobs.
	 *
	 * @param org  the org
	 * @param page the page
	 * @param size the size
	 * @return the all jobs
	 */
	@Override
	public List<ICIPJobsPartial> getAllJobsPartial(String org, int page, int size) {
		logger.info("Getting jobs in Page {}", page);
		Pageable paginate = PageRequest.of(page, size, Sort.by(SUBMITTED_ON).descending());
		Page<ICIPJobsPartial> jobs = jobsPartialRepository.findByOrganization(org, paginate);
		List<ICIPJobsPartial> listJobs = new ArrayList<>();
		jobs.stream().parallel().forEach(j -> {
			if (j.getRuntime().equalsIgnoreCase(AICLOUD)) {
				if (j.getFinishtime() == null) {
					j = jobRuntimeLoggerService.getJobRuntimeLoggerService(j.getRuntime() + "loggerservice")
							.updateAndLogJob(j);
				}
			}
			listJobs.add(j);
		});
		return listJobs;
	}

	/**
	 * Find by corelid.
	 *
	 * @param corelid the corelid
	 * @return the ICIP jobs
	 */
	@Override
	public List<ICIPJobsPartial> findByCorelid(String corelid) {
		List<ICIPJobsPartial> jobs = jobsPartialRepository.findByCorrelationid(corelid);
		List<ICIPJobsPartial> listJobs = new ArrayList<>();
		Gson gson = new Gson();
		jobs.stream().parallel().forEach(j -> {
			String[] parts = j.getRuntime().split("-");
			// if (j.getRuntime().equalsIgnoreCase(AICLOUD) ||
			// j.getRuntime().equalsIgnoreCase(REMOTE) ||
			// j.getRuntime().equalsIgnoreCase(EMR)) {
			if (j.getRuntime().toLowerCase().startsWith(AICLOUD) || j.getRuntime().toLowerCase().startsWith(REMOTE)
					|| j.getRuntime().toLowerCase().startsWith(EMR)) {
				if (j.getFinishtime() == null) {
					IICIPJobRuntimeLoggerService runtimeloggerService = jobRuntimeLoggerService
							.getJobRuntimeLoggerService(parts[0].toLowerCase() + "loggerservice");
					if (runtimeloggerService != null)
						j = runtimeloggerService.updateAndLogJob(j);
				}
			}
			listJobs.add(j);
		});
		return listJobs;
	}

	/**
	 * Find by hashparams.
	 *
	 * @param hashparams the hashparams
	 * @return the ICIP jobs
	 */
	@Override
	public ICIPJobs findByHashparams(String hashparams) {
		return iCIPJobsRepository.findByHashparams(hashparams);
	}

	/**
	 * Boot cleanup.
	 */
	@Override
	public void bootCleanup() {
		List<ICIPJobsPartial> list = jobsPartialRepository.findByJobStatus(JobStatus.RUNNING.toString());
		list.parallelStream().forEach(job -> {
			Optional<ICIPJobs> optionalJob = iCIPJobsRepository.findById(job.getId());
			if (optionalJob.isPresent()) {
				ICIPJobs icipjob = optionalJob.get();
				icipjob = icipjob.updateJob(JobStatus.CANCELLED.toString(),
						System.getProperty(IAIJobConstants.LINE_SEPARATOR) + "Application restarted...");
				iCIPJobsRepository.save(icipjob);
			}
		});
	}

	/**
	 * Gets the all hidden logs.
	 *
	 * @param org the org
	 * @return the all hidden logs
	 */
	@Override
	public List<IHiddenJobs> getAllHiddenLogs(String org) {
		logger.info("Fetching common jobs list");
		return iCIPJobsRepository.getAllHiddenLogs(org);
	}

	/**
	 * Delete older data.
	 *
	 * @throws LeapException the leap exception
	 */
	@Override
	@Transactional
	public void deleteOlderData() throws LeapException {
		try {
			int days = Integer.parseInt(daysString);
			logger.info("Deleting data older than {} day(s)", days);
			iCIPJobsRepository.deleteOlderData(days);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			throw new LeapException(ex.getMessage());
		}
	}

	/**
	 * Gets the jobs status.
	 *
	 * @param jobid the jobid
	 * @return the jobs status
	 */
	@Override
	public String getJobStatus(String jobid) {
		logger.info("Fetching job status");
//      return iCIPJobsRepository.getJobStatus(jobid);
		ICIPJobsPartial job = jobsPartialRepository.findByJobId(jobid);
		ICIPJobsPartial updatedJob = new ICIPJobsPartial();
		String jobStatus = iCIPJobsRepository.getJobStatus(jobid);
		String[] parts = job.getRuntime().split("-");
		if (job.getRuntime().toLowerCase().startsWith(AICLOUD) || job.getRuntime().toLowerCase().startsWith(REMOTE)
				|| job.getRuntime().toLowerCase().startsWith(EMR)) {
			if (job.getFinishtime() == null) {
				IICIPJobRuntimeLoggerService runtimeloggerService = jobRuntimeLoggerService
						.getJobRuntimeLoggerService(parts[0].toLowerCase() + "loggerservice");
				if (runtimeloggerService != null) {
					updatedJob = runtimeloggerService.updateAndLogJob(job);
				}
				jobStatus = updatedJob.getJobStatus();
			} else {

				jobStatus = iCIPJobsRepository.getJobStatus(jobid);
			}
		}

		return jobStatus;
	}

	/**
	 * Gets the event status.
	 *
	 * @param corelid the correlationid
	 * @return the event status
	 */

	@Override
	public String getEventStatus(String corelid) {
		logger.info("Fetching event status");
		// return iCIPJobsRepository.getEventStatus(corelid);
		ICIPJobsPartial job = jobsPartialRepository.findByCorelId(corelid);
		ICIPJobsPartial updatedJob = new ICIPJobsPartial();
		String jobStatus = iCIPJobsRepository.getEventStatus(corelid);
		String[] parts = job.getRuntime().split("-");
		if (job.getRuntime().toLowerCase().startsWith(AICLOUD) || job.getRuntime().toLowerCase().startsWith(REMOTE)
				|| job.getRuntime().toLowerCase().startsWith(EMR)) {
			if (job.getFinishtime() == null) {
				IICIPJobRuntimeLoggerService runtimeloggerService = jobRuntimeLoggerService
						.getJobRuntimeLoggerService(parts[0].toLowerCase() + "loggerservice");
				if (runtimeloggerService != null) {
					updatedJob = runtimeloggerService.updateAndLogJob(job);
				}
				jobStatus = updatedJob.getJobStatus();
			} else {

				jobStatus = iCIPJobsRepository.getEventStatus(corelid);
			}
		}

		return jobStatus;

	}

	@Override
	public String getCsvData(String colsToDownload, String org) {
		// TODO Auto-generated method stub
		String[] selectedColumns = colsToDownload.split(",");
		Map<String, String> mapofColumn = new HashMap<>();

		mapofColumn.put("Job Id", "jobid");
		mapofColumn.put("Job Name", "alias");
		mapofColumn.put("Used by", "submittedby");
		mapofColumn.put("Submitted on", "submittedon");
		mapofColumn.put("Finished on", "finishtime");
		mapofColumn.put("Runtime", "runtime");
		mapofColumn.put("Status", "jobstatus");
		String stringToReturn = "";
		List<String> selectedColumnsName = new ArrayList<>();
		for (String column : selectedColumns) {
			stringToReturn += mapofColumn.get(column) + ",";
			selectedColumnsName.add(mapofColumn.get(column));
		}
		stringToReturn = stringToReturn.substring(0, stringToReturn.length() - 1) + "\n";

		List<IJobLog> iJobLogstoDownload = iCIPJobsRepository.getCsvBySelectedColumnNames(org, "", "", "");
		for (int index = 0; index < iJobLogstoDownload.size(); ++index) {
			try {
				for (String column : selectedColumnsName) {

					String columnValue = "";
					switch (column) {
					case "jobid":
						try {
							columnValue = iJobLogstoDownload.get(index).getJobid();
						} catch (Exception e) {
							columnValue = "";
						}
						break;
					case "alias":
						try {
							columnValue = iJobLogstoDownload.get(index).getAlias();
							if (columnValue.contains(",")) {
								columnValue = columnValue.split(",")[1];
							}
						} catch (Exception e) {
							columnValue = "";
						}
						break;
					case "submittedby":
						try {
							columnValue = iJobLogstoDownload.get(index).getSubmittedby();
						} catch (Exception e) {
							columnValue = "";
						}
						break;
					case "submittedon":
						try {
							columnValue = iJobLogstoDownload.get(index).getSubmittedon().toString();
							columnValue = columnValue.substring(0, columnValue.length() - 2);
						} catch (Exception e) {
							columnValue = "";
						}
						break;
					case "finishtime":
						try {
							columnValue = iJobLogstoDownload.get(index).getFinishtime().toString();
							columnValue = columnValue.substring(0, columnValue.length() - 2);
						} catch (Exception e) {
							columnValue = "";
						}
						break;
					case "runtime":
						try {
							columnValue = iJobLogstoDownload.get(index).getRuntime();

						} catch (Exception e) {
							columnValue = "";
						}
						break;
					case "jobstatus":
						try {
							columnValue = iJobLogstoDownload.get(index).getJobstatus();
						}

						catch (Exception e) {
							columnValue = "";
						}
						break;
					default:
						break;
					}
					if (columnValue == null) {
						columnValue = "";
					}
					stringToReturn += columnValue + ",";

				}
				stringToReturn = stringToReturn.substring(0, stringToReturn.length() - 1) + "\n";
			} catch (Exception e) {
				stringToReturn += "\n";
				log.error("Error in sekected columns ", e.getMessage());
				// TODO: handle exception
			}

		}

		return stringToReturn;
	}

	public String getAllRemoteJobs(String url) throws LeapException {
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);
		OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
		newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
		newBuilder.hostnameVerifier((hostname, session) -> true);
		OkHttpClient client = newBuilder.connectTimeout(50, TimeUnit.SECONDS).readTimeout(50, TimeUnit.SECONDS)
				.writeTimeout(50, TimeUnit.SECONDS).build();
		Request requestokHttp = new Request.Builder().url(url).addHeader("Content-Type", "application/json")
				.addHeader("accept", "application/json").build();
		Response response = null;
		try {
			response = client.newCall(requestokHttp).execute();
			if (response.code() == 200) {
				String jsonData = response.body().string();
				return jsonData;
			} else {
				throw new LeapException("Failed to Fetch all remote logs");
			}
		} catch (Exception e) {
			throw new LeapException("Error in fetch all remote logs:" + e.getMessage() + "Url is:" + url);
		}
	}

	public String getLogData(String url, String jobId) throws LeapException {
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);
		OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
		newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
		newBuilder.hostnameVerifier((hostname, session) -> true);
		OkHttpClient client = newBuilder.connectTimeout(50, TimeUnit.SECONDS).readTimeout(50, TimeUnit.SECONDS)
				.writeTimeout(50, TimeUnit.SECONDS).build();
		String logUrl = url + "/" + jobId + "/getLog";
		Request requestokHttp = new Request.Builder().url(logUrl).addHeader("Content-Type", "application/json")
				.addHeader("accept", "application/json").build();
		Response response = null;
		try {
			response = client.newCall(requestokHttp).execute();
			if (response.code() == 200) {
				String jsonData = response.body().string();
				return jsonData;
			} else {
				throw new LeapException("Failed to Fetch remote log");
			}
		} catch (Exception e) {
			throw new LeapException("Error while fetching remote log:" + e.getMessage() + "job Id is:" + jobId);
		}
	}

	public String stopRemoteJob(String url, String jobId) throws LeapException {
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);
		OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
		newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
		newBuilder.hostnameVerifier((hostname, session) -> true);
		OkHttpClient client = newBuilder.connectTimeout(50, TimeUnit.SECONDS).readTimeout(50, TimeUnit.SECONDS)
				.writeTimeout(50, TimeUnit.SECONDS).build();
		String logUrl = url + "/" + jobId + "/stop";
		Request requestokHttp = new Request.Builder().url(logUrl).addHeader("Content-Type", "application/json")
				.addHeader("accept", "application/json").build();
		Response response = null;
		try {
			response = client.newCall(requestokHttp).execute();
			if (response.code() == 200) {
				String jsonData = response.body().string();
				return jsonData;
			} else {
				throw new LeapException("Failed to terminate the remote job");
			}
		} catch (Exception e) {
			throw new LeapException("Error in terminating remote job:" + e.getMessage() + "job Id is:" + jobId);
		}
	}

	@Override
	public List<ICIPJobsPartial> getAllCommonJobsPartial(String org, int page, int size) {
		logger.info("Getting jobs in Page {}", page);
		Pageable paginate = PageRequest.of(page, size, Sort.by(SUBMITTED_ON).descending());
		Page<ICIPJobsPartial> jobs = jobsPartialRepository.findByOrganization(org, paginate);
		List<ICIPJobsPartial> listJobs = new ArrayList<>();
		jobs.stream().parallel().forEach(j -> {
			String[] parts = j.getRuntime().split("-");
			// if (j.getRuntime().equalsIgnoreCase(AICLOUD) ||
			// j.getRuntime().equalsIgnoreCase(REMOTE) ||
			// j.getRuntime().equalsIgnoreCase(EMR)) {
			if (j.getRuntime().toLowerCase().startsWith(AICLOUD) || j.getRuntime().toLowerCase().startsWith(REMOTE)
					|| j.getRuntime().toLowerCase().startsWith(EMR)) {
				if (j.getFinishtime() == null) {
					IICIPJobRuntimeLoggerService runtimeloggerService = jobRuntimeLoggerService
							.getJobRuntimeLoggerService(parts[0].toLowerCase() + "loggerservice");
					if (runtimeloggerService != null)
						j = runtimeloggerService.updateAndLogJob(j);
				}
			}
			listJobs.add(j);
		});
		return listJobs;

	}
}
