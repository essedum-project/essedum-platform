/**
 * @ 2021 - 2022 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.icip.icipwebeditor.rest;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import org.json.JSONObject;
import org.python.modules.itertools.chain;
import org.quartz.SchedulerException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.google.gson.Gson;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.icip.icipwebeditor.job.ICIPNativeServiceJob;
import com.infosys.icets.icip.icipwebeditor.job.enums.JobStatus;
import com.infosys.icets.icip.icipwebeditor.job.model.ChainObject;
import com.infosys.icets.icip.icipwebeditor.job.model.ChainObject.InitialJsonContent2;
import com.infosys.icets.icip.icipwebeditor.model.ICIPJobsPartial;
import com.infosys.icets.icip.icipwebeditor.job.model.ICIPChainJobs;
import com.infosys.icets.icip.icipwebeditor.job.model.ICIPChainJobsPartial;
import com.infosys.icets.icip.icipwebeditor.job.model.ICIPChains;
import com.infosys.icets.icip.icipwebeditor.service.IICIPChainJobsService;
import com.infosys.icets.icip.icipwebeditor.service.IICIPChainsService;
import com.infosys.icets.icip.icipwebeditor.service.IICIPJobRuntimeLoggerService;
import com.infosys.icets.icip.icipwebeditor.service.IICIPJobsService;
import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPRuntimeLoggerService;
import com.infosys.icets.icip.icipwebeditor.service.impl.JobScheduleServiceImpl;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Hidden;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPChainJobsController.
 *
 * @author icets
 */
@RestController
@Timed
@Hidden
@RequestMapping(path = "/${icip.pathPrefix}/chainjob")
public class ICIPChainJobsController {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPChainJobsController.class);

	/** The i ICIP jobs service. */
	@Autowired
	private IICIPChainJobsService iICIPJobsService;

	/** The i ICIP jobs service. */
	@Autowired
	private IICIPJobsService jobsService;
	
	/** The i ICIP chains service. */
	@Autowired
	private IICIPChainsService iICIPChainsService;

	@Autowired
	private ICIPRuntimeLoggerService jobRuntimeLoggerService;
	
	/** The job scheduler service. */
	@Autowired
	private JobScheduleServiceImpl jobSchedulerService;
	
	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;

	/**
	 * Run chain.
	 *
	 * @param jobName the job name
	 * @param org     the org
	 * @param offset the offset
	 * @param jobs    the jobs
	 * @param runNow  the run now
	 * @return the response entity
	 */
	@PostMapping(value = "/run/tree/{name}/{org}/{runNow}", produces = "application/json")
	public ResponseEntity<String> runChain(@PathVariable("name") String jobName, @PathVariable("org") String org,
			@RequestParam("offset") int offset, @RequestBody(required = true) String jobs,
			@PathVariable(name = "runNow") boolean runNow)
