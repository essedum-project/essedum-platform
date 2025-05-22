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
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.icip.icipwebeditor.model.ICIPJobsPartial;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPJobsPartialRepository;

/**
 * The Interface ICIPJobsPartialRepositoryMSSQL.
 */
@Profile("mssql")
@Repository
public interface ICIPJobsPartialRepositoryMSSQL extends ICIPJobsPartialRepository {
	@Query(value = "SELECT id, job_id, submitted_by, streaming_service, job_status, version, validation, "
			+ "submitted_on, type, organization, runtime, hashparams, correlationid, finishtime, jobmetadata, "
			+ " jobparam, jobmetric,image,output, executortaskid,SUBSTRING(log, :offset, :limit) AS log FROM mljobs "
			+ "WHERE job_id = :id", nativeQuery = true)
	ICIPJobsPartial findByJobIdBuffered(@Param("id") String jobId, @Param("offset") long offset, @Param("limit") long limit);
	
	@Query(value = "SELECT id, job_id, submitted_by, streaming_service, job_status, version, validation, "
			+ "submitted_on, type, organization, runtime, hashparams, correlationid, finishtime, jobmetadata, "
			+ " jobparam, jobmetric,image,output, executortaskid,SUBSTRING(log, :offset, :limit) AS log FROM mljobs "
			+ "WHERE correlationid = :id", nativeQuery = true)
	ICIPJobsPartial findByCorelIdBuffered(@Param("id") String corelid, @Param("offset") long offset, @Param("limit") long limit);
	
	@Query(value = "SELECT * FROM mljobs "
			+ "WHERE job_id LIKE CONCAT(:jobId, '%')", nativeQuery = true)
	ICIPJobsPartial findByJobId(@Param("jobId") String jobId);
	
	@Query(value = "SELECT * FROM mljobs "
			+ "WHERE correlationid LIKE CONCAT(:corelId, '%')", nativeQuery = true)
	ICIPJobsPartial findByCorelId(@Param("corelId") String corelId);
	
	@Query(value = "SELECT * FROM mljobs ", nativeQuery = true)
	List<ICIPJobsPartial> getAllJobs();
}
