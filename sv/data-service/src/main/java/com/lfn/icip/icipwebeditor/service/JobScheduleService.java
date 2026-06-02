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

package com.lfn.icip.icipwebeditor.service;

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;

import org.json.JSONObject;
import org.quartz.JobDataMap;
import org.quartz.JobDetail;
import org.quartz.SchedulerException;
import org.quartz.Trigger;

import com.lfn.icip.icipwebeditor.job.model.ChainObject.ChainJobElement2.ChainJob2;
import com.lfn.icip.icipwebeditor.job.model.ICIPChains;
import com.lfn.icip.icipwebeditor.job.model.JobCredentials;
import com.lfn.icip.icipwebeditor.job.model.JobModel;
import com.lfn.icip.icipwebeditor.job.model.JobModel.JobProperties;
import com.lfn.icip.icipwebeditor.job.model.JobModel.RestProperties;
import com.lfn.icip.icipwebeditor.job.model.dto.JobModelDTO;
import com.lfn.icip.icipwebeditor.job.model.dto.JobModelDTO.QuartzProperties;
import com.lfn.icip.icipwebeditor.job.model.dto.JobModelDTO.QuartzProperties.QuartzJobDetails;
import com.lfn.icip.icipwebeditor.job.model.dto.JobParamsDTO;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface JobScheduleService.
 *
 * @author essedum
 */
public interface JobScheduleService {

	/**
	 * Builds the cron job trigger.
	 *
	 * @param jobDetail  the job detail
	 * @param startAt    the start at
	 * @param expression the expression
	 * @param trigger    the trigger
	 * @param jobDesc    the job desc
	 * @return the trigger
	 */
	Trigger buildCronJobTrigger(JobDetail jobDetail, ZonedDateTime startAt, String expression, Trigger trigger,
			String jobDesc);

	/**
	 * Builds the job trigger.
	 *
	 * @param jobDetail the job detail
	 * @param startAt   the start at
	 * @param trigger   the trigger
	 * @param jobDesc   the job desc
	 * @return the trigger
	 */
	Trigger buildSimpleJobTrigger(JobDetail jobDetail, ZonedDateTime startAt, Trigger trigger, String jobDesc);

	/**
	 * Gets the job by name.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the job by name
	 * @throws SchedulerException the scheduler exception
	 */
	JobModelDTO getJobByQuartzJobId(String name, String org) throws SchedulerException;

	/**
	 * Delete job.
	 *
	 * @param jobName  the job name
	 * @param jobGroup the job group
	 * @return true, if successful
	 */
	boolean deleteJob(String jobName, String jobGroup);

	/**
	 * Stop job.
	 *
	 * @param jobKey   the job key
	 * @param groupKey the group key
	 * @return true, if successful
	 */
	boolean stopJob(String jobKey, String groupKey);

	/**
	 * Initialize quartz scheduler.
	 *
	 * @param org the org
	 */
	void initializeQuartzScheduler(String org);

	/**
	 * Pause job.
	 *
	 * @param jobName  the job name
	 * @param jobGroup the job group
	 * @param flag     the flag
	 * @return true, if successful
	 * @throws SchedulerException the scheduler exception
	 */
	boolean pauseJob(String jobName, String jobGroup, boolean flag) throws SchedulerException;

	/**
	 * Generate job schedule object.
	 *
	 * @param jobCredentials the job credentials
	 * @param jobProperties  the job properties
	 * @param restProperties the rest properties
	 * @return the job model
	 */
	List<JobModel> generateJobModelList(List<JobCredentials> jobCredentials, List<JobProperties> jobProperties,
			List<RestProperties> restProperties);

	/**
	 * Find all jobs.
	 *
	 * @param org the org
	 * @param offset the offset
	 * @param search the search
	 * @return the list
	 * @throws SchedulerException the scheduler exception
	 * @throws SQLException the SQL exception
	 */
	List<JobModelDTO> findAllJobs(String org, int offset, String search) throws SchedulerException, SQLException;

