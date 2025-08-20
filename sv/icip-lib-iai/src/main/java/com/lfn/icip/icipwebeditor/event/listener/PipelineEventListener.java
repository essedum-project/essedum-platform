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

import java.security.KeyException;
import java.sql.SQLException;
import java.util.HashMap;

import org.json.JSONArray;
import org.json.JSONObject;
import org.quartz.JobKey;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.quartz.SchedulerFactoryBean;
import org.springframework.stereotype.Component;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.lfn.icip.icipwebeditor.event.model.PipelineEvent;
import com.lfn.icip.icipwebeditor.event.type.EventJobType;
import com.lfn.icip.icipwebeditor.job.listener.ICIPJobSchedulerListener;
import com.lfn.icip.icipwebeditor.job.model.ChainObject;
import com.lfn.icip.icipwebeditor.job.model.ICIPChains;
import com.lfn.icip.icipwebeditor.job.model.dto.JobParamsDTO;
import com.lfn.icip.icipwebeditor.model.ICIPEventJobMapping;
import com.lfn.icip.icipwebeditor.model.ICIPStreamingServices;
import com.lfn.icip.icipwebeditor.service.IICIPChainsService;
import com.lfn.icip.icipwebeditor.service.IICIPEventJobMappingService;
import com.lfn.icip.icipwebeditor.service.IICIPStreamingServiceService;
import com.lfn.icip.icipwebeditor.service.JobScheduleService;

// TODO: Auto-generated Javadoc
// 
/**
 * The listener interface for receiving pipelineEvent events. The class that is
 * interested in processing a pipelineEvent event implements this interface, and
 * the object created with that class is registered with a component using the
 * component's <code>addPipelineEventListener<code> method. When the
 * pipelineEvent event occurs, that object's appropriate method is invoked.
 *
 * @author essedum
 */
@Component
public class PipelineEventListener {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(PipelineEventListener.class);

	/** The Constant RESTNODEID. */
	private static final String RESTNODEID = "executionID";

	/** The job scheduler service. */
	private JobScheduleService jobSchedulerService;

	/** The pipeline service. */
	private IICIPStreamingServiceService pipelineService;

	/** The job mapping service. */
	private IICIPEventJobMappingService jobMappingService;

	/** The i ICIP chains service. */
	private IICIPChainsService iICIPChainsService;

	/** The scheduler factory bean. */
	private SchedulerFactoryBean schedulerFactoryBean;

	
	/**
	 * Instantiates a new pipeline event listener.
	 *
	 * @param jobSchedulerService  the job scheduler service
	 * @param pipelineService      the pipeline service
	 * @param jobMappingService    the job mapping service
	 * @param iICIPChainsService   the i ICIP chains service
	 * @param schedulerFactoryBean the scheduler factory bean
	 */
	public PipelineEventListener(JobScheduleService jobSchedulerService, IICIPStreamingServiceService pipelineService,
			IICIPEventJobMappingService jobMappingService, IICIPChainsService iICIPChainsService,
			@Qualifier("defaultQuartz") @Lazy SchedulerFactoryBean schedulerFactoryBean) {
		super();
		this.jobSchedulerService = jobSchedulerService;
		this.pipelineService = pipelineService;
		this.jobMappingService = jobMappingService;
		this.iICIPChainsService = iICIPChainsService;
		this.schedulerFactoryBean = schedulerFactoryBean;
	}

