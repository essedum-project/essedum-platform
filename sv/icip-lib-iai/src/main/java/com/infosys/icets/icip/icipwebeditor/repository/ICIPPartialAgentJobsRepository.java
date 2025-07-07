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

import com.infosys.icets.icip.icipwebeditor.model.ICIPPartialAgentJobs;

// TODO: Auto-generated Javadoc
// 
/**
 * Spring Data JPA repository for the SchemaRegistry entity.
 */
/**
 * @author icets
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
