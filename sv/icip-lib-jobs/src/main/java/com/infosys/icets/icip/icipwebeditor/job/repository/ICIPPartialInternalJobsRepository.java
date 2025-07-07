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

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.PagingAndSortingRepository;

import com.infosys.icets.icip.icipwebeditor.job.model.ICIPPartialInternalJobs;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface ICIPInternalJobsRepository.
 *
 * @author icets
 */
@NoRepositoryBean
public interface ICIPPartialInternalJobsRepository
		extends PagingAndSortingRepository<ICIPPartialInternalJobs, Integer> {

	/**
	 * Find by dataset and organization.
	 *
	 * @param name the name
	 * @param org the org
	 * @param pageable the pageable
	 * @return the list
	 */
	List<ICIPPartialInternalJobs> findByDatasetAndOrganization(String name, String org, Pageable pageable);

	/**
	 * Find by dataset and job name and organization.
	 *
	 * @param name the name
	 * @param jobName the job name
	 * @param org the org
	 * @param pageable the pageable
	 * @return the list
	 */
	List<ICIPPartialInternalJobs> findByDatasetAndJobNameAndOrganization(String name, String jobName, String org,
			Pageable pageable);

	/**
	 * Find by job name and organization.
	 *
	 * @param name the name
	 * @param org the org
	 * @param paginate the paginate
	 * @return the list
	 */
	List<ICIPPartialInternalJobs> findByJobNameAndOrganization(String name, String org, Pageable paginate);

	/**
	 * Find by job status.
	 *
	 * @param status the status
	 * @return the list
	 */
	List<ICIPPartialInternalJobs> findByJobStatus(String status);

	/**
	 * Find by job id.
	 *
	 * @param jobId the job id
	 * @return the ICIP partial internal jobs
	 */
	ICIPPartialInternalJobs findByJobId(String jobId);

}
