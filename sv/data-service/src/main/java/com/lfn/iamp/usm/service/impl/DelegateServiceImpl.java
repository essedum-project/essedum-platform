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

//package com.lfn.iamp.usm.service.impl;
//
//import java.security.KeyManagementException;
//import java.security.KeyStoreException;
//import java.security.NoSuchAlgorithmException;
//import java.sql.SQLException;
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.Optional;
//import java.util.stream.Collectors;
//
//import org.apache.http.ProtocolException;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.data.domain.Example;
//import org.springframework.data.domain.ExampleMatcher;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.Pageable;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import com.lfn.ai.comm.lib.util.service.dto.support.PageRequestByExample;
//import com.lfn.ai.comm.lib.util.service.dto.support.PageResponse;
//import com.lfn.iamp.usm.domain.Delegate;
//import com.lfn.iamp.usm.domain.Email;
//import com.lfn.iamp.usm.repository.DelegateRepository;
//import com.lfn.iamp.usm.service.DelegateService;
//import com.lfn.iamp.usm.service.IcmsEmailService;
//import com.lfn.iamp.usm.service.ProjectService;
//import com.lfn.iamp.usm.service.RoleService;
//
//@Service
//@Transactional
//public class DelegateServiceImpl implements DelegateService{
//
//	private final Logger log = LoggerFactory.getLogger(DelegateServiceImpl.class);
//
//	@Autowired
//	private  DelegateRepository delegateRepository;
//
//	@Autowired
//	EmailServiceImpl mailService;
//
//	@Autowired
//	IcmsEmailService icmsEmailService;
//
//	@Autowired
//	private RoleService roleService;
//	
//	@Autowired
//	private ProjectService projectService;
//
//	public DelegateServiceImpl() {
//
//	}
//
//	public DelegateServiceImpl(DelegateRepository delegateRepository, EmailServiceImpl mailService, IcmsEmailService icmsEmailService, RoleService roleService, ProjectService projectService) {
//		this.delegateRepository = delegateRepository;
//		this.mailService = mailService;
//		this.icmsEmailService = icmsEmailService;
//		this.roleService = roleService;
//		this.projectService = projectService;
//	}
//
//	@Override
//	public Delegate save(Delegate delegate) throws SQLException, KeyManagementException, NoSuchAlgorithmException, KeyStoreException, ProtocolException {
//		log.debug("Request to save Delegate : {}", delegate);
//		Boolean overlappingRange = false;
//		overlappingRange = checkForOverlappignRange(delegate);
//		if(overlappingRange) {
//			log.info("DateTime Ranges are overlapping, abort save");
//			return null;
//		} else {
//			log.info("DateTime Ranges are not overlapping, proceed with save");
//			Delegate delegateSaved = delegateRepository.save(delegate);
//			if(delegate.getNotifyViaMail()==true) {
//				mailService.sendMail(delegate.getTo(), delegate.getSubject(), delegate.getMessage(), delegate.getCc());
//				Email icmsEmail = new Email();
//				icmsEmail.setEmail_from(delegate.getFrom());
//				icmsEmail.setEmail_to(delegate.getTo());
//				icmsEmail.setEmail_cc(delegate.getCc());
//				icmsEmail.setEmail_subject(delegate.getSubject());
//				icmsEmail.setEmail_body(delegate.getMessage());
//				icmsEmail.setAttachment_count(0);
//				icmsEmail.setIs_processed(false);  // To ask
//				icmsEmail.setMail_type("mail type text"); // To ask
//				LocalDateTime ldObj = LocalDateTime.now();
//				icmsEmail.setSent_date(ldObj);
//				icmsEmail.setIs_active(true);
//				icmsEmail.setProject_id(delegate.getProject_id());
//				Email savedemail = icmsEmailService.save(icmsEmail);
//			}
//			return delegateSaved;
//		}
//	}
//
//	@Override
//	@Transactional(readOnly = true)
//	public Page<Delegate> findAll(Pageable pageable) throws SQLException {
//		log.debug("Request to get all Delegates");
//		return delegateRepository.findAll(pageable);
//	}
//
//	@Override
//	@Transactional(readOnly = true)
//	public Delegate findOne(Integer id) throws SQLException {
//		log.debug("Request to get Delegate : {}", id);
//		Delegate content = null;
//		Optional<Delegate> value = delegateRepository.findById(id);
//		if (value.isPresent()) {
//			content = toDTO(value.get(), 1);
//		}
//		return content;
//	}
//
//	@Override
//	public void delete(Integer id) throws SQLException {
//		log.debug("Request to delete Delegate : {}", id);
//		delegateRepository.deleteById(id);
//	}
//
//	@Override
//	@Transactional(readOnly = true)
//	public PageResponse<Delegate> getAll(PageRequestByExample<Delegate> req) throws SQLException {
//		log.debug("Request to get all Delegates");
//		Example<Delegate> example = null;
//		Delegate delegate = req.getExample();
//
//		if (delegate != null) {
//			ExampleMatcher matcher = ExampleMatcher.matching() // example matcher for name,description,filename
//					.withMatcher("AlternateUser", match -> match.ignoreCase().startsWith())
//					.withMatcher("LoginId", match -> match.ignoreCase().startsWith())
//					.withMatcher("Comments", match -> match.ignoreCase().startsWith());
//
//			example = Example.of(delegate, matcher);
//		}
//
//		Page<Delegate> page;
//		if (example != null) {
//			page =  delegateRepository.findAll(example, req.toPageable());
//		} else {
//			page =  delegateRepository.findAll(req.toPageable());
//		}
//
//		List<Delegate> content = page.getContent().stream().map(this::toDTO).collect(Collectors.toList());
//		return new PageResponse<>(page.getTotalPages(), page.getTotalElements(), content);
//	}
//
//	public Delegate toDTO(Delegate delegate) {
//		return toDTO(delegate, 1);
//	}
//
//	public Delegate toDTO(Delegate delegate, int depth) {
//		if (delegate == null) {
//			return null;
//		}
//
//		Delegate dto = new Delegate();
//		dto.setId(delegate.getId());
//		dto.setLogin_id(delegate.getLogin_id());
//		dto.setProcess_id(delegate.getProcess_id());
//		dto.setIs_delegate(delegate.getIs_delegate());
//		dto.setAlternate_user(delegate.getAlternate_user());
//		dto.setStart_time(delegate.getStart_time());
//		dto.setEnd_time(delegate.getEnd_time());
//		dto.setReason(delegate.getReason());
//		dto.setComments(delegate.getComments());
//		dto.setLast_updated_user(delegate.getLast_updated_user());
//		dto.setLast_updated_date(delegate.getLast_updated_date());
//		dto.setIs_active(delegate.getIs_active());
//		dto.setRole_id(roleService.toDTO(delegate.getRole_id(), depth));
//		dto.setProject_id(projectService.toDTO(delegate.getProject_id(),depth));
//
//		return dto;
//	}
//
//	public Boolean checkForOverlappignRange(Delegate delegate) {
//		Boolean overlappingRange = false;
//		List<Delegate> delegateList = delegateRepository.findByProcessIdAndLoginId(delegate.getProcess_id(), delegate.getLogin_id().getId(), delegate.getProject_id().getId());
//		if(delegateList.size()>0) {
//			
//			LocalDateTime startTime = delegate.getStart_time();
//			LocalDateTime endTime = delegate.getEnd_time();
//			Boolean sameRangeFound = false;
//			
//			for(int i = 0 ; i < delegateList.size() ; i++) {
//				Delegate element = delegateList.get(i);
//				LocalDateTime element_st = element.getStart_time();
//				LocalDateTime element_et = element.getEnd_time();
//				
//				// if matching slot - check by is_active
//				if(startTime.isEqual(element_st) && endTime.isEqual(element_et)) {
//					if(delegate.getId()==null) {
//						sameRangeFound = true;
//						if(element.getIs_active()==true) {
//							overlappingRange = true;
//						} else {
//							overlappingRange = false;
//						}
//					}
//					else {
//						if(delegate.getId() != element.getId()) {
//							sameRangeFound = true;
//							if(element.getIs_active()==true) { // if any delegate is already active for this same range
//								overlappingRange = true; // range may not overlap but need to set this as true
//								return overlappingRange;
//							}
//						}
//					}
//				}
//				
//				if(sameRangeFound==false) {
//					// if unmatched slots - check for overlapping
//					if(startTime.isBefore(element_st) && endTime.isEqual(element_st))
//						overlappingRange = false;
//					else if(startTime.isEqual(element_et) && endTime.isAfter(element_et))
//						overlappingRange = false;
//					else if(startTime.isBefore(element_st) && endTime.isBefore(element_st))
//						overlappingRange = false;
//					else if(startTime.isAfter(element_et) && endTime.isAfter(element_et))
//						overlappingRange = false;
//					else if(delegate.getId() == null)
//						overlappingRange = true;
//				}
//			}
//
//		} else {
//			overlappingRange = false;
//		}
//		return overlappingRange;
//	}
//	
//	public List<Delegate> getDelegatesByLoginId(Integer loginId, Integer projectId) throws SQLException{
//		log.info("Request To fetch Delegates by login_id");
//		List<Delegate> delegateList = delegateRepository.findAllByLoginId(loginId, projectId).stream()
//				.map(this::toDTO).collect(Collectors.toList());
//		return delegateList;
//	}
//}

