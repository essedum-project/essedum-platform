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

package com.lfn.icip.icipwebeditor.job.service.util;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.NoSuchAlgorithmException;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Base64;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.icip.icipwebeditor.constants.IAIJobConstants;
import com.lfn.icip.icipwebeditor.constants.LoggerConstants;
import com.lfn.icip.icipwebeditor.executor.sync.service.JobSyncExecutorService;
import com.lfn.icip.icipwebeditor.job.enums.JobMetadata;
import com.lfn.icip.icipwebeditor.job.enums.JobStatus;
import com.lfn.icip.icipwebeditor.job.enums.JobType;
import com.lfn.icip.icipwebeditor.job.enums.RuntimeType;
import com.lfn.icip.icipwebeditor.job.model.ICIPChainJobs;
import com.lfn.icip.icipwebeditor.job.model.TriggerValues;
import com.lfn.icip.icipwebeditor.job.model.ICIPInternalJobs.MetaData;
import com.lfn.icip.icipwebeditor.job.model.dto.JobObjectDTO;
import com.lfn.icip.icipwebeditor.job.service.util.ICIPCommonJobServiceUtil.ChainProcess;
import com.lfn.icip.icipwebeditor.jobmodel.service.ICIPAgentJobsService;
import com.lfn.icip.icipwebeditor.jobmodel.service.ICIPChainJobsService;
import com.lfn.icip.icipwebeditor.jobmodel.service.ICIPJobsService;
import com.lfn.icip.icipwebeditor.model.ICIPAgentJobs;
import com.lfn.icip.icipwebeditor.model.ICIPJobs;
import com.lfn.icip.icipwebeditor.model.ICIPPipelinePID;
import com.lfn.icip.icipwebeditor.model.dto.ICIPNativeJobDetails;
import com.lfn.icip.icipwebeditor.service.impl.ICIPPipelinePIDService;
import com.lfn.icip.icipwebeditor.service.impl.ICIPPipelineService;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

// TODO: Auto-generated Javadoc
//

/**
 * The Class ICIPCommonJobServiceUtil.
 *
 * @author essedum
 */

/** The Constant log. */
@Log4j2
public abstract class ICIPCommonJobServiceUtil {

	/** The Constant PLACEHOLDER. */
	public static final String PLACEHOLDER = "#";

	/** The Constant NOTREQUIRED. */
	public static final String NOTREQUIRED = "@";

	/** The gson. */
	protected Gson gson;

	/** The job sync executor service. */
	@Autowired
	private JobSyncExecutorService jobSyncExecutorService;

	@Autowired
	private ICIPJobsService jobsService;

	/** The chain jobs service. */
	@Autowired
	private ICIPChainJobsService chainJobsService;

	/** The agent jobs service. */
	@Autowired
	private ICIPAgentJobsService agentJobsService;

	/** The pid service. */
	@Autowired
	private ICIPPipelinePIDService pidService;

	/** The i CIP jobs. */
	protected ICIPJobs iCIPJobs;

	/** The i CIP chain jobs. */
	protected ICIPChainJobs iCIPChainJobs;

	/** The i CIP agent jobs. */
	private ICIPAgentJobs iCIPAgentJobs;

	@Autowired
	private ICIPPipelineService pipelineService;

	/** The Constant INVALID_JOBTYPE. */
	private static final String INVALID_JOBTYPE = "Invalid JobType";

	/** The spark home. */
	private String sparkHome;

	/** The python 2 path. */
	private String python2Path;

	/** The python 3 path. */
	private String python3Path;

	/** The annotation service util. */
	@Autowired
	private ICIPInitializeAnnotationServiceUtil annotationServiceUtil;

	/** The Constant SPARKHOME_STR. */
	private static final String SPARKHOME_STR = "SPARK_HOME";

	/** The Constant PYTHON2PATH_STR. */
	private static final String PYTHON2PATH_STR = "PYTHON2PATH";

	/** The Constant PYTHON3PATH_STR. */
	private static final String PYTHON3PATH_STR = "PYTHON3PATH";

	/** The Constant NOT_REQUIRED. */
	private static final String NOT_REQUIRED = "Not required";

	/** The Constant SERVER_CANCELLED. */
	// log messages
	private static final String SERVER_CANCELLED = "Chain cannot proceed as some error occurred";

	/** The Constant USER_CANCELLED. */
	private static final String USER_CANCELLED = "User cancelled the job";

	/**
	 * 
	 * Instantiates a new ICIP common job service util.
	 */
	public ICIPCommonJobServiceUtil() {
		this.gson = new GsonBuilder().disableHtmlEscaping().create();
	}

