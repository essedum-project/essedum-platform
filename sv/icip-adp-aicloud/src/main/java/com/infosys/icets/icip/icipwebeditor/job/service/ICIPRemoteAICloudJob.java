package com.infosys.icets.icip.icipwebeditor.job.service;

import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.RandomAccessFile;
import java.nio.channels.FileChannel;
import java.nio.channels.FileLock;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.KeyException;
import java.security.KeyManagementException;
import java.security.KeyStore;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;

import org.apache.commons.text.StringEscapeUtils;
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

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;
import com.infosys.icets.ai.comm.lib.util.dto.ResolvedSecret;
import com.infosys.icets.ai.comm.lib.util.dto.Secret;
import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.ai.comm.lib.util.service.SecretsManagerService;
import com.infosys.icets.icip.dataset.model.ICIPDataset;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;
import com.infosys.icets.icip.dataset.model.ICIPSchemaDetails;
import com.infosys.icets.icip.dataset.service.IICIPDatasourcePluginsService;
import com.infosys.icets.icip.dataset.service.IICIPDatasourceService;
import com.infosys.icets.icip.dataset.service.impl.ICIPDatasetService;
import com.infosys.icets.icip.dataset.service.impl.ICIPDatasourceService;
import com.infosys.icets.icip.dataset.service.impl.ICIPSchemaRegistryService;
import com.infosys.icets.icip.dataset.service.util.IICIPDataSourceServiceUtil;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.AICloudService;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.AICloudServiceV2;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.AICloudBody;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.AICloudBodyV2;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.AICloudPipelineConfig;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.AICloudTrialBody;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.AICloudeJobMetadata;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.AlCloudJobMetaDataV2;
import com.infosys.icets.icip.icipwebeditor.IICIPJobRuntimeServiceUtil;
import com.infosys.icets.icip.icipwebeditor.IICIPJobServiceUtil;
import com.infosys.icets.icip.icipwebeditor.constants.AlertConstants;
import com.infosys.icets.icip.icipwebeditor.constants.FileConstants;
import com.infosys.icets.icip.icipwebeditor.constants.IAIJobConstants;
import com.infosys.icets.icip.icipwebeditor.constants.LoggerConstants;
import com.infosys.icets.icip.icipwebeditor.executor.sync.service.JobSyncExecutorService;
import com.infosys.icets.icip.icipwebeditor.file.service.ICIPFileService;
import com.infosys.icets.icip.icipwebeditor.job.constants.JobConstants;
import com.infosys.icets.icip.icipwebeditor.job.enums.JobMetadata;
import com.infosys.icets.icip.icipwebeditor.job.enums.JobStatus;
import com.infosys.icets.icip.icipwebeditor.job.enums.RuntimeType;
import com.infosys.icets.icip.icipwebeditor.job.listener.ICIPJobSchedulerListener;
import com.infosys.icets.icip.icipwebeditor.job.model.ICIPInternalJobs.MetaData;
import com.infosys.icets.icip.icipwebeditor.job.model.TriggerValues;
import com.infosys.icets.icip.icipwebeditor.job.model.dto.JobObjectDTO;
import com.infosys.icets.icip.icipwebeditor.job.model.dto.JobObjectDTO.Jobs;
import com.infosys.icets.icip.icipwebeditor.job.service.util.ICIPCommonJobServiceUtil;
import com.infosys.icets.icip.icipwebeditor.job.service.util.ICIPInitializeAnnotationServiceUtil;
import com.infosys.icets.icip.icipwebeditor.jobmodel.service.ICIPAgentJobsService;
import com.infosys.icets.icip.icipwebeditor.jobmodel.service.ICIPJobsService;
import com.infosys.icets.icip.icipwebeditor.model.ICIPAgentJobs;
import com.infosys.icets.icip.icipwebeditor.model.ICIPJobs;
import com.infosys.icets.icip.icipwebeditor.model.ICIPStreamingServices;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPNativeJobDetails;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPStreamingServicesRepository;
import com.infosys.icets.icip.icipwebeditor.service.IICIPStreamingServiceService;
import com.infosys.icets.icip.icipwebeditor.service.aspect.IAIResolverAspect;
import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPJobsPluginsService;
import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPPipelineService;
import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPRuntimeLoggerService;

import lombok.extern.log4j.Log4j2;
import okhttp3.Call;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

@Log4j2
@Component("aicloudjobruntime")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@RefreshScope
public class ICIPRemoteAICloudJob extends ICIPCommonJobServiceUtil implements IICIPJobRuntimeServiceUtil {

	public ICIPRemoteAICloudJob() {
		super();
	}

	@Autowired
	private SecretsManagerService smService;

	@Autowired
	AICloudServiceV2 aiCloudServiceV2Test;
	@Autowired
	AICloudService aiCloudService;
	@LeapProperty("icip.certificateCheck")
	private String certificateCheck;
	@Autowired
	private IICIPDatasourcePluginsService dsPluginService;

	@Autowired
	private IICIPDatasourceService dsService;

	/** The logger. */
	private final Logger logger = LoggerFactory.getLogger(ICIPRemoteAICloudJob.class);

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

	@Autowired
	private IICIPStreamingServiceService streamingServicesService;

	@LeapProperty("icip.pipelineScript.directory")
	private String pipelineScriptPath;

	/** The resolver. */
	@Autowired
	private IAIResolverAspect resolver;
	private String nativescriptPythonCommand = "python #";

	private String nativescriptPython2Command = "python #";

	private String nativescriptJavascriptCommand = "node # #";

	private String nativescriptPythonV2Command = "python # #";

	private String nativescriptPython2V2Command = "python # #";

	private String nativescriptJavascriptV2Command = "node # #";

	private String binaryCommand = "/venv/lib/python3.7/site-packages/pyspark/bin/spark-submit --class # # # # #";

	private String dragAndDropCommand = "python #";

	private String dragAndDropCommandWithRestNode = "python #";

	/** The Constant INVALID_TYPE. */
	private static final String INVALID_TYPE = "Invalid Type";

	/** The Constant INVALID_JOBTYPE. */
	private static final String INVALID_JOBTYPE = "Invalid JobType";

	/** The annotation service util. */
	@Autowired
	private ICIPInitializeAnnotationServiceUtil annotationServiceUtil;

	private transient Thread workerThread;

