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

package com.lfn.icip.icipwebeditor.event.listener;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.TimeZone;
import java.util.UUID;

import org.quartz.CronScheduleBuilder;
import org.quartz.JobBuilder;
import org.quartz.JobDataMap;
import org.quartz.JobDetail;
import org.quartz.ScheduleBuilder;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.SimpleScheduleBuilder;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.quartz.impl.matchers.KeyMatcher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.quartz.SchedulerFactoryBean;
import org.springframework.stereotype.Component;

import com.google.gson.Gson;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.icip.icipwebeditor.event.model.InternalEvent;
import com.lfn.icip.icipwebeditor.job.enums.JobType;
import com.lfn.icip.icipwebeditor.job.enums.RuntimeType;
import com.lfn.icip.icipwebeditor.job.listener.ICIPJobSchedulerListener;
import com.lfn.icip.icipwebeditor.job.model.dto.JobObjectDTO;
import com.lfn.icip.icipwebeditor.job.model.dto.JobObjectDTO.Jobs;

// TODO: Auto-generated Javadoc
// 
/**
 * The listener interface for receiving internalEvent events. The class that is
 * interested in processing a internalEvent event implements this interface, and
 * the object created with that class is registered with a component using the
 * component's <code>addInternalEventListener<code> method. When the
 * internalEvent event occurs, that object's appropriate method is invoked.
 *
 * @author essedum
 */
@Component
public class InternalEventListener {

	/** The Constant JOBBUILDERDESC. */
	private static final String JOBBUILDERDESC = "Job Scheduled";

	/** The Constant UNABLE_TO_PROCEED_IN_STANDBY_MODE. */
	private static final String UNABLE_TO_PROCEED_IN_STANDBY_MODE = "Unable to proceed in standby mode";

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(InternalEventListener.class);

	/** The scheduler factory bean. */
	@Autowired
	@Qualifier("defaultQuartz")
	@Lazy
	private SchedulerFactoryBean schedulerFactoryBean;

	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;

	/**
	 * Trigger internal.
	 *
	 * @param event the event
	 * @return the JSON object
	 * @throws SchedulerException the scheduler exception
	 */
	private void triggerInternal(InternalEvent event) throws SchedulerException {
		logger.info("Triggering internal job : {}", event.getEventName());
		this.createInternalJob(event);
	}

	/**
	 * On application event.
	 *
	 * @param event the event
	 */
	@Async
	@EventListener
	public void onApplicationEvent(InternalEvent event) {
		try {
			this.triggerInternal(event);
		} catch (SchedulerException e) {
			logger.error(e.getMessage());
		}
	}

	/**
	 * Creates the internal job.
	 *
	 * @param event the event
	 * @return the JSON object
	 * @throws SchedulerException the scheduler exception
	 */
	private void createInternalJob(InternalEvent event) throws SchedulerException {
		logger.info("Creating an internal Job");
		Scheduler scheduler = schedulerFactoryBean.getScheduler();
		if (scheduler.isInStandbyMode()) {
			throw new SchedulerException(UNABLE_TO_PROCEED_IN_STANDBY_MODE);
		}
		List<Jobs> jobs = new LinkedList<>();
		jobs.add(new Jobs(event.getEventName(), RuntimeType.INTERNAL, "", false, null));
		JobObjectDTO jobObjectDTO = new JobObjectDTO(UUID.randomUUID().toString(), event.getEventName(),
				event.getOrganization(), event.getEventName(), ICIPUtils.getUser(claim), jobs, JobType.INTERNAL, null,
				event.getExpression(), false, false, false, false,0);
		Integer interval = null;
		if(event.getParams().containsKey("intervalInHours")){
		try {
		interval = Integer.parseInt(event.getParams().get("intervalInHours").toString());
		}catch(Exception ex) {
			logger.error("Invalid interval value");
		}
		event.getParams().remove("intervalInHours");	
		}
		JobDataMap jobData = new JobDataMap(event.getParams());
		jobData.put("JOB", new Gson().toJson(jobObjectDTO));
		jobData.put("jobTimeout", event.getJobTimeout());
		JobDetail jobDetail = JobBuilder.newJob(event.getInternalClass())
				.withIdentity(UUID.randomUUID().toString(), event.getOrganization()).withDescription(JOBBUILDERDESC)
				.usingJobData(jobData).storeDurably().build();

		String name = jobDetail.getKey().getName();
		String org = jobDetail.getKey().getGroup();
		Date date = !event.isRunnow() && event.getStartAt() != null ? Date.from(event.getStartAt().toInstant())
				: Date.from(Instant.now());
		if(event.getStartAt()==null)	event.setStartAt(ZonedDateTime.ofInstant(date.toInstant(), ZoneId.systemDefault()));
		ScheduleBuilder scheduleBuilder = !event.isRunnow() && event.isCron()
				? CronScheduleBuilder.cronSchedule(event.getExpression()).withMisfireHandlingInstructionFireAndProceed().inTimeZone(TimeZone.getTimeZone(ZoneId.ofOffset("", event.getStartAt().getOffset())))
						: interval!=null 
							? SimpleScheduleBuilder.simpleSchedule().withIntervalInHours(interval).repeatForever().withMisfireHandlingInstructionFireNow()
							: SimpleScheduleBuilder.simpleSchedule().withMisfireHandlingInstructionFireNow();		
		Trigger trigger = TriggerBuilder.newTrigger().forJob(jobDetail).withIdentity(name, org).startAt(date).withSchedule(scheduleBuilder).build();
		scheduler.getListenerManager().addJobListener(
				new ICIPJobSchedulerListener("InternalJobListener-" + jobDetail.getKey()),
				KeyMatcher.keyEquals(jobDetail.getKey()));
		scheduler.scheduleJob(jobDetail, trigger);
	}

}
