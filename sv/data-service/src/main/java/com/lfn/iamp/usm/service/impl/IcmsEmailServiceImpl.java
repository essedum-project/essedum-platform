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

package com.lfn.iamp.usm.service.impl;

import java.sql.SQLException;
import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.json.JSONObject;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lfn.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.lfn.ai.comm.lib.util.service.dto.support.PageResponse;
import com.lfn.iamp.usm.domain.Email;
import com.lfn.iamp.usm.dto.EmailPartialDTO;
import com.lfn.iamp.usm.repository.EmailRepository;
import com.lfn.iamp.usm.service.IcmsEmailService;
import com.lfn.iamp.usm.service.ProjectService;

@Service
@Transactional
public class IcmsEmailServiceImpl implements IcmsEmailService {
	
	private final Logger log = LoggerFactory.getLogger(IcmsEmailServiceImpl.class);
	
	@Autowired
    private  EmailRepository emailRepository;
	
	@Autowired
	private ProjectService projectService;

	@Override
	public Email save(Email email) throws SQLException {
		log.debug("Request to save Email : {}", email);
        return emailRepository.save(email);
	}

	@Override
	@Transactional(readOnly = true)
	public Page<Email> findAll(Pageable pageable) throws SQLException {
		log.debug("Request to get all Emails");
		return emailRepository.findAll(pageable);
	}

	@Override
	public Email findOne(Integer id) throws SQLException {
		log.debug("Request to get Email : {}", id);
	    Email content = null;
	    Optional<Email> value = emailRepository.findById(id);
	    if (value.isPresent()) {
	    	content = toDTO(value.get(), 1);
	    }
	    return content;
	}

	@Override
	public void delete(Integer id) throws SQLException {
		log.debug("Request to delete Email : {}", id);
		emailRepository.deleteById(id);
	}

