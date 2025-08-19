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
import com.infosys.icets.iamp.usm.domain.Context;
import com.infosys.icets.iamp.usm.domain.OrgUnit;
import com.infosys.icets.iamp.usm.domain.Organisation;
import com.infosys.icets.iamp.usm.dto.OrgUnitDTO;
import com.infosys.icets.iamp.usm.repository.OrgUnitRepository;
import com.infosys.icets.iamp.usm.service.ContextService;
import com.infosys.icets.iamp.usm.service.OrganisationService;
import com.infosys.icets.iamp.usm.service.impl.OrgUnitServiceImpl;

// TODO: Auto-generated Javadoc
/**
 * The Class OrgUnitResourceTest.
 *
 * @author icets
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class OrgUnitResourceTest {
	
	/** The org unit resource. */
	static OrgUnitResource orgUnitResource;
	
	/** The pageable. */
	static Pageable pageable = null;
	
	/** The req. */
	static PageRequestByExample<OrgUnit> req = null;
	
	/** The org unit. */
	static OrgUnit orgUnit = new OrgUnit();
	/** */
	ObjectMapper Obj = new ObjectMapper();

	/**
	 * Setup.
	 */
	@BeforeAll
	static void setup() {
		OrgUnitRepository orgunitRepository = Mockito.mock(OrgUnitRepository.class);
		OrganisationService organisationService =Mockito.mock(OrganisationService.class);
		ContextService contextService = Mockito.mock(ContextService.class);
		orgUnit.setId(2);
		orgUnit.setName("test"); 
		orgUnit.setOrganisation(new Organisation());
		orgUnit.setContext(new Context());
		orgUnit.setOnboarded(true);
		Mockito.when(orgunitRepository.findById(2)).thenReturn(Optional.of(orgUnit));
		Mockito.when(orgunitRepository.save(orgUnit)).thenReturn(orgUnit);
		Page<OrgUnit> orgunitPage = new PageImpl<>(Collections.singletonList(orgUnit));
		pageable = PageRequest.of(0, 1);
		req = new PageRequestByExample<OrgUnit>();	
		Mockito.when(orgunitRepository.findAll(pageable)).thenReturn(orgunitPage);
		Mockito.when(orgunitRepository.findAll(req.toPageable())).thenReturn(orgunitPage);
		OrgUnitServiceImpl orgUnitService =new OrgUnitServiceImpl(orgunitRepository, contextService,organisationService);
		orgUnitResource = new OrgUnitResource(orgUnitService);
	}

	/**
	 * Test negative create org unit.
	 */
	@Test
	@Order(1)
	public void testNegativeCreateOrgUnit() {
		OrgUnitDTO orgUnitDTO = new OrgUnitDTO();
		ModelMapper modelMapper = new ModelMapper();
		orgUnitDTO = modelMapper.map(orgUnit, OrgUnitDTO.class);
		try {
			assertEquals(orgUnitResource.createOrgUnit(orgUnitDTO).getStatusCode(),
					HttpStatus.BAD_REQUEST);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
	/**
	 * Test negative create org unit.
	 */
	@Test
	@Order(2)
	public void testErrorCreateOrgUnit() {
		OrgUnit orgUnit =new OrgUnit();
		orgUnit.setName("test"); 
		orgUnit.setOrganisation(new Organisation());
		orgUnit.setContext(new Context());
		orgUnit.setOnboarded(true);
		OrgUnitDTO orgUnitDTO = new OrgUnitDTO();
		ModelMapper modelMapper = new ModelMapper();
		orgUnitDTO = modelMapper.map(orgUnit, OrgUnitDTO.class);
		try {
			assertEquals(orgUnitResource.createOrgUnit(orgUnitDTO).getStatusCode(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
	/**
	 * Test negative create org unit.
	 */
	@Test
	@Order(2)
	public void testErrorCreateorgUnit() {
		OrgUnit orgUnit =new OrgUnit();
		orgUnit.setName("test"); 
		orgUnit.setOrganisation(new Organisation());
		orgUnit.setContext(new Context());
		orgUnit.setOnboarded(true);
		OrgUnitDTO orgUnitDTO = new OrgUnitDTO();
		ModelMapper modelMapper = new ModelMapper();
		orgUnitDTO = modelMapper.map(orgUnit, OrgUnitDTO.class);
		try {
			Mockito.when(orgUnitResource.updateOrgUnit(orgUnitDTO))
			.thenThrow(new DataIntegrityViolationException(null));
			assertEquals(orgUnitResource.createOrgUnit(orgUnitDTO).getStatusCode(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}

	/**
	 * Test update org unit.
	 */
	@Test
	@Order(1)
	public void testUpdateOrgUnit() {
		OrgUnitDTO orgUnitDTO = new OrgUnitDTO();
		ModelMapper modelMapper = new ModelMapper();
		orgUnitDTO = modelMapper.map(orgUnit, OrgUnitDTO.class);
		try {
			assertEquals(orgUnitResource.updateOrgUnit(orgUnitDTO).getStatusCode(), HttpStatus.OK);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * Test get all org unitss.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 */
	@Test
	@Order(1)
	public void testGetAllOrgUnitss() throws JsonProcessingException, UnsupportedEncodingException {
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes());
		assertEquals(orgUnitResource.getAllOrgUnits(str).getStatusCode(), HttpStatus.OK);
	}

	/**
	 * Test get all org unit.
	 */
	@Test
	@Order(1)
	public void testGetAllOrgUnit() {
		assertEquals(orgUnitResource.getAllOrgUnits(pageable).getStatusCode(), HttpStatus.OK);
	}

	/**
	 * Test get org unit.
	 */
	@Test
	@Order(1)
	public void testGetOrgUnit() {
		assertEquals(orgUnitResource.getOrgUnit(2).getStatusCode(), HttpStatus.OK);
	}

	/**
	 * Test delete org unit.
	 */
	@Test
	@Order(1)
	public void testDeleteOrgUnit() {
		assertEquals(orgUnitResource.deleteOrgUnit(2).getStatusCode(), HttpStatus.OK);
	}
	
	/**
	 * Test negative get org unit.
	 */
	@Test
	@Order(2)
	public void testNegativeGetOrgUnit() {
		Mockito.when(orgUnitResource.getOrgUnit(2)).thenThrow(new EntityNotFoundException());
		assertEquals(orgUnitResource.getOrgUnit(2).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/**
	 * Test negative update org unit exception.
	 */
	@Test
	@Order(2)
	public void testNegativeUpdateOrgUnitException() {
		OrgUnitDTO orgUnitDTO = new OrgUnitDTO();
		ModelMapper modelMapper = new ModelMapper();
		orgUnitDTO = modelMapper.map(orgUnit, OrgUnitDTO.class);
		try {
			Mockito.when(orgUnitResource.updateOrgUnit(orgUnitDTO))
					.thenThrow(new EntityNotFoundException());
			assertEquals(orgUnitResource.updateOrgUnit(orgUnitDTO).getStatusCode(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}

	/**
	 * Test negative get all org unit.
	 */
	@Test
	@Order(2)
	public void testNegativeGetAllOrgUnit() {
		Mockito.when(orgUnitResource.getAllOrgUnits(pageable)).thenThrow(new EntityNotFoundException());
		assertEquals(orgUnitResource.getAllOrgUnits(pageable).getStatusCode(),
				HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/**
	 * Test negative delete org unit.
	 */
	@Test
	@Order(2)
	public void testNegativeDeleteOrgUnit() {
		Mockito.when(orgUnitResource.deleteOrgUnit(2)).thenThrow(new EntityNotFoundException());
		assertEquals(orgUnitResource.deleteOrgUnit(2).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	/**
	 * Test negative get all org units.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 */
	@Test
	@Order(2)
	public void testNegativeGetAllOrgUnits() throws JsonProcessingException, UnsupportedEncodingException {
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes());
		Mockito.when(orgUnitResource.getAllOrgUnits(str)).thenThrow(new EntityNotFoundException());
		assertEquals(orgUnitResource.getAllOrgUnits(str).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	/**
	 * Test negative delete org unit.
	 */
	@Test
	@Order(3)
	public void testNegativeDeleteOrgUnits() {
		Mockito.when(orgUnitResource.deleteOrgUnit(2)).thenThrow(new EmptyResultDataAccessException(1));
		assertEquals(orgUnitResource.deleteOrgUnit(2).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	/**
	 * Test negative get all org units.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 * @throws JsonMappingException 
	 */
	@Test
	@Order(3)
	public void testNegativeGetAllOrgunit() throws JsonMappingException, UnsupportedEncodingException, JsonProcessingException {
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes());
		Mockito.when(orgUnitResource.getAllOrgUnits(str)).thenThrow(new ArithmeticException());
		assertEquals(orgUnitResource.getAllOrgUnits(str).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}

}
