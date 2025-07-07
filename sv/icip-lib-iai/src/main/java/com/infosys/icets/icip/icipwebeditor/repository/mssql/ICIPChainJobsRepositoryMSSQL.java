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

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.icets.icip.icipwebeditor.job.model.ICIPChainJobs;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPChainJobsRepository;

/**
 * The Interface ICIPChainJobsRepositoryMSSQL.
 */
@Profile("mssql")
@Repository
public interface ICIPChainJobsRepositoryMSSQL extends ICIPChainJobsRepository {

	/**
	 * Find by job name and organization by submission.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP chain jobs
	 */
	@Query(value = "SELECT TOP 1 * FROM mlchainjobs WHERE job_name=:name AND organization=:org AND job_status='COMPLETED' ORDER BY submitted_on DESC", nativeQuery = true)
	ICIPChainJobs findByJobNameAndOrganizationBySubmission(@Param("name") String name, @Param("org") String org);

	/**
	 * Find by job name and organization by last submission.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP chain jobs
	 */
	@Query(value = "SELECT TOP 1 * FROM mlchainjobs WHERE job_name=:name AND organization=:org AND job_status IN ('COMPLETED', 'ERROR', 'RUNNING') ORDER BY submitted_on DESC", nativeQuery = true)
	ICIPChainJobs findByJobNameAndOrganizationByLastSubmission(@Param("name") String name, @Param("org") String org);

	/**
	 * Find by hashparams.
	 *
	 * @param hashparams the hashparams
	 * @return the ICIP chain jobs
	 */
	@Query(value = "SELECT TOP 1 * FROM mlchainjobs WHERE hashparams=:params ORDER BY submitted_on DESC", nativeQuery = true)
	ICIPChainJobs findByHashparams(@Param("params") String hashparams);

	/**
	 * Delete older data.
	 *
	 * @param days the days
	 */
	@Transactional
	@Modifying
	@Query(value = "DELETE FROM mlchainjobs WHERE DATEDIFF(day, submitted_on, GETDATE())>:days", nativeQuery = true)
	void deleteOlderData(@Param("days") int days);
	
	@Query("SELECT mlc FROM ICIPChainJobs mlc where mlc.correlationid=?1 and mlc.organization=?2")
	List<ICIPChainJobs> findByCorrelationId(String correlationId,String org);

	@Query(value = "WITH RankedJobs AS ("
			+ "        SELECT *,"
			+ "            ROW_NUMBER() OVER ("
			+ "                PARTITION BY correlationid, submitted_on "
			+ "                ORDER BY CASE job_status "
			+ "                    WHEN 'ERROR' THEN 1  "
			+ "                    WHEN 'TIMEOUT' THEN 2 "
			+ "                    WHEN 'CANCELLED' THEN 3 "
			+ "                    WHEN 'RUNNING' THEN 4 "
			+ "                    WHEN 'COMPLETED' THEN 5 "
			+ "                    ELSE 6 "
			+ "                END "
			+ "            ) AS job_rank "
			+ "        FROM mlchainjobs "
			+ "        WHERE job_name = 'Clustering' AND ORGANIZATION = 'leo1311'"
			+ "    ) "
			+ "    SELECT count(*) as countQuery "
			+ "    FROM RankedJobs "
			+ "    WHERE job_rank = 1",
    nativeQuery = true)
	Long countByJobNameAndOrganization(@Param("jobName") String jobName, @Param("org") String org);
    
}
