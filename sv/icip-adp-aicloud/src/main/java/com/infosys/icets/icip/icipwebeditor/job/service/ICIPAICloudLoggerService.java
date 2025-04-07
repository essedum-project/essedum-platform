package com.infosys.icets.icip.icipwebeditor.job.service;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.io.StringReader;
import java.nio.channels.FileChannel;
import java.nio.channels.FileLock;
import java.nio.charset.Charset;
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
import java.time.format.DateTimeFormatter;
import java.util.Date;
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
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;
import com.infosys.icets.icip.dataset.service.IICIPDatasourcePluginsService;
import com.infosys.icets.icip.dataset.service.IICIPDatasourceService;
import com.infosys.icets.icip.dataset.service.util.ICIPDataSourceServiceUtil;
import com.infosys.icets.icip.dataset.service.util.IICIPDataSourceServiceUtil;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.AICloudService;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.AICloudServiceV2;
import com.infosys.icets.icip.icipwebeditor.constants.IAIJobConstants;
import com.infosys.icets.icip.icipwebeditor.constants.LoggerConstants;
import com.infosys.icets.icip.icipwebeditor.job.service.util.ICIPInitializeAnnotationServiceUtil;
import com.infosys.icets.icip.icipwebeditor.model.ICIPJobs;
import com.infosys.icets.icip.icipwebeditor.model.ICIPJobsPartial;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPJobsRepository;
import com.infosys.icets.icip.icipwebeditor.service.IICIPJobRuntimeLoggerService;
import lombok.extern.log4j.Log4j2;

@Log4j2
@Service("aicloudloggerservice")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@RefreshScope
public class ICIPAICloudLoggerService implements IICIPJobRuntimeLoggerService {

	/** The logger. */

	private final Logger logger = LoggerFactory.getLogger(ICIPAICloudLoggerService.class);

	@Autowired
	private IICIPDatasourceService dsService;

	@Autowired
	private IICIPDatasourcePluginsService dsPluginService;

	@Autowired
	private ICIPInitializeAnnotationServiceUtil annotationServiceUtil;

	@Autowired
	private ICIPJobsRepository iCIPJobsRepository;

	@Autowired
	private ICIPRemoteAICloudJob aicloudJob;

	public ICIPJobsPartial updateAndLogJob(ICIPJobsPartial job) {
		return updateAICloudJob(job);
	}

	FileOutputStream writer = null;
	
