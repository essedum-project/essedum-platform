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

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.io.UnsupportedEncodingException;
import java.net.URISyntaxException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.util.Base64;
import java.util.Collections;
import java.util.Optional;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import jakarta.persistence.EntityNotFoundException;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.mockito.Mockito;
import org.modelmapper.ModelMapper;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lfn.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.lfn.iamp.usm.domain.Context;
import com.lfn.iamp.usm.domain.OrgUnit;
import com.lfn.iamp.usm.domain.UserUnit;
import com.lfn.iamp.usm.domain.Users;
import com.lfn.iamp.usm.dto.UserUnitDTO;
import com.lfn.iamp.usm.repository.UserUnitRepository;
import com.lfn.iamp.usm.service.ContextService;
import com.lfn.iamp.usm.service.OrgUnitService;
import com.lfn.iamp.usm.service.UsersService;
import com.lfn.iamp.usm.service.impl.UserUnitServiceImpl;

// TODO: Auto-generated Javadoc
/**
 * The Class UserUnitResourceTest.
 *
 * @author essedum
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class UserUnitResourceTest {
	
	/** The user unit resource. */
	static UserUnitResource userUnitResource;
	
	/** The pageable. */
	static Pageable pageable = null;
	
	/** The user unit. */
	static UserUnit userUnit = new UserUnit();
	
	/** The req. */
	static PageRequestByExample<UserUnit> req = null;
	/** */
	ObjectMapper Obj = new ObjectMapper();

	/**
	 * Setup.
	 */
	@BeforeAll
	static void setup() {
		UserUnitRepository userUnitRepository = Mockito.mock(UserUnitRepository.class);
		ContextService contextService = Mockito.mock(ContextService.class);
		UsersService usersService = Mockito.mock(UsersService.class);
		OrgUnitService orgUnitService = Mockito.mock(OrgUnitService.class);
		userUnit.setId(2);
		userUnit.setUnit(new OrgUnit());
		Users users = new Users();
		users.setId(2);
		users.setUser_f_name("test");
		users.setUser_l_name("User");
		users.setUser_login("testuser");
		users.setUser_email("testuser@lfn.com");
		users.setOnboarded(true);
		users.setContext(new Context());
		userUnit.setUser(users);
		userUnit.setContext(new Context());
		Mockito.when(userUnitRepository.findById(2)).thenReturn(Optional.of(userUnit));
		Mockito.when(userUnitRepository.save(userUnit)).thenReturn(userUnit);
		Page<UserUnit> userUnitPage = new PageImpl<>(Collections.singletonList(userUnit));
		pageable = PageRequest.of(0, 1);
		req = new PageRequestByExample<UserUnit>();
		Mockito.when(userUnitRepository.findAll(req.toPageable())).thenReturn(userUnitPage);
		Mockito.when(userUnitRepository.findAll(pageable)).thenReturn(userUnitPage);

		UserUnitServiceImpl userUnitService = new UserUnitServiceImpl(userUnitRepository, contextService, usersService,
				orgUnitService);

		userUnitResource = new UserUnitResource(userUnitService);
	}

	/**
	 * Test negative create user unit.
	 * @throws NoSuchAlgorithmException 
	 * @throws InvalidKeySpecException 
	 * @throws BadPaddingException 
	 * @throws IllegalBlockSizeException 
	 * @throws NoSuchPaddingException 
	 * @throws JsonProcessingException 
	 * @throws InvalidKeyException 
	 */
	@Test
	@Order(1)
	public void testNegativeCreateUserUnit() throws InvalidKeyException, JsonProcessingException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException {
		UserUnitDTO userUnitDTO = new UserUnitDTO();
		ModelMapper modelMapper = new ModelMapper();
		userUnitDTO = modelMapper.map(userUnit, UserUnitDTO.class);
		try {
			assertEquals(userUnitResource.createUserUnit(userUnitDTO).getStatusCode(), HttpStatus.BAD_REQUEST);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
	/**
	 * Test negative create user unit.
	 * @throws NoSuchAlgorithmException 
	 * @throws InvalidKeySpecException 
	 * @throws BadPaddingException 
	 * @throws IllegalBlockSizeException 
	 * @throws NoSuchPaddingException 
	 * @throws JsonProcessingException 
	 * @throws InvalidKeyException 
	 */
	@Test
	@Order(2)
	public void testErrorCreateUserUnit() throws InvalidKeyException, JsonProcessingException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException {
		UserUnit userUnit= new UserUnit();
		userUnit.setUnit(new OrgUnit());
		Users users = new Users();
		users.setId(2);
		users.setUser_f_name("test");
		users.setUser_l_name("User");
		users.setUser_login("testuser");
		users.setUser_email("testuser@lfn.com");
		users.setOnboarded(true);
		users.setContext(new Context());
		userUnit.setUser(users);
		userUnit.setContext(new Context());
		UserUnitDTO userUnitDTO = new UserUnitDTO();
		ModelMapper modelMapper = new ModelMapper();
		userUnitDTO = modelMapper.map(userUnit, UserUnitDTO.class);
		try {
			assertEquals(userUnitResource.createUserUnit(userUnitDTO).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
	/**
	 * Test negative create user unit.
	 * @throws NoSuchAlgorithmException 
	 * @throws InvalidKeySpecException 
	 * @throws BadPaddingException 
	 * @throws IllegalBlockSizeException 
	 * @throws NoSuchPaddingException 
	 * @throws JsonProcessingException 
	 * @throws InvalidKeyException 
	 */
	@Test
	@Order(2)
	public void testerrorCreateUserUnit() throws InvalidKeyException, JsonProcessingException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException {
		UserUnit userUnit= new UserUnit();
		userUnit.setUnit(new OrgUnit());
		Users users = new Users();
		users.setId(2);
		users.setUser_f_name("test");
		users.setUser_l_name("User");
		users.setUser_login("testuser");
		users.setUser_email("testuser@lfn.com");
		users.setOnboarded(true);
		users.setContext(new Context());
		userUnit.setUser(users);
		userUnit.setContext(new Context());
		UserUnitDTO userUnitDTO = new UserUnitDTO();
		ModelMapper modelMapper = new ModelMapper();
		userUnitDTO = modelMapper.map(userUnit, UserUnitDTO.class);
		try {
			Mockito.when(userUnitResource.createUserUnit(userUnitDTO)).thenThrow(new DataIntegrityViolationException(null));
			assertEquals(userUnitResource.createUserUnit(userUnitDTO).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}

	/**
	 * Test update user unit.
	 * @throws NoSuchAlgorithmException 
	 * @throws InvalidKeySpecException 
	 * @throws BadPaddingException 
	 * @throws IllegalBlockSizeException 
	 * @throws NoSuchPaddingException 
	 * @throws JsonProcessingException 
	 * @throws InvalidKeyException 
	 */
	@Test
	@Order(1)
	public void testUpdateUserUnit() throws InvalidKeyException, JsonProcessingException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException {
		UserUnitDTO userUnitDTO = new UserUnitDTO();
		ModelMapper modelMapper = new ModelMapper();
		userUnitDTO = modelMapper.map(userUnit, UserUnitDTO.class);
		try {
			assertEquals(userUnitResource.updateUserUnit(userUnitDTO).getStatusCode(), HttpStatus.OK);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * Test get all user unitss.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 */
	@Test
	@Order(1)
	public void testGetAllUserUnitss() throws JsonProcessingException, UnsupportedEncodingException {
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes());
		assertEquals(userUnitResource.getAllUserUnits(str).getStatusCode(), HttpStatus.OK);
	}

	/**
	 * Test get all user units.
	 */
	@Test
	@Order(1)
	public void testGetAllUserUnits() {
		assertEquals(userUnitResource.getAllUserUnits(pageable).getStatusCode(), HttpStatus.OK);
	}
	

	/**
	 * Test get user unit.
	 */
	@Test
	@Order(1)
	public void testGetUserUnit() {
		assertEquals(userUnitResource.getUserUnit(2).getStatusCode(), HttpStatus.OK);
	}

	/**
	 * Test delete user unit.
	 */
	@Test
	@Order(1)
	public void testDeleteUserUnit() {
		assertEquals(userUnitResource.deleteUserUnit(2).getStatusCode(), HttpStatus.OK);
	}

	/**
	 * Test negative get user unit.
	 */
	@Test
	@Order(2)
	public void testNegativeGetUserUnit() {
		Mockito.when(userUnitResource.getUserUnit(2)).thenThrow(new EntityNotFoundException());
		assertEquals(userUnitResource.getUserUnit(2).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/**
	 * Test negative update user unit exception.
	 * @throws NoSuchAlgorithmException 
	 * @throws InvalidKeySpecException 
	 * @throws BadPaddingException 
	 * @throws IllegalBlockSizeException 
	 * @throws NoSuchPaddingException 
	 * @throws JsonProcessingException 
	 * @throws InvalidKeyException 
	 */
	@Test
	@Order(2)
	public void testNegativeUpdateUserUnitException() throws InvalidKeyException, JsonProcessingException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException {
		UserUnitDTO userUnitDTO = new UserUnitDTO();
		ModelMapper modelMapper = new ModelMapper();
		userUnitDTO = modelMapper.map(userUnit, UserUnitDTO.class);
		try {
			Mockito.when(userUnitResource.updateUserUnit(userUnitDTO)).thenThrow(new EntityNotFoundException());
			assertEquals(userUnitResource.updateUserUnit(userUnitDTO).getStatusCode(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}

	/**
	 * Test negative get all user unit.
	 */
	@Test
	@Order(2)
	public void testNegativeGetAllUserUnit() {
		Mockito.when(userUnitResource.getAllUserUnits(pageable)).thenThrow(new EntityNotFoundException());
		assertEquals(userUnitResource.getAllUserUnits(pageable).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	/**
	 * Test negative get all user units.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 * @throws JsonMappingException 
	 */
	@Test
	@Order(2)
	public void testNegativeGetAllUserUnits() throws JsonMappingException, UnsupportedEncodingException, JsonProcessingException {
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes());
		Mockito.when(userUnitResource.getAllUserUnits(str)).thenThrow(new EntityNotFoundException());
		assertEquals(userUnitResource.getAllUserUnits(str).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/**
	 * Test negative delete user unit.
	 */
	@Test
	@Order(2)
	public void testNegativeDeleteUserUnit() {
		Mockito.when(userUnitResource.deleteUserUnit(2)).thenThrow(new EntityNotFoundException());
		assertEquals(userUnitResource.deleteUserUnit(2).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	/**
	 * Test negative delete user unit.
	 */

	@Test
	@Order(3)
	public void testNegativeDeleteUsersUnits() {
		Mockito.when(userUnitResource.deleteUserUnit(2)).thenThrow(new EmptyResultDataAccessException(1));
		assertEquals(userUnitResource.deleteUserUnit(2).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	

	/**
	 * Test negative get all user units.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 * @throws JsonMappingException 
	 */
	@Test
	@Order(2)
	public void testNegativeGetallUserUnits() throws JsonMappingException, UnsupportedEncodingException, JsonProcessingException {
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes());
		Mockito.when(userUnitResource.getAllUserUnits(str)).thenThrow(new ArithmeticException());
		assertEquals(userUnitResource.getAllUserUnits(str).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
}
