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
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

import jakarta.persistence.EntityNotFoundException;

import org.hibernate.exception.ConstraintViolationException;
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
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infosys.icets.ai.comm.lib.util.HeaderUtil;
import com.infosys.icets.ai.comm.lib.util.PaginationUtil;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.iamp.usm.config.Constants;
import com.infosys.icets.iamp.usm.config.Messages;
import com.infosys.icets.iamp.usm.domain.Role;
import com.infosys.icets.iamp.usm.domain.RoletoRole;
import com.infosys.icets.iamp.usm.dto.RoletoRoleDTO;
import com.infosys.icets.iamp.usm.service.UsmRoletoRoleService;

import io.micrometer.core.annotation.Timed;

// TODO: Auto-generated Javadoc
/**
 * REST controller for managing UsmRolePermissions.
 */
/**
* @author icets
*/
@RestController
@RequestMapping("/api")
public class UsmRoletoRoleResource {

    /** The log. */
    private final Logger log = LoggerFactory.getLogger(UsmRoletoRoleResource.class);
    
	/** The Constant ENTITY_NAME. */
	private static final String ENTITY_NAME = "Role to Role Resource";

    /** The usm role permissions service. */
    private final UsmRoletoRoleService usm_role_to_roleService;

    /**
     * Instantiates a new usm role permissions resource.
     *
     * @param usm_role_to_roleService the usm role permissions service
     */
    public UsmRoletoRoleResource(UsmRoletoRoleService usm_role_to_roleService) {
        this.usm_role_to_roleService = usm_role_to_roleService;
    }
    
