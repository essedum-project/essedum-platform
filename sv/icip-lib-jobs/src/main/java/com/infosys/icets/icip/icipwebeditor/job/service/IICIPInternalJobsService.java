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

package com.infosys.icets.icip.icipwebeditor.job.service;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.List;

import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.icip.icipwebeditor.job.model.ICIPInternalJobs;
import com.infosys.icets.icip.icipwebeditor.job.model.ICIPPartialInternalJobs;
import com.infosys.icets.icip.icipwebeditor.job.util.InternalJob;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface IICIPInternalJobsService.
 *
 * @author icets
 */
public interface IICIPInternalJobsService {

	/**
	 * Save.
	 *
	 * @param iCIPInternalJobs the i CIP internal jobs
	 * @return the ICIP internal jobs
	 */
	ICIPInternalJobs save(ICIPInternalJobs iCIPInternalJobs);

	/**
	 * Find by dataset with log.
	 *
	 * @param name the dataset name
	 * @param org  the org
	 * @return the length
	 */
	Long countByDatasetAndOrganization(String name, String org);

	/**
	 * Stop running jobs.
	 */
	void stopRunningJobs();

	/**
	 * Count by job name and organization.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the long
	 */
	Long countByJobNameAndOrganization(String name, String org);

	/**
	 * Boot cleanup.
	 */
	void bootCleanup();

	/**
	 * Find by job id.
	 *
	 * @param jobId the job id
	 * @return the ICIP internal jobs
	 */
	ICIPInternalJobs findByJobId(String jobId);

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
	ICIPInternalJobs findByJobIdWithLog(String jobId, int offset, int lineno, String org, String status) throws IOException;

	/**
	 * Count by dataset and job name and organization.
	 *
	 * @param name the name
	 * @param jobName the job name
	 * @param org the org
	 * @return the long
	 */
	Long countByDatasetAndJobNameAndOrganization(String name, String jobName, String org);

	/**
	 * Find by dataset name.
	 *
	 * @param name the name
	 * @param org the org
	 * @param page the page
	 * @param size the size
	 * @return the list
	 */
	List<ICIPPartialInternalJobs> findByDatasetName(String name, String org, Integer page, Integer size);

	/**
	 * Find by dataset name and job name.
	 *
	 * @param name the name
	 * @param jobName the job name
	 * @param org the org
	 * @param valueOf the value of
	 * @param valueOf2 the value of 2
	 * @return the list
	 */
	List<ICIPPartialInternalJobs> findByDatasetNameAndJobName(String name, String jobName, String org, Integer valueOf,
			Integer valueOf2);

	/**
	 * Find by job name.
	 *
	 * @param name the name
	 * @param org the org
	 * @param page the page
	 * @param size the size
	 * @return the list
	 */
	List<ICIPPartialInternalJobs> findByJobName(String name, String org, Integer page, Integer size);

	/**
	 * Delete older data.
	 *
	 * @throws LeapException the leap exception
	 */
	void deleteOlderData() throws LeapException;

	/**
	 * Creates the internal jobs.
	 *
	 * @param jobName the job name
	 * @param uid the uid
	 * @param submittedBy the submitted by
	 * @param submittedOn the submitted on
	 * @param org the org
	 * @return the ICIP internal jobs
	 */
	ICIPInternalJobs createInternalJobs(String jobName, String uid, String submittedBy, Timestamp submittedOn,
			String org);

	/**
	 * Update internal job.
	 *
	 * @param internalJob the internal job
	 * @param status the status
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	void updateInternalJob(ICIPInternalJobs internalJob, String status) throws IOException;

	InternalJob getInternalJobService(String jobName);

	void stopRunningJob(String jobid);

}