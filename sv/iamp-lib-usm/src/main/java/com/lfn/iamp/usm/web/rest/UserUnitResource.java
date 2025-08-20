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
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.sql.SQLException;
import java.util.Base64;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
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
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lfn.ai.comm.lib.util.HeaderUtil;
import com.lfn.ai.comm.lib.util.PaginationUtil;
import com.lfn.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.lfn.iamp.usm.config.Constants;
import com.lfn.iamp.usm.config.Messages;
import com.lfn.iamp.usm.domain.UserUnit;
import com.lfn.iamp.usm.dto.UserUnitDTO;
import com.lfn.iamp.usm.service.UserUnitService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.tags.Tag;

// TODO: Auto-generated Javadoc
/**
 * REST controller for managing UserUnit.
 */
/**
* @author essedum
*/
@RestController
@RequestMapping("/api")
@Tag(name= "User Management", description = "User Management")
public class UserUnitResource {

	/** The log. */
	private final Logger log = LoggerFactory.getLogger(UserUnitResource.class);

	/** The Constant ENTITY_NAME. */
	private static final String ENTITY_NAME = "user_unit";

	/** The user unit service. */
	private final UserUnitService user_unitService;

	/**
	 * Instantiates a new user unit resource.
	 *
	 * @param user_unitService the user unit service
	 */
	public UserUnitResource(UserUnitService user_unitService) {
		this.user_unitService = user_unitService;
	}