	private static final String AICLOUD = "aicloud";

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
		logger.info("dataSource Name is " + datasourceName);
		try {
			// adding jobListner to the current job scheduler
			context.getScheduler().getListenerManager().addJobListener(
					new ICIPJobSchedulerListener("JobListener-" + jobDetail.getKey()),
					KeyMatcher.keyEquals(jobDetail.getKey()));
		} catch (SchedulerException e2) {
			logger.error("Exception", e2.getMessage());
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
							AICLOUD, null, attributesHash, jobObject.getCorelId(), null, gson.toJson(pipelineMetadata),
							0, "{}", "{}", "{}", "{}", "{}");
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
					logger.info("Upload DataSource is " + uploadDsName);
					ICIPDatasource uploadDs = dsService.getDatasource(uploadDsName, org);
					String pipelineJson = pipelineService.getJson(cname, org);
					JsonObject jsonObject = new Gson().fromJson(pipelineJson, JsonElement.class).getAsJsonObject();
					/*
					 * // ---------------------------------NODES CODE
					 * STARTS------------------------- JSONObject sam_pay =
					 * streamingServicesService.getGeneratedScript(job.getName(),org); JSONArray
					 * sam_array = sam_pay.getJSONArray("script"); Object s_a = sam_array.get(0);
					 * JsonArray jsonArray = (JsonArray) jsonObject.get("elements");
					 * 
					 * JsonObject v2_steps_payload = new JsonObject(); for (int i = 0; i <
					 * jsonArray.size(); i++) { JsonObject json = (JsonObject) jsonArray.get(i);
					 * JsonObject j = (JsonObject) json.get("attributes");
					 * //------------inputartifacts---------------------------------- String
					 * inputArtifactsString = j.get("inputArtifacts").getAsString();
					 * j.remove("inputArtifacts"); JsonElement inputArtifactsJsonElement =
					 * JsonParser.parseString(inputArtifactsString); JsonObject
					 * inputArtifactsJsonObject = inputArtifactsJsonElement.getAsJsonObject();
					 * j.add("inputArtifacts", inputArtifactsJsonObject);
					 * 
					 * //-------------------------------------------------------------
					 * 
					 * //---------------------output------------------------- String outputString =
					 * j.get("output").getAsString(); j.remove("output"); JsonElement output =
					 * JsonParser.parseString(outputString); JsonObject outputObject =
					 * output.getAsJsonObject(); j.add("output", outputObject);
					 * 
					 * //--------------------------------------------------
					 * 
					 * //-------------------input------------------------ String inputString =
					 * j.get("input").getAsString(); j.remove("input"); JsonElement input =
					 * JsonParser.parseString(inputString); JsonObject inputObject =
					 * input.getAsJsonObject(); j.add("input", inputObject);
					 * 
					 * //-------------------------------------------------
					 * 
					 * // JsonObject s = gson.fromJson(jz.toString(),JsonObject.class); String step
					 * = json.get("alias").getAsString(); v2_steps_payload.add(step,
					 * json.getAsJsonObject("attributes"));
					 * 
					 * }
					 * 
					 * // -----------------NODES CODE ENDS HERE----------------------------------
					 */
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
					HashMap<String, String> secrets = new HashMap<>();
					JsonArray environ = new JsonArray();
					JsonObject envJSONO = new JsonObject();
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

						if (jsonObject.has("environment")) {
							environ = jsonObject.getAsJsonArray("environment");
						}

						String runtime = connDetails.getString("runtime");

						if (runtime.equals("v2") && jsonObject.has("environment")) {
							for (int i = 0; i < environ.size(); i++) {
								JsonObject envJSON = environ.get(i).getAsJsonObject();
								String key = envJSON.get("name").getAsString();
								String value = envJSON.get("value").getAsString();
								envJSONO.addProperty(key, value);
							}

						}

						try {
							secrets = resolveSecrets(pipelineArgs, org);
						} catch (Exception e) {
							logger.error("Resolve secret is NULL");
							secrets = null;
						}
						if (secrets != null && runtime.equals("v1")) {
							JSONObject secJ = new JSONObject(secrets);

							Iterator<String> keys = secJ.keys();
							while (keys.hasNext()) {
								String key = keys.next();
								JsonObject envJSONO1 = new JsonObject();
								envJSONO1.addProperty("name", key);
								envJSONO1.addProperty("value", (String) secJ.get(key));
								environ.add(envJSONO1);

							}
						} else if (runtime.equals("v2") && secrets != null) {
							JSONObject secJ = new JSONObject(secrets);

							Iterator<String> keys = secJ.keys();
							while (keys.hasNext()) {
								String key = keys.next();
								envJSONO.addProperty(key, secJ.getString(key));

							}

						}

