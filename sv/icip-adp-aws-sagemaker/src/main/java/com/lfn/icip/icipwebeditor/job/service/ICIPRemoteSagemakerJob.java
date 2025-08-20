package com.lfn.icip.icipwebeditor.job.service;

import java.io.BufferedWriter;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.RandomAccessFile;
import java.nio.channels.FileChannel;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import org.apache.commons.text.StringEscapeUtils;
import org.apache.http.conn.socket.ConnectionSocketFactory;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.api.errors.InvalidRemoteException;
import org.eclipse.jgit.api.errors.TransportException;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.quartz.JobDataMap;
import org.quartz.JobDetail;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.SchedulerException;
import org.quartz.Trigger;
import org.quartz.UnableToInterruptJobException;
import org.quartz.impl.matchers.KeyMatcher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.annotation.Scope;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.yaml.snakeyaml.Yaml;

import com.amazonaws.ClientConfiguration;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.http.conn.ssl.SdkTLSSocketFactory;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.model.ICIPSchemaDetails;
import com.lfn.icip.dataset.service.IICIPDatasourcePluginsService;
import com.lfn.icip.dataset.service.IICIPDatasourceService;
import com.lfn.icip.dataset.service.impl.ICIPDatasetService;
import com.lfn.icip.dataset.service.impl.ICIPDatasourceService;
import com.lfn.icip.dataset.service.impl.ICIPSchemaRegistryService;
import com.lfn.icip.dataset.service.util.IICIPDataSourceServiceUtil;
import com.lfn.icip.icipwebeditor.IICIPJobRuntimeServiceUtil;
import com.lfn.icip.icipwebeditor.IICIPJobServiceUtil;
import com.lfn.icip.icipwebeditor.constants.AlertConstants;
import com.lfn.icip.icipwebeditor.constants.FileConstants;
import com.lfn.icip.icipwebeditor.constants.IAIJobConstants;
import com.lfn.icip.icipwebeditor.constants.LoggerConstants;
import com.lfn.icip.icipwebeditor.executor.sync.service.JobSyncExecutorService;
import com.lfn.icip.icipwebeditor.file.service.ICIPFileService;

import com.lfn.icip.icipwebeditor.job.constants.JobConstants;
import com.lfn.icip.icipwebeditor.job.constants.SagemakerConstants;
import com.lfn.icip.icipwebeditor.job.enums.JobMetadata;
import com.lfn.icip.icipwebeditor.job.enums.JobStatus;
import com.lfn.icip.icipwebeditor.job.enums.RuntimeType;
import com.lfn.icip.icipwebeditor.job.listener.ICIPJobSchedulerListener;
import com.lfn.icip.icipwebeditor.job.model.ICIPInternalJobs.MetaData;
import com.lfn.icip.icipwebeditor.job.model.SagemakerJobMetaData;
import com.lfn.icip.icipwebeditor.job.model.SagemakerPipelineConfig;
import com.lfn.icip.icipwebeditor.job.model.SagemakerService;
import com.lfn.icip.icipwebeditor.job.model.TriggerValues;
import com.lfn.icip.icipwebeditor.job.model.dto.JobObjectDTO;
import com.lfn.icip.icipwebeditor.job.model.dto.JobObjectDTO.Jobs;
import com.lfn.icip.icipwebeditor.job.service.util.ICIPCommonJobServiceUtil;
import com.lfn.icip.icipwebeditor.job.service.util.ICIPInitializeAnnotationServiceUtil;
import com.lfn.icip.icipwebeditor.jobmodel.service.ICIPAgentJobsService;
import com.lfn.icip.icipwebeditor.jobmodel.service.ICIPJobsService;
import com.lfn.icip.icipwebeditor.model.ICIPAgentJobs;
import com.lfn.icip.icipwebeditor.model.ICIPJobs;
import com.lfn.icip.icipwebeditor.model.ICIPPipelinePID;
import com.lfn.icip.icipwebeditor.model.ICIPStreamingServices;
import com.lfn.icip.icipwebeditor.model.dto.ICIPNativeJobDetails;

import com.lfn.icip.icipwebeditor.service.aspect.IAIResolverAspect;
import com.lfn.icip.icipwebeditor.service.impl.ICIPJobsPluginsService;
import com.lfn.icip.icipwebeditor.service.impl.ICIPPipelinePIDService;
import com.lfn.icip.icipwebeditor.service.impl.ICIPPipelineService;

import software.amazon.awssdk.core.exception.SdkClientException;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sagemaker.SageMakerClient;
import software.amazon.awssdk.services.sagemaker.model.AlgorithmSpecification;
import software.amazon.awssdk.services.sagemaker.model.CreateTrainingJobRequest;
import software.amazon.awssdk.services.sagemaker.model.ListModelsRequest;
import software.amazon.awssdk.services.sagemaker.model.ListModelsResponse;
import software.amazon.awssdk.services.sagemaker.model.ModelSummary;
import software.amazon.awssdk.services.sagemaker.model.ResourceConfig;
import software.amazon.awssdk.services.sagemaker.model.S3DataSource;
import software.amazon.awssdk.services.sagemaker.model.SageMakerException;
import software.amazon.awssdk.utils.ImmutableMap;
import software.amazon.awssdk.services.cloudwatchlogs.CloudWatchLogsClient;
import software.amazon.awssdk.services.cloudwatchlogs.model.CreateLogGroupRequest;
import software.amazon.awssdk.services.cloudwatchlogs.model.GetLogEventsRequest;
import software.amazon.awssdk.services.cloudwatchlogs.model.OutputLogEvent;
import software.amazon.awssdk.services.sagemaker.model.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import software.amazon.awssdk.auth.credentials.*;

import lombok.extern.log4j.Log4j2;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

@Log4j2
@Component("awssagemakerjobruntime")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@RefreshScope
public class ICIPRemoteSagemakerJob extends ICIPCommonJobServiceUtil implements IICIPJobRuntimeServiceUtil {

	public ICIPRemoteSagemakerJob() {
		super();
	}

	/** The pid service. */
	@Autowired
	private ICIPPipelinePIDService pidService;
	
	private SagemakerConstants constants;
	
	@Autowired
	private IICIPDatasourcePluginsService dsPluginService;

	@Autowired
	private IICIPDatasourceService dsService;

	/** The logger. */
	private final Logger logger = LoggerFactory.getLogger(ICIPRemoteSagemakerJob.class);

	@Autowired
	private ICIPJobsPluginsService jobpluginService;

	@Autowired
	private ICIPJobsService jobsService;

	/** The job sync executor service. */
	@Autowired
	private JobSyncExecutorService jobSyncExecutorService;

	/** The agent jobs service. */
	@Autowired
	private ICIPAgentJobsService agentJobsService;

	/** The pipeline service. */
	@Autowired
	private ICIPPipelineService pipelineService;

	/** The datasource service. */
	@Autowired
	private ICIPDatasourceService datasourceService;

	/** The alert constants. */
	@Autowired
	private AlertConstants alertConstants;

	/** The dataset service. */
	@Autowired
	private ICIPDatasetService datasetService;

	/** The schema registry service. */
	@Autowired
	private ICIPSchemaRegistryService schemaRegistryService;

