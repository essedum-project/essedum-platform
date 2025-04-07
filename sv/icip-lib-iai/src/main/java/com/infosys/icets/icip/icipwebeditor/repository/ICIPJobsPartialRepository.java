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
package com.infosys.icets.icip.icipwebeditor.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.PagingAndSortingRepository;

import com.infosys.icets.icip.icipwebeditor.model.ICIPJobsPartial;

// TODO: Auto-generated Javadoc
// 
/**
 * Spring Data JPA repository for the SchemaRegistry entity.
 */
/**
 * @author icets
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
