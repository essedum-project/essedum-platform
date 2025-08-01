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

package com.infosys.icets.iamp.usm.service.impl;
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

import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.domain.Context;
import com.infosys.icets.iamp.usm.domain.Project;
import com.infosys.icets.iamp.usm.domain.Role;
import com.infosys.icets.iamp.usm.domain.UserProjectRole;
import com.infosys.icets.iamp.usm.domain.Users;
import com.infosys.icets.iamp.usm.domain.UsmPortfolio;
import com.infosys.icets.iamp.usm.repository.OrgUnitRepository;
import com.infosys.icets.iamp.usm.repository.RoleRepository;
import com.infosys.icets.iamp.usm.repository.UserProjectRoleRepository;
import com.infosys.icets.iamp.usm.repository.UserUnitRepository;
import com.infosys.icets.iamp.usm.service.InvalidTokenService;
import com.infosys.icets.iamp.usm.repository.UsersRepository;
import com.infosys.icets.iamp.usm.service.InvalidTokenService;
import com.infosys.icets.iamp.usm.service.ProjectService;
import com.infosys.icets.iamp.usm.service.RoleService;
import com.infosys.icets.iamp.usm.service.UsersService;
import com.infosys.icets.iamp.usm.service.UsmPortfolioService;

// TODO: Auto-generated Javadoc
/**
 * The Class UserProjectRoleServiceImplTest.
 *
 * @author icets
 */
public class UserProjectRoleServiceImplTest {
	
	/** The log. */
	private final Logger log = LoggerFactory.getLogger(UserProjectRoleServiceImplTest.class);

	/** The service. */
	static UserProjectRoleServiceImpl service;
	
	/** The users service. */
	static UsersServiceImpl usersService;
	
	/** The user project role. */
	static UserProjectRole userProjectRole;
	
	/** The role. */
	static Role role;
	
	/** The project. */
	static Project project;
	
	/** The users. */
	static Users users;
	
	/** The usm portfolio 1. */
	static UsmPortfolio usmPortfolio1;
	
	/** The usm portfolio. */
	static UsmPortfolio usmPortfolio;
	
	/** The pageable. */
	static Pageable pageable = null;
	
	/** The req. */
	static PageRequestByExample<UserProjectRole> req = null;

    /** The UsmAuthToken service. */
	static  InvalidTokenService invalidTokenService;;
	