//			@PathVariable(name = "datasourceName") String datasourceName) 
			{
		try {
			String corelid = iICIPJobsService.runChain(jobName, org, jobs, runNow, offset,"");
			return new ResponseEntity<>(corelid, HttpStatus.OK);
		} catch (SchedulerException | SQLException e) {
			logger.error(e.getMessage());
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Update chain.
	 *
	 * @param jobId       the job id
	 * @param jobName     the job name
	 * @param group       the group
	 * @param org         the org
	 * @param offset the offset
	 * @param jsoncontent the jsoncontent
	 * @return the response entity
	 */
	@PostMapping(value = "/update/{id}/{name}/{group}/{org}", produces = "application/json")
	public ResponseEntity<JSONObject> updateChain(@PathVariable("id") String jobId,
			@PathVariable("name") String jobName, @PathVariable("group") String group, @PathVariable("org") String org,
			@RequestParam("offset") int offset, @RequestBody(required = true) String body) {
		try {
//			String corelid = ICIPUtils.generateCorrelationId();
//			ICIPChains job = iICIPChainsService.findByNameAndOrganization(jobName, org);
//			Gson gson = new Gson();
//			ChainObject.InitialJsonContent2 chainObject = gson.fromJson(job.getJsonContent(),
//					ChainObject.InitialJsonContent2.class);
//			InitialJsonContent2 initialjson = gson.fromJson(jsoncontent, InitialJsonContent2.class);
//			chainObject.setExpression(initialjson.getExpression());
//			chainObject.setMyDate(initialjson.getMyDate());
//			chainObject.setMyTime(initialjson.getMyTime());
//			chainObject.setTimeZone(initialjson.getTimeZone());
//			chainObject.setRunNow(false);
//			chainObject.setJobTimeout(initialjson.getJobTimeout());
//			chainObject.setRemoteDatasourceName(initialjson.getRemoteDatasourceName());
//			job.setJsonContent(gson.toJson(chainObject));
//			job = iICIPChainsService.save(job);
			if (jobId != null && !jobId.equals("undefined") && group != null && !group.equals("undefined")) {
				jobSchedulerService.deleteJob(jobId, group);
			}
//			JSONObject dsrc = new JSONObject();
//			dsrc.put("remoteDatasource",chainObject.getRemoteDatasourceName());
//			jobSchedulerService.createChainJob(chainObject.getElement().getElements(), job,
//					chainObject.getElement().getParams(), ICIPNativeServiceJob.class, corelid, false, offset, ICIPUtils.getUser(claim),dsrc);
			JSONObject obj = new JSONObject();
			String corelid = iICIPJobsService.runChain(jobName, org, body, false, offset,"");

			obj.put("body", corelid);
			return new ResponseEntity<>(obj, HttpStatus.OK);
		} catch (SchedulerException | SQLException e) {
			logger.error(e.getMessage());
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}
	/**
	 * Gets the job console.
	 *
	 * @param jobId the job id
	 * @return the job console
	 */
	@GetMapping("/console/{jobId}")
	public ResponseEntity<ICIPChainJobs> getJobConsole(@PathVariable(name = "jobId") String jobId) {
		logger.debug("Getting Job response");
		ICIPChainJobs resp = iICIPJobsService.findByJobId(jobId);
		return new ResponseEntity<>(resp, new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the jobs by name.
	 *
	 * @param jobName the job name
	 * @param org     the org
	 * @param page    the page
	 * @param size    the size
	 * @return the jobs by name
	 */
//	@GetMapping("/fetch/{jobName}/{org}")
//	public ResponseEntity<List<ICIPChainJobsPartial>> getJobsByName(@PathVariable("jobName") String jobName,
//			@PathVariable("org") String org, @RequestParam(required = false, name = "page") String page,
//			@RequestParam(required = false, name = "size") String size) {
//		logger.debug("Getting Job response : {}", jobName);
//		iICIPJobsService.removeDuplicates(jobName, org);
//		
//		List<ICIPChainJobsPartial> resp1=new ArrayList<>();
//		if (page != null && !page.trim().isEmpty() && size != null && !size.trim().isEmpty()) {
//			resp1=iICIPJobsService.findByJobNameAndOrganization1(jobName, org, Integer.valueOf(page),
//					Integer.valueOf(size));
//		} else {
//			resp1 = iICIPJobsService.findByJobNameAndOrganization1(jobName, org, 0, 15);
//		}
//		List<ICIPChainJobsPartial> resp=new ArrayList<>();
//		for(int index=0;index<resp1.size();++index) {
//			resp.add(resp1.get(index));
//		}
//		
//		List<Integer> listcheck = new ArrayList<>();
//
//		String corelid="";
//		List<Integer> masterRemoval=new ArrayList<>();
//		for(int index=0;index<resp.size();++index) {
//			ICIPChainJobsPartial chainjob = resp.get(index);
//			String metadata = chainjob.getJobmetadata();
//			JSONObject jsonObject =new JSONObject(metadata);
//			
//			if(!chainjob.getCorrelationid().equals(corelid)) 
//			{
//			corelid=chainjob.getCorrelationid();
//			int errorflag=0,cancelflag=0,indexOfaccept=-1;
//			for(int i=0;i<listcheck.size();++i) {
//			
//				if (resp.get(listcheck.get(i)).getFinishtime()==null) {
//					System.out.println("Delete"+ resp.get(i));
//					
//				}
//				else {
//					
//					if(resp.get(listcheck.get(i)).getJobStatus().equals(JobStatus.ERROR.toString())) {
//						errorflag=1;
//						indexOfaccept=listcheck.get(i);
//						break;
//					}
//					else if(resp.get(listcheck.get(i)).getJobStatus().equals(JobStatus.CANCELLED.toString())) {
//						cancelflag=1;
//						indexOfaccept=listcheck.get(i);
//					}
//					else if(cancelflag!=1 &&resp.get(listcheck.get(i)).getJobStatus().equals(JobStatus.COMPLETED.toString())) {
//						indexOfaccept=listcheck.get(i);
//					}
//					
//				}
//			}
//			
//			
//			listcheck.remove(Integer.valueOf(indexOfaccept));
//			
//			for(int i=0;i<listcheck.size();++i) {
//				int indexremove=listcheck.get(i);
//				masterRemoval.add(indexremove);
//			}
//			listcheck.clear();
//			listcheck.add(index);
//			}
//			else {
//				listcheck.add(index);
//			}
////			if(jsonObject.has("runtime")&&jsonObject.get("runtime").toString().equalsIgnoreCase("remote") ){
////				IICIPJobRuntimeLoggerService iicipJobRuntimeLoggerService = jobRuntimeLoggerService.getJobRuntimeLoggerService("remoteloggerservice");
////
////
////			if( chainjob.getFinishtime()==null || chainjob.getJobStatus().equals(JobStatus.RUNNING.toString())) {
////				int flag=0;
////				int cancel=0;
////				int error=0;
////				int running=0;
////				Timestamp timestamplastfinish = null;
////				List<ICIPJobsPartial>lstjobs=jobsService.findByCorelid(chainjob.getCorrelationid());
////				System.out.println(lstjobs);
////				for(int indexjob=0;indexjob<lstjobs.size();++indexjob) {
////				ICIPJobsPartial remotejob = lstjobs.get(indexjob);
////					if(remotejob.getFinishtime()==null) {
////						ICIPJobsPartial returnjob = iicipJobRuntimeLoggerService.updateAndLogJob(remotejob);
////					}
////					if(remotejob.getFinishtime()==null) {
////						flag=1;
////					}
////					else {
////						if(remotejob.getJobStatus().equals(JobStatus.CANCELLED.toString())) {
////							if(error==0) {
////							resp.get(index).setJobStatus(JobStatus.CANCELLED.toString());
////							cancel=1;
////							}
////						}
////						else if(remotejob.getJobStatus().equals(JobStatus.ERROR.toString())) {
////							resp.get(index).setJobStatus(JobStatus.ERROR.toString());
////							error=1;
////						}
////						else if(remotejob.getJobStatus().equals(JobStatus.RUNNING.toString())) {
////							if (error==0 && cancel==0) {
////							resp.get(index).setJobStatus(JobStatus.RUNNING.toString());
////							running=1;
////							}
////						}
////						else if(remotejob.getJobStatus().equals(JobStatus.COMPLETED.toString())){
////							if(running==0 && error==0 && cancel==0) {
////								resp.get(index).setJobStatus(JobStatus.COMPLETED.toString());
////							}
////						}
////					  timestamplastfinish = (remotejob.getFinishtime());
////					}
////				};
////			if(flag==0) {
////				resp.get(index).setFinishtime(timestamplastfinish);
////				ICIPChainJobs chainjobtosave = iICIPJobsService.findByJobId(resp.get(index).getJobId().toString());
////				chainjobtosave.setFinishtime(timestamplastfinish);
////				chainjobtosave.setJobStatus(resp.get(index).getJobStatus());
////				iICIPJobsService.save(chainjobtosave);		
////			}
////				
////			}
////			}
//			
//		}
//
//		int errorflag=0,cancelflag=0,indexOfaccept=-1;
//		for(int i=0;i<listcheck.size();++i) {
//			
//			if (resp.get(listcheck.get(i)).getFinishtime()==null) {
//				System.out.println("Delete"+ resp.get(i));
//				
//			}
//			else {
//				
//				if(resp.get(listcheck.get(i)).getJobStatus().equals(JobStatus.ERROR.toString())) {
//					errorflag=1;
//					indexOfaccept=listcheck.get(i);
//					break;
//				}
//				else if(resp.get(listcheck.get(i)).getJobStatus().equals(JobStatus.CANCELLED.toString())) {
//					cancelflag=1;
//					indexOfaccept=listcheck.get(i);
//				}
//				else if(cancelflag!=1 &&resp.get(listcheck.get(i)).getJobStatus().equals(JobStatus.COMPLETED.toString())) {
//					indexOfaccept=listcheck.get(i);
//				}
//				
//			}
//		}
//		
//		
//		listcheck.remove(Integer.valueOf(indexOfaccept));
//		
//		for(int i=0;i<listcheck.size();++i) {
//			int indexremove=listcheck.get(i);
//			masterRemoval.add(indexremove);
//		}
//	
//		
//		List<ICIPChainJobsPartial> finalresp=new ArrayList<>();
//		for(int i=0;i<resp.size();++i) {
//			if(!masterRemoval.contains(i)) {
//				finalresp.add(resp.get(i));
//			}
//		}
//		return new ResponseEntity<>(finalresp, new HttpHeaders(), HttpStatus.OK);
//	}

	@GetMapping("/fetch/{jobName}/{org}")
	public ResponseEntity<List<ICIPChainJobsPartial>> getJobsByName(@PathVariable("jobName") String jobName,
			@PathVariable("org") String org, @RequestParam(required = false, name = "page") String page,
			@RequestParam(required = false, name = "size") String size) {
		logger.debug("Getting Job response : {}", jobName);
		List<ICIPChainJobsPartial> resp;
		if (page != null && !page.trim().isEmpty() && size != null && !size.trim().isEmpty()) {
			resp = iICIPJobsService.findByJobNameAndOrganization1(jobName, org, Integer.valueOf(page),
					Integer.valueOf(size));
		} else {
			resp = iICIPJobsService.findByJobNameAndOrganization1(jobName, org, 0, 15);
		}
		
		for(int index=0;index<resp.size();++index) {
			ICIPChainJobsPartial chainjob = resp.get(index);
		
			String metadata = chainjob.getJobmetadata();
			JSONObject jsonObject =new JSONObject(metadata);
			if(jsonObject.has("runtime")&&jsonObject.get("runtime").toString().equalsIgnoreCase("remote") ){
				IICIPJobRuntimeLoggerService iicipJobRuntimeLoggerService = jobRuntimeLoggerService.getJobRuntimeLoggerService("remoteloggerservice");

//				IICIPJobRuntimeLoggerService iicipJobRuntimeLoggerService = null;
				int flag=0;
				int cancel=0;
				int error=0;
				int running=0;
				Timestamp timestamplastfinish = null;
				List<ICIPJobsPartial>lstjobs=jobsService.findByCorelid(chainjob.getCorrelationid());
				for(int indexjob=0;indexjob<lstjobs.size();++indexjob) {
				ICIPJobsPartial remotejob = lstjobs.get(indexjob);
					if(remotejob.getFinishtime()==null && !remotejob.getRuntime().toString().equalsIgnoreCase("local")) {
						ICIPJobsPartial returnjob = iicipJobRuntimeLoggerService.updateAndLogJob(remotejob);
					}
//					if(remotejob.getFinishtime()==null) {
//						flag=1;
//					}
//					else {
						if(remotejob.getJobStatus().equals(JobStatus.CANCELLED.toString())) {
							if(error==0) {
							resp.get(index).setJobStatus(JobStatus.CANCELLED.toString());
							cancel=1;
							}
						}
						else if(remotejob.getJobStatus().equals(JobStatus.ERROR.toString())) {
							resp.get(index).setJobStatus(JobStatus.ERROR.toString());
							error=1;
						}
						else if(remotejob.getJobStatus().equals(JobStatus.RUNNING.toString())) {
							if (error==0 && cancel==0) {
							resp.get(index).setJobStatus(JobStatus.RUNNING.toString());
							running=1;
							timestamplastfinish=null;
							}
						}
						else if(remotejob.getJobStatus().equals(JobStatus.COMPLETED.toString())){
							if(running==0 && error==0 && cancel==0) {
								resp.get(index).setJobStatus(JobStatus.COMPLETED.toString());
							}
						}
					if(running!=1) {	
					  timestamplastfinish = (remotejob.getFinishtime());
					}
//					}
				};
			if(flag==0) {
				resp.get(index).setFinishtime(timestamplastfinish);
				ICIPChainJobs chainjobtosave = iICIPJobsService.findByJobId(resp.get(index).getJobId().toString());
				chainjobtosave.setFinishtime(timestamplastfinish);
				chainjobtosave.setJobStatus(resp.get(index).getJobStatus());
				iICIPJobsService.save(chainjobtosave);		
			}
				
			
			}

		}
		return new ResponseEntity<>(resp, new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the jobs len.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the jobs len
	 */
	@GetMapping("/jobsLen/{name}/{org}")
	public ResponseEntity<Long> getJobsLen(@PathVariable(name = "name") String name, @PathVariable("org") String org) {
		Long jobsLen = iICIPJobsService.countByNameAndOrganization(name, org);
		return new ResponseEntity<>(jobsLen, new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the job by corelid.
	 *
	 * @param corelid the corelid
	 * @return the job by corelid
	 */
	@GetMapping("/corelid/{corelid}")
	public ResponseEntity<List<ICIPChainJobsPartial>> getJobByCorelid(@PathVariable(name = "corelid") String corelid) {
		logger.debug("Getting Job by corelid");
		List<ICIPChainJobsPartial> resp = iICIPJobsService.findByCorelid(corelid);
		return new ResponseEntity<>(resp, new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Stop job.
	 *
	 * @param jobid the jobid
	 * @return the response entity
	 */
	@GetMapping("/stopJob/{jobid}")
	public ResponseEntity<Void> stopJob(@PathVariable(name = "jobid") String jobid) {
		logger.info("Request to stop job");
		try {
			iICIPJobsService.stopLocalJob(jobid);
			return new ResponseEntity<>(new HttpHeaders(), HttpStatus.OK);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			return new ResponseEntity<>(new HttpHeaders(), HttpStatus.BAD_REQUEST);
		}
	}

}
