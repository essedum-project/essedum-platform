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

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Timestamp;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;
import com.infosys.icets.ai.comm.lib.util.annotation.service.ConstantsService;
import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.icip.icipwebeditor.event.model.LogFileDownloadEvent;
import com.infosys.icets.icip.icipwebeditor.event.model.LogFileUploadEvent;
import com.infosys.icets.icip.icipwebeditor.event.publisher.LogFileDownloadEventPublisher;
import com.infosys.icets.icip.icipwebeditor.event.publisher.LogFileUploadEventPublisher;
import com.infosys.icets.icip.icipwebeditor.factory.IICIPInternalJobUtilFactory;
import com.infosys.icets.icip.icipwebeditor.fileserver.service.impl.FileServerService;
import com.infosys.icets.icip.icipwebeditor.job.constants.JobConstants;
import com.infosys.icets.icip.icipwebeditor.job.enums.JobStatus;
import com.infosys.icets.icip.icipwebeditor.job.model.ICIPInternalJobs;
import com.infosys.icets.icip.icipwebeditor.job.model.ICIPPartialInternalJobs;
import com.infosys.icets.icip.icipwebeditor.job.repository.ICIPInternalJobsRepository;
import com.infosys.icets.icip.icipwebeditor.job.repository.ICIPPartialInternalJobsRepository;
import com.infosys.icets.icip.icipwebeditor.job.service.IICIPInternalJobsService;
import com.infosys.icets.icip.icipwebeditor.job.util.InternalJob;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPInternalJobsService.
 *
 * @author icets
 */
