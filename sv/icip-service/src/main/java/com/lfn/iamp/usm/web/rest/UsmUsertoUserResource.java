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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.hibernate.exception.ConstraintViolationException;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
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
import com.lfn.iamp.usm.domain.UsertoUser;
import com.lfn.iamp.usm.dto.UserPartialDTO;
import com.lfn.iamp.usm.dto.UsertoUserDTO;
import com.lfn.iamp.usm.service.UsmUsertoUserService;

import io.micrometer.core.annotation.Timed;
import jakarta.persistence.EntityNotFoundException;
import org.json.JSONArray;

// TODO: Auto-generated Javadoc
/**
 * REST controller for managing usm_user_to_user.
 */
/**
* @author essedum
*/
@RestController
@RequestMapping("/api")
public class UsmUsertoUserResource {

    /** The log. */
    private final Logger log = LoggerFactory.getLogger(UsmUsertoUserResource.class);
    
	/** The Constant ENTITY_NAME. */
	private static final String ENTITY_NAME = "User to User Resource";

    /** The usm_user_to_userService. */
    private final UsmUsertoUserService usm_user_to_userService;
    
    @Value("${config.service-auth.access-token}")
	private String accessToken;

    /**
     * Instantiates a usm_user_to_userService resource.
     *
     * @param usm_user_to_userService the usm role permissions service
     */
    public UsmUsertoUserResource(UsmUsertoUserService usm_user_to_userService) {
        this.usm_user_to_userService = usm_user_to_userService;
    }
    
	/**
	 * POST /usm-user-user/page : get all the usm_user_to_userService.
	 *
	 * @param value the value
	 * @return the ResponseEntity with status 200 (OK) and the list of
	 *         usm-user-user in body as PageResponse
	 * @throws UnsupportedEncodingException the unsupported encoding exception
	 * @throws JsonMappingException the json mapping exception
	 * @throws JsonProcessingException the json processing exception
	 */
	@GetMapping("/usm-user-user/page")
	@Timed
	public ResponseEntity<?> getAllUsertoUserMappings(@RequestHeader("example") String value) throws UnsupportedEncodingException, JsonMappingException, JsonProcessingException   {

		try {
			log.info("getAllUsertoUserMappings : Request to get List of User-User-Mappings");
			ObjectMapper objectMapper = new ObjectMapper();
			String body = new String(Base64.getDecoder().decode(value), "UTF-8");
			PageRequestByExample<UsertoUser> prbe = objectMapper.readValue(body, new TypeReference<PageRequestByExample<UsertoUser>>() {
			});
			log.info("getAllUsertoUserMappings : Fetched List of UsertoUser Mappings successfully");
			return new ResponseEntity<>(usm_user_to_userService.getAll(prbe), new HttpHeaders(), HttpStatus.OK);

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
     * POST /usm-user-user : Create a new user_to_user_dto.
     *
     * @param user_to_user_dto the user to user dto
     * @return the ResponseEntity with status 201 (Created) and with body the new
     *         user_to_user_dto, or with status 400 (Bad Request) if the
     *         user_to_user_dto has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
	@PostMapping("/usm-user-user")
	@Timed
	public ResponseEntity<?> createUsertoUserMappings(@RequestBody UsertoUserDTO user_to_user_dto)
			throws URISyntaxException {

		try {
			log.info("createUsertoUserMappings: Request to save UsertoUser Parent User Id: {} Child Id: {}" ,user_to_user_dto.getParentUserId().getId(),user_to_user_dto.getChildUserId().getId());
			log.debug("REST request to save UsertoUser : {}", user_to_user_dto);
			if (user_to_user_dto.getId() != null) {
				return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "Id exists",
						"A new user_to_user_mapping cannot already have a Id")).body(null);
			}
			ModelMapper modelMapper = new ModelMapper();
			UsertoUser user_to_user = modelMapper.map(user_to_user_dto, UsertoUser.class);
			UsertoUser result = usm_user_to_userService.save(user_to_user);
			if (result == null) {
				return new ResponseEntity<String>("User to User could not be created", new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			} else
				log.info("createUsertoUserMappings: Saved User to User Sucessfully ID: {}  Parent Id: {} Child Id : {}" ,result.getId(),
					result.getParentUserId().getId(),result.getChildUserId().getId());
			return ResponseEntity.created(new URI("/api/usm-user-user/" + result.getId()))
					.headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString())).body(result);

		} catch (ConstraintViolationException | DataIntegrityViolationException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "User to User"), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

