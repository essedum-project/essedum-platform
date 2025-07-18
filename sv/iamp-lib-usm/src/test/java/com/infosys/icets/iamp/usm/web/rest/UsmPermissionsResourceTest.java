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
import static org.junit.Assert.assertEquals;

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
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.iamp.usm.domain.UsmPermissions;
import com.infosys.icets.iamp.usm.dto.UsmPermissionsDTO;
import com.infosys.icets.iamp.usm.repository.UsmPermissionsRepository;
import com.infosys.icets.iamp.usm.service.UsmPermissionApiService;
// TODO: Auto-generated Javadoc
import com.infosys.icets.iamp.usm.service.impl.UsmPermissionsServiceImpl;

/**
 * The Class RoleResourceTest.
 *
 * @author icets
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class UsmPermissionsResourceTest {
	
	/** The UsmPermissions resource. */
	static UsmPermissionsResource usmPermissionsResource;
	
	/** The pageable. */
	static Pageable pageable = null;
	
	/** The req. */
	static PageRequestByExample<UsmPermissions> req = null;
	
	/** The UsmPermissions. */
	static UsmPermissions usmPermissions = new UsmPermissions();
	
	/** */
	ObjectMapper Obj = new ObjectMapper();

	/**
	 * Setup.
	 */
	@BeforeAll
	static void setup() {
		UsmPermissionApiService usmPermissionApiService=Mockito.mock(UsmPermissionApiService.class);
		UsmPermissionsRepository usmPermissionsRepository = Mockito.mock(UsmPermissionsRepository.class);
		usmPermissions.setId(2);
		usmPermissions.setModule("test");
		usmPermissions.setPermission("view");
		Mockito.when(usmPermissionsRepository.findById(2)).thenReturn(Optional.of(usmPermissions));
		Mockito.when(usmPermissionsRepository.save(usmPermissions)).thenReturn(usmPermissions);
		Page<UsmPermissions> usmPermissionsPage = new PageImpl<>(Collections.singletonList(usmPermissions));
		pageable = PageRequest.of(0, 1);
		req = new PageRequestByExample<UsmPermissions>();
		ExampleMatcher matcher = ExampleMatcher.matching() //
                .withMatcher("module", match -> match.ignoreCase().startsWith())
                .withMatcher("permission", match -> match.ignoreCase().startsWith());
		Example<UsmPermissions> example = Example.of(usmPermissions,matcher);
		req.setExample(usmPermissions);
		Mockito.when(usmPermissionsRepository.findAll(example,req.toPageable())).thenReturn(usmPermissionsPage);
		Mockito.when(usmPermissionsRepository.findAll(req.toPageable())).thenReturn(usmPermissionsPage);
		Mockito.when(usmPermissionsRepository.findAll(pageable)).thenReturn(usmPermissionsPage);

		UsmPermissionsServiceImpl usmPermissionsService = new UsmPermissionsServiceImpl(usmPermissionsRepository,usmPermissionApiService);
		
		usmPermissionsResource = new UsmPermissionsResource(usmPermissionsService);
	}

	/**
	 * Test negative create usmPermissions
	 */
	@Test
	@Order(1)
	public void testNegativeCreateUsmPermissions() {
		UsmPermissionsDTO usmPermissions = new UsmPermissionsDTO();
		usmPermissions.setId(2);
		usmPermissions.setModule("test");
		usmPermissions.setPermission("view");
		try {
			assertEquals(usmPermissionsResource.createUsmPermissions(usmPermissions).getStatusCode(),
					HttpStatus.BAD_REQUEST);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}

	
	
	/**
	 * Test update usmPermissions.
	 */
	@Test
	@Order(1)
	public void testUpdateusmPermissions() {
		UsmPermissionsDTO usmPermissions = new UsmPermissionsDTO();
		usmPermissions.setId(2);
		usmPermissions.setModule("test");
		usmPermissions.setPermission("view");
		try {
			assertEquals(usmPermissionsResource.updateUsmPermissions(usmPermissions).getStatusCode(), HttpStatus.OK);
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
	public void testGetAllusmPermissionsss() throws JsonProcessingException, UnsupportedEncodingException {
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes());
		assertEquals(usmPermissionsResource.getAllUsmPermissionss(str).getStatusCode(), HttpStatus.OK);
	}

	/**
	 * Test get all roles.
	 */
	@Test
	@Order(1)
	public void testGetAllusmPermissions() {
		assertEquals(usmPermissionsResource.getAllUsmPermissionss(pageable).getStatusCode(), HttpStatus.OK);
	}

	/**
	 * Test get role.
	 */
	@Test
	@Order(1)
	public void testGetusmPermissions() {
		assertEquals(usmPermissionsResource.getUsmPermissions(2).getStatusCode(), HttpStatus.OK);
	}

	/**
	 * Test delete role.
	 */
	@Test
	@Order(1)
	public void testDeleteusmPermissions() {
		assertEquals(usmPermissionsResource.deleteUsmPermissions(2).getStatusCode(), HttpStatus.OK);
	}
	
	/**
	 * Test negative get role.
	 */
	@Test
	@Order(2)
	public void testNegativegetUsmPermissionss() {
		Mockito.when(usmPermissionsResource.getUsmPermissions(2)).thenThrow(new EntityNotFoundException());
		assertEquals(usmPermissionsResource.getUsmPermissions(2).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	
	
	/**
	 * Test negative get all UsmPermissions.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 * @throws JsonMappingException 
	 */
	@Test
	@Order(2)
	public void testNegativeGetAllUsmPermissionsss() throws JsonMappingException, UnsupportedEncodingException, JsonProcessingException {
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes());
		Mockito.when(usmPermissionsResource.getAllUsmPermissionss(str)).thenThrow(new EntityNotFoundException());
		assertEquals(usmPermissionsResource.getAllUsmPermissionss(str).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	
	/**
	 * Test negative get all UsmPermissionss.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 * @throws JsonMappingException 
	 */
	@Test
	@Order(3)
	public void testNegativeGetallUsmPermissionss() throws JsonMappingException, UnsupportedEncodingException, JsonProcessingException {
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes());
		Mockito.when(usmPermissionsResource.getAllUsmPermissionss(str)).thenThrow(new ArithmeticException());
		assertEquals(usmPermissionsResource.getAllUsmPermissionss(str).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	@Test
	public void testGetPermissionByRoleAndModule() {
		assertEquals(usmPermissionsResource.getPermissionByRoleAndModule(2, "test").getStatusCode(), HttpStatus.OK);
	}

}
