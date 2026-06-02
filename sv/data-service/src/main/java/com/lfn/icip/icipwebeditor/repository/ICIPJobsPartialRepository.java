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

import com.lfn.icip.icipwebeditor.model.ICIPJobsPartial;

// TODO: Auto-generated Javadoc
// 
/**
 * Spring Data JPA repository for the SchemaRegistry entity.
 */
/**
 * @author essedum
 */
@NoRepositoryBean
public interface ICIPJobsPartialRepository extends PagingAndSortingRepository<ICIPJobsPartial, Integer> {

	/**
	 * Find by organization.
	 *
	 * @param org      the org
	 * @param pageable the pageable
	 * @return the page
	 */
	Page<ICIPJobsPartial> findByOrganization(String org, Pageable pageable);

	/**
	 * Find by streaming service and organization.
	 *
	 * @param streamingService the streaming service
	 * @param org              the org
	 * @param pageable         the pageable
	 * @return the list
	 */
	List<ICIPJobsPartial> findByStreamingServiceAndOrganization(String streamingService, String org, Pageable pageable);

	/**
	 * Find by correlationid.
	 *
	 * @param corelid the corelid
	 * @return the list
	 */
	List<ICIPJobsPartial> findByCorrelationid(String corelid);

	/**
	 * Find by job status.
	 *
	 * @param status the status
	 * @return the list
	 */
	List<ICIPJobsPartial> findByJobStatus(String status);

	/**
	 * Find by organization.
	 *
	 * @param fromProjectId the from project id
	 * @return the list
	 */
	List<ICIPJobsPartial> findByOrganization(String fromProjectId);

	/**
	 * Find by job id.
	 *
	 * @param jobId the job id
	 * @return the ICIP jobs partial
	 */
	ICIPJobsPartial findByJobId(String jobId);
	ICIPJobsPartial findByCorelId(String corelId);

	ICIPJobsPartial findByJobIdBuffered(String jobId, long l, long m);
	ICIPJobsPartial findByCorelIdBuffered(String corelid, long l, long m);
	
	
	
	List<ICIPJobsPartial> getAllJobs();

}
