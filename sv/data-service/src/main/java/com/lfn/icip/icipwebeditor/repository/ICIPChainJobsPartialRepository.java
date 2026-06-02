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

import com.lfn.icip.icipwebeditor.job.model.ICIPChainJobsPartial;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPChainJobsPartialRepository.
 */
@NoRepositoryBean
public interface ICIPChainJobsPartialRepository extends PagingAndSortingRepository<ICIPChainJobsPartial, Integer>,CrudRepository<ICIPChainJobsPartial, Integer> {

	/**
	 * Find by job name and organization.
	 *
	 * @param jobName the job name
	 * @param org the org
	 * @param pageable the pageable
	 * @return the page
	 */
	List<ICIPChainJobsPartial> findByJobNameAndOrganization(String jobName, String org,int limit, int offset);

	/**
	 * Find by correlationid.
	 *
	 * @param corelid the corelid
	 * @return the list
	 */
	List<ICIPChainJobsPartial> findByCorrelationid(String corelid);

	/**
	 * Find by job name and organization.
	 *
	 * @param jobName the job name
	 * @param org the org
	 * @return the list
	 */
	List<ICIPChainJobsPartial> findByJobNameAndOrganization(String jobName, String org);

	/**
	 * Find by organization.
	 *
	 * @param org the org
	 * @return the list
	 */
	List<ICIPChainJobsPartial> findByOrganization(String org);

	/**
	 * Find by organization.
	 *
	 * @param org the org
	 * @param pageable the pageable
	 * @return the list
	 */
	List<ICIPChainJobsPartial> findByOrganization(String org, Pageable pageable);

	/**
	 * Find by job name.
	 *
	 * @param jobName the job name
	 * @return the list
	 */
	List<ICIPChainJobsPartial> findByJobName(String jobName);

	/**
	 * Find by job status.
	 *
	 * @param status the status
	 * @return the list
	 */
	List<ICIPChainJobsPartial> findByJobStatus(String status);
	
	ICIPChainJobsPartial findByJobId(String jobId);

}
