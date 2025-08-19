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

import com.infosys.icets.icip.icipwebeditor.model.ICIPJobsPartial;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPJobsPartialRepository;

/**
 * The Interface ICIPJobsPartialRepositoryMYSQL.
 */
@Profile("mysql")
@Repository
public interface ICIPJobsPartialRepositoryMYSQL extends ICIPJobsPartialRepository {
	
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
