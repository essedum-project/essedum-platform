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
import java.util.stream.Collectors;

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
import com.lfn.iamp.usm.domain.RoleProcess;
import com.lfn.iamp.usm.dto.RoleProcessDTO;
import com.lfn.iamp.usm.service.RoleProcessService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Parameter;

@RestController
@Hidden
@RequestMapping("/api")
public class RoleProcessResource {

	private final Logger log = LoggerFactory.getLogger(RoleProcessResource.class);
	
	private static final String ENTITY_NAME = "RoleProcess";
	
	@Autowired
	private RoleProcessService roleProcessService;
	
	@GetMapping("/roleProcesses/page")
	@Timed
	public ResponseEntity<?> getAllRoleProcesses(@RequestHeader(value = "example") String requestkey)
			throws UnsupportedEncodingException, JsonMappingException, JsonProcessingException {
		log.info("getAllRoleProcesses : REST request to get a page of RoleProcesses");
		try {

			String decodedvalue = new String(Base64.getDecoder().decode(requestkey), "UTF-8");
			ObjectMapper objectMapper = new ObjectMapper();
			objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
			PageRequestByExample<RoleProcess> prbe = objectMapper.readValue(decodedvalue,
					new TypeReference<PageRequestByExample<RoleProcess>>() {
					});
			if (prbe.getLazyLoadEvent() == null) {
				return new ResponseEntity<String>("Please provide lazy load event", new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			}

			PageResponse<RoleProcess> pageResponse = roleProcessService.getAll(prbe);
			log.info("getAllRoleProcesses : Page of RoleProcesses fetched successfully");
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
	
	@PostMapping("/roleProcess")
	@Timed
	public ResponseEntity<?> createRoleProcess(@RequestBody RoleProcessDTO roleProcessDTO) throws URISyntaxException {
		try {
			log.info("createRoleProcess : REST request to save RoleProcess Process Name: {} Role Name: {}", roleProcessDTO.getProcess_id().getProcess_name(), roleProcessDTO.getRole_id().getName());
			log.debug("REST request to save RoleProcess : {}", roleProcessDTO);
			if (roleProcessDTO.getId() != null) {
				return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "Id exists",
						"A new RoleProcess cannot already have an Id")).body(null);
			}
			ModelMapper modelMapper = new ModelMapper();
			RoleProcess roleProcess = modelMapper.map(roleProcessDTO, RoleProcess.class);
			RoleProcess result = roleProcessService.save(roleProcess);
			if (result == null) {
				return new ResponseEntity<String>("RoleProcess could not be created", new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			} else
				log.info("createRoleProcess : RoleProcess saved successfully with ID: {}", result.getId()
						);
			return ResponseEntity.created(new URI(new StringBuffer("/api/roleProcess/").append(result.getId()).toString()))
					.headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString())).body(result);

		} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException e) {
			log.error(new StringBuffer("Exception ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "RoleProcess"), new HttpHeaders(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	@PutMapping("/roleProcess")
	@Timed
	public ResponseEntity<?> updateRoleProcess(@RequestBody RoleProcessDTO roleProcessDTO) throws URISyntaxException {
		try {
			log.info("updateRoleProcess : REST request to update RoleProcess RoleProcess Process Name: {} Role Name: {}", roleProcessDTO.getProcess_id().getProcess_name(), roleProcessDTO.getRole_id().getName());
			log.debug("REST request to update RoleProcess : {}", roleProcessDTO);
			if (roleProcessDTO.getId() == null) {
				return createRoleProcess(roleProcessDTO);
			}
			ModelMapper modelMapper = new ModelMapper();
			RoleProcess roleProcess = modelMapper.map(roleProcessDTO, RoleProcess.class);
			RoleProcess result = roleProcessService.save(roleProcess);
			if (result == null) {
				return new ResponseEntity<String>("RoleProcess could not be updated", new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			} else
				log.info("updateRoleProcess : RoleProcess Updated successfully for ID: {} ", result.getId());
			return ResponseEntity.ok()
					.headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, roleProcess.getId().toString())).body(result);

		} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException
				| EntityNotFoundException e) {
			log.error(new StringBuffer("Exception ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "RoleProcess"), new HttpHeaders(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	
	@GetMapping("/roleProcesses")
	@Timed
	public ResponseEntity<?> getAllRoleProcesses(@Parameter Pageable pageable) {
		try {
			log.info("getAllRoleProcesses : REST request to get a page of RoleProcesses");
			log.debug("REST request to get a page of RoleProcesses");
			Page<RoleProcess> page = roleProcessService.findAll(pageable);
			HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/roleProcesses");
			log.info("getAllRoleProcesses : Page of RoleProcesses fetched successfully");
			return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
		} catch (SQLException | EntityNotFoundException e) {
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	@GetMapping("/roleProcesses/process/{id}")
	@Timed
	public ResponseEntity<?> getRoleProcessByProcessId(@PathVariable Integer id) {
		try {
			log.info("getRoleProcesses : REST request to get RoleProcesses by Process ID: {} ", id);
			log.debug("REST request to get RoleProcesses by Process Id : {}", id);
			List<RoleProcess> roleProcesses = roleProcessService.findByRoleProcessIdentityProcessId(id);

			if (roleProcesses.isEmpty()) {
				return new ResponseEntity<String>(new StringBuffer("RoleProcess entity with id ").append(id).append(" does not exists!").toString(),
						new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
			} else
				log.info("getRoleProcesses : REST request to get RoleProcesses successfull for Process ID: {} ", roleProcesses.get(0).getProcess_id());
			return new ResponseEntity<>(roleProcesses, new HttpHeaders(), HttpStatus.OK);

		} catch (SQLException | ArithmeticException e) {
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	@GetMapping("/roleProcesses/role/{id}")
	@Timed
	public ResponseEntity<?> getRoleProcessByRoleId(@PathVariable Integer id) {
		try {
			log.info("getRoleProcesses : REST request to get RoleProcesses by Role ID: {} ", id);
			log.debug("REST request to get RoleProcesses by Role Id : {}", id);
			List<RoleProcess> roleProcesses = roleProcessService.findByRoleProcessIdentityRoleId(id);

			if (roleProcesses.isEmpty()) {
				return new ResponseEntity<String>(new StringBuffer("RoleProcess entity with id ").append(id).append(" does not exists!").toString(),
						new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
			} else
				log.info("getRoleProcesses : REST request to get RoleProcesses successfull for Role ID: {} ", roleProcesses.get(0).getRole_id());
			return new ResponseEntity<>(roleProcesses, new HttpHeaders(), HttpStatus.OK);

		} catch (SQLException | ArithmeticException e) {
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@DeleteMapping("/roleProcesses/process/{id}")
	@Timed
	public ResponseEntity<?> deleteRoleProcessByProcessId(@PathVariable Integer id) {
		try {
			log.info("deleteRoleProcesses : REST request to delete RoleProcesses by Process ID: {} ", id);
			log.debug("REST request to delete RoleProcesses by Process Id : {}", id);
			roleProcessService.deleteByRoleProcessIdentityProcessId(id);
			log.info("deleteRoleProcesses : RoleProcesses deleted successfully by Process ID: {} ", id);
			return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString()))
					.build();

		} catch (EmptyResultDataAccessException e) {
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(new StringBuffer("RoleProcess entity with id ").append(id).append(" does not exists!").toString(), 
					new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (SQLException e) {
			log.error(new StringBuffer("Exception ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}
	
	@DeleteMapping("/roleProcesses/role/{id}")
	@Timed
	public ResponseEntity<?> deleteRoleProcessByRoleId(@PathVariable Integer id) {
		try {
			log.info("deleteRoleProcesses : REST request to delete RoleProcesses by Role ID: {} ", id);
			log.debug("REST request to delete RoleProcesses by Role Id : {}", id);
			roleProcessService.deleteByRoleProcessIdentityRoleId(id);
			log.info("deleteRoleProcesses : RoleProcesses deleted successfully by Role ID: {} ", id);
			return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString()))
					.build();

		} catch (EmptyResultDataAccessException e) {
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(new StringBuffer("RoleProcess entity with id ").append(id).append(" does not exists!").toString(), 
					new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (SQLException e) {
			log.error(new StringBuffer("Exception ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}
	
	@PostMapping("/roleProcessList")
	@Timed
	public ResponseEntity<?> createListOfUserProjectRoles(@RequestBody List<RoleProcessDTO> role_process_dto)
			throws URISyntaxException {
		
		List<RoleProcess> role_process = new ArrayList<RoleProcess>();
		try {
			log.debug("REST request to save Role Process : {}",role_process_dto );
			if (role_process_dto.size() == 0) {
				return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "List is empty", 
						"A list of user_project_role cannot be empty.")).body(null);
			}
			ModelMapper modelMapper = new ModelMapper();
			role_process = role_process_dto.stream()
					.map(source -> modelMapper.map(source, RoleProcess.class)).collect(Collectors.toList());
			List<RoleProcess> result = roleProcessService.saveRoleProcessList(role_process);
			return new ResponseEntity<>(result, new HttpHeaders(), HttpStatus.CREATED);
		} catch(SQLException | ConstraintViolationException | DataIntegrityViolationException e) {
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "Role Process"), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
