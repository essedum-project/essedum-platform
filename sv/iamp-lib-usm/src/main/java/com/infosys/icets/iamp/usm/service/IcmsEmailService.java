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
package com.infosys.icets.iamp.usm.service;

import java.sql.SQLException;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.domain.Email;
import com.infosys.icets.iamp.usm.dto.EmailPartialDTO;

import org.json.JSONArray;

public interface IcmsEmailService {

	Email save(Email email) throws SQLException;

	Page<Email> findAll(Pageable pageable) throws SQLException;

	Email findOne(Integer id) throws SQLException;

	void delete(Integer id) throws SQLException;

	PageResponse<Email> getAll(PageRequestByExample<Email> req) throws SQLException;

	public Email toDTO(Email email, int depth);

	public List<Email> findByCaseId(String caseId);

	public List<Email> findByMailId(Integer mailId);

	Set<String> matchEmail(String organization, String searchParameter);

	public List<Email> findByCaseIdAndIsRead(String caseId, Boolean isRead);

	JSONArray getAttachmentsByCaseId(String caseId, String organization);

	public List<Email> findOutgoingEmails(String status, Integer project_id);

	public List<EmailPartialDTO> findBySubjectAndSentDate(String subject, ZonedDateTime sentDate, Integer project_id);
	
//	public List<Email> findByCaseId(String caseId, Pageable pageable);
	
	public long  countByCaseId(String CaseId);
	
	Optional<Email> findById(Integer Id);
	
	public List<EmailPartialDTO> findByCaseId(String caseId, Pageable pageable);

	public List<EmailPartialDTO> findByEndUser(String user_email, Pageable pageable);
	

	Set<String> matchEmail(String searchParameter);

	public List<Email> findBySubject(String subject, Integer project_id);
	
	public Set<String> findUniqueMailId(Integer projectId);
	
}
