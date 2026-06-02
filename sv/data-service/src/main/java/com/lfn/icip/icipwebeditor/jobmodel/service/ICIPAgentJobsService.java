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

package com.lfn.icip.icipwebeditor.jobmodel.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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

import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.ai.comm.lib.util.annotation.service.ConstantsService;
import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.icip.icipwebeditor.constants.IAIJobConstants;
import com.lfn.icip.icipwebeditor.constants.LoggerConstants;
import com.lfn.icip.icipwebeditor.event.model.LogFileDownloadEvent;
import com.lfn.icip.icipwebeditor.event.model.LogFileUploadEvent;
import com.lfn.icip.icipwebeditor.event.publisher.LogFileDownloadEventPublisher;
import com.lfn.icip.icipwebeditor.event.publisher.LogFileUploadEventPublisher;
import com.lfn.icip.icipwebeditor.executor.sync.service.JobSyncExecutorService;
import com.lfn.icip.icipwebeditor.fileserver.service.impl.FileServerService;
import com.lfn.icip.icipwebeditor.job.constants.JobConstants;
import com.lfn.icip.icipwebeditor.job.enums.JobStatus;
import com.lfn.icip.icipwebeditor.job.enums.RuntimeType;
import com.lfn.icip.icipwebeditor.model.ICIPAgentJobs;
import com.lfn.icip.icipwebeditor.model.ICIPPartialAgentJobs;
import com.lfn.icip.icipwebeditor.repository.ICIPAgentJobsRepository;
import com.lfn.icip.icipwebeditor.repository.ICIPPartialAgentJobsRepository;
import com.lfn.icip.icipwebeditor.service.IICIPAgentJobsService;

// TODO: Auto-generated Javadoc
/**
 * The Class ICIPAgentJobsService.
 *
 * @author essedum
 */
