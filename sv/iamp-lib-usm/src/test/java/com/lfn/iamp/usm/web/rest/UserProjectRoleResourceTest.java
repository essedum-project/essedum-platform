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
import java.sql.SQLException;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.Date;
import java.util.List;
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
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
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
import com.lfn.iamp.usm.domain.Organisation;
import com.lfn.iamp.usm.domain.Project;
import com.lfn.iamp.usm.domain.Role;
import com.lfn.iamp.usm.domain.UserProjectRole;
import com.lfn.iamp.usm.domain.Users;
import com.lfn.iamp.usm.domain.UsmPortfolio;
import com.lfn.iamp.usm.dto.UserProjectRoleDTO;
import com.lfn.iamp.usm.dto.UsersDTO;
import com.lfn.iamp.usm.repository.OrgUnitRepository;
import com.lfn.iamp.usm.repository.ProjectRepository;
import com.lfn.iamp.usm.repository.RoleRepository;
import com.lfn.iamp.usm.repository.UserProjectRoleRepository;
import com.lfn.iamp.usm.repository.UserUnitRepository;
import com.lfn.iamp.usm.service.InvalidTokenService;
import com.lfn.iamp.usm.repository.UsersRepository;
import com.lfn.iamp.usm.service.InvalidTokenService;
import com.lfn.iamp.usm.service.ProjectService;
import com.lfn.iamp.usm.service.RoleService;
import com.lfn.iamp.usm.service.UsersService;
import com.lfn.iamp.usm.service.UsmPortfolioService;
import com.lfn.iamp.usm.service.impl.UserProjectRoleServiceImpl;

