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

import jakarta.persistence.EntityNotFoundException;

import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infosys.icets.ai.comm.lib.util.HeaderUtil;
import com.infosys.icets.ai.comm.lib.util.PaginationUtil;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.config.Constants;
import com.infosys.icets.iamp.usm.config.Messages;
import com.infosys.icets.iamp.usm.domain.UsmPermissions;
import com.infosys.icets.iamp.usm.dto.UsmPermissionsDTO;
import com.infosys.icets.iamp.usm.service.UsmPermissionsService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Parameter;

// TODO: Auto-generated Javadoc
/**
 * REST controller for managing UsmRolePermissions.
 */
/**
* @author icets
*/
@RestController
@RequestMapping("/api")
public class UsmPermissionsResource {

    /** The log. */
    private final Logger log = LoggerFactory.getLogger(UsmPermissionsResource.class);

    /** The Constant ENTITY_NAME. */
    private static final String ENTITY_NAME = "usm_permissions";

    /** The usm permissions service. */
    private final UsmPermissionsService usm_permissionsService;

    /**
     * Instantiates a new usm permissions resource.
     *
     * @param usm_permissionsService the usm permissions service
     */
    public UsmPermissionsResource(UsmPermissionsService usm_permissionsService) {
        this.usm_permissionsService = usm_permissionsService;
    }
    
    /**
     * GET  /usm-permissionss/page : get all the usm_permissionss.
     *
     * @param value the value
     * @return the ResponseEntity with status 200 (OK) and the list of usm_permissionss in body as PageResponse
     * @throws UnsupportedEncodingException the unsupported encoding exception
     * @throws JsonMappingException the json mapping exception
     * @throws JsonProcessingException the json processing exception
     */
    @GetMapping("/usm-permissionss/page")
    @Timed
    public ResponseEntity<?> getAllUsmPermissionss(@RequestHeader("example") String value) throws UnsupportedEncodingException, JsonMappingException, JsonProcessingException   {

		try {
			log.info("getAllPermissions : Request to get List of RolePermissions");
			ObjectMapper objectMapper = new ObjectMapper();
			String body = new String(Base64.getDecoder().decode(value), "UTF-8");
			PageRequestByExample<UsmPermissions> prbe = objectMapper.readValue(body, new TypeReference<PageRequestByExample<UsmPermissions>>() {
			});
			log.info("getAllRolePermissions : Fetched List of UsmPermissions successfully");
			return new ResponseEntity<>(usm_permissionsService.getAll(prbe), new HttpHeaders(), HttpStatus.OK);

		} catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (ArithmeticException e) {
			// TODO: handle exception
			log.error(new StringBuffer("ArithmeticException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_LAZY_LOAD_EVENT), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

    /**
     * POST  /usm-permissionss : Create a new usm_permissions.
     *
     * @param usm_permissions_dto the usm permissions dto
     * @return the ResponseEntity with status 201 (Created) and with body the new usm_permissions, or with status 400 (Bad Request) if the usm_permissions has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/usm-permissionss")
    @Timed
    public ResponseEntity<UsmPermissions> createUsmPermissions(@RequestBody UsmPermissionsDTO usm_permissions_dto) throws URISyntaxException {
        log.debug("REST request to save UsmPermissions : {}", usm_permissions_dto);
        if (usm_permissions_dto.getId() != null) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "Id exists", "A new usm_permissions cannot already have a Id")).body(null);
        }
        ModelMapper modelMapper = new ModelMapper();
        UsmPermissions usm_permissions = modelMapper.map(usm_permissions_dto, UsmPermissions.class);
        UsmPermissions result = usm_permissionsService.save(usm_permissions);
        return ResponseEntity.created(new URI(new StringBuffer("/api/usm-permissionss/").append(result.getId()).toString()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /usm-permissionss : Updates an existing usm_permissions.
     *
     * @param usm_permissions_dto the usm permissions dto
     * @return the ResponseEntity with status 200 (OK) and with body the updated usm_permissions,
     * or with status 400 (Bad Request) if the usm_permissions is not valid,
     * or with status 500 (Internal Server Error) if the usm_permissions couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/usm-permissionss")
    @Timed
    public ResponseEntity<UsmPermissions> updateUsmPermissions(@RequestBody UsmPermissionsDTO usm_permissions_dto) throws URISyntaxException {
        log.debug("REST request to update UsmPermissions : {}", usm_permissions_dto);
        if (usm_permissions_dto.getId() == null) {
            return createUsmPermissions(usm_permissions_dto);
        }
        ModelMapper modelMapper = new ModelMapper();
        UsmPermissions usm_permissions = modelMapper.map(usm_permissions_dto, UsmPermissions.class);
        UsmPermissions result = usm_permissionsService.save(usm_permissions);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, usm_permissions.getId().toString()))
            .body(result);
    }

    /**
     * GET  /usm-permissionss : get all the usm_permissionss.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of usm_permissionss in body
     */
    @GetMapping("/usm-permissionss")
    @Timed
    public ResponseEntity<List<UsmPermissions>> getAllUsmPermissionss(@Parameter Pageable pageable) {
        log.debug("REST request to get a page of UsmPermissionss");
        Page<UsmPermissions> page = usm_permissionsService.findAll(pageable);
        return new ResponseEntity<>(page.getContent(), PaginationUtil.generatePaginationHttpHeaders(page, "/api/usm-permissionss"), HttpStatus.OK);
    }

    /**
     * GET  /usm-permissionss/:id : get the "id" usm_permissions.
     *
     * @param id the id of the usm_permissions to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the usm_permissions, or with status 404 (Not Found)
     */
    @GetMapping("/usm-permissionss/{id}")
    @Timed
    public ResponseEntity<?> getUsmPermissions(@PathVariable Integer id) {
    	try {
		log.info("getUsmPermissions : Request to get Permissions by ID: {}",id);
        UsmPermissions usm_permissions = usm_permissionsService.findOne(id);
        if (usm_permissions == null) {
			return new ResponseEntity<String>(new StringBuffer("Permissions entity with id ").append(id).append(" does not exists!").toString(), new HttpHeaders(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
        else
		log.info("getUsmPermissions : Fetched Permissions Sucessfully by ID: {}",usm_permissions.getId(),usm_permissions.getModule(),usm_permissions.getPermission());
		return new ResponseEntity<>(usm_permissions, new HttpHeaders(), HttpStatus.OK);

	} catch (EntityNotFoundException e) {
		// TODO: handle exception
		log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
		return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
	}   
    	}

    /**
     * DELETE  /usm-permissionss/:id : delete the "id" usm_permissions.
     *
     * @param id the id of the usm_permissions to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/usm-permissionss/{id}")
    @Timed
    public ResponseEntity<Void> deleteUsmPermissions(@PathVariable Integer id) {
        log.debug("REST request to delete UsmPermissions : {}", id);
        usm_permissionsService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
    /**
     * Gets the usm-role-permissionss by role and module.
     *
     * @param role the role
     * @param module the module
     * @return the usm-role-permissionss by role and module
     */
    @GetMapping("/usm-role-permissionss/formodule/{role}")
    public ResponseEntity<?> getPermissionByRoleAndModule(@PathVariable(name="role") Integer role,@RequestParam(name = "module") String module) {
    	List<UsmPermissions> permission = usm_permissionsService.getPermissionByRoleAndModule(role,module);
    	return new ResponseEntity<>(permission, new HttpHeaders(), HttpStatus.OK);
    }
}
