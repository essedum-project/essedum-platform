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
package com.infosys.icets.icip.icipwebeditor.repository.postgresql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.icets.icip.icipwebeditor.model.ICIPJobs;
import com.infosys.icets.icip.icipwebeditor.model.dto.IHiddenJobs;
import com.infosys.icets.icip.icipwebeditor.model.dto.IJobLog;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPJobsRepository;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPJobsRepositorypostgresql.
 */
@Profile("postgresql")
@Repository
public interface ICIPJobsRepositoryPOSTGRESQL extends ICIPJobsRepository {

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
	@Query(value = "SELECT jobid, alias, submittedby, submittedon, jobstatus, runtime, jobtype, finishtime, "
			+ "jobmetadata, TYPE FROM "
			+ "(SELECT job_id AS jobid, job_name AS alias, submitted_by AS "
			+ "submittedby, submitted_on AS submittedon, job_status AS jobstatus, 'local' AS runtime, "
			+ "'chain' AS jobtype, finishtime AS finishtime, CONCAT('\\\"', jobmetadata, '\\\"') AS jobmetadata, "
			+ "(SELECT DISTINCT CASE WHEN mlchains.parallelchain = 1 THEN 'Parallel Chain' ELSE 'Sequential Chain' "
			+ "END FROM mlchains WHERE mlchainjobs.job_name = mlchains.job_name) AS TYPE FROM mlchainjobs "
			+ "WHERE mlchainjobs.organization=:org AND mlchainjobs.job_name NOT IN (SELECT DISTINCT(job_name) "
			+ "FROM mlchainjobs WHERE mlchainjobs.jobhide = 1 AND mlchainjobs.organization=:org) "
			+ "UNION ALL SELECT job_id AS jobid, "
			+ "(SELECT DISTINCT CONCAT(mlpipeline.name, ',', alias) FROM mlpipeline WHERE "
			+ " mljobs.organization=:org AND mljobs.organization=mlpipeline.organization AND mlpipeline.name =mljobs.streaming_service) "
			+ "AS alias, submitted_by AS submittedby, submitted_on AS submittedon, job_status AS jobstatus, "
			+ "runtime AS runtime, 'pipeline' AS jobtype, finishtime AS finishtime, "
			+ "CONCAT('\\\"', jobmetadata, '\\\"') AS jobmetadata, (SELECT DISTINCT mlpipeline.TYPE FROM mlpipeline "
			+ "WHERE mljobs.streaming_service=mlpipeline.name AND mljobs.organization=:org AND "
			+ "mljobs.organization=mlpipeline.organization) AS TYPE FROM mljobs WHERE "
			+ "mljobs.organization=:org  AND mljobs.jobmetadata NOT ILIKE '%\\\"CHAIN\\\"%' AND "
			+ "mljobs.streaming_service NOT IN (SELECT DISTINCT(streaming_service) FROM mljobs WHERE "
			+ "mljobs.jobhide IN (1) AND mljobs.organization =:org) "
			+ "UNION ALL SELECT jobid AS jobid, jobname AS alias, submittedby AS "
			+ "submittedby, submittedon AS submittedon, jobstatus AS jobstatus, 'local' AS runtime, "
			+ "'internal' AS jobtype, finishtime AS finishtime, CONCAT('\\\"', jobmetadata, '\\\"') AS "
			+ "jobmetadata, 'Internal Job' AS TYPE FROM mlinternaljobs WHERE mlinternaljobs.organization=:org "
			+ "AND mlinternaljobs.jobname NOT IN (SELECT DISTINCT(jobname) FROM mlinternaljobs WHERE "
			+ "mlinternaljobs.jobhide = 1 AND mlinternaljobs.organization=:org) "
			+ "UNION ALL SELECT job_id AS jobid, cname AS alias, submitted_by "
			+ "AS submittedby, submitted_on AS submittedon, job_status AS jobstatus, runtime AS runtime, "
			+ "'agent' AS jobtype, finishtime AS finishtime, CONCAT('\\\"', jobmetadata, '\\\"') AS jobmetadata,"
			+ "(SELECT TYPE FROM mlagents WHERE mlagentjobs.cname = mlagents.name) AS TYPE FROM "
			+ "mlagentjobs WHERE mlagentjobs.organization=:org AND mlagentjobs.cname NOT IN (SELECT "
			+ "DISTINCT(cname) FROM mlagentjobs WHERE mlagentjobs.jobhide = 1 AND mlagentjobs.organization=:org)) result "
			+ "WHERE CASE WHEN :filtercolumn = 'alias' THEN alias ILIKE CONCAT('%', :filtervalue, '%') "
			+ "WHEN :filtercolumn = 'submittedby' THEN submittedby ILIKE CONCAT('%', :filtervalue, '%') "
			+ "WHEN :filtercolumn = 'jobstatus' THEN jobstatus ILIKE CONCAT('%', :filtervalue, '%') "
			+ "WHEN :filtercolumn = 'submittedon' THEN DATE(submittedon AT TIME ZONE '+00:00' AT TIME ZONE :tz) = CAST(:filterdate AS DATE) "
			+ "WHEN :filtercolumn = 'finishtime' THEN DATE(finishtime AT TIME ZONE '+00:00' AT TIME ZONE :tz) = CAST(:filterdate AS DATE) "
			+ "WHEN :filtercolumn = '' THEN 1 = 1 END", nativeQuery = true)
	List<IJobLog> getAllCommonJobs(@Param("org") String org, @Param("filtercolumn") String filtercolumn,
			@Param("filtervalue") String filtervalue, @Param("filterdate") String filterdate,
			@Param("tz") String tz , Pageable page);