// TODO: Auto-generated Javadoc
/**
 * The Class UserProjectRoleResourceTest.
 *
 * @author essedum
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class UserProjectRoleResourceTest {
	
	/** The user project role resource. */
	static UserProjectRoleResource userProjectRoleResource;
	
	/** The req. */
	static PageRequestByExample<UserProjectRole> req = null;
	
	/** The pageable. */
	static Pageable pageable = null;
	
	/** The user project role. */
	static UserProjectRole userProjectRole = new UserProjectRole();
	
	/** The user project role repository. */
	static UserProjectRoleRepository userProjectRoleRepository;
	
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
	/** */
	ObjectMapper Obj = new ObjectMapper();

    static  InvalidTokenService invalidTokenService;
	
	static OrgUnit orgUnit = new OrgUnit();
	/**
	 * Setup.
	 */
	@BeforeAll
	static void setup() {
		UserProjectRoleRepository userProjectRoleRepository = Mockito.mock(UserProjectRoleRepository.class);
		ProjectRepository projectRepository = Mockito.mock(ProjectRepository.class);
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
		users.setUser_email("testuser@lfn.com");
		users.setOnboarded(true);
		users.setContext(new Context());
		users.setActivated(true);
		users.setForce_password_change(false);
//		users.setLast_updated_dts(ZonedDateTime.now());
		users.setUser_added_by(null);
		users.setUser_act_ind(false);
		users.setClientDetails("test");
		userProjectRole.setUser_id(users);
		Users users1 = new Users();
		users1.setId(2);
		users1.setUser_f_name("test");
		users1.setUser_l_name("User");
		users1.setUser_login("testuser");
		users1.setUser_email("testuser@lfn.com");
		users1.setOnboarded(true);
		users1.setContext(new Context());
		users1.setActivated(true);
		users1.setForce_password_change(false);
//		users1.setLast_updated_dts(ZonedDateTime.now());
		users1.setUser_added_by(null);
		users1.setUser_act_ind(false);
		users1.setClientDetails("test");
		orgUnit.setId(1);
		orgUnit.setName("test"); 
		orgUnit.setOrganisation(new Organisation());
		orgUnit.setContext(new Context());
		orgUnit.setOnboarded(true);
		Mockito.when(orgUnitRepository.findById(1)).thenReturn(Optional.of(orgUnit));
		Mockito.when(orgUnitRepository.save(orgUnit)).thenReturn(orgUnit);
		Mockito.when(userProjectRoleRepository.findById(2)).thenReturn(Optional.of(userProjectRole));
		Mockito.when(projectRepository.findById(2)).thenReturn(Optional.of(project));
		Mockito.when(projectRepository.save(project)).thenReturn(project);
		try {
			Mockito.when(projectService.findOne(1)).thenReturn(project);
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		Mockito.when(roleRepository.findById(2)).thenReturn(Optional.of(role));
		Mockito.when(usersRepository.findById(2)).thenReturn(Optional.of(users1));
		Mockito.when(usersRepository.findByUserLogin("testuser")).thenReturn(users1);
		Mockito.when(usersRepository.save(users1)).thenReturn(users1);
		try {
			Mockito.when(usersService.save(users1)).thenReturn(users1);
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		try {
			Mockito.when(roleService.findOne(2)).thenReturn(role);
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		Mockito.when(usersService.findByUserLogin("testuser")).thenReturn(users1);
//		Mockito.when(userProjectRoleRepository.save(userProjectRole)).thenReturn(userProjectRole);
		Mockito.when(roleRepository.findById(2)).thenReturn(Optional.of(role));
		Mockito.when(userProjectRoleRepository.save(userProjectRole)).thenReturn(userProjectRole);
		Page<UserProjectRole> userProjectRolePage = new PageImpl<>(Collections.singletonList(userProjectRole));
		pageable = PageRequest.of(0, 1);
		req = new PageRequestByExample<UserProjectRole>();
		ExampleMatcher matcher = ExampleMatcher.matching() //
				.withMatcher("project_id.name", match -> match.ignoreCase().contains())
				.withMatcher("user_id.user_f_name", match -> match.ignoreCase().contains());
		Example<UserProjectRole> example = Example.of(userProjectRole, matcher);
		req.setExample(userProjectRole);
		Mockito.when(userProjectRoleRepository.findAll(example, req.toPageable())).thenReturn(userProjectRolePage);
		Mockito.when(userProjectRoleRepository.findAll(req.toPageable())).thenReturn(userProjectRolePage);
		Mockito.when(userProjectRoleRepository.findAll(pageable)).thenReturn(userProjectRolePage);
		
		
		UserProjectRoleServiceImpl userProjectRoleService = new UserProjectRoleServiceImpl(userProjectRoleRepository,
				usersService, projectService, roleService, portfolioService,userUnitRepository,orgUnitRepository,invalidTokenService);

		userProjectRoleResource = new UserProjectRoleResource(userProjectRoleService);
//		ReflectionTestUtils.setField(userProjectRoleService, "autoUserProject", "1");
//		ReflectionTestUtils.setField(userProjectRoleService, "roles", "2");

	}

	/**
	 * Test negative create user project role.
	 */
	@Test
	@Order(1)
	public void testNegativeCreateUserProjectRole() {
		UserProjectRoleDTO userProjectRoleDTO = new UserProjectRoleDTO();
		ModelMapper modelMapper = new ModelMapper();
		userProjectRoleDTO = modelMapper.map(userProjectRole, UserProjectRoleDTO.class);
		try {
			assertEquals(userProjectRoleResource.createUserProjectRole(userProjectRoleDTO).getStatusCode(),
					HttpStatus.BAD_REQUEST);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
	/**
	 * Test negative create user project role.
	 */
	@Test
	@Order(2)
	public void testErrorCreateUserProjectRole() {
		UserProjectRole userProjectRole = new UserProjectRole();
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
		userProjectRole.setUser_id(users);
		UserProjectRoleDTO userProjectRoleDTO = new UserProjectRoleDTO();
		ModelMapper modelMapper = new ModelMapper();
		userProjectRoleDTO = modelMapper.map(userProjectRole, UserProjectRoleDTO.class);
		try {
			assertEquals(userProjectRoleResource.createUserProjectRole(userProjectRoleDTO).getStatusCode(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
	/**
	 * Test negative create user project role.
	 */
	@Test
	@Order(2)
	public void testerrorCreateUserProjectRole() {
		UserProjectRole userProjectRole = new UserProjectRole();
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
		userProjectRole.setUser_id(users);
		UserProjectRoleDTO userProjectRoleDTO = new UserProjectRoleDTO();
		ModelMapper modelMapper = new ModelMapper();
		userProjectRoleDTO = modelMapper.map(userProjectRole, UserProjectRoleDTO.class);
		try {
			Mockito.when(userProjectRoleResource.createUserProjectRole(userProjectRoleDTO)).thenThrow(new DataIntegrityViolationException(null));
			assertEquals(userProjectRoleResource.createUserProjectRole(userProjectRoleDTO).getStatusCode(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}

	/**
	 * Test update user project role.
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
	public void testUpdateUserProjectRole() throws JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException {
		UserProjectRoleDTO userProjectRoleDTO = new UserProjectRoleDTO();
		ModelMapper modelMapper = new ModelMapper();
		userProjectRoleDTO = modelMapper.map(userProjectRole, UserProjectRoleDTO.class);
		try {
			assertEquals(userProjectRoleResource.updateUserProjectRole(userProjectRoleDTO).getStatusCode(),
					HttpStatus.OK);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * Test get all user project roles.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 * @throws JsonMappingException 
	 * @throws NoSuchAlgorithmException 
	 * @throws InvalidKeySpecException 
	 * @throws BadPaddingException 
	 * @throws IllegalBlockSizeException 
	 * @throws NoSuchPaddingException 
	 * @throws InvalidKeyException 
	 */
	@Test
	@Order(1)
	public void testGetAllUserProjectRoles() throws JsonMappingException, UnsupportedEncodingException, JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException {
		req = new PageRequestByExample<UserProjectRole>();
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes());
		assertEquals(userProjectRoleResource.getAllUserProjectRoles(str).getStatusCode(), HttpStatus.OK);
	}


	/**
	 * Test get all user project role.
	 */
	@Test
	@Order(1)
	public void testGetAllUserProjectRole() {
		assertEquals(userProjectRoleResource.getAllUserProjectRoles(pageable).getStatusCode(), HttpStatus.OK);
	}

	/**
	 * Test get user project role.
	 */
	@Test
	@Order(1)
	public void testGetUserProjectRole() {
		assertEquals(userProjectRoleResource.getUserProjectRole(2).getStatusCode(), HttpStatus.OK);
	}

	/**
	 * Test get user project role for user.
	 */
	@Test
	@Order(1)
	public void testGetUserProjectRoleForUser() {
		assertEquals(userProjectRoleResource.getUserProjectRoleForUser("testuser").getStatusCode(), HttpStatus.OK);
	}

	/**
	 * Test delete project role.
	 */
	@Test
	@Order(1)
	public void testDeleteProjectRole() {
		assertEquals(userProjectRoleResource.deleteUserProjectRole(2).getStatusCode(), HttpStatus.OK);
	}

	/**
	 * Test negative get user project role.
	 */
	@Test
	@Order(2)
	public void testNegativeGetUserProjectRole() {
		Mockito.when(userProjectRoleResource.getUserProjectRole(2)).thenThrow(new EntityNotFoundException());
		assertEquals(userProjectRoleResource.getUserProjectRole(2).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	/**
	 * Test negative update user project role exception.
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
	public void testNegativeUpdateUserProjectRoleException() throws JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException {
		UserProjectRoleDTO userProjectRoleDTO = new UserProjectRoleDTO();
		ModelMapper modelMapper = new ModelMapper();
		userProjectRoleDTO = modelMapper.map(userProjectRole, UserProjectRoleDTO.class);
		try {
			Mockito.when(userProjectRoleResource.updateUserProjectRole(userProjectRoleDTO))
					.thenThrow(new EntityNotFoundException());
			assertEquals(userProjectRoleResource.updateUserProjectRole(userProjectRoleDTO).getStatusCode(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
	

	/**
	 * Test negative get all user project role.
	 */
	@Test
	@Order(2)
	public void testNegativeGetAllUserProjectRole() {
		Mockito.when(userProjectRoleResource.getAllUserProjectRoles(pageable)).thenThrow(new EntityNotFoundException());
		assertEquals(userProjectRoleResource.getAllUserProjectRoles(pageable).getStatusCode(),
				HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/**
	 * Test negative delete user project role.
	 */
	@Test
	@Order(2)
	public void testNegativeDeleteUserProjectRole() {
		Mockito.when(userProjectRoleResource.deleteUserProjectRole(2)).thenThrow(new EntityNotFoundException());
		assertEquals(userProjectRoleResource.deleteUserProjectRole(2).getStatusCode(),
				HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	/**
	 * Test negative get all UserProjectRoles.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 * @throws JsonMappingException 
	 * @throws NoSuchAlgorithmException 
	 * @throws InvalidKeySpecException 
	 * @throws BadPaddingException 
	 * @throws IllegalBlockSizeException 
	 * @throws NoSuchPaddingException 
	 * @throws InvalidKeyException 
	 */
	@Test
	@Order(2)
	public void testNegativeGetAllUserProjectRoless() throws JsonMappingException, UnsupportedEncodingException, JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException {
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes());
		Mockito.when(userProjectRoleResource.getAllUserProjectRoles(str)).thenThrow(new EntityNotFoundException());
		assertEquals(userProjectRoleResource.getAllUserProjectRoles(str).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	/**
	 * Test negative delete user project role.
	 */
	@Test
	@Order(3)
	public void testNegativeDeleteUserProjectRoles() {
		Mockito.when(userProjectRoleResource.deleteUserProjectRole(2)).thenThrow(new EmptyResultDataAccessException(1));
		assertEquals(userProjectRoleResource.deleteUserProjectRole(2).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	/**
	 * Test negative get all UserProjectRoles.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 * @throws JsonMappingException 
	 * @throws NoSuchAlgorithmException 
	 * @throws InvalidKeySpecException 
	 * @throws BadPaddingException 
	 * @throws IllegalBlockSizeException 
	 * @throws NoSuchPaddingException 
	 * @throws InvalidKeyException 
	 */
	@Test
	@Order(3)
	public void testNegativeGetAllUserProjectRoles() throws JsonMappingException, UnsupportedEncodingException, JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException {
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes());
		Mockito.when(userProjectRoleResource.getAllUserProjectRoles(str)).thenThrow(new ArithmeticException());
		assertEquals(userProjectRoleResource.getAllUserProjectRoles(str).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	@Test
	@Order(2)
	public void testCreateUserProjectRolesList() throws JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException {
		List<UserProjectRoleDTO> userProjectList= new ArrayList<UserProjectRoleDTO>();
		UserProjectRole userProjectRole = new UserProjectRole();
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
		userProjectRole.setUser_id(users);
		UserProjectRoleDTO userProjectRoleDTO = new UserProjectRoleDTO();
		ModelMapper modelMapper = new ModelMapper();
		userProjectRoleDTO = modelMapper.map(userProjectRole, UserProjectRoleDTO.class);
		userProjectList.add(0, userProjectRoleDTO);
		try {
			assertEquals(userProjectRoleResource.createListOfUserProjectRoles(userProjectList).getStatusCode(),
					HttpStatus.CREATED);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
	@Test
	@Order(2)
	public void testNegativeCreateUserProjectRoleException() throws JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException {
		List<UserProjectRoleDTO> userProjectList= new ArrayList<UserProjectRoleDTO>();
		UserProjectRoleDTO userProjectRoleDTO = new UserProjectRoleDTO();
		ModelMapper modelMapper = new ModelMapper();
		userProjectRoleDTO = modelMapper.map(userProjectRole, UserProjectRoleDTO.class);
		userProjectList.add(0, userProjectRoleDTO);
		try {
			Mockito.when(userProjectRoleResource.createListOfUserProjectRoles(userProjectList)).thenThrow(new DataIntegrityViolationException(null));
			assertEquals(userProjectRoleResource.createListOfUserProjectRoles(userProjectList).getStatusCode(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
	@Test
	@Order(2)
	public void testNegativeCreateUserProjectRoleListException() throws JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException {
		List<UserProjectRoleDTO> userProjectList= new ArrayList<UserProjectRoleDTO>();
		try {
			assertEquals(userProjectRoleResource.createListOfUserProjectRoles(userProjectList).getStatusCode(),
					HttpStatus.BAD_REQUEST);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
	/**
	 * Test negative get Project Roles for user
	 */
	@Test
	@Order(3)
	public void testNegativeUserProjectRolesforUser() {
		Mockito.when(userProjectRoleResource.getUserProjectRoleForUser("testuser")).thenThrow(new EntityNotFoundException());
		assertEquals(userProjectRoleResource.getUserProjectRoleForUser("testuser").getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	/**
	 * Test Register user
	 * @throws URISyntaxException 
	 * @throws JsonProcessingException 
	 * @throws NoSuchAlgorithmException 
	 * @throws InvalidKeySpecException 
	 * @throws BadPaddingException 
	 * @throws IllegalBlockSizeException 
	 * @throws NoSuchPaddingException 
	 * @throws InvalidKeyException 
	 */
	@Test
	@Order(3)
	public void testnegativeRegisterUser() throws URISyntaxException, JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException {
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
		UsersDTO usersDTO = new UsersDTO();
		ModelMapper modelMapper = new ModelMapper();
		usersDTO = modelMapper.map(users, UsersDTO.class);
		Mockito.when(userProjectRoleResource.registerUser(usersDTO)).thenThrow(new DataIntegrityViolationException("email_unique"));
		assertEquals(userProjectRoleResource.registerUser(usersDTO).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	/**
	 * Test Register user
	 * @throws URISyntaxException 
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
	public void testRegisterUser() throws URISyntaxException, JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException {
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
		UsersDTO usersDTO = new UsersDTO();
		ModelMapper modelMapper = new ModelMapper();
		usersDTO = modelMapper.map(users, UsersDTO.class);
		Mockito.when(userProjectRoleResource.registerUser(usersDTO)).thenThrow(new DataIntegrityViolationException("user_login_unique"));
		assertEquals(userProjectRoleResource.registerUser(usersDTO).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	/**
	 * Test Register user
	 * @throws URISyntaxException 
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
	public void testRegisterUsers() throws URISyntaxException, JsonProcessingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException {
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
		UsersDTO usersDTO = new UsersDTO();
		ModelMapper modelMapper = new ModelMapper();
		usersDTO = modelMapper.map(users, UsersDTO.class);
		assertEquals(userProjectRoleResource.registerUser(usersDTO).getStatusCode(), HttpStatus.CREATED);
	}
	
	/**
	 * Test get all user project roles.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
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
	public void testFetchAllUserProjectRoles() throws JsonProcessingException, UnsupportedEncodingException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException {
		pageable = PageRequest.of(0, 1);
		req = new PageRequestByExample<UserProjectRole>();
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes());
		assertEquals(userProjectRoleResource.fetchAllUserProjectRoles(str,pageable ).getStatusCode(), HttpStatus.OK);
	}
	
	/**
	 * Test get all user project roles.
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
	public void testSearchUserProjectRoles() throws JsonProcessingException, UnsupportedEncodingException, URISyntaxException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException {
		pageable = PageRequest.of(0, 1);
		req = new PageRequestByExample<UserProjectRole>();
//		UserProjectRole prbe = new UserProjectRole();
		assertEquals(userProjectRoleResource.searchProjects(pageable, req).getStatusCode(), HttpStatus.OK);
	}
	/**
	 * Test get all user project roles.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 * @throws URISyntaxException 
	 * @throws JsonMappingException 
	 */
	@Test
	@Order(1)
	public void testGetProjectListByUserName() throws URISyntaxException  {
	
		assertEquals(userProjectRoleResource.getProjectListByUserName("testuser").getStatusCode(), HttpStatus.OK);
	}
}
