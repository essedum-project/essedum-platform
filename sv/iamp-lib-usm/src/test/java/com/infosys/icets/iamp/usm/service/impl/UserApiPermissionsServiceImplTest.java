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
//package com.infosys.icets.iamp.usm.service.impl;
//
//import static org.junit.jupiter.api.Assertions.assertEquals;
//
//import java.sql.SQLException;
//import java.util.Collections;
//import java.util.Optional;
//
//import org.junit.jupiter.api.BeforeAll;
//import org.junit.jupiter.api.Test;
//import org.mockito.Mockito;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.data.domain.Example;
//import org.springframework.data.domain.ExampleMatcher;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageImpl;
//import org.springframework.data.domain.PageRequest;
//import org.springframework.data.domain.Pageable;
//
//import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
//import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
//import com.infosys.icets.iamp.usm.domain.UserApiPermissions;
//import com.infosys.icets.iamp.usm.repository.UserApiPermissionsRepository;
//import com.infosys.icets.iamp.usm.service.configApis.support.ConfigurationApisService;
//
//// TODO: Auto-generated Javadoc
///**
// * The Class UserApiPermissionsServiceImplTest.
// *
// * @author icets
// */
//public class UserApiPermissionsServiceImplTest {
//
///** The log. */
//private final Logger log = LoggerFactory.getLogger(UserApiPermissionsServiceImplTest.class);
//	
//	/** The service. */
//	static UserApiPermissionsServiceImpl service;
//	
//	/** The pageable. */
//	static Pageable pageable = null;
//	
//	/** The user api permissions repository. */
//	static UserApiPermissionsRepository userApiPermissionsRepository;
//	
//	static ConfigurationApisService configurationApisService;
//	
//	/** The req. */
//	static PageRequestByExample<UserApiPermissions> req = null;
//	
//	/** The user api permissions. */
//	static UserApiPermissions userApiPermissions =new UserApiPermissions();
//	
//	/** The user api permissions repo. */
////	static UserApiPermissionsRepo userApiPermissionsRepo;
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
//		ExampleMatcher matcher = ExampleMatcher.matching();
//		Example<UserApiPermissions> example = Example.of(userApiPermissions,matcher);
//		req.setExample(userApiPermissions);
//		Mockito.when(userApiPermissionsRepository.findAll(example,req.toPageable())).thenReturn(userApiPermissionsPage);
//		Mockito.when(userApiPermissionsRepository.findAll(req.toPageable())).thenReturn(userApiPermissionsPage);
//		Mockito.when(userApiPermissionsRepository.findAll(pageable)).thenReturn(userApiPermissionsPage);
//		service = new UserApiPermissionsServiceImpl(userApiPermissionsRepository,configurationApisService);
//	}
//	
//	/**
//	 * Test find by id.
//	 */
//	@Test
//	void testFindById() {
//	try {
//		assertEquals(service.getOne(2).getId(), 2);
//	} catch (SQLException e) {
//		log.error("Exception : {}", e.getMessage());
//	}
//	}
//	
//	/**
//	 * Test save.
//	 */
//	@Test
//	void testSave() {
//		UserApiPermissions userApiPermissions = new UserApiPermissions();
//		userApiPermissions.setId(2);
//		userApiPermissions.setApi("test");;
//		userApiPermissions.setProjectid(2);
//		userApiPermissions.setRoleid(2);
//		try {
//			UserApiPermissions apiPermissions = service.save(userApiPermissions);
//			assertEquals(apiPermissions.getApi(),"test");
//		} catch (SQLException e) {
//			log.error("Exception : {}", e.getMessage());
//		}
//		
//}
//	
//	/**
//	 * Test delete by id.
//	 */
//	@Test
//	void testDeleteById() {
//		UserApiPermissions userApiPermissions =new UserApiPermissions();
//		userApiPermissions.setId(2);
//	try {
//		service.deleteById(userApiPermissions.getId());
//		assertEquals(service.getOne(2).getId(), 2);
//	} catch (SQLException e) {
//		log.error("Exception : {}", e.getMessage());
//	}
//	}
//	
//	/**
//	 * Test get rolefor api.
//	 */
//	@Test
//	void testGetRoleforApi() {
//		assertEquals(service.getRoleforApi("test").isEmpty(),true);
//	}
//	
//	/**
//	 * Test find all.
//	 *
//	 * @throws SQLException the SQL exception
//	 */
//	@Test
//	void testFindAll() throws SQLException {
//		Page<UserApiPermissions> userApiPermissionslist = service.findAll(pageable);
//		assertEquals(userApiPermissionslist.getTotalElements(), 1);
//	}
//	
//	/**
//	 * Test get all.
//	 *
//	 * @throws SQLException the SQL exception
//	 */
//	@Test
//	void testGetAll() throws SQLException {
//		PageResponse<UserApiPermissions> userApiPermissionslist = service.getAll(req);
//		assertEquals(userApiPermissionslist.getTotalElements(), 1);
//	}
//
//	
//}
