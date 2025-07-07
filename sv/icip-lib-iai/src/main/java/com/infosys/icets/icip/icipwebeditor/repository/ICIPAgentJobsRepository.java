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

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.PagingAndSortingRepository;

import com.infosys.icets.icip.icipwebeditor.model.ICIPAgentJobs;

// TODO: Auto-generated Javadoc
// 
/**
 * Spring Data JPA repository for the SchemaRegistry entity.
 */
/**
 * @author icets
 */
@NoRepositoryBean
public interface ICIPAgentJobsRepository extends PagingAndSortingRepository<ICIPAgentJobs, Integer>, CrudRepository<ICIPAgentJobs, Integer> {

	/**
	 * Find by job id.
	 *
	 * @param jobId the job id
	 * @return the ICIP jobs
	 */
	ICIPAgentJobs findByJobId(String jobId);

	/**
	 * Find by organization.
	 *
	 * @param org      the org
	 * @param pageable the pageable
	 * @return the page
	 */
	Page<ICIPAgentJobs> findByOrganization(String org, Pageable pageable);

	/**
	 * Count by streaming service and organization.
	 *
	 * @param cname the cname
	 * @param org   the org
	 * @return the long
	 */
	Long countByCnameAndOrganization(String cname, String org);

	/**
	 * Count by organization.
	 *
	 * @param org the org
	 * @return the long
	 */
	Long countByOrganization(String org);

	/**
	 * Find by job name and organization by submission.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP agent jobs
	 */
	ICIPAgentJobs findByJobNameAndOrganizationBySubmission(String name, String org);

	/**
	 * Find by job name and organization by last submission.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP agent jobs
	 */
	ICIPAgentJobs findByJobNameAndOrganizationByLastSubmission(String name, String org);

	/**
	 * Find by hashparams.
	 *
	 * @param hashparams the hashparams
	 * @return the ICIP agent jobs
	 */
	ICIPAgentJobs findByHashparams(String hashparams);

	/**
	 * Delete older data.
	 *
	 * @param days the days
	 */
	void deleteOlderData(int days);

}
