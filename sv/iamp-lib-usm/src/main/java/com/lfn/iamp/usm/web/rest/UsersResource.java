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
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.sql.SQLException;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolationException;

import org.apache.http.ProtocolException;
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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lfn.ai.comm.lib.util.Crypt;
import com.lfn.ai.comm.lib.util.HeaderUtil;
import com.lfn.ai.comm.lib.util.PaginationUtil;
import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.lfn.ai.comm.lib.util.service.dto.support.PageResponse;
import com.lfn.iamp.usm.config.Constants;
import com.lfn.iamp.usm.config.Messages;
import com.lfn.iamp.usm.domain.Users;
import com.lfn.iamp.usm.dto.UsersDTO;
import com.lfn.iamp.usm.service.CamundaUSM;
import com.lfn.iamp.usm.service.UsersService;
import com.lfn.iamp.usm.service.impl.EmailServiceImpl;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

// TODO: Auto-generated Javadoc
/**
 * REST controller for managing Users.
 */
/**
 * @author essedum
 */
@RestController
@RequestMapping("/api")
@Tag(name = "User Management", description = "User Management")
public class UsersResource {

	/** The log. */
	private final Logger log = LoggerFactory.getLogger(UsersResource.class);

	/** The Constant ENTITY_NAME. */
	private static final String ENTITY_NAME = "users";

	/** The users service. */
	private final UsersService usersService;

	@Autowired(required = false)
	private CamundaUSM camundaUSM;

	@EssedumProperty("application.autouser.defaultPWD")
	private String defaultPWD;

	@Autowired
	EmailServiceImpl mailService;

	@EssedumProperty("application.mailNotificationUserCreation")
	private String mailNotificationUserCreation;

	/** The enckeydefault. */
	@EssedumProperty("application.uiconfig.enckeydefault")
	private static String enckeydefault;

	/**
	 * Instantiates a new users resource.
	 *
	 * @param usersService the users service
	 */
	public UsersResource(UsersService usersService) {
		this.usersService = usersService;
	}

