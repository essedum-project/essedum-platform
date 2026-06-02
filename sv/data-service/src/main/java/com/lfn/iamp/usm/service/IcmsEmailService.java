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

package com.lfn.iamp.usm.service;

import java.sql.SQLException;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.lfn.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.lfn.ai.comm.lib.util.service.dto.support.PageResponse;
import com.lfn.iamp.usm.domain.Email;
import com.lfn.iamp.usm.dto.EmailPartialDTO;

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
