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

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.json.JSONObject;
import org.python.modules.itertools.chain;
import org.quartz.SchedulerException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.ApplicationContext;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.Gson;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;
import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.icip.icipwebeditor.constants.IAIJobConstants;
import com.infosys.icets.icip.icipwebeditor.executor.sync.service.JobSyncExecutorService;
import com.infosys.icets.icip.icipwebeditor.job.ICIPNativeServiceJob;
import com.infosys.icets.icip.icipwebeditor.job.enums.JobStatus;
import com.infosys.icets.icip.icipwebeditor.job.model.ChainObject;
import com.infosys.icets.icip.icipwebeditor.job.model.ChainObject.ChainJobElement2;
import com.infosys.icets.icip.icipwebeditor.job.model.ChainObject.ChainJobElement2.ChainJob2;
import com.infosys.icets.icip.icipwebeditor.job.model.ICIPChainJobs;
import com.infosys.icets.icip.icipwebeditor.job.model.ICIPChainJobsPartial;
import com.infosys.icets.icip.icipwebeditor.job.model.ICIPChains;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPChainJobsPartialRepository;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPChainJobsRepository;
import com.infosys.icets.icip.icipwebeditor.service.IICIPChainJobsService;
import com.infosys.icets.icip.icipwebeditor.service.IICIPChainsService;
import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPJobRuntimePluginsService;
import com.infosys.icets.icip.icipwebeditor.service.impl.JobScheduleServiceImpl;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPChainJobsService.
 *
 * @author icets
 */
