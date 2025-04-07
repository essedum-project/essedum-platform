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
package com.infosys.icets.icip.icipwebeditor.service;

import java.sql.SQLException;
import java.util.List;

import org.quartz.SchedulerException;

import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.icip.icipwebeditor.job.model.ICIPChainJobs;
import com.infosys.icets.icip.icipwebeditor.job.model.ICIPChainJobsPartial;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface IICIPChainJobsService.
 *
 * @author icets
 */
public interface IICIPChainJobsService {

	/**
	 * Find by job id.
	 *
	 * @param jobId the job id
	 * @return the ICIP chain jobs
	 */
	ICIPChainJobs findByJobId(String jobId);

	/**
	 * Find by job name.
	 *
	 * @param jobName the job name
	 * @return the list
	 */
	List<ICIPChainJobsPartial> findByJobName(String jobName);

	/**
	 * Find by org.
	 *
	 * @param org  the org
	 * @param page the page
	 * @param size the size
	 * @return the list
	 */
	List<ICIPChainJobsPartial> findByOrg(String org, int page, int size);

	/**
	 * Find by job name and organization.
	 *
	 * @param jobName the job name
	 * @param org     the org
	 * @return the list
	 */
	List<ICIPChainJobsPartial> findByJobNameAndOrganization(String jobName, String org);

	/**
	 * Save.
	 *
	 * @param iCIPChainJobs the i CIP chain jobs
	 * @return the ICIP chain jobs
	 */
	ICIPChainJobs save(ICIPChainJobs iCIPChainJobs);

	/**
	 * Find by job name.
	 *
	 * @param jobName the job name
	 * @param page    the page
	 * @param size    the size
	 * @return the list
	 */
	List<ICIPChainJobs> findByJobName(String jobName, int page, int size);

	/**
	 * Find by job name and organization.
	 *
	 * @param jobName the job name
	 * @param org     the org
	 * @param page    the page
	 * @param size    the size
	 * @return the list
	 */
	List<ICIPChainJobs> findByJobNameAndOrganization(String jobName, String org, int page, int size);

	/**
	 * Count by name.
	 *
	 * @param name the name
	 * @return the long
	 */
	Long countByName(String name);

	/**
	 * Count by name and organization.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the long
	 */
	Long countByNameAndOrganization(String name, String org);

	/**
	 * Copy.
	 *
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @return true, if successful
	 */
	boolean copy(String fromProjectId, String toProjectId);

	/**
	 * Stop running job.
	 */
	void stopRunningJob();

	/**
	 * Find by job name and organization by submission.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP chain jobs
	 */
	ICIPChainJobs findByJobNameAndOrganizationBySubmission(String name, String org);

	/**
	 * Find by job name and organization by last submission.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP chain jobs
	 */
	ICIPChainJobs findByJobNameAndOrganizationByLastSubmission(String name, String org);

	/**
	 * Find by job name and organization.
	 *
	 * @param jobName the job name
	 * @param org     the org
	 * @param page    the page
	 * @param size    the size
	 * @return the list
	 */
	List<ICIPChainJobsPartial> findByJobNameAndOrganization1(String jobName, String org, int page, int size);

	/**
	 * Find by corelid.
	 *
	 * @param corelid the corelid
	 * @return the ICIP chain jobs
	 */
	List<ICIPChainJobsPartial> findByCorelid(String corelid);

	/**
	 * Find by hashparams.
	 *
	 * @param hashparams the hashparams
	 * @return the ICIP chain jobs
	 */
	ICIPChainJobs findByHashparams(String hashparams);

	/**
	 * Stop local job.
	 *
	 * @param jobid the jobid
	 * @throws LeapException the leap exception
	 */
	void stopLocalJob(String jobid) throws LeapException;

	/**
	 * Boot cleanup.
	 */
	void bootCleanup();

	/**
	 * Change job property.
	 *
	 * @param job             the job
	 * @param isCompleted the is completed
	 */
	void changeJobProperty(ICIPChainJobs job, boolean isCompleted);

	/**
	 * Run chain.
	 *
	 * @param jobName the job name
	 * @param org the org
	 * @param body the body
	 * @param runNow the run now
	 * @param feoffset the feoffset
	 * @return the string
	 * @throws SchedulerException the scheduler exception
	 * @throws SQLException the SQL exception
	 */
//	String runChain(String jobName, String org, String body, boolean runNow, int feoffset)
//			throws SchedulerException, SQLException;

	/**
	 * Delete older data.
	 *
	 * @throws LeapException the leap exception
	 */
	void deleteOlderData() throws LeapException;

	/**
	 * Run chain.
	 *
	 * @param jobName the job name
	 * @param org the org
	 * @param body the body
	 * @param runNow the run now
	 * @param feoffset the feoffset
	 * @return the string
	 * @throws SchedulerException the scheduler exception
	 * @throws SQLException the SQL exception
	 */
	String runChain(String jobName, String org, String body, boolean runNow, int feoffset, String datasourceName)
			throws SchedulerException, SQLException;


	void removeDuplicates(String jobName, String org);

}