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

package com.lfn.icip.icipwebeditor.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.PagingAndSortingRepository;

import com.lfn.icip.icipwebeditor.model.ICIPJobs;
import com.lfn.icip.icipwebeditor.model.dto.IHiddenJobs;
import com.lfn.icip.icipwebeditor.model.dto.IJobLog;

// TODO: Auto-generated Javadoc
// 
/**
 * Spring Data JPA repository for the SchemaRegistry entity.
 */
/**
 * @author essedum
 */
@NoRepositoryBean
public interface ICIPJobsRepository extends PagingAndSortingRepository<ICIPJobs, Integer>, CrudRepository<ICIPJobs, Integer> {

	/**
	 * Find by job id.
	 *
	 * @param jobId the job id
	 * @return the ICIP jobs
	 */
	ICIPJobs findByJobId(String jobId);

	/**
	 * Find by organization.
	 *
	 * @param org      the org
	 * @param pageable the pageable
	 * @return the page
	 */
	Page<ICIPJobs> findByOrganization(String org, Pageable pageable);

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
	 * Gets the all common jobs.
	 *
	 * @param org    the org
	 * @param filtercolumn the filtercolumn
	 * @param filtervalue the filtervalue
	 * @param filterdate the filterdate
	 * @param page the page
	 * @return the all common jobs
	 */
	List<IJobLog> getAllCommonJobs(String org, String filtercolumn, String filtervalue, String filterdate,String tz,
			Pageable page);
	
	List<IJobLog> getAllCommonJobsnew(String org, String filtercolumn, String filtervalue, String filterdate,
			Pageable page);
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
	
	Long getCommonJobsLenNew(String org, String filtercolumn, String filtervalue, String filterdate);

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
	 * Find by hashparams.
	 *
	 * @param hashparams the hashparams
	 * @return the ICIP jobs
	 */
	ICIPJobs findByHashparams(String hashparams);

	/**
	 * Gets the all hidden logs.
	 *
	 * @param org the org
	 * @return the all hidden logs
	 */
	List<IHiddenJobs> getAllHiddenLogs(String org);

	/**
	 * Delete older data.
	 *
	 * @param days the days
	 */
	void deleteOlderData(int days);

	String getJobStatus(String jobid);
	
	String getEventStatus(String corelid);

	List<IJobLog> getCsvBySelectedColumnNames(String org, String filtercolumn, String filtervalue, String filterdate);

}
