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

import java.io.IOException;
import java.util.List;

import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.icip.icipwebeditor.model.ICIPAgentJobs;
import com.infosys.icets.icip.icipwebeditor.model.ICIPPartialAgentJobs;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface IICIPAgentJobsService.
 *
 * @author icets
 */
public interface IICIPAgentJobsService {

	/**
	 * Find by job id.
	 *
	 * @param jobId the job id
	 * @return the ICIP jobs
	 */
	ICIPAgentJobs findByJobId(String jobId);

	/**
	 * Save.
	 *
	 * @param iCIPAgentJobs the i CIP agent jobs
	 * @return the ICIP jobs
	 */
	ICIPAgentJobs save(ICIPAgentJobs iCIPAgentJobs);

	/**
	 * Gets the all jobs.
	 *
	 * @param org  the org
	 * @param page the page
	 * @param size the size
	 * @return the all jobs
	 */
	List<ICIPPartialAgentJobs> getAllJobs(String org, int page, int size);

	/**
	 * Gets the jobs by service.
	 *
	 * @param name the name
	 * @param page the page
	 * @param size the size
	 * @param org  the org
	 * @return the jobs by service
	 */
	List<ICIPPartialAgentJobs> getJobsByService(String name, int page, int size, String org);

	/**
	 * Count by streaming service and organization.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the long
	 */
	Long countByCnameAndOrganization(String name, String org);

	/**
	 * Count by organization.
	 *
	 * @param org the org
	 * @return the long
	 */
	Long countByOrganization(String org);

	/**
	 * Rename project.
	 *
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @return true, if successful
	 */
	boolean renameProject(String fromProjectId, String toProjectId);

	/**
	 * Copy.
	 *
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @return true, if successful
	 */
	boolean copy(String fromProjectId, String toProjectId);

	/**
	 * Find by job name and organization by submission.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP agent jobs
	 */
	ICIPAgentJobs findByJobNameAndOrganizationBySubmission(String name, String org);

	/**
	 * Find by job name and organization by last submission.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP agent jobs
	 */
	ICIPAgentJobs findByJobNameAndOrganizationByLastSubmission(String name, String org);

	/**
	 * Change job property.
	 *
	 * @param job the job
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	void changeJobProperty(ICIPAgentJobs job) throws IOException;

	/**
	 * Find by corelid.
	 *
	 * @param corelid the corelid
	 * @return the ICIP agent jobs
	 */
	List<ICIPPartialAgentJobs> findByCorelid(String corelid);

	/**
	 * Find by hashparams.
	 *
	 * @param hashparams the hashparams
	 * @return the ICIP agent jobs
	 */
	ICIPAgentJobs findByHashparams(String hashparams);

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
	 * Delete older data.
	 *
	 * @throws LeapException the leap exception
	 */
	void deleteOlderData() throws LeapException;

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
	ICIPAgentJobs findByJobIdWithLog(String jobId, int offset, int lineno, String org, String status) throws IOException;
}