	/**
	 * Write temp file.
	 *
	 * @param script   the script
	 * @param tempFile the temp file
	 * @throws EssedumException the essedum exception
	 */
	protected void writeTempFile(StringBuilder script, Path tempFile) throws EssedumException {
		log.debug("Temporary File Path : {}", tempFile.toAbsolutePath());
		try (BufferedWriter bw = new BufferedWriter(new FileWriter(tempFile.toAbsolutePath().toString()))) {
			log.info("writing temp file");
			final int aLength = script.length();
			final int aChunk = 1024;
			final char[] aChars = new char[aChunk];
			for (int aPosStart = 0; aPosStart < aLength; aPosStart += aChunk) {
				final int aPosEnd = Math.min(aPosStart + aChunk, aLength);
				script.getChars(aPosStart, aPosEnd, aChars, 0);
				bw.write(aChars, 0, aPosEnd - aPosStart);
			}
			bw.flush();
		} catch (IOException ex) {
			String msg = "Error in creating temp file : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);
			throw new EssedumException(msg, ex);
		}
	}

	/**
	 * Gets the loggers value.
	 *
	 * @return the loggers value
	 */
	protected Map<String, Object> getLoggersValue() {
		Map<String, Object> console = new HashMap<>();
		Map<String, Object> config = new HashMap<>();
		Map<String, Object> level = new HashMap<>();
		level.put("log_level", IAIJobConstants.LOG_LEVEL);
		config.put("config", level);
		console.put("console", config);
		return console;
	}

	/**
	 * Gets the trigger map.
	 *
	 * @param triggerValues the trigger values
	 * @return the trigger map
	 */
	private Map<String, String> getTriggerMap(TriggerValues triggerValues) {
		Map<String, String> map = new HashMap<>();
		map.put("Last_Execution_Time", format(triggerValues.getPrevFireTime()));
		map.put("Current_Execution_Time", format(triggerValues.getCurrentFireTime()));
		map.put("Next_Execution_Time", format(triggerValues.getNextFireTime()));
		map.put("Last_Successful_Execution_Time", format(triggerValues.getSuccessfulTimestamp()));
		return map;
	}

	/**
	 * Adds the trigger time.
	 *
	 * @param params        the params
	 * @param triggerValues the trigger values
	 */
	public void addTriggerTime(JsonObject params, TriggerValues triggerValues) {
		Map<String, String> map = getTriggerMap(triggerValues);
		map.forEach((k, v) -> params.addProperty(k, v));
	}

	/**
	 * Adds the trigger time.
	 *
	 * @param arguments     the arguments
	 * @param triggerValues the trigger values
	 * @return the string builder
	 */
	public void addTriggerTime(Map<String, String> arguments, TriggerValues triggerValues) {
		Map<String, String> map = getTriggerMap(triggerValues);
		map.forEach((k, v) -> arguments.put(String.format("\"%s\"", k), String.format("\"%s\"", v)));
	}

	/**
	 * Resolve command.
	 *
	 * @param cmd    the cmd
	 * @param values the values
	 * @return the string
	 */
	public String resolveCommand(String cmd, String[] values) {
		for (String value : values) {
			value = value.replace("\\", "\\\\");
			value = value.replace("$", "\\$");
			if (cmd.indexOf(NOTREQUIRED) >= 0) {
				if (cmd.indexOf(PLACEHOLDER) < cmd.indexOf(NOTREQUIRED)) {
					cmd = cmd.replaceFirst(PLACEHOLDER, value);
				} else {
					cmd = cmd.replaceFirst(NOTREQUIRED, "");
				}
			} else {
				cmd = cmd.replaceFirst(PLACEHOLDER, value);
			}
		}
		return cmd;
	}

	/**
	 * Format.
	 *
	 * @param date the date
	 * @return the string
	 */
	private String format(Date date) {
		if (date != null) {
			SimpleDateFormat formatter = new SimpleDateFormat("EEE, d MMM yyyy HH:mm:ss");
			return formatter.format(date);
		}
		return "-1";
	}

