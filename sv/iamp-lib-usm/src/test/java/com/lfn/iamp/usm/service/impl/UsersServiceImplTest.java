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

package com.lfn.iamp.usm.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.sql.SQLException;
import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.Date;
import java.util.Optional;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.QueryByExampleExecutor;
import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.test.util.ReflectionTestUtils;

import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.lfn.ai.comm.lib.util.service.dto.support.PageResponse;
import com.lfn.iamp.usm.domain.Context;
import com.lfn.iamp.usm.domain.UserUnit;
import com.lfn.iamp.usm.domain.Users;
import com.lfn.iamp.usm.repository.UserUnitRepository;
import com.lfn.iamp.usm.repository.UsersRepository;
import com.lfn.iamp.usm.service.ContextService;

// TODO: Auto-generated Javadoc
/**
 * The Class UsersServiceImplTest.
 *
 * @author essedum
 */
public class UsersServiceImplTest {

	/** The log. */
	private final Logger log = LoggerFactory.getLogger(UsersServiceImplTest.class);

	/** The service. */
	static UsersServiceImpl service;

	/** The pageable. */
	static Pageable pageable = null;

	/** The req. */
	static PageRequestByExample<Users> req = null;

	/** The user. */
	static QueryByExampleExecutor<Users> user = null;

	/** The users. */
	static Users users = new Users();

	/** The userunit. */
	static UserUnit userunit = new UserUnit();

	/** The users 1. */
	static Users users1 = new Users();

	static AzureUserServiceImpl azureService;

	/**
	 * Setup.
	 */
	@BeforeAll
	static void setup() {
		UsersRepository usersRepository = Mockito.mock(UsersRepository.class);

		// UsersRepo usersRepo = Mockito.mock(UsersRepo.class);
		UserUnitRepository userUnitRepository = Mockito.mock(UserUnitRepository.class);
		PasswordEncoder passwordEncoder = Mockito.mock(PasswordEncoder.class);
		ContextService contextService = Mockito.mock(ContextService.class);
		users.setId(2);
		users.setUser_f_name("test");
		users.setUser_l_name("User");
		users.setUser_login("testuser");
		users.setUser_email("testuser@lfn.com");
		users.setOnboarded(true);
		users.setContext(new Context());
		users.setActivated(true);
		users.setForce_password_change(false);
		Date date = new Date();
        date.getTime();
		users.setLast_updated_dts(date);
		users.setUser_added_by(null);
		users.setUser_act_ind(false);
		users.setClientDetails("test");
		users1.setId(2);
		users1.setUser_f_name("test");
		users1.setUser_l_name("User");
		users1.setUser_login("testuser");
		users1.setUser_email("testuser@lfn.com");
		users1.setOnboarded(true);
		users1.setContext(new Context());
		users1.setActivated(true);
		users1.setForce_password_change(false);
		users1.setLast_updated_dts(date);
		users1.setUser_added_by(null);
		users1.setUser_act_ind(false);
		users1.setClientDetails("test");
		users1.setPassword("test@123");
		Mockito.when(usersRepository.findById(2)).thenReturn(Optional.of(users));

		Mockito.when(usersRepository.findByUserLogin("testuser")).thenReturn(users);
		Mockito.when(usersRepository.findByUserEmail("testuser@lfn.com")).thenReturn(users);
		Mockito.when(userUnitRepository.findByUserAndOrg(2, "test")).thenReturn(userunit);
		Mockito.when(usersRepository.save(users)).thenReturn(users);
		Page<Users> usersPage = new PageImpl<>(Collections.singletonList(users));
		pageable = PageRequest.of(0, 1);
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
		Mockito.when(usersRepository.findOne(Example.of(users1))).thenReturn(Optional.of(users));
		Mockito.when(usersRepository.findAll(req.toPageable())).thenReturn(usersPage);
		Mockito.when(usersRepository.findAll(pageable)).thenReturn(usersPage);
		service = new UsersServiceImpl(usersRepository, passwordEncoder, contextService, userUnitRepository,
				azureService);

//		ReflectionTestUtils.setField(service, "defaultPWD", "test@123");
//		ReflectionTestUtils.setField(service, "domain", "@lfn.com");

	}

	/**
	 * Test find by id.
	 */
	@Test
	void testFindById() {
		try {
			assertEquals(service.findOne(2).getId(), 2);
		} catch (SQLException e) {
			log.error("Exception : {}", e.getMessage());
		}
	}

