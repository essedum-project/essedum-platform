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
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.PagingAndSortingRepository;

import com.lfn.icip.icipwebeditor.model.ICIPPartialAgentJobs;

// TODO: Auto-generated Javadoc
// 
/**
 * Spring Data JPA repository for the SchemaRegistry entity.
 */
/**
 * @author essedum
 */
@NoRepositoryBean
public interface ICIPPartialAgentJobsRepository extends PagingAndSortingRepository<ICIPPartialAgentJobs, Integer> {

	/**
	 * Find by organization.
	 *
	 * @param org the org
	 * @param pageable the pageable
	 * @return the page
	 */
	Page<ICIPPartialAgentJobs> findByOrganization(String org, Pageable pageable);

	/**
	 * Find by cname and organization.
	 *
	 * @param cname the cname
	 * @param org the org
	 * @param pageable the pageable
	 * @return the list
	 */
	List<ICIPPartialAgentJobs> findByCnameAndOrganization(String cname, String org, Pageable pageable);

	/**
	 * Find by correlationid.
	 *
	 * @param corelid the corelid
	 * @return the list
	 */
	List<ICIPPartialAgentJobs> findByCorrelationid(String corelid);

	/**
	 * Find by organization.
	 *
	 * @param fromProjectId the from project id
	 * @return the list
	 */
	List<ICIPPartialAgentJobs> findByOrganization(String fromProjectId);

	/**
	 * Find by job status.
	 *
	 * @param status the status
	 * @return the list
	 */
	List<ICIPPartialAgentJobs> findByJobStatus(String status);

	/**
	 * Find by job id.
	 *
	 * @param jobId the job id
	 * @return the ICIP partial agent jobs
	 */
	ICIPPartialAgentJobs findByJobId(String jobId);

}
