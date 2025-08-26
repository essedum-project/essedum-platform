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

package com.infosys.icets.icip.icipwebeditor.job.executor;

import java.util.concurrent.Executors;
import java.util.concurrent.ThreadPoolExecutor;

import org.springframework.stereotype.Component;

import com.infosys.icets.icip.icipwebeditor.job.service.impl.QuartzService;
import com.infosys.icets.icip.icipwebeditor.jobmodel.service.ICIPAgentJobsService;
import com.infosys.icets.icip.icipwebeditor.jobmodel.service.ICIPChainJobsService;
import com.infosys.icets.icip.icipwebeditor.jobmodel.service.ICIPInternalJobsService;
import com.infosys.icets.icip.icipwebeditor.jobmodel.service.ICIPJobsService;

import liquibase.pro.packaged.q;
import lombok.extern.log4j.Log4j2;

// TODO: Auto-generated Javadoc
/**
 * The Class StartupCleaner.
 */
@Component

/** The Constant log. */
@Log4j2
public class StartupCleaner {

	/**
	 * Instantiates a new startup cleaner.
	 *
	 * @param jobService the job service
	 * @param chainService the chain service
	 * @param internalJobService the internal job service
	 * @param agentService the agent service
	 * @param quartzService the quartz service
	 */
	public StartupCleaner(ICIPJobsService jobService, ICIPChainJobsService chainService,
			ICIPInternalJobsService internalJobService, ICIPAgentJobsService agentService,
			QuartzService quartzService) {
		ThreadPoolExecutor scheduler = (ThreadPoolExecutor) Executors.newFixedThreadPool(1);
		scheduler.execute(new CleanupTask(jobService, chainService, internalJobService, agentService,quartzService));
//		scheduler.execute(new RescheduleTask(quartzService));
		scheduler.shutdown();
	}

	/**
	 * The Class CleanupTask.
	 */
	public class CleanupTask implements Runnable {

		/** The job service. */
		private ICIPJobsService jobService;
		
		/** The chain service. */
		private ICIPChainJobsService chainService;
		
		/** The internal job service. */
		private ICIPInternalJobsService internalJobService;
		
		/** The agent service. */
		private ICIPAgentJobsService agentService;
		
		/** The quartz service. */
		private QuartzService quartzService;
		
		/**
		 * Instantiates a new cleanup task.
		 *
		 * @param jobService the job service
		 * @param chainService the chain service
		 * @param internalJobService the internal job service
		 * @param agentService the agent service
		 */
		public CleanupTask(ICIPJobsService jobService, ICIPChainJobsService chainService,
				ICIPInternalJobsService internalJobService, ICIPAgentJobsService agentService,QuartzService quartzService) {
			this.jobService = jobService;
			this.chainService = chainService;
			this.internalJobService = internalJobService;
			this.agentService = agentService;
			this.quartzService= quartzService;
		}

		/**
		 * Run.
		 */
		@Override
		public void run() {
			Thread.currentThread().setPriority(8);
			log.info("Running the boot cleanup with jobstopExec Deleted and bootcleanup and rescheudle in same thread...");
			try {
				this.jobService.bootCleanup();
				this.chainService.bootCleanup();
				this.internalJobService.bootCleanup();
				this.agentService.bootCleanup();
			} catch (Exception e) {
				log.error(e.getMessage(), e);
			}
			log.info("boot cleanup done...");
			log.info("Rescheduling existing schedules in the same Thread ...");
			try {
				quartzService.rescheduleExistingSchedules(null);
				log.info("rescheduling completed same Thread...");
			} catch (Exception e) {
				log.error("Error in rescheduling same Thread: {}", e.getMessage());
			}
		}

	}

	/**
	 * The Class RescheduleTask.
	 */
	public class RescheduleTask implements Runnable {

		/** The quartz service. */
		private QuartzService quartzService;

		/**
		 * Instantiates a new reschedule task.
		 *
		 * @param quartzService the quartz service
		 */
		public RescheduleTask(QuartzService quartzService) {
			this.quartzService = quartzService;
		}

		/**
		 * Run.
		 */
		@Override
		public void run() {
			try {
				Thread.sleep(60000);
			} catch (InterruptedException e) {
				log.error(e.getMessage());
			}
			Thread.currentThread().setPriority(8);
			log.info("Rescheduling existing schedules ...");
			try {
				quartzService.rescheduleExistingSchedules(null);
				log.info("rescheduling completed...");
			} catch (Exception e) {
				log.error("Error in rescheduling : {}", e.getMessage());
			}
		}

	}

}
