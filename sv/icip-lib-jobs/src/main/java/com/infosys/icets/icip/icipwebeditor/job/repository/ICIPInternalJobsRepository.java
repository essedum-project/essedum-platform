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

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.PagingAndSortingRepository;

import com.infosys.icets.icip.icipwebeditor.job.model.ICIPInternalJobs;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface ICIPInternalJobsRepository.
 *
 * @author icets
 */
@NoRepositoryBean
public interface ICIPInternalJobsRepository extends PagingAndSortingRepository<ICIPInternalJobs, Integer> , CrudRepository<ICIPInternalJobs, Integer>{

	/**
	 * Find by job id.
	 *
	 * @param jobId the job id
	 * @return the ICIP internal jobs
	 */
	ICIPInternalJobs findByJobId(String jobId);

	/**
	 * Count by dataset and organization.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the long
	 */
	Long countByDatasetAndOrganization(String name, String org);

	/**
	 * Count by job name and organization.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the long
	 */
	Long countByJobNameAndOrganization(String name, String org);

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
	 * Delete older data.
	 *
	 * @param days the days
	 */
	void deleteOlderData(int days);

}
