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
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
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
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.iamp.usm.domain.Role;
import com.infosys.icets.iamp.usm.domain.UsmPermissions;
import com.infosys.icets.iamp.usm.domain.UsmRolePermissions;
import com.infosys.icets.iamp.usm.dto.UsmRolePermissionNewDTO;
import com.infosys.icets.iamp.usm.repository.UsmRolePermissionsRepository;
import com.infosys.icets.iamp.usm.service.RoleService;
import com.infosys.icets.iamp.usm.service.UsmPermissionsService;
import com.infosys.icets.iamp.usm.service.impl.UsmRolePermissionsServiceImpl;

// TODO: Auto-generated Javadoc
/**
 * The Class UsmRolePermissionsResourceTest.
 *
 * @author icets
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class UsmRolePermissionsResourceTest {

	/** The usm role permissions resource. */
	static UsmRolePermissionsResource usmRolePermissionsResource;
	
	/** The pageable. */
	static Pageable pageable = null;
	
	/** The usm role permissions. */
	static UsmRolePermissions usmRolePermissions = new UsmRolePermissions();
	
	/** The req. */
	static PageRequestByExample<UsmRolePermissions> req = null;
	
	ObjectMapper Obj = new ObjectMapper();
	
	/**
	 * Setup.
	 */
	@BeforeAll
	static void setup() {
		UsmRolePermissionsRepository usmRolePermissionsRepository = Mockito.mock(UsmRolePermissionsRepository.class);
		RoleService roleService = Mockito.mock(RoleService.class);
		UsmPermissionsService usmPermissionsService = Mockito.mock(UsmPermissionsService.class);
		usmRolePermissions.setId(1);
		UsmPermissions usmPermissions=new UsmPermissions();
		usmPermissions.setId(1);
		usmPermissions.setModule("test");
		usmPermissions.setPermission("view");
		usmRolePermissions.setPermission(usmPermissions);
		Role role = new Role();
		role.setId(1);
		role.setName("test");
		role.setDescription("Test Role");
		role.setPermission(true);
		role.setProjectId(1);
		role.setRoleadmin(false);
		usmRolePermissions.setRole(role);
		Mockito.when(usmRolePermissionsRepository.findById(1)).thenReturn(Optional.of(usmRolePermissions));
		Mockito.when(usmRolePermissionsRepository.save(usmRolePermissions)).thenReturn(usmRolePermissions);
		Page<UsmRolePermissions> usmRolePermissionsPage = new PageImpl<>(Collections.singletonList(usmRolePermissions));
		pageable = PageRequest.of(0, 1);
		req = new PageRequestByExample<UsmRolePermissions>();
		ExampleMatcher matcher = ExampleMatcher.matching();
		Example<UsmRolePermissions> example = Example.of(usmRolePermissions,matcher);
		req.setExample(usmRolePermissions);
		Mockito.when(usmRolePermissionsRepository.findAll(example,req.toPageable())).thenReturn(usmRolePermissionsPage);
		Mockito.when(usmRolePermissionsRepository.findAll(req.toPageable())).thenReturn(usmRolePermissionsPage);
		Mockito.when(usmRolePermissionsRepository.findAll(pageable)).thenReturn(usmRolePermissionsPage);;

		UsmRolePermissionsServiceImpl usmRolePermissionsService = new UsmRolePermissionsServiceImpl(usmRolePermissionsRepository,roleService,usmPermissionsService);

		usmRolePermissionsResource = new UsmRolePermissionsResource(usmRolePermissionsService);
	}
	
	/**
	 * Test negative create usm portfolio.
	 */
	@Test
	@Order(1)
	public void testNegativeCreateUsmRolePermissions() {
		UsmRolePermissionNewDTO usmRolePermissionNewDTO = new UsmRolePermissionNewDTO();
		ModelMapper modelMapper = new ModelMapper();
		usmRolePermissionNewDTO = modelMapper.map(usmRolePermissions, UsmRolePermissionNewDTO.class);
		try {			
			assertEquals(usmRolePermissionsResource.createRolePermissions(usmRolePermissionNewDTO).getStatusCode(),HttpStatus.BAD_REQUEST);
		}
		catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}

	/**
	 * Test update usm portfolio.
	 */
	@Test
	@Order(1)
	public void testUpdateUsmRolePermissions() {
		UsmRolePermissionNewDTO usmRolePermissionNewDTO = new UsmRolePermissionNewDTO();
		ModelMapper modelMapper = new ModelMapper();
		usmRolePermissionNewDTO = modelMapper.map(usmRolePermissions, UsmRolePermissionNewDTO.class);
		try {
			assertEquals(usmRolePermissionsResource.updateRolePermissions(usmRolePermissionNewDTO).getStatusCode(), HttpStatus.OK);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}

	/**
	 * Test get all usm portfolio.
	 */
	@Test
	@Order(1)
	public void testGetAllUsmRolePermissions() {
		assertEquals(usmRolePermissionsResource.getAllRolePermissions(pageable).getStatusCode(), HttpStatus.OK);
	}

	/**
	 * Test get usm portfolio.
	 */
	@Test
	@Order(1)
	public void testGetRolePermissionsss() {
		assertEquals(usmRolePermissionsResource.getRolePermissions(1).getStatusCode(), HttpStatus.OK);
	}

	/**
	 * Test delete usm portfolio.
	 */
	@Test
	@Order(1)
	public void testDeleteUsmRolePermissions() {
		assertEquals(usmRolePermissionsResource.deleteRolePermissions(1).getStatusCode(), HttpStatus.OK);
	}
	
	/**
	 * Test get all portfolios.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 */
	@Test
	@Order(1)
	public void testGetAllusmRolePermissionss() throws JsonProcessingException, UnsupportedEncodingException {
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes());
		assertEquals(usmRolePermissionsResource.getAllRolePermissions(str).getStatusCode(), HttpStatus.OK);
	}
	
	/**
	 * Test negative get project.
	 */
	@Test
	@Order(2)
	public void testNegativeGetRolePermissions() {
		Mockito.when(usmRolePermissionsResource.getRolePermissions(1)).thenThrow(new EntityNotFoundException());
		assertEquals(usmRolePermissionsResource.getRolePermissions(1).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	/**
	 * Test negative update project exception.
	 */
	@Test
	@Order(2)
	public void testNegativeUpdateProjectException() {
		UsmRolePermissionNewDTO usmRolePermissionNewDTO = new UsmRolePermissionNewDTO();
		ModelMapper modelMapper = new ModelMapper();
		usmRolePermissionNewDTO = modelMapper.map(usmRolePermissions, UsmRolePermissionNewDTO.class);
		try {
			Mockito.when(usmRolePermissionsResource.updateRolePermissions(usmRolePermissionNewDTO)).thenThrow(new EntityNotFoundException());
			assertEquals(usmRolePermissionsResource.updateRolePermissions(usmRolePermissionNewDTO).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * Test negative get all projects.
	 */
	@Test
	@Order(2)
	public void testNegativeGetAllusmRolePermissions() {
		Mockito.when(usmRolePermissionsResource.getAllRolePermissions(pageable)).thenThrow(new EntityNotFoundException());
		assertEquals(usmRolePermissionsResource.getAllRolePermissions(pageable).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	/**
	 * Test negative delete project.
	 */
	@Test
	@Order(2)
	public void testNegativeDeleteRolePermissions() {
		Mockito.when(usmRolePermissionsResource.deleteRolePermissions(2)).thenThrow(new EntityNotFoundException());
		assertEquals(usmRolePermissionsResource.deleteRolePermissions(2).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	/**
	 * Test negative get all projectss.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 */
	@Test
	@Order(2)
	public void testNegativeGetAllGetAllusmRolePermissionss() throws JsonProcessingException, UnsupportedEncodingException {
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes()); 
		Mockito.when(usmRolePermissionsResource.getAllRolePermissions(str)).thenThrow(new EntityNotFoundException());
		assertEquals(usmRolePermissionsResource.getAllRolePermissions(str).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	/**
	 * Test negative delete project.
	 */

	@Test
	@Order(3)
	public void testNegativeDeleteRolePermissionss() {
		Mockito.when(usmRolePermissionsResource.deleteRolePermissions(2)).thenThrow(new EmptyResultDataAccessException(1));
		assertEquals(usmRolePermissionsResource.deleteRolePermissions(2).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	/**
	 * Test negative get all projectss.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 */
	@Test
	@Order(3)
	public void testNegativeGetAllusmRolePermissionsss() throws JsonProcessingException, UnsupportedEncodingException {
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes());
		Mockito.when(usmRolePermissionsResource.getAllRolePermissions(str)).thenThrow(new ArithmeticException());
		assertEquals(usmRolePermissionsResource.getAllRolePermissions(str).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	/**
	 * Test negative create usmRolePermissionsss.
	 */
	@Test
	@Order(2)
	public void testerrorCreateusmRolePermissionsss() {
		UsmRolePermissions usmRolePermissions = new UsmRolePermissions();
		UsmPermissions usmPermissions=new UsmPermissions();
		usmPermissions.setId(1);
		usmPermissions.setModule("test");
		usmPermissions.setPermission("view");
		usmRolePermissions.setPermission(usmPermissions);
		Role role = new Role();
		role.setId(1);
		role.setName("test");
		role.setDescription("Test Role");
		role.setPermission(true);
		role.setProjectId(1);
		role.setRoleadmin(false);
		usmRolePermissions.setRole(role);
		UsmRolePermissionNewDTO usmRolePermissionNewDTO = new UsmRolePermissionNewDTO();
		ModelMapper modelMapper = new ModelMapper();
		usmRolePermissionNewDTO = modelMapper.map(usmRolePermissions, UsmRolePermissionNewDTO.class);
		try {
			Mockito.when(usmRolePermissionsResource.createRolePermissions(usmRolePermissionNewDTO)).thenThrow(new DataIntegrityViolationException(null));
			assertEquals(usmRolePermissionsResource.createRolePermissions(usmRolePermissionNewDTO).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
	@Test
	@Order(2)
	public void testCreateUserProjectRolesList() {
		List<UsmRolePermissionNewDTO> usmRolePermissionsList= new ArrayList<UsmRolePermissionNewDTO>();
		UsmRolePermissions usmRolePermissions = new UsmRolePermissions();
		UsmPermissions usmPermissions=new UsmPermissions();
		usmPermissions.setId(1);
		usmPermissions.setModule("test");
		usmPermissions.setPermission("view");
		usmRolePermissions.setPermission(usmPermissions);
		Role role = new Role();
		role.setId(1);
		role.setName("test");
		role.setDescription("Test Role");
		role.setPermission(true);
		role.setProjectId(1);
		role.setRoleadmin(false);
		usmRolePermissions.setRole(role);
		UsmRolePermissionNewDTO usmRolePermissionNewDTO = new UsmRolePermissionNewDTO();
		ModelMapper modelMapper = new ModelMapper();
		usmRolePermissionNewDTO = modelMapper.map(usmRolePermissions, UsmRolePermissionNewDTO.class);
		usmRolePermissionsList.add(0, usmRolePermissionNewDTO);
		try {
			assertEquals(usmRolePermissionsResource.createListOfUsmRolePermissions(usmRolePermissionsList).getStatusCode(),
					HttpStatus.CREATED);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
	
}
