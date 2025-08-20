package com.lfn.icip.icipwebeditor.job.service;

import java.io.File;
import java.io.FileOutputStream;
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
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.*;
import java.util.Map.Entry;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.stream.Collectors;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;

import com.lfn.icip.icipwebeditor.repository.ICIPJobsRepository;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.annotation.Scope;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.yaml.snakeyaml.Yaml;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.ai.comm.lib.util.dto.ResolvedSecret;
import com.lfn.ai.comm.lib.util.dto.Secret;
import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.ai.comm.lib.util.service.SecretsManagerService;
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.model.ICIPSchemaDetails;
import com.lfn.icip.dataset.service.IICIPDatasourcePluginsService;
import com.lfn.icip.dataset.service.IICIPDatasourceService;
import com.lfn.icip.dataset.service.impl.ICIPDatasetService;
import com.lfn.icip.dataset.service.impl.ICIPDatasourceService;
import com.lfn.icip.dataset.service.impl.ICIPSchemaRegistryService;
import com.lfn.icip.dataset.service.util.IICIPDataSourceServiceUtil;
import com.lfn.icip.icipmodelserver.v2.service.util.model.models.Credentials;
import com.lfn.icip.icipmodelserver.v2.service.util.model.models.RemoteBody;
import com.lfn.icip.icipmodelserver.v2.service.util.model.models.RemoteJobMetadata;
import com.lfn.icip.icipmodelserver.v2.service.util.model.models.RemotePipelineConfig;
import com.lfn.icip.icipwebeditor.IICIPJobRuntimeServiceUtil;
import com.lfn.icip.icipwebeditor.IICIPJobServiceUtil;
import com.lfn.icip.icipwebeditor.constants.AlertConstants;
import com.lfn.icip.icipwebeditor.constants.FileConstants;
import com.lfn.icip.icipwebeditor.constants.IAIJobConstants;
import com.lfn.icip.icipwebeditor.constants.LoggerConstants;
import com.lfn.icip.icipwebeditor.executor.sync.service.JobSyncExecutorService;
import com.lfn.icip.icipwebeditor.file.service.ICIPFileService;
import com.lfn.icip.icipwebeditor.job.ICIPNativeServiceJob.ChainProcess;
import com.lfn.icip.icipwebeditor.job.ICIPNativeServiceJob.JobRun;
import com.lfn.icip.icipwebeditor.job.constants.JobConstants;
import com.lfn.icip.icipwebeditor.job.enums.JobMetadata;
import com.lfn.icip.icipwebeditor.job.enums.JobStatus;
import com.lfn.icip.icipwebeditor.job.enums.JobType;
import com.lfn.icip.icipwebeditor.job.enums.RuntimeType;
import com.lfn.icip.icipwebeditor.job.listener.ICIPJobSchedulerListener;
import com.lfn.icip.icipwebeditor.job.model.ICIPInternalJobs.MetaData;
import com.lfn.icip.icipwebeditor.job.model.ICIPChainJobs;
import com.lfn.icip.icipwebeditor.job.model.TriggerValues;
import com.lfn.icip.icipwebeditor.job.model.dto.JobObjectDTO;
import com.lfn.icip.icipwebeditor.job.model.dto.JobObjectDTO.Jobs;
import com.lfn.icip.icipwebeditor.job.service.util.ICIPCommonJobServiceUtil;
import com.lfn.icip.icipwebeditor.job.service.util.ICIPInitializeAnnotationServiceUtil;
import com.lfn.icip.icipwebeditor.jobmodel.service.ICIPAgentJobsService;
import com.lfn.icip.icipwebeditor.jobmodel.service.ICIPChainJobsService;
import com.lfn.icip.icipwebeditor.jobmodel.service.ICIPJobsService;
import com.lfn.icip.icipwebeditor.model.ICIPAgentJobs;
import com.lfn.icip.icipwebeditor.model.ICIPJobs;
import com.lfn.icip.icipwebeditor.model.ICIPStreamingServices;
import com.lfn.icip.icipwebeditor.model.dto.ICIPNativeJobDetails;
import com.lfn.icip.icipwebeditor.model.dto.ICIPStreamingServices2DTO;
import com.lfn.icip.icipwebeditor.service.IICIPEventJobMappingService;
import com.lfn.icip.icipwebeditor.service.IICIPJobsService;
import com.lfn.icip.icipwebeditor.service.IICIPStreamingServiceService;
import com.lfn.icip.icipwebeditor.service.aspect.IAIResolverAspect;
import com.lfn.icip.icipwebeditor.service.impl.ICIPJobsPluginsService;
import com.lfn.icip.icipwebeditor.service.impl.ICIPPipelineService;

import lombok.extern.log4j.Log4j2;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.ResponseBody;

@Log4j2
@Component("remotejobruntime")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@RefreshScope
public class ICIPRemoteExecutorJob extends ICIPCommonJobServiceUtil implements IICIPJobRuntimeServiceUtil {

	public ICIPRemoteExecutorJob() {
		super();
	}

	@Autowired
	private SecretsManagerService smService;
	@Autowired
	private IICIPDatasourcePluginsService dsPluginService;

	@Autowired
	private IICIPStreamingServiceService streamingServicesService;

	@Autowired
	private IICIPDatasourceService dsService;

	@Autowired
	private IICIPJobsService iICIPJobsService;

	/** The logger. */
	private final Logger logger = LoggerFactory.getLogger(ICIPRemoteExecutorJob.class);

	@Autowired
	private ICIPJobsPluginsService jobpluginService;

	@Autowired
	private ICIPJobsService jobsService;
	/** The chain jobs service. */
	@Autowired
	private ICIPChainJobsService chainJobsService;

	/** The job sync executor service. */
	@Autowired
	private JobSyncExecutorService jobSyncExecutorService;

	/** The agent jobs service. */
	@Autowired
	private ICIPAgentJobsService agentJobsService;

	@Autowired
	private IICIPEventJobMappingService eventMappingService;

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

	@EssedumProperty("icip.certificateCheck")
	private String certificateCheck;

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

	/** The Constant INVALID_TYPE. */
	private static final String INVALID_TYPE = "Invalid Type";

	/** The Constant INVALID_JOBTYPE. */
	private static final String INVALID_JOBTYPE = "Invalid JobType";

	/** The annotation service util. */
	@Autowired
	private ICIPInitializeAnnotationServiceUtil annotationServiceUtil;

	private transient Thread workerThread;

	private static final String REMOTE = "remote";
	private static final String BUCKET_NAME = "bucketname";
	JobMetadata jobMetadata;

	@Value("${jobexecutor.enabled}")
	private boolean jobExecutorEnabled;

	@Value("${jobexecutor.org}")
	private String jobExecutorOrg;

	@Value("${jobexecutor.runtimeList}")
	private String runtimeList;

	@Autowired
	private ICIPJobsRepository iCIPJobsRepository;

