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
import com.infosys.icets.iamp.usm.repository.RoleRepository;

// TODO: Auto-generated Javadoc
/**
 * The Class RoleServiceImplTest.
 *
 * @author icets
 */
public class RoleServiceImplTest {
	
	/** The log. */
	private final Logger log = LoggerFactory.getLogger(RoleServiceImplTest.class);

	/** The service. */
	static RoleServiceImpl service;
	
	/** The pageable. */
	static Pageable pageable = null;
	
	/** The role. */
	static Role role = null;
	
	/** The req. */
	static PageRequestByExample<Role> req = null;
	
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
		ExampleMatcher matcher = ExampleMatcher.matching() //
                .withMatcher("name", match -> match.ignoreCase().startsWith())
                .withMatcher("description", match -> match.ignoreCase().startsWith());
		Example<Role> example = Example.of(role,matcher);
		req.setExample(role);
		Mockito.when(roleRepository.findAll(example,req.toPageable())).thenReturn(rolePage);
		Mockito.when(roleRepository.findAll(req.toPageable())).thenReturn(rolePage);
		Mockito.when(roleRepository.findAll(pageable)).thenReturn(rolePage);

		service = new RoleServiceImpl(roleRepository);

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
			assertEquals(service.save(role).getName(), "test");
		} catch (SQLException e) {
			log.error("Exception : {}", e.getMessage());
		}

	}

	/**
	 * Test delete by id.
	 */
	@Test
	void testDeleteById() {
		try {
			service.delete(role);
			assertEquals(service.findOne(2).getId(), 2);
		} catch (SQLException e) {
			log.error("Exception : {}", e.getMessage());
		}

	}

	/**
	 * Test find by name.
	 */
	@Test
	void testFindByName() {
		assertEquals(service.findByName("test").isEmpty(), true);
	}

	/**
	 * Test find all.
	 *
	 * @throws SQLException the SQL exception
	 */
	@Test
	void testFindAll() throws SQLException {
		Page<Role> rolelist = service.findAll(pageable);
		assertEquals(rolelist.getTotalElements(), 1);
	}
	
	/**
	 * Test get all.
	 *
	 * @throws SQLException the SQL exception
	 */
	@Test
	void testGetAll() throws SQLException {
		PageResponse<Role> rolelist = service.getAll(req);
		assertEquals(rolelist.getTotalElements(), 1);
	}

}