@Service
@Transactional
@RefreshScope
public class ICIPInternalJobsService implements IICIPInternalJobsService {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPInternalJobsService.class);

	/** The Constant INTERNALJOBLOG. */
	private static final String INTERNALJOBLOG = "_internal_job.log";

	/** The i CIP internal jobs repository. */
	@Autowired
	private ICIPInternalJobsRepository iCIPInternalJobsRepository;

	/** The i CIP partial internal jobs repository. */
	@Autowired
	private ICIPPartialInternalJobsRepository iCIPPartialInternalJobsRepository;


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

	/** The logging path. */
	@Value("${LOG_PATH}")
	private String loggingPath;
	
	@Autowired
	private ConstantsService constantService;

	/** The days string. */
	@LeapProperty("icip.cleanup.deletion.days")
	private String daysString;
	
	@Autowired
	IICIPInternalJobUtilFactory internalJobFactory;

	/**
	 * Save.
	 *
	 * @param iCIPInternalJobs the i CIP internal jobs
	 * @return the ICIP internal jobs
	 */
	@Override
	public ICIPInternalJobs save(ICIPInternalJobs iCIPInternalJobs) {
		logger.info("Saving job by Id {}", iCIPInternalJobs.getJobId());
		return iCIPInternalJobsRepository.save(iCIPInternalJobs);
	}

	/**
	 * Find by job id with log.
	 *
	 * @param jobId the job id
	 * @param offset the offset
	 * @param lineno the lineno
	 * @param org the org
	 * @param status the status
	 * @return the ICIP internal jobs
	 * @throws IOException 
	 */
	@Override
	public ICIPInternalJobs findByJobIdWithLog(String jobId, int offset, int lineno, String org, String status) throws IOException {
		logger.info("Fetching ICIPInternalJobs by JobId {}", jobId);
		String constantLimit = constantService.findByKeys("icip.log.offset", org);
		long limit;
		if (!constantLimit.trim().isEmpty()) {
			limit = Long.parseLong(constantLimit);
		} else {
			limit = 5000;
		}
		String log = "";
		ICIPPartialInternalJobs job = iCIPPartialInternalJobsRepository.findByJobId(jobId);
		String originalHashParams = job.getHashparams();
		try {
			Path path = Paths.get(loggingPath, job.getId() + INTERNALJOBLOG);
			if (Files.exists(path)) {
				// Here, hashparams is used as placeholder for first line of log
				// organization is used as placeholder for last line of log
				// jobmetadata is used as placeholder for [already] read line count
				ICIPUtils.BufferResult bufferResult = ICIPUtils.bufferedReadFileAsStringBuilder(path, lineno, limit);
				log = bufferResult.getStringBuilder().toString();
				job.setJobmetadata(String.valueOf(bufferResult.getLine()));
				job.setHashparams(bufferResult.getFirstLine());
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
		ICIPInternalJobs result = job.toICIPInternalJobs(log);
		
		if (result.getHashparams()!=null && (result.getHashparams().equals(originalHashParams))) {
			result.setHashparams("");
		}
		return result;
	}

	/**
	 * Find by job id.
	 *
	 * @param jobId the job id
	 * @return the ICIP internal jobs
	 */
	@Override
	public ICIPInternalJobs findByJobId(String jobId) {
		logger.info("Fetching ICIPInternalJobs by JobId {}", jobId);
		return iCIPInternalJobsRepository.findByJobId(jobId);
	}

	/**
	 * Stop running jobs.
	 */
	@Override
	public void stopRunningJobs() {
		List<ICIPPartialInternalJobs> jobs = iCIPPartialInternalJobsRepository
				.findByJobStatus(JobStatus.RUNNING.toString());
		jobs.parallelStream().forEach(job -> {
			Optional<ICIPInternalJobs> optional = iCIPInternalJobsRepository.findById(job.getId());
			if (optional.isPresent()) {
				ICIPInternalJobs icipjob = optional.get();
				icipjob = icipjob.updateJob(JobStatus.ERROR.toString(), "Error : Server was down");
				iCIPInternalJobsRepository.save(icipjob);
			}
		});
	}
	
	@Override
	public void stopRunningJob(String jobid) {
		ICIPPartialInternalJobs job = iCIPPartialInternalJobsRepository
				.findByJobId(jobid);
		Optional<ICIPInternalJobs> optional = iCIPInternalJobsRepository.findById(job.getId());
		if (optional.isPresent()) {
			ICIPInternalJobs icipjob = optional.get();
			icipjob = icipjob.updateJob(JobStatus.CANCELLED.toString(), "Internal job stopped");
			iCIPInternalJobsRepository.save(icipjob);
		}
	}

	/**
	 * Count by dataset and organization.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the long
	 */
	@Override
	public Long countByDatasetAndOrganization(String name, String org) {
		return iCIPInternalJobsRepository.countByDatasetAndOrganization(name, org);
	}

	/**
	 * Count by job name and organization.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the long
	 */
	@Override
	public Long countByJobNameAndOrganization(String name, String org) {
		return iCIPInternalJobsRepository.countByJobNameAndOrganization(name, org);
	}

	/**
	 * Boot cleanup.
	 */
	@Override
	public void bootCleanup() {
		List<ICIPPartialInternalJobs> list = iCIPPartialInternalJobsRepository
				.findByJobStatus(JobStatus.RUNNING.toString());
		list.parallelStream().forEach(job -> {
			Optional<ICIPInternalJobs> optional = iCIPInternalJobsRepository.findById(job.getId());
			if (optional.isPresent()) {
				ICIPInternalJobs icipjob = optional.get();
				icipjob = icipjob.updateJob(JobStatus.CANCELLED.toString(),
						System.getProperty(JobConstants.LINE_SEPARATOR) + "Application restarted...");
				iCIPInternalJobsRepository.save(icipjob);
			}
		});
	}

	/**
	 * Update internal job.
	 *
	 * @param internalJob the internal job
	 * @param status      the status
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	@Override
	public void updateInternalJob(ICIPInternalJobs internalJob, String status) throws IOException {
		if (internalJob != null) {
			Path path = Paths.get(loggingPath, internalJob.getId() + INTERNALJOBLOG);
			internalJob.setFinishtime(new Timestamp(new Date().getTime()));
			internalJob.setJobStatus(status);
			internalJob = save(internalJob);
			logFileUploadEventPublisher.getApplicationEventPublisher().publishEvent(new LogFileUploadEvent(this,
					path.toAbsolutePath().toString(), internalJob.getJobId(), internalJob.getOrganization()));
		}
	}

	/**
	 * Creates the internal jobs.
	 *
	 * @param jobName     the job name
	 * @param uid         the uid
	 * @param submittedBy the submitted by
	 * @param submittedOn the submitted on
	 * @param org         the org
	 * @return the ICIP internal jobs
	 */
	@Override
	public ICIPInternalJobs createInternalJobs(String jobName, String uid, String submittedBy, Timestamp submittedOn,
			String org) {
		ICIPInternalJobs internalJob = new ICIPInternalJobs();
		internalJob.setJobId(uid);
		internalJob.setJobStatus(JobStatus.RUNNING.toString());
		internalJob.setSubmittedBy(submittedBy);
		internalJob.setSubmittedOn(submittedOn);
		internalJob.setJobName(jobName);
		internalJob.setOrganization(org);
		internalJob = save(internalJob);
		try {
			Path path = Paths.get(loggingPath, internalJob.getId() + INTERNALJOBLOG);
			Files.deleteIfExists(path);
		} catch (IOException e) {
			logger.error(e.getMessage(), e);
		}
		return internalJob;
	}

	/**
	 * Count by dataset and job name and organization.
	 *
	 * @param name the name
	 * @param jobName the job name
	 * @param org the org
	 * @return the long
	 */
	@Override
	public Long countByDatasetAndJobNameAndOrganization(String name, String jobName, String org) {
		return iCIPInternalJobsRepository.countByDatasetAndJobNameAndOrganization(name, jobName, org);
	}

	/**
	 * Find by dataset name.
	 *
	 * @param name the name
	 * @param org the org
	 * @param page the page
	 * @param size the size
	 * @return the list
	 */
	@Override
	public List<ICIPPartialInternalJobs> findByDatasetName(String name, String org, Integer page, Integer size) {
		logger.info("Fetching ICIPPartialInternalJobs by datasetname {}", name);
		Pageable paginate = PageRequest.of(page, size, Sort.by("submittedOn").descending());
		return iCIPPartialInternalJobsRepository.findByDatasetAndOrganization(name, org, paginate);
	}

	/**
	 * Find by dataset name and job name.
	 *
	 * @param name the name
	 * @param jobName the job name
	 * @param org the org
	 * @param page the page
	 * @param size the size
	 * @return the list
	 */
	@Override
	public List<ICIPPartialInternalJobs> findByDatasetNameAndJobName(String name, String jobName, String org,
			Integer page, Integer size) {
		Pageable paginate = PageRequest.of(page, size, Sort.by("submittedOn").descending());
		return iCIPPartialInternalJobsRepository.findByDatasetAndJobNameAndOrganization(name, jobName, org, paginate);
	}

	/**
	 * Find by job name.
	 *
	 * @param name the name
	 * @param org the org
	 * @param page the page
	 * @param size the size
	 * @return the list
	 */
	@Override
	public List<ICIPPartialInternalJobs> findByJobName(String name, String org, Integer page, Integer size) {
		logger.info("Fetching ICIPInternalJobs by datasetname {}", name);
		Pageable paginate = PageRequest.of(page, size, Sort.by("submittedOn").descending());
		return iCIPPartialInternalJobsRepository.findByJobNameAndOrganization(name, org, paginate);
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
			iCIPInternalJobsRepository.deleteOlderData(days);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			throw new LeapException(ex.getMessage());
		}
	}

	@Override
	public InternalJob getInternalJobService(String jobName) {
		jobName=jobName+"internaljob";
		return internalJobFactory.getInternalJobServiceUtil(jobName);
	   
		
	}

}
