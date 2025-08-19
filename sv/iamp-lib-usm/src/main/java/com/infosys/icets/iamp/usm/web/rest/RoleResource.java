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

package com.infosys.icets.iamp.usm.web.rest;

import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.sql.SQLException;
import java.util.Base64;
import java.util.List;
import java.util.Map;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolationException;

import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import com.infosys.icets.ai.comm.lib.util.HeaderUtil;
import com.infosys.icets.ai.comm.lib.util.PaginationUtil;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.iamp.usm.config.Constants;
import com.infosys.icets.iamp.usm.config.Messages;
import com.infosys.icets.iamp.usm.domain.Role;
import com.infosys.icets.iamp.usm.dto.RoleDTO;
import com.infosys.icets.iamp.usm.service.RoleService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.tags.Tag;

// TODO: Auto-generated Javadoc
/**
 * REST controller for managing Role.
 */
/**
 * @author icets
 */
@RestController
@RequestMapping("/api")
@Tag(name= "User Management", description = "User Management")
public class RoleResource {

	/** The log. */
	private final Logger log = LoggerFactory.getLogger(RoleResource.class);

	/** The Constant ENTITY_NAME. */
	private static final String ENTITY_NAME = "role";

	/** The Constant SUBJECT_ACTIVATION. */
	public static final String SUBJECT_ACTIVATION = "Activation Mail";

	/** The role service. */
	private final RoleService roleService;

	/**
	 * Instantiates a new role resource.
	 *
	 * @param roleService the role service
	 */
	public RoleResource(RoleService roleService) {
		this.roleService = roleService;
	}

