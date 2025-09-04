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

import java.io.IOException;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;

import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.icip.icipwebeditor.model.ICIPJobs;
import com.lfn.icip.icipwebeditor.model.ICIPJobsPartial;
import com.lfn.icip.icipwebeditor.model.dto.IHiddenJobs;
import com.lfn.icip.icipwebeditor.model.dto.IJobLog;

import okhttp3.Response;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface IICIPJobsService.
 *
 * @author essedum
 */
public interface IICIPJobsService {

	/**
	 * Find by job id.
	 *
	 * @param jobId the job id
	 * @return the ICIP jobs
	 */
	ICIPJobs findByJobId(String jobId);

	/**
	 * Save.
	 *
	 * @param iCIPJobs the i CIP jobs
	 * @return the ICIP jobs
	 */
	ICIPJobs save(ICIPJobs iCIPJobs);

	/**
	 * Gets the all jobs.
	 *
	 * @param org  the org
	 * @param page the page
	 * @param size the size
	 * @return the all jobs
	 */
	List<ICIPJobs> getAllJobs(String org, int page, int size);

	/**
	 * Gets the jobs by service.
	 *
	 * @param servicename the servicename
	 * @param page        the page
	 * @param size        the size
	 * @param org         the org
	 * @return the jobs by service
	 */
	List<ICIPJobs> getJobsByService(String servicename, int page, int size, String org);

	/**
	 * Gets the all hidden logs.
	 *
	 * @param org the org
	 * @return the all hidden logs
	 */
	List<IHiddenJobs> getAllHiddenLogs(String org);

	/**
	 * Count by streaming service and organization.
	 *
	 * @param streamingService the streaming service
	 * @param org              the org
	 * @return the long
	 */
	Long countByStreamingServiceAndOrganization(String streamingService, String org);

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
	 * Gets the spark log.
	 *
	 * @param jobId the job id
	 * @return the spark log
	 */
	String getSparkLog(String jobId);

	/**
	 * Find by job name and organization by submission.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP jobs
	 */
	ICIPJobs findByJobNameAndOrganizationBySubmission(String name, String org);

	/**
	 * Find by job name and organization by last submission.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP jobs
	 */
	ICIPJobs findByJobNameAndOrganizationByLastSubmission(String name, String org);

	/**
	 * Gets the jobs by service.
	 *
	 * @param servicename the servicename
	 * @param page        the page
	 * @param size        the size
	 * @param org         the org
	 * @return the jobs by service
	 */
	List<ICIPJobsPartial> getJobsPartialByService(String servicename, int page, int size, String org);

	/**
	 * Gets the all jobs.
	 *
	 * @param org  the org
	 * @param page the page
	 * @param size the size
	 * @return the all jobs
	 */
	List<ICIPJobsPartial> getAllJobsPartial(String org, int page, int size);

	/**
	 * Find by corelid.
	 *
	 * @param corelid the corelid
	 * @return the ICIP jobs
	 */
	List<ICIPJobsPartial> findByCorelid(String corelid);

	/**
	 * Find by hashparams.
	 *
	 * @param hashparams the hashparams
	 * @return the ICIP jobs
	 */
	ICIPJobs findByHashparams(String hashparams);

	/**
	 * Boot cleanup.
	 */
	void bootCleanup();

	/**
	 * Delete older data.
	 *
	 * @throws EssedumException the essedum exception
	 */
	void deleteOlderData() throws EssedumException;

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
	ICIPJobs findByJobIdWithLog(String jobId, int offset, int lineno, String org, String status) throws IOException;
	ICIPJobs findByCorelIdWithLog(String corelid, int offset, int lineno, String org, String status) throws IOException;



	/**
	 * Gets the common jobs len.
	 *
	 * @param org the org
	 * @param filtercolumn the filtercolumn
	 * @param filtervalue the filtervalue
	 * @param filterdate the filterdate
	 * @return the common jobs len
	 */
	Long getCommonJobsLen(String org, String filtercolumn, String filtervalue, String filterdate,String tz);

	/**
	 * Gets the all common jobs.
	 *
	 * @param org  the org
	 * @param page the page
	 * @param size the size
	 * @param filtercolumn the filtercolumn
	 * @param filtervalue the filtervalue
	 * @param filterdate the filterdate
	 * @param sortcolumn the sortcolumn
	 * @param direction the direction
	 * @return the all common jobs
	 */
	List<IJobLog> getAllCommonJobs(String org, int page, int size, String filtercolumn, String filtervalue,
			String filterdate, String tz, String sortcolumn, String direction);

	/**
	 * Gets the jobs status.
	 *
	 * @param jobid the jobid
	 * @return the jobs status
	 */
	String getJobStatus(String jobid);

	/**
	 * Gets the event status.
	 *
	 * @param corelid the correlationid
	 * @return the event status
	 */
	String getEventStatus(String corelid);

	String getCsvData(String colsToDownload, String org);
	
	String getAllRemoteJobs(String url) throws EssedumException;
	
	String getLogData(String url,String jobId) throws EssedumException;
	
	String stopRemoteJob(String url,String jobId) throws EssedumException;
	
	List<ICIPJobsPartial> getAllCommonJobsPartial(String org, int page, int size);

}
