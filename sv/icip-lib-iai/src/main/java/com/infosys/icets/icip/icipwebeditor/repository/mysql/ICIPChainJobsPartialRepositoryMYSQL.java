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

package com.infosys.icets.icip.icipwebeditor.repository.mysql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.icip.icipwebeditor.job.model.ICIPChainJobsPartial;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPChainJobsPartialRepository;

/**
 * The Interface ICIPChainJobsPartialRepositoryMYSQL.
 */
@Profile("mysql")
@Repository
public interface ICIPChainJobsPartialRepositoryMYSQL extends ICIPChainJobsPartialRepository {

    @Query(value = "WITH RankedJobs AS (" +
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
            "WHERE job_rank = 1 " +
            "ORDER BY submitted_on DESC " +
            "LIMIT :limit OFFSET :offset", 
    countQuery = "SELECT COUNT(*) FROM (" +
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
	List<ICIPChainJobsPartial> findByJobNameAndOrganization(@Param("jobName") String jobName, @Param("org") String org,
			@Param("limit") int limit, @Param("offset") int offset);

}
