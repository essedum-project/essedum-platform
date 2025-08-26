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
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolationException;

import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
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
import com.infosys.icets.ai.comm.lib.util.HeaderUtil;
import com.infosys.icets.ai.comm.lib.util.PaginationUtil;
import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;
import com.infosys.icets.ai.comm.lib.util.annotation.service.impl.ConstantsServiceImplAbstract;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.iamp.usm.config.Constants;
import com.infosys.icets.iamp.usm.config.Messages;
import com.infosys.icets.iamp.usm.domain.Role;
import com.infosys.icets.iamp.usm.domain.UserProjectRole;
import com.infosys.icets.iamp.usm.domain.UserProjectRoleSummary;
import com.infosys.icets.iamp.usm.domain.Users;
import com.infosys.icets.iamp.usm.dto.UserProjectRoleDTO;
import com.infosys.icets.iamp.usm.dto.UsersDTO;
import com.infosys.icets.iamp.usm.service.CamundaUSM;
import com.infosys.icets.iamp.usm.service.UserProjectRoleService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;

// TODO: Auto-generated Javadoc
/**
 * REST controller for managing UserProjectRole.
 */
/**
* @author icets
*/
@RestController
@RequestMapping("/api")
@Tag(name= "User Management", description = "User Management")
public class UserProjectRoleResource {

	/** The log. */
	private final Logger log = LoggerFactory.getLogger(UserProjectRoleResource.class);

	/** The Constant ENTITY_NAME. */
	private static final String ENTITY_NAME = "user_project_role";

	/** The user project role service. */
	private final UserProjectRoleService user_project_roleService;
	
	@Autowired(required = false)
	private CamundaUSM camundaUSM;
	
	@Autowired
	ConstantsServiceImplAbstract constantsServiceImplAbstract;
	
//	/** The defailtdemostatus. */
//	@LeapProperty("usm.deleteautoassignedroles")
//	private static String autoassignedrolekey;

	private static String autoassignedrolekey = "usm.deleteautoassignedroles";

	/**
	 * Instantiates a new user project role resource.
	 *
	 * @param user_project_roleService the user project role service
	 */
	public UserProjectRoleResource(UserProjectRoleService user_project_roleService) {
		this.user_project_roleService = user_project_roleService;
	}

