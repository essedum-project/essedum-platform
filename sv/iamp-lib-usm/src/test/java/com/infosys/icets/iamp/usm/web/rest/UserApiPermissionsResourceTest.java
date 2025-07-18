///**
// * @ 2023 Infosys Limited, Bangalore, India. All Rights Reserved.
// * Version: 1.0
// * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
// * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
// * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
// * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
// * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
// * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
// */
//package com.infosys.icets.iamp.usm.web.rest;
//
//import static org.junit.jupiter.api.Assertions.assertEquals;
//
//import java.io.UnsupportedEncodingException;
//import java.net.URISyntaxException;
//import java.util.Base64;
//import java.util.Collections;
//import java.util.Optional;
//
//import jakarta.persistence.EntityNotFoundException;
//
//import org.junit.jupiter.api.BeforeAll;
//import org.junit.jupiter.api.MethodOrderer;
//import org.junit.jupiter.api.Order;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.TestMethodOrder;
//import org.mockito.Mockito;
//import org.modelmapper.ModelMapper;
//import org.springframework.dao.DataIntegrityViolationException;
//import org.springframework.dao.EmptyResultDataAccessException;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageImpl;
//import org.springframework.data.domain.PageRequest;
//import org.springframework.data.domain.Pageable;
//import org.springframework.http.HttpStatus;
//
//import com.fasterxml.jackson.core.JsonProcessingException;
//import com.fasterxml.jackson.databind.JsonMappingException;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
//import com.infosys.icets.iamp.usm.domain.UserApiPermissions;
//import com.infosys.icets.iamp.usm.dto.UserApiPermissionsDTO;
//import com.infosys.icets.iamp.usm.repository.UserApiPermissionsRepository;
//import com.infosys.icets.iamp.usm.service.configApis.support.ConfigurationApisService;
//import com.infosys.icets.iamp.usm.service.impl.UserApiPermissionsServiceImpl;
//
//// TODO: Auto-generated Javadoc
///**
// * The Class UserApiPermissionsResourceTest.
// *
// * @author icets
// */
//@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
//public class UserApiPermissionsResourceTest {
//	
//	/** The user api permissions resource. */
//	static UserApiPermissionsResource userApiPermissionsResource;
//	
//	/** The pageable. */
//	static Pageable pageable = null;
//	
//	/** The req. */
//	static PageRequestByExample<UserApiPermissions> req = null;
//	
//	/** The user api permissions. */
//	static UserApiPermissions userApiPermissions = new UserApiPermissions();
//	
//	static ConfigurationApisService configurationApisService;
//	
//	/** The user api permissions repository. */
//	static UserApiPermissionsRepository userApiPermissionsRepository;
//	/** */
//	ObjectMapper Obj = new ObjectMapper();
//	
//	/** The user api permissions repo. */
////	static UserApiPermissionsRepo userApiPermissionsRepo;
//	
//	static ConfigurationApisService configurationApisService;
//
//	/**
//	 * Setup.
//	 */
//	@BeforeAll
//	static void setup() {
//		userApiPermissionsRepository = Mockito.mock(UserApiPermissionsRepository.class);
////		userApiPermissionsRepo = Mockito.mock(UserApiPermissionsRepo.class);
//		userApiPermissions.setId(2);
//		userApiPermissions.setApi("test");
//		userApiPermissions.setProjectid(2);
//		userApiPermissions.setRoleid(2);
//
//		Mockito.when(userApiPermissionsRepository.findById(2)).thenReturn(Optional.of(userApiPermissions));
//		Mockito.when(userApiPermissionsRepository.save(userApiPermissions)).thenReturn(userApiPermissions);
//		Page<UserApiPermissions> userApiPermissionsPage = new PageImpl<>(Collections.singletonList(userApiPermissions));
//		pageable = PageRequest.of(0, 1);
//		req = new PageRequestByExample<UserApiPermissions>();
//		Mockito.when(userApiPermissionsRepository.findAll(req.toPageable())).thenReturn(userApiPermissionsPage);
//		Mockito.when(userApiPermissionsRepository.findAll(pageable)).thenReturn(userApiPermissionsPage);
//		UserApiPermissionsServiceImpl userApiPermissionsService = new UserApiPermissionsServiceImpl(
//				userApiPermissionsRepository,configurationApisService);
//
//		userApiPermissionsResource = new UserApiPermissionsResource(userApiPermissionsService);
//	}
//
//	/**
//	 * Test negative create user api permissions.
//	 */
//	@Test
//	@Order(1)
//	public void testNegativeCreateUserApiPermissions() {
//		UserApiPermissionsDTO userApiPermissionsDTO = new UserApiPermissionsDTO();
//		ModelMapper modelMapper = new ModelMapper();
//		userApiPermissionsDTO = modelMapper.map(userApiPermissions, UserApiPermissionsDTO.class);
//		try {
//			assertEquals(userApiPermissionsResource.createUserApiPermissions(userApiPermissionsDTO).getStatusCode(),
//					HttpStatus.BAD_REQUEST);
//		} catch (URISyntaxException e) {
//			e.printStackTrace();
//		}
//	}
//	/**
//	 * Test negative create user api permissions.
//	 */
//	@Test
//	@Order(2)
//	public void testErrorCreateUserApiPermissions() {
//		UserApiPermissions userApiPermissions = new UserApiPermissions();
//		userApiPermissions.setApi("test");
//		userApiPermissions.setProjectid(2);
//		userApiPermissions.setRoleid(2);
//		UserApiPermissionsDTO userApiPermissionsDTO = new UserApiPermissionsDTO();
//		ModelMapper modelMapper = new ModelMapper();
//		userApiPermissionsDTO = modelMapper.map(userApiPermissions, UserApiPermissionsDTO.class);
//		try {
//			assertEquals(userApiPermissionsResource.createUserApiPermissions(userApiPermissionsDTO).getStatusCode(),
//					HttpStatus.INTERNAL_SERVER_ERROR);
//		} catch (URISyntaxException e) {
//			e.printStackTrace();
//		}
//	}
//	/**
//	 * Test negative create user api permissions.
//	 */
//	@Test
//	@Order(3)
//	public void testerrorCreateUserApiPermissions() {
//		UserApiPermissions userApiPermissions = new UserApiPermissions();
//		userApiPermissions.setApi("test");
//		userApiPermissions.setProjectid(2);
//		userApiPermissions.setRoleid(2);
//		UserApiPermissionsDTO userApiPermissionsDTO = new UserApiPermissionsDTO();
//		ModelMapper modelMapper = new ModelMapper();
//		userApiPermissionsDTO = modelMapper.map(userApiPermissions, UserApiPermissionsDTO.class);
//		try {
//			Mockito.when(userApiPermissionsResource.createUserApiPermissions(userApiPermissionsDTO))
//			.thenThrow(new DataIntegrityViolationException(null));
//			assertEquals(userApiPermissionsResource.createUserApiPermissions(userApiPermissionsDTO).getStatusCode(),
//					HttpStatus.INTERNAL_SERVER_ERROR);
//		} catch (URISyntaxException e) {
//			e.printStackTrace();
//		}
//	}
//
//	/**
//	 * Test update user api permissions.
//	 */
//	@Test
//	@Order(1)
//	public void testUpdateUserApiPermissions() {
//		UserApiPermissionsDTO userApiPermissionsDTO = new UserApiPermissionsDTO();
//		ModelMapper modelMapper = new ModelMapper();
//		userApiPermissionsDTO = modelMapper.map(userApiPermissions, UserApiPermissionsDTO.class);
//		try {
//			assertEquals(userApiPermissionsResource.updateUserApiPermissions(userApiPermissionsDTO).getStatusCode(),
//					HttpStatus.OK);
//		} catch (URISyntaxException e) {
//			e.printStackTrace();
//		}
//	}
//	
//	/**
//	 * Test get all user api permissionss.
//	 * @throws JsonProcessingException 
//	 * @throws UnsupportedEncodingException 
//	 * @throws JsonMappingException 
//	 */
//	@Test
//	@Order(1)
//	public void testGetAllUserApiPermissionss() throws JsonMappingException, UnsupportedEncodingException, JsonProcessingException {
//		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes());
//		assertEquals(userApiPermissionsResource.getAllUserApiPermissions(str).getStatusCode(), HttpStatus.OK);
//	}
//
//	/**
//	 * Test get all user api permissions.
//	 */
//	@Test
//	@Order(1)
//	public void testGetAllUserApiPermissions() {
//		assertEquals(userApiPermissionsResource.getAllUserApiPermissions(pageable).getStatusCode(), HttpStatus.OK);
//	}
//
//	/**
//	 * Test get user api permissions.
//	 */
//	@Test
//	@Order(1)
//	public void testGetUserApiPermissions() {
//		assertEquals(userApiPermissionsResource.getUserApiPermissions(2).getStatusCode(), HttpStatus.OK);
//	}
//
//	/**
//	 * Test delete user api permissions.
//	 */
//	@Test
//	@Order(1)
//	public void testDeleteUserApiPermissions() {
//		assertEquals(userApiPermissionsResource.deleteUserApiPermissions(2).getStatusCode(), HttpStatus.OK);
//	}
//
//	/**
//	 * Test negative get user api permissions.
//	 */
//	@Test
//	@Order(2)
//	public void testNegativeGetUserApiPermissions() {
//		Mockito.when(userApiPermissionsResource.getUserApiPermissions(2)).thenThrow(new EntityNotFoundException());
//		assertEquals(userApiPermissionsResource.getUserApiPermissions(2).getStatusCode(),
//				HttpStatus.INTERNAL_SERVER_ERROR);
//	}
//
//	/**
//	 * Test negative update user api permissions exception.
//	 */
//	@Test
//	@Order(2)
//	public void testNegativeUpdateUserApiPermissionsException() {
//		UserApiPermissionsDTO userApiPermissionsDTO = new UserApiPermissionsDTO();
//		ModelMapper modelMapper = new ModelMapper();
//		userApiPermissionsDTO = modelMapper.map(userApiPermissions, UserApiPermissionsDTO.class);
//		try {
//			Mockito.when(userApiPermissionsResource.updateUserApiPermissions(userApiPermissionsDTO))
//					.thenThrow(new EntityNotFoundException());
//			assertEquals(userApiPermissionsResource.updateUserApiPermissions(userApiPermissionsDTO).getStatusCode(),
//					HttpStatus.INTERNAL_SERVER_ERROR);
//		} catch (URISyntaxException e) {
//			e.printStackTrace();
//		}
//	}
//
//	/**
//	 * Test negative get all user api permissions.
//	 */
//	@Test
//	@Order(2)
//	public void testNegativeGetAllUserApiPermissions() {
//		Mockito.when(userApiPermissionsResource.getAllUserApiPermissions(pageable))
//				.thenThrow(new EntityNotFoundException());
//		assertEquals(userApiPermissionsResource.getAllUserApiPermissions(pageable).getStatusCode(),
//				HttpStatus.INTERNAL_SERVER_ERROR);
//	}
//
//	/**
//	 * Test negative delete user api permissions.
//	 */
//	@Test
//	@Order(2)
//	public void testNegativeDeleteUserApiPermissions() {
//		Mockito.when(userApiPermissionsResource.deleteUserApiPermissions(2)).thenThrow(new EntityNotFoundException());
//		assertEquals(userApiPermissionsResource.deleteUserApiPermissions(2).getStatusCode(),HttpStatus.INTERNAL_SERVER_ERROR);
//	}
//	
//	/**
//	 * Test negative get all user api permissionss.
//	 * @throws JsonProcessingException 
//	 * @throws UnsupportedEncodingException 
//	 * @throws JsonMappingException 
//	 */
//	@Test
//	@Order(2)
//	public void testNegativeGetAllUserApiPermissionss() throws JsonMappingException, UnsupportedEncodingException, JsonProcessingException {
//		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes());
//		Mockito.when(userApiPermissionsResource.getAllUserApiPermissions(str)).thenThrow(new EntityNotFoundException());
//		assertEquals(userApiPermissionsResource.getAllUserApiPermissions(str).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
//	}
//	/**
//	 * Test negative delete user api permissions.
//	 */
//	@Test
//	@Order(3)
//	public void testNegativeDeleteUserApiPermissionss() {
//		Mockito.when(userApiPermissionsResource.deleteUserApiPermissions(2)).thenThrow(new EmptyResultDataAccessException(1));
//		assertEquals(userApiPermissionsResource.deleteUserApiPermissions(2).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
//	}
//	/**
//	 * Test negative get all user api permissionss.
//	 * @throws JsonProcessingException 
//	 * @throws UnsupportedEncodingException 
//	 * @throws JsonMappingException 
//	 */
//	@Test
//	@Order(3)
//	public void testNegativeGetallUserApiPermissionss() throws JsonMappingException, UnsupportedEncodingException, JsonProcessingException {
//		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes());
//		Mockito.when(userApiPermissionsResource.getAllUserApiPermissions(str)).thenThrow(new ArithmeticException());
//		assertEquals(userApiPermissionsResource.getAllUserApiPermissions(str).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
//	}
//	
//}
