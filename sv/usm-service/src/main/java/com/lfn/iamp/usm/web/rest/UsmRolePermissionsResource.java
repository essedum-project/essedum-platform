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
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mapping.PropertyReferenceException;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lfn.ai.comm.lib.util.HeaderUtil;
import com.lfn.ai.comm.lib.util.PaginationUtil;
import com.lfn.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.lfn.iamp.usm.config.Constants;
import com.lfn.iamp.usm.config.Messages;
import com.lfn.iamp.usm.domain.UsmRolePermissions;
import com.lfn.iamp.usm.dto.UsmRolePermissionNewDTO;
import com.lfn.iamp.usm.service.UsmRolePermissionsService;

import io.micrometer.core.annotation.Timed;
import org.springframework.transaction.annotation.Transactional;

// TODO: Auto-generated Javadoc
/**
 * REST controller for managing UsmRolePermissions.
 */
/**
* @author essedum
*/
@RestController
@RequestMapping("/api")
public class UsmRolePermissionsResource {

    /** The log. */
    private final Logger log = LoggerFactory.getLogger(UsmRolePermissionsResource.class);
    
	/** The Constant ENTITY_NAME. */
	private static final String ENTITY_NAME = "role_permissions";

    /** The usm role permissions service. */
    private final UsmRolePermissionsService usm_role_permissionsService;