	/**
	 * Gets the ICIP jobs.
	 *
	 * @param chainprocesses the chainprocesses
	 * @return the ICIP jobs
	 */
	protected List<ICIPJobs> getICIPJobs(List<ChainProcess> chainprocesses) {
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
	protected List<ProcessBuilder> getProcessBuilders(List<ChainProcess> chainprocesses) {
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
	protected List<Process> getProcesses(List<ProcessBuilder> pbs) {
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
	public String getPids(List<Process> processes) {
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
	 * @throws EssedumException the essedum exception
	 */
	protected void initializeRunning(JobType jobtype) throws EssedumException {
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
			throw new EssedumException(INVALID_JOBTYPE);
		}
	}

	/**
	 * Adds the entry in jobs table.
	 *
	 * @param job            the job
	 * @param attributesHash the attributes hash
	 * @param submittedOn    the submitted on
	 * @param jobId          the job id
	 * @throws EssedumException the essedum exception
	 */
	protected void addEntryInJobsTable(JobObjectDTO job, String attributesHash, Timestamp submittedOn,
			StringBuilder jobId) throws EssedumException {
		Gson gson = new Gson();
		Integer version = null;
		if (pipelineService.getVersion(job.getName(), job.getOrg()) != null)
			version = pipelineService.getVersion(job.getName(), job.getOrg());
		JobMetadata jobMetadata = returnJobMetadata(job);
		switch (job.getJobType()) {
		case CHAIN:
			MetaData chainMetadata = new MetaData();
			chainMetadata.setTag(jobMetadata.toString());
			iCIPChainJobs = new ICIPChainJobs(null, ICIPUtils.removeSpecialCharacter(jobId.toString()), job.getName(),
					job.getOrg(), job.getSubmittedBy(), JobStatus.STARTED.toString(), submittedOn, null, attributesHash,
					job.getCorelId(), null, gson.toJson(chainMetadata), 0);
			break;
		case AGENT:
			MetaData agentMetadata = new MetaData();
			agentMetadata.setTag(jobMetadata.toString());
			iCIPAgentJobs = new ICIPAgentJobs(null, ICIPUtils.removeSpecialCharacter(jobId.toString()),
					job.getSubmittedBy(), job.getName(), JobStatus.STARTED.toString(), version, null, submittedOn,
					job.getJobs().get(0).getRuntime().toString(), job.getOrg(), job.getName(), null, attributesHash,
					job.getCorelId(), null, gson.toJson(agentMetadata), 0);
			break;
		case PIPELINE:
			MetaData pipelineMetadata = new MetaData();
			pipelineMetadata.setTag(jobMetadata.toString());
			iCIPJobs = new ICIPJobs(null, ICIPUtils.removeSpecialCharacter(jobId.toString()), job.getSubmittedBy(),
					job.getName(), JobStatus.STARTED.toString(), version, null, submittedOn,
					job.getJobs().get(0).getRuntime().toString(), job.getOrg(), job.getName(), null, attributesHash,
					job.getCorelId(), null, gson.toJson(pipelineMetadata), 0, "{}", "{}", "{}", "{}", "{}", "");
			break;
		default:
			throw new EssedumException(INVALID_JOBTYPE);
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
	 * Initialize job.
	 *
	 * @param job the job
	 * @throws EssedumException the essedum exception
	 */
	public void initializeJob(JobObjectDTO job) throws EssedumException {
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
			throw new EssedumException(INVALID_JOBTYPE);
		}
	}

	/**
	 * Gets the complete command.
	 *
	 * @param job              the job
	 * @param cmds             the cmds
	 * @param nativeJobDetails the native job details
	 * @return the complete command
	 */
	public List<String[]> getCompleteCommand(JobObjectDTO job, List<String> cmds,
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
	 * @param job              the job
	 * @param cmds             the cmds
	 * @param nativeJobDetails the native job details
	 * @param index            the index
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
				if (!nativeJobDetails.get(0).getParams().equals("generated") && !job.isEvent()) {
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
				if (!nativeJobDetails.get(0).getParams().equals("generated") && !job.isEvent()) {
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
	 * @param icipJobs       the icip jobs
	 */
	@AllArgsConstructor
	public final class ChainProcess {

		/** The process builder. */
		private ProcessBuilder processBuilder;

		/** The icip jobs. */
		private ICIPJobs icipJobs;
	}

	/**
	 * Run all.
	 *
	 * @param job  the job
	 * @param cmds the cmds
	 * @return the list
	 * @throws InterruptedException the interrupted exception
	 * @throws ExecutionException   the execution exception
	 */
	protected List<ChainProcess> runAll(JobObjectDTO job, List<String[]> cmds)
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

	protected List<ICIPNativeJobDetails> createNativeJobDetails(JobObjectDTO job, TriggerValues triggerValues)
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

	protected Timestamp[] getTimestamps(JobObjectDTO job) throws EssedumException {
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
			throw new EssedumException(INVALID_JOBTYPE);
		}
		return timestamps;
	}

	/**
	 * Return path.
	 *
	 * @param jobtype the jobtype
	 * @param logpath the logpath
	 * @param tmpJob  the tmp job
	 * @return the path
	 * @throws EssedumException the essedum exception
	 */
	protected Path returnPath(JobType jobtype, String logpath, ICIPJobs tmpJob) throws EssedumException {
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
			throw new EssedumException(INVALID_JOBTYPE);
		}
	}

	/**
	 * Check N sites, but sequentially, not in parallel. Does not use multiple
	 * threads at all.
	 *
	 * @param job  the job
	 * @param cmds the cmds
	 * @return the list
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 * @throws IOException              Signals that an I/O exception has occurred.
	 * @throws EssedumException            the essedum exception
	 */
	protected List<ChainProcess> runSequentially(JobObjectDTO job, List<String[]> cmds)
			throws NoSuchAlgorithmException, IOException, EssedumException {
		List<ChainProcess> pbs = new LinkedList<>();
		for (int index = 0, limit = cmds.size(); index < limit; index++) {
//			pbs.add(runJob(job, cmds.get(index), index));
			ChainProcess process = runJob(job, cmds.get(index), index);

			pbs.add(process);
		}
		return pbs;
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
		 * @param job   the job
		 * @param cmd   the cmd
		 * @param index the index
		 */
		JobRun(JobObjectDTO job, String[] cmd, int index) {
			this.cmd = cmd;
			this.job = job;
			this.index = index;
		}

		/**
		 * Access a URL, and see if you get a healthy response.
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
	 * Run job.
	 *
	 * @param job   the job
	 * @param cmd   the cmd
	 * @param index the index
	 * @return the chain process
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 * @throws IOException              Signals that an I/O exception has occurred.
	 * @throws EssedumException            the essedum exception
	 */
	public ChainProcess runJob(JobObjectDTO job, String[] cmd, int index)
			throws NoSuchAlgorithmException, IOException, EssedumException {

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
					job.getJobs().get(index).getRuntime().toString(), job.getOrg(), job.getName(), null,
					iCIPChainJobs.getHashparams(), job.getCorelId(), null, gson.toJson(pipelineMetadata), 0, "{}", "{}",
					"{}", "{}", "{}", "");
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
	 * Adds the new environment.
	 *
	 * @param map the map
	 * @return the map
	 */
	protected Map<String, String> addNewEnvironment(Map<String, String> map) {
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
	 * Run native command.
	 *
	 * @param job              the job
	 * @param cmds             the cmds
	 * @param nativeJobDetails the native job details
	 * @param jobId            the job id
	 * @return the integer
	 * @throws IOException              Signals that an I/O exception has occurred.
	 * @throws EssedumException            the essedum exception
	 * @throws InterruptedException     the interrupted exception
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 * @throws ExecutionException       the execution exception
	 */
	protected Integer runNativeCommand(JobObjectDTO job, List<String> cmds, List<ICIPNativeJobDetails> nativeJobDetails,
			String jobId)
			throws IOException, EssedumException, InterruptedException, NoSuchAlgorithmException, ExecutionException {

		initializeJob(job);

		List<String[]> cmdlist = getCompleteCommand(job, cmds, nativeJobDetails);

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
				if (job.getJobType() != null && job.getJobType().equals(JobType.CHAIN)) {
					Timestamp submittedOn = new Timestamp(new Date().getTime());
					tmpjob = pbs.get(index).getIcipJobs();
					tmpjob.setSubmittedOn(submittedOn);
					tmpjob = jobsService.save(tmpjob);
				}
				if (index > 0 && !jobsService.findByJobId(pbs.get(index - 1).getIcipJobs().getJobId()).getJobStatus()
						.equals(JobStatus.COMPLETED.toString())) {
					if (job.getJobType() != null && job.getJobType().equals(JobType.CHAIN) && tmpjob != null) {
						if (JobStatus.CANCELLED != null)
							tmpjob.setJobStatus(JobStatus.CANCELLED.toString());
						tmpjob.setLog(SERVER_CANCELLED);
						tmpjob.setFinishtime(new Timestamp(new Date().getTime()));
						jobsService.save(tmpjob);
					}
				} else {
					if (index > 0 && pbs.get(index - 1).getIcipJobs() != null) {
						final int i = index;
						JSONObject newoutput = new JSONObject(pbs.get(index - 1).getIcipJobs().getOutput());
						String[] splitarr = pbs.get(i).getProcessBuilder().command().get(2).split(" ");
						newoutput.keySet().forEach(key -> {
							for (int ind = 0; ind < splitarr.length; ind++) {
								if (splitarr[ind].contains(key)) {
									splitarr[ind] = "\"" + key + "\":\"" + newoutput.get(key).toString() + "\"";
								}
							}
							pbs.get(i).getProcessBuilder().command().set(2, String.join(" ", splitarr));
						});
					}
					ICIPPipelinePID pipelinePID = pidService
							.findByInstanceidAndJobid(annotationServiceUtil.getInstanceId(), jobId);
					if (pipelinePID == null || pipelinePID.getStatus() != -1) {
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
							throw new EssedumException(INVALID_JOBTYPE);
						}
					} else {
						if (job.getJobType() != null && job.getJobType().equals(JobType.CHAIN) && tmpjob != null) {
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
				throw new EssedumException(INVALID_JOBTYPE);
			}
			return result;
		}

	}

//	public String getAzureJobCommand(ICIPNativeJobDetails jobDetails) throws EssedumException {
//		// TODO Auto-generated method stub
//		return null;
//	}

}