	/** The i CIP file service. */
	@Autowired
	private ICIPFileService iCIPFileService;

	/** The resolver. */
	@Autowired
	private IAIResolverAspect resolver;

	private String nativescriptPythonCommand = "python # #";

	private String nativescriptPython2Command = "python # #";

	private String nativescriptJavascriptCommand = "node # #";

	private String nativescriptPythonV2Command = "python # #";

	private String nativescriptPython2V2Command = "python # #";

	private String nativescriptJavascriptV2Command = "node # #";

	private String binaryCommand = "/venv/lib/python3.7/site-packages/pyspark/bin/spark-submit --class # # # # #";

	private String dragAndDropCommand = "@!icip.pythonpath!@ -m dagster pipeline execute -m essedum.DagsterExecuter -n pipelineExecuter";

	private String dragAndDropCommandWithRestNode = "@!icip.pythonpath!@ -m dagster pipeline execute -m essedum.RESTAPIExecuter -n pipelineExecuter";

	/** The Constant INVALID_TYPE. */
	private static final String INVALID_TYPE = "Invalid Type";

	/** The Constant INVALID_JOBTYPE. */
	private static final String INVALID_JOBTYPE = "Invalid JobType";

	/** The annotation service util. */
	@Autowired
	private ICIPInitializeAnnotationServiceUtil annotationServiceUtil;
	private static final String SAGEMAKER = "sagemaker";
	private transient Thread workerThread;
	String status = null;

	String processArn;

	@Override
	public void execute(JobExecutionContext context) throws JobExecutionException {
		workerThread = Thread.currentThread();
		JobDetail jobDetail = context.getJobDetail();
		logger.info("Executing Job with key {}", context.getJobDetail().getKey());
		JobDataMap jobDataMap = context.getMergedJobDataMap();
		Gson gson = new Gson();
		String jobString = jobDataMap.getString(JobConstants.JOB_DATAMAP_VALUE);
		JobObjectDTO jobObject = gson.fromJson(jobString, JobObjectDTO.class);
		JobObjectDTO.Jobs job = jobObject.getJobs().get(0);
		String datasourceName = jobDataMap.getString("datasourceName");
		try {
			// adding jobListner to the current job scheduler
			context.getScheduler().getListenerManager().addJobListener(
					new ICIPJobSchedulerListener("JobListener-" + jobDetail.getKey()),
					KeyMatcher.keyEquals(jobDetail.getKey()));
		} catch (SchedulerException e2) {
			// TODO Auto-generated catch block
			e2.getMessage();
		}
		if (!jobObject.isEvent()) {
			jobObject.setCorelId(ICIPUtils.generateCorrelationId());
		}
		try {
			// get unique hashValue for the job triggered(hashvalue=hex(digest(name&org));
			String attributesHash = getAttributeHashString(jobObject);
			String runCmd;
			if (attributesHash != null) {
				Timestamp submittedOn = new Timestamp(new Date().getTime());
				StringBuilder jobId = new StringBuilder(IAIJobConstants.STRING_BUILDER_CAPACITY);
				jobId.append(jobDetail.getKey().getName());
				jobId.append(new String(Base64.getEncoder().encode(jobObject.getSubmittedBy().getBytes())));
				jobId.append(submittedOn.toInstant());
				try {

					JobMetadata jobMetadata = JobMetadata.USER;
					MetaData pipelineMetadata = new MetaData();
					pipelineMetadata.setTag(jobMetadata.toString());

					Trigger trigger = context.getTrigger();
					Timestamp[] timestamps = getTimestamps(jobObject);
					Timestamp successfulTimestamp = timestamps[0];
					Timestamp lastTimestamp = timestamps[1];
					TriggerValues triggerValues = new TriggerValues(trigger.getNextFireTime(),
							trigger.getPreviousFireTime(), lastTimestamp, successfulTimestamp);
					List<ICIPNativeJobDetails> nativeJobDetails = createNativeJobDetails(jobObject, triggerValues);
					Integer version = pipelineService.getVersion(nativeJobDetails.get(0).getCname(),
							nativeJobDetails.get(0).getOrg());
					if (version == null)
						version = 0;
					iCIPJobs = new ICIPJobs(null, ICIPUtils.removeSpecialCharacter(jobId.toString()),
							jobObject.getSubmittedBy(), jobObject.getName(), JobStatus.STARTED.toString(), version,
							null, submittedOn, jobObject.getJobs().get(0).getRuntime().toString(), jobObject.getOrg(),
							SAGEMAKER, null, attributesHash, jobObject.getCorelId(), null, gson.toJson(pipelineMetadata),
							0, "{}", "{}", "{}", "{}","{}","");
					logger.info("Submitting the Pipeline to Job Server Remotely");
					RuntimeType type = job.getRuntime();
					String org = jobObject.getOrg();
					String params = job.getParams();
					String cname = job.getName();

					// aicloud specific code
					ICIPDatasource dsObject = dsService.getDatasource(datasourceName, org);
					// connDetails object has
					// bucketName,projectId,storageType,scope,userId,uploadDSName("datasource")
					JSONObject connDetails = new JSONObject(dsObject.getConnectionDetails());
					IICIPJobServiceUtil jobUtilConn = jobpluginService.getType(type.toString().toLowerCase() + "job");
					String uploadDsName = connDetails.get("datasource").toString();
					ICIPDatasource uploadDs = dsService.getDatasource(uploadDsName, org);
					String pipelineJson = pipelineService.getJson(cname, org);
					JsonObject jsonObject = new Gson().fromJson(pipelineJson, JsonElement.class).getAsJsonObject();
					jsonObject.addProperty("org", org);
					String data = "{\"input_string\":" + jsonObject.toString() + "}";
					data = pipelineService.populateDatasetDetails(data, org);
					data = pipelineService.populateSchemaDetails(data, org);
					JSONArray pipelineArgs = null;
					if (params != null && !params.isEmpty() && !params.equals("{}")
							&& !params.equalsIgnoreCase("generated")) {
						data = pipelineService.populateAttributeDetails(data, params);
					}
					HashMap<String, String> configs = new HashMap<String, String>();

					if (!params.equalsIgnoreCase("generated")) {
						JSONObject dataObj = new JSONObject(data);
						JSONArray elements = dataObj.getJSONObject("input_string").getJSONArray("elements");
						pipelineArgs = elements.getJSONObject(0).getJSONObject("attributes").getJSONArray("arguments");
						if (pipelineArgs != null && !pipelineArgs.isEmpty()) {
							pipelineArgs.forEach(args -> {
								JSONObject temp = new JSONObject(args.toString());
								configs.put(temp.getString("name").trim(), temp.getString("value").trim());
							});
						}
					} else {
						JSONObject dataObj = new JSONObject(data);
						pipelineArgs = dataObj.getJSONObject("input_string").getJSONArray("pipeline_attributes");
						if (pipelineArgs != null && !pipelineArgs.isEmpty()) {
							pipelineArgs.forEach(args -> {
								JSONObject temp = new JSONObject(args.toString());
								if (temp.has("key") && temp.getString("key").trim() != null) {
									configs.put(temp.getString("key").trim(), temp.getString("value").trim());
								}
								if (temp.has("name") && temp.getString("name").trim() != null) {
									configs.put(temp.getString("name").trim(), temp.getString("value").trim());
								}
								//configs.put(temp.getString("key").trim(), temp.getString("value").trim());
							});
						}
					}
					
					ObjectMapper mapper = new ObjectMapper();
					SagemakerPipelineConfig pipelinConfig = mapper.convertValue(configs, SagemakerPipelineConfig.class);

					String msg = String.format("%s", "About to run the job");
					log.info(msg);
					runCmd = getRunCommand(job, nativeJobDetails);
					runScript(version, runCmd, jobUtilConn, nativeJobDetails, connDetails, uploadDs, job,
							datasourceName);
					iCIPJobs.setJobStatus(JobStatus.RUNNING.toString());
					iCIPJobs = jobsService.save(iCIPJobs);
					Integer result = 0;
					Path outPath = Paths.get(annotationServiceUtil.getFolderPath(),
							String.format(LoggerConstants.STRING_DECIMAL_STRING, IAIJobConstants.PIPELINELOGPATH,
									iCIPJobs.getId(), IAIJobConstants.OUTLOG));
					log.info("OutPath : {}", outPath);
					Files.createDirectories(outPath.getParent());
					Files.deleteIfExists(outPath);
					Files.createFile(outPath);
					if (Files.exists(outPath)) {

					} else {
						iCIPJobs.setJobStatus(JobStatus.ERROR.toString());
						iCIPJobs.setLog("Configuration Error : Log File Not Found [Path : "
								+ outPath.toAbsolutePath().toString() + "]");
						iCIPJobs = jobsService.save(iCIPJobs);
					}
					context.setResult(result);
				} catch (Exception ex) {
					iCIPJobs.setJobStatus(JobStatus.ERROR.toString());
					iCIPJobs.setLog(ex.getMessage());
					iCIPJobs.setFinishtime(new Timestamp(new Date().getTime()));
					iCIPJobs = jobsService.save(iCIPJobs);
					String msg = "Error in running job : " + ex.getClass().getCanonicalName()
							+ " - " + ex.getMessage();
					log.error(msg, ex);
					throw new EssedumException(msg, ex);
				}

			}
		} catch (Exception ex) {
			Path outPath = Paths.get(annotationServiceUtil.getFolderPath(),
					String.format(LoggerConstants.STRING_DECIMAL_STRING, IAIJobConstants.PIPELINELOGPATH,
							iCIPJobs.getId(), IAIJobConstants.OUTLOG));

			//String error = "Error in Job Execution : " + ex.getMessage()
					//+ System.getProperty(IAIJobConstants.LINE_SEPARATOR) + ex.toString();
			log.error("Error in Job Execution : " + ex.getMessage());
			//log.error(error, ex);
			FileChannel channel = null;
			RandomAccessFile writer = null;
			try {
				Files.deleteIfExists(outPath);
				Files.createFile(outPath);
				writer = new RandomAccessFile(outPath.toString(), "rw");
				channel = writer.getChannel();
				writer.writeBytes(ex.getMessage());
				//handlingErrorStatus("error occurred ", jobObject);
				handlingErrorStatus(ex.getMessage(), jobObject);
			} catch (EssedumException | IOException e) {
				log.error("An error occurred while processing the job", e);
			} finally {
				try {
					if (writer != null) {
						writer.close();
					}
			
				} catch (IOException e) {
					log.error(e.getMessage(), e);
				}

			}
		}
	}