						if (pipelineArgs != null && !pipelineArgs.isEmpty()) {
							pipelineArgs.forEach(args -> {
								JSONObject temp = new JSONObject(args.toString());
//								configs.put(temp.getString("name").trim(), temp.getString("value").trim());
								if (temp.has("name") && temp.getString("name").trim() != null) {
									if (temp.getString("name") != "usedSecrets") {
										configs.put(temp.getString("name").trim(), temp.getString("value").trim());
									}
								}
								if (temp.has("key") && temp.getString("key").trim() != null) {
									configs.put(temp.getString("key").trim(), temp.getString("value").trim());
								}
							});
						}
					}
					configs.remove("usedSecrets");
					ObjectMapper mapper = new ObjectMapper();
					AICloudPipelineConfig pipelinConfig = mapper.convertValue(configs, AICloudPipelineConfig.class);

					String msg = String.format("%s", "About to run the job");
					log.info(msg);
					runCmd = getRunCommand(job, nativeJobDetails);

					runScript(version, runCmd, jobUtilConn, nativeJobDetails, connDetails, uploadDs, job,
							datasourceName, pipelinConfig, environ, envJSONO, org, cname);
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
					String msg = "Error in running job : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
					log.error(msg, ex.getMessage());
					throw new LeapException(msg, ex);
				}

			}
		} catch (

		Exception ex) {
			Path outPath = Paths.get(annotationServiceUtil.getFolderPath(),
					String.format(LoggerConstants.STRING_DECIMAL_STRING, IAIJobConstants.PIPELINELOGPATH,
							iCIPJobs.getId(), IAIJobConstants.OUTLOG));

			// String error = "Error in Job Execution : " + ex.getMessage()
			// + System.getProperty(IAIJobConstants.LINE_SEPARATOR) + ex.toString();
			// log.error(error, ex.getMessage());
			log.error("Error in Job Execution : " + ex.getMessage());
			FileChannel channel = null;
			RandomAccessFile writer = null;
			try {
				Files.deleteIfExists(outPath);
				Files.createFile(outPath);
				writer = new RandomAccessFile(outPath.toString(), "rw");
				channel = writer.getChannel();
				writer.writeBytes(ex.getMessage());
				handlingErrorStatus(ex.getMessage(), jobObject);
			} catch (LeapException | IOException e) {
				log.error(e.getMessage(), e);
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
	 * @throws LeapException the leap exception
	 */
	private void handlingErrorStatus(String error, JobObjectDTO job) throws LeapException {
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

	private String getRunCommand(Jobs job, List<ICIPNativeJobDetails> nativeJobDetails)
			throws LeapException, InvalidRemoteException, TransportException, GitAPIException {
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
		case DRAGNDROPLITE:
			runCmd = getDragAndDropJobCommand(nativeJobDetails.get(0));
			break;
		default:
		}
		return runCmd;
	}

	private Path getUploadFilePath(IICIPJobServiceUtil jobUtilConn, List<ICIPNativeJobDetails> nativeJobDetails)
			throws InvalidRemoteException, TransportException, GitAPIException {
		return jobUtilConn.getFilePath(nativeJobDetails.get(0));

	}

	private String uploadScript(ICIPDatasource uploadDs, String attributes, String uploadFile) throws Exception {
		IICIPDataSourceServiceUtil uploadPluginConn = dsPluginService.getDataSourceService(uploadDs);
		JSONObject attr = new JSONObject(attributes);
		return "s3://" + attr.optString("bucket") + "/" + uploadPluginConn.uploadFile(uploadDs, attributes, uploadFile);
	}

	private ResponseEntity<String> runScript(Integer version, String runCmd, IICIPJobServiceUtil jobUtilConn,
			List<ICIPNativeJobDetails> nativeJobDetails, JSONObject connDetails, ICIPDatasource uploadDs, Jobs job,
			String datasourceName, AICloudPipelineConfig pipelinConfig, JsonArray environ, JsonObject env_v2,
			String org, String cname)
			throws LeapException, InvalidRemoteException, TransportException, GitAPIException, Exception {
		logger.info("Inside runScript Method");
		String status = null;
		String pipelineId = null;
		Path filePath = getUploadFilePath(jobUtilConn, nativeJobDetails);
		String uploadFilePath = filePath.toString();
		/*
		 * if ((connDetails.getString("runtime").toLowerCase()).equals("v2")) {
		 * uploadFilePath = filePath.toString().replace("py", "json"); }
		 */

		JSONObject attributes = new JSONObject().put("bucket", pipelinConfig.getBucketName().toString());
		logger.info("connDetails.projectId is " + connDetails.get("projectId"));
		attributes.put("projectId", connDetails.get("projectId").toString());
		attributes.put("pipelineName", sanitizePipelineName(nativeJobDetails.get(0).getCname()));

		attributes.put("version", version);
		attributes.put("object", filePath.getFileName());

		if ((connDetails.getString("runtime").toLowerCase()).equals("v1")) {
			attributes.put("uploadFilePath", generateArtifactsPath(nativeJobDetails, attributes));
		} else {
			attributes.put("uploadFilePath", generateArtifactsPathV2(nativeJobDetails, attributes));
		}
		String s3path = uploadScript(uploadDs, attributes.toString(), uploadFilePath);

		try {

			if (!checkPipelineExists(nativeJobDetails, connDetails, uploadDs, version, attributes)) {
				logger.info("Before Upload Script");
				logger.info("Script uploaded in " + s3path);
				pipelineId = createPipeline(connDetails, nativeJobDetails, s3path, uploadDs.getType(), runCmd, version,
						pipelinConfig, environ, env_v2, filePath);
				logger.info("pipeline Id " + pipelineId);
				JSONObject pipelineData = new JSONObject();
				pipelineData.put("aiCloudpipelineId", pipelineId);
				pipelineService.updatePipelineMetadata(pipelineData, nativeJobDetails.get(0).getCname(),
						nativeJobDetails.get(0).getOrg(), version);
				logger.info("Updated Pipeline data");
			} else {
				pipelineId = pipelineService.getPipelineId(version.toString(), nativeJobDetails.get(0).getCname(),
						nativeJobDetails.get(0).getOrg());
			}
			logger.info("pipeline Id " + pipelineId);
			AICloudeJobMetadata metaData = new AICloudeJobMetadata();
			AlCloudJobMetaDataV2 metaDataV2 = new AlCloudJobMetaDataV2();
			JSONObject statusResponse = new JSONObject();
			String trialId = null;
			String executePipelineId = null;
			logger.info("Pipeline version is : " + connDetails.getString("runtime"));

			if ((connDetails.getString("runtime").toLowerCase()).equals("v1")) {
				trialId = trialPipeline(pipelineId, connDetails, nativeJobDetails, pipelinConfig);
				logger.info("trailId " + trialId);
				metaData.setTrialId(trialId);
				String trialName = nativeJobDetails.get(0).getId().length() > 24
						? nativeJobDetails.get(0).getId().substring(nativeJobDetails.get(0).getId().length() - 24)
						: nativeJobDetails.get(0).getId();
				metaData.setTrialName("t" + trialName);
				metaData.setProjectId(connDetails.get("projectId").toString());
				metaData.setBucketName(attributes.get("bucket").toString());
				metaData.setAiCloudPipelineId(pipelineId);
				metaData.setPipelineName(attributes.getString("pipelineName"));
				metaData.setLogFilePath(generateLogFilePath(metaData, version));
				metaData.setDatasourceName(datasourceName);
				metaData.setElastic(pipelinConfig.getElasticDatasource());
				metaData.setElasticSearchIndex(pipelinConfig.getElasticSearchIndex());
				metaData.setTag("User");
				iCIPJobs.setJobmetadata(gson.toJson(metaData));
				statusResponse = getPipelineStatus(trialId, connDetails);

			} else if ((connDetails.getString("runtime").toLowerCase()).equals("v2")) {

				executePipelineId = executePipelineV2(pipelineId, connDetails, nativeJobDetails, pipelinConfig, env_v2,
						s3path);
				logger.info("executionId : " + executePipelineId);
				metaDataV2.setExecutePipelineId(executePipelineId);
				String executePipelineName = nativeJobDetails.get(0).getId().length() > 24
						? nativeJobDetails.get(0).getId().substring(nativeJobDetails.get(0).getId().length() - 24)
						: nativeJobDetails.get(0).getId();
				metaDataV2.setExecutePipelineName(executePipelineName);
				metaDataV2.setProjectId(connDetails.get("projectId").toString());
				metaDataV2.setBucketName(attributes.get("bucket").toString());
				metaDataV2.setAiCloudPipelineId(pipelineId);
				metaDataV2.setPipelineName(attributes.getString("pipelineName"));
				metaDataV2.setLogFilePath(generateLogFilePathV2(metaDataV2, version));
				metaDataV2.setDatasourceName(datasourceName);
				metaDataV2.setTag("User");
				metaDataV2.setElastic(pipelinConfig.getElasticDatasource());
				metaDataV2.setElasticSearchIndex(pipelinConfig.getElasticSearchIndex());
				iCIPJobs.setJobmetadata(gson.toJson(metaDataV2));
				statusResponse = getPipelineStatusV2(executePipelineId, connDetails);

			} else {
				throw new Exception("Choose Runtime Version correctly : error inside runscript");
			}

			status = statusResponse.optString("status", null);
			if ("Succeeded".equalsIgnoreCase(status) || "InProgress".equalsIgnoreCase(status)
					|| "Initiated".equalsIgnoreCase(status) || "INPROGRESS".equals(status) || "Created".equals(status))
				return new ResponseEntity<String>(HttpStatus.OK);

			else {
				return new ResponseEntity<String>(HttpStatus.BAD_REQUEST);
			}

		} catch (Exception e) {
			throw new LeapException(e.getMessage());

		}
	}

	private String generateLogFilePath(AICloudeJobMetadata metaData, Integer version) {
		return metaData.getProjectId() + "/pipeline" + "/" + metaData.getPipelineName() + "/" + version + "/runs" + "/"
				+ metaData.getTrialName() + "/outputartifacts/logs/";

	}

	private String generateLogFilePathV2(AlCloudJobMetaDataV2 metaDataV2, Integer version) {
		return metaDataV2.getProjectId() + "/pipeline" + "/" + metaDataV2.getPipelineName() + "/" + version + "/runs"
				+ "/" + metaDataV2.getExecutePipelineName() + "/outputartifacts/logs/";

	}

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
		return attributes.getString("projectId") + "/pipeline/" + attributes.getString("pipelineName") + "/" + ""
				+ attributes.get("version") + "/input";
	}

	private String generateArtifactsPathV2(List<ICIPNativeJobDetails> nativeJobDetails, JSONObject attributes) {
		return attributes.getString("projectId") + "/pipeline/" + attributes.getString("pipelineName") + "/" + ""
				+ attributes.get("version") + "/input/scripts";
	}

	private String trialPipeline(String pipelineId, JSONObject connDetails, List<ICIPNativeJobDetails> nativeJobDetails,
			AICloudPipelineConfig pipelinConfig) throws Exception {
		logger.info("inside trial pipeline");
		String url = connDetails.get("Url").toString() + "/api/v1/pipelines/trial";
		logger.info(url);
		AICloudTrialBody aicloudtrialbody = new AICloudTrialBody();
		aicloudtrialbody.setProjectId(pipelinConfig.getProjectId());
		aicloudtrialbody.setPipelineId(pipelineId);
		// create unique trialname
		String trialName = nativeJobDetails.get(0).getId().length() > 24
				? nativeJobDetails.get(0).getId().substring(nativeJobDetails.get(0).getId().length() - 24)
				: nativeJobDetails.get(0).getId();
		aicloudtrialbody.setName("t" + trialName);
		aicloudtrialbody.setDescription(nativeJobDetails.get(0).getCname() + "pipeline");
		aicloudtrialbody.setModelName(pipelinConfig.getPreTrainedModelName());
		aicloudtrialbody.setModelVersion(pipelinConfig.getPreTrainedModelVersion());
		aicloudtrialbody.setRunArguments(aiCloudService.getRunArguments());
		aicloudtrialbody.setResourceConfig(aiCloudService.getResourceConfig(pipelinConfig));
		aicloudtrialbody.setExperimentConfig(aiCloudService.getExperimentConfig());
		JSONObject trialBodyObject = new JSONObject(aicloudtrialbody);
		logger.info(trialBodyObject.toString());
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);
		OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
		newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
		newBuilder.hostnameVerifier((hostname, session) -> true);
		OkHttpClient client = newBuilder.build();
		MediaType mediaType = MediaType.parse("application/json");
		RequestBody trialBody = RequestBody.create(mediaType, trialBodyObject.toString());
		Request requestokHttp = new Request.Builder().url(url).method("POST", trialBody)
				.addHeader("accept", "application/json").addHeader("userId", connDetails.get("userId").toString())
				.build();
		try {
			Response response = client.newCall(requestokHttp).execute();
			logger.info(response.toString());
			if (response.code() == 200) {
				JSONObject responsebody = new JSONObject(response.body().string());
				JSONObject responseData = responsebody.getJSONObject("data");
				return responseData.get("id").toString();
			} else if (response.code() == 400) {
				JSONObject responsebody = new JSONObject(response.body().string());
				JSONObject errorDetails = responsebody.getJSONObject("detail");
				String errorMsg = errorDetails.get("message").toString();
				String errorCode = errorDetails.get("code").toString();

				throw new LeapException("Trial Not Trigerred for jobid" + nativeJobDetails.get(0).getId()
						+ "with message:- " + errorMsg + "and code " + errorCode + " Response Code" + response.code()
						+ "RequestPayload: " + trialBodyObject.toString());

			} else {
				throw new LeapException("AICloud Trial Not Trigerred for jobid " + nativeJobDetails.get(0).getId()
						+ " Response Code: " + response.code() + "RequestPayload: " + trialBodyObject.toString());

			}

		} catch (IOException e) {
			throw new LeapException("Trial Not Trigerred for jobid " + nativeJobDetails.get(0).getId() + "message"
					+ e.getMessage() + "RequestPayload: " + trialBodyObject != null ? trialBodyObject.toString() : "");

		}

	}

	private String executePipelineV2(String pipelineId, JSONObject connDetails,
			List<ICIPNativeJobDetails> nativeJobDetails, AICloudPipelineConfig pipelinConfig, JsonObject env_v2,
			String s3path) throws Exception {
		logger.info("inside executePipelineV2 ");
		JsonObject executepipJSON = new JsonObject();
		executepipJSON.add("pipeline", aiCloudServiceV2Test.getExecutePipeline(env_v2, s3path, pipelinConfig));
		String url = connDetails.get("Url").toString() + "/api/v2/pipelines/execute/" + pipelineId;
		logger.info("executePipelineV2 url : " + url);
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);
		OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
		newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
		newBuilder.hostnameVerifier((hostname, session) -> true);
		// OkHttpClient client = newBuilder.build();
		OkHttpClient client = newBuilder.connectTimeout(50, TimeUnit.SECONDS).readTimeout(50, TimeUnit.SECONDS)
				.writeTimeout(50, TimeUnit.SECONDS).build();
		MediaType mediaType = MediaType.parse("application/json");
		logger.info("executePipelinev2 body" + executepipJSON.toString());
		RequestBody trialBody = RequestBody.create(executepipJSON.toString(), mediaType);
		logger.info(executepipJSON.toString());
		Request requestokHttp = new Request.Builder().url(url).method("POST", trialBody)
				.addHeader("Content-Type", "application/json").addHeader("accept", "application/json")
				.addHeader("userId", connDetails.get("userId").toString()).build();
		try {
			Response response = client.newCall(requestokHttp).execute();
			if (response.code() == 200) {
				logger.info("execute pipeline v2 : " + response.code());
				JSONObject responsebody = new JSONObject(response.body().string());
				JSONObject responseData = responsebody.getJSONObject("data");
				return responseData.get("executionId").toString();
			} else if (response.code() == 400) {
				logger.info("execute pipeline v2 : " + response.code());
				JSONObject responsebody = new JSONObject(response.body().string());
				JSONObject errorDetails = responsebody.getJSONObject("detail");
				String errorMsg = errorDetails.get("message").toString();
				String errorCode = errorDetails.get("code").toString();

				throw new LeapException("Execute Pipeline V2 Unsuccessful for jobid" + nativeJobDetails.get(0).getId()
						+ "with message:- " + errorMsg + "and code " + errorCode + " Response Code" + response.code()
						+ "RequestPayload: " + executepipJSON.toString());

			} else {
				logger.info("execute pipeline v2 : " + response.code());
				JSONObject responsebody = new JSONObject(response.body().string());
				JSONObject errorDetails = responsebody.getJSONObject("detail");
				String errorMsg = errorDetails.get("message").toString();
				String errorCode = errorDetails.get("code").toString();

				throw new LeapException("Execute Pipeline V2 Unsuccessful for jobid" + nativeJobDetails.get(0).getId()
						+ "with message:- " + errorMsg + "and code " + errorCode + " Response Code" + response.code()
						+ "RequestPayload: " + executepipJSON.toString());

			}

		} catch (IOException e) {
			throw new LeapException(
					"Execute Pipeline V2 Unsuccessful for jobid " + nativeJobDetails.get(0).getId() + "message"
							+ e.getMessage() + "RequestPayload: " + executepipJSON != null ? executepipJSON.toString()
									: "");

		}

	}

	public String sanitizePipelineName(String name) {
		return name.toLowerCase().replaceAll("[^a-zA-Z0-9]", "");

	}

	private String createPipeline(JSONObject connDetails, List<ICIPNativeJobDetails> nativeJobDetails, String s3Path,
			String storageType2, String runcmd, Integer version, AICloudPipelineConfig pipelinConfig, JsonArray environ,
			JsonObject env_v2, Path filePath) throws LeapException {
		String createPipelineResponse = null;
		logger.info("Inside createpipeline Method");
		logger.info("pipeline version is : " + connDetails.getString("runtime"));
		try {

			// -------NODE CHANGES-------------------------------------
			JsonObject sample_payload = null;
			if ((connDetails.getString("runtime").toLowerCase()).equals("v2")) {
				FileReader fileReader = new FileReader(filePath.toAbsolutePath().toString());
				JsonParser parser = new JsonParser();
				Object obj = parser.parse(fileReader);
				sample_payload = (JsonObject) obj;
			}
			// ----------ENDS HERE--------------------------------
			if ((connDetails.getString("runtime").toLowerCase()).equals("v1")) {
				createPipelineResponse = createPipelineV1(connDetails, nativeJobDetails, s3Path, storageType2, runcmd,
						version, pipelinConfig, environ);
			} else if ((connDetails.getString("runtime").toLowerCase()).equals("v2")) {
				createPipelineResponse = createPipelineV2(connDetails, nativeJobDetails, s3Path, storageType2, runcmd,
						version, pipelinConfig, env_v2, sample_payload);
			} else {
				throw new LeapException("Choose correct Pipeline Version : Error inside createPipeline Method");
			}
		} catch (Exception e) {
			throw new LeapException(e.getMessage());
		}

		return createPipelineResponse;

	}

	private String createPipelineV1(JSONObject connDetails, List<ICIPNativeJobDetails> nativeJobDetails, String s3Path,
			String storageType2, String runcmd, Integer version, AICloudPipelineConfig pipelinConfig, JsonArray environ)
			throws Exception {
		JSONObject bodyObject = null;
		logger.info("inside createpipeline v1");
		try {
			String url = connDetails.get("Url").toString() + "/api/v1/pipelines";
			logger.info(url);
			AICloudBody aicloudbody = new AICloudBody();
			String storageType = pipelinConfig.getStorageType().toString();
			aicloudbody.setProjectId(pipelinConfig.getProjectId());
			aicloudbody.setName(sanitizePipelineName(nativeJobDetails.get(0).getCname()));
			aicloudbody.setDescription(sanitizePipelineName(nativeJobDetails.get(0).getCname()) + "pipleine");
			aicloudbody.setVersion(version);
			aicloudbody.setScope(pipelinConfig.getPipelineScope());
			aicloudbody.setJobArguments(aiCloudService.getJobArguments());
			aicloudbody.setSteps(aiCloudService.getSteps(storageType, s3Path, runcmd, pipelinConfig, environ));
			bodyObject = new JSONObject(aicloudbody);
			logger.info(bodyObject.toString());
			TrustManager[] trustAllCerts = getTrustAllCerts();
			SSLContext sslContext = getSslContext(trustAllCerts);
			OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
			newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
			newBuilder.hostnameVerifier((hostname, session) -> true);
			OkHttpClient client = newBuilder.build();
			MediaType mediaType = MediaType.parse("application/json");
			RequestBody body = RequestBody.create(mediaType, bodyObject.toString());
			Request requestokHttp = new Request.Builder().url(url).method("POST", body)
					.addHeader("accept", "application/json").addHeader("userId", connDetails.get("userId").toString())
					.build();

			Response response = client.newCall(requestokHttp).execute();
			logger.info(response.toString());
			if (response.code() == 200) {
				JSONObject responsebody = new JSONObject(response.body().string());
				JSONObject responseData = responsebody.getJSONObject("data");
				return responseData.get("id").toString();
			} else if (response.code() == 400) {
				JSONObject responsebody = new JSONObject(response.body().string());
				JSONObject errorDetails = responsebody.getJSONObject("detail");
				String errorMsg = errorDetails.get("message").toString();
				String errorCode = errorDetails.get("code").toString();
				throw new LeapException("AICloud Create pipeline Not Trigerred for jobid "
						+ nativeJobDetails.get(0).getId() + "with message:- " + errorMsg + "and code " + errorCode
						+ " Response Code " + response.code() + " RequestPayload: " + bodyObject.toString());

			} else {
				throw new LeapException(
						"AICloud Create pipeline Not Trigerred for jobid" + nativeJobDetails.get(0).getId()
								+ " Response Code " + response.code() + " RequestPayload: " + bodyObject.toString());
			}

		} catch (IOException | NullPointerException e) {
			throw new LeapException("AICloud Create pipeline Not Trigerred for jobid " + nativeJobDetails.get(0).getId()
					+ "message" + e.getMessage());

		}

	}

	private String createPipelineV2(JSONObject connDetails, List<ICIPNativeJobDetails> nativeJobDetails, String s3Path,
			String storageType2, String runcmd, Integer version, AICloudPipelineConfig pipelinConfig, JsonObject env_v2,
			JsonObject sample_payload) throws Exception {
		logger.info("Inside createPipelinev2 method");
		String url = "";
		String bodyString = "";
		Response catchresponse = null;

		try {

			url = connDetails.get("Url").toString() + "/api/v2/pipelines/create";
			logger.info("createPipelinev2 url : " + url);
			String pythonFile = runcmd.replaceAll("python", "").trim();
			AICloudBodyV2 aicloudbodyV2 = new AICloudBodyV2();
			String storageType = pipelinConfig.getStorageType().toString();
			aicloudbodyV2.setProjectId(pipelinConfig.getProjectId());

			aicloudbodyV2.setDescription(sanitizePipelineName(nativeJobDetails.get(0).getCname()) + "pipleine");
			String pipelineName = nativeJobDetails.get(0).getCname().replaceAll("_", "");
			aicloudbodyV2.setPipeline(aiCloudServiceV2Test.getPipeline(pipelinConfig, pipelineName.toLowerCase(),
					version, s3Path, pythonFile, env_v2, sample_payload));

			JsonObject bodyObject = new JsonObject();
			bodyObject.addProperty("projectId", aicloudbodyV2.getProjectId());
			bodyObject.addProperty("description", aicloudbodyV2.getDescription());
			bodyObject.add("pipeline", aicloudbodyV2.getPipeline());
			bodyString = bodyObject.toString();
			logger.info("createPipeline v2 body" + bodyString);
			TrustManager[] trustAllCerts = getTrustAllCerts();
			SSLContext sslContext = getSslContext(trustAllCerts);
			OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
			newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
			newBuilder.hostnameVerifier((hostname, session) -> true);
			OkHttpClient client = newBuilder.connectTimeout(50, TimeUnit.SECONDS).readTimeout(50, TimeUnit.SECONDS)
					.writeTimeout(50, TimeUnit.SECONDS).build();
			MediaType mediaType = MediaType.parse("application/json");
			RequestBody body = RequestBody.create(bodyString, mediaType);
			Request requestokHttp = new Request.Builder().url(url).method("POST", body)
					.addHeader("Content-Type", "application/json").addHeader("accept", "application/json")
					.addHeader("userId", connDetails.get("userId").toString()).build();

			Response response = client.newCall(requestokHttp).execute();
			catchresponse = response;
			if (response.code() == 200) {
				logger.info("create pipeline v2 : " + response.code());
				JSONObject responsebody = new JSONObject(response.body().string());
				JSONObject responseData = responsebody.getJSONObject("data");
				return responseData.get("id").toString();
			} else if (response.code() == 400) {
				logger.info("create pipeline v2 : " + response.code());
				JSONObject responsebody = new JSONObject(response.body().string());
				JSONObject errorDetails = responsebody.getJSONObject("detail");
				String errorMsg = errorDetails.get("message").toString();
				String errorCode = errorDetails.get("code").toString();
				throw new LeapException("AICloud createPipelineV2 UnSuccessful for jobid "
						+ nativeJobDetails.get(0).getId() + "with message:- " + errorMsg + "and code " + errorCode
						+ " Response Code :" + response.code() + ", URL : " + url + ", RequestPayload: " + bodyString);

			} else {
				logger.info("create pipeline v2 : " + response.code());
				JSONObject responsebody = new JSONObject(response.body().string());
				JSONObject errorDetails = responsebody.getJSONObject("detail");
				String errorMsg = errorDetails.get("message").toString();
				String errorCode = errorDetails.get("code").toString();
				throw new LeapException("AICloud createPipelineV2 UnSuccessful for jobid "
						+ nativeJobDetails.get(0).getId() + "with message:- " + errorMsg + "and code " + errorCode
						+ " Response Code :" + response.code() + ", URL : " + url + ", RequestPayload: " + bodyString);
			}

		} catch (IOException | NullPointerException e) {
			String code = (catchresponse != null) ? String.valueOf(catchresponse.code()) : "No response received";
			String body = (catchresponse != null) ? catchresponse.body().toString() : "No response received";
			throw new LeapException("AICloud createPipelineV2 UnSuccessful for jobid " + nativeJobDetails.get(0).getId()
					+ "message" + e.getMessage() + "URL :" + url + "," + "Request Payload : " + bodyString
					+ "Response Code :" + code + "Error response body : "
					+ body);

		}

	}

	JSONObject getPipelineStatus(String trialId, JSONObject connDetails) throws Exception {

		String url = connDetails.get("Url").toString() + "/api/v1/pipelines/trial/trialId?trialId=" + trialId;
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);
		OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
		newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
		newBuilder.hostnameVerifier((hostname, session) -> true);
		OkHttpClient client = newBuilder.build();
		Request requestokHttp = new Request.Builder().url(url).addHeader("accept", "application/json")
				.addHeader("userId", connDetails.get("userId").toString()).build();
		Response response = null;
		try {
			response = client.newCall(requestokHttp).execute();
			if (response.code() == 200) {
				JSONObject responsebody = new JSONObject(response.body().string());
				JSONObject responseData = responsebody.getJSONObject("data");
				JSONObject trialObj = responseData.getJSONObject("trial");
				String status = trialObj.get("status").toString();
				JSONObject responseobj = new org.json.JSONObject();
				responseobj.put("status", status);
				responseobj.put("finishedTime", trialObj.get("modifiedOn"));
				return responseobj;
			} else if (response.code() == 400) {
				JSONObject responsebody = new JSONObject(response.body().string());
				JSONObject errorDetails = responsebody.getJSONObject("detail");
				String errorMsg = errorDetails.get("message").toString();
				String errorCode = errorDetails.get("code").toString();
				throw new LeapException("AICloud get pipeline status for trialid " + trialId + "with message:- "
						+ errorMsg + "and code " + errorCode);

			} else {
				throw new LeapException(
						"AICloud get pipeline status for trialid " + trialId + " Response Code " + response.code());

			}

		} catch (IOException e) {
			log.error(e.getMessage(), e);
			throw new LeapException("AICloud Cget pipeline status for trialid " + trialId + "message" + e.getMessage());

		}

	}

	JSONObject getPipelineStatusV2(String executePipelineId, JSONObject connDetails) throws Exception {
		logger.info("inside pipelinestatus v2");
		String url = connDetails.get("Url").toString() + "/api/v2/pipelines/execution/" + executePipelineId + "?userId="
				+ connDetails.get("userId").toString();
		logger.info("URL get status pipeline V2 :" + url);
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);
		OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
		newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
		newBuilder.hostnameVerifier((hostname, session) -> true);
		OkHttpClient client = newBuilder.connectTimeout(30, TimeUnit.SECONDS).readTimeout(30, TimeUnit.SECONDS)
				.writeTimeout(30, TimeUnit.SECONDS).build();
		Request requestokHttp = new Request.Builder().url(url).addHeader("accept", "application/json").build();
		Response response = null;
		try {
			response = client.newCall(requestokHttp).execute();
			logger.info(response.toString());
			if (response.code() == 200) {
				logger.info("Get status pipeline v2 : " + response.code());
				JSONObject responsebody = new JSONObject(response.body().string());
				JSONObject responseData = responsebody.getJSONObject("data");
				JSONObject executionObj = responseData.getJSONObject("response").getJSONObject("data");
				String status = executionObj.get("status").toString();
				JSONObject responseobj = new org.json.JSONObject();
				responseobj.put("status", status);
				responseobj.put("finishedTime", executionObj.get("modifiedOn"));
				return responseobj;
			} else if (response.code() == 400) {
				logger.info("Get status pipeline v2 : " + response.code());
				JSONObject responsebody = new JSONObject(response.body().string());
				JSONObject errorDetails = responsebody.getJSONObject("detail");
				String errorMsg = errorDetails.get("message").toString();
				String errorCode = errorDetails.get("code").toString();
				throw new LeapException("AICloud get pipeline status for executionId " + executePipelineId
						+ "with message:- " + errorMsg + "and code " + errorCode);

			} else {
				logger.info("Get status pipeline v2 : " + response.code());
				JSONObject responsebody = new JSONObject(response.body().string());
				JSONObject errorDetails = responsebody.getJSONObject("detail");
				String errorMsg = errorDetails.get("message").toString();
				String errorCode = errorDetails.get("code").toString();
				throw new LeapException("AICloud get pipeline status for executionId " + executePipelineId
						+ "with message:- " + errorMsg + "and code " + errorCode);
			}

		} catch (IOException e) {
			log.error(e.getMessage(), e);
			throw new LeapException(
					"AICloud get pipeline status for executionId " + executePipelineId + "message" + e.getMessage());

		}

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
			ds.put("type", "AICLOUD");

		} catch (JSONException e) {
			log.error("plugin attributes mismatch", e.getMessage());
		}
		return ds;
	}