    /**
	 * GET /usm-user-user : get all the usm-role-permissionss.
	 *
	 * @param pageable the pagination information
	 * @return the ResponseEntity with status 200 (OK) and the list of
	 *         user_project_roles in body
	 */
	@GetMapping("/usm-user-user")
	@Timed
	public ResponseEntity<?> getAllUsertoUserMappings(Pageable pageable) {
		try {
			log.info("getAllUsertoUserMappings: Request to get list of User to User Mappings");
			Page<UsertoUser> page = usm_user_to_userService.findAll(pageable);
			log.info("getAllUsertoUserMappings: Fetched list of User to User Mappings successfully");
			return new ResponseEntity<>(page.getContent(),  PaginationUtil.generatePaginationHttpHeaders(page, "/api/usm-user-user"), HttpStatus.OK);

		} catch (EntityNotFoundException e) {
			// TODO: handle exception
			log.error("SQLException " + e.getClass().getName() + ": " + e);
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * GET /usm-user-user/:id : get the "id" usm-user-user.
	 *
	 * @param id the id of the usm-user-user to retrieve
	 * @return the ResponseEntity with status 200 (OK) and with body the
	 *         role_to_role, or with status 404 (Not Found)
	 */
	@GetMapping("/usm-user-user/{id}")
	@Timed
	public ResponseEntity<?> getUsertoUserMappings(@PathVariable Integer id) {
		try {
			log.info("getUsertoUserMappings : Request to get User Mapping by ID: {}",id);
			UsertoUser user_to_user = usm_user_to_userService.findOne(id);
			if (user_to_user == null) {
				return new ResponseEntity<String>("User to User Mapping entity with id " + id + " does not exists!", new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			} else
			log.info("getUsertoUserMappings : ole to Role Mapping Sucessfully by ID: {}",user_to_user.getId());
			return new ResponseEntity<>(user_to_user, new HttpHeaders(), HttpStatus.OK);

		} catch (EntityNotFoundException e) {
			// TODO: handle exception
			log.error("SQLException " + e.getClass().getName() + ": " + e);
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}
	
	/**
	 * DELETE /usm-user-user/:id : delete the "id" usm-user-user.
	 *
	 * @param id the id of the usm-user-user to delete
	 * @return the ResponseEntity with status 200 (OK)
	 */
	@DeleteMapping("/usm-user-user/{id}")
	@Timed
	public ResponseEntity<?> deleteUsertoUserMappings(@PathVariable Integer id) {
		try {
			log.info("deleteUsertoUserMappings : Request to delete User to User Mappings by ID: {}",id);
			usm_user_to_userService.delete(id);
			log.info("deleteUsertoUserMappings :  Deleted User to User Mappings Successfully by ID: : {}",id);
			return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString()))
					.build();

		} catch (EmptyResultDataAccessException e) {
			log.error("SQLException " + e.getClass().getName() + ": " + e);
			return new ResponseEntity<String>("User to User entity with id " + id + " does not exists!", new HttpHeaders(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (EntityNotFoundException e) {
			// TODO: handle exception
			log.error("SQLException " + e.getClass().getName() + ": " + e);
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

    /**
     * PUT /usm-user-user : Updates an existing usm-role-permissionss.
     *
     * @param user_to_user_dto the role permissions dto
     * @return the ResponseEntity with status 200 (OK) and with body the updated
     *         user_to_user_dto, or with status 400 (Bad Request) if the
     *         user_to_user_dto is not valid, or with status 500 (Internal Server
     *         Error) if the usm-role-permissionss couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
	@PutMapping("/usm-user-user")
	@Timed
	public ResponseEntity<?> updateUsertoUserMappings(@RequestBody UsertoUserDTO user_to_user_dto)
			throws URISyntaxException {

		try {
			log.info("updateUsertoUserMappings : Request to Update User to User  Mapping ID: {} Parent User Name: {}  Child User Name: {}",user_to_user_dto.getId(),user_to_user_dto.getParentUserId().getUser_f_name(),user_to_user_dto.getChildUserId().getUser_f_name());
			log.debug("REST request to update UsertoUSer : {}", user_to_user_dto);
			if (user_to_user_dto.getId() == null) {
				return createUsertoUserMappings(user_to_user_dto);
			}
			ModelMapper modelMapper = new ModelMapper();
			UsertoUser user_to_user = modelMapper.map(user_to_user_dto, UsertoUser.class);
			UsertoUser result = usm_user_to_userService.save(user_to_user);
			log.info("updateUsertoUserMappings: Updated updateUsertoUserMappings Sucessfully ID: {} Parent User Name: {}  Child User Name: {}",result.getId(),result.getParentUserId().getUser_f_name(),result.getChildUserId().getUser_f_name());
			return ResponseEntity.ok()
					.headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, result.getId().toString()))
					.body(result);

		} catch (ConstraintViolationException | DataIntegrityViolationException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "User to User Mappings"), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}
	 
 	/**
 	 * Creates the list of createListOfUsmUsertoUserMappings.
 	 *
 	 * @param user_to_user_dto the role user_to_user_dto
 	 * @return the response entity
 	 * @throws URISyntaxException the URI syntax exception
 	 */
 @PostMapping("/usm-user-user-list")
		@Timed
		public ResponseEntity<?> createListOfUsmUsertoUserMappings(@RequestBody List<UsertoUserDTO> user_to_user_dto)
				throws URISyntaxException {

			List<UsertoUser> user_to_user = new ArrayList<UsertoUser>();
			try {
				log.debug("REST request to save user_to_user List : {}",user_to_user_dto );
				if (user_to_user_dto.size() == 0) {
					return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "List is empty",
							"A list of user_to_user mappings cannot be empty.")).body(null);
				}
				log.info("UsertoUser List Before"+user_to_user_dto);
				ModelMapper modelMapper = new ModelMapper();
				user_to_user = user_to_user_dto.stream()
						.map(source -> modelMapper.map(source, UsertoUser.class)).collect(Collectors.toList());
				log.info("UsertoUser List After"+user_to_user);
				List<UsertoUser> result = usm_user_to_userService.saveList(user_to_user);
				return new ResponseEntity<>(result, new HttpHeaders(), HttpStatus.CREATED);

			} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException e) {
				// TODO: handle exception
				log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
				return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "User to User"), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}
 	
	/*
	 * takes logged in user id, manager level and reportee level as variables
	 * and gets the hierarchical tree data
	 */
 	@GetMapping("/usm-user-user/hieracrchy/{id}/{mhLevel}/{rhLevel}")
 	@Timed
 	public ResponseEntity<String> fetchHieracrchy(@PathVariable Integer id,@PathVariable Integer mhLevel,@PathVariable Integer rhLevel){
 		JSONArray finalList = new JSONArray();
 		try {
 			finalList =  usm_user_to_userService.fetchHierarchy( id, mhLevel, rhLevel);
 		} catch (Exception e) {
			log.error(e.getMessage());
		}
		return new ResponseEntity<String>(finalList.toString() ,new HttpHeaders(), HttpStatus.OK);
 	}
 	
 	
 	@GetMapping("/usm-user-user/allocatedUsers/{projectID}")
 	@Timed
 	public List<UserPartialDTO> fetchAllocatedUsers(@PathVariable Integer projectID){
 		return usm_user_to_userService.fetchAllocatedUsers(projectID);
		
 	}
 	
 	@GetMapping("/usm-user-user/unAllocatedUsers/{projectID}")
 	@Timed
 	public List<UserPartialDTO> fetchUnallocatedUsers(@PathVariable Integer projectID){
		return usm_user_to_userService.fetchunallocatedUsers(projectID);
 	}
 	
 	@GetMapping("/getAccessToken")
	public ResponseEntity<Map<String,String>> getAccessToken() {
		Map<String,String> accessTokenMap=new HashMap<>();
		accessTokenMap.put("accessToken", accessToken);
		return new ResponseEntity<>(accessTokenMap, new HttpHeaders(), HttpStatus.OK);	
	}
 	
}
