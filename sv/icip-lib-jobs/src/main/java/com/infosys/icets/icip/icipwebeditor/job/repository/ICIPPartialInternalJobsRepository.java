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

package com.infosys.icets.icip.icipwebeditor.job.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.PagingAndSortingRepository;

import com.infosys.icets.icip.icipwebeditor.job.model.ICIPPartialInternalJobs;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface ICIPInternalJobsRepository.
 *
 * @author icets
 */
@NoRepositoryBean
public interface ICIPPartialInternalJobsRepository
		extends PagingAndSortingRepository<ICIPPartialInternalJobs, Integer> {

	/**
	 * Find by dataset and organization.
	 *
	 * @param name the name
	 * @param org the org
	 * @param pageable the pageable
	 * @return the list
	 */
	List<ICIPPartialInternalJobs> findByDatasetAndOrganization(String name, String org, Pageable pageable);

	/**
	 * Find by dataset and job name and organization.
	 *
	 * @param name the name
	 * @param jobName the job name
	 * @param org the org
	 * @param pageable the pageable
	 * @return the list
	 */
	List<ICIPPartialInternalJobs> findByDatasetAndJobNameAndOrganization(String name, String jobName, String org,
			Pageable pageable);

	/**
	 * Find by job name and organization.
	 *
	 * @param name the name
	 * @param org the org
	 * @param paginate the paginate
	 * @return the list
	 */
	List<ICIPPartialInternalJobs> findByJobNameAndOrganization(String name, String org, Pageable paginate);

	/**
	 * Find by job status.
	 *
	 * @param status the status
	 * @return the list
	 */
	List<ICIPPartialInternalJobs> findByJobStatus(String status);

	/**
	 * Find by job id.
	 *
	 * @param jobId the job id
	 * @return the ICIP partial internal jobs
	 */
	ICIPPartialInternalJobs findByJobId(String jobId);

}
