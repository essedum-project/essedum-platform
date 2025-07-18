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
import com.infosys.icets.iamp.usm.domain.Context;
import com.infosys.icets.iamp.usm.domain.OrgUnit;
import com.infosys.icets.iamp.usm.domain.Organisation;
import com.infosys.icets.iamp.usm.repository.OrgUnitRepository;
import com.infosys.icets.iamp.usm.service.ContextService;
import com.infosys.icets.iamp.usm.service.OrganisationService;

// TODO: Auto-generated Javadoc
/**
 * The Class OrgUnitServiceImplTest.
 *
 * @author icets
 */
public class OrgUnitServiceImplTest {
	
	/** The log. */
	private final Logger log = LoggerFactory.getLogger(OrgUnitServiceImplTest.class);
	
	/** The service. */
	static OrgUnitServiceImpl service;
	
	/** The pageable. */
	static Pageable pageable = null;
	
	/** The req. */
	static PageRequestByExample<OrgUnit> req = null;
	
	/**
	 * Setup.
	 */
	@BeforeAll
	static void setup() {
		OrgUnitRepository orgunitRepository = Mockito.mock(OrgUnitRepository.class);
		OrganisationService organisationService =Mockito.mock(OrganisationService.class);
		ContextService contextService = Mockito.mock(ContextService.class);
		OrgUnit orgunit = new OrgUnit();
		orgunit.setId(2);
		orgunit.setName("test"); 
		orgunit.setOrganisation(new Organisation());
		orgunit.setContext(new Context());
		orgunit.setOnboarded(true);
		Mockito.when(orgunitRepository.findById(2)).thenReturn(Optional.of(orgunit));
		Mockito.when(orgunitRepository.save(orgunit)).thenReturn(orgunit);
		Page<OrgUnit> orgunitPage = new PageImpl<>(Collections.singletonList(orgunit));
		pageable = PageRequest.of(0, 1);
		req = new PageRequestByExample<OrgUnit>();
		ExampleMatcher matcher = ExampleMatcher.matching() //
                .withMatcher("name", match -> match.ignoreCase().startsWith())
                .withMatcher("description", match -> match.ignoreCase().startsWith());
		Example<OrgUnit> example = Example.of(orgunit,matcher);
		req.setExample(orgunit);
		Mockito.when(orgunitRepository.findAll(example,req.toPageable())).thenReturn(orgunitPage);
		Mockito.when(orgunitRepository.findAll(req.toPageable())).thenReturn(orgunitPage);
		Mockito.when(orgunitRepository.findAll(pageable)).thenReturn(orgunitPage);
		service = new OrgUnitServiceImpl(orgunitRepository, contextService,organisationService);
		
		
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
	 * Test save.
	 */
	@Test
	void testSave() {
		OrgUnit orgunit = new OrgUnit();
		orgunit.setId(2);
		orgunit.setName("test"); 
		orgunit.setDescription("test description");
		orgunit.setOrganisation(new Organisation());
		orgunit.setContext(new Context());
		orgunit.setOnboarded(true);
		try {
			assertEquals(service.save(orgunit).getName(),"test");
		} catch (SQLException e) {
			log.error("Exception : {}", e.getMessage());
		}
	}
	
	/**
	 * Test delete by id.
	 */
	@Test
	void testDeleteById() {
		OrgUnit orgunit = new OrgUnit();
		orgunit.setId(2);
		try {
			service.deleteById(orgunit.getId());
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
		Page<OrgUnit> orgunitlist = service.findAll(pageable);
		assertEquals(orgunitlist.getTotalElements(), 1);
	}
	
	/**
	 * Test get all.
	 *
	 * @throws SQLException the SQL exception
	 */
	@Test
	void testGetAll() throws SQLException {
		PageResponse<OrgUnit> orgunitlist = service.getAll(req);
		assertEquals(orgunitlist.getTotalElements(), 1);
	}
}