	/**
	 * POST /usm-role-permissionss/page : get all the usm-role-permissionss.
	 *
	 * @param value the value
	 * @return the ResponseEntity with status 200 (OK) and the list of
	 *         usm-role-permissionss in body as PageResponse
	 * @throws UnsupportedEncodingException the unsupported encoding exception
	 * @throws JsonMappingException the json mapping exception
	 * @throws JsonProcessingException the json processing exception
	 */
	@GetMapping("/usm-role-role/page")
	@Timed
	public ResponseEntity<?> getAllRolePermissions(@RequestHeader("example") String value) throws UnsupportedEncodingException, JsonMappingException, JsonProcessingException   {

		try {
			log.info("getAllRole-Role-Mappings : Request to get List of Role-Role-Mappings");
			ObjectMapper objectMapper = new ObjectMapper();
			String body = new String(Base64.getDecoder().decode(value), "UTF-8");
			PageRequestByExample<RoletoRole> prbe = objectMapper.readValue(body, new TypeReference<PageRequestByExample<RoletoRole>>() {
			});
			log.info("getAllRole-Role-Mappings : Fetched List of RoletoRole Mappings successfully");
			return new ResponseEntity<>(usm_role_to_roleService.getAll(prbe), new HttpHeaders(), HttpStatus.OK);

		} catch (EntityNotFoundException e) {
			// TODO: handle exception
			log.error("SQLException " + e.getClass().getName() + ": " + e);
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (ArithmeticException e) {
			// TODO: handle exception
			log.error("ArithmeticException" + e.getClass().getName() + ": " + e);
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_LAZY_LOAD_EVENT), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

    /**
     * POST /usm-role-role : Create a new usm-role-permissionss.
     *
     * @param role_to_role_dto the role to role dto
     * @return the ResponseEntity with status 201 (Created) and with body the new
     *         usm-role-permissionss, or with status 400 (Bad Request) if the
     *         usm-role-permissionss has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
	@PostMapping("/usm-role-role")
	@Timed
	public ResponseEntity<?> createRoletoRoleMappings(@RequestBody RoletoRoleDTO role_to_role_dto)
			throws URISyntaxException {

		try {
			log.info("createRoletoRole: Request to save RoletoRole Parent Role Id: {} Child Id: {}" ,role_to_role_dto.getParentRoleId().getId(),role_to_role_dto.getChildRoleId().getId());
			log.debug("REST request to save RoletoRole : {}", role_to_role_dto);
			if (role_to_role_dto.getId() != null) {
				return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "Id exists",
						"A new role_to_role_mappping cannot already have a Id")).body(null);
			}
			ModelMapper modelMapper = new ModelMapper();
			RoletoRole usm_role_to_role = modelMapper.map(role_to_role_dto, RoletoRole.class);
			RoletoRole result = usm_role_to_roleService.save(usm_role_to_role);
			if (result == null) {
				return new ResponseEntity<String>("Role to Role could not be created", new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			} else
				log.info("createRoletoRoleMappings: Saved Role to Role Sucessfully ID: {}  Parent Id: {} Child Id : {}" ,result.getId(),
					result.getParentRoleId().getId(),result.getChildRoleId().getId());
			return ResponseEntity.created(new URI("/api/usm-role-role/" + result.getId()))
					.headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString())).body(result);

		} catch (ConstraintViolationException | DataIntegrityViolationException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "Role to Role"), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

    /**
	 * GET /usm-role-permissionss : get all the usm-role-permissionss.
	 *
	 * @param pageable the pagination information
	 * @return the ResponseEntity with status 200 (OK) and the list of
	 *         user_project_roles in body
	 */
	@GetMapping("/usm-role-role")
	@Timed
	public ResponseEntity<?> getAllRoletoRoleMappings(Pageable pageable) {
		try {
			log.info("getAllRoletoRoleMappings: Request to get list of Role to Role Mappings");
			Page<RoletoRole> page = usm_role_to_roleService.findAll(pageable);
			log.info("getAllRoletoRoleMappings: Fetched list of Role to Role Mappings successfully");
			return new ResponseEntity<>(page.getContent(),  PaginationUtil.generatePaginationHttpHeaders(page, "/api/usm-role-role"), HttpStatus.OK);

		} catch (EntityNotFoundException e) {
			// TODO: handle exception
			log.error("SQLException " + e.getClass().getName() + ": " + e);
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * GET /usm-role-role/:id : get the "id" usm-role-role.
	 *
	 * @param id the id of the usm-role-role to retrieve
	 * @return the ResponseEntity with status 200 (OK) and with body the
	 *         role_to_role, or with status 404 (Not Found)
	 */
	@GetMapping("/usm-role-role/{id}")
	@Timed
	public ResponseEntity<?> getRoletoRoleMappings(@PathVariable Integer id) {
		try {
			log.info("getRoletoRoleMappings : Request to get Role Mapping by ID: {}",id);
			RoletoRole role_to_role = usm_role_to_roleService.findOne(id);
			if (role_to_role == null) {
				return new ResponseEntity<String>("Role to Role Mapping entity with id " + id + " does not exists!", new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			} else
			log.info("getRoletoRoleMappings : ole to Role Mapping Sucessfully by ID: {}",role_to_role.getId());
			return new ResponseEntity<>(role_to_role, new HttpHeaders(), HttpStatus.OK);

		} catch (EntityNotFoundException e) {
			// TODO: handle exception
			log.error("SQLException " + e.getClass().getName() + ": " + e);
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}
	
	/**
	 * DELETE /usm-role-role/:id : delete the "id" usm-role-permissionss.
	 *
	 * @param id the id of the usm-role-role to delete
	 * @return the ResponseEntity with status 200 (OK)
	 */
	@DeleteMapping("/usm-role-role/{id}")
	@Timed
	public ResponseEntity<?> deleteRoletoRoleMappings(@PathVariable Integer id) {
		try {
			log.info("deleteRoletoRoleMappings : Request to delete Role to Role Mappings by ID: {}",id);
			usm_role_to_roleService.delete(id);
			log.info("deleteRoletoRoleMappings :  Deleted Role to Role Mappings Successfully by ID: : {}",id);
			return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString()))
					.build();

		} catch (EmptyResultDataAccessException e) {
			log.error("SQLException " + e.getClass().getName() + ": " + e);
			return new ResponseEntity<String>("RoletoRoleMappings entity with id " + id + " does not exists!", new HttpHeaders(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (EntityNotFoundException e) {
			// TODO: handle exception
			log.error("SQLException " + e.getClass().getName() + ": " + e);
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

    /**
     * PUT /usm-role-role : Updates an existing usm-role-permissionss.
     *
     * @param role_to_role_dto the role permissions dto
     * @return the ResponseEntity with status 200 (OK) and with body the updated
     *         usm-role-permissionss, or with status 400 (Bad Request) if the
     *         usm-role-permissionss is not valid, or with status 500 (Internal Server
     *         Error) if the usm-role-permissionss couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
	@PutMapping("/usm-role-role")
	@Timed
	public ResponseEntity<?> updateRoletoRoleMappings(@RequestBody RoletoRoleDTO role_to_role_dto)
			throws URISyntaxException {

		try {
			log.info("updateRoletoRoleMappings : Request to Update Role to Role Mapping ID: {} Parent Role Name: {}  Child Role Name: {}",role_to_role_dto.getId(),role_to_role_dto.getParentRoleId().getName(),role_to_role_dto.getChildRoleId().getName());
			log.debug("REST request to update RolePermissions : {}", role_to_role_dto);
			if (role_to_role_dto.getId() == null) {
				return createRoletoRoleMappings(role_to_role_dto);
			}
			ModelMapper modelMapper = new ModelMapper();
			RoletoRole role_to_role = modelMapper.map(role_to_role_dto, RoletoRole.class);
			RoletoRole result = usm_role_to_roleService.save(role_to_role);
			log.info("updateRoletoRoleMappings: Updated updateRoletoRoleMappings Sucessfully ID: {} Parent Role Name: {}  Child Role Name: {}",result.getId(),result.getParentRoleId().getName(),result.getChildRoleId().getName());
			return ResponseEntity.ok()
					.headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, result.getId().toString()))
					.body(result);

		} catch (ConstraintViolationException | DataIntegrityViolationException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "Role to Role Mappings"), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}
	 
 	/**
 	 * Creates the list of usm role to rolemappings.
 	 *
 	 * @param role_to_role_dto the role role_to_role_dto
 	 * @return the response entity
 	 * @throws URISyntaxException the URI syntax exception
 	 */
 	@PostMapping("/usm-role-role-list")
		@Timed
		public ResponseEntity<?> createListOfUsmRoletoRoleMappings(@RequestBody List<RoletoRoleDTO> role_to_role_dto)
				throws URISyntaxException {

			List<RoletoRole> role_to_role = new ArrayList<RoletoRole>();
			try {
				log.debug("REST request to save role_to_role List : {}",role_to_role_dto );
				if (role_to_role_dto.size() == 0) {
					return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "List is empty",
							"A list of role_to_role mappings cannot be empty.")).body(null);
				}
				log.info("Role Permission List Before"+role_to_role_dto);
				ModelMapper modelMapper = new ModelMapper();
				role_to_role = role_to_role_dto.stream()
						.map(source -> modelMapper.map(source, RoletoRole.class)).collect(Collectors.toList());
				log.info("Role Permission List After"+role_to_role);
				List<RoletoRole> result = usm_role_to_roleService.saveList(role_to_role);
				return new ResponseEntity<>(result, new HttpHeaders(), HttpStatus.CREATED);

			} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException e) {
				// TODO: handle exception
				log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
				return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "Role Permissions"), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}
 	
	/**
	 * GET /usm-role-role/:id : get the "id" usm-role-role.
	 *
	 * @param id the id of the usm-role-role to retrieve
	 * @return the ResponseEntity with status 200 (OK) and with body the
	 *         role_to_role, or with status 404 (Not Found)
	 */
	@GetMapping("/usm-role-roleParent/{id}")
	@Timed
	public ResponseEntity<?> getChildRoles(@PathVariable Role id) {
		try {
			log.info("getRoletoRoleMappings : Request to get Role Mapping by ID: {}",id);
			List<RoletoRole> role_to_role = usm_role_to_roleService.getChildRoles(id);
			if (role_to_role == null) {
				return new ResponseEntity<String>("Role to Role Mapping entity with id " + id + " does not exists!", new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			} else
			log.info("getRoletoRoleMappings : ole to Role Mapping Sucessfully by ID: {}");
			return new ResponseEntity<>(role_to_role, new HttpHeaders(), HttpStatus.OK);

		} catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error("SQLException " + e.getClass().getName() + ": " + e);
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}
}
