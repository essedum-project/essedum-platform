/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

package com.infosys.icets.icip.icipwebeditor.repository.postgresql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.icets.icip.icipwebeditor.job.model.ICIPChainJobs;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPChainJobsRepository;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPChainJobsRepositorypostgresql.
 */
@Profile("postgresql")
@Repository
public interface ICIPChainJobsRepositoryPOSTGRESQL extends ICIPChainJobsRepository {

	/**
	 * Find by job name and organization by submission.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP chain jobs
	 */
	@Query(value = "SELECT * FROM mlchainjobs "
			+ "WHERE job_name=:name AND organization=:org AND job_status='COMPLETED' "
			+ "ORDER BY submitted_on DESC LIMIT 1;", nativeQuery = true)
	ICIPChainJobs findByJobNameAndOrganizationBySubmission(@Param("name") String name, @Param("org") String org);

	/**
	 * Find by job name and organization by last submission.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP chain jobs
	 */
	@Query(value = "SELECT * FROM mlchainjobs "
			+ "WHERE job_name=:name AND organization=:org AND job_status IN ('COMPLETED', 'ERROR', 'RUNNING') "
			+ "ORDER BY submitted_on DESC LIMIT 1;", nativeQuery = true)
	ICIPChainJobs findByJobNameAndOrganizationByLastSubmission(@Param("name") String name, @Param("org") String org);

	/**
	 * Find by hashparams.
	 *
	 * @param hashparams the hashparams
	 * @return the ICIP chain jobs
	 */
	@Query(value = "SELECT * FROM mlchainjobs "
			+ "WHERE hashparams=:params ORDER BY submitted_on DESC LIMIT 1;", nativeQuery = true)
	ICIPChainJobs findByHashparams(@Param("params") String hashparams);

	/**
	 * Delete older data.
	 *
	 * @param days the days
	 */
	@Transactional
	@Modifying
	@Query(value = "DELETE FROM mlchainjobs WHERE DATEDIFF(NOW(), submitted_on)>:days", nativeQuery = true)
	void deleteOlderData(@Param("days") int days);
	
	@Query("SELECT mlc FROM ICIPChainJobs mlc where mlc.correlationid=?1 and mlc.organization=?2")
	List<ICIPChainJobs> findByCorrelationId(String correlationId,String org);

    @Query(value = "SELECT COUNT(*) FROM (" +
            "WITH RankedJobs AS (" +
            "    SELECT *, " +
            "           ROW_NUMBER() OVER (" +
            "               PARTITION BY correlationid, submitted_on " +
            "               ORDER BY " +
            "                   CASE job_status " +
            "                       WHEN 'ERROR' THEN 1 " +
            "                       WHEN 'TIMEOUT' THEN 2 " +
            "                       WHEN 'CANCELLED' THEN 3 " +
            "                       WHEN 'RUNNING' THEN 4 " +
            "                       WHEN 'COMPLETED' THEN 5 " +
            "                       ELSE 6 " +
            "                   END " +
            "           ) AS job_rank " +
            "    FROM mlchainjobs " +
            "    WHERE job_name = :jobName AND organization = :org" +
            ") " +
            "SELECT * " +
            "FROM RankedJobs " +
            "WHERE job_rank = 1" +
            ") AS countQuery",
    nativeQuery = true)
	Long countByJobNameAndOrganization(@Param("jobName") String jobName, @Param("org") String org);
	
}
