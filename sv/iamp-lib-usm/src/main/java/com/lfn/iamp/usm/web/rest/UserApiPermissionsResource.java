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
import java.util.NoSuchElementException;

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
import com.lfn.ai.comm.lib.util.HeaderUtil;
import com.lfn.ai.comm.lib.util.PaginationUtil;
import com.lfn.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.lfn.iamp.usm.config.Constants;
import com.lfn.iamp.usm.config.Messages;
import com.lfn.iamp.usm.domain.UsmPermissionApi;
import com.lfn.iamp.usm.dto.UsmPermissionApiDTO;
import com.lfn.iamp.usm.service.UserApiPermissionsService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;

// TODO: Auto-generated Javadoc
/**
 * REST controller for managing Role.
 */
/**
* @author essedum
*/
@RestController
@RequestMapping("/api")
@Tag(name= "User API Permissions", description = "User API Permissions")
public class UserApiPermissionsResource {

	/** The log. */
	private final Logger log = LoggerFactory.getLogger(RoleResource.class);

	/** The Constant ENTITY_NAME. */
	private static final String ENTITY_NAME = "role";

	/** The user api permissions service. */
	private final UserApiPermissionsService userApiPermissionsService;


	/**
	 * Instantiates a new user api permissions resource.
	 *
	 * @param userApiPermissionsService the user api permissions service
	 */
	public UserApiPermissionsResource(UserApiPermissionsService userApiPermissionsService) {
		this.userApiPermissionsService = userApiPermissionsService;
	}

