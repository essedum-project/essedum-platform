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

import java.net.URI;
import java.net.URISyntaxException;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lfn.ai.comm.lib.util.HeaderUtil;
import com.lfn.ai.comm.lib.util.PaginationUtil;
import com.lfn.iamp.usm.domain.Project;
import com.lfn.iamp.usm.domain.UsmAccessTokens;
import com.lfn.iamp.usm.domain.UsmPermissionApi;
import com.lfn.iamp.usm.domain.UsmPermissions;
import com.lfn.iamp.usm.dto.UsmPermissionApiDTO;
import com.lfn.iamp.usm.dto.UsmPermissionsDTO;
import com.lfn.iamp.usm.dto.UsmPersonalAccessTokensDTO;
import com.lfn.iamp.usm.service.UsmAccessTokensService;
import com.lfn.iamp.usm.service.UsmPermissionApiService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;


/**
 * REST controller for managing Role.
 */

@RestController
@RequestMapping("/api")
@Tag(name= "Usm Permission API", description = "Usm Permission API")
public class UsmPermissionApiResource {

	/** The log. */
	private final Logger log = LoggerFactory.getLogger(RoleResource.class);

	/** The Constant ENTITY_NAME. */
    private static final String ENTITY_NAME = "usm_permission_api";

	/** The usm permissions api service. */
	private final UsmPermissionApiService usm_permission_apiService;
	
	/** The usm permissions api service. */
	private final UsmAccessTokensService usmAccessTokensService;

	/**
	 * Instantiates a new user api permission resource.
	 */
	public UsmPermissionApiResource(UsmPermissionApiService usm_permission_apiService,UsmAccessTokensService usmAccessTokensService) {
		this.usm_permission_apiService = usm_permission_apiService;
		this.usmAccessTokensService=usmAccessTokensService;
	}

