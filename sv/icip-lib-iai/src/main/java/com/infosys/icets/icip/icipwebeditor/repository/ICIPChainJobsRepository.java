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

import com.infosys.icets.icip.icipwebeditor.job.model.ICIPChainJobs;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface ICIPChainJobsRepository.
 *
 * @author icets
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
