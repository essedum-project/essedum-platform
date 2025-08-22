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
import java.time.LocalDate;
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
import com.infosys.icets.iamp.usm.domain.Organisation;
import com.infosys.icets.iamp.usm.dto.OrganisationDTO;
import com.infosys.icets.iamp.usm.repository.OrganisationRepository;
import com.infosys.icets.iamp.usm.service.ContextService;
import com.infosys.icets.iamp.usm.service.impl.OrganisationServiceImpl;


// TODO: Auto-generated Javadoc
/**
 * The Class OrganisationResourceTest.
 *
 * @author icets
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class OrganisationResourceTest {
	
	/** The organisation resource. */
	static OrganisationResource organisationResource;
	
	/** The pageable. */
	static Pageable pageable = null;
	
	/** The organisation. */
	static Organisation organisation = new Organisation();
	
	/** The req. */
	static PageRequestByExample<Organisation> req = null;
	/** */
	ObjectMapper Obj = new ObjectMapper();


	/**
	 * Setup.
	 */
	@BeforeAll
	static void setup() {
		OrganisationRepository organisationRepository = Mockito.mock(OrganisationRepository.class);
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
		organisation.setContext(new Context());
		Mockito.when(organisationRepository.findById(2)).thenReturn(Optional.of(organisation));
		Mockito.when(organisationRepository.save(organisation)).thenReturn(organisation);
		Page<Organisation> organisationPage = new PageImpl<>(Collections.singletonList(organisation));
		pageable = PageRequest.of(0, 1);
		req = new PageRequestByExample<Organisation>();
		Mockito.when(organisationRepository.findAll(req.toPageable())).thenReturn(organisationPage);
		Mockito.when(organisationRepository.findAll(pageable)).thenReturn(organisationPage);
		OrganisationServiceImpl organisationService = new OrganisationServiceImpl(organisationRepository,
				contextService);
		organisationResource = new OrganisationResource(organisationService);
	}
	
	

	/**
	 * Test negative create organisation.
	 */
	@Test
	@Order(1)
	public void testNegativeCreateOrganisation() {
		OrganisationDTO organisationDTO = new OrganisationDTO();
		ModelMapper modelMapper = new ModelMapper();
		organisationDTO = modelMapper.map(organisation, OrganisationDTO.class);
		try {
			assertEquals(organisationResource.createOrganisation(organisationDTO).getStatusCode(),
					HttpStatus.BAD_REQUEST);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
	/**
	 * Test negative create organisation.
	 */
	@Test
	@Order(2)
	public void testErrorCreateOrganisation() {
		Organisation organisation =new Organisation();
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
		organisation.setContext(new Context());
		OrganisationDTO organisationDTO = new OrganisationDTO();
		ModelMapper modelMapper = new ModelMapper();
		organisationDTO = modelMapper.map(organisation, OrganisationDTO.class);
		try {
			assertEquals(organisationResource.createOrganisation(organisationDTO).getStatusCode(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
	/**
	 * Test negative create organisation.
	 */
	@Test
	@Order(3)
	public void testErrorCreateorganisation() throws URISyntaxException{
		Organisation organisation =new Organisation();
		organisation.setId(2);
		organisation.setName("Name");
		organisation.setDecription("Decription");
		organisation.setLocation("Location");
		organisation.setDivision("Division");
		organisation.setCountry("Country");
		organisation.setStatus("Status");
		organisation.setCreatedby("Createdby");
		organisation.setCreateddate(null);
		organisation.setModifiedby("Modifiedby");
		organisation.setModifieddate(null);
		organisation.setOnboarded(true);
		organisation.setContext(new Context());
		OrganisationDTO organisationDTO = new OrganisationDTO();
		ModelMapper modelMapper = new ModelMapper();
		organisationDTO = modelMapper.map(organisation, OrganisationDTO.class);
		assertEquals(organisationResource.createOrganisation(organisationDTO).getStatusCode(),
					HttpStatus.BAD_REQUEST);	
	}
	/**
	 * Test negative create organisation.
	 */
	@Test
	@Order(3)
	public void testerrorCreateorganisation() throws URISyntaxException{
		Organisation organisation =new Organisation();
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
		organisation.setContext(new Context());
		OrganisationDTO organisationDTO = new OrganisationDTO();
		ModelMapper modelMapper = new ModelMapper();
		organisationDTO = modelMapper.map(organisation, OrganisationDTO.class);
		Mockito.when(organisationResource.createOrganisation(organisationDTO))
		.thenThrow(new DataIntegrityViolationException(null));
		assertEquals(organisationResource.createOrganisation(organisationDTO).getStatusCode(),
					HttpStatus.INTERNAL_SERVER_ERROR);	
	}
	
	
	/**
	 * Test update organisation.
	 */
	@Test
	@Order(1)
	public void testUpdateOrganisation() {
		OrganisationDTO organisationDTO = new OrganisationDTO();
		ModelMapper modelMapper = new ModelMapper();
		organisationDTO = modelMapper.map(organisation, OrganisationDTO.class);
		try {
			assertEquals(organisationResource.updateOrganisation(organisationDTO).getStatusCode(), HttpStatus.OK);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}

	/**
	 * Test get all organisations.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 */
	@Test
	@Order(1)
	public void testGetAllOrganisations() throws JsonProcessingException, UnsupportedEncodingException {
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes()); 
		assertEquals(organisationResource.getAllOrganisations(str).getStatusCode(), HttpStatus.OK);
	}
	
	/**
	 * Test get all organisation.
	 */
	@Test
	@Order(1)
	public void testGetAllOrganisation() {
		assertEquals(organisationResource.getAllOrganisations(pageable).getStatusCode(), HttpStatus.OK);
	}

	/**
	 * Test get organisation.
	 */
	@Test
	@Order(1)
	public void testGetOrganisation() {
		assertEquals(organisationResource.getOrganisation(2).getStatusCode(), HttpStatus.OK);
	}

	/**
	 * Test delete organisation.
	 */
	@Test
	@Order(1)
	public void testDeleteOrganisation() {
		assertEquals(organisationResource.deleteOrganisation(2).getStatusCode(), HttpStatus.OK);
	}
	
	

	
	/**
	 * Test negative get get organisations.
	 */
	@Test
	@Order(2)
	public void testNegativeGetGetOrganisations() {
		Mockito.when(organisationResource.getOrganisation(2)).thenThrow(new EntityNotFoundException());
		assertEquals(organisationResource.getOrganisation(2).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/**
	 * Test negative update organisations exception.
	 */
	@Test
	@Order(2)
	public void testNegativeUpdateOrganisationsException() {
		OrganisationDTO organisationDTO = new OrganisationDTO();
		ModelMapper modelMapper = new ModelMapper();
		organisationDTO = modelMapper.map(organisation, OrganisationDTO.class);
		try {
			Mockito.when(organisationResource.updateOrganisation(organisationDTO))
					.thenThrow(new EntityNotFoundException());
			assertEquals(organisationResource.updateOrganisation(organisationDTO).getStatusCode(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}

	/**
	 * Test negative get all organisations.
	 */
	@Test
	@Order(2)
	public void testNegativeGetAllOrganisations() {
		Mockito.when(organisationResource.getAllOrganisations(pageable)).thenThrow(new EntityNotFoundException());
		assertEquals(organisationResource.getAllOrganisations(pageable).getStatusCode(),
				HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/**
	 * Test negative delete organisations.
	 */
	@Test
	@Order(2)
	public void testNegativeDeleteOrganisations() {
		Mockito.when(organisationResource.deleteOrganisation(2)).thenThrow(new EntityNotFoundException());
		assertEquals(organisationResource.deleteOrganisation(2).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	/**
	 * Test negative get all organisationss.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 */
	@Test
	@Order(2)
	public void testNegativeGetAllOrganisationss() throws JsonProcessingException, UnsupportedEncodingException {
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes());
		Mockito.when(organisationResource.getAllOrganisations(str)).thenThrow(new EntityNotFoundException());
		assertEquals(organisationResource.getAllOrganisations(str).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	/**
	 * Test negative delete organisations.
	 */

	@Test
	@Order(3)
	public void testNegativeDeleteOrganisationss() {
		Mockito.when(organisationResource.deleteOrganisation(2)).thenThrow(new EmptyResultDataAccessException(1));
		assertEquals(organisationResource.deleteOrganisation(2).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	/**
	 * Test negative get all organisationss.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 * @throws JsonMappingException 
	 */
	@Test
	@Order(3)
	public void testNegativeGetAllOrganisation() throws JsonMappingException, UnsupportedEncodingException, JsonProcessingException {
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes());
		Mockito.when(organisationResource.getAllOrganisations(str)).thenThrow(new ArithmeticException());
		assertEquals(organisationResource.getAllOrganisations(str).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
}