    /**
     * GET  /usm-permission-api : get all the usm_permission_api.
     *
     */
    @GetMapping("/usm-permission-api")
    @Timed
    public ResponseEntity<List<UsmPermissionApi>> getAllUsmPermissionsApi(@Parameter Pageable pageable) {
        log.debug("REST request to get a page of UsmPermissionss");
        Page<UsmPermissionApi> page = usm_permission_apiService.findAll(pageable);
        return new ResponseEntity<>(page.getContent(), PaginationUtil.generatePaginationHttpHeaders(page, "/api/usm-permissionss"), HttpStatus.OK);
    }

   
    @PutMapping("/usm-permissions-api")
    @Timed
    public ResponseEntity<?> updateUsmPermissionApi(@RequestBody UsmPermissionApiDTO usm_permission_api_dto) throws URISyntaxException {
        log.debug("REST request to update UsmPermissions : {}", usm_permission_api_dto);
        if (usm_permission_api_dto.getId() == null) {
            return createUsmPermissions(usm_permission_api_dto);
        }
        try {
            usm_permission_apiService.verifyRegEx(usm_permission_api_dto.getApi());
            }catch (Exception e) {
                return new ResponseEntity<String>("Invalid regex "+ e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
            }
        ModelMapper modelMapper = new ModelMapper();
        UsmPermissionApi usm_permissions = modelMapper.map(usm_permission_api_dto, UsmPermissionApi.class);
        UsmPermissionApi result = usm_permission_apiService.save(usm_permissions);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, usm_permissions.getId().toString()))
            .body(result);
    }

    @PostMapping("/usm-permission-api")
    @Timed
    public ResponseEntity<?> createUsmPermissions(@RequestBody UsmPermissionApiDTO usm_permission_api_dto) throws URISyntaxException {
        log.debug("REST request to save UsmPermissionApi : {}", usm_permission_api_dto);
        if (usm_permission_api_dto.getId() != null) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "Id exists", "A new usm_permission cannot already have a Id")).body(null);
        }
        try {
        usm_permission_apiService.verifyRegEx(usm_permission_api_dto.getApi());
        }catch (Exception e) {
            return new ResponseEntity<String>("Invalid regex "+ e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        ModelMapper modelMapper = new ModelMapper();
        UsmPermissionApi usm_permission_api = modelMapper.map(usm_permission_api_dto, UsmPermissionApi.class);
        UsmPermissionApi result = usm_permission_apiService.save(usm_permission_api);
        return ResponseEntity.created(new URI(new StringBuffer("/api/usm-permissions-api/").append(result.getId()).toString()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }



    @DeleteMapping("/usm-permission-api/{id}")
    @Timed
    public ResponseEntity<Void> deleteUsmPermissions(@PathVariable Integer id) {
        log.debug("REST request to delete UsmPermissionApi : {}", id);
        usm_permission_apiService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

    /*
     * find by usm permission
     * 
     */

    @GetMapping("/usm-permissions-api/permission/{id}")
    public ResponseEntity<?> getPermissionApiByPermissionId(@PathVariable(name="id") Integer permissionId) {
    	 log.debug("REST request to getbypermissionId UsmPermissionApi : {}", permissionId);
    	List<UsmPermissionApi> permission = usm_permission_apiService.getPermissionApiByPermissionId(permissionId);
    	return new ResponseEntity<>(permission, new HttpHeaders(), HttpStatus.OK);
    }
    
    
    @Operation(summary = "Find's usm-permission-api by their https requestType and containing api's name  ")
    @PostMapping("/search/usm-permissions-api")
	@Timed
	public ResponseEntity<?> searchUsmPermissionApi(@RequestBody UsmPermissionApiDTO usm_permission_api_dto) {
		try {
			log.info("search usm-permission-api : by api:{} and type: {}",usm_permission_api_dto.getApi(),usm_permission_api_dto.getType());
			if (usm_permission_api_dto.getApi() == null) {
				return new ResponseEntity<String>("API with " + usm_permission_api_dto.getApi() + " does not exists!", new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			} else
			return new ResponseEntity<>(usm_permission_apiService.searchUsmPermissionApi(usm_permission_api_dto), new HttpHeaders(), HttpStatus.OK);

		} catch (EntityNotFoundException e) {
			// TODO: handle exception
			log.error("SQLException " + e.getClass().getName() + ": " + e);
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}
    
	@GetMapping("/access-token/validation/{accessToken}")
	public ResponseEntity<?> validateAccessToken(@PathVariable(name = "accessToken") String accessToken) {
		log.info("REST request to personal access token: {}", accessToken);
		UsmAccessTokens listUsmAccessTokens = usmAccessTokensService.findUsmAccessTokenByAccessToken(accessToken);
		return new ResponseEntity<>(listUsmAccessTokens, new HttpHeaders(), HttpStatus.OK);
	}

	@GetMapping("/access-token/search-by-user-id/{userId}")
	public ResponseEntity<?> searchUsmAccessTokenByUserId(@PathVariable(name = "userId") Integer userId) {
		log.debug("REST request to fetch personal access token for UserId: {}", userId);
		UsmAccessTokens usmAccessTokens = usmAccessTokensService.findUsmAccessTokenByUserId(userId);
		return new ResponseEntity<>(usmAccessTokens, new HttpHeaders(), HttpStatus.OK);
	}

	@PostMapping("/access-token/generate-by-user-id")
	public ResponseEntity<?> generateUsmAccessTokenByUserId(@RequestBody UsmPersonalAccessTokensDTO requestBody) {
		log.info("REST request to generate or update personal access token for UserId: {}", requestBody.getUserId());
		UsmAccessTokens usmAccessTokens = usmAccessTokensService.generateUsmAccessTokenByUserId(requestBody);
		return new ResponseEntity<>(usmAccessTokens, new HttpHeaders(), HttpStatus.OK);
	}

	@DeleteMapping("/access-token/revoke-by-user-id/{userId}")
	public ResponseEntity<?> revokeUsmAccessTokenByUserId(@PathVariable(name = "userId") Integer userId) {
		log.info("REST request to revoke personal access token for UserId: {}", userId);
		Map<String, String> revokeResult = usmAccessTokensService.revokeUsmAccessTokenByUserId(userId);
		return new ResponseEntity<>(revokeResult, new HttpHeaders(), HttpStatus.OK);
	}
}