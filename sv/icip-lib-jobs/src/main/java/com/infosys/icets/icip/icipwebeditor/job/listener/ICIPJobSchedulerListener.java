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
package com.infosys.icets.icip.icipwebeditor.job.listener;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.quartz.InterruptableJob;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.JobKey;
import org.quartz.JobListener;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.quartz.SchedulerFactoryBean;

// TODO: Auto-generated Javadoc
// 
/**
 * The listener interface for receiving ICIPJobScheduler events. The class that
 * is interested in processing a ICIPJobScheduler event implements this
 * interface, and the object created with that class is registered with a
 * component using the component's <code>addICIPJobSchedulerListener<code>
 * method. When the ICIPJobScheduler event occurs, that object's appropriate
 * method is invoked.
 *
 * @author icets
 */

public class ICIPJobSchedulerListener implements JobListener {

	/** The listener name. */
	private String listenerName;

	/** The is done. */
	private boolean isDone;
	
	/** The scheduler factory bean. */
	private SchedulerFactoryBean schedulerFactoryBean;

	private boolean isInterrupted;
	

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPJobSchedulerListener.class);
	
	private ScheduledExecutorService executorService = Executors.newSingleThreadScheduledExecutor();

	private boolean toInterrupt;
	
	
	/**
	 * Instantiates a new ICIP job scheduler listener.
	 *
	 * @param name the name
	 */
	public ICIPJobSchedulerListener(String name) {
		this.listenerName = name;
		this.isDone = false;
		this.isInterrupted=false;
	}

	/**
	 * Gets the name.
	 *
	 * @return the name
	 */
	@Override
	public String getName() {
		return listenerName; // must return a name
	}

	/**
	 * Run until done.
	 * @return 
	 *
	 * @throws InterruptedException the interrupted exception
	 */
	public void runUntilDone() throws InterruptedException {
		while (!this.isDone) {
			logger.debug("Running ...");
			Thread.sleep(100);
		}
	}

	/**
	 * Job to be executed.
	 *
	 * @param context the context
	 */
	// Run this if job is about to be executed.
	@Override
	public void jobToBeExecuted(JobExecutionContext context) {
	String jobName = context.getJobDetail().getKey().toString();
	
		logger.info("Job to be executed");
		logger.info("Job : {} is going to start...", jobName);
		this.isDone=false;
		Integer jobTimeout=(context.getMergedJobDataMap().containsKey("jobTimeout")&& context.getMergedJobDataMap().get("jobTimeout")!=null )?(Integer) context.getMergedJobDataMap().get("jobTimeout"):0;
		if(jobTimeout>0 && jobTimeout!=null) {
			 logger.info("Scheduling Executor service for Job:"+context.getJobDetail().getKey().toString());
			 logger.info("Interrupt job -"+context.getJobDetail().getKey().toString()+" after Threshold time of "+ jobTimeout);
			this.executorService.schedule(new Runnable() {  
			    @Override  
			    public void run() {  
			        if(!isDone) {
			        	logger.info("Interrupting Job:"+context.getJobDetail().getKey().toString());
			        	try {
			    			Scheduler scheduler = context.getScheduler();
			    			JobKey jkey = new JobKey(context.getJobDetail().getKey().getName(),context.getJobDetail().getKey().getGroup() );
			    			if(context.getJobInstance() instanceof InterruptableJob) {
			    				scheduler.interrupt(jkey);
			    			}
			    		} catch (SchedulerException e) {	
			    			logger.error(e.getMessage());
			    		}
			        }
			    }  
			}, jobTimeout, TimeUnit.SECONDS);
			
		}
		
	}

	/**
	 * Job execution vetoed.
	 *
	 * @param context the context
	 */
	// No idea when will run this?
	@Override
	public void jobExecutionVetoed(JobExecutionContext context) {
		logger.info("jobExecutionVetoed");
	}

	/**
	 * Job was executed.
	 *
	 * @param context      the context
	 * @param jobException the job exception
	 */
	// Run this after job has been executed
	@Override
	public void jobWasExecuted(JobExecutionContext context, JobExecutionException jobException) {
		isDone = true;
//		this.executorService.shutdown();
//		try {
//			this.executorService.awaitTermination(10, TimeUnit.MINUTES);
//		} catch (InterruptedException e) {
//			// TODO Auto-generated catch block
//			e.printStackTrace();
//		}
		String jobName = context.getJobDetail().getKey().toString();
		logger.info("Job : {} is finished...", jobName);
		if (jobException != null && jobException.getMessage() != null) {
			logger.info("Exception thrown by: {} Exception: {} ", jobName, jobException.getMessage());
			logger.error(jobException.getMessage(), jobException);
		}
	}
}