	/**
	 * POST /userApiPermissions/page : get all the user api permissions.
	 *
	 * @param value the value
	 * @return the ResponseEntity with status 200 (OK) and the list of userApiPermissions in body
	 *         as PageResponse
	 * @throws UnsupportedEncodingException the unsupported encoding exception
	 * @throws JsonMappingException the json mapping exception
	 * @throws JsonProcessingException the json processing exception
	 */
	@GetMapping("/userApiPermissions/page")
	@Timed
	public ResponseEntity<?> getAllUserApiPermissions(@RequestHeader("example") String value) throws UnsupportedEncodingException, JsonMappingException, JsonProcessingException  {
		try {
			log.info("getAllUserApiPermissions : Request to get list of User Api Permissions");
//			if(prbe.getLazyLoadEvent() ==  null) {
//				return new ResponseEntity<String>("Please provide lazy load event", new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
//			}
			ObjectMapper objectMapper = new ObjectMapper();
			String body = new String(Base64.getDecoder().decode(value), "UTF-8");
			PageRequestByExample<UsmPermissionApi> prbe = objectMapper.readValue(body, new TypeReference<PageRequestByExample<UsmPermissionApi>>() {
			});
			log.info("getAllUserApiPermissions : Fetched list of User Api Permissions successfully");
			return new ResponseEntity<>(userApiPermissionsService.getAll(prbe), new HttpHeaders(), HttpStatus.OK);

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
	 * POST /userApiPermissions : Create a new userApiPermissions.
	 *
	 * @param userApiPermissionsDTO the user api permissions DTO
	 * @return the ResponseEntity with status 201 (Created) and with body the new
	 *         userApiPermissions, or with status 400 (Bad Request) if the userApiPermissions has already an ID
	 * @throws URISyntaxException if the Location URI syntax is incorrect
	 */
	@PostMapping("/userApiPermissions")
	@Timed
	public ResponseEntity<?> createUserApiPermissions(@RequestBody UsmPermissionApiDTO userApiPermissionsDTO) throws URISyntaxException {
		try {
			log.info("createUserApiPermissions : Request to save UserApiPermissions API Name: {} ",userApiPermissionsDTO.getApi());
			log.debug("REST request to save UserApiPermissions : {}", userApiPermissionsDTO);
			if (userApiPermissionsDTO.getId() != null) {
				return ResponseEntity.badRequest().headers(
						HeaderUtil.createFailureAlert(ENTITY_NAME, "Id exists", "A new userApiPermissions cannot already have a Id"))
						.body(null);
			}
			ModelMapper modelMapper = new ModelMapper();
			UsmPermissionApi role = modelMapper.map(userApiPermissionsDTO, UsmPermissionApi.class);
			UsmPermissionApi result = userApiPermissionsService.save(role);
			if (result == null) {
				return new ResponseEntity<String>("UserApiPermissions could not be created", new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			} else
				log.info("createUserApiPermissions : saved UserApiPermissions successfully API ID: {} Name: {} ",result.getId(),result.getApi());
			return ResponseEntity.created(new URI(new StringBuffer("/api/userApiPermissions/").append(result.getId()).toString()))
					.headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString())).body(result);
		} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "UserApiPermissions"), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * PUT /roles : Updates an existing userApiPermissions.
	 *
	 * @param userApiPermissionsDTO the user api permissions DTO
	 * @return the ResponseEntity with status 200 (OK) and with body the updated
	 *         userApiPermissions, or with status 400 (Bad Request) if the userApiPermissions is not valid, or
	 *         with status 500 (Internal Server Error) if the userApiPermissions couldn't be
	 *         updated
	 * @throws URISyntaxException if the Location URI syntax is incorrect
	 */
	@PutMapping("/userApiPermissions")
	@Timed
	public ResponseEntity<?> updateUserApiPermissions(@RequestBody UsmPermissionApiDTO userApiPermissionsDTO) throws URISyntaxException {
		try {
			log.info("updateUserApiPermissions : Request to update UserApiPermissions API ID: {} Name: {}", userApiPermissionsDTO.getId(),userApiPermissionsDTO.getApi());
			log.debug("REST request to update userApiPermissions : {}", userApiPermissionsDTO);
			if (userApiPermissionsDTO.getId() == null) {
				return createUserApiPermissions(userApiPermissionsDTO);
			}
			ModelMapper modelMapper = new ModelMapper();
			UsmPermissionApi userApiPermissions = modelMapper.map(userApiPermissionsDTO, UsmPermissionApi.class);
			UsmPermissionApi result = userApiPermissionsService.save(userApiPermissions);
			log.info("updateUserApiPermissions : Updated UserApiPermissions successfully API ID: {} Name: {}", result.getId(),result.getApi());
			return ResponseEntity.ok().headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, userApiPermissions.getId().toString()))
					.body(result);

		} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "UserApiPermissions"), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * GET /userApiPermissions : get all the userApiPermissions.
	 *
	 * @param pageable the pagination information
	 * @return the ResponseEntity with status 200 (OK) and the list of roles in body
	 */
	@GetMapping("/userApiPermissions")
	@Timed
	public ResponseEntity<?> getAllUserApiPermissions(Pageable pageable) {
		try {
			log.info("getAllUserApiPermissions: Request to get List of userApiPermissions");
			Page<UsmPermissionApi> page = userApiPermissionsService.findAll(pageable);
			log.info("getAllUserApiPermissions: Fetched List of userApiPermissions successfully");
			return new ResponseEntity<>(page.getContent(), PaginationUtil.generatePaginationHttpHeaders(page, "/api/userApiPermissions"), HttpStatus.OK);

		} catch (SQLException | EntityNotFoundException  e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * GET /userApiPermissions/:id : get the "id" userApiPermissions.
	 *
	 * @param id the id of the userApiPermissions to retrieve
	 * @return the ResponseEntity with status 200 (OK) and with body the userApiPermissions, or
	 *         with status 404 (Not Found)
	 */
	@GetMapping("/userApiPermissions/{id}")
	@Timed
	public ResponseEntity<?> getUserApiPermissions(@PathVariable Integer id) {
		try {
			log.info("getUserApiPermissions : Request to get UserApiPermission by API ID: {}",id);
			log.debug("REST request to get userApiPermissions : {}", id);
			UsmPermissionApi userApiPermissions = userApiPermissionsService.getOne(id);
			if (userApiPermissions == null) {
				return new ResponseEntity<String>(new StringBuffer("UserApiPermission entity with id ").append(id).append(" does not exists!").toString(), new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			} else
			log.info("getUserApiPermissions : Fetched UserApiPermission successfully API ID: {}",userApiPermissions.getId());
			return new ResponseEntity<>(userApiPermissions, new HttpHeaders(), HttpStatus.OK);

		} catch (SQLException | NoSuchElementException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * DELETE /userApiPermissions/:id : delete the "id" userApiPermissions.
	 *
	 * @param id the id of the userApiPermissions to delete
	 * @return the ResponseEntity with status 200 (OK)
	 */
	@DeleteMapping("/userApiPermissions/{id}")
	@Timed
	public ResponseEntity<?> deleteUserApiPermissions(@PathVariable Integer id) {
		try {
			log.info("deleteUserApiPermissions : Request to delete UserApiPermission API ID: {} ",id);
			userApiPermissionsService.deleteById(id);
			log.info("deleteUserApiPermissions : Deleted UserApiPermission successfully API ID: {} ",id);
			return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString()))
					.build();

		} catch (EmptyResultDataAccessException e) {
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(new StringBuffer("UserApiPermission entity with id ").append(id).append(" does not exists!").toString(), new HttpHeaders(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
