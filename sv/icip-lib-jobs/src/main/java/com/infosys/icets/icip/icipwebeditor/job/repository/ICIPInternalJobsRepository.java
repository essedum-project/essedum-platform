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
