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

package com.infosys.icets.icip.icipwebeditor.job;

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.NoSuchAlgorithmException;
import java.sql.Timestamp;
import java.util.Base64;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.api.errors.InvalidRemoteException;
import org.eclipse.jgit.api.errors.TransportException;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.python.util.PythonInterpreter;
import org.quartz.JobDataMap;
import org.quartz.JobDetail;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.SchedulerException;
import org.quartz.Trigger;
import org.quartz.UnableToInterruptJobException;
import org.quartz.impl.matchers.KeyMatcher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.icip.icipwebeditor.IICIPJobRuntimeServiceUtil;
import com.infosys.icets.icip.icipwebeditor.constants.AlertConstants;
import com.infosys.icets.icip.icipwebeditor.constants.FileConstants;
import com.infosys.icets.icip.icipwebeditor.constants.IAIJobConstants;
import com.infosys.icets.icip.icipwebeditor.constants.LoggerConstants;
import com.infosys.icets.icip.icipwebeditor.executor.sync.service.JobSyncExecutorService;
import com.infosys.icets.icip.icipwebeditor.factory.IICIPJobServiceUtilFactory;
import com.infosys.icets.icip.icipwebeditor.file.service.ICIPFileService;
import com.infosys.icets.icip.icipwebeditor.job.constants.JobConstants;
import com.infosys.icets.icip.icipwebeditor.job.enums.JobMetadata;
import com.infosys.icets.icip.icipwebeditor.job.enums.JobStatus;
import com.infosys.icets.icip.icipwebeditor.job.enums.JobType;
import com.infosys.icets.icip.icipwebeditor.job.enums.RuntimeType;
import com.infosys.icets.icip.icipwebeditor.job.listener.ICIPJobSchedulerListener;
import com.infosys.icets.icip.icipwebeditor.job.model.ICIPChainJobs;
import com.infosys.icets.icip.icipwebeditor.job.model.ICIPInternalJobs.MetaData;
import com.infosys.icets.icip.icipwebeditor.job.model.TriggerValues;
import com.infosys.icets.icip.icipwebeditor.job.model.dto.JobObjectDTO;
import com.infosys.icets.icip.icipwebeditor.job.service.util.ICIPInitializeAnnotationServiceUtil;
import com.infosys.icets.icip.icipwebeditor.job.service.util.ICIPJobServiceUtilGenerated;
import com.infosys.icets.icip.icipwebeditor.jobmodel.service.ICIPAgentJobsService;
import com.infosys.icets.icip.icipwebeditor.jobmodel.service.ICIPChainJobsService;
import com.infosys.icets.icip.icipwebeditor.jobmodel.service.ICIPJobsService;
import com.infosys.icets.icip.icipwebeditor.model.ICIPAgentJobs;
import com.infosys.icets.icip.icipwebeditor.model.ICIPEventJobMapping;
import com.infosys.icets.icip.icipwebeditor.model.ICIPJobs;
import com.infosys.icets.icip.icipwebeditor.model.ICIPJobsPartial;
import com.infosys.icets.icip.icipwebeditor.model.ICIPPipelinePID;
import com.infosys.icets.icip.icipwebeditor.model.ICIPStreamingServices;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPNativeJobDetails;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPChainJobsRepository;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPJobsPartialRepository;
import com.infosys.icets.icip.icipwebeditor.service.IICIPEventJobMappingService;
import com.infosys.icets.icip.icipwebeditor.service.IICIPJobsService;
import com.infosys.icets.icip.icipwebeditor.service.IICIPStreamingServiceService;
import com.infosys.icets.icip.icipwebeditor.service.aspect.IAIResolverAspect;
import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPPipelinePIDService;
import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPPipelineService;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;

// TODO: Auto-generated Javadoc
/** The Constant log. */
@Log4j2
@Component("localjobruntime")
public class ICIPNativeServiceJob implements IICIPJobRuntimeServiceUtil {
	
	/** The streaming services service. */
    @Autowired
    private IICIPStreamingServiceService streamingServicesService;

    /** The pipeline service. */
    @Autowired
    private ICIPPipelineService pipelineService;

   /* Code Changes requires Validataion  */

    /** The i ICIP jobs service. */
	@Autowired
	private IICIPJobsService iICIPJobsService;
	
	@Autowired
	ICIPChainJobsRepository iCIPChainJobsRepository;
	
    /** The resolver. */
    @Autowired
    private IAIResolverAspect resolver;

    /** The event mapping service. */
    @Autowired
    private IICIPEventJobMappingService eventMappingService;
	/** The Constant LOCAL. */
	private static final String LOCAL = "local";
	
	/** The Constant SPARKHOME_STR. */
	private static final String SPARKHOME_STR = "SPARK_HOME";
	
	/** The Constant PYTHON2PATH_STR. */
	private static final String PYTHON2PATH_STR = "PYTHON2PATH";
	
	/** The Constant PYTHON3PATH_STR. */
	private static final String PYTHON3PATH_STR = "PYTHON3PATH";

	/** The Constant SERVER_CANCELLED. */
	// log messages
	private static final String SERVER_CANCELLED = "Chain cannot proceed as some error occurred";
	
	/** The Constant USER_CANCELLED. */
	private static final String USER_CANCELLED = "User cancelled the job";
	
	/** The Constant INVALID_JOBTYPE. */
	private static final String INVALID_JOBTYPE = "Invalid JobType";
	
	/** The Constant NOT_REQUIRED. */
	private static final String NOT_REQUIRED = "Not required";
	
	/** The Constant JOB_RUNNING_ERROR. */
	private static final String JOB_RUNNING_ERROR = "One job is already in running state with same params";

	/** The annotation service util. */
	@Autowired
	@Lazy
	private ICIPInitializeAnnotationServiceUtil annotationServiceUtil;

	/** The alert constants. */
	@Autowired
	private AlertConstants alertConstants;

	/** The jobs service. */
	@Autowired
	private ICIPJobsService jobsService;

	/** The chain jobs service. */
	@Autowired
	private ICIPChainJobsService chainJobsService;

	/** The agent jobs service. */
	@Autowired
	private ICIPAgentJobsService agentJobsService;

	/** The job sync executor service. */
	@Autowired
	private JobSyncExecutorService jobSyncExecutorService;

	/** The pid service. */
	@Autowired
	private ICIPPipelinePIDService pidService;
	
	@Autowired
	private ICIPJobServiceUtilGenerated generatedService;

	/** The job factory. */
	@Autowired
	private IICIPJobServiceUtilFactory jobFactory;

	/** The i CIP jobs. */
	private ICIPJobs iCIPJobs;
	
	/** The i CIP chain jobs. */
	private ICIPChainJobs iCIPChainJobs;
	
	/** The i CIP agent jobs. */
	private ICIPAgentJobs iCIPAgentJobs;

	/** The spark home. */
	private String sparkHome;
	
	/** The python 2 path. */
	private String python2Path;
	
	/** The python 3 path. */
	private String python3Path;
	