	public ICIPJobsPartial updateAICloudJob(ICIPJobsPartial job) {

		Path writeLogFilePath = Paths.get(annotationServiceUtil.getFolderPath(),
				String.format(LoggerConstants.STRING_DECIMAL_STRING, IAIJobConstants.PIPELINELOGPATH, job.getId(),
						IAIJobConstants.OUTLOG));
		ICIPJobs job2save = iCIPJobsRepository.findById(job.getId()).get();

		try(FileOutputStream writer = new FileOutputStream(writeLogFilePath.toString());  
		         FileChannel channel = writer.getChannel()) {

			channel.truncate(0);

			if (channel.isOpen()) {
				
				try(FileLock lock = channel.tryLock()) {
					if (lock == null) {
						return job;
					}
				} catch (Exception e) {
					logger.error("Exception", e.getMessage());
					return job;
				}
				org.json.JSONObject jobMetaData = new org.json.JSONObject(job.getJobmetadata());

				ICIPDatasource dsObject = dsService.getDatasource(jobMetaData.getString("datasourceName"),
						job.getOrganization());
				org.json.JSONObject connDetails = new org.json.JSONObject(dsObject.getConnectionDetails());
				JSONObject responseObj = new JSONObject();
				if ((connDetails.getString("runtime").toLowerCase()).equals("v1")) {
					responseObj = aicloudJob.getPipelineStatus(jobMetaData.getString("trialId"), connDetails);
				} else if ((connDetails.getString("runtime").toLowerCase()).equals("v2")) {
					responseObj = aicloudJob.getPipelineStatusV2(jobMetaData.getString("executePipelineId"),
							connDetails);
				} else {
					throw new LeapException("Choose correct pipeline version");
				}

				String status = responseObj.getString("status");
				String uploadDsName = connDetails.get("datasource").toString();
				ICIPDatasource uploadDs = dsService.getDatasource(uploadDsName, job.getOrganization());
				IICIPDataSourceServiceUtil uploadPluginConn = dsPluginService.getDataSourceService(uploadDs);
				org.json.JSONObject attributes = new org.json.JSONObject();
				attributes.put("bucket", jobMetaData.get("bucketName"));
				attributes.put("uploadFilePath", jobMetaData.get("logFilePath"));
				attributes.put("pipelineId", jobMetaData.getString("aiCloudPipelineId"));

				if ((connDetails.getString("runtime").toLowerCase()).equals("v1")) {
					attributes.put("trialId", jobMetaData.getString("trialId"));
				} else if ((connDetails.getString("runtime").toLowerCase()).equals("v2")) {
					attributes.put("executionId", jobMetaData.getString("executePipelineId"));
				}

				switch (status) {
				case "INPROGRESS":
					String responseV2 = readLogsandWriteToLogFile(job, uploadPluginConn, uploadDs, attributes, writer,
							connDetails, status);

					iCIPJobsRepository.save(job2save);

					return job;

				case "InProgress":
					String response1 = readLogsandWriteToLogFile(job, uploadPluginConn, uploadDs, attributes, writer,
							connDetails, status);
					job2save.setJobStatus("RUNNING");
					iCIPJobsRepository.save(job2save);
					return job;
				case "Initiated":
					return job;
				case "Succeeded":
					if (jobMetaData.has("logFilePath")) {
						String response = readLogsandWriteToLogFile(job, uploadPluginConn, uploadDs, attributes, writer,
								connDetails, status);
						String responseTime = responseObj.getString("finishedTime");
						LocalDateTime dateTime = LocalDateTime.parse(responseTime, DateTimeFormatter.ISO_DATE_TIME);
						ZoneId gmtZoneId = ZoneId.of("GMT");
						ZoneId istZoneId = ZoneId.of("Asia/Kolkata");
						dateTime = dateTime.atZone(gmtZoneId).withZoneSameInstant(istZoneId).toLocalDateTime();

						SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");
						sdf.setTimeZone(TimeZone.getTimeZone("IST"));
						try {
							Date finishedTime = sdf.parse(dateTime.toString());
							job.setJobStatus("COMPLETED");
							job.setFinishtime(new Timestamp(finishedTime.getTime()));
							job2save.setJobStatus("COMPLETED");
							job2save.setFinishtime(new Timestamp(finishedTime.getTime()));
						} catch (JSONException | ParseException e) {
							logger.error("Exception", e.getMessage());
						}

						iCIPJobsRepository.save(job2save);

					}
					return job;
				case "Failed":
					SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");
					try {
						Date finishedTime2 = sdf.parse(responseObj.getString("finishedTime"));
						String response = readLogsandWriteToLogFile(job, uploadPluginConn, uploadDs, attributes, writer,
								connDetails, status);
						job2save.setJobStatus("CANCELLED");

						job2save.setFinishtime(new Timestamp(finishedTime2.getTime()));
						iCIPJobsRepository.save(job2save);
						job.setJobStatus("ERROR");
						job.setFinishtime(new Timestamp(finishedTime2.getTime()));
					} catch (ParseException e) {
						// TODO Auto-generated catch block
						logger.error("Exception", e.getMessage());
					}
					return job;
				default:
					return job;
				}
			}
		} catch (IOException | JSONException | LeapException e1) {
			// String error = "Error in Job Execution : " + e1.getMessage()
			// + System.getProperty(IAIJobConstants.LINE_SEPARATOR) + e1.toString();
			log.error("Error in Job Execution : " + e1.getMessage());
			job2save.setJobStatus("ERROR");
			job2save.setFinishtime(new Timestamp(System.currentTimeMillis()));
			iCIPJobsRepository.save(job2save);
			job.setJobStatus("ERROR");
			job.setFinishtime(new Timestamp(System.currentTimeMillis()));
			try {
				writer.write(e1.getMessage().getBytes());
			} catch (IOException e) {
				logger.error("Exception", e.getMessage());
			}

		} catch (Exception e) {
			logger.info(e.getMessage());
		}

		return job;

	}