    /**
     * Instantiates a new usm role permissions resource.
     *
     * @param usm_role_permissionsService the usm role permissions service
     */
    public UsmRolePermissionsResource(UsmRolePermissionsService usm_role_permissionsService) {
        this.usm_role_permissionsService = usm_role_permissionsService;
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
	@GetMapping("/usm-role-permissionss/page")
	@Timed
	public ResponseEntity<?> getAllRolePermissions(@RequestHeader("example") String value) throws UnsupportedEncodingException, JsonMappingException, JsonProcessingException   {

		try {
			log.info("getAllRolePermissions : Request to get List of UserProjectRoles");
			ObjectMapper objectMapper = new ObjectMapper();
			String body = new String(Base64.getDecoder().decode(value), "UTF-8");
			PageRequestByExample<UsmRolePermissions> prbe = objectMapper.readValue(body, new TypeReference<PageRequestByExample<UsmRolePermissions>>() {
			});
			log.info("getAllRolePermissions : Fetched List of UsmRolePermissions successfully");
			return new ResponseEntity<>(usm_role_permissionsService.getAll(prbe), new HttpHeaders(), HttpStatus.OK);

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
     * Gets the usm-role-permissionss by role and module.
     *
     * @param role_permissions_dto the role permissions dto
     * @return the usm-role-permissionss by role and module
     * @throws URISyntaxException the URI syntax exception
     */
//    @GetMapping("/usm-role-permissionss/formodule/{role}")
//    public ResponseEntity<?> getPermissionByRoleAndModule(@PathVariable(name="role") Integer role,@RequestParam(name = "module") String module) {
//    	List<UsmRolePermissions> permission = usm_role_permissionsService.getPermissionByRoleAndModule(role,module);
//    	return new ResponseEntity<>(permission, new HttpHeaders(), HttpStatus.OK);
//    }
    
    /**
	 * POST /usm-role-permissionss : Create a new usm-role-permissionss.
	 *
	 * @param role-permissions_dto the usm-role-permissionss dto
	 * @return the ResponseEntity with status 201 (Created) and with body the new
	 *         usm-role-permissionss, or with status 400 (Bad Request) if the
	 *         usm-role-permissionss has already an ID
	 * @throws URISyntaxException if the Location URI syntax is incorrect
	 */
	@PostMapping("/usm-role-permissionss")
	@Timed
	public ResponseEntity<?> createRolePermissions(@RequestBody UsmRolePermissionNewDTO role_permissions_dto)
			throws URISyntaxException {

		try {
			log.info("createRolePermissions: Request to save RolePermissions Role Id: {} Permission Id: {}" ,role_permissions_dto.getRole(),role_permissions_dto.getPermission());
			log.debug("REST request to save RolePermissions : {}", role_permissions_dto);
			if (role_permissions_dto.getId() != null) {
				return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "Id exists",
						"A new role_permissions cannot already have a Id")).body(null);
			}
			ModelMapper modelMapper = new ModelMapper();
			UsmRolePermissions usm_role_permissions = modelMapper.map(role_permissions_dto, UsmRolePermissions.class);
			UsmRolePermissions result = usm_role_permissionsService.save(usm_role_permissions);
			if (result == null) {
				return new ResponseEntity<String>("RolePermissions could not be created", new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			} else
				log.info("createRolePermissions: Saved Role Permissions Sucessfully ID: {}  Permission Id: {}" ,result.getId(),
					result.getPermission());
			return ResponseEntity.created(new URI("/api/usm-role-permissionss/" + result.getId()))
					.headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString())).body(result);

		} catch (ConstraintViolationException | DataIntegrityViolationException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "Role Permissions"), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

    /**
	 * GET /usm-role-permissionss : get all the usm-role-permissionss.
	 *
	 * @param pageable the pagination information
	 * @return the ResponseEntity with status 200 (OK) and the list of
	 *         user_project_roles in body
	 */
	@GetMapping("/usm-role-permissionss")
	@Timed
	public ResponseEntity<?> getAllRolePermissions(Pageable pageable) {
		try {
			log.info("getAlltRolePermissions: Request to get list of Role Permissions");
			Page<UsmRolePermissions> page = usm_role_permissionsService.findAll(pageable);
			log.info("getAllRolePermissions: Fetched list of Role Permissions successfully");
			return new ResponseEntity<>(page.getContent(),  PaginationUtil.generatePaginationHttpHeaders(page, "/api/usm-role-permissionss"), HttpStatus.OK);

		} catch (EntityNotFoundException e) {
			// TODO: handle exception
			log.error("SQLException " + e.getClass().getName() + ": " + e);
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * GET /usm-role-permissionss/:id : get the "id" usm-role-permissionss.
	 *
	 * @param id the id of the usm-role-permissionss to retrieve
	 * @return the ResponseEntity with status 200 (OK) and with body the
	 *         role_permissions, or with status 404 (Not Found)
	 */
	@GetMapping("/usm-role-permissionss/{id}")
	@Timed
	public ResponseEntity<?> getRolePermissions(@PathVariable Integer id) {
		try {
			log.info("getRolePermissions : Request to get Role Permissions by ID: {}",id);
			UsmRolePermissions role_permissions = usm_role_permissionsService.findOne(id);
			if (role_permissions == null) {
				return new ResponseEntity<String>("Role Permissions entity with id " + id + " does not exists!", new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			} else
			log.info("getRolePermissions : Fetched Role Permissions Sucessfully by ID: {}",role_permissions.getId());
			return new ResponseEntity<>(role_permissions, new HttpHeaders(), HttpStatus.OK);

		} catch (EntityNotFoundException e) {
			// TODO: handle exception
			log.error("SQLException " + e.getClass().getName() + ": " + e);
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}
		/**
	 * DELETE /usm-role-permissionss/:id : delete the "id" usm-role-permissionss.
	 *
	 * @param id the id of the usm-role-permissionss to delete
	 * @return the ResponseEntity with status 200 (OK)
	 */
	@DeleteMapping("/usm-role-permissionss/{id}")
	@Timed
	public ResponseEntity<?> deleteRolePermissions(@PathVariable(name = "id", required = true) Integer id) {
		try {
			log.info("deleteRolePermissions : Request to delete Role Permissions by ID: {}",id);
			usm_role_permissionsService.delete(id);
			log.info("deleteUserProjectRole :  Deleted Role Permissions Successfully by ID: : {}",id);
			return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString()))
					.build();

		} catch (EmptyResultDataAccessException e) {
			log.error("SQLException " + e.getClass().getName() + ": " + e);
			return new ResponseEntity<String>("RolePermissions entity with id " + id + " does not exists!", new HttpHeaders(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (EntityNotFoundException e) {
			// TODO: handle exception
			log.error("SQLException " + e.getClass().getName() + ": " + e);
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

    /**
     * PUT /usm-role-permissionss : Updates an existing usm-role-permissionss.
     *
     * @param role_permissions_dto the role permissions dto
     * @return the ResponseEntity with status 200 (OK) and with body the updated
     *         usm-role-permissionss, or with status 400 (Bad Request) if the
     *         usm-role-permissionss is not valid, or with status 500 (Internal Server
     *         Error) if the usm-role-permissionss couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
	@PutMapping("/usm-role-permissionss")
	@Timed
	public ResponseEntity<?> updateRolePermissions(@RequestBody UsmRolePermissionNewDTO role_permissions_dto)
			throws URISyntaxException {

		try {
			log.info("updateRolePermissions : Request to Update RolePermissions ID: {} Role Name: {} Permission Id: {}",role_permissions_dto.getId(),role_permissions_dto.getRole().getRoleadmin(),role_permissions_dto.getPermission());
			log.debug("REST request to update RolePermissions : {}", role_permissions_dto);
			if (role_permissions_dto.getId() == null) {
				return createRolePermissions(role_permissions_dto);
			}
			ModelMapper modelMapper = new ModelMapper();
			UsmRolePermissions role_permissions = modelMapper.map(role_permissions_dto, UsmRolePermissions.class);
			UsmRolePermissions result = usm_role_permissionsService.save(role_permissions);
			log.info("updateRolePermissions: Updated RolePermissions Sucessfully ID: {} Role Name: {} Permission Id: {}" ,result.getId(),result.getRole(),result.getPermission());
			return ResponseEntity.ok()
					.headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, role_permissions.getId().toString()))
					.body(result);

		} catch (ConstraintViolationException | DataIntegrityViolationException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "Role Permissions"), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}
	 
 	/**
 	 * Creates the list of usm role permissions.
 	 *
 	 * @param role_permissions_dto the role permissions dto
 	 * @return the response entity
 	 * @throws URISyntaxException the URI syntax exception
 	 */
 	@PostMapping("/usm-role-permissionss-list")
	@Timed
	@Transactional
		public ResponseEntity<?> createListOfUsmRolePermissions(@RequestBody List<UsmRolePermissionNewDTO> role_permissions_dto)
				throws URISyntaxException {

			List<UsmRolePermissions> role_permissions = new ArrayList<UsmRolePermissions>();
			try {
//				log.debug("REST request to save usm_role_permissions : {}",role_permissions_dto.toString() );
				if (role_permissions_dto.size() == 0) {
					return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "List is empty",
							"A list of usm_role_permissions cannot be empty.")).body(null);
				}
				log.info("Role Permission List Before==========={}",role_permissions_dto.toString());
				ModelMapper modelMapper = new ModelMapper();
				// save list of usm_module_organisations
				role_permissions = role_permissions_dto.stream()
						.map(source -> modelMapper.map(source, UsmRolePermissions.class)).collect(Collectors.toList());
				log.info("Role Permission List After"+role_permissions);
				List<UsmRolePermissions> result = usm_role_permissionsService.saveList(role_permissions);
				return new ResponseEntity<>(result, new HttpHeaders(), HttpStatus.CREATED);

			} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException e) {
				// TODO: handle exception
				log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
				return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "Role Permissions"), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}
 	
 	/**
	 * Get /usm-role-permissionss/page : get all the usm-role-permissionss.
	 *
	 * @param value the value
	 * @return the ResponseEntity with status 200 (OK) and the list of
	 *         usm-role-permissionss in body as PageResponse
	 * @throws PropertyReferenceException
	 */
	@GetMapping("/usm-role-permissionss/paginated")
	@Timed
	public ResponseEntity<?> getAllRolePermissions(
			@RequestParam(name = "page", defaultValue = "0", required = false) int page,
			@RequestParam(name = "size", defaultValue = "6", required = false) int size,
			@RequestParam(name = "sortBy",defaultValue = "id", required = false) String sortBy,
			@RequestParam(name = "orderBy",defaultValue = "asc", required = false) String orderBy) {
 
		try {
			return new ResponseEntity<>(usm_role_permissionsService.getAll(page,size,sortBy,orderBy), new HttpHeaders(), HttpStatus.OK);
		}
		catch (PropertyReferenceException e) {
			log.error("PropertyReferenceException " + e.getClass().getName() + ": " + e);
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		} 
		catch (Exception e) {
			log.error("Exception" + e.getClass().getName() + ": " + e);
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_LAZY_LOAD_EVENT), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
 
	}


	/**
	 * Get /usm-role-permissionss/searched : get all the usm-role-permissionss.
	 *
	 * @param value the value
	 * @return the ResponseEntity with status 200 (OK) and the list of
	 *         usm-role-permissionss in body as PageResponse
	 * @throws PropertyReferenceException
	 */
	@GetMapping("/usm-role-permissionss/searched")
	@Timed
	public ResponseEntity<?> getSearchedUsmRolePermission(
			@RequestParam(name = "module", required = false) String module,
			@RequestParam(name = "permission", required = false) String permission,
			@RequestParam(name = "role", required = false) String role,
			@RequestParam(name = "page", defaultValue = "0", required = false) int page,
			@RequestParam(name = "size", defaultValue = "6", required = false) int size,
			@RequestParam(name = "sortBy",defaultValue = "id", required = false) String sortBy,
			@RequestParam(name = "orderBy",defaultValue = "asc", required = false) String orderBy) {

		try {
			if((role==null || role.equals(null) || role.isEmpty()) && (module==null || module.equals(null) || module.isEmpty()) && (permission==null || permission.equals(null) || permission.isEmpty()))
				return new ResponseEntity<>(usm_role_permissionsService.getAll(page, size, sortBy, orderBy), new HttpHeaders(), HttpStatus.OK);
			else if((role==null || role.equals(null) || role.isEmpty()) && (module==null || module.equals(null) || module.isEmpty()))
				return new ResponseEntity<>(usm_role_permissionsService.findAllUsmRolePermissionsByPermission(permission, page, size, sortBy, orderBy), new HttpHeaders(), HttpStatus.OK);
			else if((role==null || role.equals(null) || role.isEmpty()) && (permission==null || permission.equals(null) || permission.isEmpty()))
				return new ResponseEntity<>(usm_role_permissionsService.findAllUsmRolePermissionsByModule(module, page, size, sortBy, orderBy), new HttpHeaders(), HttpStatus.OK);
			else if(role==null || role.equals(null) || role.isEmpty())
				return new ResponseEntity<>(usm_role_permissionsService.findAllUsmRolePermissionsByModuleAndPermission(module, permission, page, size, sortBy, orderBy), new HttpHeaders(), HttpStatus.OK);
			else
				return new ResponseEntity<>(usm_role_permissionsService.findAllUsmRolePermissionsByModuleAndPermissionAndRole(module, permission,role, page, size, sortBy, orderBy), new HttpHeaders(), HttpStatus.OK);
		}
		catch (PropertyReferenceException e) {
			log.error("PropertyReferenceException " + e.getClass().getName() + ": " + e);
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		} 
		catch (Exception e) {
			log.error("Exception" + e.getClass().getName() + ": " + e);
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_LAZY_LOAD_EVENT), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
