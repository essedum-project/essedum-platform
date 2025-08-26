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

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.io.UnsupportedEncodingException;
import java.net.URISyntaxException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.sql.SQLException;
import java.util.Base64;
import java.util.Collections;
import java.util.Optional;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolationException;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.mockito.Mockito;
import org.modelmapper.ModelMapper;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.LazyLoadEvent;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.iamp.usm.domain.Context;
import com.infosys.icets.iamp.usm.domain.Users;
import com.infosys.icets.iamp.usm.dto.UsersDTO;
import com.infosys.icets.iamp.usm.repository.UserUnitRepository;
import com.infosys.icets.iamp.usm.repository.UsersRepository;
import com.infosys.icets.iamp.usm.service.ContextService;
import com.infosys.icets.iamp.usm.service.impl.AzureUserServiceImpl;
import com.infosys.icets.iamp.usm.service.impl.UsersServiceImpl;
// TODO: Auto-generated Javadoc

/**
 * The Class UsersResourceTest.
 *
 * @author icets
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class UsersResourceTest {

	/** The users resource. */
	static UsersResource usersResource;

	/** The pageable. */
	static Pageable pageable = null;

	/** The users. */
	static Users users = new Users();

	/** The req. */
	static PageRequestByExample<Users> req = null;
	/** */
	ObjectMapper Obj = new ObjectMapper();
	static AzureUserServiceImpl azureService;

	/**
	 * Setup.
	 */
	@BeforeAll
	static void setup() {
		UsersRepository usersRepository = Mockito.mock(UsersRepository.class);
	    UserUnitRepository userUnitRepository = Mockito.mock(UserUnitRepository.class);
		PasswordEncoder passwordEncoder = Mockito.mock(PasswordEncoder.class);
		ContextService contextService = Mockito.mock(ContextService.class);
		users.setId(2);
		users.setUser_f_name("test");
		users.setUser_l_name("User");
		users.setUser_login("testuser");
		users.setUser_email("testuser@infosys.com");
		users.setOnboarded(true);
		users.setContext(new Context());
		users.setActivated(true);
		users.setForce_password_change(false);
		users.setLast_updated_dts(null);
		users.setUser_added_by(null);
		users.setUser_act_ind(false);
		users.setClientDetails("test");
		Mockito.when(usersRepository.findById(2)).thenReturn(Optional.of(users));
		Mockito.when(usersRepository.findByUserLogin("testuser")).thenReturn(users);
		Mockito.when(usersRepository.findByUserEmail("testuser@infosys.com")).thenReturn(users);
		Mockito.when(usersRepository.save(users)).thenReturn(users);
		Page<Users> usersPage = new PageImpl<>(Collections.singletonList(users));
		pageable = PageRequest.of(0, 1);
		Mockito.when(usersRepository.findAll(pageable)).thenReturn(usersPage);
		req = new PageRequestByExample<Users>();
		ExampleMatcher matcher = ExampleMatcher.matching() //
				.withMatcher("userFName", match -> match.ignoreCase().startsWith())
				.withMatcher("userMName", match -> match.ignoreCase().startsWith())
				.withMatcher("userLName", match -> match.ignoreCase().startsWith())
				.withMatcher("userEmail", match -> match.ignoreCase().startsWith())
				.withMatcher("userLogin", match -> match.ignoreCase().startsWith());
		Example<Users> example = Example.of(users, matcher);
		req.setExample(users);
		Mockito.when(usersRepository.findAll(example, req.toPageable())).thenReturn(usersPage);
		Mockito.when(usersRepository.findAll(req.toPageable())).thenReturn(usersPage);
		UsersServiceImpl usersService = new UsersServiceImpl(usersRepository, passwordEncoder, contextService,
				userUnitRepository,azureService);

		usersResource = new UsersResource(usersService);
	}

	/**
	 * Test negative create user.
	 * @throws JsonProcessingException 
	 * @throws NoSuchAlgorithmException 
	 * @throws InvalidKeySpecException 
	 * @throws BadPaddingException 
	 * @throws IllegalBlockSizeException 
	 * @throws NoSuchPaddingException 
	 * @throws InvalidKeyException 
	 * @throws KeyStoreException 
	 * @throws KeyManagementException 
	 */
	@Test
	@Order(1)
	public void testNegativeCreateUser() throws JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException, KeyManagementException, KeyStoreException {
		UsersDTO usersDTO = new UsersDTO();
		ModelMapper modelMapper = new ModelMapper();
		usersDTO = modelMapper.map(users, UsersDTO.class);
		try {
			assertEquals(usersResource.createUsers(usersDTO).getStatusCode(), HttpStatus.BAD_REQUEST);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
	/**
	 * Test negative create user.
	 * @throws JsonProcessingException 
	 * @throws NoSuchAlgorithmException 
	 * @throws InvalidKeySpecException 
	 * @throws BadPaddingException 
	 * @throws IllegalBlockSizeException 
	 * @throws NoSuchPaddingException 
	 * @throws InvalidKeyException 
	 * @throws KeyStoreException 
	 * @throws KeyManagementException 
	 */
	@Test
	@Order(2)
	public void testErrorCreateUser() throws JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException, KeyManagementException, KeyStoreException {
		Users users =new Users();
		users.setUser_f_name("test");
		users.setUser_l_name("User");
		users.setUser_login("testuser");
		users.setUser_email("testuser@infosys.com");
		users.setOnboarded(true);
		users.setContext(new Context());
		users.setActivated(true);
		users.setForce_password_change(false);
		users.setLast_updated_dts(null);
		users.setUser_added_by(null);
		users.setUser_act_ind(false);
		users.setClientDetails("test");
		UsersDTO usersDTO = new UsersDTO();
		ModelMapper modelMapper = new ModelMapper();
		usersDTO = modelMapper.map(users, UsersDTO.class);
		try {
			assertEquals(usersResource.createUsers(usersDTO).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
	/**
	 * Test negative create user.
	 * @throws JsonProcessingException 
	 * @throws NoSuchAlgorithmException 
	 * @throws InvalidKeySpecException 
	 * @throws BadPaddingException 
	 * @throws IllegalBlockSizeException 
	 * @throws NoSuchPaddingException 
	 * @throws InvalidKeyException 
	 * @throws KeyStoreException 
	 * @throws KeyManagementException 
	 */
	@Test
	@Order(2)
	public void testerrorCreateUser() throws JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException, KeyManagementException, KeyStoreException {
		Users users =new Users();
		users.setUser_f_name("test");
		users.setUser_l_name("User");
		users.setUser_login("testuser");
		users.setUser_email("testuser@infosys.com");
		users.setOnboarded(true);
		users.setContext(new Context());
		users.setActivated(true);
		users.setForce_password_change(false);
		users.setLast_updated_dts(null);
		users.setUser_added_by(null);
		users.setUser_act_ind(false);
		users.setClientDetails("test");
		UsersDTO usersDTO = new UsersDTO();
		ModelMapper modelMapper = new ModelMapper();
		usersDTO = modelMapper.map(users, UsersDTO.class);
		try {
			Mockito.when(usersResource.createUsers(usersDTO)).thenThrow(new DataIntegrityViolationException(null));
			assertEquals(usersResource.createUsers(usersDTO).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}

	/**
	 * Test update user.
	 * @throws JsonProcessingException 
	 * @throws NoSuchAlgorithmException 
	 * @throws InvalidKeySpecException 
	 * @throws BadPaddingException 
	 * @throws IllegalBlockSizeException 
	 * @throws NoSuchPaddingException 
	 * @throws InvalidKeyException 
	 * @throws KeyStoreException 
	 * @throws KeyManagementException 
	 */
	@Test
	@Order(1)
	public void testUpdateUser() throws JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException, KeyManagementException, KeyStoreException {
		UsersDTO usersDTO = new UsersDTO();
		ModelMapper modelMapper = new ModelMapper();
		usersDTO = modelMapper.map(users, UsersDTO.class);
		try {
			assertEquals(usersResource.updateUsers(usersDTO).getStatusCode(), HttpStatus.OK);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}

	/**
	 * Test update password.
	 */
	@Test
	@Order(1)
	public void testUpdatePassword() {
		UsersDTO usersDTO = new UsersDTO();
		Users users1 = new Users();
		users1.setId(2);
		users1.setUser_f_name("test");
		users1.setUser_l_name("User");
		users1.setUser_login("testuser");
		users1.setUser_email("testuser@infosys.com");
		users1.setOnboarded(true);
		users1.setPassword("test@123");
		users1.setContext(new Context());
		ModelMapper modelMapper = new ModelMapper();
		usersDTO = modelMapper.map(users1, UsersDTO.class);
		try {
			assertEquals(usersResource.updatePassword(usersDTO).getStatusCode(), HttpStatus.OK);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}

	/**
	 * Test get all users.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 * @throws JsonMappingException 
	 * @throws NoSuchAlgorithmException 
	 * @throws InvalidKeySpecException 
	 * @throws BadPaddingException 
	 * @throws IllegalBlockSizeException 
	 * @throws NoSuchPaddingException 
	 * @throws InvalidKeyException 
	 * @throws InvalidAlgorithmParameterException 
	 */
	@Test
	@Order(1)
	public void testGetAllUserss() throws JsonMappingException, UnsupportedEncodingException, JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException, InvalidAlgorithmParameterException {
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes());
		assertEquals(usersResource.getAllUserss(str).getStatusCode(), HttpStatus.OK);
	}

	/**
	 * Test get all users.
	 */
	@Test
	@Order(1)
	public void testGetAllUsers() {
		assertEquals(usersResource.getAllUserss(pageable).getStatusCode(), HttpStatus.OK);
	}

	/**
	 * Test get user.
	 * @throws JsonProcessingException 
	 * @throws NoSuchAlgorithmException 
	 * @throws InvalidKeySpecException 
	 * @throws BadPaddingException 
	 * @throws IllegalBlockSizeException 
	 * @throws NoSuchPaddingException 
	 * @throws InvalidKeyException 
	 */
	@Test
	@Order(1)
	public void testGetUser() throws JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException {
		assertEquals(usersResource.getUsers(2).getStatusCode(), HttpStatus.OK);
	}

	/**
	 * Test delete user.
	 * @throws SQLException 
	 */
	@Test
	@Order(1)
	public void testDeleteUser() throws SQLException {
		assertEquals(usersResource.deleteUsers(2).getStatusCode(), HttpStatus.OK);
	}

	/**
	 * Test negative get users.
	 * @throws JsonProcessingException 
	 * @throws NoSuchAlgorithmException 
	 * @throws InvalidKeySpecException 
	 * @throws BadPaddingException 
	 * @throws IllegalBlockSizeException 
	 * @throws NoSuchPaddingException 
	 * @throws InvalidKeyException 
	 */
	@Test
	@Order(2)
	public void testNegativeGetUsers() throws JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException {
		Mockito.when(usersResource.getUsers(2)).thenThrow(new EntityNotFoundException());
		assertEquals(usersResource.getUsers(2).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/**
	 * Test negative update users exception.
	 * @throws JsonProcessingException 
	 * @throws NoSuchAlgorithmException 
	 * @throws InvalidKeySpecException 
	 * @throws BadPaddingException 
	 * @throws IllegalBlockSizeException 
	 * @throws NoSuchPaddingException 
	 * @throws InvalidKeyException 
	 * @throws KeyStoreException 
	 * @throws KeyManagementException 
	 */
	@Test
	@Order(2)
	public void testNegativeUpdateUsersException() throws JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException, KeyManagementException, KeyStoreException {
		UsersDTO usersDTO = new UsersDTO();
		ModelMapper modelMapper = new ModelMapper();
		usersDTO = modelMapper.map(users, UsersDTO.class);
		try {
			Mockito.when(usersResource.updateUsers(usersDTO)).thenThrow(new EntityNotFoundException());
			assertEquals(usersResource.updateUsers(usersDTO).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}

	/**
	 * Test negative get all users.
	 */
	@Test
	@Order(2)
	public void testNegativeGetAllUsers() {
		Mockito.when(usersResource.getAllUserss(pageable)).thenThrow(new EntityNotFoundException());
		assertEquals(usersResource.getAllUserss(pageable).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/**
	 * Test negative get all users.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 * @throws JsonMappingException 
	 * @throws NoSuchAlgorithmException 
	 * @throws InvalidKeySpecException 
	 * @throws BadPaddingException 
	 * @throws IllegalBlockSizeException 
	 * @throws NoSuchPaddingException 
	 * @throws InvalidKeyException 
	 * @throws InvalidAlgorithmParameterException 
	 */
	@Test
	@Order(2)
	public void testNegativeGetAllUserss() throws JsonMappingException, UnsupportedEncodingException, JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException, InvalidAlgorithmParameterException {
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes());
		Mockito.when(usersResource.getAllUserss(str)).thenThrow(new EntityNotFoundException());
		assertEquals(usersResource.getAllUserss(str).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/**
	 * Test negative delete user.
	 * @throws SQLException 
	 */
//	}
	@Test
	@Order(2)
	public void testNegativeDeleteUser() throws SQLException {
		Mockito.when(usersResource.deleteUsers(2)).thenThrow(new EntityNotFoundException());
		assertEquals(usersResource.deleteUsers(2).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/**
	 * Test negative delete user.
	 * @throws SQLException 
	 */
	@Test
	@Order(3)
	public void testNegativeDeleteUsers() throws SQLException {
		Mockito.when(usersResource.deleteUsers(2)).thenThrow(new EmptyResultDataAccessException(1));
		assertEquals(usersResource.deleteUsers(2).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/**
	 * Test negative Update Password
	 */

	@Test
	@Order(2)
	public void testNegativeUpdatePassword() {
		UsersDTO usersDTO = new UsersDTO();
		Users users1 = new Users();
		users1.setId(2);
		users1.setUser_f_name("test");
		users1.setUser_l_name("User");
		users1.setUser_login("testuser");
		users1.setUser_email("testuser@infosys.com");
		users1.setOnboarded(true);
		users1.setPassword("test@123");
		users1.setContext(new Context());
		ModelMapper modelMapper = new ModelMapper();
		usersDTO = modelMapper.map(users1, UsersDTO.class);
		try {
			Mockito.when(usersResource.updatePassword(usersDTO)).thenThrow(new ConstraintViolationException(null));
			assertEquals(usersResource.updatePassword(usersDTO).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}

	/**
	 * Test negative get all Users.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 * @throws JsonMappingException 
	 * @throws NoSuchAlgorithmException 
	 * @throws InvalidKeySpecException 
	 * @throws BadPaddingException 
	 * @throws IllegalBlockSizeException 
	 * @throws NoSuchPaddingException 
	 * @throws InvalidKeyException 
	 * @throws InvalidAlgorithmParameterException 
	 */
	@Test
	@Order(3)
	public void testNegativeGetAllUser() throws JsonMappingException, UnsupportedEncodingException, JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException, InvalidAlgorithmParameterException {
		req.setLazyLoadEvent(new LazyLoadEvent(0, 0, null, 0));
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes());
//		Mockito.when(usersResource.getAllUserss(str)).thenThrow(new ArithmeticException());
		assertEquals(usersResource.getAllUserss(str).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	@Test
	@Order(3)
	public void testfindbymail() throws InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, UnsupportedEncodingException, InvalidAlgorithmParameterException  {
		assertEquals(usersResource.checkMail("testuser@infosys.com").getStatusCode(), HttpStatus.OK);
	}
	@Test
	@Order(2)
	public void testNegativefindmymail() throws InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, UnsupportedEncodingException, InvalidAlgorithmParameterException {
		assertEquals(usersResource.checkMail("test@infosys.com").getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}

		@Test
		@Order(1)
		public void testresetPassword() throws InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, UnsupportedEncodingException, InvalidAlgorithmParameterException, LeapException {
			UsersDTO usersDTO = new UsersDTO();
			Users users1 = new Users();
			users1.setId(2);
			users1.setUser_f_name("test");
			users1.setUser_l_name("User");
			users1.setUser_login("testuser");
			users1.setUser_email("testuser@infosys.com");
			users1.setOnboarded(true);
			users1.setPassword("test@123");
			users1.setContext(new Context());
			ModelMapper modelMapper = new ModelMapper();
			usersDTO = modelMapper.map(users1, UsersDTO.class);
			try {
				assertEquals(usersResource.resetPassword(usersDTO).getStatusCode(), HttpStatus.OK);
			} catch (URISyntaxException e) {
				e.printStackTrace();
			}
		}
		@Test
		@Order(2)
		public void testNegativeResetPassword() throws InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, UnsupportedEncodingException, InvalidAlgorithmParameterException, LeapException {
			UsersDTO usersDTO = new UsersDTO();
			Users users1 = new Users();
			users1.setId(2);
			users1.setUser_f_name("test");
			users1.setUser_l_name("User");
			users1.setUser_login("testuser");
			users1.setUser_email("testuser@infosys.com");
			users1.setOnboarded(true);
			users1.setPassword("test@123");
			users1.setContext(new Context());
			ModelMapper modelMapper = new ModelMapper();
			usersDTO = modelMapper.map(users1, UsersDTO.class);
			try {
				Mockito.when(usersResource.resetPassword(usersDTO)).thenThrow(new ConstraintViolationException(null));
				assertEquals(usersResource.resetPassword(usersDTO).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
			} catch (URISyntaxException e) {
				e.printStackTrace();
			}
		}
		@Test
		@Order(2)
		public void testNegativeResetPasswordd() throws InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, UnsupportedEncodingException, InvalidAlgorithmParameterException, LeapException {
			UsersDTO usersDTO = new UsersDTO();
			Users users1 = new Users();
			users1.setId(2);
			users1.setUser_f_name("test");
			users1.setUser_l_name("User");
			users1.setUser_login("testuser");
			users1.setUser_email("testuser@infosys.com");
			users1.setOnboarded(true);
			users1.setContext(new Context());
			ModelMapper modelMapper = new ModelMapper();
			usersDTO = modelMapper.map(users1, UsersDTO.class);
			try {
				Mockito.when(usersResource.resetPassword(usersDTO)).thenThrow(new ConstraintViolationException(null));
				assertEquals(usersResource.resetPassword(usersDTO).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
			} catch (URISyntaxException e) {
				e.printStackTrace();
			}
		}

		/**
		 * Test get all users.
		 * @throws JsonProcessingException 
		 * @throws UnsupportedEncodingException 
		 * @throws NoSuchAlgorithmException 
		 * @throws InvalidKeySpecException 
		 * @throws BadPaddingException 
		 * @throws IllegalBlockSizeException 
		 * @throws NoSuchPaddingException 
		 * @throws InvalidKeyException 
		 * @throws InvalidAlgorithmParameterException 
		 * @throws JsonMappingException 
		 */
		@Test
		@Order(1)
		public void testFetchAllUsers() throws JsonProcessingException, UnsupportedEncodingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException, InvalidAlgorithmParameterException {
			pageable = PageRequest.of(0, 1);
			assertEquals(usersResource.getPaginatedUsersList(pageable).getStatusCode(), HttpStatus.OK);
		}
		
		/**
		 * Test get all user project roles.
		 * @throws JsonProcessingException 
		 * @throws UnsupportedEncodingException 
		 * @throws URISyntaxException 
		 * @throws JsonMappingException 
		 */
//		@Test
//		@Order(1)
//		public void testSearchUsers() throws JsonProcessingException, UnsupportedEncodingException, URISyntaxException {
//			pageable = PageRequest.of(0, 1);
//			UsersRepository usersRepository = Mockito.mock(UsersRepository.class);
//			Users users = new Users();
//			users.setId(1);
//			users.setUser_f_name("test");
//			users.setUser_l_name("User");
//			users.setUser_login("testuser");
//			users.setUser_email("testuser@infosys.com");
//			users.setOnboarded(true);
//			users.setContext(new Context());
//			users.setActivated(true);
//			users.setForce_password_change(false);
//			users.setLast_updated_dts(null);
//			users.setUser_added_by(null);
//			users.setUser_act_ind(false);
//			users.setClientDetails("test");
//			Mockito.when(usersRepository.findById(1)).thenReturn(Optional.of(users));
//			Mockito.when(usersRepository.save(users)).thenReturn(users);
//			ExampleMatcher matcher = ExampleMatcher.matching() //
//					.withMatcher("user_f_name", match -> match.ignoreCase().contains())
//					.withMatcher("user_m_name", match -> match.ignoreCase().contains())
//					.withMatcher("user_l_name", match -> match.ignoreCase().contains())
//					.withMatcher("user_email", match -> match.ignoreCase().contains())
//					.withMatcher("user_login", match -> match.ignoreCase().contains());
//			Example<Users> example = Example.of(users, matcher);
//			Page<Users> usersPage = new PageImpl<>(Collections.singletonList(users));
//			Mockito.when(usersRepository.findAll(example, pageable)).thenReturn(usersPage);
//			assertEquals(usersResource.searchUsers(pageable, req).getStatusCode(), HttpStatus.OK);
//		}
		
		/**
		 * Test Search Users
		 * @throws JsonProcessingException 
		 * @throws UnsupportedEncodingException 
		 * @throws URISyntaxException 
		 * @throws NoSuchAlgorithmException 
		 * @throws InvalidKeySpecException 
		 * @throws BadPaddingException 
		 * @throws IllegalBlockSizeException 
		 * @throws NoSuchPaddingException 
		 * @throws InvalidKeyException 
		 * @throws JsonMappingException 
		 */
		@Test
		@Order(1)
		public void testSearchUserss() throws JsonProcessingException, UnsupportedEncodingException, URISyntaxException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException {
			pageable = PageRequest.of(0, 1);
			PageRequestByExample<Users> req = new PageRequestByExample<Users>();
			assertEquals(usersResource.searchUsers(pageable, req).getStatusCode(), HttpStatus.OK);
		}
}
