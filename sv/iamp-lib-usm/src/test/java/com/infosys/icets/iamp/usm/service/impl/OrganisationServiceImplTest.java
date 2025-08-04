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
import java.time.LocalDate;
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
import com.infosys.icets.iamp.usm.domain.Organisation;
import com.infosys.icets.iamp.usm.repository.OrganisationRepository;
import com.infosys.icets.iamp.usm.service.ContextService;

// TODO: Auto-generated Javadoc
/**
 * The Class OrganisationServiceImplTest.
 *
 * @author icets
 */
public class OrganisationServiceImplTest {
	
	/** The log. */
	private final Logger log = LoggerFactory.getLogger(OrganisationServiceImplTest.class);
	
	/** The service. */
	static OrganisationServiceImpl service;
	
	/** The pageable. */
	static Pageable pageable = null;
	
	/** The req. */
	static PageRequestByExample<Organisation> req = null;
	
	/** The organisation. */
	static Organisation organisation = new Organisation();
	
	/** The context. */
	static Context context = new Context();
	
	/**
	 * Setup.
	 */
	@BeforeAll
	static void setup() {
		OrganisationRepository organisationrepository = Mockito.mock(OrganisationRepository.class);
		ContextService contextService = Mockito.mock(ContextService.class);
		organisation.setId(2);
		organisation.setName("Name"); 
		organisation.setDecription("Decription"); 
		organisation.setLocation("Location"); 
		organisation.setDivision("Division"); 
		organisation.setCountry("Country"); 
		organisation.setStatus("Status"); 
		organisation.setCreatedby("Createdby"); 
		organisation.setCreateddate(LocalDate.now()); 
		organisation.setModifiedby("Modifiedby"); 
		organisation.setModifieddate(LocalDate.now()); 
		organisation.setOnboarded(true);
		
		context.setId(2);
		context.setName("test");
		context.setType("Test Type");
		context.setValue("test value");
		organisation.setContext(context);	
		Mockito.when(organisationrepository.findById(2)).thenReturn(Optional.of(organisation));
		Mockito.when(organisationrepository.save(organisation)).thenReturn(organisation);
		Page<Organisation> organisationPage = new PageImpl<>(Collections.singletonList(organisation));
		pageable = PageRequest.of(0, 1);
		req = new PageRequestByExample<Organisation>();
		ExampleMatcher matcher = ExampleMatcher.matching() //
                .withMatcher("name", match -> match.ignoreCase().startsWith())
                .withMatcher("decription", match -> match.ignoreCase().startsWith())
                .withMatcher("status", match -> match.ignoreCase().startsWith())
                .withMatcher("createdby", match -> match.ignoreCase().startsWith())
                .withMatcher("modifiedby", match -> match.ignoreCase().startsWith());
		Example<Organisation> example = Example.of(organisation,matcher);
		req.setExample(organisation);
		Mockito.when(organisationrepository.findAll(example,req.toPageable())).thenReturn(organisationPage);
		Mockito.when(organisationrepository.findAll(req.toPageable())).thenReturn(organisationPage);
		Mockito.when(organisationrepository.findAll(pageable)).thenReturn(organisationPage);
		service = new OrganisationServiceImpl(organisationrepository, contextService);
		
		
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
		try {
			assertEquals(service.save(organisation).getName(),"Name");
		} catch (SQLException e) {
			log.error("Exception : {}", e.getMessage());
		}
	}
	
	/**
	 * Test delete by id.
	 */
	@Test
	void testDeleteById() {
		Organisation organisation = new Organisation();
		organisation.setId(2);
		try {
			service.deleteById(organisation.getId());
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
		Page<Organisation> organisationlist = service.findAll(pageable);
		assertEquals(organisationlist.getTotalElements(), 1);
	}
	
	/**
	 * Test get all.
	 *
	 * @throws SQLException the SQL exception
	 */
	@Test
	void testGetAll() throws SQLException {
		PageResponse<Organisation> organisationlist = service.getAll(req);
		assertEquals(organisationlist.getTotalElements(), 1);
	}
	
}
