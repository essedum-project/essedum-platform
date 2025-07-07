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