//	public TrustManager[] getTrustAllCerts() {
//		TrustManager[] trustAllCerts = new TrustManager[] { new X509TrustManager() {
//			@Override
//			public void checkClientTrusted(java.security.cert.X509Certificate[] chain, String authType) {
//			}
//
//			@Override
//			public void checkServerTrusted(java.security.cert.X509Certificate[] chain, String authType) {
//			}
//
//			@Override
//			public java.security.cert.X509Certificate[] getAcceptedIssuers() {
//				return new java.security.cert.X509Certificate[] {};
//			}
//		} };
//		return trustAllCerts;
//	}
	
	private TrustManager[] getTrustAllCerts() throws Exception {
		logger.info("certificateCheck value: {}", certificateCheck);
		if("true".equalsIgnoreCase(certificateCheck)) {
			// Load the default trust store
		    TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
		    trustManagerFactory.init((KeyStore) null);
	
		    // Get the trust managers from the factory
		    TrustManager[] trustManagers = trustManagerFactory.getTrustManagers();
	
		    // Ensure we have at least one X509TrustManager
		    for (TrustManager trustManager : trustManagers) {
		        if (trustManager instanceof X509TrustManager) {
		            return new TrustManager[] { (X509TrustManager) trustManager };
		        }
		    }
	
		    throw new IllegalStateException("No X509TrustManager found. Please install the certificate in keystore");
		}else {
			TrustManager[] trustAllCerts = new TrustManager[] { new X509TrustManager() {
				@Override
                public void checkClientTrusted(X509Certificate[] chain, String authType) {
                    // Log the certificate chain and authType
                    logger.info("checkClientTrusted called with authType: {}", authType);
                    for (X509Certificate cert : chain) {
                        logger.info("Client certificate: {}", cert.getSubjectDN());
                    }
                }

                @Override
                public void checkServerTrusted(X509Certificate[] chain, String authType) {
                    // Log the certificate chain and authType
                    logger.info("checkServerTrusted called with authType: {}", authType);
                    for (X509Certificate cert : chain) {
                        logger.info("Server certificate: {}", cert.getSubjectDN());
                    }
                }
	
				@Override
				public java.security.cert.X509Certificate[] getAcceptedIssuers() {
					return new java.security.cert.X509Certificate[] {};
				}
			} };
			return trustAllCerts;
		}   
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

	public int gen() {
		SecureRandom r = new SecureRandom();
		return ((1 + r.nextInt(2)) * 10000 + r.nextInt(10000));
	}

	@SuppressWarnings("deprecation")
	@Override
	public String getNativeJobCommand(ICIPNativeJobDetails jobDetails)
			throws LeapException, InvalidRemoteException, TransportException, GitAPIException {
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
			log.error(msg, ex.getMessage());
			throw new LeapException(msg, ex);
		}

		String tmpfileType;
		try {
			tmpfileType = attrObject.get("filetype").getAsString().toLowerCase().trim();
		} catch (Exception ex) {
			String msg = "Error in getting filetype : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex.getMessage());
			throw new LeapException(msg, ex);
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
			log.error(msg, ex.getMessage());
			throw new LeapException(msg, ex);
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
				throw new LeapException(msg, ex);
			} finally {
				if (is != null) {
					try {
						is.close();
					} catch (IOException ex) {
						log.error(ex.getMessage(), ex.getMessage());
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
						log.error(msg, ex.getMessage());
						throw new LeapException(msg, ex);
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
						log.error(msg, ex.getMessage());
						throw new LeapException(msg, ex);
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
								log.error(msg, ex.getMessage());
								throw new LeapException(msg, ex);
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
						log.error(msg, ex.getMessage());
						throw new LeapException(msg, ex);
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
				// Path tmpPath = Files.createTempDirectory("nativescript"); -> suggests that
				// the code might be creating directories in a location that could be publicly
				// writable. This can lead to security vulnerabilities such as unauthorized
				// access or tampering with files.
				// Securely create a temporary directory
				Path tempDir = Paths.get(System.getProperty("java.io.tmpdir"), "nativescript");
				if (!Files.exists(tempDir)) {
					Files.createDirectories(tempDir);
				}
				Path tmpPath = Files.createTempDirectory(tempDir, "nativescript");
				Path filePath = Paths.get(tmpPath.toAbsolutePath().toString(),
						String.format("%s.yaml", ICIPUtils.removeSpecialCharacter(jobDetails.getCname())));
				Files.createDirectories(filePath.getParent());
				Files.deleteIfExists(filePath);
				Files.createFile(filePath);
				writeTempFile(createNativeYamlscript(argumentBuilder), filePath);
				arguments = filePath.toAbsolutePath().toString();
			} catch (Exception ex) {
				throw new LeapException(ex.getMessage(), ex);
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
	 * @throws LeapException the leap exception
	 */
	private JsonArray getLatestArgument(JsonObject binary, String params, Gson gson) throws LeapException {
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
			log.error(msg, ex.getMessage());
			throw new LeapException(msg, ex);
		}
	}

	/**
	 * Creates the native yamlscript.
	 *
	 * @param data the data
	 * @return the string builder
	 * @throws LeapException the leap exception
	 */
	private StringBuilder createNativeYamlscript(Map<String, String> data) throws LeapException {
		try {
			log.info("creating native yaml script");
			Yaml yaml = new Yaml();
			return new StringBuilder().append(yaml.dumpAsMap(data));
		} catch (Exception ex) {
			String msg = "Error in creating yaml file : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex.getMessage());
			throw new LeapException(msg, ex);
		}
	}

	@Override
	public String getDragAndDropJobCommand(ICIPNativeJobDetails jobDetails) throws LeapException {

		String cname = jobDetails.getCname();
		String cmdStr = "python " + cname + "_generatedCode.py";
		return cmdStr;
	}

	@Override
	public String getBinaryJobCommand(ICIPNativeJobDetails jobDetails) throws LeapException {
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
			log.error(msg, ex.getMessage());
			throw new LeapException(msg, ex);
		}

		String tmpfileType = null;
		try {
			tmpfileType = binary.get("filetype").getAsString().toLowerCase();
		} catch (Exception ex) {
			String msg = "Error in getting filetype : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex.getMessage());
			throw new LeapException(msg, ex);
		}

		String fileType = "";
		StringBuilder paths2 = new StringBuilder();

		JsonArray files2 = null;
		try {
			files2 = binary.get("files2").getAsJsonArray();
		} catch (Exception ex) {
			String msg = "Error in getting file array : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex.getMessage());
			throw new LeapException(msg, ex);
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
				log.error(msg, ex.getMessage());
				throw new LeapException(msg, ex);
			} finally {
				if (fis != null) {
					try {
						fis.close();
					} catch (Exception ex) {
						log.error(ex.getMessage(), ex.getMessage());
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
			log.error(msg, ex.getMessage());
			throw new LeapException(msg, ex);
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
				throw new LeapException(msg, ex);
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
			throw new LeapException(msg, ex);
		}

		String arguments;
		try {
			arguments = binary.get("arguments").getAsString();
		} catch (Exception ex) {
			String msg = "Error in getting arguments : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);
			throw new LeapException(msg, ex);
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
	 * @throws LeapException            the leap exception
	 */
	private String getAttributeHashString(JobObjectDTO job) throws NoSuchAlgorithmException, LeapException {
		String params = job.getJobs().get(0).getParams();
		String nameAndOrg = job.getName().toString() + job.getOrg() + job.getJobType();
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
			throw new LeapException(INVALID_JOBTYPE);
		}
	}

	@Override
	public String getAzureJobCommand(ICIPNativeJobDetails jobDetails) throws LeapException {
		// TODO Auto-generated method stub
		return null;
	}

	private HashMap<String, String> resolveSecrets(JSONArray pipeline_attributes, String Org) {
		// return null;

		HashMap<String, String> paramswithsecrets = new HashMap<>();

		JSONArray pipelineAttributes = pipeline_attributes;
		pipelineAttributes.forEach(x -> {
			JSONObject obj = new JSONObject(x.toString());

			if (obj.has("name")&& obj.getString("name").equals("usedSecrets")) {
				String key = obj.getString("value");
				Secret secret = new Secret();
				secret.setOrganization(Org);
				secret.setKey(key);
				try {
					ResolvedSecret resolvedSecret = smService.resolveSecret(secret);
					if (resolvedSecret.getIsResolved()) {
					}
					paramswithsecrets.put(key, resolvedSecret.getResolvedSecret());
				} catch (KeyException e) {
					// throw new KeyException("Secret Key:"+key +"not found");
				}
			}

		});

		return paramswithsecrets;
	}

}