	@Override
	public void execute(JobExecutionContext context) throws JobExecutionException {
		HashMap<String, String> configs = new HashMap<>();
		workerThread = Thread.currentThread();
		JobDetail jobDetail = context.getJobDetail();
		logger.info("Executing Job with key {}", context.getJobDetail().getKey());
		JobDataMap jobDataMap = context.getMergedJobDataMap();
		Gson gson = new Gson();
		String jobString = jobDataMap.getString(JobConstants.JOB_DATAMAP_VALUE);
		JobObjectDTO jobObject = gson.fromJson(jobString, JobObjectDTO.class);
		List<JobObjectDTO.Jobs> listjobdto = jobObject.getJobs();
		int allScriptGenerated = 1;
		String agenticMeta = null;
		for (int index = 0; index < listjobdto.size(); ++index) {
			try {
				JSONObject fileObj = null;
				ICIPStreamingServices pipelineInfo = streamingServicesService
						.findbyNameAndOrganization(listjobdto.get(index).getName(), jobObject.getOrg());
				if (!(pipelineInfo.getType().equalsIgnoreCase("NativeScript"))) {
					fileObj = streamingServicesService.getGeneratedScript(listjobdto.get(index).getName(),
							jobObject.getOrg());
					String path = streamingServicesService.savePipelineJson(pipelineInfo.getName(), jobObject.getOrg(),
							pipelineInfo.getJsonContent());
					JsonObject payload = new JsonObject();
					payload.addProperty("pipelineName", pipelineInfo.getName());
					payload.addProperty("scriptPath", path);
					String corelid = eventMappingService.trigger("generateScript_" + pipelineInfo.getType(),
							jobObject.getOrg(), "", payload.toString(), "");
					String status = iICIPJobsService.getEventStatus(corelid);
					agenticMeta = pipelineInfo.getPipelineMetadata();

					if (!status.equalsIgnoreCase("COMPLETED")) {
						allScriptGenerated = 0;
						System.out.println("Completed");
					}
				}
			} catch (Exception e) {
				allScriptGenerated = 0;
				System.out.println("error");
				// TODO: handle exception
			}
		}

		List<ICIPNativeJobDetails> nativeJobDetails = null;
		Integer version = null;
		String attributesHash = null;
		try {
			attributesHash = getAttributeHashString(jobObject);
		} catch (NoSuchAlgorithmException | EssedumException e1) {
			// TODO Auto-generated catch block
			log.error(e1.getMessage());
		}
		try {
			// adding jobListner to the current job scheduler
			context.getScheduler().getListenerManager().addJobListener(
					new ICIPJobSchedulerListener("JobListener-" + jobDetail.getKey()),
					KeyMatcher.keyEquals(jobDetail.getKey()));
		} catch (SchedulerException e2) {
			// TODO Auto-generated catch block
			logger.error(e2.getMessage());
		}
		if (!jobObject.isEvent() && !jobObject.getJobType().toString().equalsIgnoreCase("CHAIN")) {
			jobObject.setCorelId(ICIPUtils.generateCorrelationId());
		}
		String runCmd;
		Timestamp submittedOn = new Timestamp(new Date().getTime());
		StringBuilder jobId = new StringBuilder(IAIJobConstants.STRING_BUILDER_CAPACITY);
		jobId.append(jobDetail.getKey().getName());
		jobId.append(new String(Base64.getEncoder().encode(jobObject.getSubmittedBy().getBytes())));
		jobId.append(submittedOn.toInstant());

		Trigger trigger = context.getTrigger();
		Timestamp[] timestamps;
		try {
			timestamps = getTimestamps(jobObject);

			Timestamp successfulTimestamp = timestamps[0];
			Timestamp lastTimestamp = timestamps[1];

			TriggerValues triggerValues = new TriggerValues(trigger.getNextFireTime(), trigger.getPreviousFireTime(),
					lastTimestamp, successfulTimestamp);

			nativeJobDetails = createNativeJobDetails(jobObject, triggerValues);

			// JobMetadata jobMetadata = JobMetadata.USER;
			if (jobObject.isRunNow()) {
				jobMetadata = JobMetadata.USER;
			} else {
				jobMetadata = JobMetadata.SCHEDULED;
			}
			if (jobObject.getJobType().toString().equalsIgnoreCase("CHAIN")) {
				MetaData chainMetadata = new MetaData();
				chainMetadata.setTag(jobMetadata.toString());
				iCIPChainJobs = new ICIPChainJobs(null, ICIPUtils.removeSpecialCharacter(jobId.toString()),
						jobObject.getName(), jobObject.getOrg(), jobObject.getSubmittedBy(),
						JobStatus.STARTED.toString(), submittedOn, null, attributesHash, jobObject.getCorelId(), null,
						gson.toJson(chainMetadata), 0);

			}
			logger.info("Submitting the Pipeline to Job Server Remotely");

		} catch (EssedumException | IOException e1) {
			// TODO Auto-generated catch block

			logger.error(e1.getMessage());
		}
		String org = jobObject.getOrg();
		String datasourceName = null;
		JSONObject connDetails = new JSONObject();
		ICIPDatasource uploadDs = new ICIPDatasource();
		ICIPDatasource dsObject = new ICIPDatasource();
		if (!jobObject.getJobType().toString().equalsIgnoreCase("CHAIN")) {

			datasourceName = jobDataMap.getString("datasourceName");
			dsObject = dsService.getDatasource(datasourceName, org);
			connDetails = new JSONObject(dsObject.getConnectionDetails());
			String uploadDsName = connDetails.get("datasource").toString();
			uploadDs = dsService.getDatasource(uploadDsName, org);
		}

		if (allScriptGenerated == 1) {
			for (int index = 0; index < listjobdto.size(); ++index) {
				try {
					logger.info("Running pipeline in remote with name :{}", (listjobdto.get(index).getName()));
				} catch (Exception e) {
					logger.error("No pipeline here");
				}
				if (jobObject.getJobType().toString().equalsIgnoreCase("CHAIN")) {
					String strDs = jobDataMap.get("datasourceName").toString();
					JSONObject mapOfDs = new JSONObject(strDs);
					ICIPDatasource dsObjectofPipeline = null;
					try {
						datasourceName = mapOfDs.getString(listjobdto.get(index).getName()).split("-", 2)[1];
						logger.info("Remote datasouce for job in chain to dsObj: " + datasourceName + ".");
						dsObjectofPipeline = dsService.getDatasourceByTypeAndAlias("REMOTE", datasourceName, org);
						try {
							dsObject = dsObjectofPipeline;
						} catch (Exception e) {
							// TODO: handle exception
							logger.error(e.getMessage());
						}
						datasourceName = dsObjectofPipeline.getName();
					} catch (Exception e) {
						logger.error(e.getMessage());
						// TODO: handle exception
					}
					connDetails = new JSONObject(dsObjectofPipeline.getConnectionDetails());
					String uploadDsNamePipeline = connDetails.get("datasource").toString();
					uploadDs = dsService.getDatasource(uploadDsNamePipeline, org);
				}
				JobObjectDTO.Jobs job = jobObject.getJobs().get(index);

				MetaData pipelineMetadata = new MetaData();
				version = pipelineService.getVersion(nativeJobDetails.get(index).getCname(),
						nativeJobDetails.get(index).getOrg());

				if (version == null)
					version = 0;
				if (jobObject.getJobType().toString().equalsIgnoreCase("CHAIN")) {

					pipelineMetadata.setName(jobObject.getAlias());
					pipelineMetadata.setTag("CHAIN");

				} else {
					// JobMetadata jobMetadata = JobMetadata.USER;
					if (jobObject.isRunNow()) {
						jobMetadata = JobMetadata.USER;
					} else {
						jobMetadata = JobMetadata.SCHEDULED;
					}
					pipelineMetadata.setTag(jobMetadata.toString());
				}
				String workerlogId = jobDataMap.getString("workerlogId");
				iCIPJobs = new ICIPJobs(null, ICIPUtils.removeSpecialCharacter(jobId.toString() + job.getName()),
						jobObject.getSubmittedBy(), job.getName(), JobStatus.STARTED.toString(), version, null,
						submittedOn, job.getRuntime().toString(), jobObject.getOrg(), REMOTE, null, attributesHash,
						jobObject.getCorelId(), null, gson.toJson(pipelineMetadata), 0, "{}", "{}", "{}", "{}", "{}",
						workerlogId);

				try {
					// get unique hashValue for the job triggered(hashvalue=hex(digest(name&org));

					try {

						RuntimeType type = job.getRuntime();
						String params = job.getParams();
						String cname = job.getName();

						// aicloud specific code
						IICIPJobServiceUtil jobUtilConn;
						try {
							jobUtilConn = jobpluginService.getType(type.toString().toLowerCase() + "job");
						} catch (Exception e) {

							jobUtilConn = jobpluginService.getType("dragndroplitejob");
						}
						RemotePipelineConfig pipelineEnvs = null;
						JSONArray pipelineEnvsArray = null;
						JSONArray penvsArray = new JSONArray();
						RemotePipelineConfig pipelinConfig = null;
						HashMap<String, String> secrets = new HashMap<>();
						JsonArray environ = new JsonArray();
						JsonObject envJSONO = new JsonObject();

						if (type.toString().equalsIgnoreCase("nativescript")) {
							runCmd = jobUtilConn.getCommand(nativeJobDetails.get(index));
							logger.info("initial command--->" + runCmd);
							// String storageString = runCmd.substring(runCmd.indexOf("storageType")-2);
							// Integer ind = runCmd.indexOf(".py");
							String storageString = runCmd.substring(runCmd.indexOf(".py") + 3);
							logger.info("storageString--->" + storageString);
							String storageString2 = runCmd.substring(0, runCmd.indexOf(".py") + 3);
							logger.info("storageString2--->" + storageString2);
							String[] parts = storageString2.split("[ /\\\\]+"); // split by spaces , forward slashes and
							// backward slashes
							String comm = "python";
							String fileName = "";
							for (String part : parts) {
								if (part.endsWith(".py")) {
									fileName = part;
								}

							}
							// comm = comm.substring(0, comm.length() - 1);
							logger.info("comm" + comm);
							fileName = fileName.substring(fileName.lastIndexOf("\\") + 1);
							String result = comm + " " + fileName;
							logger.info("result--->" + result);
							runCmd = result + storageString;
							logger.info("updated command--->" + runCmd);
							String pipelineJson = pipelineService.getJson(cname, org);
							JsonObject jsonObject = new Gson().fromJson(pipelineJson, JsonElement.class)
									.getAsJsonObject();
							jsonObject.addProperty("org", org);

							
							  environ = jsonObject.getAsJsonArray("environment"); for (int i = 0; i <
							  environ.size(); i++) { JsonObject envJSON = environ.get(i).getAsJsonObject();
							  String key = envJSON.get("name").getAsString(); String value =
							  envJSON.get("value").getAsString(); envJSONO.addProperty(key, value); }
							 

							String data = "{\"input_string\":" + jsonObject.toString() + "}";
							data = pipelineService.populateDatasetDetails(data, org);
							data = pipelineService.populateSchemaDetails(data, org);
							if (params != null && !params.isEmpty() && !params.equals("{}")
									&& !params.equalsIgnoreCase("generated"))
								data = pipelineService.populateAttributeDetails(data, params);

							JSONObject dataObj = new JSONObject(data);
							JSONArray pipelineArgs = null;
							JSONArray elements = null;
							JSONObject getAttributes = null;
							JSONObject attributes = null;
							JSONObject secJ = null;
							// pipelineEnvsArray =
							// dataObj.getJSONObject("input_string").getJSONArray("environment");
							try {
								elements = dataObj.getJSONObject("input_string").getJSONArray("elements");
								getAttributes = elements.getJSONObject(0);
								attributes = getAttributes.getJSONObject("attributes");
								pipelineArgs = attributes.getJSONArray("usedSecrets");

								secrets = resolveSecrets(pipelineArgs, org);
								secJ = new JSONObject(secrets);
								Iterator<String> keys = secJ.keys();
								while (keys.hasNext()) {
									String key = keys.next();
									envJSONO.addProperty(key, (String) secJ.get(key));
								}
							} catch (JSONException ex) {
								logger.error("Exception : {}", ex);
							}

							// pipelineEnvsArray =
							// dataObj.getJSONObject("input_string").getJSONArray("environment");
							if (pipelineArgs != null && !pipelineArgs.isEmpty()) {
								pipelineArgs.forEach(args -> {
									JSONObject temp = new JSONObject(args.toString());
									// configs.put(temp.getString("key").trim(), temp.getString("value").trim());
									if (temp.has("key") && temp.getString("key").trim() != null) {
										configs.put(temp.getString("key").trim(), temp.getString("value").trim());
									}
									if (temp.has("name") && temp.getString("name").trim() != null
											&& temp.getString("name").trim() != "") {
										configs.put(temp.getString("name").trim(), temp.getString("value").trim());
									}
								});
							}

						} else {
							String pipelineJson = pipelineService.getJson(cname, org);
							JsonObject jsonObject = new Gson().fromJson(pipelineJson, JsonElement.class)
									.getAsJsonObject();
							jsonObject.addProperty("org", org);
							environ = jsonObject.getAsJsonArray("environment");
							for (int i = 0; i < environ.size(); i++) {
								JsonObject envJSON = environ.get(i).getAsJsonObject();
								String key = envJSON.get("name").getAsString();
								String value = envJSON.get("value").getAsString();
								envJSONO.addProperty(key, value);
							}

							String data = "{\"input_string\":" + jsonObject.toString() + "}";
							data = pipelineService.populateDatasetDetails(data, org);
							data = pipelineService.populateSchemaDetails(data, org);
							if (params != null && !params.isEmpty() && !params.equals("{}")
									&& !params.equalsIgnoreCase("generated"))
								data = pipelineService.populateAttributeDetails(data, params);

							JSONArray pipelineArgs = null;
							// JSONArray pipelineEnvsArray = null;

							if (!params.equalsIgnoreCase("generated")) {
								JSONObject dataObj = new JSONObject(data);
								JSONArray elements = dataObj.getJSONObject("input_string").getJSONArray("elements");
								pipelineArgs = dataObj.getJSONObject("input_string")
										.getJSONArray("pipeline_attributes");
								secrets = resolveSecrets(pipelineArgs, org);
								JSONObject secJ = new JSONObject(secrets);

								Iterator<String> keys = secJ.keys();
								while (keys.hasNext()) {
									String key = keys.next();
									envJSONO.addProperty(key, (String) secJ.get(key));
								}
								if (pipelineArgs != null && !pipelineArgs.isEmpty()) {
									pipelineArgs.forEach(args -> {
										JSONObject temp = new JSONObject(args.toString());
										// configs.put(temp.getString("name").trim(), temp.getString("value").trim());
										if (temp.has("key") && temp.getString("key").trim() != null) {
											configs.put(temp.getString("key").trim(), temp.getString("value").trim());
										}
										if (temp.has("name") && temp.getString("name").trim() != null
												&& temp.getString("name").trim() != "") {
											configs.put(temp.getString("name").trim(), temp.getString("value").trim());
										}
									});
								}
							} else {

								JSONObject dataObj = new JSONObject(data);
								// pipelineEnvsArray =
								// dataObj.getJSONObject("input_string").getJSONArray("environment");
								pipelineArgs = dataObj.getJSONObject("input_string")
										.getJSONArray("pipeline_attributes");
								secrets = resolveSecrets(pipelineArgs, org);
								JSONObject secJ = new JSONObject(secrets);

								Iterator<String> keys = secJ.keys();
								while (keys.hasNext()) {
									String key = keys.next();
									envJSONO.addProperty(key, (String) secJ.get(key));
								}
								 pipelineEnvsArray =
								 dataObj.getJSONObject("input_string").getJSONArray("environment");
								if (pipelineArgs != null && !pipelineArgs.isEmpty()) {
									pipelineArgs.forEach(args -> {
										JSONObject temp = new JSONObject(args.toString());
										// configs.put(temp.getString("key").trim(), temp.getString("value").trim());
										if (temp.has("key") && temp.getString("key").trim() != null) {
											configs.put(temp.getString("key").trim(), temp.getString("value").trim());
										}
										if (temp.has("name") && temp.getString("name").trim() != null
												&& temp.getString("name").trim() != "") {
											configs.put(temp.getString("name").trim(), temp.getString("value").trim());
										}
									});
								}

								
								  if (pipelineEnvsArray != null && !pipelineEnvsArray.isEmpty()) {
								  
								  pipelineEnvsArray.forEach(args -> { JSONObject temp = new
								  JSONObject(args.toString()); JSONObject envs = new JSONObject(); if
								  (temp.has("name") && temp.getString("name").trim() != null) {
								  envs.put(temp.getString("name").trim(), temp.getString("value").trim()); }
								  penvsArray.put(envs);
								  
								  }); penvsArray.put(new JSONObject(secrets)); }
								 
							}

							ObjectMapper mapper = new ObjectMapper();
							configs.remove("usedSecrets");
							pipelinConfig = mapper.convertValue(configs, RemotePipelineConfig.class);
							// pipelineEnvs = mapper.convertValue(envs, RemotePipelineConfig.class);

							// logger.info("pipeline envs"+ pipelineEnvs.toString());
							String msg = String.format("%s", "About to run the job");
							log.info(msg);
							runCmd = getRunCommand(job, nativeJobDetails, index);

						}
						JSONObject usedSecrets = new JSONObject(secrets);

						String payload = runScript(version, runCmd, jobUtilConn, nativeJobDetails, connDetails,
								uploadDs, job, datasourceName, pipelinConfig, index, envJSONO, jobObject.isEvent(),
								usedSecrets);

						if (Objects.nonNull(dsObject.getAlias())) {
							iCIPJobs.setRuntime("Remote-" + dsObject.getAlias());
						} else {
							List<String> items = Arrays.stream(runtimeList.split(",")).map(String::trim)
									.collect(Collectors.toList());
							SecureRandom random = new SecureRandom();
							int randomIndex = random.nextInt(items.size());
							iCIPJobs.setRuntime("Remote-" + items.get(randomIndex));
						}

						Path outPath;
						Path chainoutPath = null;

//                  iCIPJobs.setJobStatus(JobStatus.RUNNING.toString());
//                  iCIPJobs = jobsService.save(iCIPJobs);
//                  outPath= Paths.get(annotationServiceUtil.getFolderPath(),
//                          String.format(LoggerConstants.STRING_DECIMAL_STRING, IAIJobConstants.PIPELINELOGPATH,
//                                  iCIPJobs.getId(), IAIJobConstants.OUTLOG));
////            
////                    }
//                  
						if (jobObject.getJobType().toString().equalsIgnoreCase("CHAIN")) {
							iCIPChainJobs.setJobStatus(JobStatus.OPEN.toString());
							iCIPChainJobs = chainJobsService.save(iCIPChainJobs);
							chainoutPath = Paths.get(annotationServiceUtil.getFolderPath(), IAIJobConstants.LOGPATH,
									IAIJobConstants.CHAINLOGPATH, iCIPChainJobs.getCorrelationid());

							iCIPJobs.setJobStatus(JobStatus.OPEN.toString());
							iCIPJobs = jobsService.save(iCIPJobs);
							outPath = Paths.get(chainoutPath.toString(),
									String.format("%s%s", iCIPJobs.getJobId(), IAIJobConstants.OUTLOG));

						} else {
							iCIPJobs.setJobStatus(JobStatus.OPEN.toString());
							String jobsMeta = iCIPJobs.getJobmetadata();
							if (agenticMeta != null) {
								JSONObject pipelinemetaJSON = new JSONObject(agenticMeta);
								JSONObject jobsmetaJSON = new JSONObject(jobsMeta);
								if (pipelinemetaJSON.has("agentTaskName")) {
									jobsmetaJSON.put("agentTaskName", pipelinemetaJSON.get("agentTaskName").toString());
									iCIPJobs.setJobmetadata(jobsmetaJSON.toString());
								}
							}

							iCIPJobs = jobsService.save(iCIPJobs);
							outPath = Paths.get(annotationServiceUtil.getFolderPath(),
									String.format(LoggerConstants.STRING_DECIMAL_STRING,
											IAIJobConstants.PIPELINELOGPATH, iCIPJobs.getId(), IAIJobConstants.OUTLOG));
						}

						Integer result = 0;

						log.info("OutPath : {}", outPath);
						if (jobObject.getJobType().toString().equalsIgnoreCase("CHAIN")) {
							File theDir = new File(chainoutPath.toString());
							if (!theDir.exists()) {
								theDir.mkdirs();
							}
						}
						Files.createDirectories(outPath.getParent());
						Files.deleteIfExists(outPath);
						Files.createFile(outPath);
						if (!Files.exists(outPath)) {

							iCIPJobs.setJobStatus(JobStatus.ERROR.toString());
							iCIPJobs.setLog("Configuration Error : Log File Not Found [Path : "
									+ outPath.toAbsolutePath().toString() + "]");
							iCIPJobs = jobsService.save(iCIPJobs);

							if (jobObject.getJobType().toString().equalsIgnoreCase("CHAIN")) {
								iCIPChainJobs.setJobStatus(JobStatus.ERROR.toString());
								iCIPChainJobs.setLog("Configuration Error : Log File Not Found [Path : "
										+ outPath.toAbsolutePath().toString() + "]");
								iCIPChainJobs = chainJobsService.save(iCIPChainJobs);
							}
						}
						context.setResult(result);
						log.info("run time value {}", dsObject.getAlias());
						Boolean executeEnable = jobExecutorEnabled;
						if (jobExecutorEnabled) {
							executeEnable = jobExecutorEnabled;
						} else {
							List<String> jobExecutorOrgList = Arrays.asList(jobExecutorOrg.split(","));
							executeEnable = !jobExecutorOrgList.contains(jobObject.getOrg());
						}
						if (executeEnable) {
							log.info("jobid value {}",
									ICIPUtils.removeSpecialCharacter(jobId.toString() + job.getName()));
							ICIPJobs job2save = iCIPJobsRepository
									.findByJobId(ICIPUtils.removeSpecialCharacter(jobId.toString() + job.getName()));
							String taskId = executeScript(version, connDetails, nativeJobDetails, jobUtilConn, index,
									uploadDs, job2save.getPayload());
							org.json.JSONObject jobMetaData = new org.json.JSONObject(job2save.getJobmetadata());
							jobMetaData.put("taskId", taskId);
							job2save.setJobmetadata(jobMetaData.toString());
							log.info("taskId value {}", taskId);
							JSONObject statusResponse = getTaskStatus(taskId, connDetails);
							if (statusResponse != null) {
								String status = statusResponse.optString("task_status", null); // Use optString to avoid
																								// NullPointerException
								log.info("status  value {}", status);
								job2save.setJobStatus(status);
							}
							iCIPJobsRepository.save(job2save);
						}

					} catch (InterruptedException e) {
						Thread.currentThread().interrupt(); // Restore the interrupted status

						throw new EssedumException("Thread was interrupted: " + e.getMessage()); // Throw a custom
																								// exception
					} catch (Exception ex) {
						if (Objects.nonNull(dsObject.getAlias())) {
							iCIPJobs.setRuntime("Remote-" + dsObject.getAlias());
						} else {
							List<String> items = Arrays.stream(runtimeList.split(",")).map(String::trim)
									.collect(Collectors.toList());
							SecureRandom random = new SecureRandom();
							int randomIndex = random.nextInt(items.size());
							iCIPJobs.setRuntime("Remote-" + items.get(randomIndex));
						}
						iCIPJobs.setJobStatus(JobStatus.ERROR.toString());
						iCIPJobs.setLog(ex.getMessage());
						iCIPJobs.setFinishtime(new Timestamp(new Date().getTime()));
						iCIPJobs = jobsService.save(iCIPJobs);
						if (jobObject.getJobType().toString().equalsIgnoreCase("CHAIN")) {

							iCIPChainJobs.setJobStatus(JobStatus.ERROR.toString());
							iCIPChainJobs.setLog(ex.getMessage());
							iCIPChainJobs.setFinishtime(new Timestamp(new Date().getTime()));
							iCIPChainJobs = chainJobsService.save(iCIPChainJobs);
						}

						// String msg = "Error in running job : " + ex.getClass().getCanonicalName() + "
						// - " + ex.getMessage();
						String msg = "Error in running job : " + " - "
								+ ex.getMessage().replace("Connection reset", "");

						log.error(msg, ex);
						throw new EssedumException("\n" + msg);

					}

				} catch (Exception ex) {
					// Check if the caught exception is an InterruptedException
					if (ex instanceof InterruptedException) {
						Thread.currentThread().interrupt();
						throw new JobExecutionException("Thread was interrupted: " + ex.getMessage(), ex);
					}
					Path chainoutPath = null;
					Path outPath = null;

					if (jobObject.getJobType().toString().equalsIgnoreCase("CHAIN")) {
						chainoutPath = Paths.get(annotationServiceUtil.getFolderPath(), IAIJobConstants.LOGPATH,
								IAIJobConstants.CHAINLOGPATH, iCIPChainJobs.getCorrelationid());
						outPath = Paths.get(chainoutPath.toString(),
								String.format("%s%s", iCIPJobs.getJobId(), IAIJobConstants.OUTLOG));
					} else {
						outPath = Paths.get(annotationServiceUtil.getFolderPath(),
								String.format(LoggerConstants.STRING_DECIMAL_STRING, IAIJobConstants.PIPELINELOGPATH,
										iCIPJobs.getId(), IAIJobConstants.OUTLOG));
					}
					log.info("outPath is:", outPath);
					String error = "Error in Job Execution : " + ex.getMessage()
							+ System.getProperty(IAIJobConstants.LINE_SEPARATOR) + ex.toString();
//				FileOutputStream writer = null;

//          FileChannel channel = null;
					try {
						log.info("Inside try while writing error logs");
						if (jobObject.getJobType().toString().equalsIgnoreCase("CHAIN")) {
							File theDir = null;
							if (chainoutPath != null) {
								theDir = new File(chainoutPath.toString());
								if (!theDir.exists()) {
									theDir.mkdirs();
								}
							} else {
								logger.error("chainoutpath does not exist i.e value is null");
							}

						}
						Files.deleteIfExists(outPath);
						Files.createFile(outPath);

						try (FileOutputStream writer = new FileOutputStream(outPath.toString())) {

							log.info("About to write error logs");
							writer.write(error.getBytes());
							writer.write(10);
							log.info("Error logs written to path: {}", outPath);
							handlingErrorStatus(error, jobObject);
						}
					} catch (EssedumException | IOException e) {
						log.error(e.getMessage(), e);
					} catch (Exception e) {
						log.info("Inside Exception while writing error logs");
						log.error(e.getMessage(), e);
					} finally {
						log.info("Finished processing error logs.");

					}
				}
			}
		}

		else

		{
			if (jobObject.getJobType().toString().equalsIgnoreCase("CHAIN")) {
				iCIPChainJobs.setJobStatus(JobStatus.ERROR.toString());
				iCIPChainJobs.setLog("Scripts Generation error");
				iCIPChainJobs.setFinishtime(new Timestamp(new Date().getTime()));
				iCIPChainJobs = chainJobsService.save(iCIPChainJobs);
			} else {
				JobObjectDTO.Jobs job = jobObject.getJobs().get(0);
				MetaData pipelineMetadata = new MetaData();
				// JobMetadata jobMetadata = JobMetadata.USER;
				if (jobObject.isRunNow()) {
					jobMetadata = JobMetadata.USER;
				} else {
					jobMetadata = JobMetadata.SCHEDULED;
				}
				pipelineMetadata.setTag(jobMetadata.toString());

				String workerlogId = jobDataMap.getString("workerlogId");

				iCIPJobs = new ICIPJobs(null, ICIPUtils.removeSpecialCharacter(jobId.toString() + job.getName()),
						jobObject.getSubmittedBy(), job.getName(), JobStatus.STARTED.toString(), version, null,
						submittedOn, job.getRuntime().toString(), jobObject.getOrg(), REMOTE, null, attributesHash,
						jobObject.getCorelId(), null, gson.toJson(pipelineMetadata), 0, "{}", "{}", "{}", "{}", "{}",
						workerlogId);
				iCIPJobs.setJobStatus(JobStatus.ERROR.toString());
				iCIPJobs.setLog("Scripts Generation error");
				iCIPJobs.setFinishtime(new Timestamp(new Date().getTime()));
				iCIPJobs = jobsService.save(iCIPJobs);
			}
		}
	}