	/**
	 * Test save.
	 */
	@Test
	void testSave() {
		Users users = new Users();
		users.setId(2);
		users.setUser_f_name("test");
		users.setUser_l_name("User");
		users.setUser_login("testuser");
		users.setUser_email("testuser@lfn.com");
		users.setOnboarded(true);
		users.setContext(new Context());
		users.setActivated(true);
		users.setForce_password_change(false);
		Date date = new Date();
        date.getTime();
		users.setLast_updated_dts(date);
		users.setUser_added_by(null);
		users.setUser_act_ind(false);
		users.setClientDetails("test");
		try {
			assertEquals(service.save(users).getUser_f_name(), "test");
		} catch (SQLException e) {
			log.error("Exception : {}", e.getMessage());
		}
	}

	/**
	 * Test delete by id.
	 */
	@Test
	void testDeleteById() {
		Users users = new Users();
		users.setId(2);
		try {
			service.delete(users);
			assertEquals(service.findOne(2).getId(), 2);
		} catch (SQLException e) {
			log.error("Exception : {}", e.getMessage());
		}

	}

	/**
	 * Test find by user login.
	 */
	@Test
	void testFindByUserLogin() {

		assertEquals(service.findByUserLogin("testuser").getUser_login(), "testuser");

	}

	/**
	 * Test create user with default mappings.
	 */
	@Test
	void testCreateUserWithDefaultMappings() {

		assertEquals(service.createUserWithDefaultMapping("testuser", "test", "user", "testuser@lfn.com")
				.getUser_f_name(), "test");
	}

	/**
	 * Test authenticate user.
	 */
	@Test
	void testAuthenticateUser() {

		assertEquals("test", service.authenticateUser(users, "test").getUser_f_name());
	}

//	@Test
//	void testAuthorizeUser() {
//	
//		assertEquals(service.authorizeUser(users1, "test").getUser_f_name(),"test");
	/**
	 * Test update.
	 */
//	}
	@Test
	void testUpdate() {
		Users users = new Users();
		users.setId(2);
		users.setUser_f_name("test");
		users.setUser_l_name("User");
		users.setUser_login("testuser");
		users.setUser_email("testuser@lfn.com");
		users.setOnboarded(true);
		users.setPassword("test@123");
		users.setContext(new Context());
		try {
			assertEquals(service.update(users).getUser_f_name(), "test");
		} catch (SQLException e) {
			log.error("Exception : {}", e.getMessage());
		}
	}

	/**
	 * Test find all.
	 *
	 * @throws SQLException the SQL exception
	 */
	@Test
	void testFindAll() throws SQLException {
		Page<Users> userslist = service.findAll(pageable);
		assertEquals(userslist.getTotalElements(), 1);
	}

	/**
	 * Test Authorize User
	 *
	 *
	 */
	@Test
	void testAuthorizeUser() {
		Users users = new Users();
		users.setId(2);
		users.setUser_f_name("test");
		users.setUser_l_name("User");
		users.setUser_login("testuser");
		users.setUser_email("testuser@lfn.com");
		users.setOnboarded(true);
		users.setPassword("test@123");
		users.setContext(new Context());
		assertEquals(null, service.authorizeUser(users, "test").getUser_f_name());
	}

//	@Test
//	void createUserWithDefaultMapping(){
//		assertEquals("xyz",service.createUserWithDefaultMapping("xyz", "xyz", "xyz", "xyz").getUser_f_name());
//	}
	/**
	 * Test get all
	 *
	 * @throws SQLException the SQL exception
	 */
	@Test
	void testGetAll() throws SQLException {
		PageResponse<Users> userslist = service.getAll(req);
		assertEquals(userslist.getTotalElements(), 1);
	}

	/**
	 * Test find by user login.
	 */
	@Test
	void testFindByUserLoginn() {
		Example<Users> example = Example.of(users);
		assertEquals(service.findByUserLogin(example).getUser_f_name(), "test");
	}

	@Test
	void testFindByUserEmail() {
		try {
			assertEquals(service.findEmail("testuser@lfn.com"), 2);
		} catch (EssedumException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	@Test
	void testFindByUserEmails() {
		try {
			service.findEmail("test@lfn.com");
		} catch (EssedumException e) {
			assertEquals(e.getMessage().isEmpty(), false);

		}
	}
}