	private transient Thread workerThread;

	/** The i CIP file service. */
	@Autowired
	private ICIPFileService iCIPFileService;
		
	/** The logging path. */
	@Value("${LEAP_HOME}")
	private String folderPath;
	
	/** The jobs partial repository. */
	@Autowired
	private ICIPJobsPartialRepository jobsPartialRepository;

	/**
	 * Execute.
	 *
	 * @param jobExecutionContext the job execution context
	 * @throws JobExecutionException the job execution exception
	 */
	@Override
	public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
		workerThread = Thread.currentThread();
		JobDetail jobDetail = jobExecutionContext.getJobDetail();
		Trigger trigger = jobExecutionContext.getTrigger();
		log.info("Executing Job with key {}", jobDetail.getKey());
		JobDataMap jobDataMap = jobExecutionContext.getMergedJobDataMap();
		//JobObjectDTO jobObjectDTO=(JobObjectDTO) jobDataMap.get(1);
		//log.info("##################jobObjectDTO {}", jobObjectDTO.toString());
		try {
			jobExecutionContext.getScheduler().getListenerManager().addJobListener(new ICIPJobSchedulerListener("JobListener-" + jobDetail.getKey()),
					KeyMatcher.keyEquals(jobDetail.getKey()));
		} catch (SchedulerException e2) {
			// TODO Auto-generated catch block
			e2.printStackTrace();
		}

		
		Gson gson = new GsonBuilder().disableHtmlEscaping().create();
		JobObjectDTO job = null;
		int allScriptGenerated=1;
		// Getting job details
		if (jobDataMap.containsKey(JobConstants.JOB_DATAMAP_VALUE)) {
			String jobString = jobDataMap.getString(JobConstants.JOB_DATAMAP_VALUE);
			job = gson.fromJson(jobString, JobObjectDTO.class);
			List<JobObjectDTO.Jobs> listjobdto = job.getJobs();
			
			for (int index = 0; index < listjobdto.size(); ++index) {
				try {
					JSONObject fileObj = null;
					ICIPStreamingServices pipelineInfo = streamingServicesService.findbyNameAndOrganization(listjobdto.get(index).getName(),job.getOrg());
					if(pipelineInfo.getType().equalsIgnoreCase("DragNDropLite") || pipelineInfo.getType().equalsIgnoreCase("DragNDrop")) {
					fileObj =streamingServicesService.getGeneratedScript(listjobdto.get(index).getName(),job.getOrg());
					System.out.println("hii");
					if(fileObj==null) {
						 String path = streamingServicesService.savePipelineJson(pipelineInfo.getName(),job.getOrg(),pipelineInfo.getJsonContent());
						 JsonObject payload= new JsonObject();
						 payload.addProperty("pipelineName", pipelineInfo.getName());
						 payload.addProperty("scriptPath", path);
						 String corelid=eventMappingService.trigger("generateScript_DragNDropLite", job.getOrg(), "", payload.toString(),"");
						 String status=iICIPJobsService.getEventStatus(corelid);
						 
						 if(!status.equalsIgnoreCase("COMPLETED")) {
							 allScriptGenerated=0;
							 System.out.println("Completed");
						 }
					}
					}
				}
				catch (Exception e) {
					System.out.println("error");
					allScriptGenerated=0;
					// TODO: handle exception
				}
			}
		} else {
			String msg = "Invalid Job Data. Please re-submit the job";
			log.error(msg);
			throw new JobExecutionException(msg);
		}

		if (!job.isEvent()) {
			if (!"CHAIN".equalsIgnoreCase(job.getJobType().toString()))
				job.setCorelId(ICIPUtils.generateCorrelationId());
		}