	/**
	 * POST /userss/page : get all the userss.
	 *
	 * @param value the value
	 * @return the ResponseEntity with status 200 (OK) and the list of userss in
	 *         body as PageResponse
	 * @throws UnsupportedEncodingException       the unsupported encoding exception
	 * @throws JsonMappingException               the json mapping exception
	 * @throws JsonProcessingException            the json processing exception
	 * @throws NoSuchAlgorithmException
	 * @throws InvalidKeySpecException
	 * @throws BadPaddingException
	 * @throws IllegalBlockSizeException
	 * @throws NoSuchPaddingException
	 * @throws InvalidKeyException
	 * @throws InvalidAlgorithmParameterException
	 */
	@GetMapping("/userss/page")
	@Timed
	public ResponseEntity<?> getAllUserss(@RequestHeader("example") String value)
			throws UnsupportedEncodingException, JsonMappingException, JsonProcessingException, InvalidKeyException,
			NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException,
			NoSuchAlgorithmException, InvalidAlgorithmParameterException {
		try {
			log.info("getAllUserss: Request to get List of Users");
			ObjectMapper objectMapper = new ObjectMapper();
			objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
			String body = new String(Base64.getDecoder().decode(value), "UTF-8");
			PageRequestByExample<Users> prbe = objectMapper.readValue(body,
					new TypeReference<PageRequestByExample<Users>>() {
					});
			PageResponse<Users> pageResponse = usersService.getAll(prbe);
			log.info("getAllUserss : Fetched Users List Successfully");
			ObjectMapper mapper = new ObjectMapper();
			String str = mapper.writeValueAsString(pageResponse);
			String encrypted = Crypt.encrypt(str, enckeydefault);
			return new ResponseEntity<>(encrypted, new HttpHeaders(), HttpStatus.OK);
		} catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(
					new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (ArithmeticException e) {
			// TODO: handle exception
			log.error(new StringBuffer("ArithmeticException ").append(e.getClass().getName()).append(": ").append(e)
					.toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_LAZY_LOAD_EVENT), new HttpHeaders(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * POST /userss : Create a new users.
	 *
	 * @param users_dto the users dto
	 * @return the ResponseEntity with status 201 (Created) and with body the new
	 *         users, or with status 400 (Bad Request) if the users has already an
	 *         ID
	 * @throws URISyntaxException        if the Location URI syntax is incorrect
	 * @throws JsonProcessingException
	 * @throws NoSuchAlgorithmException
	 * @throws InvalidKeySpecException
	 * @throws BadPaddingException
	 * @throws IllegalBlockSizeException
	 * @throws NoSuchPaddingException
	 * @throws InvalidKeyException
	 */
	@PostMapping("/userss")
	@Timed
	public ResponseEntity<?> createUsers(@RequestBody UsersDTO users_dto)
			throws URISyntaxException, JsonProcessingException, InvalidKeyException, NoSuchPaddingException,
			IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException {
		try {
			log.info("createUsers: Request to save User Name: {}", users_dto.getUser_f_name());
			log.debug("REST request to save Users : {}", users_dto);
			if (users_dto.getId() != null) {
				return ResponseEntity.badRequest().headers(
						HeaderUtil.createFailureAlert(ENTITY_NAME, "Id exists", "A new users cannot already have a Id"))
						.body(null);
			}

			ModelMapper modelMapper = new ModelMapper();
			Users users = modelMapper.map(users_dto, Users.class);
			boolean validatedUserName = users_dto.getUser_f_name().matches("^(\\w*[-_.]?[a-zA-Z]\\w*)$");
            if(!validatedUserName){
                return new ResponseEntity<String>("Alpha numeric and atmost one special characters -_. allowed", new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
            }
			Users result = usersService.save(users);

			if (result == null) {
				return new ResponseEntity<String>("User could not be created", new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			} else {
				log.info("createUsers : User saved successfully with ID: {} Name: {}", result.getId(),
						result.getUser_f_name());
				if (mailNotificationUserCreation.equalsIgnoreCase("true")) {
					String message = "Hi " + result.getUser_f_name() + ","
							+ "<br><br> &nbsp;User has been Successfully Created.Your Password will be " + defaultPWD
							+ "<br><br> Regards," + "<br> LEAP";
					try {
						mailService.sendMail(result.getUser_email(), "User Created", message, "");
					} catch (KeyManagementException | NoSuchAlgorithmException | KeyStoreException | ProtocolException
							| ResourceAccessException e) {
						log.error(new StringBuffer("Mail Server Exception ").append(e.getClass().getName()).append(": ")
								.append(e).toString());
					}
				}
			}
			if (camundaUSM != null) {
				camundaUSM.createUser(users_dto);
			}
			return ResponseEntity.created(new URI(new StringBuffer("/api/userss/").append(result.getId()).toString()))
					.headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString())).body(result);

		} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException e) {
			log.error(
					new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "User"),
					new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * PUT /userss : Updates an existing users.
	 *
	 * @param users_dto the users dto
	 * @return the ResponseEntity with status 200 (OK) and with body the updated
	 *         users, or with status 400 (Bad Request) if the users is not valid, or
	 *         with status 500 (Internal Server Error) if the users couldn't be
	 *         updated
	 * @throws URISyntaxException        if the Location URI syntax is incorrect
	 * @throws JsonProcessingException
	 * @throws NoSuchAlgorithmException
	 * @throws InvalidKeySpecException
	 * @throws BadPaddingException
	 * @throws IllegalBlockSizeException
	 * @throws NoSuchPaddingException
	 * @throws InvalidKeyException
	 */
	@PutMapping("/userss")
	@Timed
	public ResponseEntity<?> updateUsers(@RequestBody UsersDTO users_dto)
			throws URISyntaxException, JsonProcessingException, InvalidKeyException, NoSuchPaddingException,
			IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException {
		try {
			log.info("updateUsers: Request to Update User for ID: {} Name: {}", users_dto.getId(),
					users_dto.getUser_f_name());
			log.debug("REST request to update Users : {}", users_dto);
			if (users_dto.getId() == null) {
				return createUsers(users_dto);
			}
			ModelMapper modelMapper = new ModelMapper();
			Users users = modelMapper.map(users_dto, Users.class);
			boolean validatedUserName = users_dto.getUser_f_name().matches("^(\\w*[-_.]?[a-zA-Z]\\w*)$");
            if(!validatedUserName){
                return new ResponseEntity<String>("Alpha numeric and atmost one special characters -_. allowed", new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
            }
			Users result = usersService.update(users);
			if (camundaUSM != null) {
				camundaUSM.updateUser(users_dto);
			}

			log.info("updateUsers: User Updated Successfully for ID: {} Name: {}", result.getId(),
					result.getUser_f_name());
			return ResponseEntity.ok()
					.headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, users.getId().toString())).body(result);

		} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException
				| EntityNotFoundException e) {
			// TODO: handle exception
			log.error(
					new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "User"),
					new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * GET /userss : get all the userss.
	 *
	 * @param pageable the pagination information
	 * @return the ResponseEntity with status 200 (OK) and the list of userss in
	 *         body
	 */
	@GetMapping("/userss")
	@Timed
	public ResponseEntity<?> getAllUserss(Pageable pageable) {
		try {
			log.info("getAllUserss: Request to get a List of Users");
			Page<Users> page = usersService.findAll(pageable);
			log.info("getAllUserss: Fetched List of Users Successfully");
			return new ResponseEntity<>(page.getContent(),
					PaginationUtil.generatePaginationHttpHeaders(page, "/api/userss"), HttpStatus.OK);

		} catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(
					new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * GET /userss/:id : get the "id" users.
	 *
	 * @param id the id of the users to retrieve
	 * @return the ResponseEntity with status 200 (OK) and with body the users, or
	 *         with status 404 (Not Found)
	 * @throws JsonProcessingException
	 * @throws NoSuchAlgorithmException
	 * @throws InvalidKeySpecException
	 * @throws BadPaddingException
	 * @throws IllegalBlockSizeException
	 * @throws NoSuchPaddingException
	 * @throws InvalidKeyException
	 */
	@GetMapping("/userss/{id}")
	@Timed
	public ResponseEntity<?> getUsers(@PathVariable("id") Integer id)
			throws JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException,
			BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException {
		try {
			log.info("getUsers: Request to get User by ID: {}", id);
			Users users = usersService.findOne(id);
			if (users == null) {
				return new ResponseEntity<String>(
						new StringBuffer("User entity with id ").append(id).append(" does not exists!").toString(),
						new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
			} else
				log.info("getUsers: Fetched User Successfully by ID: {} Name: {}", users.getId(),
						users.getUser_f_name());
			return new ResponseEntity<>(users, new HttpHeaders(), HttpStatus.OK);

		} catch (SQLException | EntityNotFoundException e) {
			log.error(
					new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * DELETE /userss/:id : delete the "id" users.
	 *
	 * @param id the id of the users to delete
	 * @return the ResponseEntity with status 200 (OK)
	 * @throws SQLException
	 */
	@DeleteMapping("/userss/{id}")
	@Timed
	public ResponseEntity<?> deleteUsers(@PathVariable Integer id) throws SQLException {
		Users user = usersService.findOne(id);
		log.info("deleteUsers: Request to delete User by ID:{}", user.getId());
		try {
			if (camundaUSM != null) {
				camundaUSM.deleteUser(user.getId());
			}
			usersService.delete(user);
		} catch (EmptyResultDataAccessException e) {
			log.error(
					new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(
					new StringBuffer("User entity with id ").append(id).append(" does not exists!").toString(),
					new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(
					new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
		log.info("deleteUsers: User deleted Successfully by ID:{}", id);
		return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
	}

	/**
	 * PUT /userss : Updates an existing users.
	 *
	 * @param users_dto the users dto
	 * @return the ResponseEntity with status 200 (OK) and with body the updated
	 *         users, or with status 400 (Bad Request) if the users is not valid, or
	 *         with status 500 (Internal Server Error) if the users couldn't be
	 *         updated
	 * @throws URISyntaxException if the Location URI syntax is incorrect
	 */
	@PutMapping("/userss/updatePassword")
	@Timed
	public ResponseEntity<?> updatePassword(@RequestBody UsersDTO users_dto) throws URISyntaxException {
		try {
			log.info("updatePassword : Request to update Password for ID:{} Name: {}", users_dto.getId(),
					users_dto.getUser_f_name());
			log.debug("REST request to update User Password : {}", users_dto);
			ModelMapper modelMapper = new ModelMapper();
			Users users = modelMapper.map(users_dto, Users.class);
			boolean validatedpassword = users_dto.getPassword().matches("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_\\[\\]-{}|';:,+=|`~<\\\\\\/>?])[A-Za-z\\d!@#$%^&*_\\[\\]-{}|';:,+=|`~<\\\\\\/>?].{7,19}");
            if(!validatedpassword){
                return new ResponseEntity<String>("Password should contain atleast 1 number, 1 uppercase and lowercase character and 1 special character", new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
            }
			Users result = usersService.save(users);
			log.info("updatePassword : updated Password successfully for ID:{} Name: {}", result.getId(),
					result.getUser_f_name());
			return ResponseEntity.ok()
					.headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, users.getId().toString())).body(result);
		} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException e) {
			// TODO: handle exception
			log.error(
					new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "User"),
					new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * PUT /userss : Updates an existing users.
	 *
	 * @param users_dto the users dto
	 * @return the ResponseEntity with status 200 (OK) and with body the updated
	 *         users, or with status 400 (Bad Request) if the users is not valid, or
	 *         with status 500 (Internal Server Error) if the users couldn't be
	 *         updated
	 * @throws URISyntaxException if the Location URI syntax is incorrect
	 * @throws EssedumException 
	 * @throws InvalidAlgorithmParameterException 
	 * @throws UnsupportedEncodingException 
	 * @throws BadPaddingException 
	 * @throws IllegalBlockSizeException 
	 * @throws NoSuchPaddingException 
	 * @throws InvalidKeyException 
	 */
	@PutMapping("/userss/resetPassword")
	@Timed
	public ResponseEntity<?> resetPassword(@RequestBody UsersDTO users_dto) throws URISyntaxException, EssedumException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, UnsupportedEncodingException, InvalidAlgorithmParameterException {
		try {
			log.info("updatePassword : Request to update Password for ID:{} Name: {}", users_dto.getId(),
					users_dto.getUser_f_name());
			log.debug("REST request to update User Password : {}", users_dto);
			ModelMapper modelMapper = new ModelMapper();
			Users users = modelMapper.map(users_dto, Users.class);
			boolean validatedpassword = users_dto.getPassword().matches("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_\\[\\]-{}|';:,+=|`~<\\\\\\/>?])[A-Za-z\\d!@#$%^&*_\\[\\]-{}|';:,+=|`~<\\\\\\/>?].{7,19}");
            if(!validatedpassword){
                return new ResponseEntity<String>("Password should contain atleast 1 number, 1 uppercase and lowercase character and 1 special character", new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
            }
            Users existUser = usersService.findUserDataByEmail(users_dto.getUser_email());
    		BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    		boolean isPasswordMatch = passwordEncoder.matches(users_dto.getOld_password(), existUser.getPassword());
            if(!isPasswordMatch) {
                return new ResponseEntity<String>("Old password is not matched", new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);

            }
			Users result = usersService.resetPassword(users);
			log.info("resetPassword : password reset successfully for ID:{} Name: {}", result.getId(),
					result.getUser_f_name());
			return ResponseEntity.ok()
					.headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, result.getId().toString())).body(result);
		} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException e) {
			// TODO: handle exception
			log.error(
					new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "User"),
					new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}
	
/**
	 * Check mail.
	 *
	 * @param email the email
	 * @return the response entity
	 * @throws BadPaddingException
	 * @throws IllegalBlockSizeException
	 * @throws NoSuchPaddingException
	 * @throws InvalidKeyException
	 * @throws InvalidAlgorithmParameterException
	 * @throws UnsupportedEncodingException
	 */
	@GetMapping("/userss/checkemail")
	@Timed
	public ResponseEntity<?> checkMail(@RequestHeader("email") String email)
			throws InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException,
			UnsupportedEncodingException, InvalidAlgorithmParameterException {
		try {
			ObjectMapper objectMapper = new ObjectMapper();
			objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
			String body = Crypt.decrypt(email, enckeydefault);
			Integer user_details = usersService.findEmail(body);
			return new ResponseEntity<Integer>(user_details, new HttpHeaders(), HttpStatus.OK);
		} catch (EssedumException e) {
			// TODO: handle exception
			log.error(new StringBuffer("Exception ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.BAD_REQUEST);
		}

	}

	/**
	 * Gets the paginated users list.
	 *
	 * @param pageable the pageable
	 * @return the paginated users list
	 * @throws JsonProcessingException
	 * @throws NoSuchAlgorithmException
	 * @throws InvalidKeySpecException
	 * @throws BadPaddingException
	 * @throws IllegalBlockSizeException
	 * @throws NoSuchPaddingException
	 * @throws InvalidKeyException
	 * @throws UnsupportedEncodingException
	 * @throws InvalidAlgorithmParameterException
	 */
	@GetMapping("/users/page")
	@Timed
	public ResponseEntity<?> getPaginatedUsersList(@Parameter Pageable pageable)
			throws JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException,
			BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException, InvalidAlgorithmParameterException,
			UnsupportedEncodingException {
		try {
			log.info("Request to get a page of Users  {} ", pageable);
			PageResponse<Users> pageResponse = usersService.getPaginatedUsersList(pageable);
			log.info("getAllUserss : Fetched Users List Successfully");
			ObjectMapper mapper = new ObjectMapper();
			String str = mapper.writeValueAsString(pageResponse);
			String body = Crypt.encrypt(str, enckeydefault);
			return new ResponseEntity<>(body, new HttpHeaders(), HttpStatus.OK);
		} catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(
					new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	/**
	 * Gets the paginated users based on project or portfolio list.
	 *
	 * @param pageable the pageable
	 * @param decides whether portfolio users or project users
	 * @param portfolio or project Id
	 * @return the paginated users list
	 * @throws JsonProcessingException
	 * @throws NoSuchAlgorithmException
	 * @throws InvalidKeySpecException
	 * @throws BadPaddingException
	 * @throws IllegalBlockSizeException
	 * @throws NoSuchPaddingException
	 * @throws InvalidKeyException
	 * @throws UnsupportedEncodingException
	 * @throws InvalidAlgorithmParameterException
	 */
	@GetMapping("/users/pagination/{Portfolio}/{id}/page")
	@Timed
	public ResponseEntity<?> getProjectUsersList(@Parameter Pageable pageable, @PathVariable Boolean Portfolio, @PathVariable Integer id)
			throws JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException,
			BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException, InvalidAlgorithmParameterException,
			UnsupportedEncodingException {
		try {
			log.info("Request to get a page of Users  {} ", pageable);
			PageResponse<Users> pageResponse = usersService.getProjectUsersList(pageable, Portfolio, id);
			log.info("getProjectUsersList : Fetched Users List Successfully");
			ObjectMapper mapper = new ObjectMapper();
			String str = mapper.writeValueAsString(pageResponse);
			String body = Crypt.encrypt(str, enckeydefault);
			return new ResponseEntity<>(body, new HttpHeaders(), HttpStatus.OK);
		} catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(
					new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	/**
	 * Gets the all users based on project or portfolio list.
	 *
	 * @param decides whether portfolio users or project users
	 * @param portfolio or project Id
	 * @throws JsonProcessingException
	 * @throws NoSuchAlgorithmException
	 * @throws InvalidKeySpecException
	 * @throws BadPaddingException
	 * @throws IllegalBlockSizeException
	 * @throws NoSuchPaddingException
	 * @throws InvalidKeyException
	 * @throws UnsupportedEncodingException
	 * @throws InvalidAlgorithmParameterException
	 */
	@GetMapping("/users/filter/{Portfolio}/{id}/page")
	@Timed
	public ResponseEntity<?> getProjectOrPortUsersList(@PathVariable Boolean Portfolio, @PathVariable Integer id)
			throws JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException,
			BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException, InvalidAlgorithmParameterException,
			UnsupportedEncodingException {
		try {
			log.info("Request to get getProjectOrPortUsersList  {} ");
			List<Users> pageResponse = usersService.getProjectOrPortUsersList(Portfolio, id);
			log.info("getProjectUsersList : Fetched Users List Successfully");
			ObjectMapper mapper = new ObjectMapper();
			String str = mapper.writeValueAsString(pageResponse);
			String body = Crypt.encrypt(str, enckeydefault);
			return new ResponseEntity<>(body, new HttpHeaders(), HttpStatus.OK);
		} catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(
					new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	

	/**
	 * Search users.
	 *
	 * @param pageable the pageable
	 * @param prbe     the prbe
	 * @return the response entity
	 * @throws URISyntaxException        the URI syntax exception
	 * @throws JsonProcessingException
	 * @throws NoSuchAlgorithmException
	 * @throws InvalidKeySpecException
	 * @throws BadPaddingException
	 * @throws IllegalBlockSizeException
	 * @throws NoSuchPaddingException
	 * @throws InvalidKeyException
	 */
	@PostMapping("/search/users/page")
	@Timed
	public ResponseEntity<?> searchUsers(@Parameter Pageable pageable, @RequestBody PageRequestByExample<Users> prbe)
			throws URISyntaxException, JsonProcessingException, InvalidKeyException, NoSuchPaddingException,
			IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException {
		try {
			log.info("searchUsers : Request to get list of Users");

			log.info("searchUsers : Fetched  list of Users successfully");
			return new ResponseEntity<>(usersService.search(pageable, prbe), new HttpHeaders(), HttpStatus.OK);
		} catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(
					new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>("Some error occured", new HttpHeaders(),
					HttpStatus.INTERNAL_SERVER_ERROR);

		}

	}
	
	
	/**
	 * Search users on portfolio or project.
	 *
	 * @param pageable the pageable
	 * @param prbe     the prbe
	 * @return the response entity
	 * @throws URISyntaxException        the URI syntax exception
	 * @throws JsonProcessingException
	 * @throws NoSuchAlgorithmException
	 * @throws InvalidKeySpecException
	 * @throws BadPaddingException
	 * @throws IllegalBlockSizeException
	 * @throws NoSuchPaddingException
	 * @throws InvalidKeyException
	 */
	@PostMapping("/users/search/{Portfolio}/{id}/page")
	@Timed
	public ResponseEntity<?> searchProjectPortfolioUsers(@Parameter Pageable pageable, @RequestBody PageRequestByExample<Users> prbe, @PathVariable Boolean Portfolio, @PathVariable Integer id)
			throws URISyntaxException, JsonProcessingException, InvalidKeyException, NoSuchPaddingException,
			IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException, SQLException {
		try {
			log.info("searchUsers : Request to get list of Users");

			log.info("searchUsers : Fetched  list of Users successfully");
			return new ResponseEntity<>(usersService.searchProjectPortfolioUsers(pageable, prbe, Portfolio, id), new HttpHeaders(), HttpStatus.OK);
		} catch (EntityNotFoundException e) {
			// TODO: handle exception
			log.error(
					new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>("Some error occured", new HttpHeaders(),
					HttpStatus.INTERNAL_SERVER_ERROR);

		}

	}

	/**
	 * Gets the users list for experiments.
	 *
	 * @param text        the text to be searched in username
	 * @param projectId   the projectId
	 * @param portfolioId the portfolioId
	 * @return the users list
	 */
	@GetMapping("/users/experiments/{text}/{projectId}/{portfolioId}")
	public ResponseEntity<?> getUsersForExperiments(@PathVariable String text, @PathVariable Integer projectId,
			@PathVariable Integer portfolioId) {
		try {
			List<Users> response = usersService.onKeyupUsersForExperiments(text.toLowerCase(), projectId, portfolioId);
			return new ResponseEntity<List<Users>>(response, new HttpHeaders(), HttpStatus.OK);
		} catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(
					new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>("Some error occured", new HttpHeaders(),
					HttpStatus.INTERNAL_SERVER_ERROR);

		}
	}
	
	/**
	 * Revoke access for users.
	 *
	 * @param userId   the userId
	 * @return the users list
	 * @throws UnsupportedEncodingException 
	 */
	@GetMapping("/revokeAccess/{userEmail}")
	public ResponseEntity<?> revokeAccess(@PathVariable String userEmail) throws UnsupportedEncodingException {
		try {
			String body = new String(Base64.getDecoder().decode(userEmail), "UTF-8");
			Users response = usersService.revokeAccess(body);
			return new ResponseEntity<Users>(response, new HttpHeaders(), HttpStatus.OK);
		} catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(
					new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>("Some error occured", new HttpHeaders(),
					HttpStatus.INTERNAL_SERVER_ERROR);

		}
		catch (EssedumException e) {
			// TODO: handle exception
			log.error(new StringBuffer("Exception ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.BAD_REQUEST);
		}
	}


	/**
	 * Send email with message.
	 *
	 * @param attachments the attachments
	 * @param to          the to
	 * @param cc          the cc
	 * @param bcc         the bcc
	 * @param subject     the subject
	 * @param message     the message
	 * @return the response entity
	 * @throws KeyStoreException
	 * @throws NoSuchAlgorithmException
	 * @throws KeyManagementException
	 * @throws ProtocolException
	 */
	@PostMapping(value = "/email/message", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<String> sendEmailWithMessage(
			@RequestPart(value = "attachments", required = false) MultipartFile[] attachments,
			@RequestPart(value = "to", required = true) String to,
			@RequestPart(value = "cc", required = false) String cc,
			@RequestPart(value = "bcc", required = false) String bcc,
			@RequestPart(value = "subject", required = true) String subject,
			@RequestPart(value = "message", required = true) String message)
			throws KeyManagementException, NoSuchAlgorithmException, KeyStoreException, ProtocolException {
		log.info("sendEmailWithMessage : Request to send Email To : {}", to);
		Boolean res;
		try {
			res = mailService.sendMail(to, subject, message, null);
		} catch (IllegalStateException e) {
			log.error("Error in sending mail: %s" + e.getMessage());
			return new ResponseEntity<>("Error in sending mail.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
		if (res) {
			log.info("sendEmailWithMessage :Email sent Successfully To : {}", to);
			return new ResponseEntity<>("Mail Sent Successfully", HttpStatus.OK);
		} else {
			log.error("Mail server is down");
			return new ResponseEntity<>("Mail server is down", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	@GetMapping("/userss/get-user/{userLogin}")
	public ResponseEntity<?> findByUserLogin(@PathVariable String userLogin) {
		
			log.info("getUser: Request to get logged in user");
			Users users = usersService.findByUserLogin(userLogin);
			log.info("getUser: Fetched Logged in User Successfully");
			return new ResponseEntity<>(users,new HttpHeaders(), HttpStatus.OK);

		

	}

}
