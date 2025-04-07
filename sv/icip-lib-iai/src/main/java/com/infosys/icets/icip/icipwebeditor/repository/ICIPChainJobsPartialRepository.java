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
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.PagingAndSortingRepository;

import com.infosys.icets.icip.icipwebeditor.job.model.ICIPChainJobsPartial;

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