		try {

			String attributesHash = getAttributeHashString(job);

			if (attributesHash != null) {

				Timestamp submittedOn = new Timestamp(new Date().getTime());

				StringBuilder jobId = new StringBuilder(IAIJobConstants.STRING_BUILDER_CAPACITY);
				jobId.append(jobDetail.getKey().getName());
				jobId.append(new String(Base64.getEncoder().encode(job.getSubmittedBy().getBytes())));
				jobId.append(submittedOn.toInstant());

				try {
					addEntryInJobsTable(job, attributesHash, submittedOn, jobId);
				} catch (Exception ex) {
					String msg = "Error in creating new entry in Job Table : " + ex.getClass().getCanonicalName()
							+ " - " + ex.getMessage();
					log.error(msg, ex);
					throw new LeapException(msg, ex);
				}
     if(allScriptGenerated !=0) {
				Timestamp[] timestamps = getTimestamps(job);
				Timestamp successfulTimestamp = timestamps[0];
				Timestamp lastTimestamp = timestamps[1];

				TriggerValues triggerValues = new TriggerValues(trigger.getNextFireTime(),
						trigger.getPreviousFireTime(), lastTimestamp, successfulTimestamp);

				List<ICIPNativeJobDetails> nativeJobDetails = createNativeJobDetails(job, triggerValues);
				List<String> cmds = loadCommands(job, nativeJobDetails);

				Integer exitCode = runNativeCommand(job, cmds, nativeJobDetails,
						ICIPUtils.removeSpecialCharacter(jobId.toString()));
				jobExecutionContext.setResult(exitCode);
     }
		else {
				if (job.getJobType().toString().equalsIgnoreCase("CHAIN")) {
					iCIPChainJobs.setJobStatus(JobStatus.ERROR.toString());
					iCIPChainJobs.setLog("Scripts Generation error");
					iCIPChainJobs.setFinishtime(new Timestamp(new Date().getTime()));
					iCIPChainJobs = chainJobsService.save(iCIPChainJobs);
				}
				else {
					iCIPJobs.setJobStatus(JobStatus.ERROR.toString());
					iCIPJobs.setLog("Scripts Generation error");
					iCIPJobs.setFinishtime(new Timestamp(new Date().getTime()));
					iCIPJobs = jobsService.save(iCIPJobs);
				}
			}

			} else {
				log.error(JOB_RUNNING_ERROR);
			}
		}catch (InterruptedException e) {
			String error = "Job Interrupted after Threshold Time";
			try {
				handlingInterruptStatus(error, job);
			} catch (LeapException e1) {
				log.error(e.getMessage(), e);
			}
			log.info(error);
			log.error(error);
		}
		catch (Exception ex) {
			String error = "Error in Job Execution : " + ex.getMessage()
					+ System.getProperty(IAIJobConstants.LINE_SEPARATOR) + ex.toString();
			log.error(error, ex);
			try {
				handlingErrorStatus(error, job);
			} catch (LeapException e) {
				log.error(e.getMessage(), e);
			}
		}
	}

	/**
	 * Run native command.
	 *
	 * @param job the job
	 * @param cmds the cmds
	 * @param nativeJobDetails the native job details
	 * @param jobId the job id
	 * @return the integer
	 * @throws IOException Signals that an I/O exception has occurred.
	 * @throws LeapException the leap exception
	 * @throws InterruptedException the interrupted exception
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 * @throws ExecutionException the execution exception
	 */
	private Integer runNativeCommand(JobObjectDTO job, List<String> cmds, List<ICIPNativeJobDetails> nativeJobDetails,
			String jobId)
			throws IOException, LeapException, InterruptedException, NoSuchAlgorithmException, ExecutionException {

		initializeJob(job);

		List<String[]> cmdlist = getCompleteCommand(job, cmds, nativeJobDetails);
		JSONObject params = new JSONObject();
		if(nativeJobDetails.get(0).getParams()== null || nativeJobDetails.get(0).getParams().isBlank()|| nativeJobDetails.get(0).getParams().isEmpty()) {
			params = null;
		}
		else {
			 params = new JSONObject(nativeJobDetails.get(0).getParams());
		}
		

		if (job.isParallel()) {
			List<ChainProcess> chainprocesses = runAll(job, cmdlist);
			List<ProcessBuilder> pbs = getProcessBuilders(chainprocesses);
			List<ICIPJobs> tmpjobs = getICIPJobs(chainprocesses);
			List<Process> processes = getProcesses(pbs);
			initializeRunning(job.getJobType());
			pidService.save(new ICIPPipelinePID(jobId, annotationServiceUtil.getInstanceId(), getPids(processes)));
			boolean isCompleted = true;
			for (int index = 0, limit = chainprocesses.size(); index < limit; index++) {
				Process process = processes.get(index);
				ICIPJobs tmpjob = tmpjobs.get(index);
				Path outPath = returnPath(job.getJobType(), IAIJobConstants.OUTLOG, tmpjob);
				try {
					process.waitFor();
				} catch (InterruptedException e) {
					log.error(e.getMessage(), e);
				}
				boolean status = jobSyncExecutorService.changeJobProperty(tmpjob, outPath);
				isCompleted = isCompleted && status;
			}
			chainJobsService.changeJobProperty(iCIPChainJobs, isCompleted);
			return 0;
		} else {
			List<ChainProcess> pbs = runSequentially(job, cmdlist);
			initializeRunning(job.getJobType());
			Integer result = 0;
			for (int index = 0, limit = pbs.size(); index < limit; index++) {
				ICIPJobs tmpjob = null;
				if ( job.getJobType() !=null && job.getJobType().equals(JobType.CHAIN)) {
					Timestamp submittedOn = new Timestamp(new Date().getTime());
					tmpjob = pbs.get(index).getIcipJobs();
					tmpjob.setSubmittedOn(submittedOn);
					tmpjob = jobsService.save(tmpjob);
				}
				if (index > 0 && !jobsService.findByJobId(pbs.get(index - 1).getIcipJobs().getJobId()).getJobStatus()
						.equals(JobStatus.COMPLETED.toString())) {
					if (job.getJobType() !=null && job.getJobType().equals(JobType.CHAIN) && tmpjob != null) {
						if (JobStatus.CANCELLED != null)
							tmpjob.setJobStatus(JobStatus.CANCELLED.toString());
						tmpjob.setLog(SERVER_CANCELLED);
						tmpjob.setFinishtime(new Timestamp(new Date().getTime()));
						jobsService.save(tmpjob);
					}
				} else {
					if(index>0 && pbs.get(index-1).getIcipJobs()!=null) {
						final int i = index;
						JSONObject newoutput= new JSONObject(pbs.get(index-1).getIcipJobs().getOutput());
						String[] splitarr = pbs.get(i).getProcessBuilder().command().get(2).split(" ");
						newoutput.keySet().forEach(key->{							
							for(int ind = 0;ind<splitarr.length;ind++) {
								if(splitarr[ind].contains(key)) {
									splitarr[ind] = "\""+key+"\":\""+newoutput.get(key).toString()+"\"";
								}
							}
							pbs.get(i).getProcessBuilder().command().set(2,String.join(" ", splitarr));
						});
					}
					ICIPPipelinePID pipelinePID = pidService
							.findByInstanceidAndJobid(annotationServiceUtil.getInstanceId(), jobId);
					if (pipelinePID == null || pipelinePID.getStatus() != -1) {
						
						ICIPStreamingServices mlPipeline =streamingServicesService.findbyNameAndOrganization(job.getJobs().get(0).getName(), job.getOrg());
						if (IAIJobConstants.NATIVE_SCRIPT.equalsIgnoreCase(mlPipeline.getType())) {
							JsonObject attrObject;
							try {
								Gson gson = new Gson();
								attrObject = gson.fromJson(mlPipeline.getJsonContent(), JsonElement.class)
										.getAsJsonObject().get(IAIJobConstants.ELEMENTS).getAsJsonArray().get(0)
										.getAsJsonObject().get(IAIJobConstants.ATTRIBUTES).getAsJsonObject();
							} catch (Exception ex) {
								String msg = "Error in fetching elements[0].attributes : "
										+ ex.getClass().getCanonicalName() + " - " + ex.getMessage();
								log.error(msg, ex);
								throw new LeapException(msg, ex);
							}
							String tmpfileType;
							JsonArray argsJsonArray = new JsonArray();
							try {
								tmpfileType = attrObject.get(IAIJobConstants.FILE_TYPE).getAsString().toLowerCase()
										.trim();
								argsJsonArray = (JsonArray) attrObject.get(IAIJobConstants.ARGUMENTS);
							} catch (Exception ex) {
								String msg = "Error in getting filetype : " + ex.getClass().getCanonicalName() + " - "
										+ ex.getMessage();
								log.error(msg, ex);
								throw new LeapException(msg, ex);
							}
							if (IAIJobConstants.JYTHON.equalsIgnoreCase(tmpfileType)) {
								log.info("Jython Execution will be started");
								JsonArray files;
								try {
									files = attrObject.get(IAIJobConstants.FILES).getAsJsonArray();
								} catch (Exception ex) {
									String msg = "Error in getting file array : " + ex.getClass().getCanonicalName()
											+ " - " + ex.getMessage();
									log.error(msg, ex);
									throw new LeapException(msg, ex);
								}
								Path pathOfCode = null;
								Path pathOfLog = null;
								for (JsonElement file : files) {
									String filePathString = file.getAsString();
									InputStream is = null;
									try {
										is = iCIPFileService.getNativeCodeInputStream(mlPipeline.getName(),
												mlPipeline.getOrganization(), filePathString);
										pathOfCode = iCIPFileService.getFileInServer(is, filePathString,
												FileConstants.NATIVE_CODE);
									} catch (Exception ex) {
										String msg = "Error in getting file path : " + ex.getClass().getCanonicalName()
												+ " - " + ex.getMessage();
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
								}
								ICIPJobsPartial iCIPJobsPartial = jobsPartialRepository.findByJobId(jobId);
								if (iCIPJobsPartial != null)
									pathOfLog = Paths.get(folderPath + IAIJobConstants.JOBS_SUB_PATH,
											String.format(LoggerConstants.STRING_DECIMAL_STRING,
													IAIJobConstants.PIPELINELOGPATH, iCIPJobsPartial.getId(),
													IAIJobConstants.OUTLOG));
								/*
								 * Executing Python code using Jython if type is Jython
								 */
								PythonInterpreter pyInterp = new PythonInterpreter();
								String outputFile = pathOfLog.toAbsolutePath().toString();
								PrintStream print = new PrintStream(new FileOutputStream(outputFile));
								pyInterp.setOut(print);
								String[] argsList = new String[argsJsonArray.size()];
								for (int i = 0; i < argsJsonArray.size(); i++) {
									JsonObject argsObj = argsJsonArray.get(i).getAsJsonObject();
									JsonElement nameElement = argsObj.get(IAIJobConstants.NAME);
									String name = nameElement.getAsString();
									JsonElement valueElement = argsObj.get(IAIJobConstants.VALUE);
									String value = valueElement.getAsString();
									if (value == null || value.isBlank()) {
										if (params.has(name)){
										value = params.getString(name);
										}
									}
									argsList[i] = name + IAIJobConstants.COLON + value;
								}
								try {
									/*
									 * Adding arguments from DB
									 */
									pyInterp.exec("import sys\n" + "sys.argv = " + addArgs(argsList));
									/*
									 * Executing Python file present in the scripts path using Jython
									 */
									pyInterp.execfile(pathOfCode.toAbsolutePath().toString());
									pyInterp.close();
									jobSyncExecutorService.changeJobProperty(iCIPJobs,
											returnPath(job.getJobType(), IAIJobConstants.OUTLOG, null));
									return 0;
								} catch (Exception e) {
									pyInterp.close();
									jobSyncExecutorService.changeJobProperty(iCIPJobs,
											returnPath(job.getJobType(), IAIJobConstants.OUTLOG, null));
									/*
									 * Adding error to log file
									 */
									Path fileName = Path.of(outputFile);
									Files.writeString(fileName, e.getMessage());
									Files.writeString(fileName, e.toString());
									if (log.isDebugEnabled()) {
										log.error("Error because of:{} at class:{} and line:{}", e.getMessage(),
												e.getStackTrace()[0].getClass(), e.getStackTrace()[0].getLineNumber());
									}
									return 0;
								}
							}

						}
						Process process = pbs.get(index).getProcessBuilder().start();
						if (pipelinePID != null) {
							pipelinePID.setPid(String.valueOf(process.pid()));
						} else {
							pipelinePID = new ICIPPipelinePID(jobId, annotationServiceUtil.getInstanceId(),
									String.valueOf(process.pid()));
						}
						pidService.save(pipelinePID);
						switch (job.getJobType()) {
						case CHAIN:
							Path outPath = returnPath(job.getJobType(), IAIJobConstants.OUTLOG, tmpjob);
							result = process.waitFor();
							jobSyncExecutorService.changeJobProperty(tmpjob, outPath);
							break;
						case AGENT:
							result = process.waitFor(Integer.parseInt(annotationServiceUtil.getAgentsTimeout()),
									TimeUnit.SECONDS) ? 0 : -1;
							break;
						case PIPELINE:
							result = process.waitFor();
							break;
						default:
							throw new LeapException(INVALID_JOBTYPE);
						}
					} else {
						if (job.getJobType() !=null && job.getJobType().equals(JobType.CHAIN) && tmpjob != null) {
							if (JobStatus.CANCELLED != null)
								tmpjob.setJobStatus(JobStatus.CANCELLED.toString());
							tmpjob.setLog(USER_CANCELLED);
							tmpjob.setFinishtime(new Timestamp(new Date().getTime()));
							jobsService.save(tmpjob);
						}
					}
				}
			}
			switch (job.getJobType()) {
			case CHAIN:
				boolean isCompleted = jobsService.findByJobId(pbs.get(pbs.size() - 1).getIcipJobs().getJobId())
						.getJobStatus().equals(JobStatus.COMPLETED.toString());
				chainJobsService.changeJobProperty(iCIPChainJobs, isCompleted);
				break;
			case AGENT:
				agentJobsService.changeJobProperty(iCIPAgentJobs);
				break;
			case PIPELINE:
				jobSyncExecutorService.changeJobProperty(iCIPJobs,
						returnPath(job.getJobType(), IAIJobConstants.OUTLOG, null));
				break;
			default:
				throw new LeapException(INVALID_JOBTYPE);
			}
			return result;
		}

	}

	private static String addArgs(String[] argsList) {
		StringBuilder sb = new StringBuilder("[");
		for (int i = 0; i < argsList.length; i++) {
			sb.append("'").append(argsList[i]).append("'");
			if (i < argsList.length - 1) {
				sb.append(", ");
			}
		}
		sb.append("]");
		return sb.toString();
	}

	/**
	 * Gets the ICIP jobs.
	 *
	 * @param chainprocesses the chainprocesses
	 * @return the ICIP jobs
	 */
	private List<ICIPJobs> getICIPJobs(List<ChainProcess> chainprocesses) {
		List<ICIPJobs> processes = new LinkedList<>();
		for (int index = 0, limit = chainprocesses.size(); index < limit; index++) {
			ICIPJobs proc = chainprocesses.get(index).getIcipJobs();
			Timestamp submittedOn = new Timestamp(new Date().getTime());
			proc.setSubmittedOn(submittedOn);
			jobsService.save(proc);
			processes.add(proc);
		}
		return processes;
	}

	/**
	 * Gets the process builders.
	 *
	 * @param chainprocesses the chainprocesses
	 * @return the process builders
	 */
	private List<ProcessBuilder> getProcessBuilders(List<ChainProcess> chainprocesses) {
		List<ProcessBuilder> processes = new LinkedList<>();
		for (int index = 0, limit = chainprocesses.size(); index < limit; index++) {
			ProcessBuilder proc = chainprocesses.get(index).getProcessBuilder();
			processes.add(proc);
		}
		return processes;
	}

	/**
	 * Gets the processes.
	 *
	 * @param pbs the pbs
	 * @return the processes
	 */
	private List<Process> getProcesses(List<ProcessBuilder> pbs) {
		List<Process> processes = new LinkedList<>();
		for (int index = 0, limit = pbs.size(); index < limit; index++) {
			try {
				Process proc = pbs.get(index).start();
				processes.add(proc);
			} catch (IOException e) {
				log.error(e.getMessage(), e);
			}
		}
		return processes;
	}

	/**
	 * Gets the pids.
	 *
	 * @param processes the processes
	 * @return the pids
	 */
	private String getPids(List<Process> processes) {
		StringBuilder strBuilder = new StringBuilder(IAIJobConstants.STRING_BUILDER_CAPACITY);
		processes.stream().forEach(process -> {
			strBuilder.append(process.pid());
			strBuilder.append("#");
		});
		return strBuilder.toString();
	}

	/**
	 * Initialize running.
	 *
	 * @param jobtype the jobtype
	 * @throws LeapException the leap exception
	 */
	private void initializeRunning(JobType jobtype) throws LeapException {
		switch (jobtype) {
		case CHAIN:
			iCIPChainJobs.setJobStatus(JobStatus.RUNNING.toString());
			iCIPChainJobs = chainJobsService.save(iCIPChainJobs);
			break;
		case AGENT:
			iCIPAgentJobs.setJobStatus(JobStatus.RUNNING.toString());
			iCIPAgentJobs = agentJobsService.save(iCIPAgentJobs);
			break;
		case PIPELINE:
			iCIPJobs.setJobStatus(JobStatus.RUNNING.toString());
			iCIPJobs = jobsService.save(iCIPJobs);
			break;
		default:
			throw new LeapException(INVALID_JOBTYPE);
		}
	}

	/**
	 * Return path.
	 *
	 * @param jobtype the jobtype
	 * @param logpath the logpath
	 * @param tmpJob the tmp job
	 * @return the path
	 * @throws LeapException the leap exception
	 */
	private Path returnPath(JobType jobtype, String logpath, ICIPJobs tmpJob) throws LeapException {
		switch (jobtype) {
		case CHAIN:
			return Paths.get(annotationServiceUtil.getFolderPath(), IAIJobConstants.LOGPATH,
					IAIJobConstants.CHAINLOGPATH, iCIPChainJobs.getCorrelationid(),
					String.format("%s%s", tmpJob.getJobId(), logpath));
		case AGENT:
			return Paths.get(annotationServiceUtil.getFolderPath(), String.format(LoggerConstants.STRING_DECIMAL_STRING,
					IAIJobConstants.AGENTLOGPATH, iCIPAgentJobs.getId(), logpath));
		case PIPELINE:
			return Paths.get(annotationServiceUtil.getFolderPath(), String.format(LoggerConstants.STRING_DECIMAL_STRING,
					IAIJobConstants.PIPELINELOGPATH, iCIPJobs.getId(), logpath));
		default:
			throw new LeapException(INVALID_JOBTYPE);
		}
	}

	/**
	 * Initialize job.
	 *
	 * @param job the job
	 * @throws LeapException the leap exception
	 */
	private void initializeJob(JobObjectDTO job) throws LeapException {
		switch (job.getJobType()) {
		case CHAIN:
			iCIPChainJobs = chainJobsService.save(iCIPChainJobs);
			break;
		case AGENT:
			iCIPAgentJobs = agentJobsService.save(iCIPAgentJobs);
			break;
		case PIPELINE:
			iCIPJobs = jobsService.save(iCIPJobs);
			break;
		default:
			throw new LeapException(INVALID_JOBTYPE);
		}
	}

	/**
	 * Gets the complete command.
	 *
	 * @param job the job
	 * @param cmds the cmds
	 * @param nativeJobDetails the native job details
	 * @return the complete command
	 */
	private List<String[]> getCompleteCommand(JobObjectDTO job, List<String> cmds,
			List<ICIPNativeJobDetails> nativeJobDetails) {
		log.debug("entered in command prompt");
		List<String[]> finalcmds = new LinkedList<>();
		for (int index = 0, limit = job.getJobs().size(); index < limit; index++) {
			String[] finalcmd = getCompleteCommandChild(job, cmds, nativeJobDetails, index);
			finalcmds.add(finalcmd);
		}
		return finalcmds;
	}

	/**
	 * Gets the complete command child.
	 *
	 * @param job the job
	 * @param cmds the cmds
	 * @param nativeJobDetails the native job details
	 * @param index the index
	 * @return the complete command child
	 */
	private String[] getCompleteCommandChild(JobObjectDTO job, List<String> cmds,
			List<ICIPNativeJobDetails> nativeJobDetails, int index) {
		String[] cmd;
		String[] args = new String[2];
		args[0] = cmds.get(index);
		args[1] = "";
		RuntimeType runtime = job.getJobs().get(index).getRuntime();
		Path yamltempFile = nativeJobDetails.get(index).getYamltempFile();
		String osName = System.getProperty("os.name") != null
				? System.getProperty("os.name").toLowerCase(Locale.ENGLISH)
				: "";
		if (osName.startsWith("win")) {
			if (!runtime.equals(RuntimeType.NATIVESCRIPT) && !runtime.equals(RuntimeType.SCRIPT)
					&& !runtime.equals(RuntimeType.BINARY)) {
				if(!nativeJobDetails.get(0).getParams().equals("generated") && !job.isEvent()) {
					args[0] += String.format("%s%s", " -e ", yamltempFile.toAbsolutePath().toString());
				}
			}
			cmd = new String[args.length + 2];
			cmd[0] = "cmd.exe";
			cmd[1] = "/C";
			System.arraycopy(args, 0, cmd, 2, args.length);
		} else if (osName.startsWith("linux")) {
			if (!runtime.equals(RuntimeType.NATIVESCRIPT) && !runtime.equals(RuntimeType.SCRIPT)
					&& !runtime.equals(RuntimeType.BINARY)) {
				if(!nativeJobDetails.get(0).getParams().equals("generated") && !job.isEvent()) {
					args[0] += String.format(LoggerConstants.STRING_STRING_STRING, " -e '",
						yamltempFile.toAbsolutePath().toString(), "'");
				}
			}
			cmd = new String[3];
			cmd[0] = "/bin/sh";
			cmd[1] = "-c";
			cmd[2] = String.format(LoggerConstants.STRING_STRING_STRING, args[0], " ", args[1]);
		} else {
			cmd = args;
		}
		return cmd;
	}

	/**
	 * Load commands.
	 *
	 * @param job the job
	 * @param nativeJobDetails the native job details
	 * @return the list
	 * @throws LeapException the leap exception
	 * @throws GitAPIException 
	 * @throws TransportException 
	 * @throws InvalidRemoteException 
	 */
	private List<String> loadCommands(JobObjectDTO job, List<ICIPNativeJobDetails> nativeJobDetails)
			throws LeapException, InvalidRemoteException, TransportException, GitAPIException {
		List<String> cmds = new LinkedList<>();
		if("generated".equals(nativeJobDetails.get(0).getParams()) || (job.isEvent() && !job.getJobs().get(0).getRuntime().toString().equals("NATIVESCRIPT") && !job.getJobs().get(0).getRuntime().toString().equals("BINARY"))) {
			String params = nativeJobDetails.get(0).getParams();
            String cname = nativeJobDetails.get(0).getCname();
            String org = nativeJobDetails.get(0).getOrg();
            String data = pipelineService.getJson(cname, org);
            data = String.format("%s%s%s", "{\"input_string\":", data, "}");
            if (params != null && !params.isEmpty() && !params.equals("{}") && !params.equals("generated")) {
                try {
                    data = pipelineService.populateAttributeDetails(data, params);
                } catch (Exception ex) {
                    String msg = "Error in populating attributes : " + ex.getClass().getCanonicalName() + " - "
                            + ex.getMessage();
                    log.error(msg, ex);
                    throw new LeapException(msg, ex);
                }
            }

            data = resolver.resolveDatasetData(data, org);
            String pipelineJson = new JSONObject(data).get("input_string").toString();
            String path = streamingServicesService.savePipelineJson(cname, org, pipelineJson);
            JSONObject bodyObj = new JSONObject();
            bodyObj.append("pipelineName", cname);
            bodyObj.append("scriptPath", path);
            List<ICIPEventJobMapping> event = eventMappingService.findByOrgAndSearch(org,"generateScript_"+job.getJobs().get(0).getRuntime(),0,1);
            String pipelineName = new JSONArray(event.get(0).getJobdetails()).getJSONObject(0).getString("name");
            eventMappingService.trigger("generateScript_"+job.getJobs().get(0).getRuntime(), org, null, bodyObj.toString(),"");
            List<ICIPJobsPartial> listJobs =null;
            while(listJobs == null || listJobs.isEmpty() || !listJobs.get(0).getJobStatus().equals("COMPLETED")) {
            	if(listJobs != null && !listJobs.isEmpty() && listJobs.get(0).getJobStatus().equals("ERROR")) {
            		break;
            	}
            	else
            	listJobs = iICIPJobsService.getJobsPartialByService(pipelineName, 0, 1,org);
                
            }
            
			List<String> cmdList =generatedService.getCommand(job.getJobs().get(0).getRuntime().toString().toLowerCase(),nativeJobDetails.get(0).getCname().toString(),org);
			cmdList.forEach(c->{
				cmds.add(c);
			});
		}
		else {
			for (int i = 0, j = job.getJobs().size(); i < j; i++) {
				String cmdStr = jobFactory
						.getJobServiceUtil(job.getJobs().get(i).getRuntime().toString().toLowerCase() + "job")
						.getCommand(nativeJobDetails.get(i));
				cmds.add(cmdStr);
			}
		}
		return cmds;
	}

	/**
	 * Creates the native job details.
	 *
	 * @param job the job
	 * @param triggerValues the trigger values
	 * @return the list
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	private List<ICIPNativeJobDetails> createNativeJobDetails(JobObjectDTO job, TriggerValues triggerValues)
			throws IOException {
		String org = job.getOrg();
		List<ICIPNativeJobDetails> list = new LinkedList<>();
		for (int index = 0, limit = job.getJobs().size(); index < limit; index++) {
			String cname = job.getJobs().get(index).getName();
			String filename = ICIPUtils.removeSpecialCharacter(cname);
			String params = job.getJobs().get(index).getParams();
			String restNodeId = job.getJobs().get(index).getRestNodeId();
			boolean isRestNode = job.getJobs().get(index).isRestNode();
			Path tempDirectory = Files
					.createTempDirectory(String.format("%s%s", filename, IAIJobConstants.ICIPDAGSTER));
			Path yamltempFile = Files.createTempFile(tempDirectory, filename, IAIJobConstants.YAMLFILE);
			Path pytempFile = Files.createTempFile(tempDirectory, filename, IAIJobConstants.PYTHONFILE);
			ICIPNativeJobDetails nativeJobDetails = new ICIPNativeJobDetails();
			nativeJobDetails.setCname(cname);
			nativeJobDetails.setOrg(org);
			nativeJobDetails.setParams(params);
			nativeJobDetails.setSparkHome(sparkHome);
			nativeJobDetails.setPython2Path(python2Path);
			nativeJobDetails.setPython3Path(python3Path);
			nativeJobDetails.setTriggerValues(triggerValues);
			nativeJobDetails.setYamltempFile(yamltempFile);
			nativeJobDetails.setPytempFile(pytempFile);
			nativeJobDetails.setId(restNodeId);
			nativeJobDetails.setRestNode(isRestNode);
			list.add(nativeJobDetails);
		}
		return list;
	}

	/**
	 * Gets the timestamps.
	 *
	 * @param job the job
	 * @return the timestamps
	 * @throws LeapException the leap exception
	 */
	private Timestamp[] getTimestamps(JobObjectDTO job) throws LeapException {
		Timestamp[] timestamps = new Timestamp[] { null, null };
		switch (job.getJobType()) {
		case CHAIN:
			ICIPChainJobs successfulChainJob = chainJobsService.findByJobNameAndOrganizationBySubmission(job.getName(),
					job.getOrg());
			if (successfulChainJob != null) {
				timestamps[0] = successfulChainJob.getSubmittedOn();
			}
			ICIPChainJobs lastChainJob = chainJobsService.findByJobNameAndOrganizationByLastSubmission(job.getName(),
					job.getOrg());
			if (lastChainJob != null) {
				timestamps[1] = lastChainJob.getSubmittedOn();
			}
			break;
		case AGENT:
			ICIPAgentJobs successfulAgentJob = agentJobsService.findByJobNameAndOrganizationBySubmission(job.getName(),
					job.getOrg());
			if (successfulAgentJob != null) {
				timestamps[0] = successfulAgentJob.getSubmittedOn();
			}
			ICIPAgentJobs lastAgentJob = agentJobsService.findByJobNameAndOrganizationByLastSubmission(job.getName(),
					job.getOrg());
			if (lastAgentJob != null) {
				timestamps[1] = lastAgentJob.getSubmittedOn();
			}
			break;
		case PIPELINE:
			ICIPJobs successfulJob = jobsService.findByJobNameAndOrganizationBySubmission(job.getName(), job.getOrg());
			if (successfulJob != null) {
				timestamps[0] = successfulJob.getSubmittedOn();
			}
			ICIPJobs lastJob = jobsService.findByJobNameAndOrganizationByLastSubmission(job.getName(), job.getOrg());
			if (lastJob != null) {
				timestamps[1] = lastJob.getSubmittedOn();
			}
			break;
		default:
			throw new LeapException(INVALID_JOBTYPE);
		}
		return timestamps;
	}

	/**
	 * Handling error status.
	 *
	 * @param error the error
	 * @param job the job
	 * @throws LeapException the leap exception
	 */
	private void handlingErrorStatus(String error, JobObjectDTO job) throws LeapException {
		StringBuilder stringBuilder = new StringBuilder(IAIJobConstants.STRING_BUILDER_CAPACITY);
		stringBuilder.append(System.getProperty(IAIJobConstants.LINE_SEPARATOR));
		stringBuilder.append(error);
		stringBuilder.append(System.getProperty(IAIJobConstants.LINE_SEPARATOR));
		switch (job.getJobType()) {
		case CHAIN:
			iCIPChainJobs = iCIPChainJobs.updateJob(JobStatus.ERROR.toString(), stringBuilder.toString());
			chainJobsService.save(iCIPChainJobs);
			break;
		case AGENT:
			iCIPAgentJobs = iCIPAgentJobs.updateJob(JobStatus.ERROR.toString(), stringBuilder.toString());
			agentJobsService.save(iCIPAgentJobs);
			break;
		case PIPELINE:
			iCIPJobs = iCIPJobs.updateJob(JobStatus.ERROR.toString(), stringBuilder.toString());
			jobsService.save(iCIPJobs);
			break;
		default:
			throw new LeapException(INVALID_JOBTYPE);
		}
		jobSyncExecutorService.callAlertEvent(true, job.getSubmittedBy(),
				alertConstants.getPIPELINE_ERROR_MAIL_SUBJECT(), alertConstants.getPIPELINE_ERROR_MAIL_MESSAGE(),
				alertConstants.getPIPELINE_ERROR_NOTIFICATION_MESSAGE(), job.getName(), job.getOrg(),null);
	}
	
	/**
	 * Handling error status.
	 *
	 * @param error the error
	 * @param job the job
	 * @throws LeapException the leap exception
	 */
	private void handlingInterruptStatus(String error, JobObjectDTO job) throws LeapException {
		StringBuilder stringBuilder = new StringBuilder(IAIJobConstants.STRING_BUILDER_CAPACITY);
		stringBuilder.append(System.getProperty(IAIJobConstants.LINE_SEPARATOR));
		stringBuilder.append(error);
		stringBuilder.append(System.getProperty(IAIJobConstants.LINE_SEPARATOR));
		switch (job.getJobType()) {
		case CHAIN:
			iCIPChainJobs = iCIPChainJobs.updateJob(JobStatus.ERROR.toString(), stringBuilder.toString());
			chainJobsService.save(iCIPChainJobs);
			break;
		case AGENT:
			iCIPAgentJobs = iCIPAgentJobs.updateJob(JobStatus.ERROR.toString(), stringBuilder.toString());
			agentJobsService.save(iCIPAgentJobs);
			break;
		case PIPELINE:
			iCIPJobs = iCIPJobs.updateJob(JobStatus.TIMEOUT.toString(), stringBuilder.toString());
			jobsService.save(iCIPJobs);
			break;
		default:
			throw new LeapException(INVALID_JOBTYPE);
		}
		jobSyncExecutorService.callAlertEvent(true, job.getSubmittedBy(),
				alertConstants.getPIPELINE_ERROR_MAIL_SUBJECT(), alertConstants.getPIPELINE_ERROR_MAIL_MESSAGE(),
				alertConstants.getPIPELINE_ERROR_NOTIFICATION_MESSAGE(), job.getName(), job.getOrg(),null);
	}

	/**
	 * Adds the entry in jobs table.
	 *
	 * @param job the job
	 * @param attributesHash the attributes hash
	 * @param submittedOn the submitted on
	 * @param jobId the job id
	 * @throws LeapException the leap exception
	 */
	private void addEntryInJobsTable(JobObjectDTO job, String attributesHash, Timestamp submittedOn,
			StringBuilder jobId) throws LeapException {
		Gson gson = new Gson();
		JobMetadata jobMetadata = returnJobMetadata(job);
		switch (job.getJobType()) {
		case CHAIN:
			MetaData chainMetadata = new MetaData();
			chainMetadata.setTag(jobMetadata.toString());
			List<ICIPChainJobs> iCIPChainJobsList = iCIPChainJobsRepository.findByCorrelationId(job.getCorelId(), job.getOrg());
			log.info("##SIZE:{}",iCIPChainJobsList.size());
			try {
			iCIPChainJobsList.forEach((n)->{log.info("job:{}:{}:{}",n.getId(),n.getFinishtime(),n.getJobStatus());});
			
			iCIPChainJobsList.sort((o1,o2)->o1.getFinishtime().compareTo(o2.getFinishtime()));
				}
			catch(Exception ex) {
				log.error("Error in sorting 1066 {}",ex.getMessage());
			}
			iCIPChainJobs = new ICIPChainJobs(null, ICIPUtils.removeSpecialCharacter(jobId.toString()), job.getName(),
					job.getOrg(), job.getSubmittedBy(), JobStatus.STARTED.toString(), submittedOn, null, attributesHash,
					job.getCorelId(), null, gson.toJson(chainMetadata), 0);
			break;
		case AGENT:
			MetaData agentMetadata = new MetaData();
			agentMetadata.setTag(jobMetadata.toString());
			iCIPAgentJobs = new ICIPAgentJobs(null, ICIPUtils.removeSpecialCharacter(jobId.toString()),
					job.getSubmittedBy(), job.getName(), JobStatus.STARTED.toString(), null, null, submittedOn,
					job.getJobs().get(0).getRuntime().toString(), job.getOrg(), LOCAL, null, attributesHash,
					job.getCorelId(), null, gson.toJson(agentMetadata), 0);
			break;
		case PIPELINE:
			MetaData pipelineMetadata = new MetaData();
			pipelineMetadata.setTag(jobMetadata.toString());
			iCIPJobs = new ICIPJobs(null, ICIPUtils.removeSpecialCharacter(jobId.toString()), job.getSubmittedBy(),
					job.getName(), JobStatus.STARTED.toString(), null, null, submittedOn,
					job.getJobs().get(0).getRuntime().toString(), job.getOrg(), LOCAL, null, attributesHash,
					job.getCorelId(), null, gson.toJson(pipelineMetadata), 0, "{}", "{}","{}","{}","{}","");
			break;
		default:
			throw new LeapException(INVALID_JOBTYPE);
		}
	}

	/**
	 * Return job metadata.
	 *
	 * @param job the job
	 * @return the job metadata
	 */
	private JobMetadata returnJobMetadata(JobObjectDTO job) {
		JobMetadata jobMetadata;
		if (job.isEvent()) {
			jobMetadata = JobMetadata.EVENT;
		} else {
			if (job.isRunNow()) {
				jobMetadata = JobMetadata.USER;
			} else {
				jobMetadata = JobMetadata.SCHEDULED;
			}
		}
		return jobMetadata;
	}

	/**
	 * Adds the new environment.
	 *
	 * @param map the map
	 * @return the map
	 */
	private Map<String, String> addNewEnvironment(Map<String, String> map) {
		List<String> list = annotationServiceUtil.getEnvironments();
		list.forEach(kv -> {
			String[] keyValue = kv.split("=", 2);
			map.put(keyValue[0], keyValue[1]);
			switch (keyValue[0]) {
			case SPARKHOME_STR:
				sparkHome = keyValue[1];
				break;
			case PYTHON2PATH_STR:
				python2Path = keyValue[1];
				break;
			case PYTHON3PATH_STR:
				python3Path = keyValue[1];
				break;
			default:
				log.debug(NOT_REQUIRED);
			}
		});
		return map;
	}

	/**
	 * Gets the attribute hash string.
	 *
	 * @param job the job
	 * @return the attribute hash string
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 * @throws LeapException the leap exception
	 */
	private String getAttributeHashString(JobObjectDTO job) throws NoSuchAlgorithmException, LeapException {
		String params = job.getJobs().get(0).getParams();
		String nameAndOrg=job.getName().toString()+job.getOrg();
		if (params == null) {
			params = UUID.randomUUID().toString();
		}
		String attributesHash = ICIPUtils.createHashString(nameAndOrg);
		switch (job.getJobType()) {
		case CHAIN:
			return attributesHash;
		case AGENT:
			ICIPAgentJobs tmpAgentJob = agentJobsService.findByHashparams(attributesHash);
			if (tmpAgentJob != null && tmpAgentJob.getJobStatus().equalsIgnoreCase(JobStatus.RUNNING.toString())) {
				return null;
			}
			return attributesHash;
		case PIPELINE:
			ICIPJobs tmpJob = jobsService.findByHashparams(attributesHash);
			if (tmpJob != null && tmpJob.getJobStatus().equalsIgnoreCase(JobStatus.RUNNING.toString())) {
				return null;
			}
			return attributesHash;
		default:
			throw new LeapException(INVALID_JOBTYPE);
		}
	}

	/**
	 * Run all.
	 *
	 * @param job the job
	 * @param cmds the cmds
	 * @return the list
	 * @throws InterruptedException the interrupted exception
	 * @throws ExecutionException the execution exception
	 */
	private List<ChainProcess> runAll(JobObjectDTO job, List<String[]> cmds)
			throws InterruptedException, ExecutionException {
		List<ChainProcess> processes = new LinkedList<>();
		Collection<Callable<ChainProcess>> tasks = new LinkedList<>();
		for (int index = 0, limit = cmds.size(); index < limit; index++) {
			String[] cmd = cmds.get(index);
			tasks.add(new JobRun(job, cmd, index));
		}
		ExecutorService executor = Executors.newFixedThreadPool(cmds.size());
		List<Future<ChainProcess>> results = executor.invokeAll(tasks);
		for (Future<ChainProcess> result : results) {
			processes.add(result.get());
		}
		executor.shutdown();
		return processes;
	}

	/**
	 * Check N sites, but sequentially, not in parallel. Does not use multiple
	 * threads at all.
	 *
	 * @param job the job
	 * @param cmds the cmds
	 * @return the list
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 * @throws IOException Signals that an I/O exception has occurred.
	 * @throws LeapException the leap exception
	 */
	private List<ChainProcess> runSequentially(JobObjectDTO job, List<String[]> cmds)
			throws NoSuchAlgorithmException, IOException, LeapException {
		List<ChainProcess> pbs = new LinkedList<>();
		for (int index = 0, limit = cmds.size(); index < limit; index++) {
//			pbs.add(runJob(job, cmds.get(index), index));
			ChainProcess process = runJob(job, cmds.get(index), index);
			
		
			pbs.add(process);
		}
		return pbs;
	}

	/**
	 * Run job.
	 *
	 * @param job the job
	 * @param cmd the cmd
	 * @param index the index
	 * @return the chain process
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 * @throws IOException Signals that an I/O exception has occurred.
	 * @throws LeapException the leap exception
	 */
	private ChainProcess runJob(JobObjectDTO job, String[] cmd, int index)
			throws NoSuchAlgorithmException, IOException, LeapException {

		ICIPJobs tmpJob = null;
		if (job.getJobType().equals(JobType.CHAIN)) {
			Timestamp submittedOn = new Timestamp(new Date().getTime());
			StringBuilder jobId = new StringBuilder(IAIJobConstants.STRING_BUILDER_CAPACITY);
			jobId.append(ICIPUtils.createHashString(job.getJobs().get(index).getName()));
			jobId.append(new String(Base64.getEncoder().encode(job.getSubmittedBy().getBytes())));
			jobId.append(submittedOn.toInstant());
			jobId.append(index);

			Gson gson = new Gson();
			MetaData pipelineMetadata = new MetaData();
			pipelineMetadata.setTag(JobMetadata.CHAIN.toString());
			pipelineMetadata.setName(job.getAlias());

			tmpJob = new ICIPJobs(null, ICIPUtils.removeSpecialCharacter(jobId.toString()), job.getSubmittedBy(),
					job.getJobs().get(index).getName(), JobStatus.RUNNING.toString(), null, null, submittedOn,
					job.getJobs().get(index).getRuntime().toString(), job.getOrg(), LOCAL, null,
					iCIPChainJobs.getHashparams(), job.getCorelId(), null, gson.toJson(pipelineMetadata), 0, "{}",
					"{}","{}","{}","{}","");
		}

		String msg = String.format("%s%s%s%s%s%s%s", "About to run ", cmd[0], " ", cmd[1], " ",
				(cmd.length > 2 ? cmd[2] : ""), " ...");
		log.info(msg);

		Path outPath = returnPath(job.getJobType(), IAIJobConstants.OUTLOG, tmpJob);

		log.info("OutPath : {}", outPath);

		Files.createDirectories(outPath.getParent());
		Files.deleteIfExists(outPath);
		Files.createFile(outPath);

		ProcessBuilder pb = new ProcessBuilder(cmd[0], cmd[1], cmd[2]);
		pb.redirectErrorStream(true);
		pb.redirectOutput(outPath.toFile());

		Map<String, String> newEnv = addNewEnvironment(new HashMap<>()); // new environments for this job
		Map<String, String> localEnv = pb.environment();
		localEnv.putAll(newEnv);

		return new ChainProcess(pb, tmpJob);
	}

	/**
	 * The Class JobRun.
	 */
	public final class JobRun implements Callable<ChainProcess> {

		/** The cmd. */
		private final String[] cmd;
		
		/** The job. */
		private final JobObjectDTO job;
		
		/** The index. */
		private final int index;

		/**
		 * Instantiates a new job run.
		 *
		 * @param job the job
		 * @param cmd the cmd
		 * @param index the index
		 */
		JobRun(JobObjectDTO job, String[] cmd, int index) {
			this.cmd = cmd;
			this.job = job;
			this.index = index;
		}

		/**
		 *  Access a URL, and see if you get a healthy response.
		 *
		 * @return the chain process
		 * @throws Exception the exception
		 */
		@Override
		public ChainProcess call() throws Exception {
			return runJob(job, cmd, index);
		}

	}

	/**
	 * Gets the icip jobs.
	 *
	 * @return the icip jobs
	 */
	@Getter
	
	/**
	 * Sets the icip jobs.
	 *
	 * @param icipJobs the new icip jobs
	 */
	@Setter
	
	/**
	 * Instantiates a new chain process.
	 *
	 * @param processBuilder the process builder
	 * @param icipJobs the icip jobs
	 */
	@AllArgsConstructor
	public final class ChainProcess {
		
		/** The process builder. */
		private ProcessBuilder processBuilder;
		
		/** The icip jobs. */
		private ICIPJobs icipJobs;
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
			ds.put("type", "Local");
		} catch (JSONException e) {
			log.error("plugin attributes mismatch", e);
		}
		return ds;
	}

	@Override
	public String getNativeJobCommand(ICIPNativeJobDetails jobDetails) throws LeapException {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String getDragAndDropJobCommand(ICIPNativeJobDetails jobDetails) throws LeapException {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String getBinaryJobCommand(ICIPNativeJobDetails jobDetails) throws LeapException {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String getAzureJobCommand(ICIPNativeJobDetails jobDetails) throws LeapException {
		// TODO Auto-generated method stub
		return null;
	}

}