	/**
	 * Handling error status.
	 *
	 * @param error the error
	 * @param job   the job
	 * @throws EssedumException the essedum exception
	 */
	private void handlingErrorStatus(String error, JobObjectDTO job) throws EssedumException {
		StringBuilder stringBuilder = new StringBuilder(IAIJobConstants.STRING_BUILDER_CAPACITY);
		stringBuilder.append(System.getProperty(IAIJobConstants.LINE_SEPARATOR));
		stringBuilder.append(error);
		stringBuilder.append(System.getProperty(IAIJobConstants.LINE_SEPARATOR));

		iCIPJobs = iCIPJobs.updateJob(JobStatus.ERROR.toString(), stringBuilder.toString());
		jobsService.save(iCIPJobs);

		jobSyncExecutorService.callAlertEvent(true, job.getSubmittedBy(),
				alertConstants.getPIPELINE_ERROR_MAIL_SUBJECT(), alertConstants.getPIPELINE_ERROR_MAIL_MESSAGE(),
				alertConstants.getPIPELINE_ERROR_NOTIFICATION_MESSAGE(), job.getName(), job.getOrg(), null);
	}

	/**
	 * Handling error status.
	 *
	 * @param error the error
	 * @param job   the job
	 * @throws EssedumException the essedum exception
	 */
	private void handlingInterruptStatus(String error, JobObjectDTO job) throws EssedumException {
		StringBuilder stringBuilder = new StringBuilder(IAIJobConstants.STRING_BUILDER_CAPACITY);
		stringBuilder.append(System.getProperty(IAIJobConstants.LINE_SEPARATOR));
		stringBuilder.append(error);
		stringBuilder.append(System.getProperty(IAIJobConstants.LINE_SEPARATOR));

		iCIPJobs = iCIPJobs.updateJob(JobStatus.TIMEOUT.toString(), stringBuilder.toString());
		jobsService.save(iCIPJobs);

		jobSyncExecutorService.callAlertEvent(true, job.getSubmittedBy(),
				alertConstants.getPIPELINE_ERROR_MAIL_SUBJECT(), alertConstants.getPIPELINE_ERROR_MAIL_MESSAGE(),
				alertConstants.getPIPELINE_ERROR_NOTIFICATION_MESSAGE(), job.getName(), job.getOrg(), null);
	}

	private String getRunCommand(Jobs job, List<ICIPNativeJobDetails> nativeJobDetails) throws EssedumException, InvalidRemoteException, TransportException, GitAPIException {
		String runCmd = "";
		switch (job.getRuntime()) {
		case NATIVESCRIPT:
			runCmd = getNativeJobCommand(nativeJobDetails.get(0));
			break;
		case BINARY:
			runCmd = getBinaryJobCommand(nativeJobDetails.get(0));
			break;
		case DRAGANDDROP:
			runCmd = getDragAndDropJobCommand(nativeJobDetails.get(0));
			break;
		default:
		}
		return runCmd;
	}

	private Path getUploadFilePath(IICIPJobServiceUtil jobUtilConn, List<ICIPNativeJobDetails> nativeJobDetails) throws InvalidRemoteException, TransportException, GitAPIException {
		return jobUtilConn.getFilePath(nativeJobDetails.get(0));

	}

//	private String uploadScript(ICIPDatasource uploadDs, String attributes, String uploadFile) {
//		IICIPDataSourceServiceUtil uploadPluginConn = dsPluginService.getDataSourceService(uploadDs);
//		return uploadPluginConn.uploadFile(uploadDs, attributes, uploadFile);
//	}
	private String uploadScript(ICIPDatasource uploadDs, String attributes, String uploadFile) {
//		IICIPDataSourceServiceUtil uploadPluginConn = dsPluginService.getDataSourceService(uploadDs);
		return uploadFileToSagemaker(uploadDs, attributes, uploadFile);
	}