@Service
@Transactional
@RefreshScope
public class ICIPAgentJobsService implements IICIPAgentJobsService {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPAgentJobsService.class);

	/** The file server service. */
	@Autowired
	private FileServerService fileServerService;

	/** The log file download event publisher. */
	@Autowired
	@Qualifier("logFileDownloadEventPublisherBean")
	private LogFileDownloadEventPublisher.LogFileDownloadService logFileDownloadEventPublisher;

	/** The log file upload event publisher. */
	@Autowired
	@Qualifier("logFileUploadEventPublisherBean")
	private LogFileUploadEventPublisher.LogFileUploadService logFileUploadEventPublisher;

	/** The i CIP jobs repository. */
	private ICIPAgentJobsRepository iCIPAgentJobsRepository;

	/** The i CIP partial agent jobs repository. */
	private ICIPPartialAgentJobsRepository iCIPPartialAgentJobsRepository;

	/** The folder path. */
	@EssedumProperty("icip.jobLogFileDir")
	private String folderPath;

	/** The days string. */
	@EssedumProperty("icip.cleanup.deletion.days")
	private String daysString;
	
	@Autowired
	private ConstantsService constantService;

	/** The job sync executor service. */
	private JobSyncExecutorService jobSyncExecutorService;


	/**
	 * Instantiates a new ICIP agent jobs service.
	 *
	 * @param iCIPAgentJobsRepository the i CIP agent jobs repository
	 * @param jobSyncExecutorService  the job sync executor service
	 * @param dashConstantService the dash constant service
	 * @param iCIPPartialAgentJobsRepository the i CIP partial agent jobs repository
	 */
	public ICIPAgentJobsService(ICIPAgentJobsRepository iCIPAgentJobsRepository,
			JobSyncExecutorService jobSyncExecutorService,
			ICIPPartialAgentJobsRepository iCIPPartialAgentJobsRepository) {
		super();
		this.iCIPAgentJobsRepository = iCIPAgentJobsRepository;
		this.jobSyncExecutorService = jobSyncExecutorService;
		this.iCIPPartialAgentJobsRepository = iCIPPartialAgentJobsRepository;
	}

	/**
	 * Save.
	 *
	 * @param iCIPAgentJobs the i CIP agent jobs
	 * @return the ICIP jobs
	 */
	public ICIPAgentJobs save(ICIPAgentJobs iCIPAgentJobs) {
		logger.info("Saving job by Id {}", iCIPAgentJobs.getJobId());
		return iCIPAgentJobsRepository.save(iCIPAgentJobs);
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
		List<ICIPPartialAgentJobs> dsets = iCIPPartialAgentJobsRepository.findByOrganization(fromProjectId);
		dsets.stream().forEach(ds -> {
			Optional<ICIPAgentJobs> optionalJob = iCIPAgentJobsRepository.findById(ds.getId());
			if (optionalJob.isPresent()) {
				ICIPAgentJobs job = optionalJob.get();
				job.setOrganization(toProjectId);
				iCIPAgentJobsRepository.save(job);
			}
		});
		return true;
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
	public List<ICIPPartialAgentJobs> getJobsByService(String servicename, int page, int size, String org) {
		Pageable paginate = PageRequest.of(page, size, Sort.by("submittedOn").descending());
		return iCIPPartialAgentJobsRepository.findByCnameAndOrganization(servicename, org, paginate);
	}

	/**
	 * Find by job id.
	 *
	 * @param jobId the job id
	 * @return the ICIP jobs
	 */
	@Override
	public ICIPAgentJobs findByJobId(String jobId) {
		logger.info("Fetching job by Id {}", jobId);
		return iCIPAgentJobsRepository.findByJobId(jobId);
	}

	/**
	 * Find by job id with log.
	 *
	 * @param jobId the job id
	 * @param offset the offset
	 * @param lineno the lineno
	 * @param org the org
	 * @param status the status
	 * @return the ICIP jobs
	 * @throws IOException 
	 */
	
	@Override
	public ICIPAgentJobs findByJobIdWithLog(String jobId, int offset, int lineno, String org, String status) throws IOException {
		logger.info("Fetching ICIPAgentJobs by JobId {}", jobId);
		String constantLimit = constantService.findByKeys("icip.log.offset", org);
		long limit;
		if (!constantLimit.trim().isEmpty()) {
			limit = Long.parseLong(constantLimit);
		} else {
			limit = 50;
		}
		String log = "";
		ICIPPartialAgentJobs job = iCIPPartialAgentJobsRepository.findByJobId(jobId);
		String originalHashParams = job.getHashparams();
		try {
			Path path = Paths.get(folderPath, String.format(LoggerConstants.STRING_DECIMAL_STRING,
					IAIJobConstants.AGENTLOGPATH, job.getId(), IAIJobConstants.OUTLOG));
			if (Files.exists(path)) {
				// Here, hashparams is used as placeholder for first line of log
				// organization is used as placeholder for last line of log
				// jobmetadata is used as placeholder for [already] read line count
				ICIPUtils.BufferResult bufferResult = ICIPUtils.bufferedReadFileAsStringBuilder(path, lineno, limit);
				job.setHashparams(bufferResult.getFirstLine());
				log = bufferResult.getStringBuilder().toString();
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
		} catch (IOException ex) {
			logger.error("File Not Exists : {}", ex.getMessage());
		}
		ICIPAgentJobs result = job.toICIPAgentJobs(log);
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
	public List<ICIPPartialAgentJobs> getAllJobs(String org, int page, int size) {
		logger.info("Getting jobs in Page {}", page);
		Pageable paginate = PageRequest.of(page, size, Sort.by("submittedOn").descending());
		Page<ICIPPartialAgentJobs> jobs = iCIPPartialAgentJobsRepository.findByOrganization(org, paginate);
		return jobs != null ? jobs.toList() : new ArrayList<>();
	}

	/**
	 * Count by streaming service and organization.
	 *
	 * @param cname the cname
	 * @param org   the org
	 * @return the long
	 */
	@Override
	public Long countByCnameAndOrganization(String cname, String org) {
		return iCIPAgentJobsRepository.countByCnameAndOrganization(cname, org);
	}

	/**
	 * Count by organization.
	 *
	 * @param org the org
	 * @return the long
	 */
	@Override
	public Long countByOrganization(String org) {
		return iCIPAgentJobsRepository.countByOrganization(org);
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
		List<ICIPPartialAgentJobs> icGrps = iCIPPartialAgentJobsRepository.findByOrganization(fromProjectId);
		List<ICIPAgentJobs> toGrps = icGrps.parallelStream().map(grp -> {
			Optional<ICIPAgentJobs> optionalJob = iCIPAgentJobsRepository.findById(grp.getId());
			if (optionalJob.isPresent()) {
				ICIPAgentJobs job = optionalJob.get();
				job.setId(null);
				job.setOrganization(toProjectId);
				return job;
			}
			return null;
		}).collect(Collectors.toList());
		toGrps.stream().forEach(grp -> iCIPAgentJobsRepository.save(grp));
		return true;
	}

	/**
	 * Find by job name and organization by submission.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP agent jobs
	 */
	@Override
	public ICIPAgentJobs findByJobNameAndOrganizationBySubmission(String name, String org) {
		return iCIPAgentJobsRepository.findByJobNameAndOrganizationBySubmission(name, org);
	}

	/**
	 * Find by job name and organization by last submission.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP agent jobs
	 */
	@Override
	public ICIPAgentJobs findByJobNameAndOrganizationByLastSubmission(String name, String org) {
		return iCIPAgentJobsRepository.findByJobNameAndOrganizationByLastSubmission(name, org);
	}

	/**
	 * Change job property.
	 *
	 * @param job the job
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	@Override
	public void changeJobProperty(ICIPAgentJobs job) throws IOException {
		StringBuilder strBuilder = new StringBuilder(IAIJobConstants.STRING_BUILDER_CAPACITY);
		Path logOutPath = returnPath(job.getId(), IAIJobConstants.OUTLOG);
		if (Files.exists(logOutPath)) {
			List<String> output = ICIPUtils.readFileFromLastLines(logOutPath, IAIJobConstants.READ_LINE_COUNT);
			output.forEach(line -> {
				strBuilder.append(line);
				strBuilder.append(System.getProperty(IAIJobConstants.LINE_SEPARATOR));
			});
			String status = jobSyncExecutorService.getStatus(RuntimeType.valueOf(job.getType().toUpperCase()),
					strBuilder, job.getSubmittedBy(), job.getCname(), job.getOrganization(),logOutPath);
			job.setJobStatus(status);
			logFileUploadEventPublisher.getApplicationEventPublisher().publishEvent(new LogFileUploadEvent(this,
					logOutPath.toAbsolutePath().toString(), job.getJobId(), job.getOrganization()));
		} else {
			job.setJobStatus(JobStatus.ERROR.toString());
			job.setLog("Configuration Error : Log File Not Found [Path : " + logOutPath.toAbsolutePath().toString() + "]");
		}
		job.setFinishtime(new Timestamp(new Date().getTime()));
		iCIPAgentJobsRepository.save(job);
	}

	/**
	 * Return path.
	 *
	 * @param jobId the job id
	 * @param logpath the logpath
	 * @return the path
	 */
	private Path returnPath(Integer jobId, String logpath) {
		return Paths.get(folderPath,
				String.format(LoggerConstants.STRING_DECIMAL_STRING, IAIJobConstants.AGENTLOGPATH, jobId, logpath));
	}

	/**
	 * Find by corelid.
	 *
	 * @param corelid the corelid
	 * @return the ICIP agent jobs
	 */
	@Override
	public List<ICIPPartialAgentJobs> findByCorelid(String corelid) {
		return iCIPPartialAgentJobsRepository.findByCorrelationid(corelid);
	}

	/**
	 * Find by hashparams.
	 *
	 * @param hashparams the hashparams
	 * @return the ICIP agent jobs
	 */
	@Override
	public ICIPAgentJobs findByHashparams(String hashparams) {
		return iCIPAgentJobsRepository.findByHashparams(hashparams);
	}

	/**
	 * Stop local job.
	 *
	 * @param jobid the jobid
	 * @throws EssedumException the essedum exception
	 */
	@Override
	public void stopLocalJob(String jobid) throws EssedumException {
		jobSyncExecutorService.stopLocalJob(jobid);
	}

	/**
	 * Boot cleanup.
	 */
	@Override
	public void bootCleanup() {
		List<ICIPPartialAgentJobs> list = iCIPPartialAgentJobsRepository.findByJobStatus(JobStatus.RUNNING.toString());
		list.parallelStream().forEach(job -> {
			Optional<ICIPAgentJobs> optionalJob = iCIPAgentJobsRepository.findById(job.getId());
			if (optionalJob.isPresent()) {
				ICIPAgentJobs icipjob = optionalJob.get();
				icipjob = icipjob.updateJob(JobStatus.CANCELLED.toString(),
						System.getProperty(IAIJobConstants.LINE_SEPARATOR) + "Application restarted...");
				iCIPAgentJobsRepository.save(icipjob);
			}
		});
	}

	/**
	 * Delete older data.
	 *
	 * @throws EssedumException the essedum exception
	 */
	@Override
	@Transactional
	public void deleteOlderData() throws EssedumException {
		try {
			int days = Integer.parseInt(daysString);
			logger.info("Deleting data older than {} day(s)", days);
			iCIPAgentJobsRepository.deleteOlderData(days);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			throw new EssedumException(ex.getMessage());
		}
	}

}