	/**
	 * Setup.
	 */
	@BeforeAll
	static void setup() {
		
		UserProjectRoleRepository userProjectRoleRepository = Mockito.mock(UserProjectRoleRepository.class);
		//UserProjectRoleRepo userProjectRoleRepo = Mockito.mock(UserProjectRoleRepo.class);		
		RoleRepository roleRepository = Mockito.mock(RoleRepository.class);
		UsersRepository usersRepository = Mockito.mock(UsersRepository.class);
		UsmPortfolioService portfolioService = Mockito.mock(UsmPortfolioService.class);
		UsersService usersService = Mockito.mock(UsersService.class);
		ProjectService projectService = Mockito.mock(ProjectService.class);
		RoleService roleService = Mockito.mock(RoleService.class);
		UserUnitRepository userUnitRepository= Mockito.mock(UserUnitRepository.class);		    
		OrgUnitRepository orgUnitRepository =  Mockito.mock(OrgUnitRepository.class);
		userProjectRole = new UserProjectRole();
		userProjectRole.setId(2);
		usmPortfolio1 = new UsmPortfolio();
		usmPortfolio1.setId(2);
		usmPortfolio1.setPortfolioName("test");
		usmPortfolio1.setDescription("test");
		userProjectRole.setPortfolio_id(usmPortfolio1);
		project = new Project();
		project.setId(1);
		project.setName("Test");
		project.setDefaultrole(true);
		project.setDescription("Test Project");
		usmPortfolio = new UsmPortfolio();
		usmPortfolio.setId(2);
		usmPortfolio.setPortfolioName("test");
		usmPortfolio.setDescription("test");
		project.setPortfolioId(usmPortfolio);
		userProjectRole.setProject_id(project);
		role = new Role();
		role.setId(2);
		role.setName("test");
		role.setDescription("Test Role");
		role.setPermission(true);
		role.setProjectId(null);
		role.setRoleadmin(false);
		userProjectRole.setRole_id(role);
		users = new Users();
		users.setId(2);
		users.setUser_f_name("test");
		users.setUser_l_name("User");
		users.setUser_login("testuser");
		users.setUser_email("testuser@infosys.com");
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
		userProjectRole.setUser_id(users);
		Users users1 = new Users();
		users1.setId(2);
		users1.setUser_f_name("test");
		users1.setUser_l_name("User");
		users1.setUser_login("testuser");
		users1.setUser_email("testuser@infosys.com");
		users1.setOnboarded(true);
		users1.setContext(new Context());
		users1.setActivated(true);
		users1.setForce_password_change(false);
		users1.setLast_updated_dts(date);
		users1.setUser_added_by(null);
		users1.setUser_act_ind(false);
		users1.setClientDetails("test");
		Mockito.when(userProjectRoleRepository.findById(2)).thenReturn(Optional.of(userProjectRole));
		try {
			Mockito.when(projectService.findOne(2)).thenReturn(project);
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		Mockito.when(roleRepository.findById(2)).thenReturn(Optional.of(role));
		Mockito.when(usersRepository.findById(2)).thenReturn(Optional.of(users1));
		Mockito.when(usersService.findByUserLogin("testuser")).thenReturn(users);
		Mockito.when(usersService.createUserWithDefaultMapping("testuser", "testuser", "testuser", "testuser")).thenReturn(users);
		Mockito.when(usersRepository.save(users1)).thenReturn(users1);
		Mockito.when(userProjectRoleRepository.save(userProjectRole)).thenReturn(userProjectRole);
		Mockito.when(roleRepository.findById(2)).thenReturn(Optional.of(role));
		Mockito.when(userProjectRoleRepository.save(userProjectRole)).thenReturn(userProjectRole);
		Page<UserProjectRole> userProjectRolePage = new PageImpl<>(Collections.singletonList(userProjectRole));
		pageable = PageRequest.of(0, 1);
		req = new PageRequestByExample<UserProjectRole>();
		ExampleMatcher matcher = ExampleMatcher.matching();
		Example<UserProjectRole> example = Example.of(userProjectRole,matcher);
		req.setExample(userProjectRole);
		Mockito.when(userProjectRoleRepository.findAll(example,req.toPageable())).thenReturn(userProjectRolePage);
		Mockito.when(userProjectRoleRepository.findAll(req.toPageable())).thenReturn(userProjectRolePage);
		Mockito.when(userProjectRoleRepository.findAll(pageable)).thenReturn(userProjectRolePage);
		service = new UserProjectRoleServiceImpl(userProjectRoleRepository, usersService, projectService, roleService,
				portfolioService,userUnitRepository,orgUnitRepository,invalidTokenService);
		
//		ReflectionTestUtils.setField(service, "autoUserProject", "2");
//		ReflectionTestUtils.setField(service, "roles", "2");
	

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
	
		try {
			assertEquals(service.save(userProjectRole).getProject_id().getName(), "Test");
		} catch (SQLException e) {
			log.error("Exception : {}", e.getMessage());
		}

	}

	/**
	 * Test delete by id.
	 */
	@Test
	void testDeleteById() {
		UserProjectRole userProjectRole = new UserProjectRole();
		userProjectRole.setId(2);

		try {
			service.delete(userProjectRole);
		} catch (SQLException e) {
			log.error("Exception : {}", e.getMessage());
		}
		try {
			assertEquals(service.findOne(2).getId(), 2);
		} catch (SQLException e) {
			log.error("Exception : {}", e.getMessage());
		}
	}

	/**
	 * Test get user project role summary.
	 */
	@Test
	void testGetUserProjectRoleSummary() {
		assertEquals(service.getUserProjectRoleSummary("test"), Optional.empty());
	}
	
	/**
	 * Test create user with default mappings.
	 */
	@Test
	void testCreateUserWithDefaultMappings() {
		Users users = new Users();
		users.setId(2);
		users.setUser_f_name("test");
		users.setUser_l_name("User");
		users.setUser_login("testuser");
		users.setUser_email("testuser@infosys.com");
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
			assertEquals(service.createUserWithDefaultMapping(users).getUserId().getId(),2);
		} catch (SQLException e) {
			log.error("Exception " +e.getMessage());
		}
	}
	
	/**
	 * Test create user with default mappings 1.
	 */
	@Test
	void testCreateUserWithDefaultMappings1() {
		
		assertEquals(service.createUserWithDefaultMapping("testuser").getUserId().getId(),2);
	}
	
	/**
	 * Test find by user id user login.
	 */
	@Test
	void testFindByUserIdUserLogin() {
		try {
			assertEquals(service.findByUserIdUserLogin("test").isEmpty(),true);
		} catch (SQLException e) {
			log.error("Exception " +e.getMessage());
		}
	}
	
	/**
	 * Gets the mapped roles test.
	 *
	 * @return the mapped roles test
	 */
	@Test
	void getMappedRolesTest() {
		assertEquals(service.getMappedRoles("testuser").isEmpty(),true);
	}
	
	/**
	 * Test find all.
	 *
	 * @throws SQLException the SQL exception
	 */
	@Test
	void testFindAll() throws SQLException {
		Page<UserProjectRole> userProjectRolelist = service.findAll(pageable);
		assertEquals(userProjectRolelist.getTotalElements(), 1);
	}
	
	/**
	 * Test get all.
	 *
	 * @throws SQLException the SQL exception
	 */
	@Test
	void testGetAll() throws SQLException {
		PageResponse<UserProjectRole> userProjectRolelist = service.getAll(req);
		assertEquals(userProjectRolelist.getTotalElements(), 1);
	}

}