	private String uploadFileToSagemaker(ICIPDatasource datasource, String attributes, String uploadFile) {
		// TODO Auto-generated method stub
		JSONObject connectionDetails = new JSONObject(datasource.getConnectionDetails());
		String accessKey = connectionDetails.optString("accessKey");
		String secretKey = connectionDetails.optString("secretKey");
		String region = connectionDetails.optString("Region");
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);
		HostnameVerifier myVerifier = (hostname, session) -> true;
		ClientConfiguration clientConfiguration = new ClientConfiguration();
		ConnectionSocketFactory factory = new SdkTLSSocketFactory(sslContext, myVerifier);
		clientConfiguration.getApacheHttpClientConfig().setSslSocketFactory(factory);
		JSONObject attr = new JSONObject(attributes);
		String bucketName = attr.optString("bucket");
		String objectKey = attr.optString("object");
		// String region = attr.optString("region");
		File localFilePath = new File(uploadFile);
		BasicAWSCredentials awsCreds = new BasicAWSCredentials(accessKey, secretKey);
		AmazonS3 s3Client = AmazonS3ClientBuilder.standard().withRegion(region)
				.withCredentials(new AWSStaticCredentialsProvider(awsCreds)).build();

		try {
			PutObjectRequest request = new PutObjectRequest(bucketName, objectKey, localFilePath);
			s3Client.putObject(request);
			return "s3://" + bucketName + "/" + objectKey;
		} catch (SdkClientException e) {
			logger.error(e.getMessage());
			return null;
		}

	}

	private ResponseEntity<String> runScript(Integer version, String runCmd, IICIPJobServiceUtil jobUtilConn,
			List<ICIPNativeJobDetails> nativeJobDetails, JSONObject connDetails, ICIPDatasource uploadDs, Jobs job,
			String datasourceName) throws EssedumException, InvalidRemoteException, TransportException, GitAPIException {

		String pipelineId = null;
		Path filePath = getUploadFilePath(jobUtilConn, nativeJobDetails);
		String uploadFilePath = filePath.toString();
		JSONObject attributes = new JSONObject().put("bucket", connDetails.get("bucketName").toString());
		// attributes.put("projectId", connDetails.get("projectId").toString());
		attributes.put("pipelineName", nativeJobDetails.get(0).getCname());
		attributes.put("version", version);
		attributes.put("object", filePath.getFileName());
		attributes.put("uploadFilePath", generateArtifactsPath(nativeJobDetails, attributes));

		try {

			if (!checkPipelineExists(nativeJobDetails, connDetails, uploadDs, version, attributes)) {
				String s3path = uploadScript(uploadDs, attributes.toString(), uploadFilePath);
//				pipelineId = createPipeline(connDetails, nativeJobDetails, s3path, uploadDs.getType(), runCmd, version);
				JSONObject pipelineData = new JSONObject();
				pipelineData.put("SagemakerpipelineId", pipelineId);
				pipelineService.updatePipelineMetadata(pipelineData, nativeJobDetails.get(0).getCname(),
						nativeJobDetails.get(0).getOrg(), version);
				//processArn = processingJob(uploadDs, s3path, version);
				//String processingJobName;
				processingJobName = processingJob(uploadDs,connDetails, s3path);
				
				//String logstos3 = ProcessingJobLogEvent(uploadDs, processingJobName);
			} else {
				pipelineId = pipelineService.getPipelineId(version.toString(), nativeJobDetails.get(0).getCname(),
						nativeJobDetails.get(0).getOrg());
			}

			SagemakerJobMetaData metaData = new SagemakerJobMetaData();
			metaData.setProcessingJobName(processingJobName);
			metaData.setProcessArn(processArn);
			metaData.setBucketName(attributes.get("bucket").toString());
			metaData.setPipelineName(attributes.getString("pipelineName"));
			metaData.setDatasourceName(datasourceName);
			metaData.setLogFilePath(generateLogFilePath(metaData, version));
			metaData.setTag("User");
			iCIPJobs.setJobmetadata(gson.toJson(metaData));
			JSONObject statusResponse = getStatus(uploadDs,new JSONObject(gson.toJson(metaData)));
			status = statusResponse.get("StepStatus").toString();
			if (status.equalsIgnoreCase("Completed") || status.equalsIgnoreCase("InProgress")
					|| status.equalsIgnoreCase("Initiated"))
				
				return new ResponseEntity<String>(HttpStatus.OK);

			else {
				return new ResponseEntity<String>(HttpStatus.BAD_REQUEST);
			}
		} catch (Exception e) {
			throw new EssedumException(e.getMessage());

		}

	}

	JSONObject getStatus(ICIPDatasource datasource,JSONObject jobMetadata) {
		// TODO Auto-generated method stub
		JSONObject connectionDetails = new JSONObject(datasource.getConnectionDetails());
		String accessKey = connectionDetails.optString("accessKey");
		String secretKey = connectionDetails.optString("secretKey");
		// String region1 = connectionDetails.optString("region");
		Region region = Region.US_EAST_1;
		//String region = connectionDetails.optString("region");
		AwsCredentialsProvider credentialsProvider = StaticCredentialsProvider
				.create(AwsBasicCredentials.create(accessKey, secretKey));

		SageMakerClient sageMakerClient = SageMakerClient.builder()
				//.region(Region.of(region))
				.region(region)
				.credentialsProvider(credentialsProvider).build();

		DescribeProcessingJobRequest describeRequest = DescribeProcessingJobRequest.builder()
				.processingJobName(jobMetadata.getString("processingJobName")).build();
		DescribeProcessingJobResponse describeResponse = sageMakerClient.describeProcessingJob(describeRequest);
		ProcessingJobStatus jobStatus = describeResponse.processingJobStatus();
		String fetchedTime = describeResponse.creationTime().toString();
		Instant finishedTime = describeResponse.processingEndTime();
		JSONObject jsonObject = new JSONObject();
		jsonObject.put("StepStatus", jobStatus.toString());
		jsonObject.put("fetchedTime", fetchedTime);
		if (finishedTime != null) {
			jsonObject.put("finishedTime", finishedTime.toString());
		}
		return jsonObject;
	}

	private String generateLogFilePath(SagemakerJobMetaData metaData, Integer version) {
		// TODO Auto-generated method stub

		return "/outputartifacts/logs/";
	}
