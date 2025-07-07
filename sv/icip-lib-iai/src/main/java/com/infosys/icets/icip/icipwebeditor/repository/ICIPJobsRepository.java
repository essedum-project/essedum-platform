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

import com.infosys.icets.icip.icipwebeditor.model.ICIPJobs;
import com.infosys.icets.icip.icipwebeditor.model.dto.IHiddenJobs;
import com.infosys.icets.icip.icipwebeditor.model.dto.IJobLog;

// TODO: Auto-generated Javadoc
// 
/**
 * Spring Data JPA repository for the SchemaRegistry entity.
 */
/**
 * @author icets
 */
@NoRepositoryBean
public interface ICIPJobsRepository extends PagingAndSortingRepository<ICIPJobs, Integer>, CrudRepository<ICIPJobs, Integer> {

	/**
	 * Find by job id.
	 *
	 * @param jobId the job id
	 * @return the ICIP jobs
	 */
	ICIPJobs findByJobId(String jobId);

	/**
	 * Find by organization.
	 *
	 * @param org      the org
	 * @param pageable the pageable
	 * @return the page
	 */
	Page<ICIPJobs> findByOrganization(String org, Pageable pageable);

	/**
	 * Count by streaming service and organization.
	 *
	 * @param streamingService the streaming service
	 * @param org              the org
	 * @return the long
	 */
	Long countByStreamingServiceAndOrganization(String streamingService, String org);

	/**
	 * Count by organization.
	 *
	 * @param org the org
	 * @return the long
	 */
	Long countByOrganization(String org);

	/**
	 * Gets the all common jobs.
	 *
	 * @param org    the org
	 * @param filtercolumn the filtercolumn
	 * @param filtervalue the filtervalue
	 * @param filterdate the filterdate
	 * @param page the page
	 * @return the all common jobs
	 */
	List<IJobLog> getAllCommonJobs(String org, String filtercolumn, String filtervalue, String filterdate,String tz,
			Pageable page);
	
	List<IJobLog> getAllCommonJobsnew(String org, String filtercolumn, String filtervalue, String filterdate,
			Pageable page);
    /**
	 * Gets the common jobs len.
	 *
	 * @param org the org
	 * @param filtercolumn the filtercolumn
	 * @param filtervalue the filtervalue
	 * @param filterdate the filterdate
	 * @return the common jobs len
	 */
	Long getCommonJobsLen(String org, String filtercolumn, String filtervalue, String filterdate,String tz);
	
	Long getCommonJobsLenNew(String org, String filtercolumn, String filtervalue, String filterdate);

	/**
	 * Find by job name and organization by submission.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP jobs
	 */
	ICIPJobs findByJobNameAndOrganizationBySubmission(String name, String org);

	/**
	 * Find by job name and organization by last submission.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP jobs
	 */
	ICIPJobs findByJobNameAndOrganizationByLastSubmission(String name, String org);

	/**
	 * Find by hashparams.
	 *
	 * @param hashparams the hashparams
	 * @return the ICIP jobs
	 */
	ICIPJobs findByHashparams(String hashparams);

	/**
	 * Gets the all hidden logs.
	 *
	 * @param org the org
	 * @return the all hidden logs
	 */
	List<IHiddenJobs> getAllHiddenLogs(String org);

	/**
	 * Delete older data.
	 *
	 * @param days the days
	 */
	void deleteOlderData(int days);

	String getJobStatus(String jobid);
	
	String getEventStatus(String corelid);

	List<IJobLog> getCsvBySelectedColumnNames(String org, String filtercolumn, String filtervalue, String filterdate);

}
