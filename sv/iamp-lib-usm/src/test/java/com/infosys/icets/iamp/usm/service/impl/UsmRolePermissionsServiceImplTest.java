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
package com.infosys.icets.iamp.usm.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.sql.SQLException;
import java.util.Collections;
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
import com.infosys.icets.iamp.usm.domain.Role;
import com.infosys.icets.iamp.usm.domain.UsmPermissions;
import com.infosys.icets.iamp.usm.domain.UsmRolePermissions;
import com.infosys.icets.iamp.usm.repository.UsmRolePermissionsRepository;
import com.infosys.icets.iamp.usm.service.RoleService;
import com.infosys.icets.iamp.usm.service.UsmPermissionsService;

// TODO: Auto-generated Javadoc
/**
 * The Class UsmRolePermissionsServiceImplTest.
 *
 * @author icets
 */
public class UsmRolePermissionsServiceImplTest {

	/** The log. */
	private final Logger log = LoggerFactory.getLogger(UsmRolePermissionsServiceImplTest.class);

	/** The service. */
	static UsmRolePermissionsServiceImpl service;
	
	/** The usm role permissions. */
	static UsmRolePermissions usmRolePermissions=new UsmRolePermissions();
	/** The pageable. */
	static Pageable pageable = null;
	
	/** The req. */
	static PageRequestByExample<UsmRolePermissions> req = null;
	
	/**
	 * Setup.
	 */
	@BeforeAll
	static void setup() {
		UsmRolePermissionsRepository usmRolePermissionsRepository = Mockito.mock(UsmRolePermissionsRepository.class);
		RoleService roleService = Mockito.mock(RoleService.class);
		UsmPermissionsService usmPermissionsService = Mockito.mock(UsmPermissionsService.class);
		usmRolePermissions.setId(1);
		usmRolePermissions.setPermission(new UsmPermissions());
		usmRolePermissions.setRole(new Role());
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
		Mockito.when(usmRolePermissionsRepository.findAll(pageable)).thenReturn(usmRolePermissionsPage);
		service = new UsmRolePermissionsServiceImpl(usmRolePermissionsRepository,roleService,usmPermissionsService);
		
		
	}
	
	/**
	 * Test get permission by role and module.
	 */
	@Test
	void testGetPermissionByRoleAndModule() {
		assertEquals(service.getPermissionByRoleAndModule(1, "test").isEmpty(),true);
	}
	/**
	 * Test find by id.
	 */
	@Test
	void testFindById() {
		assertEquals(service.findOne(1).getId(), 1);

	}

	/**
	 * Test save.
	 */
	@Test
	void testSave() {

		assertEquals(service.save(usmRolePermissions).getId(), 1);

	}

	/**
	 * Test delete by id.
	 */
	@Test
	void testDeleteById() {
		UsmRolePermissions usmRolePermissions = new UsmRolePermissions();
		usmRolePermissions.setId(1);

		service.delete(usmRolePermissions.getId());
		assertEquals(service.findOne(1).getId(), 1);
	}

	/**
	 * Test find all.
	 *
	 * @throws SQLException the SQL exception
	 */
	@Test
	void testFindAll() throws SQLException {
		Page<UsmRolePermissions> usmRolePermissionslist = service.findAll(pageable);
		assertEquals(usmRolePermissionslist.getTotalElements(), 1);
	}
	
	/**
	 * Test get all.
	 *
	 * @throws SQLException the SQL exception
	 */
	@Test
	void testGetAll() throws SQLException {
		PageResponse<UsmRolePermissions> usmRolePermissionslist = service.getAll(req);
		assertEquals(usmRolePermissionslist.getTotalElements(), 1);
	}
}
