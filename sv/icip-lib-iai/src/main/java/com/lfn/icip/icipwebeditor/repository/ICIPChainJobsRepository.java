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

import com.lfn.icip.icipwebeditor.job.model.ICIPChainJobs;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface ICIPChainJobsRepository.
 *
 * @author essedum
 */
@NoRepositoryBean
public interface ICIPChainJobsRepository extends PagingAndSortingRepository<ICIPChainJobs, Integer>, CrudRepository<ICIPChainJobs, Integer> {

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
	 * @param jobName  the job name
	 * @param pageable the pageable
	 * @return the page
	 */
	Page<ICIPChainJobs> findByJobName(String jobName, Pageable pageable);

	/**
	 * Find by job name and organization.
	 *
	 * @param jobName  the job name
	 * @param org      the org
	 * @param pageable the pageable
	 * @return the page
	 */
	Page<ICIPChainJobs> findByJobNameAndOrganization(String jobName, String org, Pageable pageable);

	/**
	 * Count by job name.
	 *
	 * @param name the name
	 * @return the long
	 */
	Long countByJobName(String name);

	/**
	 * Count by job name and organization.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the long
	 */
	Long countByJobNameAndOrganization(String name, String org);

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
	 * Find by hashparams.
	 *
	 * @param hashparams the hashparams
	 * @return the ICIP chain jobs
	 */
	ICIPChainJobs findByHashparams(String hashparams);

	/**
	 * Delete older data.
	 *
	 * @param days the days
	 */
	void deleteOlderData(int days);
	
	List<ICIPChainJobs> findByCorrelationId(String correlationId, String org);

	List<ICIPChainJobs> findByJobNameAndOrganization(String name,String org);
}
