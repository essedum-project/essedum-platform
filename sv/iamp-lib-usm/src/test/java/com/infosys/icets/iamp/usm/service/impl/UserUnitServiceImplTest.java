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
import com.infosys.icets.iamp.usm.domain.Context;
import com.infosys.icets.iamp.usm.domain.OrgUnit;
import com.infosys.icets.iamp.usm.domain.UserUnit;
import com.infosys.icets.iamp.usm.domain.Users;
import com.infosys.icets.iamp.usm.repository.UserUnitRepository;
import com.infosys.icets.iamp.usm.service.ContextService;
import com.infosys.icets.iamp.usm.service.OrgUnitService;
import com.infosys.icets.iamp.usm.service.UsersService;

// TODO: Auto-generated Javadoc
/**
 * The Class UserUnitServiceImplTest.
 *
 * @author icets
 */
public class UserUnitServiceImplTest {
	
	/** The log. */
	private final Logger log = LoggerFactory.getLogger(UserUnitServiceImplTest.class);

	/** The service. */
	static UserUnitServiceImpl service;
	
	/** The pageable. */
	static Pageable pageable=null;
	
	/** The req. */
	static PageRequestByExample<UserUnit> req = null;
	
	/** The user unit. */
	static UserUnit userUnit = new UserUnit();
	
	/**
	 * Setup.
	 */
	@BeforeAll
	static void setup() {
		UserUnitRepository userUnitRepository = Mockito.mock(UserUnitRepository.class);
		ContextService contextService = Mockito.mock(ContextService.class);
		UsersService usersService = Mockito.mock(UsersService.class);
		OrgUnitService orgUnitService = Mockito.mock(OrgUnitService.class);	
		userUnit.setId(2);
		userUnit.setUnit(new OrgUnit());
		userUnit.setUser(new Users());
		userUnit.setContext(new Context());
		Mockito.when(userUnitRepository.findById(2)).thenReturn(Optional.of(userUnit));
		Mockito.when(userUnitRepository.save(userUnit)).thenReturn(userUnit);
		Page<UserUnit> userUnitPage = new PageImpl<>(Collections.singletonList(userUnit));
		pageable = PageRequest.of(0, 1);
		req = new PageRequestByExample<UserUnit>();
		ExampleMatcher matcher = ExampleMatcher.matching();
		Example<UserUnit> example = Example.of(userUnit,matcher);
		req.setExample(userUnit);
		Mockito.when(userUnitRepository.findAll(example,req.toPageable())).thenReturn(userUnitPage);
		Mockito.when(userUnitRepository.findAll(req.toPageable())).thenReturn(userUnitPage);
		Mockito.when(userUnitRepository.findAll(pageable)).thenReturn(userUnitPage);
		service = new UserUnitServiceImpl(userUnitRepository, contextService,usersService,orgUnitService );
		
		
	}
	
	/**
	 * Test find by id.
	 */
	@Test
	void testFindById() {
	try {
		assertEquals(service.getOne(2).getId(), 2);
	} catch (SQLException e) {
		log.error("Exception : {}", e.getMessage());
	}
	}
	
	/**
	 * Test save user unit.
	 */
	@Test
	void testSaveUserUnit() {
		try {
			Integer name= service.save(userUnit).getId();
			assertEquals(name,2);
		} catch (SQLException e) {
			log.error("Exception : {}", e.getMessage());
		}
	}
	
	/**
	 * Test delete by id.
	 */
	@Test
	void testDeleteById() {
		UserUnit userUnit = new UserUnit();
		userUnit.setId(2);
	try {
		service.deleteById(userUnit.getId());
		assertEquals(service.getOne(2).getId(), 2);
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
		Page<UserUnit> userUnitlist = service.findAll(pageable);
		assertEquals(userUnitlist.getTotalElements(), 1);
	}
	
	/**
	 * Test get all.
	 *
	 * @throws SQLException the SQL exception
	 */
	@Test
	void testGetAll() throws SQLException {
		PageResponse<UserUnit> userUnitlist = service.getAll(req);
		assertEquals(userUnitlist.getTotalElements(), 1);
	}
}
