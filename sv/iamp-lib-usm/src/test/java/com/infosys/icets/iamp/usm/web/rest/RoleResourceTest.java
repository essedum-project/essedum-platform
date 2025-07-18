/**
 * @ 2023 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.iamp.usm.web.rest;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.io.UnsupportedEncodingException;
import java.net.URISyntaxException;
import java.util.Base64;
import java.util.Collections;
import java.util.Optional;

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
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.iamp.usm.domain.Role;
import com.infosys.icets.iamp.usm.dto.RoleDTO;
import com.infosys.icets.iamp.usm.repository.RoleRepository;
import com.infosys.icets.iamp.usm.service.impl.RoleServiceImpl;
// TODO: Auto-generated Javadoc

/**
 * The Class RoleResourceTest.
 *
 * @author icets
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class RoleResourceTest {
	
	/** The role resource. */
	static RoleResource roleResource;
	
	/** The pageable. */
	static Pageable pageable = null;
	
	/** The req. */
	static PageRequestByExample<Role> req = null;
	
	/** The role. */
	static Role role = new Role();
	/** */
	ObjectMapper Obj = new ObjectMapper();

	/**
	 * Setup.
	 */
	@BeforeAll
	static void setup() {
		RoleRepository roleRepository = Mockito.mock(RoleRepository.class);
		role = new Role();
		role.setId(2);
		role.setName("test");
		role.setDescription("Test Role");
		role.setPermission(true);
		role.setProjectId(null);
		role.setRoleadmin(false);
		Mockito.when(roleRepository.findById(2)).thenReturn(Optional.of(role));
		Mockito.when(roleRepository.save(role)).thenReturn(role);
		Page<Role> rolePage = new PageImpl<>(Collections.singletonList(role));
		pageable = PageRequest.of(0, 1);
		req = new PageRequestByExample<Role>();
		Mockito.when(roleRepository.findAll(req.toPageable())).thenReturn(rolePage);
		Mockito.when(roleRepository.findAll(pageable)).thenReturn(rolePage);

		RoleServiceImpl roleService = new RoleServiceImpl(roleRepository);
		
		 roleResource = new RoleResource(roleService);
	}

	/**
	 * Test negative create role.
	 */
	@Test
	@Order(1)
	public void testNegativeCreateRole() {
		RoleDTO roleDTO = new RoleDTO();
		ModelMapper modelMapper = new ModelMapper();
		roleDTO = modelMapper.map(role, RoleDTO.class);
		try {
			assertEquals(roleResource.createRole(roleDTO).getStatusCode(),
					HttpStatus.BAD_REQUEST);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
	/**
	 * Test negative create role.
	 */
	@Test
	@Order(2)
	public void testErrorCreateRole() {
		Role role = new Role();
		role.setName("test");
		role.setDescription("Test Role");
		role.setPermission(true);
		role.setProjectId(null);
		role.setRoleadmin(false);
		RoleDTO roleDTO = new RoleDTO();
		ModelMapper modelMapper = new ModelMapper();
		roleDTO = modelMapper.map(role, RoleDTO.class);
		try {
			assertEquals(roleResource.createRole(roleDTO).getStatusCode(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
	/**
	 * Test negative create role.
	 */
	@Test
	@Order(3)
	public void testerrorCreateRole() {
		Role role = new Role();
		role.setName("test");
		role.setDescription("Test Role");
		role.setPermission(true);
		role.setProjectId(null);
		role.setRoleadmin(false);
		RoleDTO roleDTO = new RoleDTO();
		ModelMapper modelMapper = new ModelMapper();
		roleDTO = modelMapper.map(role, RoleDTO.class);
		try {
			Mockito.when(roleResource.createRole(roleDTO))
			.thenThrow(new DataIntegrityViolationException(null));
			assertEquals(roleResource.createRole(roleDTO).getStatusCode(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * Test update role.
	 */
	@Test
	@Order(1)
	public void testUpdateRole() {
		RoleDTO roleDTO = new RoleDTO();
		ModelMapper modelMapper = new ModelMapper();
		roleDTO = modelMapper.map(role, RoleDTO.class);
		try {
			assertEquals(roleResource.updateRole(roleDTO).getStatusCode(), HttpStatus.OK);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * Test get all roless.s
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 */
	@Test
	@Order(1)
	public void testGetAllRoless() throws JsonProcessingException, UnsupportedEncodingException {
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes());
		assertEquals(roleResource.getAllRoles(str).getStatusCode(), HttpStatus.OK);
	}

	/**
	 * Test get all roles.
	 */
	@Test
	@Order(1)
	public void testGetAllRoles() {
		assertEquals(roleResource.getAllRoles(pageable).getStatusCode(), HttpStatus.OK);
	}

	/**
	 * Test get role.
	 */
	@Test
	@Order(1)
	public void testGetRole() {
		assertEquals(roleResource.getRole(2).getStatusCode(), HttpStatus.OK);
	}

	/**
	 * Test delete role.
	 */
	@Test
	@Order(1)
	public void testDeleteRole() {
		assertEquals(roleResource.deleteRole(2).getStatusCode(), HttpStatus.OK);
	}
	
	/**
	 * Test negative get role.
	 */
	@Test
	@Order(2)
	public void testNegativeGetRole() {
		Mockito.when(roleResource.getRole(2)).thenThrow(new EntityNotFoundException());
		assertEquals(roleResource.getRole(2).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	/**
	 * Test negative update role exception.
	 */
	@Test
	@Order(2)
	public void testNegativeUpdateRoleException() {
		RoleDTO roleDTO = new RoleDTO();
		ModelMapper modelMapper = new ModelMapper();
		roleDTO = modelMapper.map(role, RoleDTO.class);
		try {
			Mockito.when(roleResource.updateRole(roleDTO)).thenThrow(new EntityNotFoundException());
			assertEquals(roleResource.updateRole(roleDTO).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * Test negative get all roles.
	 */
	@Test
	@Order(2)
	public void testNegativeGetAllRoles() {
		Mockito.when(roleResource.getAllRoles(pageable)).thenThrow(new EntityNotFoundException());
		assertEquals(roleResource.getAllRoles(pageable).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	/**
	 * Test negative delete role.
	 */
	@Test
	@Order(2)
	public void testNegativeDeleteRole() {
		Mockito.when(roleResource.deleteRole(2)).thenThrow(new EntityNotFoundException());
		assertEquals(roleResource.deleteRole(2).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	/**
	 * Test negative get all roless.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 * @throws JsonMappingException 
	 */
	@Test
	@Order(2)
	public void testNegativeGetAllRoless() throws JsonMappingException, UnsupportedEncodingException, JsonProcessingException {
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes());
		Mockito.when(roleResource.getAllRoles(str)).thenThrow(new EntityNotFoundException());
		assertEquals(roleResource.getAllRoles(str).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	/**
	 * Test negative delete role.
	 */
	@Test
	@Order(3)
	public void testNegativeDeleteRoles() {
		Mockito.when(roleResource.deleteRole(2)).thenThrow(new EmptyResultDataAccessException(1));
		assertEquals(roleResource.deleteRole(2).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	/**
	 * Test negative get all roless.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 * @throws JsonMappingException 
	 */
	@Test
	@Order(3)
	public void testNegativeGetallRoles() throws JsonMappingException, UnsupportedEncodingException, JsonProcessingException {
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes());
		Mockito.when(roleResource.getAllRoles(str)).thenThrow(new ArithmeticException());
		assertEquals(roleResource.getAllRoles(str).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}

}
