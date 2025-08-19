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

//package com.lfn.iamp.usm.web.rest;
//
//import java.io.UnsupportedEncodingException;
//import java.net.URI;
//import java.net.URISyntaxException;
//import java.security.KeyManagementException;
//import java.security.KeyStoreException;
//import java.security.NoSuchAlgorithmException;
//import java.sql.SQLException;
//import java.util.Base64;
//import java.util.List;
//
//import jakarta.persistence.EntityNotFoundException;
//
//import org.apache.http.ProtocolException;
//import org.hibernate.exception.ConstraintViolationException;
//import org.modelmapper.ModelMapper;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.dao.DataIntegrityViolationException;
//import org.springframework.dao.EmptyResultDataAccessException;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.Pageable;
//import org.springframework.http.HttpHeaders;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.DeleteMapping;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.PutMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestHeader;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import com.fasterxml.jackson.core.JsonProcessingException;
//import com.fasterxml.jackson.core.type.TypeReference;
//import com.fasterxml.jackson.databind.DeserializationFeature;
//import com.fasterxml.jackson.databind.JsonMappingException;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.lfn.ai.comm.lib.util.HeaderUtil;
//import com.lfn.ai.comm.lib.util.PaginationUtil;
//import com.lfn.ai.comm.lib.util.service.dto.support.PageRequestByExample;
//import com.lfn.ai.comm.lib.util.service.dto.support.PageResponse;
//import com.lfn.iamp.usm.config.Constants;
//import com.lfn.iamp.usm.config.Messages;
//import com.lfn.iamp.usm.domain.Delegate;
//import com.lfn.iamp.usm.dto.DelegateDTO;
//import com.lfn.iamp.usm.service.DelegateService;
//
//import io.micrometer.core.annotation.Timed;
//import io.swagger.v3.oas.annotations.Parameter;
//import io.swagger.v3.oas.annotations.Hidden;
//
//@RestController
//@Hidden
//@RequestMapping("/api")
//public class DelegateResource {
//
//	private final Logger log = LoggerFactory.getLogger(DelegateResource.class);
//
//	private static final String ENTITY_NAME = "delegate";
//
//	private final DelegateService delegateService;
//
//	public DelegateResource(DelegateService delegateService) {
//		this.delegateService = delegateService;
//	}
//
//	@GetMapping("/delegates/page")
//	@Timed
//	public ResponseEntity<?> getAllDelegates(@RequestHeader(value = "example") String requestkey)
//			throws UnsupportedEncodingException, JsonMappingException, JsonProcessingException {
//		log.info("getAllDelegates : REST request to get a page of delegates");
//		try {
//
//			String decodedvalue = new String(Base64.getDecoder().decode(requestkey), "UTF-8");
//			ObjectMapper objectMapper = new ObjectMapper();
//			objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
//			PageRequestByExample<Delegate> prbe = objectMapper.readValue(decodedvalue,
//					new TypeReference<PageRequestByExample<Delegate>>() {
//			});
//			if (prbe.getLazyLoadEvent() == null) {
//				return new ResponseEntity<String>("Please provide lazy load event", new HttpHeaders(),
//						HttpStatus.INTERNAL_SERVER_ERROR);
//			}
//
//			PageResponse<Delegate> pageResponse = delegateService.getAll(prbe);
//			log.info("getAllDelegates : Page of delegates fetched successfully");
//			return new ResponseEntity<>(pageResponse, new HttpHeaders(), HttpStatus.OK);
//		} catch (SQLException | EntityNotFoundException e) {
//			log.error(new StringBuffer("Exception ").append(e.getClass().getName()).append(": ").append(e).toString());
//			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
//		} catch (ArithmeticException e) {
//			log.error(new StringBuffer("ArithmeticException ").append(e.getClass().getName()).append(": ").append(e).toString());
//			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_LAZY_LOAD_EVENT), new HttpHeaders(),
//					HttpStatus.INTERNAL_SERVER_ERROR);
//		}
//	}
//
//	@PostMapping("/delegate")
//	@Timed
//	public ResponseEntity<?> createDelegate(@RequestBody DelegateDTO delegate_dto) throws URISyntaxException, ProtocolException {
//		try {
//			log.info("createDelegate : REST request to save Delegate with Name: {}", delegate_dto.getLogin_id());
//			log.debug("REST request to save Delegate : {}", delegate_dto);
//			if (delegate_dto.getId() != null) {
//				return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "Id exists",
//						"A new delegate cannot already have an Id")).body(null);
//			}
//			ModelMapper modelMapper = new ModelMapper();
//			Delegate delegate = modelMapper.map(delegate_dto, Delegate.class);
//			Delegate result = delegateService.save(delegate);
//			if (result == null) {
//				return new ResponseEntity<String>("Delegate could not be created", new HttpHeaders(),
//						HttpStatus.INTERNAL_SERVER_ERROR);
//			} else
//				log.info("createDelegate : Delegate saved successfully with ID: {}", result.getId()
//						);
//			return ResponseEntity.created(new URI(new StringBuffer("/api/delegates/").append(result.getId()).toString()))
//					.headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString())).body(result);
//
//		} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException | KeyStoreException | NoSuchAlgorithmException | KeyManagementException e) {
//			log.error(new StringBuffer("Exception ").append(e.getClass().getName()).append(": ").append(e).toString());
//			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "Delegate"), new HttpHeaders(),
//					HttpStatus.INTERNAL_SERVER_ERROR);
//		}
//	}
//
//	@PutMapping("/delegate")
//	@Timed
//	public ResponseEntity<?> updateDelegate(@RequestBody DelegateDTO delegate_dto) throws URISyntaxException, ProtocolException {
//		try {
//			log.info("updateDelegate : REST request to update Delegate for ID: {} ", delegate_dto.getLogin_id());
//			log.debug("REST request to update Delegate : {}", delegate_dto);
//			if (delegate_dto.getId() == null) {
//				return createDelegate(delegate_dto);
//			}
//			ModelMapper modelMapper = new ModelMapper();
//			Delegate delegate = modelMapper.map(delegate_dto, Delegate.class);
//			Delegate result = delegateService.save(delegate);
//			if (result == null) {
//				return new ResponseEntity<String>("Delegate could not be updated", new HttpHeaders(),
//						HttpStatus.INTERNAL_SERVER_ERROR);
//			} else
//				log.info("updateDelegate : Delegate Updated successfully for ID: {} ", result.getId());
//			return ResponseEntity.ok()
//					.headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, delegate.getId().toString())).body(result);
//
//		} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException
//				| EntityNotFoundException | KeyStoreException | NoSuchAlgorithmException | KeyManagementException e) {
//			log.error(new StringBuffer("Exception ").append(e.getClass().getName()).append(": ").append(e).toString());
//			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "Delegate"), new HttpHeaders(),
//					HttpStatus.INTERNAL_SERVER_ERROR);
//		}
//	}
//
//	@GetMapping("/delegates")
//	@Timed
//	public ResponseEntity<?> getAllDelegates(@Parameter Pageable pageable) {
//		try {
//			log.info("getAllDelegates : REST request to get a page of Delegates");
//			log.debug("REST request to get a page of Delegates");
//			Page<Delegate> page = delegateService.findAll(pageable);
//			HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/delegates");
//			log.info("getAllDelegates : Page of Delegates fetched successfully");
//			return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
//		} catch (SQLException | EntityNotFoundException e) {
//			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
//			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
//		}
//
//	}
//
//	@GetMapping("/delegate/{id}")
//	@Timed
//	public ResponseEntity<?> getDelegate(@PathVariable Integer id) {
//		try {
//			log.info("getDelegate : REST request to get Delegate by ID: {} ", id);
//			log.debug("REST request to get Delegate : {}", id);
//			Delegate delegate = delegateService.findOne(id);
//
//			if (delegate == null) {
//				return new ResponseEntity<String>(new StringBuffer("Delegate entity with id ").append(id).append(" does not exists!").toString(),
//						new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
//			} else
//				log.info("getDelegate : REST request to get Delegate successfull for ID: {} ", delegate.getId());
//			return new ResponseEntity<>(delegate, new HttpHeaders(), HttpStatus.OK);
//
//		} catch (SQLException | ArithmeticException e) {
//			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
//			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
//		}
//	}
//
//	@DeleteMapping("/delegate/{id}")
//	@Timed
//	public ResponseEntity<?> deleteDelegate(@PathVariable Integer id) {
//		try {
//			log.info("deleteDelegate : REST request to delete Delegate by ID: {} ", id);
//			log.debug("REST request to delete Delegate : {}", id);
//			delegateService.delete(id);
//			log.info("deleteDelegate : Delegate deleted successfully by ID: {} ", id);
//			return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString()))
//					.build();
//
//		} catch (EmptyResultDataAccessException e) {
//			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
//			return new ResponseEntity<String>(new StringBuffer("Delegate entity with id ").append(id).append(" does not exists!").toString(), 
//					new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
//		} catch (SQLException e) {
//			log.error(new StringBuffer("Exception ").append(e.getClass().getName()).append(": ").append(e).toString());
//			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
//		}
//
//	}
//	
//	@GetMapping("/delegatesByUserId/{userId}/{projectId}")
//	@Timed
//	public ResponseEntity<?> getDelegatesByUserID(@PathVariable Integer userId, @PathVariable Integer projectId) throws URISyntaxException {
//		log.info("getUserListByRoleId : Request to get list of Project");
//		try {
//			Integer loginId = userId;
//			List<Delegate> delegateList = delegateService.getDelegatesByLoginId(loginId, projectId);
//			log.info("getDelegatesByLoginId: Fetched List of Delegated successfully");
//			return new ResponseEntity<>(delegateList, new HttpHeaders(), HttpStatus.OK) ;
//		} catch(SQLException e){
//			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
//			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
//		}
//	}
//
//}


