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

package com.lfn.iamp.usm.web.rest;

import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import jakarta.persistence.EntityNotFoundException;

import org.hibernate.exception.ConstraintViolationException;
//import org.json.JSONException;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lfn.ai.comm.lib.util.HeaderUtil;
import com.lfn.ai.comm.lib.util.PaginationUtil;
import com.lfn.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.lfn.ai.comm.lib.util.service.dto.support.PageResponse;
import com.lfn.iamp.usm.config.Constants;
import com.lfn.iamp.usm.config.Messages;
import com.lfn.iamp.usm.domain.Email;
import com.lfn.iamp.usm.dto.EmailDTO;
import com.lfn.iamp.usm.dto.EmailPartialDTO;
import com.lfn.iamp.usm.service.IcmsEmailService;
import com.lfn.iamp.usm.util.PageRequestCustomOffset;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Parameter;

@RestController
@Hidden
@RequestMapping("/api")
public class EmailResource {

	private final Logger log = LoggerFactory.getLogger(EmailResource.class);
	
	private static final String ENTITY_NAME = "Email";
	
	@Autowired
	private IcmsEmailService emailService;
	
	@GetMapping("/emails/page")
	@Timed
	public ResponseEntity<?> getAllEmails(@RequestHeader(value = "example") String requestkey)
			throws UnsupportedEncodingException, JsonMappingException, JsonProcessingException {
		log.info("getAllEmails : REST request to get a page of Emails");
		try {

			String decodedvalue = new String(Base64.getDecoder().decode(requestkey), "UTF-8");
			ObjectMapper objectMapper = new ObjectMapper();
			objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
			PageRequestByExample<Email> prbe = objectMapper.readValue(decodedvalue,
					new TypeReference<PageRequestByExample<Email>>() {
					});
			if (prbe.getLazyLoadEvent() == null) {
				return new ResponseEntity<String>("Please provide lazy load event", new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			}

			PageResponse<Email> pageResponse = emailService.getAll(prbe);
			log.info("getAllEmails : Page of Emails fetched successfully");
			return new ResponseEntity<>(pageResponse, new HttpHeaders(), HttpStatus.OK);
		} catch (SQLException | EntityNotFoundException e) {
			log.error(new StringBuffer("Exception ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (ArithmeticException e) {
			log.error(new StringBuffer("ArithmeticException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_LAZY_LOAD_EVENT), new HttpHeaders(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	@PostMapping("/email")
	@Timed
	public ResponseEntity<?> createEmail(@RequestBody EmailDTO emailDTO) throws URISyntaxException {
		try {
			log.info("createEmail : REST request to save Email with Id: {}", emailDTO.getId());
			log.debug("REST request to save Email : {}", emailDTO);
			if (emailDTO.getId() != null) {
				return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "Id exists",
						"A new Email cannot already have an Id")).body(null);
			}
			ModelMapper modelMapper = new ModelMapper();
			Email email = modelMapper.map(emailDTO, Email.class);
			Email result = emailService.save(email);
			if (result == null) {
				return new ResponseEntity<String>("Email could not be created", new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			} else
				log.info("createEmail : Email saved successfully with ID: {}", result.getId()
						);
			return ResponseEntity.created(new URI(new StringBuffer("/api/email/").append(result.getId()).toString()))
					.headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString())).body(result);

		} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException e) {
			log.error(new StringBuffer("Exception ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "Email"), new HttpHeaders(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	@PutMapping("/email")
	@Timed
	public ResponseEntity<?> updateEmail(@RequestBody EmailDTO emailDTO) throws URISyntaxException {
		try {
			log.info("updateEmail : REST request to update Email for ID: {} ", emailDTO.getId());
			log.debug("REST request to update Email : {}", emailDTO);
			if (emailDTO.getId() == null) {
				return createEmail(emailDTO);
			}
			ModelMapper modelMapper = new ModelMapper();
			Email email = modelMapper.map(emailDTO, Email.class);
			Email result = emailService.save(email);
			if (result == null) {
				return new ResponseEntity<String>("Email could not be updated", new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			} else
				log.info("updateEmail : Email Updated successfully for ID: {} ", result.getId());
			return ResponseEntity.ok()
					.headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, email.getId().toString())).body(result);

		} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException
				| EntityNotFoundException e) {
			log.error(new StringBuffer("Exception ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "Email"), new HttpHeaders(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	
	@GetMapping("/emails")
	@Timed
	public ResponseEntity<?> getAllEmails(@Parameter Pageable pageable) {
		try {
			log.info("getAllEmails : REST request to get a page of Emails");
			log.debug("REST request to get a page of Emails");
			Page<Email> page = emailService.findAll(pageable);
			HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/emails");
			log.info("getAllEmails : Page of Emails fetched successfully");
			return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
		} catch (SQLException | EntityNotFoundException e) {
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	@GetMapping("/email/{id}")
	@Timed
	public ResponseEntity<?> getEmail(@PathVariable Integer id) {
		try {
			log.info("getEmail : REST request to get Email by ID: {} ", id);
			log.debug("REST request to get Email : {}", id);
			Email email = emailService.findOne(id);

			if (email == null) {
				return new ResponseEntity<String>(new StringBuffer("Email entity with id ").append(id).append(" does not exists!").toString(),
						new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
			} else
				log.info("getEmail : REST request to get Email successfull for ID: {} ", email.getId());
			return new ResponseEntity<>(email, new HttpHeaders(), HttpStatus.OK);

		} catch (SQLException | ArithmeticException e) {
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@GetMapping("/emailsByCaseId/{caseId}/{offset}/{source}/{user_email}")
	@Timed
	public ResponseEntity<?> getEmailsByCaseId(
			Pageable pageable,
			@PathVariable String caseId,
			@PathVariable Boolean offset,
			@PathVariable String source,
			@PathVariable String user_email
			) {
		try {
			log.info("getEmailByCaseId : REST request to get Email by Case ID: {} ", caseId);
			log.debug("REST request to get Email by Case ID : {}", caseId);
			PageRequestCustomOffset pagerequest;
			List<EmailPartialDTO> emails = List.of();
			
			if(source == "enduser") {
				if(offset == true) {
					pagerequest = new PageRequestCustomOffset(pageable.getPageNumber(),pageable.getPageSize(), pageable.getSort());
					emails = emailService.findByEndUser(user_email, pagerequest);
				}else {
					 emails = emailService.findByEndUser(user_email, pageable);
				}
			}
		
			else {
				
			if(offset == true) {
				pagerequest = new PageRequestCustomOffset(pageable.getPageNumber(),pageable.getPageSize(), pageable.getSort());
				emails = emailService.findByCaseId(caseId, pagerequest);
			}else {
				 emails = emailService.findByCaseId(caseId, pageable);
			}
				}
			
			if (emails == null || emails.size()==0) {
				return new ResponseEntity<String>(new StringBuffer("Email entity with caseId ").append(caseId).append(" does not exists!").toString(),
						new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
			} else
				log.info("getEmailByCaseId : REST request to get Email successfull for Case ID: {} ", caseId);
			return new ResponseEntity<>(emails, new HttpHeaders(), HttpStatus.OK);

		} catch (ArithmeticException e) {
			log.error(new StringBuffer("ArithmeticException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@DeleteMapping("/email/{id}")
	@Timed
	public ResponseEntity<?> deleteEmail(@PathVariable Integer id) {
		try {
			log.info("deleteEmail : REST request to delete Email by ID: {} ", id);
			log.debug("REST request to delete Email : {}", id);
			emailService.delete(id);
			log.info("deleteEmail : Email deleted successfully by ID: {} ", id);
			return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString()))
					.build();

		} catch (EmptyResultDataAccessException e) {
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(new StringBuffer("Email entity with id ").append(id).append(" does not exists!").toString(), 
					new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (SQLException e) {
			log.error(new StringBuffer("Exception ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}
	
	@GetMapping("/email/getAttachments/{caseId}/{organization}")
	@Timed
	public ResponseEntity<?> getAttachmentsByCaseId(@PathVariable String caseId, @PathVariable String organization) {
		try {
			List<Object> attachments = emailService.getAttachmentsByCaseId(caseId, organization).toList();
			return new ResponseEntity<List<Object>>(attachments, HttpStatus.OK);
		} catch (Exception e) {
			log.error("Error fetching email attachments", e);
			List<Object> attachments = new ArrayList<>();
			attachments.add("Error fetching email attachments: " + e.getMessage());
			return new ResponseEntity<List<Object>>(attachments, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	@GetMapping("/getEmailCountByCaseId/{caseId}")
	@Timed
	public ResponseEntity<?> getEmailCountByCaseId(@PathVariable String caseId) {
		try {
			log.info("getEmailByCaseId : REST request to get Email by Case ID: {} ", caseId);
			log.debug("REST request to get Email by Case ID : {}", caseId);
			long count = emailService.countByCaseId(caseId); 

			if (count==0) {
				return new ResponseEntity<String>(new StringBuffer("Email entity with caseId ").append(caseId).append(" does not exists!").toString(),
						new HttpHeaders(), HttpStatus.OK);
			} else
				log.info("getEmailByCaseId : REST request to get Email Count successfull for Case ID: {} ", count);
			return new ResponseEntity<>(count, new HttpHeaders(), HttpStatus.OK);

		} catch (Exception  e) {
			log.error(new StringBuffer("Exception").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	@GetMapping("/emailsDetailsById/{Id}")
	@Timed
	public ResponseEntity<?> getEmailDetailsById(
			@PathVariable String Id

			) {
		try {
			log.info("getEmailByCaseId : REST request to get Email by Case ID: {} ", Id);
			log.debug("REST request to get Email by ID : {}", Id);
			PageRequestCustomOffset pagerequest;
			Optional<Email> emails = emailService.findById(Integer.valueOf(Id));
			
			if (emails == null) {
				return new ResponseEntity<String>(new StringBuffer("Email entity with caseId ").append(Id).append(" does not exists!").toString(),
						new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
			} else
				log.info("getEmailByCaseId : REST request to get Email successfull for Case ID: {} ", Id);
			return new ResponseEntity<>(emails, new HttpHeaders(), HttpStatus.OK);

		} catch (Exception e) {
			log.error(new StringBuffer("Exception ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	@GetMapping("/getUniqueMailId/{projectId}")
	@Timed
	public ResponseEntity<?> getUniqueMailId(@PathVariable Integer projectId) {
		try {
			log.info("getUniqueMailId : REST request to get Unique mail Ids");
			Set<String> mailId = emailService.findUniqueMailId(projectId);
 
			if (mailId.isEmpty()) {
				return new ResponseEntity<String>(new StringBuffer("No Mail Ids found").toString(),
						new HttpHeaders(), HttpStatus.OK);
			} else
				log.info("getUniqueMailId : REST request to get Unique MailIds successfull");
			return new ResponseEntity<>(mailId, new HttpHeaders(), HttpStatus.OK);
 
		} catch (Exception  e) {
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

}




	

