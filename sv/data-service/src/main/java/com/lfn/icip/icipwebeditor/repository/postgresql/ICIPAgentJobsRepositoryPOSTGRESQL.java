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

package com.lfn.icip.icipwebeditor.repository.postgresql;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.lfn.icip.icipwebeditor.model.ICIPAgentJobs;
import com.lfn.icip.icipwebeditor.repository.ICIPAgentJobsRepository;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPAgentJobsRepositorypostgresql.
 */
@Profile("postgresql")
@Repository
public interface ICIPAgentJobsRepositoryPOSTGRESQL extends ICIPAgentJobsRepository {

	/**
	 * Find by job name and organization by submission.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP agent jobs
	 */
	@Query(value = "SELECT * FROM mlagentjobs "
			+ "WHERE cname=:name AND organization=:org AND job_status='COMPLETED' "
			+ "ORDER BY submitted_on DESC LIMIT 1;", nativeQuery = true)
	ICIPAgentJobs findByJobNameAndOrganizationBySubmission(@Param("name") String name, @Param("org") String org);

	/**
	 * Find by job name and organization by last submission.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP agent jobs
	 */
	@Query(value = "SELECT * FROM mlagentjobs "
			+ "WHERE cname=:name AND organization=:org AND job_status IN ('COMPLETED', 'ERROR', 'RUNNING') "
			+ "ORDER BY submitted_on DESC LIMIT 1;", nativeQuery = true)
	ICIPAgentJobs findByJobNameAndOrganizationByLastSubmission(@Param("name") String name, @Param("org") String org);

	/**
	 * Find by hashparams.
	 *
	 * @param hashparams the hashparams
	 * @return the ICIP agent jobs
	 */
	@Query(value = "SELECT * FROM mlagentjobs "
			+ "WHERE hashparams=:params ORDER BY submitted_on DESC LIMIT 1;", nativeQuery = true)
	ICIPAgentJobs findByHashparams(@Param("params") String hashparams);

	/**
	 * Delete older data.
	 *
	 * @param days the days
	 */
	@Transactional
	@Modifying
	@Query(value = "DELETE FROM mlagentjobs WHERE DATEDIFF(NOW(), submitted_on)>:days", nativeQuery = true)
	void deleteOlderData(@Param("days") int days);

}
