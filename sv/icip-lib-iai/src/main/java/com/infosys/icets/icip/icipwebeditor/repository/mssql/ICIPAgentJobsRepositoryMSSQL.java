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
package com.infosys.icets.icip.icipwebeditor.repository.mssql;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.icets.icip.icipwebeditor.model.ICIPAgentJobs;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPAgentJobsRepository;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPAgentJobsRepositoryMSSQL.
 */
@Profile("mssql")
@Repository
public interface ICIPAgentJobsRepositoryMSSQL extends ICIPAgentJobsRepository {

	/**
	 * Find by job name and organization by submission.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP agent jobs
	 */
	@Query(value = "SELECT TOP 1 * FROM mlagentjobs WHERE cname=:name AND organization=:org AND job_status='COMPLETED' ORDER BY submitted_on DESC", nativeQuery = true)
	ICIPAgentJobs findByJobNameAndOrganizationBySubmission(@Param("name") String name, @Param("org") String org);

	/**
	 * Find by job name and organization by last submission.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP agent jobs
	 */
	@Query(value = "SELECT TOP 1 * FROM mlagentjobs WHERE cname=:name AND organization=:org AND job_status IN ('COMPLETED', 'ERROR', 'RUNNING') ORDER BY submitted_on DESC", nativeQuery = true)
	ICIPAgentJobs findByJobNameAndOrganizationByLastSubmission(@Param("name") String name, @Param("org") String org);

	/**
	 * Find by hashparams.
	 *
	 * @param hashparams the hashparams
	 * @return the ICIP agent jobs
	 */
	@Query(value = "SELECT TOP 1 * FROM mlagentjobs WHERE hashparams=:params ORDER BY submitted_on DESC", nativeQuery = true)
	ICIPAgentJobs findByHashparams(@Param("params") String hashparams);

	/**
	 * Delete older data.
	 *
	 * @param days the days
	 */
	@Transactional
	@Modifying
	@Query(value = "DELETE FROM mlagentjobs WHERE DATEDIFF(day, submitted_on, GETDATE())>:days", nativeQuery = true)
	void deleteOlderData(@Param("days") int days);

}