	@Query(value = "SELECT jobid, alias, submittedby, submittedon, jobstatus, runtime, jobtype, finishtime, "
			+ "jobmetadata, TYPE FROM "
			+ "(SELECT job_id AS jobid, job_name AS alias, submitted_by AS "
			+ "submittedby, submitted_on AS submittedon, job_status AS jobstatus, 'local' AS runtime, "
			+ "'chain' AS jobtype, finishtime AS finishtime, CONCAT('\\\"', jobmetadata, '\\\"') AS jobmetadata, "
			+ "(SELECT DISTINCT CASE WHEN mlchains.parallelchain = 1 THEN 'Parallel Chain' ELSE 'Sequential Chain' "
			+ "END FROM mlchains WHERE mlchainjobs.job_name = mlchains.job_name) AS TYPE FROM mlchainjobs "
			+ "WHERE mlchainjobs.organization=:org AND mlchainjobs.job_name NOT IN (SELECT DISTINCT(job_name) "
			+ "FROM mlchainjobs WHERE mlchainjobs.jobhide = 1 AND mlchainjobs.organization=:org) "
			+ "UNION ALL SELECT job_id AS jobid, "
			+ "(SELECT DISTINCT CONCAT(mlpipeline.name, ',', alias) FROM mlpipeline WHERE "
			+ " mljobs.organization=:org AND mljobs.organization=mlpipeline.organization AND mlpipeline.name =mljobs.streaming_service) "
			+ "AS alias, submitted_by AS submittedby, submitted_on AS submittedon, job_status AS jobstatus, "
			+ "runtime AS runtime, 'pipeline' AS jobtype, finishtime AS finishtime, "
			+ "CONCAT('\\\"', jobmetadata, '\\\"') AS jobmetadata, (SELECT DISTINCT mlpipeline.TYPE FROM mlpipeline "
			+ "WHERE mljobs.streaming_service=mlpipeline.name AND mljobs.organization=:org AND "
			+ "mljobs.organization=mlpipeline.organization) AS TYPE FROM mljobs WHERE "
			+ "mljobs.organization=:org  AND mljobs.jobmetadata NOT ILIKE '%\\\"CHAIN\\\"%' AND "
			+ "mljobs.streaming_service NOT IN (SELECT DISTINCT(streaming_service) FROM mljobs WHERE "
			+ "mljobs.jobhide IN (1) AND mljobs.organization =:org) "
			+ "UNION ALL SELECT jobid AS jobid, jobname AS alias, submittedby AS "
			+ "submittedby, submittedon AS submittedon, jobstatus AS jobstatus, 'local' AS runtime, "
			+ "'internal' AS jobtype, finishtime AS finishtime, CONCAT('\\\"', jobmetadata, '\\\"') AS "
			+ "jobmetadata, 'Internal Job' AS TYPE FROM mlinternaljobs WHERE mlinternaljobs.organization=:org "
			+ "AND mlinternaljobs.jobname NOT IN (SELECT DISTINCT(jobname) FROM mlinternaljobs WHERE "
			+ "mlinternaljobs.jobhide = 1 AND mlinternaljobs.organization=:org) "
			+ "UNION ALL SELECT job_id AS jobid, cname AS alias, submitted_by"
			+ " AS submittedby, submitted_on AS submittedon, job_status AS jobstatus, runtime AS runtime, "
			+ "'agent' AS jobtype, finishtime AS finishtime, CONCAT('\\\"', jobmetadata, '\\\"') AS jobmetadata,"
			+ "(SELECT TYPE FROM mlagents WHERE mlagentjobs.cname = mlagents.name) AS TYPE FROM "
			+ "mlagentjobs WHERE mlagentjobs.organization=:org AND mlagentjobs.cname NOT IN (SELECT "
			+ "DISTINCT(cname) FROM mlagentjobs WHERE mlagentjobs.jobhide = 1 AND mlagentjobs.organization=:org)) result "
			+ "WHERE CASE WHEN :filtercolumn = 'alias' THEN alias ILIKE CONCAT('%', :filtervalue, '%') "
			+ "WHEN :filtercolumn = 'jobid' THEN jobid ILIKE CONCAT('%', :filtervalue, '%')"
			+ "WHEN :filtercolumn = 'submittedby' THEN submittedby ILIKE CONCAT('%', :filtervalue, '%') "
			+ "WHEN :filtercolumn = 'jobstatus' THEN jobstatus ILIKE CONCAT('%', :filtervalue, '%')"
			+ "WHEN :filtercolumn = 'runtime' THEN runtime ILIKE CONCAT('%', :filtervalue, '%')"
			+ "WHEN :filtercolumn = 'submittedon' THEN TO_CHAR(submittedon, 'YYYY/MM/DD HH:MM') ILIKE CONCAT('%', :filterdate, '%')"
			+ "WHEN :filtercolumn = 'finishtime' THEN TO_CHAR(finishtime, 'YYYY/MM/DD HH:MM') ILIKE CONCAT('%', :filterdate, '%')"
			+ "WHEN :filtercolumn = '' THEN 1 = 1 END", nativeQuery = true)
	List<IJobLog> getAllCommonJobsnew(@Param("org") String org, @Param("filtercolumn") String filtercolumn,
			@Param("filtervalue") String filtervalue, @Param("filterdate") String filterdate,
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
	@Query(value = "SELECT COUNT(*) FROM (SELECT jobid, alias, submittedby, submittedon, jobstatus, runtime, jobtype, finishtime, "
			+ "jobmetadata, TYPE FROM "
			+ "(SELECT job_id AS jobid, job_name AS alias, submitted_by AS "
			+ "submittedby, submitted_on AS submittedon, job_status AS jobstatus, 'local' AS runtime, "
			+ "'chain' AS jobtype, finishtime AS finishtime, CONCAT('\\\"', jobmetadata, '\\\"') AS jobmetadata, "
			+ "(SELECT DISTINCT CASE WHEN mlchains.parallelchain = 1 THEN 'Parallel Chain' ELSE 'Sequential Chain' "
			+ "END FROM mlchains WHERE mlchainjobs.job_name = mlchains.job_name) AS TYPE FROM mlchainjobs "
			+ "WHERE mlchainjobs.organization=:org AND mlchainjobs.job_name NOT IN (SELECT DISTINCT(job_name) "
			+ "FROM mlchainjobs WHERE mlchainjobs.jobhide = 1 AND mlchainjobs.organization=:org) "
			+ "UNION ALL SELECT job_id AS jobid, "
			+ "(SELECT DISTINCT CONCAT(mlpipeline.name, ';', alias) FROM mlpipeline WHERE "
			+ " mljobs.organization=:org AND mljobs.organization=mlpipeline.organization AND mlpipeline.name =mljobs.streaming_service) "
			+ "AS alias, submitted_by AS submittedby, submitted_on AS submittedon, job_status AS jobstatus, "
			+ "runtime AS runtime, 'pipeline' AS jobtype, finishtime AS finishtime, "
			+ "CONCAT('\\\"', jobmetadata, '\\\"') AS jobmetadata, (SELECT DISTINCT mlpipeline.TYPE FROM mlpipeline "
			+ "WHERE mljobs.streaming_service=mlpipeline.name AND mljobs.organization=:org AND "
			+ "mljobs.organization=mlpipeline.organization) AS TYPE FROM mljobs WHERE "
			+ "mljobs.organization=:org  AND mljobs.jobmetadata NOT ILIKE '%\\\"CHAIN\\\"%' AND "
			+ "mljobs.streaming_service NOT IN (SELECT DISTINCT(streaming_service) FROM mljobs WHERE "
			+ "mljobs.jobhide IN (1) AND mljobs.organization =:org) "
			+ "UNION ALL SELECT jobid AS jobid, jobname AS alias, submittedby AS "
			+ "submittedby, submittedon AS submittedon, jobstatus AS jobstatus, 'local' AS runtime, "
			+ "'internal' AS jobtype, finishtime AS finishtime, CONCAT('\\\"', jobmetadata, '\\\"') AS "
			+ "jobmetadata, 'Internal Job' AS TYPE FROM mlinternaljobs WHERE mlinternaljobs.organization=:org "
			+ "AND mlinternaljobs.jobname NOT IN (SELECT DISTINCT(jobname) FROM mlinternaljobs WHERE "
			+ "mlinternaljobs.jobhide = 1 AND mlinternaljobs.organization=:org) "
			+ "UNION ALL SELECT job_id AS jobid, cname AS alias, submitted_by "
			+ "AS submittedby, submitted_on AS submittedon, job_status AS jobstatus, runtime AS runtime, "
			+ "'agent' AS jobtype, finishtime AS finishtime, CONCAT('\\\"', jobmetadata, '\\\"') AS jobmetadata, "
			+ "(SELECT TYPE FROM mlagents WHERE mlagentjobs.cname = mlagents.name) AS TYPE FROM "
			+ "mlagentjobs WHERE mlagentjobs.organization=:org AND mlagentjobs.cname NOT IN (SELECT "
			+ "DISTINCT(cname) FROM mlagentjobs WHERE mlagentjobs.jobhide = 1 AND mlagentjobs.organization=:org)) result "
			+ "WHERE CASE WHEN :filtercolumn = 'alias' THEN alias ILIKE CONCAT('%', :filtervalue, '%') "
			+ "WHEN :filtercolumn = 'submittedby' THEN submittedby ILIKE CONCAT('%', :filtervalue, '%') "
			+ "WHEN :filtercolumn = 'jobstatus' THEN jobstatus ILIKE CONCAT('%', :filtervalue, '%') "
			+ "WHEN :filtercolumn = 'submittedon' THEN DATE(submittedon AT TIME ZONE '+00:00' AT TIME ZONE :tz) = CAST(:filterdate AS DATE) "
			+ "WHEN :filtercolumn = 'finishtime' THEN DATE(finishtime AT TIME ZONE '+00:00' AT TIME ZONE :tz) = CAST(:filterdate AS DATE) "
			+ "WHEN :filtercolumn = '' THEN 1 = 1 END) commonjobs", nativeQuery = true)
	Long getCommonJobsLen(@Param("org") String org, @Param("filtercolumn") String filtercolumn,
			@Param("filtervalue") String filtervalue, @Param("filterdate") String filterdate,@Param("tz")String tz);

	@Query(value = "SELECT COUNT(*) FROM (SELECT jobid, alias, submittedby, submittedon, jobstatus, runtime, jobtype, finishtime, "
			+ "jobmetadata, TYPE FROM "
			+ "(SELECT job_id AS jobid, job_name AS alias, submitted_by AS "
			+ "submittedby, submitted_on AS submittedon, job_status AS jobstatus, 'local' AS runtime, "
			+ "'chain' AS jobtype, finishtime AS finishtime, CONCAT('\\\"', jobmetadata, '\\\"') AS jobmetadata, "
			+ "(SELECT DISTINCT CASE WHEN mlchains.parallelchain = 1 THEN 'Parallel Chain' ELSE 'Sequential Chain' "
			+ "END FROM mlchains WHERE mlchainjobs.job_name = mlchains.job_name) AS TYPE FROM mlchainjobs "
			+ "WHERE mlchainjobs.organization=:org AND mlchainjobs.job_name NOT IN (SELECT DISTINCT(job_name) "
			+ "FROM mlchainjobs WHERE mlchainjobs.jobhide = 1 AND mlchainjobs.organization=:org) "
			+ "UNION ALL SELECT job_id AS jobid, "
			+ "(SELECT DISTINCT CONCAT(mlpipeline.name, ';', alias) FROM mlpipeline WHERE "
			+ " mljobs.organization=:org AND mljobs.organization=mlpipeline.organization AND mlpipeline.name =mljobs.streaming_service) "
			+ "AS alias, submitted_by AS submittedby, submitted_on AS submittedon, job_status AS jobstatus, "
			+ "runtime AS runtime, 'pipeline' AS jobtype, finishtime AS finishtime, "
			+ "CONCAT('\\\"', jobmetadata, '\\\"') AS jobmetadata, (SELECT DISTINCT mlpipeline.TYPE FROM mlpipeline "
			+ "WHERE mljobs.streaming_service=mlpipeline.name AND mljobs.organization=:org AND "
			+ "mljobs.organization=mlpipeline.organization) AS TYPE FROM mljobs WHERE "
			+ "mljobs.organization=:org  AND mljobs.jobmetadata NOT ILIKE '%\\\"CHAIN\\\"%' AND "
			+ "mljobs.streaming_service NOT IN (SELECT DISTINCT(streaming_service) FROM mljobs WHERE "
			+ "mljobs.jobhide IN (1) AND mljobs.organization =:org) "
			+ "UNION ALL SELECT jobid AS jobid, jobname AS alias, submittedby AS "
			+ "submittedby, submittedon AS submittedon, jobstatus AS jobstatus, 'local' AS runtime, "
			+ "'internal' AS jobtype, finishtime AS finishtime, CONCAT('\\\"', jobmetadata, '\\\"') AS "
			+ "jobmetadata, 'Internal Job' AS TYPE FROM mlinternaljobs WHERE mlinternaljobs.organization=:org "
			+ "AND mlinternaljobs.jobname NOT IN (SELECT DISTINCT(jobname) FROM mlinternaljobs WHERE "
			+ "mlinternaljobs.jobhide = 1 AND mlinternaljobs.organization=:org) "
			+ "UNION ALL SELECT job_id AS jobid, cname AS alias, submitted_by "
			+ "AS submittedby, submitted_on AS submittedon, job_status AS jobstatus, runtime AS runtime, "
			+ "'agent' AS jobtype, finishtime AS finishtime, CONCAT('\\\"', jobmetadata, '\\\"') AS jobmetadata, "
			+ "(SELECT TYPE FROM mlagents WHERE mlagentjobs.cname = mlagents.name) AS TYPE FROM "
			+ "mlagentjobs WHERE mlagentjobs.organization=:org AND mlagentjobs.cname NOT IN (SELECT "
			+ "DISTINCT(cname) FROM mlagentjobs WHERE mlagentjobs.jobhide = 1 AND mlagentjobs.organization=:org)) result "
			+ "WHERE CASE WHEN :filtercolumn = 'alias' THEN alias ILIKE CONCAT('%', :filtervalue, '%') "
			+ "WHEN :filtercolumn = 'submittedby' THEN submittedby ILIKE CONCAT('%', :filtervalue, '%') "
			+ "WHEN :filtercolumn = 'jobstatus' THEN jobstatus ILIKE CONCAT('%', :filtervalue, '%') "
			+ "WHEN :filtercolumn = 'runtime' THEN runtime ILIKE CONCAT('%', :filtervalue, '%')"
			+ "WHEN :filtercolumn = 'submittedon' THEN TO_CHAR(submittedon, 'YYYY/MM/DD HH:MM') ILIKE CONCAT('%', :filterdate, '%')"
			+ "WHEN :filtercolumn = 'finishtime' THEN TO_CHAR(finishtime, 'YYYY/MM/DD HH:MM') ILIKE CONCAT('%', :filterdate, '%')"
			+ "WHEN :filtercolumn = '' THEN 1 = 1 END) commonjobs", nativeQuery = true)
	Long getCommonJobsLenNew(@Param("org") String org, @Param("filtercolumn") String filtercolumn,
			@Param("filtervalue") String filtervalue, @Param("filterdate") String filterdate);

	/**
	 * Find by job name and organization by submission.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP jobs
	 */
	@Query(value = "SELECT * FROM mljobs "
			+ "WHERE streaming_service=:name AND organization=:org AND job_status='COMPLETED' "
			+ "ORDER BY submitted_on DESC LIMIT 1;", nativeQuery = true)
	ICIPJobs findByJobNameAndOrganizationBySubmission(@Param("name") String name, @Param("org") String org);

	/**
	 * Find by job name and organization by last submission.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP jobs
	 */
	@Query(value = "SELECT * FROM mljobs "
			+ "WHERE streaming_service=:name AND organization=:org AND job_status IN ('COMPLETED', 'ERROR', 'RUNNING') "
			+ "ORDER BY submitted_on DESC LIMIT 1;", nativeQuery = true)
	ICIPJobs findByJobNameAndOrganizationByLastSubmission(@Param("name") String name, @Param("org") String org);

	/**
	 * Find by hashparams.
	 *
	 * @param hashparams the hashparams
	 * @return the ICIP jobs
	 */
	@Query(value = "SELECT * FROM mljobs "
			+ "WHERE hashparams=:params ORDER BY submitted_on DESC LIMIT 1;", nativeQuery = true)
	ICIPJobs findByHashparams(@Param("params") String hashparams);

	/**
	 * Gets the all hidden logs.
	 *
	 * @param org the org
	 * @return the all hidden logs
	 */
	@Query(value = "SELECT job_id as jobid, job_name as alias, 'chain' as jobtype FROM mlchainjobs WHERE mlchainjobs.organization=:org AND "
			+ "mlchainjobs.jobhide = 1 UNION ALL SELECT job_id as jobid, (SELECT DISTINCT CONCAT(name, ';', alias) FROM mlpipeline WHERE mljobs.streaming_service = mlpipeline.name AND mljobs.organization=:org AND mljobs.organization = mlpipeline.organization) as alias, 'pipeline' as jobtype "
			+ "FROM mljobs WHERE mljobs.organization=:org AND mljobs.jobhide = 1 UNION ALL SELECT "
			+ "jobid as jobid, jobname as alias, 'internal' as jobtype FROM mlinternaljobs WHERE mlinternaljobs.organization=:org "
			+ "AND mlinternaljobs.jobhide = 1 UNION ALL SELECT job_id as jobid, cname as alias, 'agent' as jobtype FROM "
			+ "mlagentjobs WHERE mlagentjobs.organization=:org AND mlagentjobs.jobhide = 1", nativeQuery = true)
	List<IHiddenJobs> getAllHiddenLogs(@Param("org") String org);

	/**
	 * Delete older data.
	 *
	 * @param days the days
	 */
	@Transactional
	@Modifying
	@Query(value = "DELETE FROM mljobs WHERE DATEDIFF(NOW(), submitted_on)>:days", nativeQuery = true)
	void deleteOlderData(@Param("days") int days);

	@Query(value = "SELECT job_status FROM mljobs "
			+ "WHERE job_id LIKE CONCAT(:jobid, '%')", nativeQuery = true)
	String getJobStatus(@Param("jobid") String jobid);
	
	@Query(value = "SELECT job_status FROM mljobs "
			+ "WHERE correlationid= :corelid", nativeQuery = true)
	String getEventStatus(@Param("corelid") String corelid);
	
	@Query(value = "SELECT * FROM mljobs ", nativeQuery = true)
	List<ICIPJobs> getAllJobs();
	
	@Query(value = "SELECT jobid, alias, submittedby, submittedon, jobstatus, runtime, jobtype, finishtime,"
			+ "jobmetadata, TYPE FROM "
			+ "(SELECT job_id AS jobid, job_name AS alias, submitted_by AS "
			+ "submittedby, submitted_on AS submittedon, job_status AS jobstatus, 'local' AS runtime, "
			+ "'chain' AS jobtype, finishtime AS finishtime, CONCAT('\\\"', jobmetadata, '\\\"') AS jobmetadata, "
			+ "(SELECT DISTINCT CASE WHEN mlchains.parallelchain = 1 THEN 'Parallel Chain' ELSE 'Sequential Chain' "
			+ "END FROM mlchains WHERE mlchainjobs.job_name = mlchains.job_name) AS TYPE FROM mlchainjobs "
			+ "WHERE mlchainjobs.organization=:org AND mlchainjobs.job_name NOT IN (SELECT DISTINCT(job_name) "
			+ "FROM mlchainjobs WHERE mlchainjobs.jobhide = 1 AND mlchainjobs.organization=:org) "
			+ "UNION ALL SELECT job_id AS jobid, "
			+ "(SELECT DISTINCT CONCAT(mlpipeline.name, ',', alias) FROM mlpipeline WHERE "
			+ " mljobs.organization=:org AND mljobs.organization=mlpipeline.organization AND mlpipeline.name =mljobs.streaming_service) "
			+ "AS alias, submitted_by AS submittedby, submitted_on AS submittedon, job_status AS jobstatus, "
			+ "runtime AS runtime, 'pipeline' AS jobtype, finishtime AS finishtime, "
			+ "CONCAT('\\\"', jobmetadata, '\\\"') AS jobmetadata, (SELECT DISTINCT mlpipeline.TYPE FROM mlpipeline "
			+ "WHERE mljobs.streaming_service=mlpipeline.name AND mljobs.organization=:org AND "
			+ "mljobs.organization=mlpipeline.organization) AS TYPE FROM mljobs WHERE "
			+ "mljobs.organization=:org  AND mljobs.jobmetadata NOT ILIKE '%\\\"CHAIN\\\"%' AND "
			+ "mljobs.streaming_service NOT IN (SELECT DISTINCT(streaming_service) FROM mljobs WHERE "
			+ "mljobs.jobhide IN (1) AND mljobs.organization =:org) "
			+ "UNION ALL SELECT jobid AS jobid, jobname AS alias, submittedby AS "
			+ "submittedby, submittedon AS submittedon, jobstatus AS jobstatus, 'local' AS runtime, "
			+ "'internal' AS jobtype, finishtime AS finishtime, CONCAT('\\\"', jobmetadata, '\\\"') AS "
			+ "jobmetadata, 'Internal Job' AS TYPE FROM mlinternaljobs WHERE mlinternaljobs.organization=:org "
			+ "AND mlinternaljobs.jobname NOT IN (SELECT DISTINCT(jobname) FROM mlinternaljobs WHERE "
			+ "mlinternaljobs.jobhide = 1 AND mlinternaljobs.organization=:org) "
			+ "UNION ALL SELECT job_id AS jobid, cname AS alias, submitted_by"
			+ " AS submittedby, submitted_on AS submittedon, job_status AS jobstatus, runtime AS runtime, "
			+ "'agent' AS jobtype, finishtime AS finishtime, CONCAT('\\\"', jobmetadata, '\\\"') AS jobmetadata,"
			+ "(SELECT TYPE FROM mlagents WHERE mlagentjobs.cname = mlagents.name) AS TYPE FROM "
			+ "mlagentjobs WHERE mlagentjobs.organization=:org AND mlagentjobs.cname NOT IN (SELECT "
			+ "DISTINCT(cname) FROM mlagentjobs WHERE mlagentjobs.jobhide = 1 AND mlagentjobs.organization=:org)) result "
			+ "WHERE CASE WHEN :filtercolumn = 'alias' THEN alias ILIKE CONCAT('%', :filtervalue, '%') "
			+ "WHEN :filtercolumn = 'jobid' THEN jobid ILIKE CONCAT('%', :filtervalue, '%')"
			+ "WHEN :filtercolumn = 'submittedby' THEN submittedby ILIKE CONCAT('%', :filtervalue, '%') "
			+ "WHEN :filtercolumn = 'jobstatus' THEN jobstatus ILIKE CONCAT('%', :filtervalue, '%')"
			+ "WHEN :filtercolumn = 'runtime' THEN runtime ILIKE CONCAT('%', :filtervalue, '%')"
			+ "WHEN :filtercolumn = 'submittedon' THEN TO_CHAR(submittedon, 'YYYY/MM/DD HH:MM') ILIKE CONCAT('%', :filterdate, '%')"
			+ "WHEN :filtercolumn = 'finishtime' THEN TO_CHAR(finishtime, 'YYYY/MM/DD HH:MM') ILIKE CONCAT('%', :filterdate, '%')"
			+ "WHEN :filtercolumn = '' THEN 1 = 1 END", nativeQuery = true)
	List<IJobLog> getCsvBySelectedColumnNames(@Param("org") String org, @Param("filtercolumn") String filtercolumn,
			@Param("filtervalue") String filtervalue, @Param("filterdate") String filterdate);
}