	@Override
	public PageResponse<Email> getAll(PageRequestByExample<Email> req) throws SQLException {
		log.debug("Request to get all Emails");
        Example<Email> example = null;
        Email email = req.getExample();

        if (email != null) {
            ExampleMatcher matcher = ExampleMatcher.matching() // example matcher for name,description,filename
                    .withMatcher("AlternateUser", match -> match.ignoreCase().startsWith())
                    .withMatcher("LoginId", match -> match.ignoreCase().startsWith())
                    .withMatcher("Comments", match -> match.ignoreCase().startsWith());

            example = Example.of(email, matcher);
        }

        Page<Email> page;
        if (example != null) {
            page =  emailRepository.findAll(example, req.toPageable());
        } else {
            page =  emailRepository.findAll(req.toPageable());
        }

        return new PageResponse<>(page.getTotalPages(), page.getTotalElements(), page.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
	}
	
	
	
	@Override
	public JSONArray getAttachmentsByCaseId(String caseId, String organization) {
	    List<Email> emails = emailRepository.findByCaseIdAndProjectId(caseId, projectService.findProjectByName(organization));
	    JSONArray attachments = new JSONArray();
	    Set<String> uniqueFilenames = new HashSet<>();
	    Set<String> uniqueFileIds = new HashSet<>();
	    emails.forEach(email -> {
	        if (email.getAttachments() != null && !email.getAttachments().isBlank()) {
	            JSONArray attach = new JSONArray(email.getAttachments());
	            if (attach != null) {
	                attach.forEach(obj -> {
	                    JSONObject attachment = (JSONObject) obj;
	                    // Normalize field names
	                    String filename = attachment.optString("filename", attachment.optString("fileName"));
	                    String fileid = attachment.optString("fileid", attachment.optString("fileId"));
	                    if (!uniqueFilenames.contains(filename) && !uniqueFileIds.contains(fileid)) {
	                        uniqueFilenames.add(filename);
	                        uniqueFileIds.add(fileid);
	                        // Remove redundant fields
	                        attachment.remove("fileName");
	                        attachment.remove("fileId");
	                        // Ensure consistent field names
	                        attachment.put("filename", filename);
	                        attachment.put("fileid", fileid);
	                        attachments.put(attachment);
	                    }
	                });
	            }
	        }
	    });
	    return attachments;
	}
	public Email toDTO(Email email) {
        return toDTO(email, 1);
    }

	@Override
	public Email toDTO(Email email, int depth) {
		if (email == null) {
            return null;
        }

		Email dto = new Email();
		dto.setId(email.getId());
		dto.setMailId(email.getMailId());
		dto.setEmail_from(email.getEmail_from());
		dto.setEmail_to(email.getEmail_to());
		dto.setEmail_cc(email.getEmail_cc());
		dto.setEmail_bcc(email.getEmail_bcc());
		dto.setEmail_subject(email.getEmail_subject());
		dto.setEmail_body(email.getEmail_body());
		dto.setAttachment_count(email.getAttachment_count());
		dto.setIs_incoming(email.getIs_incoming());
		dto.setIs_processed(email.getIs_processed());
		dto.setMail_type(email.getMail_type());
		dto.setMail_pushed_to_folder(email.getMail_pushed_to_folder());
		dto.setMail_box_name(email.getMail_box_name());
		dto.setSent_status(email.getSent_status());
		dto.setFailure_reason(email.getFailure_reason());
		dto.setSent_date(email.getSent_date());
		dto.setIs_active(email.getIs_active());
		dto.setIs_read_reciept(email.getIs_read_reciept());
		dto.setIs_delivery_notification(email.getIs_delivery_notification());
		dto.setMail_archival_path(email.getMail_archival_path());
		dto.setRef_id(email.getRef_id());
		dto.setNotification_mail_id(email.getNotification_mail_id());
		dto.setCaseId(email.getCaseId());
		dto.setIs_follow_up(email.getIs_follow_up());
		dto.setIsRead(email.getIsRead());
		dto.setImportance(email.getImportance());
		dto.setCreated_date(email.getCreated_date());
		dto.setLast_updated_date(email.getLast_updated_date());
		dto.setLocal_mail_archival_path(email.getLocal_mail_archival_path());
		dto.setRetry_count(email.getRetry_count());
		dto.setProjectId(projectService.toDTO(email.getProjectId(),depth));
		dto.setAttachments(email.getAttachments());
		
		return dto;
	}

	@Override
	public List<Email> findByCaseId(String caseId) {
		return emailRepository.findByCaseId(caseId);
	}

	
	@Override
	public List<EmailPartialDTO> findByCaseId(String caseId, Pageable pageable) {
		return emailRepository.findByCaseId(caseId, pageable);
	}
	
	@Override
	public List<EmailPartialDTO> findByEndUser(String user_email, Pageable pageable) {
		int index = user_email.indexOf('@');
		if (index > 0) {
		  user_email = user_email.substring(0, index);
		}
		
		return emailRepository.findByEndUser(user_email, pageable);
	}
	
	@Override
	public List<Email> findByCaseIdAndIsRead(String caseId, Boolean isRead) {
		return emailRepository.findByCaseIdAndIsRead(caseId, isRead);
	}
	
	@Override
	public List<Email> findByMailId(Integer mailId) {
		return emailRepository.findByMailId(mailId);
	}

	@Override
	public Set<String> matchEmail(String organization, String searchParameter) {
		return emailRepository.findCaseIdBySubjectLike(projectService.findProjectByName(organization).getId(), searchParameter);
	}
	
	@Override
	public List<Email> findOutgoingEmails(String status, Integer project_id) {
	return emailRepository.findEmailsByStatusAndProjectId(status, project_id);
	}

	@Override
	public List<EmailPartialDTO> findBySubjectAndSentDate(String subject, ZonedDateTime sentDate, Integer projectId) {
		subject = subject.replaceAll(" ", "").toLowerCase();
		try {
			return emailRepository.findBySubjectAndSentDate(subject, sentDate, projectService.findOne(projectId));
		} catch (SQLException e) {
			log.error(e.getMessage(), e);
		}
		return Collections.emptyList();
	}
	
	@Override
	public long countByCaseId(String caseId) {
		return emailRepository.countByCaseId(caseId);
	}
	
	@Override
	public Optional<Email> findById(Integer Id) {
		return emailRepository.findById(Id);
	}

	@Override
	public Set<String> matchEmail(String searchParameter) {
		return emailRepository.findCaseIdBySubjectOrBodyLike(searchParameter);
	}

	@Override
	public List<Email> findBySubject(String subject, Integer projectId) {
		subject = subject.replaceAll(" ", "").toLowerCase();
		return emailRepository.findBySubject(subject, projectId);
	}
	
	@Override
	public Set<String> findUniqueMailId(Integer projectId){
		return emailRepository.findUniqueMailId(projectId);
	}
}