static String processingJobName;
private String processingJob(ICIPDatasource datasource,JSONObject connDetails, String s3path) {
    // JSONObject connectionDetails = new
    // JSONObject(datasource.getConnectionDetails());
    // JSONObject authDetails = new
    // JSONObject(connectionDetails.optString("AuthDetails"));
  
    JSONObject connectionDetails = new JSONObject(datasource.getConnectionDetails());
    //JSONObject conndetails= new JSONObject(connDetails));
    String accessKey = connectionDetails.optString("accessKey");
    String secretKey = connectionDetails.optString("secretKey");

    // String regions = connectionDetails.optString("region");
    String processingJob = null;
    String imageUri = connDetails.optString("imageUri");
    String roleArn = connDetails.optString("roleArn");

    // String region = connectionDetails.getString("Region");
    // String instanceType = connectionDetails.optString("instanceType");
    // Region region = Region.of(connectionDetails.getString("region"));
    Region region = Region.US_EAST_1;
    //String region = connectionDetails.optString("region");
    AwsCredentialsProvider credentialsProvider = StaticCredentialsProvider
            .create(AwsBasicCredentials.create(accessKey, secretKey));
    SageMakerClient sageMakerClient = SageMakerClient.builder()
            //.region(Region.of(region))
    		.region(region)
            .credentialsProvider(credentialsProvider)
            .build();

    //String s3CodePath = s3path;
    // String pythonCode= fetchPythonCode(uploadFilePath);
    LocalDateTime currentDateTime = LocalDateTime.now();
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd-HH-mm-ss");
    String formattedDateTime = currentDateTime.format(formatter);
    String processingJobName = "sagemaker-job"+"-"+formattedDateTime;

    String scriptLocation = s3path;
    String[] parts = scriptLocation.split("/");
    String scriptFileName = parts[parts.length-1];
    List<ProcessingInput> inputs = new ArrayList<>();
    inputs.add(ProcessingInput.builder()
            .inputName("code")
            .s3Input(ProcessingS3Input.builder()
                    .s3Uri(scriptLocation)
                   // Pass the script location here
                    .s3DataType("S3Prefix")
                    .localPath("/opt/ml/processing/input/code")
                    .s3InputMode("File")
                    .s3DataDistributionType("FullyReplicated")

                   // .s3DownloadMode("pile")
                    .build())
            .build());



    String pythonScriptpath = "/opt/ml/processing/input/code/" +scriptFileName;
    CreateProcessingJobRequest request = CreateProcessingJobRequest.builder()
            .processingJobName(processingJobName)
            // .processingOutputConfig(ProcessingOutputConfig.builder().outputs(output).build())
            .processingResources(ProcessingResources.builder()
                    .clusterConfig(ProcessingClusterConfig.builder().instanceCount(1)
                            .instanceType(ProcessingInstanceType.ML_M5_LARGE)
                            // .instanceType(instanceType)
                            .volumeSizeInGB(5).build())
                    .build())
            .appSpecification(AppSpecification.builder()
                    //.imageUri(constants.getImageURI()).build())
                    //.imageUri("683313688378.dkr.ecr.us-east-1.amazonaws.com/sagemaker-sklearn-automl:2.5-1-cpu-py3")
            		.imageUri(imageUri)
                    .containerEntrypoint("python3",pythonScriptpath).build())
            //.roleArn(constants.getRoleArn())
            .roleArn(roleArn)
            //.environment(ImmutableMap.of(constants.getEnvironment(), constants.getMap()))
            .environment(ImmutableMap.of("PYTHONUNBUFFERED","TRUE"))
            // .processingJobArguments(ImmutableMap.of("python_code",pythonCode))
            // .command(Arrays.asList("python","-c",pythonCode))
            // .environment(createEnvironmentVariables(pythonCode))
            .processingInputs(inputs).build();
    // sageMakerClient.createProcessingJob(request);
    CreateProcessingJobResponse response = sageMakerClient.createProcessingJob(request);
    
    // String s3LogsPath = "s3://aws-coe-pratice/logs/";


    return processingJobName;
}