@Service
@Transactional
@RefreshScope
public class ICIPChainJobsService implements IICIPChainJobsService {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPChainJobsService.class);

	/** The i ICIP chains service. */
	private IICIPChainsService iICIPChainsService;

	/** The job scheduler service. */
	private JobScheduleServiceImpl jobSchedulerService;

	/** The jobs chain partial repository. */
	private ICIPChainJobsPartialRepository jobsChainPartialRepository;

	/** The i CIP chain jobs repository. */
	private ICIPChainJobsRepository iCIPChainJobsRepository;

	/** The job sync executor service. */
	private JobSyncExecutorService jobSyncExecutorService;

	/** The days string. */
	@LeapProperty("icip.cleanup.deletion.days")
	private String daysString;

	@Autowired
	private ApplicationContext context;

	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;

	private String runtime;

	/**
	 * Instantiates a new ICIP chain jobs service.
	 *
	 * @param iCIPChainJobsRepository    the i CIP chain jobs repository
	 * @param jobSyncExecutorService     the job sync executor service
	 * @param iICIPChainsService         the i ICIP chains service
	 * @param jobSchedulerService        the job scheduler service
	 * @param jobsChainPartialRepository the jobs chain partial repository
	 */
	public ICIPChainJobsService(ICIPChainJobsRepository iCIPChainJobsRepository,
			JobSyncExecutorService jobSyncExecutorService, IICIPChainsService iICIPChainsService,
			JobScheduleServiceImpl jobSchedulerService, ICIPChainJobsPartialRepository jobsChainPartialRepository) {
		super();
		this.iCIPChainJobsRepository = iCIPChainJobsRepository;
		this.jobSyncExecutorService = jobSyncExecutorService;
		this.iICIPChainsService = iICIPChainsService;
		this.jobSchedulerService = jobSchedulerService;
		this.jobsChainPartialRepository = jobsChainPartialRepository;
	}

	/**
	 * Find by job id.
	 *
	 * @param jobId the job id
	 * @return the ICIP chain jobs
	 */
	@Override
	public ICIPChainJobs findByJobId(String jobId) {
		logger.info("Fetching job by Id {}", jobId);
		return iCIPChainJobsRepository.findByJobId(jobId);
	}

	/**
	 * Find by org.
	 *
	 * @param org  the org
	 * @param page the page
	 * @param size the size
	 * @return the list
	 */
	@Override
	public List<ICIPChainJobsPartial> findByOrg(String org, int page, int size) {
		logger.info("Fetching jobs by org {}", org);
		return jobsChainPartialRepository.findByOrganization(org, PageRequest.of(page, size));
	}

	/**
	 * Find by job name.
	 *
	 * @param jobName the job name
	 * @return the list
	 */
	@Override
	public List<ICIPChainJobsPartial> findByJobName(String jobName) {
		logger.info("Fetching jobs by name {}", jobName);
		return jobsChainPartialRepository.findByJobName(jobName);
	}

	/**
	 * Find by job name and organization.
	 *
	 * @param jobName the job name
	 * @param org     the org
	 * @return the list
	 */
	@Override
	public List<ICIPChainJobsPartial> findByJobNameAndOrganization(String jobName, String org) {
		logger.info("Fetching jobs by name {} and org {}", jobName, org);
		return jobsChainPartialRepository.findByJobNameAndOrganization(jobName, org);
	}

	/**
	 * Find by job name.
	 *
	 * @param jobName the job name
	 * @param page    the page
	 * @param size    the size
	 * @return the list
	 */
	@Override
	public List<ICIPChainJobs> findByJobName(String jobName, int page, int size) {
		logger.info("Fetching jobs by name {}", jobName);
		Pageable paginate = PageRequest.of(page, size, Sort.by("submittedOn").descending());
		return iCIPChainJobsRepository.findByJobName(jobName, paginate).toList();
	}

	/**
	 * Find by job name and organization.
	 *
	 * @param jobName the job name
	 * @param org     the org
	 * @param page    the page
	 * @param size    the size
	 * @return the list
	 */
	@Override
	public List<ICIPChainJobs> findByJobNameAndOrganization(String jobName, String org, int page, int size) {
		logger.info("Fetching jobs by name {} and org {}", jobName, org);
		Pageable paginate = PageRequest.of(page, size, Sort.by("submittedOn").descending());
		return iCIPChainJobsRepository.findByJobNameAndOrganization(jobName, org, paginate).toList();
	}

	/**
	 * Save.
	 *
	 * @param iCIPChainJobs the i CIP chain jobs
	 * @return the ICIP chain jobs
	 */
	@Override
	public ICIPChainJobs save(ICIPChainJobs iCIPChainJobs) {
		logger.info("Saving job by Id {}", iCIPChainJobs.getJobId());
		return iCIPChainJobsRepository.save(iCIPChainJobs);
	}

	/**
	 * Count by name.
	 *
	 * @param name the name
	 * @return the long
	 */
	@Override
	public Long countByName(String name) {
		logger.info("Count Length by Name : {}", name);
		return iCIPChainJobsRepository.countByJobName(name);
	}

	/**
	 * Count by name and organization.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the long
	 */
	@Override
	public Long countByNameAndOrganization(String name, String org) {
		logger.info("Count Length by Name : {} and Org : {}", name, org);
		return iCIPChainJobsRepository.countByJobNameAndOrganization(name, org);
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
		logger.info("Fetching chain jobs for Entity {}", fromProjectId);
		List<ICIPChainJobsPartial> chJob = jobsChainPartialRepository.findByOrganization(fromProjectId);
		List<ICIPChainJobs> toJob = chJob.parallelStream().map(model -> {
			Optional<ICIPChainJobs> optionalJob = iCIPChainJobsRepository.findById(model.getId());
			if (optionalJob.isPresent()) {
				ICIPChainJobs job = optionalJob.get();
				job.setId(null);
				job.setOrganization(toProjectId);
				return job;
			}
			return null;
		}).collect(Collectors.toList());
		toJob.stream().forEach(model -> iCIPChainJobsRepository.save(model));
		return true;
	}

	/**
	 * Stop running job.
	 */
	// on startup
	@Override
	public void stopRunningJob() {
		List<ICIPChainJobsPartial> runningJobsList = jobsChainPartialRepository
				.findByJobStatus(JobStatus.RUNNING.toString());
		runningJobsList.parallelStream().forEach(job -> {
			Optional<ICIPChainJobs> optionalJob = iCIPChainJobsRepository.findById(job.getId());
			if (optionalJob.isPresent()) {
				ICIPChainJobs icipjob = optionalJob.get();
				icipjob = icipjob.updateJob(JobStatus.ERROR.toString(), "Error : Server was down");
				iCIPChainJobsRepository.save(icipjob);
				jobSyncExecutorService.callAlertOnStatus(icipjob.getSubmittedBy(), icipjob.getJobName(),
						icipjob.getOrganization(), JobStatus.ERROR.toString());
			}
		});
	}

	/**
	 * Change job property.
	 *
	 * @param job         the job
	 * @param isCompleted the is completed
	 */
	@Override
	public void changeJobProperty(ICIPChainJobs job, boolean isCompleted) {
		job.setJobStatus(isCompleted ? JobStatus.COMPLETED.toString() : JobStatus.ERROR.toString());
		job.setFinishtime(new Timestamp(new Date().getTime()));
		save(job);
	}

	/**
	 * Find by job name and organization by submission.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP chain jobs
	 */
	@Override
	public ICIPChainJobs findByJobNameAndOrganizationBySubmission(String name, String org) {
		return iCIPChainJobsRepository.findByJobNameAndOrganizationBySubmission(name, org);
	}

	/**
	 * Find by job name and organization by last submission.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP chain jobs
	 */
	@Override
	public ICIPChainJobs findByJobNameAndOrganizationByLastSubmission(String name, String org) {
		return iCIPChainJobsRepository.findByJobNameAndOrganizationByLastSubmission(name, org);
	}

	/**
	 * Find by job name and organization.
	 *
	 * @param jobName the job name
	 * @param org     the org
	 * @param page    the page
	 * @param size    the size
	 * @return the list
	 */
	@Override
	public List<ICIPChainJobsPartial> findByJobNameAndOrganization1(String jobName, String org, int page, int size) {
		logger.info("Fetching jobs by name {} and org {}", jobName, org);
		Pageable paginate = PageRequest.of(page, size, Sort.by("submittedOn").descending());
        int limit = paginate.getPageSize();
        int offset = paginate.getPageNumber() * paginate.getPageSize();
		return jobsChainPartialRepository.findByJobNameAndOrganization(jobName, org, limit,offset);
	}

	/**
	 * Find by corelid.
	 *
	 * @param corelid the corelid
	 * @return the ICIP chain jobs
	 */
	@Override
	public List<ICIPChainJobsPartial> findByCorelid(String corelid) {
		return jobsChainPartialRepository.findByCorrelationid(corelid);
	}

	/**
	 * Find by hashparams.
	 *
	 * @param hashparams the hashparams
	 * @return the ICIP chain jobs
	 */
	@Override
	public ICIPChainJobs findByHashparams(String hashparams) {
		return iCIPChainJobsRepository.findByHashparams(hashparams);
	}

	/**
	 * Stop local job.
	 *
	 * @param jobid the jobid
	 * @throws LeapException the leap exception
	 */
	@Override
	public void stopLocalJob(String jobid) throws LeapException {
		jobSyncExecutorService.stopLocalJob(jobid);
	}

	/**
	 * Boot cleanup.
	 */
	@Override
	public void bootCleanup() {
		List<ICIPChainJobsPartial> list = jobsChainPartialRepository.findByJobStatus(JobStatus.RUNNING.toString());
		list.parallelStream().forEach(job -> {
			Optional<ICIPChainJobs> optionalJob = iCIPChainJobsRepository.findById(job.getId());
			if (optionalJob.isPresent()) {
				ICIPChainJobs icipjob = optionalJob.get();
				icipjob = icipjob.updateJob(JobStatus.CANCELLED.toString(),
						System.getProperty(IAIJobConstants.LINE_SEPARATOR) + "Application restarted...");
				iCIPChainJobsRepository.save(icipjob);
			}
		});
	}

	/**
	 * Run chain.
	 *
	 * @param jobName  the job name
	 * @param org      the org
	 * @param body     the body
	 * @param runNow   the run now
	 * @param feoffset the feoffset
	 * @return the string
	 * @throws SchedulerException the scheduler exception
	 * @throws SQLException       the SQL exception
	 */
	@Override
	public String runChain(String jobName, String org, String body, boolean runNow, int feoffset, String datasourceName)
			throws SchedulerException, SQLException {
//		String corelid = ICIPUtils.generateCorrelationId();
//		Gson gson = new Gson();
//		ICIPChains chain = iICIPChainsService.findByNameAndOrganization(jobName, org);
//		ChainObject.InitialJsonContent2 chainObject = gson.fromJson(chain.getJsonContent(),
//				ChainObject.InitialJsonContent2.class);
//		chainObject.setRunNow(runNow);
//		JSONObject chaingetruntime=new JSONObject(chain.getJsonContent());
//		if(chaingetruntime.get("runtime")==null) {
//			runtime="localjobruntime";
//		}
//		else {
//			runtime=chaingetruntime.get("runtime").toString().toLowerCase()+"jobruntime";;
//		}
//		chain.setJsonContent(gson.toJson(chainObject));
//		ChainJobElement2 elements = gson.fromJson(body, ChainJobElement2.class);
//		ICIPJobRuntimePluginsService pluginService = context.getBean(ICIPJobRuntimePluginsService.class);
//		jobSchedulerService.createChainJob(elements.getElements(), chain, elements.getParams(),
//				pluginService.getClassType(runtime), corelid, false, feoffset, ICIPUtils.getUser(claim),datasourceName);
//		return corelid;
		runtime = "localjobruntime";
		String corelid = ICIPUtils.generateCorrelationId();
		Gson gson = new Gson();
		ICIPChains chain = iICIPChainsService.findByNameAndOrganization(jobName, org);
		ChainObject.InitialJsonContent2 chainObject = gson.fromJson(chain.getJsonContent(),
				ChainObject.InitialJsonContent2.class);
		chainObject.setRunNow(runNow);
		chain.setJsonContent(gson.toJson(chainObject));
		ChainJobElement2 elements = gson.fromJson(
				new JSONObject(new JSONObject(body).get("jsonContent").toString()).get("element").toString(),
				ChainJobElement2.class);
		ChainJob2[] elmnts = elements.getElements();
		elements.setParams("{}");
		ICIPJobRuntimePluginsService pluginService = context.getBean(ICIPJobRuntimePluginsService.class);
		ChainJob2[] list = new ChainJob2[2];
//		int maxLevel = 0;
//		for (int i = 0, j = elmnts.length; i < j; i++) {
//			ChainJob2 job = elmnts[i];
//			int currentLevel = Integer.parseInt(job.getLevel());
//			if (currentLevel > maxLevel)
//				maxLevel = currentLevel;
//
//		}
//		int[] subLevels = new int[maxLevel + 1];
//		int[] localSubLevels = new int[maxLevel + 1];
//		int[] remoteSubLevels = new int[maxLevel + 1];
//		Arrays.fill(subLevels, 0);
//		Arrays.fill(localSubLevels, 0);
//		Arrays.fill(remoteSubLevels, 0);
		JSONObject dsMap = new JSONObject();
		List<ChainJob2> joblocaldraganddrop = new ArrayList<>();
		List<ChainJob2> joblocal = new ArrayList<>();
		List<ChainJob2> jobremote = new ArrayList<>();
		List<ChainJob2> jobremotedrapanddrop = new ArrayList<>();
		for (int i = 0, j = elmnts.length; i < j; i++) {
			ChainJob2 job = elmnts[i];
//			int currentSubLevel=Integer.parseInt(job.getLevel());
//			subLevels[currentSubLevel]+=1;
			if ("local-".equalsIgnoreCase(job.getRuntime())) {
				if (job.getType().equalsIgnoreCase("DragNDropLite") || job.getType().equalsIgnoreCase("DragAndDrop")) {
					joblocaldraganddrop.add(job);
				} else {
					joblocal.add(job);
				}

			} else {
				if (job.getType().equalsIgnoreCase("DragNDropLite")|| job.getType().equalsIgnoreCase("DragAndDrop")) {
					jobremotedrapanddrop.add(job);
				} else {
					jobremote.add(job);
				}

				dsMap.put(job.getName(), job.getRuntime());
			}
		}
		ChainJob2[] localchainJobs = new ChainJob2[joblocal.size()];
		ChainJob2[] remotechainJobs = new ChainJob2[jobremote.size()];
		ChainJob2[] localchainJobsDragndrop = new ChainJob2[joblocaldraganddrop.size()];
		ChainJob2[] remotechainJobsDragndrop = new ChainJob2[jobremotedrapanddrop.size()];
		if (joblocal.size() != 0) {
			for (int i = 0; i < joblocal.size(); ++i) {
				localchainJobs[i] = joblocal.get(i);
			}
			logger.info("size of the localchainJobs is {}",localchainJobs.length);
			jobSchedulerService.createChainJob(localchainJobs, chain, elements.getParams(),
					pluginService.getClassType("localjobruntime"), corelid, false, feoffset, ICIPUtils.getUser(claim),
					null);

		}
		if (jobremote.size() != 0) {
			for (int i = 0; i < jobremote.size(); ++i) {

				remotechainJobs[i] = jobremote.get(i);

			}
			logger.info("size of the remotechainJobs is {}",remotechainJobs.length);
			jobSchedulerService.createChainJob(remotechainJobs, chain, elements.getParams(),
					pluginService.getClassType("remotejobruntime"), corelid, false, feoffset, ICIPUtils.getUser(claim),
					dsMap);

		}
		if (jobremotedrapanddrop.size() != 0) {
			for (int i = 0; i < jobremotedrapanddrop.size(); ++i) {

				remotechainJobsDragndrop[i] = jobremotedrapanddrop.get(i);

			}
			logger.info("size of the remotechainJobsDragndrop is {}",remotechainJobsDragndrop.length);
			jobSchedulerService.createChainJob(remotechainJobsDragndrop, chain, "generated",
					pluginService.getClassType("remotejobruntime"), corelid, false, feoffset, ICIPUtils.getUser(claim),
					dsMap);

		}
		if (joblocaldraganddrop.size() != 0) {
			for (int i = 0; i < joblocaldraganddrop.size(); ++i) {

				localchainJobsDragndrop[i] = joblocaldraganddrop.get(i);

			}
			logger.info("size of the localchainJobsDragndrop is {}",localchainJobsDragndrop.length);
			jobSchedulerService.createChainJob(localchainJobsDragndrop, chain, "generated",
					pluginService.getClassType("localjobruntime"), corelid, false, feoffset, ICIPUtils.getUser(claim),
					null);
		}
//		int maxSubLevel=Arrays.stream(subLevels)
//				.max().orElse(0);
//		ChainJob2[][] jobList = new ChainJob2[maxLevel+1][maxSubLevel+1];
//		int[] subLevelsCol=new int[maxLevel+1];
//		Arrays.fill(subLevelsCol, 0);
//		for (int i = 0, j = elmnts.length; i < j; i++) {
//			ChainJob2 job = elmnts[i];
//			int currentLevel=Integer.parseInt(job.getLevel());
//			jobList[currentLevel][subLevelsCol[currentLevel]]=job;	
//			subLevelsCol[currentLevel]+=1;
//		}
//		
//		for(int i=0;i<maxLevel+1;i++) {
//			Boolean isLocalExist=false;
//			Boolean isRemoteExist=false;
//			ChainJob2[] localList=new ChainJob2[1];
//			ChainJob2[] remoteList=new ChainJob2[1];
//			if(localSubLevels[i]>0) {
//				isLocalExist=true;
//				localList=new ChainJob2[localSubLevels[i]];
//			}
//			if(remoteSubLevels[i]>0) {
//				isRemoteExist=true;
//				remoteList=new ChainJob2[remoteSubLevels[i]];
//			}
//			int local=0;
//			int remote=0;
//			for(int j=0;j<subLevels[i];j++) {	
//				if("local-".equalsIgnoreCase(jobList[i][j].getRuntime())) {
//					localList[local++]=jobList[i][j];
//				}else {
//					remoteList[remote++]=jobList[i][j];
//				}
//			}
//			if(isLocalExist) {
//				
//				chain.setParallelchain(0);
//				if(localList[0].getType().equalsIgnoreCase("DragNDropLite")||localList[0].getType().equalsIgnoreCase("DragNDrop")) {
//					
//					jobSchedulerService.createChainJob(localList, chain, "generated",
//								pluginService.getClassType("localjobruntime"), corelid, false, feoffset, ICIPUtils.getUser(claim),null);
//					}
//				else {
//					jobSchedulerService.createChainJob(localList, chain, elements.getParams(),
//							pluginService.getClassType("localjobruntime"), corelid, false, feoffset, ICIPUtils.getUser(claim),null);
//					}
//	
//			}else {
//				logger.info("Level:{} isLocalExist NOT EXIST",i);
//			}
//			
//			if(isRemoteExist) {
//				chain.setParallelchain(1);
//				if(remoteList[0].getType().equalsIgnoreCase("DragNDropLite")||remoteList[0].getType().equalsIgnoreCase("DragNDrop")) {
//					jobSchedulerService.createChainJob(remoteList, chain,"generated",
//							pluginService.getClassType("remotejobruntime"), corelid, false, feoffset, ICIPUtils.getUser(claim),dsMap);
//				}
//				else {
//				jobSchedulerService.createChainJob(remoteList, chain, elements.getParams(),
//						pluginService.getClassType("remotejobruntime"), corelid, false, feoffset, ICIPUtils.getUser(claim),dsMap);
//				}
//			}else {
//				logger.info("Level:{} isRemoteExist NOT EXIST",i);
//			}
//			
//			
//		}
		return corelid;

	}

	@Override
	public void removeDuplicates(String jobName, String org) {
		List<Integer> listcheck = new ArrayList<>();

		String corelid = "";
		List<Integer> masterRemoval = new ArrayList<>();
		List<ICIPChainJobsPartial> resp = jobsChainPartialRepository.findByJobNameAndOrganization(jobName, org);
		Map<String, String> mapofVisitedcorelid = new HashMap<>();
		for (int index = 0; index < resp.size(); ++index) {
			ICIPChainJobsPartial chainjob = resp.get(index);
			if (!mapofVisitedcorelid.containsKey(chainjob.getCorrelationid())) {
				mapofVisitedcorelid.put(chainjob.getCorrelationid(), "1");

				List<ICIPChainJobsPartial> corelidId = jobsChainPartialRepository
						.findByCorrelationid(chainjob.getCorrelationid());
				if (corelidId.size() > 1) {
					int errorflag = 0, cancelflag = 0, indexOfaccept = -1, running = 0;
					for (int i = 0; i < corelidId.size(); ++i) {

						if (corelidId.get(i).getJobStatus().equals(JobStatus.ERROR.toString())) {
							errorflag = 1;
							indexOfaccept = i;
							break;
						} else if (corelidId.get(i).getJobStatus().equals(JobStatus.CANCELLED.toString())) {
							cancelflag = 1;
							indexOfaccept = i;
						} else if (cancelflag != 1
								&& corelidId.get(i).getJobStatus().equals(JobStatus.RUNNING.toString())) {
							running = 1;
							indexOfaccept = i;
						} else if (cancelflag != 1 && running != 1
								&& corelidId.get(i).getJobStatus().equals(JobStatus.COMPLETED.toString())) {
							indexOfaccept = i;
						}
					}

					for (int i = 0; i < corelidId.size(); ++i) {
						if (i != indexOfaccept) {
							int a = corelidId.get(i).getId();
							jobsChainPartialRepository.deleteById(corelidId.get(i).getId());
						}
					}
				}
			}
		}

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
			iCIPChainJobsRepository.deleteOlderData(days);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			throw new LeapException(ex.getMessage());
		}
	}

}
