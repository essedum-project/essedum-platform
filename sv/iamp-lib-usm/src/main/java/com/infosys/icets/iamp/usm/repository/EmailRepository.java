/**
 * @ 2023 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.iamp.usm.repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import jakarta.transaction.Transactional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.iamp.usm.domain.Email;
import com.infosys.icets.iamp.usm.domain.Project;
import com.infosys.icets.iamp.usm.dto.EmailPartialDTO;

@Repository("usmEmailRepository")
public interface EmailRepository extends JpaRepository<Email, Integer> {

	List<Email> findByCaseId(String caseId);

	List<Email> findByCaseIdAndIsRead(String caseId, Boolean isRead);
	
//	List<Email> findByCaseId(String caseId, Pageable pageable);

	List<Email> findByCaseIdAndProjectId(String caseId, Project project);

	List<Email> findByMailId(Integer mailId); 
	
	long countByCaseId(String caseId);
	
	Optional<Email> findById(Integer Id);

	@Query(value = "select e.case_id from usm_emails e where e.project_id = :projectId and e.email_subject LIKE %:searchParameter%", nativeQuery = true)
	Set<String> findCaseIdBySubjectLike(@Param("projectId") Integer projectId,
			@Param("searchParameter") String searchParameter);

	@Query(value = "select * from usm_emails e where e.sent_status = :status and e.project_id = :projectId", nativeQuery = true)
	List<Email> findEmailsByStatusAndProjectId(@Param("status") String status, @Param("projectId") Integer projectId);

	@Query(value = "select new com.infosys.icets.iamp.usm.dto.EmailPartialDTO(e.id, e.mailId, e.email_from, e.email_to, e.email_cc, e.email_bcc, e.email_subject, e.sent_date, e.caseId) from Email e where e.projectId = :projectId and e.sent_date >= :sent_date and (LOWER(REPLACE(e.email_subject,' ','')) = :subject or LOWER(REPLACE(e.email_subject,' ','')) = CONCAT('re:',:subject) or LOWER(REPLACE(e.email_subject,' ','')) = CONCAT('fw:',:subject))")
	List<EmailPartialDTO> findBySubjectAndSentDate(@Param("subject") String subject,
			@Param("sent_date") ZonedDateTime sentDate, @Param("projectId") Project projectId);
	
	@Query(value = "select new com.infosys.icets.iamp.usm.dto.EmailPartialDTO(e.id, e.email_from, e.email_subject,e.mail_type,  e.sent_status, e.sent_date, e.caseId ,e.isRead) from Email e where e.caseId = :caseId")
	List<EmailPartialDTO> findByCaseId(@Param("caseId") String caseId, Pageable pageable);
	
	@Query(value = "select new com.infosys.icets.iamp.usm.dto.EmailPartialDTO(e.id, e.email_from, e.email_subject,e.mail_type,  e.sent_status, e.sent_date, e.caseId ,e.isRead) from Email e where e.caseId = :caseId and (e.email_to = 'EndUser' or e.email_to LIKE :user_email or e.email_from LIKE :user_email or e.email_cc LIKE :user_email or e.email_bcc LIKE :user_email)")
	List<EmailPartialDTO> findByEndUser(@Param("user_email") String user_email, Pageable pageable);
	
    @Transactional
    void deleteByCaseIdIn(@Param("caseIdList") List<String> statusList);
    
    List<Email> findByCaseIdIn(List<String> caseIdList);
    
    @Query(value = "select distinct e.email_from AS emailidlist FROM usm_emails e WHERE e.email_from IS NOT NULL AND e.email_from != '' AND e.project_id = :projectId UNION ALL (select distinct e.email_to FROM usm_emails e WHERE e.email_to IS NOT NULL AND e.email_to != '' AND e.project_id = :projectId) UNION ALL (select distinct e.email_cc FROM usm_emails e WHERE e.email_cc IS NOT NULL AND e.email_cc != '' AND e.project_id = :projectId) UNION ALL (select distinct e.email_bcc FROM usm_emails e WHERE e.email_bcc IS NOT NULL AND e.email_bcc != '' AND e.project_id = :projectId)", nativeQuery = true)
    Set<String> findUniqueMailId(@Param("projectId") Integer projectId);

	@Query(value="select e.case_id from usm_emails e where e.email_subject LIKE %:searchParameter% OR e.email_body LIKE %:searchParameter%",nativeQuery=true)
	Set<String> findCaseIdBySubjectOrBodyLike(@Param("searchParameter") String searchParameter);

    @Query(value="select * from usm_emails e where (LOWER(REPLACE(e.email_subject,' ','')) = :subject or LOWER(REPLACE(e.email_subject,' ','')) = CONCAT('re:',:subject) or LOWER(REPLACE(e.email_subject,' ','')) = CONCAT('fw:',:subject)) and e.project_id = :projectId", nativeQuery=true)
	List<Email> findBySubject(@Param("subject") String subject, @Param("projectId") Integer projectId);
}