	/**
	 * POST /roles/page : get all the roles.
	 *
	 * @param value the value
	 * @return the ResponseEntity with status 200 (OK) and the list of roles in body
	 *         as PageResponse
	 * @throws UnsupportedEncodingException the unsupported encoding exception
	 * @throws JsonMappingException         the json mapping exception
	 * @throws JsonProcessingException      the json processing exception
	 */
	@GetMapping("/roles/page")
	@Timed
	public ResponseEntity<?> getAllRoles(@RequestHeader("example") String value)
			throws UnsupportedEncodingException, JsonMappingException, JsonProcessingException {
		try {
			log.info("getAllRoles : Request to get list of roles");
//			if(prbe.getLazyLoadEvent() ==  null) {
//				return new ResponseEntity<String>("Please provide lazy load event", new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
//			}
			ObjectMapper objectMapper = new ObjectMapper();
			objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
			String body = new String(Base64.getDecoder().decode(value), "UTF-8");
			PageRequestByExample<Role> prbe = objectMapper.readValue(body,
					new TypeReference<PageRequestByExample<Role>>() {
					});
			log.info("getAllRoles : Fetched list of roles successfully");
			return new ResponseEntity<>(roleService.getAll(prbe), new HttpHeaders(), HttpStatus.OK);

		} catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(
					new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (ArithmeticException e) {
			// TODO: handle exception
			log.error(new StringBuffer("ArithmeticException ").append(e.getClass().getName()).append(": ").append(e).toString() );
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_LAZY_LOAD_EVENT), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * POST /roles : Create a new role.
	 *
	 * @param role_dto the role dto
	 * @return the ResponseEntity with status 201 (Created) and with body the new
	 *         role, or with status 400 (Bad Request) if the role has already an ID
	 * @throws URISyntaxException if the Location URI syntax is incorrect
	 */
	@PostMapping("/roles")
	@Timed
	public ResponseEntity<?> createRole(@RequestBody RoleDTO role_dto) throws URISyntaxException {
		try {
			log.info("createRole: Request to Save Role Name: {} ", role_dto.getName());
			log.debug("REST request to save Role : {}", role_dto);
			if (role_dto.getId() != null) {
				return ResponseEntity.badRequest().headers(
						HeaderUtil.createFailureAlert(ENTITY_NAME, "Id exists", "A new role cannot already have a Id"))
						.body(null);
			}
			ModelMapper modelMapper = new ModelMapper();
			Role role = modelMapper.map(role_dto, Role.class);
			Role result = roleService.save(role);

//			try {
//				// Email Variables
//				String userFullName = "anonymous user";
//				String to = "anonymous";
//				String from = "anonymous";
//
//				// Template Variables
//				HashMap<String, String> templateVariables = new HashMap<>();
//				templateVariables.put("login", userFullName);
//
//				// Mail Event Creation
//				MailEvent mailEvent = new MailEvent(this, from, to,SUBJECT_ACTIVATION,
//						MailEvent.TEMPLATE_ACTIVATION, templateVariables,
//						applicationProperties.getMailserver().getConfig());
//
//				// Adding Mail Listener
//				mailEventPublisher.getApplicationEventPublisher().publishEvent(mailEvent);
//			} catch (TemplateInputException ex) {
//				log.info(ex.getMessage(), ex);
//			}
			if (result == null) {
				return new ResponseEntity<String>("Role could not be created", new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			} else
				log.info("createRole: Saved Role successfully with ID: {} Name: {} ", result.getId(), result.getName());
			return ResponseEntity.created(new URI(new StringBuffer("/api/roles/").append(result.getId()).toString()))
					.headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString())).body(result);

		} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "Role"), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * PUT /roles : Updates an existing role.
	 *
	 * @param role_dto the role dto
	 * @return the ResponseEntity with status 200 (OK) and with body the updated
	 *         role, or with status 400 (Bad Request) if the role is not valid, or
	 *         with status 500 (Internal Server Error) if the role couldn't be
	 *         updated
	 * @throws URISyntaxException if the Location URI syntax is incorrect
	 */
	@PutMapping("/roles")
	@Timed
	public ResponseEntity<?> updateRole(@RequestBody RoleDTO role_dto) throws URISyntaxException {
		try {
			log.info("updateRole : Request to Update Role for ID: {} Name: {}", role_dto.getId(), role_dto.getName());
			log.debug("REST request to update Role : {}", role_dto);
			if (role_dto.getId() == null) {
				return createRole(role_dto);
			}
			ModelMapper modelMapper = new ModelMapper();
			Role role = modelMapper.map(role_dto, Role.class);
			Role result = roleService.save(role);
			log.info("updateRole :Updated Role successfully for ID: {} Name: {}", result.getId(), result.getName());
			return ResponseEntity.ok().headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, role.getId().toString()))
					.body(result);

		} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException
				| EntityNotFoundException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "Role"), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * GET /roles : get all the roles.
	 *
	 * @param pageable the pagination information
	 * @return the ResponseEntity with status 200 (OK) and the list of roles in body
	 */
	@GetMapping("/roles")
	@Timed
	public ResponseEntity<?> getAllRoles(Pageable pageable) {
		try {
			log.info("getAllRoles: Request to get List of Roles");
			Page<Role> page = roleService.findAll(pageable);
			log.info("getAllRoles: Fetched List of Roles successfully");
			return new ResponseEntity<>(page.getContent(), PaginationUtil.generatePaginationHttpHeaders(page, "/api/roles"), HttpStatus.OK);

		} catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(
					new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * GET /roles/:id : get the "id" role.
	 *
	 * @param id the id of the role to retrieve
	 * @return the ResponseEntity with status 200 (OK) and with body the role, or
	 *         with status 404 (Not Found)
	 */
	@GetMapping("/roles/{id}")
	@Timed
	public ResponseEntity<?> getRole(@PathVariable Integer id) {
		try {
			log.info("getRole : Request to get Role ID: {}", id);
			Role role = roleService.findOne(id);
			if (role == null) {
				return new ResponseEntity<String>(
						new StringBuffer("Role entity with id ").append(id).append(" does not exists!").toString(),
						new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
			} else
				log.info("getRole : Fetched  Role successfully ID: {} Name: {}", role.getId(), role.getName());
			return new ResponseEntity<>(role, new HttpHeaders(), HttpStatus.OK);

		} catch (SQLException | EntityNotFoundException e) {
			log.error(
					new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * DELETE /roles/:id : delete the "id" role.
	 *
	 * @param id the id of the role to delete
	 * @return the ResponseEntity with status 200 (OK)
	 */
	@DeleteMapping("/roles/{id}")
	@Timed
	public ResponseEntity<?> deleteRole(@PathVariable Integer id) {
		try {
			log.info("deleteRole : Request to delete Role by ID: {} ", id);
			roleService.delete(roleService.findOne(id));
			log.info("deleteRole : Deleted Role successfully by ID: {} ", id);
			return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString()))
					.build();

		} catch (EmptyResultDataAccessException e) {
			log.error(
					new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(
					new StringBuffer("Role entity with id ").append(id).append(" does not exists!").toString(),
					new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(
					new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}
	
	@GetMapping("/rolesByProcessId/{processId}/{filterType}/{roleId}")
	@Timed
	public ResponseEntity<?> getAllRolesByProcessId(@PathVariable Integer processId,@PathVariable Integer filterType, @PathVariable Integer roleId) {
		try {
			log.info("getAllRoles By process id: Request to get List of Roles");
			List<Map<String,?>> page = roleService.getAllRolesByProcessId(processId,filterType, roleId);
			log.info("getAllRoles: Fetched List of Roles successfully");
			return new ResponseEntity<>(page, new HttpHeaders(), HttpStatus.OK) ;

		} catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(
					new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	/**
	 * GET /roles : get all the roles.
	 *
	 * @param pageable the pagination information
	 * @return the ResponseEntity with status 200 (OK) and the list of roles in body
	 */
	@GetMapping("/rolesByProcess/{process}")
	@Timed
	public ResponseEntity<?> getAllRolesByProcess(@PathVariable String process) {
		try {
			log.info("getAllRolesOfProcess: Request to get List of Roles");
			List<Role> page = roleService.getAllRolesByProcess(process);
			log.info("getAllRoles: Fetched List of Roles successfully");
			return new ResponseEntity<>(page, new HttpHeaders(), HttpStatus.OK);

		} catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(
					new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}
	
	@GetMapping("/rolesByNameAndProjectId/{name}/{projectId}")
	@Timed
	public ResponseEntity<?> getAllRolesByNameAndProjectId(@PathVariable String name,@PathVariable String projectId) {
		try {
			if(name !=null && projectId !=null) {
				List<Role> page = roleService.getRolesByNameAndProjectId(name,projectId);
				log.info("getAllRolesByNameAndProjectId: Fetched List of Roles successfully");
				return new ResponseEntity<>(page, new HttpHeaders(), HttpStatus.OK);
			}
			else
				return new ResponseEntity<>("Error", new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);

		} catch (EntityNotFoundException e) {
			// TODO: handle exception
			log.error("Exception " + e.getClass().getName() + ": " + e.getMessage());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}
	
	@GetMapping("/roleByName/{name}")
	@Timed
	public ResponseEntity<?> getRoleByName(@PathVariable String name) {
		try {
			if(name !=null) {
				List<Role> page = roleService.findByName(name);
				log.info("getRoleByName: Fetched List of Roles successfully");
				return new ResponseEntity<>(page, new HttpHeaders(), HttpStatus.OK);
			}
			else
				return new ResponseEntity<>("Error", new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);

		} catch (EntityNotFoundException e) {
			// TODO: handle exception
			log.error("Exception " + e.getClass().getName() + ": " + e.getMessage());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}
}