	protected Path returnPath(JobType jobtype, String logpath, ICIPJobs tmpJob) throws EssedumException {
		switch (jobtype) {
		case CHAIN:
			return Paths.get(annotationServiceUtil.getFolderPath(), IAIJobConstants.LOGPATH,
					IAIJobConstants.CHAINLOGPATH, iCIPChainJobs.getCorrelationid(),
					String.format("%s%s", tmpJob.getJobId(), logpath));
		case PIPELINE:
			return Paths.get(annotationServiceUtil.getFolderPath(), String.format(LoggerConstants.STRING_DECIMAL_STRING,
					IAIJobConstants.PIPELINELOGPATH, iCIPJobs.getId(), logpath));
		default:
			throw new EssedumException(INVALID_JOBTYPE);
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
		if (job.getJobType().toString().equalsIgnoreCase("Chains")) {
			iCIPChainJobs = iCIPChainJobs.updateJob(JobStatus.ERROR.toString(), stringBuilder.toString());
			chainJobsService.save(iCIPChainJobs);
		}

		jobSyncExecutorService.callAlertEvent(true, job.getSubmittedBy(),
				alertConstants.getPIPELINE_ERROR_MAIL_SUBJECT(), alertConstants.getPIPELINE_ERROR_MAIL_MESSAGE(),
				alertConstants.getPIPELINE_ERROR_NOTIFICATION_MESSAGE(), job.getName(), job.getOrg(), null);
	}

	private String getRunCommand(Jobs job, List<ICIPNativeJobDetails> nativeJobDetails, int index)
			throws EssedumException, InvalidRemoteException, TransportException, GitAPIException {
		String runCmd = "";
		switch (job.getRuntime()) {
		case NATIVESCRIPT:
			runCmd = getNativeJobCommand(nativeJobDetails.get(index));
			break;
		case BINARY:
			runCmd = getBinaryJobCommand(nativeJobDetails.get(index));
			break;
		case DRAGANDDROP:
			runCmd = getDragAndDropJobCommand(nativeJobDetails.get(index));
			break;
		case DRAGNDROPLITE:
			runCmd = getDragAndDropJobCommand(nativeJobDetails.get(index));
			break;
		case AZURE:
			runCmd = getAzureJobCommand(nativeJobDetails.get(index));
			break;
		default:
			runCmd = getDragAndDropJobCommand(nativeJobDetails.get(index));
		}
		return runCmd;
	}

	private Path getUploadFilePath(IICIPJobServiceUtil jobUtilConn, List<ICIPNativeJobDetails> nativeJobDetails,
			int index) throws InvalidRemoteException, TransportException, GitAPIException {
		return jobUtilConn.getFilePath(nativeJobDetails.get(index));

	}

	private String uploadScript(ICIPDatasource uploadDs, String attributes, String uploadFile)
			throws EssedumException, Exception {
		IICIPDataSourceServiceUtil uploadPluginConn = dsPluginService.getDataSourceService(uploadDs);
		return uploadPluginConn.uploadFile(uploadDs, attributes, uploadFile);
	}

	private String runScript(Integer version, String runCmd, IICIPJobServiceUtil jobUtilConn,
			List<ICIPNativeJobDetails> nativeJobDetails, JSONObject connDetails, ICIPDatasource uploadDs, Jobs job,
			String datasourceName, RemotePipelineConfig pipelinConfig, int index, JsonObject env, Boolean isEvent,
			JSONObject usedSecrets) throws EssedumException, InterruptedException {
		String payload = null;
		String status = null;
		JSONObject attributes = new JSONObject();
		logger.info("Pipeline name is " + nativeJobDetails.get(index).getCname());
		attributes.put("pipelineName", sanitizePipelineName(nativeJobDetails.get(index).getCname()));
		try {

			// if (!checkTaskExists(nativeJobDetails, connDetails, uploadDs, version)) {
			payload = getPayloadForScriptExecution(version, connDetails, nativeJobDetails, jobUtilConn, uploadDs,
					runCmd, pipelinConfig, index, env, isEvent, usedSecrets);
			iCIPJobs.setPayload(payload);
			JSONObject pipelineData = new JSONObject();
			pipelineService.updatePipelineMetadata(pipelineData, nativeJobDetails.get(index).getCname(),
					nativeJobDetails.get(index).getOrg(), version);
			// } else {
			// taskId = pipelineService.getTaskId(version.toString(),
			// nativeJobDetails.get(0).getCname(),
			// nativeJobDetails.get(0).getOrg());
			// }

			RemoteJobMetadata metaData = new RemoteJobMetadata();
			// metaData.setTaskId(taskId);
			metaData.setTaskName(nativeJobDetails.get(index).getId().length() > 24
					? nativeJobDetails.get(index).getId().substring(nativeJobDetails.get(index).getId().length() - 24)
					: nativeJobDetails.get(index).getId());
			metaData.setProjectId(connDetails.get("projectId").toString());
			// metaData.setBucketName(connDetails.get("bucketname").toString());
			metaData.setBucketName(connDetails.get(BUCKET_NAME).toString());
			metaData.setPipelineName(attributes.getString("pipelineName"));
			metaData.setLogFilePath(generateLogFilePath(metaData, version));
			metaData.setDatasourceName(datasourceName);
			metaData.setTag("User");
			if (iCIPChainJobs != null) {
				JSONObject chainmetadata = new JSONObject(metaData);

				MetaData datachain = new MetaData();
				datachain.setTag("CHAIN");
				datachain.setName(iCIPChainJobs.getJobName());
				JSONObject jsondatachain = new JSONObject(datachain);
				jsondatachain.put("runtime", REMOTE);

				JSONObject chainjobMetadata = new JSONObject(iCIPChainJobs.getJobmetadata());
				if (chainjobMetadata.has("tag")
						&& chainjobMetadata.get("tag").toString().equalsIgnoreCase("SCHEDULED")) {
					jsondatachain.put("isScheduled", "true");
				} else {
					if (chainjobMetadata.has("isScheduled")
							&& chainjobMetadata.get("isScheduled").toString().equalsIgnoreCase("true")) {
						jsondatachain.put("isScheduled", "true");
					} else {
						jsondatachain.put("isScheduled", "false");
					}

				}

				iCIPChainJobs.setJobmetadata(jsondatachain.toString());
				chainmetadata.put("name", iCIPChainJobs.getJobName());
				chainmetadata.put("tag", "CHAIN");

				iCIPJobs.setJobmetadata(chainmetadata.toString());
			} else {
				metaData.setTag(jobMetadata.toString());
				iCIPJobs.setJobmetadata(gson.toJson(metaData));
			}
			/*
			 * JSONObject statusResponse = getTaskStatus(taskId, connDetails);
			 * 
			 * if (statusResponse != null) { status =
			 * statusResponse.optString("task_status", null); // Use optString to avoid
			 * NullPointerException if ("RUNNING".equalsIgnoreCase(status) ||
			 * "COMPLETED".equalsIgnoreCase(status)) return new
			 * ResponseEntity<>(HttpStatusCode.valueOf(200)); else { return new
			 * ResponseEntity<>(HttpStatusCode.valueOf(400)); }
			 * 
			 * } else { return new ResponseEntity<>(HttpStatusCode.valueOf(400)); }
			 */
			return payload;
		} catch (Exception e) {
			throw new EssedumException("Error in executeScript:" + e.getMessage());

		}
	}

	JSONObject getTaskStatus(String taskId, JSONObject connDetails) throws EssedumException {
		// TODO Auto-generated method stub

		logger.info("Inside getTaskStatus");
		String url = connDetails.get("Url").toString() + "/" + taskId + "/getStatus";
		logger.info("getStatus URL " + url);
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);
		if (sslContext != null) {
			OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
			newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
			newBuilder.hostnameVerifier((hostname, session) -> true);
			OkHttpClient client = newBuilder.build();
			// MediaType mediaType = MediaType.parse("application/json");
			// JSONObject bodyObject = new JSONObject();
			Request requestokHttp = new Request.Builder().url(url).addHeader("accept", "application/json").build();
			logger.info("getStatus request " + requestokHttp);
			try {
				Response response = client.newCall(requestokHttp).execute();
				logger.info("getStatus response " + response);
				logger.info("getStatus response body " + response.body());
				logger.info("getStatus response code " + response.code());
				if (response.code() == 200) {
					return new JSONObject(response.body().string());
				} else
					return new JSONObject(response);

			} catch (Exception e) {
				throw new EssedumException("Error in getStatus:" + e.getMessage());
			}
		} else {
			throw new EssedumException("SSLContext is null, could not create a secure connection.");
		}
	}