	/**
	 * POST /user-project-roles/page : get all the user_project_roles.
	 *
	 * @param value the value
	 * @return the ResponseEntity with status 200 (OK) and the list of
	 *         user_project_roles in body as PageResponse
	 * @throws UnsupportedEncodingException the unsupported encoding exception
	 * @throws JsonMappingException the json mapping exception
	 * @throws JsonProcessingException the json processing exception
	 * @throws NoSuchAlgorithmException 
	 * @throws InvalidKeySpecException 
	 * @throws BadPaddingException 
	 * @throws IllegalBlockSizeException 
	 * @throws NoSuchPaddingException 
	 * @throws InvalidKeyException 
	 */
	@GetMapping("/user-project-roles/page")
	@Timed
	public ResponseEntity<?> getAllUserProjectRoles(@RequestHeader("example") String value) throws UnsupportedEncodingException, JsonMappingException, JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException   {

		try {
			log.info("getAllUserProjectRoles : Request to get List of UserProjectRoles");
//			if(prbe.getLazyLoadEvent() ==  null) {
//				return new ResponseEntity<String>("Please provide lazy load event", new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
//			}
			ObjectMapper objectMapper = new ObjectMapper();
			objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
			String body = new String(Base64.getDecoder().decode(value), "UTF-8");
			PageRequestByExample<UserProjectRole> prbe = objectMapper.readValue(body, new TypeReference<PageRequestByExample<UserProjectRole>>() {
			});
			log.info("getAllUserProjectRoles : Fetched List of UserProjectRoles successfully");
			return new ResponseEntity<>(user_project_roleService.getAll(prbe), new HttpHeaders(), HttpStatus.OK);

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
	 * POST /user-project-roles : Create a new user_project_role.
	 *
	 * @param user_project_role_dto the user project role dto
	 * @return the ResponseEntity with status 201 (Created) and with body the new
	 *         user_project_role, or with status 400 (Bad Request) if the
	 *         user_project_role has already an ID
	 * @throws URISyntaxException if the Location URI syntax is incorrect
	 */
	@PostMapping("/user-project-roles")
	@Timed
	public ResponseEntity<?> createUserProjectRole(@RequestBody UserProjectRoleDTO user_project_role_dto)
			throws URISyntaxException {

		try {
			log.info("createUserProjectRole: Request to save UserProjectRole  Project Name: {} Role Name: {} User Name: {}" ,user_project_role_dto.getProject_id().getName(),user_project_role_dto.getRole_id().getName(),user_project_role_dto.getUser_id().getUser_f_name());
			log.debug("REST request to save UserProjectRole : {}", user_project_role_dto);
			if (user_project_role_dto.getId() != null) {
				return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "Id exists",
						"A new user_project_role cannot already have a Id")).body(null);
			}
			ModelMapper modelMapper = new ModelMapper();
			UserProjectRole user_project_role = modelMapper.map(user_project_role_dto, UserProjectRole.class);
			UserProjectRole result = user_project_roleService.save(user_project_role);
			if (result == null) {
				return new ResponseEntity<String>("UserProjectRole could not be created", new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			} else
				log.info("createUserProjectRole: Saved User Project Role Sucessfully ID: {} Project Name: {} Role Name: {} User Name: {}" ,result.getId(),
					result.getProject_id().getName(),result.getRole_id().getName(),result.getUser_id().getUser_f_name());
			return ResponseEntity.created(new URI(new StringBuffer("/api/user-project-roles/").append(result.getId()).toString()))
					.headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString())).body(result);

		} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "User Project Role"), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * PUT /user-project-roles : Updates an existing user_project_role.
	 *
	 * @param user_project_role_dto the user project role dto
	 * @return the ResponseEntity with status 200 (OK) and with body the updated
	 *         user_project_role, or with status 400 (Bad Request) if the
	 *         user_project_role is not valid, or with status 500 (Internal Server
	 *         Error) if the user_project_role couldn't be updated
	 * @throws URISyntaxException if the Location URI syntax is incorrect
	 * @throws JsonProcessingException 
	 * @throws NoSuchAlgorithmException 
	 * @throws InvalidKeySpecException 
	 * @throws BadPaddingException 
	 * @throws IllegalBlockSizeException 
	 * @throws NoSuchPaddingException 
	 * @throws InvalidKeyException 
	 */
	@PutMapping("/user-project-roles")
	@Timed
	public ResponseEntity<?> updateUserProjectRole(@RequestBody UserProjectRoleDTO user_project_role_dto)
			throws URISyntaxException, JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException {

		try {
			log.info("updateUserProjectRole : Request to Update UserProjectRole ID: {} Project Name: {} Role Name: {} User Name: {}",user_project_role_dto.getId(),user_project_role_dto.getProject_id().getName(),user_project_role_dto.getRole_id().getName(),user_project_role_dto.getUser_id().getUser_f_name());
			log.debug("REST request to update UserProjectRole : {}", user_project_role_dto);
			if (user_project_role_dto.getId() == null) {
				return createUserProjectRole(user_project_role_dto);
			}
			ModelMapper modelMapper = new ModelMapper();
			UserProjectRole user_project_role = modelMapper.map(user_project_role_dto, UserProjectRole.class);
			
			
			if(camundaUSM!=null) {
				camundaUSM.updateUserProjectRole(user_project_role_dto);
			}
			
			UserProjectRole result = user_project_roleService.save(user_project_role);
			log.info("updateUserProjectRole: Updated UserProjectRole Sucessfully ID: {} Project Name: {} Role Name: {} User Name: {}" ,result.getId(),result.getProject_id().getName(),result.getRole_id().getName(),result.getUser_id().getUser_f_name());
			return ResponseEntity.ok()
					.headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, user_project_role.getId().toString()))
					.body(result);

		} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "User Project Role"), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * GET /user-project-roles : get all the user_project_roles.
	 *
	 * @param pageable the pagination information
	 * @return the ResponseEntity with status 200 (OK) and the list of
	 *         user_project_roles in body
	 */
	@GetMapping("/user-project-roles")
	@Timed
	public ResponseEntity<?> getAllUserProjectRoles(Pageable pageable) {
		try {
			log.info("getAllUserProjectRoles: Request to get list of User Project Roles");
			Page<UserProjectRole> page = user_project_roleService.findAll(pageable);
			log.info("getAllUserProjectRoles: Fetched list of User Project Roles successfully");
			return new ResponseEntity<>(page.getContent(), PaginationUtil.generatePaginationHttpHeaders(page, "/api/user-project-roles"), HttpStatus.OK);

		} catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * GET /user-project-roles/:id : get the "id" user_project_role.
	 *
	 * @param id the id of the user_project_role to retrieve
	 * @return the ResponseEntity with status 200 (OK) and with body the
	 *         user_project_role, or with status 404 (Not Found)
	 */
	@GetMapping("/user-project-roles/{id}")
	@Timed
	public ResponseEntity<?> getUserProjectRole(@PathVariable Integer id) {
		try {
			log.info("getUserProjectRole : Request to get User Project Role by ID: {}",id);
			UserProjectRole user_project_role = user_project_roleService.findOne(id);
			if (user_project_role == null) {
				return new ResponseEntity<String>(new StringBuffer("UserProjectRole entity with id ").append(id).append(" does not exists!").toString(), new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			} else
			log.info("getUserProjectRole : Fetched User Project Role Sucessfully by ID: {}",user_project_role.getId());
			return new ResponseEntity<>(user_project_role, new HttpHeaders(), HttpStatus.OK);

		} catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * DELETE /user-project-roles/:id : delete the "id" user_project_role.
	 *
	 * @param id the id of the user_project_role to delete
	 * @return the ResponseEntity with status 200 (OK)
	 */
	@DeleteMapping("/user-project-roles/{id}")
	@Timed
	public ResponseEntity<?> deleteUserProjectRole(@PathVariable Integer id) {
		try {
			log.info("deleteUserProjectRole : Request to delete User Project Role by ID: {}",id);
			
			if(camundaUSM!=null) {
				camundaUSM.deleteUserProjectRole(id);
			}
						
			user_project_roleService.delete(user_project_roleService.getUserProjectRole(id));
			log.info("deleteUserProjectRole :  Deleted User Project Role  Successfully by ID: : {}",id);
			return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString()))
					.build();

		} catch (EmptyResultDataAccessException e) {
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(new StringBuffer("UserProjectRole entity with id ").append(id).append(" does not exists!").toString(), new HttpHeaders(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * POST /user-project-roles/user get the map of project & associated roles of a
	 * user based on its userLogin.
	 *
	 * @param userLogin the userLogin of the user
	 * @return the ResponseEntity with status 200 (OK) and with body containing the
	 *         map of projectId and list of roles
	 */
	@PostMapping("/user-project-roles/user")
	@Timed
	public ResponseEntity<?> getUserProjectRoleForUser(@RequestBody String userLogin) {

		try {
			log.info("getUserProjectRoleForUser : Request to get User Project Role for User Login Name: {} ", userLogin);
			log.debug("REST request to get UserProjectRole for User : {}", userLogin);
			Map<Integer, List<Role>> projectRoleMap = user_project_roleService.findByUserIdUserLogin(userLogin);
			log.info("getUserProjectRoleForUser : Fetched User Project Role for User Successfully User Login Name: {} ", userLogin);
			return new ResponseEntity<Map<Integer, List<Role>>>(projectRoleMap, new HttpHeaders(), HttpStatus.OK);

		} catch (SQLException  | EntityNotFoundException  e) {
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}
	/**
	 * POST /user-project-roles : Create a new user_project_role.
	 *
	 * @param user_project_role_dto the user project role dto
	 * @return the ResponseEntity with status 201 (Created) and with body the new
	 *         user_project_role, or with status 400 (Bad Request) if the
	 *         user_project_role has already an ID
	 * @throws URISyntaxException if the Location URI syntax is incorrect
	 * @throws JsonProcessingException 
	 * @throws NoSuchAlgorithmException 
	 * @throws InvalidKeySpecException 
	 * @throws BadPaddingException 
	 * @throws IllegalBlockSizeException 
	 * @throws NoSuchPaddingException 
	 * @throws InvalidKeyException 
	 */
	@PostMapping("/user-project-roles-list")
	@Timed
	public ResponseEntity<?> createListOfUserProjectRoles(@RequestBody List<UserProjectRoleDTO> user_project_role_dto)
			throws URISyntaxException, JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException {

		List<UserProjectRole> user_project_role = new ArrayList<UserProjectRole>();
		try {
			log.debug("REST request to save User Project Roles : {}",user_project_role_dto );
			if (user_project_role_dto.size() == 0) {
				return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "List is empty",
						"A list of user_project_role cannot be empty.")).body(null);
			}
			ModelMapper modelMapper = new ModelMapper();
			// save list of UserProjectRoles
			String autoassignRole = constantsServiceImplAbstract.findExtensionKey(1,autoassignedrolekey);
			if(Boolean.valueOf(autoassignRole)) {
				user_project_roleService.deleteByUserRoleId(user_project_role_dto.get(0).getUser_id());
			}
			user_project_role = user_project_role_dto.stream()
					.map(source -> modelMapper.map(source, UserProjectRole.class)).collect(Collectors.toList());
			List<UserProjectRole> result = user_project_roleService.saveList(user_project_role);
			if(camundaUSM!=null) {
				camundaUSM.createUserProjectRole(user_project_role_dto);
			}
			return new ResponseEntity<>(result, new HttpHeaders(), HttpStatus.CREATED);

		} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "User Project Role"), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * POST /userss : Register a new users with default role and project.
	 *
	 * @param users_dto the users dto
	 * @return the ResponseEntity with status 201 (Created) and with body the new
	 *         users, or with status 400 (Bad Request) if the users has already an
	 *         ID
	 * @throws URISyntaxException if the Location URI syntax is incorrect
	 * @throws JsonProcessingException 
	 * @throws NoSuchAlgorithmException 
	 * @throws InvalidKeySpecException 
	 * @throws BadPaddingException 
	 * @throws IllegalBlockSizeException 
	 * @throws NoSuchPaddingException 
	 * @throws InvalidKeyException 
	 */
	@PostMapping("/registerUser")
	@Timed
	public ResponseEntity<?> registerUser(@RequestBody UsersDTO users_dto) throws URISyntaxException, JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException {
		try {
            log.info("createUsers: Request to register User Name: {}",users_dto.getUser_f_name());
            log.debug("REST request to save Users : {}", users_dto);            
            ModelMapper modelMapper = new ModelMapper();
            Users users = modelMapper.map(users_dto, Users.class);
            boolean validatedpassword = users_dto.getPassword().matches("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_\\[\\]-{}|';:,+=|`~<\\\\\\/>?])[A-Za-z\\d!@#$%^&*_\\[\\]-{}|';:,+=|`~<\\\\\\/>?].{7,19}");
            if(!validatedpassword){
                return new ResponseEntity<String>("Password should contain atleast 1 number, 1 uppercase and lowercase character and 1 special character", new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
            }
            boolean validatedUserName = users_dto.getUser_f_name().matches("^([A-Za-z]+\\s?)+$");
            if(!validatedUserName){
                return new ResponseEntity<String>("Alpha numeric and atmost one special characters -_. allowed", new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
            }
            UserProjectRoleSummary result = user_project_roleService.registerUserwithDefaultRoles(users);
            if (result == null)
                return new ResponseEntity<String>("User could not be created", new HttpHeaders(),
                        HttpStatus.INTERNAL_SERVER_ERROR); 
            return new ResponseEntity<>(result, new HttpHeaders(), HttpStatus.CREATED);        
        } catch (SQLException | ConstraintViolationException | DataIntegrityViolationException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			if(e.getMessage().contains("email_unique")) {
			return new ResponseEntity<String>("User email already exists", new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
			}
			else if (e.getMessage().contains("user_login_unique")) {
				return new ResponseEntity<String>("User Login already exists", new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			}
			else {
				return new ResponseEntity<>(users_dto, new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}
		
	}
	
	/**
	 * Find Project-Role Mapping for a given UserProjectRoleSummary
	 * 
	 * @param UserProjectRoleSummary the userProjectRoleSummary
	 * @return List<UserProjectRole> list of UserProjectRole
	 */
	private List<UserProjectRole> getUserProjectRoleListByUserId(UserProjectRoleSummary userProjectRoleSummary) {
		List<UserProjectRole> userProjectRoleList=null;
		try {
			UserProjectRole userProjectRoleExample = new UserProjectRole();
			userProjectRoleExample.setUser_id(userProjectRoleSummary.getUserId());
			PageRequestByExample<UserProjectRole> pageReqByExample = new PageRequestByExample<>();
			pageReqByExample.setExample(userProjectRoleExample);				
			userProjectRoleList = user_project_roleService.getPaginatedUserProjectRoles(pageReqByExample,Pageable.unpaged())
														  .getContent();
		} catch (EntityNotFoundException e) {
			log.error("Error occurred in getUserProjectRoleListByUserId {} ",e.getMessage());
		}
		
	
		return userProjectRoleList;
	}
	
	/**
	 * Fetch all user project roles.
	 *
	 * @param value the value
	 * @param pageable the pageable
	 * @return the response entity
	 * @throws UnsupportedEncodingException the unsupported encoding exception
	 * @throws JsonMappingException the json mapping exception
	 * @throws JsonProcessingException the json processing exception
	 * @throws NoSuchAlgorithmException 
	 * @throws InvalidKeySpecException 
	 * @throws BadPaddingException 
	 * @throws IllegalBlockSizeException 
	 * @throws NoSuchPaddingException 
	 * @throws InvalidKeyException 
	 */
	@GetMapping("/user-project-roless/page")
	@Timed
	public ResponseEntity<?> fetchAllUserProjectRoles(@RequestHeader("example") String value,@Parameter Pageable pageable) throws UnsupportedEncodingException, JsonMappingException, JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException   {
			log.info("getAllUserProjectRoles : Request to get List of UserProjectRoles");
			ObjectMapper objectMapper = new ObjectMapper();
			objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
			String body = new String(Base64.getDecoder().decode(value), "UTF-8");
			PageRequestByExample<UserProjectRole> prbe = objectMapper.readValue(body, new TypeReference<PageRequestByExample<UserProjectRole>>() {
			});
	
			log.info("getAllUserProjectRoles : Fetched List of UserProjectRoles successfully");
			return new ResponseEntity<>(user_project_roleService.getPaginatedUserProjectRoles(prbe,pageable), new HttpHeaders(), HttpStatus.OK);
		}
	
	/**
	 * Search projects.
	 *
	 * @param pageable the pageable
	 * @param prbe the prbe
	 * @return the response entity
	 * @throws URISyntaxException the URI syntax exception
	 * @throws JsonProcessingException 
	 * @throws NoSuchAlgorithmException 
	 * @throws InvalidKeySpecException 
	 * @throws BadPaddingException 
	 * @throws IllegalBlockSizeException 
	 * @throws NoSuchPaddingException 
	 * @throws InvalidKeyException 
	 */
	@PostMapping("/search/user-project-roles/page")
	@Timed
	public ResponseEntity<?> searchProjects(@Parameter Pageable pageable,@RequestBody PageRequestByExample<UserProjectRole> prbe) throws  URISyntaxException, JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException  {

			log.info("searchProjects : Request to get list of User Project Roles");
			
			log.info("searchProjects : Fetched  list of User Project Roles successfully");
	
			return new ResponseEntity<>(user_project_roleService.search(pageable,prbe), new HttpHeaders(), HttpStatus.OK);
		
		}
	
	/**
	 * Gets the project list by user name.
	 *
	 * @param user_login the user login
	 * @return the project list by user name
	 * @throws URISyntaxException the URI syntax exception
	 */
	@GetMapping("/project-by-userlogin/{user_login:.+}")
	@Timed
	public ResponseEntity<?> getProjectListByUserName(@PathVariable String user_login) throws  URISyntaxException  {

			log.info("getProjectListByUserId : Request to get list of Project");
			
			log.info("getProjectListByUserId : Fetched  list of Project successfully");
			return new ResponseEntity<>(user_project_roleService.getProjectListByUserName(user_login), new HttpHeaders(), HttpStatus.OK);		
		}
	
	@GetMapping("/user-project-roles-by-roleid/{roleId}/{projectId}")
	@Timed
	public ResponseEntity<?> getUsersByRoleID(@PathVariable Integer roleId, @PathVariable Integer projectId) throws URISyntaxException {
		log.info("getUserListByRoleId : Request to get list of Project");
		try {
			List<Map<String,?>> page = user_project_roleService.getUsersByRoleId(roleId, projectId);
			log.info("getUserByRoleID: Fetched List of Users successfully");
			return new ResponseEntity<>(page, new HttpHeaders(), HttpStatus.OK) ;
		} catch(SQLException e){
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@GetMapping("/user-mapped-roles/{userName}")
	@Timed
	public ResponseEntity<?> getMappedRolesForUserId(@PathVariable String userName) throws URISyntaxException {
		log.info("getUserListByRoleId : Request to get list of Project");
		try {
			List<Integer> roles = user_project_roleService.getMappedRolesForUserLogin(userName);
			log.info("getUserByRoleID: Fetched Mapped Roles of User successfully");
			return new ResponseEntity<>(roles, new HttpHeaders(), HttpStatus.OK) ;
		} catch(SQLException e){
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
}