	/**
	 * Builds the quartz job detail.
	 *
	 * @param jobSchedules the job schedules
	 * @param groupName the group name
	 * @param clazz the clazz
	 * @param jobDesc the job desc
	 * @param isAgent the is agent
	 * @param isChain the is chain
	 * @param corelid the corelid
	 * @param jobname the jobname
	 * @param isParallel the is parallel
	 * @param isEvent the is event
	 * @param isRunNow the is run now
	 * @param alias the alias
	 * @return the job detail
	 */
	JobDetail buildQuartzJobDetail(List<JobModel> jobSchedules, String groupName, Class clazz, String jobDesc,
			boolean isAgent, boolean isChain, String corelid, String jobname, boolean isParallel, boolean isEvent,
			boolean isRunNow, String alias);

	/**
	 * Generate job model DTO.
	 *
	 * @param cname the cname
	 * @param alias the alias
	 * @param runtime the runtime
	 * @param repeatType the repeat type
	 * @param quartzProperties the quartz properties
	 * @return the job model DTO
	 */
	JobModelDTO generateJobModelDTO(String cname, String alias, String runtime, String repeatType,
			QuartzProperties quartzProperties,int jobTimeout, String remoteDatasourceName, String scheduleType);

	/**
	 * Creates the simple job.
	 *
	 * @param runtime  the runtime
	 * @param cname    the cname
	 * @param alias the alias
	 * @param body     the body
	 * @param runNow   the run now
	 * @param restNode the rest node
	 * @param clazz    the clazz
	 * @param isAgent  the is agent
	 * @param corelid  the corelid
	 * @param isEvent the is event
	 * @param feoffset the feoffset
	 * @return the JSON object
	 * @throws SchedulerException the scheduler exception
	 * @throws SQLException       the SQL exception
	 */
	JSONObject createSimpleJob(String runtime, String cname, String alias, JobParamsDTO body, boolean runNow,
			boolean restNode, Class clazz, boolean isAgent, String corelid, boolean isEvent, int feoffset, String submittedBy)
			throws SchedulerException, SQLException;

	/**
	 * Update one time job.
	 *
	 * @param quartzJobDetails the quartz job details
	 * @param date             the date
	 * @param timezone         the timezone
	 * @param cronExpression   the cron expression
	 * @param class            the job class type
	 * @param corelid          the corelid
	 * @param feoffset the feoffset
	 * @return true, if successful
	 * @throws SchedulerException the scheduler exception
	 * @throws SQLException       the SQL exception
	 */
	JSONObject updateJob(QuartzJobDetails quartzJobDetails, LocalDateTime date, String timezone, String cronExpression,
			Class classType, String corelid, int feoffset,int jobTimeout, String datasource) throws SchedulerException, SQLException;

	/**
	 * Retry job.
	 *
	 * @param name the name
	 * @param org the org
	 * @param type the type
	 * @param isLocal the is local
	 * @param feoffset the feoffset
	 * @throws Exception the exception
	 */
	void retryJob(String name, String org, String type, String isLocal, int feoffset, String datasourceName) throws Exception;

	/**
	 * Creates the chain job.
	 *
	 * @param jobs         the jobs
	 * @param icipChains   the icip chains
	 * @param params       the params
	 * @param clazz        the clazz
	 * @param corelid      the corelid
	 * @param isEvent the is event
	 * @param feoffset the feoffset
	 * @return the JSON object
	 * @throws SchedulerException the scheduler exception
	 * @throws SQLException       the SQL exception
	 */
//	JSONObject createChainJob(ChainJob2[] jobs, ICIPChains icipChains, String params, Class clazz, String corelid,
//			boolean isEvent, int feoffset, String submittedBy) throws SchedulerException, SQLException;

	JobModelDTO getJobByCorelId(String corelId, String org) throws SchedulerException;

	/**
	 * Gets all scheduled jobs data by org.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the job by name
	 * @throws SchedulerException the scheduler exception
	 */
	List<JobDataMap> getScheduledJobsData(String org) throws SchedulerException;

	/**
	 * Creates the chain job.
	 *
	 * @param jobs       the jobs
	 * @param icipChains the icip chains
	 * @param params     the params
	 * @param clazz      the clazz
	 * @param corelid    the corelid
	 * @param isEvent    the is event
	 * @param feoffset   the feoffset
	 * @return the JSON object
	 * @throws SchedulerException the scheduler exception
	 * @throws SQLException       the SQL exception
	 */
	JSONObject createChainJob(ChainJob2[] jobs, ICIPChains icipChains, String params, Class clazz, String corelid,
			boolean isEvent, int feoffset, String submittedBy, JSONObject datasourceName)
			throws SchedulerException, SQLException;



}
