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
import java.util.Base64;
import java.util.List;
import java.util.Map;

import jakarta.persistence.EntityNotFoundException;

import org.hibernate.exception.ConstraintViolationException;
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
import com.lfn.iamp.usm.domain.IcmsProcess;
import com.lfn.iamp.usm.dto.IcmsProcessDTO;
import com.lfn.iamp.usm.service.IcmsProcessService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Parameter;

@RestController
@Hidden
@RequestMapping("/api")
public class IcmsProcessResource {

	private final Logger log = LoggerFactory.getLogger(IcmsProcessResource.class);
	
	private static final String ENTITY_NAME = "process";
	
	@Autowired
	private IcmsProcessService icmsProcessService;
	
	@GetMapping("/icmsProcesses/page")
	@Timed
	public ResponseEntity<?> getAllProcesses(@RequestHeader(value = "example") String requestkey)
			throws UnsupportedEncodingException, JsonMappingException, JsonProcessingException {
		log.info("getAllProcesses : REST request to get a page of processes");
		try {

			String decodedvalue = new String(Base64.getDecoder().decode(requestkey), "UTF-8");
			ObjectMapper objectMapper = new ObjectMapper();
			objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
			PageRequestByExample<IcmsProcess> prbe = objectMapper.readValue(decodedvalue,
					new TypeReference<PageRequestByExample<IcmsProcess>>() {
					});
			if (prbe.getLazyLoadEvent() == null) {
				return new ResponseEntity<String>("Please provide lazy load event", new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			}

			PageResponse<IcmsProcess> pageResponse = icmsProcessService.getAll(prbe);
			log.info("getAllProcesses : Page of processes fetched successfully");
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
	
	@PostMapping("/icmsProcess")
	@Timed
	public ResponseEntity<?> createProcess(@RequestBody IcmsProcessDTO icmsProcessDTO) throws URISyntaxException {
		try {
			log.info("createProcess : REST request to save Process with Id: {}", icmsProcessDTO.getProcess_id());
			log.debug("REST request to save Process : {}", icmsProcessDTO);
			if (icmsProcessDTO.getProcess_id() != null) {
				return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "Id exists",
						"A new process cannot already have an Id")).body(null);
			}
			ModelMapper modelMapper = new ModelMapper();
			IcmsProcess icmsProcess = modelMapper.map(icmsProcessDTO, IcmsProcess.class);
			IcmsProcess result = icmsProcessService.save(icmsProcess);
			if (result == null) {
				return new ResponseEntity<String>("Process could not be created", new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			} else
				log.info("createProcess : Process saved successfully with ID: {}", result.getProcess_id()
						);
			return ResponseEntity.created(new URI(new StringBuffer("/api/process/").append(result.getProcess_id()).toString()))
					.headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getProcess_id().toString())).body(result);

		} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException e) {
			log.error(new StringBuffer("Exception ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "Process"), new HttpHeaders(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	@PutMapping("/icmsProcess")
	@Timed
	public ResponseEntity<?> updateProcess(@RequestBody IcmsProcessDTO icmsProcessDTO) throws URISyntaxException {
		try {
			log.info("updateProcess : REST request to update Process for ID: {} ", icmsProcessDTO.getProcess_id());
			log.debug("REST request to update Process : {}", icmsProcessDTO);
			if (icmsProcessDTO.getProcess_id() == null) {
				return createProcess(icmsProcessDTO);
			}
			ModelMapper modelMapper = new ModelMapper();
			IcmsProcess icmsProcess = modelMapper.map(icmsProcessDTO, IcmsProcess.class);
			IcmsProcess result = icmsProcessService.save(icmsProcess);
			if (result == null) {
				return new ResponseEntity<String>("Process could not be updated", new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			} else
				log.info("updateProcess : Process Updated successfully for ID: {} ", result.getProcess_id());
			return ResponseEntity.ok()
					.headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, icmsProcess.getProcess_id().toString())).body(result);

		} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException
				| EntityNotFoundException e) {
			log.error(new StringBuffer("Exception ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "Process"), new HttpHeaders(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	
	@GetMapping("/icmsProcesses")
	@Timed
	public ResponseEntity<?> getAllProcesses(@Parameter Pageable pageable) {
		try {
			log.info("getAllProcesses : REST request to get a page of Processes");
			log.debug("REST request to get a page of Processes");
			Page<IcmsProcess> page = icmsProcessService.findAll(pageable);
			HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/processes");
			log.info("getAllProcesses : Page of Processes fetched successfully");
			return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
		} catch (SQLException | EntityNotFoundException e) {
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	@GetMapping("/icmsProcess/{id}")
	@Timed
	public ResponseEntity<?> getProcess(@PathVariable Integer id) {
		try {
			log.info("getProcess : REST request to get Process by ID: {} ", id);
			log.debug("REST request to get Process : {}", id);
			IcmsProcess icmsProcess = icmsProcessService.findOne(id);

			if (icmsProcess == null) {
				return new ResponseEntity<String>(new StringBuffer("Process entity with id ").append(id).append(" does not exists!").toString(),
						new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
			} else
				log.info("getProcess : REST request to get Process successfull for ID: {} ", icmsProcess.getProcess_id());
			return new ResponseEntity<>(icmsProcess, new HttpHeaders(), HttpStatus.OK);

		} catch (SQLException | ArithmeticException e) {
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@DeleteMapping("/icmsProcess/{id}")
	@Timed
	public ResponseEntity<?> deleteProcess(@PathVariable Integer id) {
		try {
			log.info("deleteProcess : REST request to delete Process by ID: {} ", id);
			log.debug("REST request to delete Process : {}", id);
			icmsProcessService.delete(id);
			log.info("deleteProcess : Process deleted successfully by ID: {} ", id);
			return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString()))
					.build();

		} catch (EmptyResultDataAccessException e) {
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(new StringBuffer("Process entity with id ").append(id).append(" does not exists!").toString(), 
					new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (SQLException e) {
			log.error(new StringBuffer("Exception ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}
	
	@GetMapping("/icmsProcessesByUserRole/{userId}/{projectid}")
	@Timed
	public ResponseEntity<?> getAllProcessesByUserRole(@PathVariable Integer userId, @PathVariable Integer projectid) {
		try {
			log.info("getAllProcessesByUserRole : REST request to get a page of Processes");
			log.debug("REST request to get a page of Processes By User Role");
			List<Map<String,?>> page = icmsProcessService.getAllProcessesByUserRole(userId,projectid);
			log.info("getAllProcesses : Page of Processes fetched successfully");
			return new ResponseEntity<>(page, new HttpHeaders(), HttpStatus.OK);
		} catch (SQLException | EntityNotFoundException e) {
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
}