	/**
	 * POST /user-units/page : get all the user_units.
	 *
	 * @param value the value
	 * @return the ResponseEntity with status 200 (OK) and the list of user_units in
	 *         body as PageResponse
	 * @throws UnsupportedEncodingException the unsupported encoding exception
	 * @throws JsonMappingException the json mapping exception
	 * @throws JsonProcessingException the json processing exception
	 */
	@GetMapping("/user-units/page")
	@Timed
	public ResponseEntity<?> getAllUserUnits(@RequestHeader("example") String value) throws UnsupportedEncodingException, JsonMappingException, JsonProcessingException {
		try {
			log.info("getAllUserUnits: Request to get List of User units");
//			if(prbe.getLazyLoadEvent() ==  null) {
//				return new ResponseEntity<String>("Please provide lazy load event", new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
//			}
			ObjectMapper objectMapper = new ObjectMapper();
			String body = new String(Base64.getDecoder().decode(value), "UTF-8");
			PageRequestByExample<UserUnit> prbe = objectMapper.readValue(body, new TypeReference<PageRequestByExample<UserUnit>>() {
			});
			log.info("getAllUserUnits: Fetched  List of User units successfully");
			return new ResponseEntity<>(user_unitService.getAll(prbe), new HttpHeaders(), HttpStatus.OK);

		}  catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (ArithmeticException e) {
			// TODO: handle exception
			log.error("ArithmeticException" + e.getClass().getName() + ": " + e);
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_LAZY_LOAD_EVENT), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * POST /user-units : Create a new user_unit.
	 *
	 * @param user_unit_dto the user unit dto
	 * @return the ResponseEntity with status 201 (Created) and with body the new
	 *         user_unit, or with status 400 (Bad Request) if the user_unit has
	 *         already an ID
	 * @throws URISyntaxException if the Location URI syntax is incorrect
	 * @throws JsonProcessingException 
	 * @throws NoSuchAlgorithmException 
	 * @throws InvalidKeySpecException 
	 * @throws BadPaddingException 
	 * @throws IllegalBlockSizeException 
	 * @throws NoSuchPaddingException 
	 * @throws InvalidKeyException 
	 */
	@PostMapping("/user-units")
	@Timed
	public ResponseEntity<?> createUserUnit(@RequestBody UserUnitDTO user_unit_dto) throws URISyntaxException, JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException {
		try {
			log.info("createUserUnit : Request to create User unit for user Name:{}",user_unit_dto.getUser().getUser_f_name());
			log.debug("REST request to save UserUnit : {}", user_unit_dto);
			if (user_unit_dto.getId() != null) {
				return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "Id exists",
						"A new user_unit cannot already have a Id")).body(null);
			}
			ModelMapper modelMapper = new ModelMapper();
			UserUnit user_unit = modelMapper.map(user_unit_dto, UserUnit.class);
			UserUnit result = user_unitService.save(user_unit);
			if (result == null) {
				return new ResponseEntity<String>("UserUnit could not be created", new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			} else {
				log.info("createUserUnit :  created User unit  Successfully ID: {} user Name:{}",
					result.getId(),result.getUser().getUser_f_name());
			return ResponseEntity.created(new URI("/api/user-units/" + result.getId()))
					.headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString())).body(result);
			}

		} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException e) {
			// TODO: handle exception
			log.error("SQLException" + e.getClass().getName() + ": " + e);
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "User Unit"), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * PUT /user-units : Updates an existing user_unit.
	 *
	 * @param user_unit_dto the user unit dto
	 * @return the ResponseEntity with status 200 (OK) and with body the updated
	 *         user_unit, or with status 400 (Bad Request) if the user_unit is not
	 *         valid, or with status 500 (Internal Server Error) if the user_unit
	 *         couldn't be updated
	 * @throws URISyntaxException if the Location URI syntax is incorrect
	 * @throws NoSuchAlgorithmException 
	 * @throws InvalidKeySpecException 
	 * @throws BadPaddingException 
	 * @throws IllegalBlockSizeException 
	 * @throws NoSuchPaddingException 
	 * @throws JsonProcessingException 
	 * @throws InvalidKeyException 
	 */
	@PutMapping("/user-units")
	@Timed
	public ResponseEntity<?> updateUserUnit(@RequestBody UserUnitDTO user_unit_dto) throws URISyntaxException, InvalidKeyException, JsonProcessingException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException {
		try {
			log.info("updateUserUnit :Request to Update User unit for ID: {} user Name:{}", user_unit_dto.getId(),user_unit_dto.getUser().getUser_f_name());
			log.debug("REST request to update UserUnit : {}", user_unit_dto);
			if (user_unit_dto.getId() == null) {
				return createUserUnit(user_unit_dto);
			}
			ModelMapper modelMapper = new ModelMapper();
			UserUnit user_unit = modelMapper.map(user_unit_dto, UserUnit.class);
			UserUnit result = user_unitService.save(user_unit);
			log.info("updateUserUnit : Updated User unit Successfully for ID: {} user Name:{}", result.getId(),result.getUser().getUser_f_name());
			return ResponseEntity.ok()
					.headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, user_unit.getId().toString()))
					.body(result);

		} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error("SQLException" + e.getClass().getName() + ": " + e);
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "User Unit"), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * GET /user-units : get all the user_units.
	 *
	 * @param pageable the pagination information
	 * @return the ResponseEntity with status 200 (OK) and the list of user_units in
	 *         body
	 */
	@GetMapping("/user-units")
	@Timed
	public ResponseEntity<?> getAllUserUnits(Pageable pageable) {
		try {
			log.info("getAllUserUnits : Request to get a List of UserUnits");
			Page<UserUnit> page = user_unitService.findAll(pageable);
			log.info("getAllUserUnits : Fetched list of UserUnits Successfully");
			return new ResponseEntity<>(page.getContent(), PaginationUtil.generatePaginationHttpHeaders(page, "/api/user-units"), HttpStatus.OK);

		}catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * GET /user-units/:id : get the "id" user_unit.
	 *
	 * @param id the id of the user_unit to retrieve
	 * @return the ResponseEntity with status 200 (OK) and with body the user_unit,
	 *         or with status 404 (Not Found)
	 */
	@GetMapping("/user-units/{id}")
	@Timed
	public ResponseEntity<?> getUserUnit(@PathVariable Integer id) {
		try {
			log.info("getUserUnit : Request to get UserUnit by ID: {}",id);
			UserUnit user_unit = user_unitService.getOne(id);
			if (user_unit == null) {
				return new ResponseEntity<String>("UserUnit entity with id " + id + " does not exists!", new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			} else
			log.info("getUserUnit : Fetched  UserUnit Successfully by ID: {}",user_unit.getId());
			return new ResponseEntity<>(user_unit, new HttpHeaders(), HttpStatus.OK);

		}  catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * deleteById /user-units/:id : deleteById the "id" user_unit.
	 *
	 * @param id the id of the user_unit to deleteById
	 * @return the ResponseEntity with status 200 (OK)
	 */
	@DeleteMapping("/user-units/{id}")
	@Timed
	public ResponseEntity<?> deleteUserUnit(@PathVariable Integer id) {
		try {
			log.info("deleteUserUnit: Request to delete Userunit by ID: {}",id);
			user_unitService.deleteById(id);
			log.info("deleteUserUnit: Deleted Userunit successfully ID: {}",id);
			return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString()))
					.build();
		}  catch (EmptyResultDataAccessException e) {
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(new StringBuffer("User Unit entity with id ").append(id).append(" does not exists!").toString(), new HttpHeaders(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}
}