//	private static List<ProcessingInput> createProcessingInputs(String s3CodePath) {
//		ProcessingS3Input processingS3Input = ProcessingS3Input.builder()
//				// S3Input s3Input = S3Input.builder()
//				.s3Uri(s3CodePath)
//				// .s3DataType(S3DataType.S3_PREFIX)
//				// .S3DataType("S3_PREFIX")
//				.s3DataType("S3Prefix").s3InputMode("File").localPath("/opt/ml/processing/input/code")
//				// .s3DownloadMode("File")
//				.build();
//		// processingS3Input.setS3DataType("S3Prefix");
//
//		ProcessingInput processingInput = ProcessingInput.builder().inputName("python_code").s3Input(processingS3Input)
//				.build();
//		return Collections.singletonList(processingInput);
//	}


	private boolean checkPipelineExists(List<ICIPNativeJobDetails> nativeJobDetails, JSONObject connDetails,
			ICIPDatasource uploadDs, Integer version, JSONObject attributes) {
		String pipelineId = pipelineService.getPipelineId(version.toString(), nativeJobDetails.get(0).getCname(),
				nativeJobDetails.get(0).getOrg());
		if (pipelineId != null)
			return true;
		else
			return false;
	}
	private String generateArtifactsPath(List<ICIPNativeJobDetails> nativeJobDetails, JSONObject attributes) {
		// return attributes.getString("projectId") + "/" +
		// attributes.getString("pipelineName") + "/"
		// + attributes.get("version") + "/input" + "/" +
		// attributes.get("object").toString();
		return "";
	}

	public String sanitizePipelineName(String name) {
		return name.toLowerCase().replaceAll("[^a-zA-Z0-9]", "");

	}

	@Override
	public void interrupt() throws UnableToInterruptJobException {
		log.debug("Interrupting worker thread");
		workerThread.interrupt();

	}

	@Override
	public JSONObject getJson() {
		JSONObject ds = new JSONObject();
		try {
			ds.put("type", "AWSSAGEMAKER");

		} catch (JSONException e) {
			log.error("plugin attributes mismatch", e);
		}
		return ds;
	}

	private TrustManager[] getTrustAllCerts() {
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

	private SSLContext getSslContext(TrustManager[] trustAllCerts) {
		SSLContext sslContext = null;
		try {
			sslContext = SSLContext.getInstance("TLSv1.2");

			sslContext.init(null, trustAllCerts, new java.security.SecureRandom());
		} catch (KeyManagementException | NoSuchAlgorithmException e) {
			log.error(e.getMessage(), e);
		}
		return sslContext;
	}

	public int gen() {
		Random r = new Random(System.currentTimeMillis());
		return ((1 + r.nextInt(2)) * 10000 + r.nextInt(10000));
	}

	@SuppressWarnings("deprecation")
	@Override
	public String getNativeJobCommand(ICIPNativeJobDetails jobDetails) throws EssedumException, InvalidRemoteException, TransportException, GitAPIException {
		String cname = jobDetails.getCname();
		String org = jobDetails.getOrg();
		String params = jobDetails.getParams();
		String cmdStr = null;
		log.info("running native script");
		String data = pipelineService.getJson(cname, org);

		JsonObject attrObject;
		try {
			attrObject = gson.fromJson(data, JsonElement.class).getAsJsonObject().get("elements").getAsJsonArray()
					.get(0).getAsJsonObject().get("attributes").getAsJsonObject();
		} catch (Exception ex) {
			String msg = "Error in fetching elements[0].attributes : " + ex.getClass().getCanonicalName() + " - "
					+ ex.getMessage();
			log.error(msg, ex);
			throw new EssedumException(msg, ex);
		}

		String tmpfileType;
		try {
			tmpfileType = attrObject.get("filetype").getAsString().toLowerCase().trim();
		} catch (Exception ex) {
			String msg = "Error in getting filetype : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);
			throw new EssedumException(msg, ex);
		}

		String[] separator = new String[] { "" };
		switch (tmpfileType) {
		case IAIJobConstants.PYTHON2:
		case IAIJobConstants.PYTHON3:
			separator[0] = ":";
			break;
		case "javascript":
			separator[0] = "=";
			break;
		default:
			log.error(INVALID_TYPE);
		}
		StringBuilder paths = new StringBuilder();

		JsonArray files;
		try {
			files = attrObject.get("files").getAsJsonArray();
		} catch (Exception ex) {
			String msg = "Error in getting file array : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);
			throw new EssedumException(msg, ex);
		}

		for (JsonElement file : files) {
			String filePathString = file.getAsString();
			Path path;
			InputStream is = null;
			try {
				is = iCIPFileService.getNativeCodeInputStream(cname, org, filePathString);
				path = iCIPFileService.getFileInServer(is, filePathString, FileConstants.NATIVE_CODE);
			} catch (IOException | SQLException ex) {
				String msg = "Error in getting file path : " + ex.getClass().getCanonicalName() + " - "
						+ ex.getMessage();
				log.error(msg, ex);
				throw new EssedumException(msg, ex);
			} finally {
				if (is != null) {
					try {
						is.close();
					} catch (IOException ex) {
						log.error(ex.getMessage(), ex);
					}
				}
			}
			paths.append(path.getFileName());
			paths.append(",");
		}
		if (paths.length() > 0)
			paths.replace(paths.length() - 1, paths.length(), "");

		Map<String, String> argumentBuilder = new HashMap<>();
		JsonArray argumentArray = getLatestArgument(attrObject, params, gson);
		for (JsonElement argument : argumentArray) {
			JsonObject element = argument.getAsJsonObject();
			String key = element.get("name").toString();
			JsonElement tmpValue = element.get("value");
			String value = tmpValue.toString();
			if (element.has("type") && !element.get("type").getAsString().equals("Text")) {
				value = tmpValue.getAsString();
				switch (element.get("type").getAsString()) {
				case "Datasource":
					ICIPDatasource datasource = datasourceService.getDatasource(value, org);
					JsonObject connDetails;
					try {
						connDetails = gson.fromJson(datasource.getConnectionDetails(), JsonElement.class)
								.getAsJsonObject();
					} catch (Exception ex) {
						String msg = "Error in getting datasource : " + ex.getClass().getCanonicalName() + " - "
								+ ex.getMessage();
						log.error(msg, ex);
						throw new EssedumException(msg, ex);
					}
					connDetails.addProperty("salt", datasource.getSalt());
					value = String.format(LoggerConstants.STRING_STRING_STRING, "\"",
							StringEscapeUtils.escapeJson(gson.toJson(connDetails)), "\"");
					break;
				case "Dataset":
					JsonParser parser = new JsonParser();
					ICIPDataset dataset = datasetService.getDataset(value, org);
					JsonElement e;
					try {
						e = parser.parse(gson.toJson(dataset));
					} catch (Exception ex) {
						String msg = "Error in getting dataset : " + ex.getClass().getCanonicalName() + " - "
								+ ex.getMessage();
						log.error(msg, ex);
						throw new EssedumException(msg, ex);
					}
					for (Entry<String, JsonElement> schemaentry : e.getAsJsonObject().entrySet()) {
						if (schemaentry.getKey().equals(IAIJobConstants.SCHEMA)) {
							JsonObject obj = schemaentry.getValue().getAsJsonObject();
							ICIPSchemaDetails schemaDetails = new ICIPSchemaDetails();
							try {
								String schemaValue = obj.get("schemavalue").getAsString();
								JsonElement schemaElem = parser.parse(schemaValue);
								schemaDetails.setSchemaDetails(schemaElem.getAsJsonArray());
								schemaDetails.setSchemaId(obj.get("name").getAsString());
								e.getAsJsonObject().remove(IAIJobConstants.SCHEMA);
								e.getAsJsonObject().add(IAIJobConstants.SCHEMA,
										parser.parse(gson.toJson(schemaDetails)));
							} catch (Exception ex) {
								String msg = "Error in getting schema from dataset : "
										+ ex.getClass().getCanonicalName() + " - " + ex.getMessage();
								log.error(msg, ex);
								throw new EssedumException(msg, ex);
							}
							break;
						}
					}
					value = String.format(LoggerConstants.STRING_STRING_STRING, "\"",
							StringEscapeUtils.escapeJson(gson.toJson(e)), "\"");
					break;
				case "Schema":
					try {
						value = String.format(LoggerConstants.STRING_STRING_STRING, "\"",
								StringEscapeUtils.escapeJson(schemaRegistryService.fetchSchemaValue(value, org)), "\"");
					} catch (Exception ex) {
						String msg = "Error in getting schema : " + ex.getClass().getCanonicalName() + " - "
								+ ex.getMessage();
						log.error(msg, ex);
						throw new EssedumException(msg, ex);
					}
					break;
				default:
					log.error(INVALID_TYPE);
				}
			}
			argumentBuilder.put(key, resolver.resolveDatasetData(value, org));
		}
		addTriggerTime(argumentBuilder, jobDetails.getTriggerValues());
		String arguments = "";
		String version = attrObject.has("version") ? attrObject.get("version").getAsString().trim() : "";
		if (version.equalsIgnoreCase("v2")) {
			try {
				Path tmpPath = Files.createTempDirectory("nativescript");
				Path filePath = Paths.get(tmpPath.toAbsolutePath().toString(),
						String.format("%s.yaml", ICIPUtils.removeSpecialCharacter(jobDetails.getCname())));
				Files.createDirectories(filePath.getParent());
				Files.deleteIfExists(filePath);
				Files.createFile(filePath);
				writeTempFile(createNativeYamlscript(argumentBuilder), filePath);
				arguments = filePath.toAbsolutePath().toString();
			} catch (Exception ex) {
				throw new EssedumException(ex.getMessage(), ex);
			}
		} else {
			StringBuilder args = new StringBuilder();
			argumentBuilder.forEach((key, value) -> args.append(" ").append(key).append(separator[0]).append(value));
			arguments = args.toString();
		}
		switch (tmpfileType) {
		case IAIJobConstants.PYTHON2:
			cmdStr = resolveCommand(
					version.equalsIgnoreCase("v2") ? nativescriptPython2V2Command : nativescriptPython2Command,
					new String[] { paths.toString(), arguments });
			break;
		case IAIJobConstants.PYTHON3:
			cmdStr = resolveCommand(
					version.equalsIgnoreCase("v2") ? nativescriptPythonV2Command : nativescriptPythonCommand,
					new String[] { paths.toString(), arguments });
			break;
		case "javascript":
			cmdStr = resolveCommand(
					version.equalsIgnoreCase("v2") ? nativescriptJavascriptV2Command : nativescriptJavascriptCommand,
					new String[] { paths.toString(), arguments });
			break;
		default:
			log.error(INVALID_TYPE);
		}
		return cmdStr;
	}

	/**
	 * Gets the latest argument.
	 *
	 * @param binary the binary
	 * @param params the params
	 * @param gson   the gson
	 * @return the latest argument
	 * @throws EssedumException the essedum exception
	 */
	private JsonArray getLatestArgument(JsonObject binary, String params, Gson gson) throws EssedumException {
		try {
			JsonArray binaryArray = binary.get("arguments").getAsJsonArray();
			if (!(params == null || params.trim().isEmpty() || params.trim().equals("{}"))) {
				JsonObject paramsObject = gson.fromJson(params, JsonElement.class).getAsJsonObject();
				for (JsonElement binaryElement : binaryArray) {
					JsonObject binaryObject = binaryElement.getAsJsonObject();
					Set<String> paramsKeySet = paramsObject.keySet();
					String key = null;
					try {
						key = binaryObject.get("name").getAsString();
					} catch (Exception ex) {
						log.error("getAsString() method error!");
						key = binaryObject.get("name").toString();
					}
					if (paramsKeySet.contains(key)) {
						String value = null;
						try {
							value = paramsObject.get(key).getAsString();
						} catch (Exception ex) {
							log.error("getAsString() method error!");
							value = paramsObject.get(key).toString();
						}
						binaryObject.addProperty("value", value);
					}
				}
			}
			return binaryArray;
		} catch (Exception ex) {
			String msg = "Error in getting arguments : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);
			throw new EssedumException(msg, ex);
		}
	}

	/**
	 * Creates the native yamlscript.
	 *
	 * @param data the data
	 * @return the string builder
	 * @throws EssedumException the essedum exception
	 */
	private StringBuilder createNativeYamlscript(Map<String, String> data) throws EssedumException {
		try {
			log.info("creating native yaml script");
			Yaml yaml = new Yaml();
			return new StringBuilder().append(yaml.dumpAsMap(data));
		} catch (Exception ex) {
			String msg = "Error in creating yaml file : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);
			throw new EssedumException(msg, ex);
		}
	}

	@Override
	public String getDragAndDropJobCommand(ICIPNativeJobDetails jobDetails) throws EssedumException {
		String cname = jobDetails.getCname();
		String org = jobDetails.getOrg();
		String params = jobDetails.getParams();
		String cmdStr;
		log.info("running draganddrop pipeline");
		String data = pipelineService.getJson(cname, org);
		JsonObject correlationJson = new JsonObject();
		if (jobDetails.isRestNode()) {
			try {
				correlationJson = createCorrelationFile(params, jobDetails.getId(),
						IAIJobConstants.CORRELATIONFILEDIRECTORY);
			} catch (IOException ex) {
				String msg = "Error in creating correlation file : " + ex.getClass().getCanonicalName() + " - "
						+ ex.getMessage();
				log.error(msg, ex);
				throw new EssedumException(msg, ex);
			}
		}
		data = String.format("%s%s%s", "{\"input_string\":", data, "}");

		try {
			data = pipelineService.populateDatasetDetails(data, jobDetails.getOrg());
		} catch (Exception ex) {
			String msg = "Error in populating dataset : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);
			throw new EssedumException(msg, ex);
		}

		try {
			data = pipelineService.populateSchemaDetails(data, jobDetails.getOrg());
		} catch (Exception ex) {
			String msg = "Error in populating schema : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);
			throw new EssedumException(msg, ex);
		}

		if (params != null && !params.isEmpty() && !params.equals("{}")) {
			try {
				data = pipelineService.populateAttributeDetails(data, params);
			} catch (Exception ex) {
				String msg = "Error in populating attributes : " + ex.getClass().getCanonicalName() + " - "
						+ ex.getMessage();
				log.error(msg, ex);
				throw new EssedumException(msg, ex);
			}
		}

		data = resolver.resolveDatasetData(data, org);

		if (jobDetails.isRestNode()) {
			writeTempFile(createDragNDropYamlscript(data, org, cname, correlationJson, jobDetails),
					jobDetails.getYamltempFile());
			cmdStr = resolveCommand(dragAndDropCommandWithRestNode, new String[] {});
		} else {
			writeTempFile(createDragNDropYamlscript(data, org, cname, jobDetails), jobDetails.getYamltempFile());
			cmdStr = resolveCommand(dragAndDropCommand, new String[] {});
		}
		return cmdStr;
	}

	/**
	 * Creates the drag N drop yamlscript.
	 *
	 * @param elementsData the elements data
	 * @param org          the org
	 * @param pipelineName the pipeline name
	 * @param jobDetails   the job details
	 * @return the string builder
	 * @throws EssedumException the essedum exception
	 */
	private StringBuilder createDragNDropYamlscript(Object elementsData, String org, String pipelineName,
			ICIPNativeJobDetails jobDetails) throws EssedumException {
		try {
			log.info("creating draganddrop yaml script");
			Yaml yaml = new Yaml();
			Map<String, Object> root = new HashMap<>();
			Map<String, Object> buildDAG = new HashMap<>();
			Map<String, Object> inputs = new HashMap<>();
			Map<String, Object> pipelineJson = new HashMap<>();
			Map<String, Object> value = new HashMap<>();

			buildDAG.put(IAIJobConstants.BUILDDAG, inputs);
			inputs.put(IAIJobConstants.INPUTS, pipelineJson);
			pipelineJson.put(IAIJobConstants.PIPELINEJSON, value);
			JsonObject elementDJson = new Gson().fromJson(elementsData.toString(), JsonElement.class).getAsJsonObject();
			JsonObject element = elementDJson.get("input_string").getAsJsonObject();
			element.addProperty(JobConstants.ORG, org);
			addTriggerTime(element, jobDetails.getTriggerValues());
			element.addProperty(IAIJobConstants.PIPELINENAME, pipelineName);
			value.put(IAIJobConstants.VALUE, element.toString());
			root.put(IAIJobConstants.SOLIDS, buildDAG);
			root.put(IAIJobConstants.LOGGERS, getLoggersValue());

			return new StringBuilder().append(yaml.dump(root));
		} catch (Exception ex) {
			String msg = "Error in creating yaml file : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);
			throw new EssedumException(msg, ex);
		}
	}

	/**
	 * Creates the drag N drop yamlscript.
	 *
	 * @param elementsData the elements data
	 * @param org          the org
	 * @param pipelineName the pipeline name
	 * @param restNodeJson the rest node json
	 * @param jobDetails   the job details
	 * @return the string builder
	 * @throws EssedumException the essedum exception
	 */
	private StringBuilder createDragNDropYamlscript(Object elementsData, String org, String pipelineName,
			JsonObject restNodeJson, ICIPNativeJobDetails jobDetails) throws EssedumException {
		try {
			log.info("creating draganddrop yaml script");
			Yaml yaml = new Yaml();
			Map<String, Object> root = new HashMap<>();
			Map<String, Object> buildDAG = new HashMap<>();
			Map<String, Object> inputs = new HashMap<>();
			Map<String, Object> pipelineJson = new HashMap<>();
			Map<String, Object> value = new HashMap<>();

			buildDAG.put(IAIJobConstants.BUILDDAG, inputs);
			inputs.put(IAIJobConstants.INPUTS, pipelineJson);
			pipelineJson.put(IAIJobConstants.PIPELINEJSON, value);
			JsonObject elementDJson = new Gson().fromJson(elementsData.toString(), JsonElement.class).getAsJsonObject();
			JsonObject element = elementDJson.get("input_string").getAsJsonObject();
			element.addProperty(JobConstants.ORG, org);
			element.addProperty(IAIJobConstants.PIPELINENAME, pipelineName);
			element.addProperty(JobConstants.RESTNODEID, restNodeJson.get(JobConstants.RESTNODEID).getAsString());
			element.addProperty(IAIJobConstants.RESTNODEFILE,
					restNodeJson.get(IAIJobConstants.RESTNODEFILE).getAsString());
			addTriggerTime(element, jobDetails.getTriggerValues());
			value.put(IAIJobConstants.VALUE, element.toString());
			root.put(IAIJobConstants.SOLIDS, buildDAG);
			root.put(IAIJobConstants.LOGGERS, getLoggersValue());

			return new StringBuilder().append(yaml.dump(root));
		} catch (Exception ex) {
			String msg = "Error in creating yaml file : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);
			throw new EssedumException(msg, ex);
		}
	}

	/**
	 * Creates the correlation file.
	 *
	 * @param params    the params
	 * @param id        the id
	 * @param directory the directory
	 * @return the json object
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	private JsonObject createCorrelationFile(String params, String id, String directory) throws IOException {
		String alteredId = ICIPUtils.removeSpecialCharacter(id);
		Path path = Paths.get(annotationServiceUtil.getFolderPath(), directory,
				alteredId + IAIJobConstants.CORRELATIONEXTENSION);
		log.info("uploading file at {}", path.toAbsolutePath());
		Files.createDirectories(path.getParent());
		byte[] strToBytes = params.getBytes();
		Files.write(path, strToBytes);
		JsonObject jsonObject = new JsonObject();
		jsonObject.addProperty(JobConstants.RESTNODEID, id);
		jsonObject.addProperty(IAIJobConstants.RESTNODEFILE, path.toAbsolutePath().toString());
		return jsonObject;
	}

	@Override
	public String getBinaryJobCommand(ICIPNativeJobDetails jobDetails) throws EssedumException {
		String cname = jobDetails.getCname();
		String org = jobDetails.getOrg();
		String cmdStr;
		log.info("running binary pipeline");
		String data = pipelineService.getJson(cname, org);

		JsonObject binary = null;
		try {
			binary = gson.fromJson(data, JsonElement.class).getAsJsonObject().get("elements").getAsJsonArray().get(0)
					.getAsJsonObject().get("attributes").getAsJsonObject();
		} catch (Exception ex) {
			String msg = "Error in fetching elements[0].attributes : " + ex.getClass().getCanonicalName() + " - "
					+ ex.getMessage();
			log.error(msg, ex);
			throw new EssedumException(msg, ex);
		}

		String tmpfileType = null;
		try {
			tmpfileType = binary.get("filetype").getAsString().toLowerCase();
		} catch (Exception ex) {
			String msg = "Error in getting filetype : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);
			throw new EssedumException(msg, ex);
		}

		String fileType = "";
		StringBuilder paths2 = new StringBuilder();

		JsonArray files2 = null;
		try {
			files2 = binary.get("files2").getAsJsonArray();
		} catch (Exception ex) {
			String msg = "Error in getting file array : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);
			throw new EssedumException(msg, ex);
		}

		for (JsonElement file : files2) {
			String filePathString = file.getAsString();
			Path path;
			InputStream fis = null;
			try {
				fis = iCIPFileService.getBinaryInputStream(cname, org, filePathString);
				path = iCIPFileService.getFileInServer(fis, filePathString, FileConstants.BINARY);
			} catch (IOException | SQLException ex) {
				String msg = "Error in getting file path : " + ex.getClass().getCanonicalName() + " - "
						+ ex.getMessage();
				log.error(msg, ex);
				throw new EssedumException(msg, ex);
			} finally {
				if (fis != null) {
					try {
						fis.close();
					} catch (Exception ex) {
						log.error(ex.getMessage(), ex);
					}
				}
			}
			paths2.append(path.toAbsolutePath());
			paths2.append(",");
		}
		if (paths2.length() > 0) {
			paths2.replace(paths2.length() - 1, paths2.length(), "");
			switch (tmpfileType) {
			case "jar":
				fileType = " --jars ";
				break;
			case "python":
				fileType = " --py-files ";
				break;
			default:
				log.error("Invalid format");
			}
		}

		StringBuilder paths = new StringBuilder();

		JsonArray files;
		try {
			files = binary.get("files").getAsJsonArray();
		} catch (Exception ex) {
			String msg = "Error in getting file array : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);
			throw new EssedumException(msg, ex);
		}

		for (JsonElement file : files) {
			String filePathString = file.getAsString();
			Path path;
			InputStream is = null;
			try {
				is = iCIPFileService.getBinaryInputStream(cname, org, filePathString);
				path = iCIPFileService.getFileInServer(is, filePathString, FileConstants.BINARY);
			} catch (IOException | SQLException ex) {
				String msg = "Error in getting file path : " + ex.getClass().getCanonicalName() + " - "
						+ ex.getMessage();
				log.error(msg, ex);
				throw new EssedumException(msg, ex);
			} finally {
				if (is != null) {
					try {
						is.close();
					} catch (IOException ex) {
						log.error(ex.getMessage(), ex);
					}
				}
			}
			paths.append(path.toAbsolutePath());
			paths.append(",");
		}
		if (paths.length() > 0)
			paths.replace(paths.length() - 1, paths.length(), "");

		String classString;
		try {
			classString = binary.get("className").getAsString();
		} catch (Exception ex) {
			String msg = "Error in getting class name : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);
			throw new EssedumException(msg, ex);
		}

		String arguments;
		try {
			arguments = binary.get("arguments").getAsString();
		} catch (Exception ex) {
			String msg = "Error in getting arguments : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);
			throw new EssedumException(msg, ex);
		}

		cmdStr = resolveCommand(binaryCommand,
				new String[] { classString, fileType, paths2.toString(), paths.toString(), arguments });
		return cmdStr;
	}

	/**
	 * Gets the attribute hash string.
	 *
	 * @param job the job
	 * @return the attribute hash string
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 * @throws EssedumException            the essedum exception
	 */
	private String getAttributeHashString(JobObjectDTO job) throws NoSuchAlgorithmException, EssedumException {
		String params = job.getJobs().get(0).getParams();
		String nameAndOrg = job.getName().toString() + job.getOrg();
		if (params == null) {
			params = UUID.randomUUID().toString();
		}
		String attributesHash = ICIPUtils.createHashString(nameAndOrg);
		switch (job.getJobType()) {
		case CHAIN:
			return attributesHash;
		case AGENT:
			ICIPAgentJobs tmpAgentJob = agentJobsService.findByHashparams(attributesHash);
			// checking if job with the hashValue exists in mlagentsjob table and is not in
			// running state
			if (tmpAgentJob != null && tmpAgentJob.getJobStatus().equalsIgnoreCase(JobStatus.RUNNING.toString())) {
				return null;
			}
			return attributesHash;
		case PIPELINE:
			ICIPJobs tmpJob = jobsService.findByHashparams(attributesHash);
			// checking if job with the hashValue exists in mljobs table and is not in
			// running state
			if (tmpJob != null && tmpJob.getJobStatus().equalsIgnoreCase(JobStatus.RUNNING.toString())) {
				return null;
			}
			return attributesHash;
		default:
			throw new EssedumException(INVALID_JOBTYPE);
		}
	}


	@Override
	public String getAzureJobCommand(ICIPNativeJobDetails jobDetails) throws EssedumException {
		// TODO Auto-generated method stub
		return null;
	}

}