	/**
	 * Run pipeline.
	 *
	 * @param event the event
	 * @return the JSON object
	 * @throws SchedulerException the scheduler exception
	 * @throws SQLException       the SQL exception
	 */
	private JSONObject runPipeline(PipelineEvent event) throws SchedulerException, SQLException {
		ICIPEventJobMapping eventJobMap = jobMappingService.findByEventName(event.getEventName(),
				event.getOrganization());

		String jobDetails = eventJobMap.getJobdetails();
		Gson gson = new Gson();

		JsonArray jobDetailsArray = gson.fromJson(jobDetails, JsonArray.class);
		int length = jobDetailsArray.size();
		for (int i = 0; i < length; i++) {
			JsonElement jobElement = jobDetailsArray.get(i);
			JsonObject jobObject = gson.fromJson(jobElement, JsonObject.class);

			String jobType = jobObject.get("type").getAsString();
			String jobName = jobObject.get("name").getAsString();

			String job = jobName.trim();
			if (EventJobType.valueOf(jobType.trim().toUpperCase()).equals(EventJobType.CHAIN)) {
				logger.info("Finding chain job by Name : {}", job);
				ICIPChains chain = iICIPChainsService.findByNameAndOrganization(job, eventJobMap.getOrganization());
				if (chain != null) {
					triggerChainJob(eventJobMap, chain, event.getParams(), event.getClazz(), event.getCorelid(),
							event.getSubmittedBy());
				} else {
					logger.error("Chain Job Not Found! [Name : {}]", job);
				}
			}
			if (EventJobType.valueOf(jobType.trim().toUpperCase()).equals(EventJobType.PIPELINE)) {
				logger.info("Finding pipeline by Name : {}", job);
				ICIPStreamingServices pipeline = pipelineService.getICIPStreamingServices(job,
						eventJobMap.getOrganization());
				if (pipeline != null) {
					return triggerPipeline(event, pipeline, event.isRestNode(), event.getClazz(), event.getCorelid(),
							0);
				} else {
					logger.error("Pipeline Not Found! [Name : {}]", job);
				}
			}
		}

		return null;
	}

	/**
	 * Trigger pipeline.
	 *
	 * @param event    the event
	 * @param pipeline the pipeline
	 * @param restNode the rest node
	 * @param clazz    the clazz
	 * @param corelid  the corelid
	 * @param feoffset the feoffset
	 * @return the JSON object
	 * @throws SchedulerException the scheduler exception
	 * @throws SQLException       the SQL exception
	 */
	private JSONObject triggerPipeline(PipelineEvent event, ICIPStreamingServices pipeline, boolean restNode,
			Class clazz, String corelid, int feoffset) throws SchedulerException, SQLException {
		logger.info("Found Pipeline with ID : {}", pipeline.getCid());
		JobParamsDTO body = new JobParamsDTO();
		body.setIsNative("true");
	
		body.setParams(event.getParams());
		body.setOrg(pipeline.getOrganization());
		body.setDatasourceName(event.getDatasourceName());
		logger.info("Triggering the pipeline");
		return jobSchedulerService.createSimpleJob(pipeline.getType(), pipeline.getName(), pipeline.getAlias(), body,
				true, restNode, clazz, false, corelid, true, feoffset, event.getSubmittedBy());
	}

	/**
	 * Trigger chain job.
	 *
	 * @param eventJobMap the event job map
	 * @param chain       the chain
	 * @param params      the params
	 * @param clazz       the clazz
	 * @param corelid     the corelid
	 * @throws SchedulerException the scheduler exception
	 * @throws SQLException       the SQL exception
	 */
	private void triggerChainJob(ICIPEventJobMapping eventJobMap, ICIPChains chain, String params, Class clazz,
			String corelid, String submittedBy) throws SchedulerException, SQLException {
		logger.info("Found Chain Job with ID : {}", chain.getId());
		Gson gson = new Gson();
		ChainObject.InitialJsonContent2 chainObject = gson.fromJson(chain.getJsonContent(),
				ChainObject.InitialJsonContent2.class);
		chainObject.setRunNow(true);
		chain.setJsonContent(gson.toJson(chainObject));
		logger.info("Triggering the pipeline");
		jobSchedulerService.createChainJob(chainObject.getElement().getElements(), chain, params, clazz, corelid, true,
				0, submittedBy, null);
	}

	/**
	 * On application event.
	 *
	 * @param event the event
	 */
	@EventListener
	public void onApplicationEvent(PipelineEvent event) {
		logger.info("Entered in Pipeline Event");
		try {
			JSONObject obj = runPipeline(event);
			String restNodeId = obj != null && obj.has(RESTNODEID) ? obj.getString(RESTNODEID) : "";
			if (obj != null && obj.has("jobKey") && !restNodeId.isEmpty()) {
				event.setRestNodeId(restNodeId);
				JobKey key = (JobKey) obj.get("jobKey");
				Scheduler scheduler = schedulerFactoryBean.getScheduler();
				ICIPJobSchedulerListener listener = (ICIPJobSchedulerListener) scheduler.getListenerManager()
						.getJobListener(event.getOrganization() + key);
				listener.runUntilDone();
			}
		} catch (InterruptedException ex) {
			logger.error(ex.getMessage(), ex);
			Thread.currentThread().interrupt();
		} catch (SchedulerException | SQLException e) {
			logger.error(e.getMessage(), e);
		}
	}
}