	private String readLogsandWriteToLogFile(ICIPJobsPartial job, IICIPDataSourceServiceUtil uploadPluginConn,
			ICIPDatasource uploadDs, org.json.JSONObject attributes, FileOutputStream writer, JSONObject connDetails,
			String pipelineStatus) throws LeapException, IOException {

		try {
			Path downloadAICloudLogPath = Paths.get(annotationServiceUtil.getFolderPath(),
					String.format("%s/%d", IAIJobConstants.AICLOUDLOSSTORAEPATH, job.getId()));
			Files.createDirectories(downloadAICloudLogPath);
			uploadPluginConn.downloadFile(uploadDs, attributes.toString(), downloadAICloudLogPath.toString());
			logger.info("Line after dowloadFile method");
			Path decompressedLogFilePath = Paths.get(annotationServiceUtil.getFolderPath(),
					String.format("%s/%s/decompressed/", IAIJobConstants.AICLOUDLOSSTORAEPATH, job.getId()));
			downloadAICloudLogPath = Paths.get(downloadAICloudLogPath.toString(),
					attributes.get("uploadFilePath").toString());

			String res = null;
			if (connDetails.getString("runtime").equals("v2")) {

				org.json.JSONObject jobMetaData = new org.json.JSONObject(job.getJobmetadata());
				ICIPDatasource elasticds = dsService.getDatasource(jobMetaData.getString("elastic"),
						job.getOrganization());
				JSONObject connectionDetails = new org.json.JSONObject(elasticds.getConnectionDetails());
				String elasticSearchIndex = jobMetaData.getString("elasticSearchIndex");
				String pipelineId = jobMetaData.getString("aiCloudPipelineId");
				String trailId = jobMetaData.getString("executePipelineId");
				Timestamp submitedOn = job.getSubmittedOn();
				String formattedDate = new SimpleDateFormat("yyyy-MM-dd").format(submitedOn);
				String elasticSerachResponse = dsPluginService.getDataSourceService(elasticds)
						.getElasticSearchResponse(elasticds, pipelineId, trailId, formattedDate, elasticSearchIndex);
				res = elasticSerachResponse.toString();
				logger.info("Logs:{}", res);

			} else {

				res = decompressLogFiles(downloadAICloudLogPath, decompressedLogFilePath);

			}

			if (res != null && connDetails.getString("runtime").equals("v2")) {
				Path writeLogFilePath = Paths.get(annotationServiceUtil.getFolderPath(),
						String.format(LoggerConstants.STRING_DECIMAL_STRING, IAIJobConstants.PIPELINELOGPATH,
								job.getId(), IAIJobConstants.OUTLOG));
				String logs = "Pipeline Status : " + pipelineStatus + ", \r\n " + "Data : " + res;
				readfilesandwrite2(logs, writer);
				return "success";
			} else if (res != null && connDetails.getString("runtime").equals("v1")) {
				Path writeLogFilePath = Paths.get(annotationServiceUtil.getFolderPath(),
						String.format(LoggerConstants.STRING_DECIMAL_STRING, IAIJobConstants.PIPELINELOGPATH,
								job.getId(), IAIJobConstants.OUTLOG));

				String id = null;
				readfilesandwrite(res, decompressedLogFilePath, writeLogFilePath, writer,
						attributes.getString("pipelineId"),
						id = attributes.has("executionId") ? attributes.getString("executionId")
								: attributes.getString("trialId"));
				return "success";

			} else if (res == null) {
				String logs = "Pipeline Status : " + pipelineStatus + ", \r\n " + "PipelineDetails : "
						+ job.getJobmetadata();
				readfilesandwrite2(logs, writer);

			}

		} catch (Exception e) {
			logger.error("Exception", e.getMessage());
			String logs = "Pipeline Status : " + pipelineStatus + ", \r\n" + "Pipeline Details : "
					+ job.getJobmetadata();
			readfilesandwrite2(logs, writer);

		}

		return null;

	}

	private void readfilesandwrite2(String logs, FileOutputStream writer) throws IOException {
		writer.write(logs.getBytes());
		writer.close();
	}

	private void readfilesandwrite(String res, Path decompressedLogFilePath, Path writeLogFilePath,
			FileOutputStream writer, String pipelineId, String Id) {
		File Folder = new File(decompressedLogFilePath.toString());
		File files[];
		files = Folder.listFiles();

		String id = " Id :" + Id + "\r\n";

		String pipelineIdR = "PipelineId : " + pipelineId + "\r\n";
		// write to the channel
		for (File f : files) {
			try(BufferedReader r = new BufferedReader(new FileReader(f))){;
				String line = null;
				writer.write(pipelineIdR.getBytes(Charset.forName("UTF-8")));
				writer.write(10);
				writer.write(res.getBytes(Charset.forName("UTF-8")));
				writer.write(10);
				writer.write(id.getBytes(Charset.forName("UTF-8")));
				writer.write(10);
				while ((line = r.readLine()) != null) {
					writer.write(line.trim().getBytes());
					writer.write(10);
				}
			}catch(IOException e) {
				logger.error("Exception during file processing: " + f.getName(), e.getMessage());
			}
		}
	}

	private String decompressLogFiles(Path downloadAICloudLogPath, Path decompressedLogFilePath) throws IOException {
		File oldDecompFile = new File(decompressedLogFilePath.toString());

		File[] oldFiles = oldDecompFile.listFiles();
		if (oldFiles != null) {
			for (File x : oldDecompFile.listFiles()) {
				Files.deleteIfExists(Paths.get(x.getAbsolutePath()));
			}
		}
		Files.createDirectories(decompressedLogFilePath);

		File fObj = new File(downloadAICloudLogPath.toString());
		if (fObj.exists() && fObj.isDirectory()) {
			File files[] = fObj.listFiles();
			if (files.length > 0) {
				for (File f : files) {
					String fileName = f.getName();
					Path extractPath = Paths.get(decompressedLogFilePath.toString(), fileName.replace(".gz", ""));
					decompressGzip(Paths.get(f.getAbsolutePath()), extractPath);
				}

			}
			return "success";
		} else
			return null;
	}

	public static void decompressGzip(Path source, Path target) throws IOException {

		try (GZIPInputStream gis = new GZIPInputStream(new FileInputStream(source.toFile()));
				FileOutputStream fos = new FileOutputStream(target.toFile())) {

			byte[] buffer = new byte[1024];
			int len;
			while ((len = gis.read(buffer)) > 0) {
				fos.write(buffer, 0, len);
			}

		}

	}
	
}