	JSONObject getLog(String taskId, JSONObject connDetails) throws EssedumException {
		logger.info("Inside getLog");
		String url = connDetails.get("Url").toString() + "/" + taskId + "/getLog";
		logger.info("getLog URL " + url);
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);

		if (sslContext != null) {
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

					// Modify the content to change the prefix format
					String content = responsebody.getJSONObject("logs").getString("content");

					// Decode and modify the value of prefix
					String modifiedContent = modifyPrefixInContent(content);

					// Update the response body with the modified content
					responsebody.getJSONObject("logs").put("content", modifiedContent);

					return responsebody;

				} else if (response.code() == 400) {
					throw new EssedumException("Remote get task Log for taskid " + taskId);
				} else {
					throw new EssedumException("Remote get task log for  " + taskId + " Response Code " + response.code()
							+ " Response Body " + response.body());
				}

			} catch (Exception e) {
				throw new EssedumException("Error in getLog:" + e.getMessage() + " Task Id is:" + taskId);

			}

		} else {
			throw new EssedumException("SSLContext is null, could not create a secure connection.");
		}
	}

	private String modifyPrefixInContent(String content) {
		// Locate the position of the prefix in the content
		String prefixKey = "prefix=";
		int prefixStartIndex = content.indexOf(prefixKey);
		if (prefixStartIndex != -1) {
			// Extracting the prefix part
			String prefixValue = content.substring(prefixStartIndex);

			// Find the end of the prefix value
			int prefixEndIndex = prefixValue.indexOf("&");
			if (prefixEndIndex == -1) {
				prefixEndIndex = prefixValue.length(); // No & found, take till the end
			}

			// Extract the actual prefix value
			prefixValue = prefixValue.substring(0, prefixEndIndex);

			// Decode URL components
			String modifiedPrefix = prefixValue.replace("%20", " ").replace("%27", " ").replace("%3A", ":")
					.replace("%28", "(").replace("%29", ")").replace("%2C", ",").replace("&", "");

			return content.replace(prefixValue, modifiedPrefix);
		}

		return content; // Return original content if prefix not found
	}

	private String executeScript(Integer version, JSONObject connDetails, List<ICIPNativeJobDetails> nativeJobDetails,
			IICIPJobServiceUtil jobUtilConn, int index, ICIPDatasource uploadDs, String payload)
			throws InterruptedException, EssedumException {
		String s3path = null;
		try {
			String url = connDetails.get("Url").toString();
			logger.info("url is:" + url);
			Path filePath = getUploadFilePath(jobUtilConn, nativeJobDetails, index);
			String uploadFilePath = filePath.toString();
			JSONObject attributes = new JSONObject().put("bucket", connDetails.get(BUCKET_NAME).toString());
			attributes.put("projectId", nativeJobDetails.get(index).getOrg());
			attributes.put("pipelineName", nativeJobDetails.get(index).getCname());
			attributes.put("version", version);
			attributes.put("object", filePath.getFileName());
			attributes.put("uploadFilePath", generateArtifactsPath(nativeJobDetails, attributes));
			logger.info("About to upload the script");
			s3path = uploadScript(uploadDs, attributes.toString(), uploadFilePath);
			logger.info("Script uploaded to Storage in " + s3path);
			TrustManager[] trustAllCerts = getTrustAllCerts();
			SSLContext sslContext = getSslContext(trustAllCerts);
			if (sslContext != null) {
				OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
				newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
				newBuilder.hostnameVerifier((hostname, session) -> true);
				OkHttpClient client = newBuilder.build();
				MediaType mediaType = MediaType.parse("application/json");
				RequestBody requestBody = RequestBody.create(payload, mediaType);
				Request requestokHttp = new Request.Builder().url(url).method("POST", requestBody).build();
				logger.info("About to submit payload to remote");
				Response response = client.newCall(requestokHttp).execute();
				logger.info("Response code is :" + response.code());
				logger.info("Response body is :" + response.body());
				if (response.code() == 201 || response.code() == 200) {
					// fetch s3 logpath and taskId from the response
					JSONObject responsebody = new JSONObject(response.body().string());
					String responseData = responsebody.getString("task_id");
					logger.info("Response:" + responseData);
					return responseData;
				} else {
					throw new EssedumException("Remote Execution Error for jobid" + nativeJobDetails.get(index).getId()
							+ " Response Code " + response.code());
				}
			} else {
				throw new EssedumException("SSLContext is null, could not create a secure connection.");
			}
		} catch (Exception e) {
			throw new EssedumException("Error in executeScript:" + e.getMessage() + "InputArtifacts Path: " + s3path);
		}
	}

	private String getPayloadForScriptExecution(Integer version, JSONObject connDetails,
			List<ICIPNativeJobDetails> nativeJobDetails, IICIPJobServiceUtil jobUtilConn, ICIPDatasource uploadDs,
			String runCmd, RemotePipelineConfig pipelinConfig, int index, JsonObject env, Boolean isEvent,
			JSONObject usedSecrets) throws EssedumException {
		String bodyString = null;
		String s3path = null;
		try {
			logger.info("Inside getPayloadForScriptExecution");
			JSONObject uploadDSConnDetails = new JSONObject(uploadDs.getConnectionDetails());
			String url = connDetails.get("Url").toString();
			logger.info("url is:" + url);
			Path filePath = getUploadFilePath(jobUtilConn, nativeJobDetails, index);
			String uploadFilePath = filePath.toString();
			JSONObject attributes = new JSONObject().put("bucket", connDetails.get(BUCKET_NAME).toString());
			attributes.put("projectId", nativeJobDetails.get(index).getOrg());
			attributes.put("pipelineName", nativeJobDetails.get(index).getCname());
			attributes.put("version", version);
			attributes.put("object", filePath.getFileName());
			attributes.put("uploadFilePath", generateArtifactsPath(nativeJobDetails, attributes));
			logger.info("About to upload the script");
			s3path = uploadScript(uploadDs, attributes.toString(), uploadFilePath);
			logger.info("Script uploaded to Storage in " + s3path);
			RemoteBody remoteBody = new RemoteBody();
			String endPointUrl = uploadDSConnDetails.optString("url");
			Credentials creds = new Credentials();
			creds.setEndpoint(endPointUrl);
			creds.setAccess_key(uploadDSConnDetails.optString("accessKey"));
			creds.setSecret_key(uploadDSConnDetails.optString("secretKey"));

			JSONObject credentials = new JSONObject(creds);

			remoteBody.setCredentials(credentials);

//            String accessKeyId = connDetails.get("aws_access_key_id").toString();
//            String secretKeyId = connDetails.get("aws_secret_access_key").toString();
//            String regionName = connDetails.get("region_name").toString();
//           // String secretKeyId = connDetails.optString("aws_secret_access_key").toString();
//            Configs configs = new Configs();
//            configs.setAws_access_key_id(accessKeyId);
//            configs.setAws_secret_access_key(secretKeyId);
//            configs.setRegion_name(regionName);
//            configs.setBucket(pipelinConfig.getBucket());
//
//            configs.setContainer(pipelinConfig.getContainer());
//            configs.setInstance_count(pipelinConfig.getInstance_count());
//            configs.setInstance_type(pipelinConfig.getInstance_type());
//            configs.setPy_version(pipelinConfig.getPy_version());
//
//            configs.setRole(pipelinConfig.getRole());
//            configs.setSource(pipelinConfig.getSource());
//            JSONObject configJson = new JSONObject(configs);
//            remoteBody.setConfigs(configJson);

			remoteBody.setBucket(connDetails.get(BUCKET_NAME).toString());
			if (pipelinConfig != null && pipelinConfig.getRunCommand() != null) {
				logger.info("Run command is:" + pipelinConfig.getRunCommand());

				remoteBody.setCommand(pipelinConfig.getRunCommand());
			} else {
				remoteBody.setCommand(runCmd);
			}
			if (isEvent == true) {
				JSONObject paramswithEnv = new JSONObject(nativeJobDetails.get(index).getParams());
				JSONObject env1 = new JSONObject();
				if (paramswithEnv.has("environment")) {
					JSONArray ar = paramswithEnv.getJSONArray("environment");
					for (int i = 0; i < ar.length(); i++) {
						JSONObject a = ar.getJSONObject(i);
						env1.put(a.getString("name"), a.getString("value"));
					}
					Iterator<String> keys = usedSecrets.keys();
					while (keys.hasNext()) {
						String key = keys.next();
						env1.put(key, usedSecrets.getString(key));
					}

					remoteBody.setEnvironment(env1);
				}

				if (env != null) {
					JSONObject environ = new JSONObject();
					ArrayList<String> list = new ArrayList<String>(env.keySet());
					for (int i = 0; i < list.size(); i++) {
						if (!env1.has(list.get(i)))
							env1.put(list.get(i), env.get(list.get(i)).getAsString());
					}
					Iterator<String> keys = usedSecrets.keys();
					while (keys.hasNext()) {
						String key = keys.next();
						if (!env1.has(key))
							env1.put(key, usedSecrets.getString(key));
					}
					remoteBody.setEnvironment(env1);
					logger.info("environment is:" + remoteBody.getEnvironment());

				}

			} else {
				if (env != null) {
					JSONObject environ = new JSONObject();
					ArrayList<String> list = new ArrayList<String>(env.keySet());
					for (int i = 0; i < list.size(); i++) {
						environ.put(list.get(i), env.get(list.get(i)).getAsString());
					}
					remoteBody.setEnvironment(environ);
					logger.info("environment is:" + remoteBody.getEnvironment());

				}
			}

			logger.info("Run Command set in RemoteBody: " + remoteBody.getCommand());
			remoteBody.setInput_artifacts(s3path);
			remoteBody.setName(nativeJobDetails.get(index).getCname());
			remoteBody.setProject_id(nativeJobDetails.get(index).getOrg());
			remoteBody.setVersion(version.toString());
			remoteBody.setStorage(connDetails.get("storageType").toString());
			JSONObject body = new JSONObject(remoteBody);

			bodyString = body.toString();
			logger.info("Payload is:" + bodyString);
			return bodyString;
		} catch (Exception e) {
			throw new EssedumException("Error in getPayloadForScriptExecution:" + e.getMessage() + "InputArtifacts Path: "
					+ s3path + "Payload Id is:" + bodyString);
		}
	}

	private boolean checkTaskExists(List<ICIPNativeJobDetails> nativeJobDetails, JSONObject connDetails,
			ICIPDatasource uploadDs, Integer version, int index) {
		logger.info("Inside checkTaskExists");
		String taskId = pipelineService.getTaskId(version.toString(), nativeJobDetails.get(index).getCname(),
				nativeJobDetails.get(index).getOrg());
		if (taskId != null)
			return true;
		else
			return false;
	}

	private String generateArtifactsPath(List<ICIPNativeJobDetails> nativeJobDetails, JSONObject attributes) {
		return attributes.getString("projectId") + "/remote/" + attributes.getString("pipelineName") + "/"
				+ attributes.get("version") + "/Input";
	}

	private String generateLogFilePath(RemoteJobMetadata metaData, Integer version) {
		return metaData.getProjectId() + "/remote" + "/" + metaData.getPipelineName() + "/" + version
				+ "/outputartifacts/logs/";

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
			ds.put("type", "REMOTE");

		} catch (JSONException e) {
			log.error("plugin attributes mismatch", e);
		}
		return ds;
	}

	public int gen() {
		SecureRandom secureRandom = new SecureRandom();
		return ((1 + secureRandom.nextInt(2)) * 10000 + secureRandom.nextInt(10000));

	}

	/*
	 * public int gen() { Random r = new Random(System.currentTimeMillis()); return
	 * ((1 + r.nextInt(2)) * 10000 + r.nextInt(10000)); }
	 */
	@SuppressWarnings("deprecation")
	@Override
	public String getNativeJobCommand(ICIPNativeJobDetails jobDetails)
			throws EssedumException, InvalidRemoteException, TransportException, GitAPIException {
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
		String cmdStr = "python " + cname + "_generatedCode.py";
		return cmdStr;
	}

	@Override
	public String getAzureJobCommand(ICIPNativeJobDetails jobDetails) throws EssedumException {

		String cname = jobDetails.getCname();
		String cmdStr = "python " + cname + "_generatedCode.py";
		return cmdStr;
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

//	private TrustManager[] getTrustAllCerts() {
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
	private TrustManager[] getTrustAllCerts() {
		if ("true".equalsIgnoreCase(certificateCheck)) {
			try {
				// Load the default trust store
				TrustManagerFactory trustManagerFactory = TrustManagerFactory
						.getInstance(TrustManagerFactory.getDefaultAlgorithm());
				trustManagerFactory.init((KeyStore) null);
				// Get the trust managers from the factory
				TrustManager[] trustManagers = trustManagerFactory.getTrustManagers();

				// Ensure we have at least one X509TrustManager
				for (TrustManager trustManager : trustManagers) {
					if (trustManager instanceof X509TrustManager) {
						return new TrustManager[] { (X509TrustManager) trustManager };
					}
				}
			} catch (KeyStoreException e) {
				logger.info(e.getMessage());
			} catch (NoSuchAlgorithmException e) {
				logger.info(e.getMessage());
			}
			throw new IllegalStateException("No X509TrustManager found. Please install the certificate in keystore");
		} else {
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

	private HashMap<String, String> resolveSecrets(JSONArray pipeline_attributes, String Org) {
		// return null;

		HashMap<String, String> paramswithsecrets = new HashMap<>();

		JSONArray pipelineAttributes = pipeline_attributes;
		pipelineAttributes.forEach(x -> {
			JSONObject obj = new JSONObject(x.toString());
			if (obj.has("name") && obj.getString("name").trim() != null && obj.getString("name").trim() != "") {
				if (obj.getString("name").equals("usedSecrets")) {
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
			}

		});

		return paramswithsecrets;
	}
}
