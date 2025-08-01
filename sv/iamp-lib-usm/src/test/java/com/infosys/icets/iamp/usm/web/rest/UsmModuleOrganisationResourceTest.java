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
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
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
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.iamp.usm.domain.Project;
import com.infosys.icets.iamp.usm.domain.UsmModule;
import com.infosys.icets.iamp.usm.domain.UsmModuleOrganisation;
import com.infosys.icets.iamp.usm.domain.UsmPortfolio;
import com.infosys.icets.iamp.usm.dto.UsmModuleOrganisationDTO;
import com.infosys.icets.iamp.usm.repository.UsmModuleOrganisationRepository;
import com.infosys.icets.iamp.usm.service.ProjectService;
import com.infosys.icets.iamp.usm.service.UsmModuleService;
import com.infosys.icets.iamp.usm.service.impl.UsmModuleOrganisationServiceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * The Class UsmModuleResourceTest.
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class UsmModuleOrganisationResourceTest {
	/** The usmModule. */
	static UsmModuleOrganisationResource usmModuleOrganisationResource;
	
	/** The pageable. */
	static Pageable pageable = null;
	
	/** The req. */
	static PageRequestByExample<UsmModuleOrganisation> req = null;
	
	/** The usmModule. */
	static UsmModuleOrganisation usmModuleOrganisation = new UsmModuleOrganisation();
	
	/** The Obj. */
	ObjectMapper Obj = new ObjectMapper();
	
	private static final Logger log = LoggerFactory.getLogger(UsmModuleOrganisationResourceTest.class);	

	/**
	 * Setup.
	 */
	@BeforeAll
	static void setup() {
		UsmModuleOrganisationRepository usmModuleOrganisationRepository = Mockito.mock(UsmModuleOrganisationRepository.class);
		ProjectService projectService = Mockito.mock(ProjectService.class);
		UsmModuleService usmModuleService = Mockito.mock(UsmModuleService.class);
		usmModuleOrganisation.setId(2);
		usmModuleOrganisation.setEnddate(null);
		usmModuleOrganisation.setStartdate(null);
		usmModuleOrganisation.setSubscription("test");
		usmModuleOrganisation.setSubscriptionstatus(false);
		UsmModule usmModule= new UsmModule();
		usmModule.setId(2);
		usmModule.setName("test");
		usmModuleOrganisation.setModule(usmModule);
		Project project = new Project();
		project.setId(1);
		project.setName("Test");
		project.setDefaultrole(true);
		project.setDescription("Test Project");
		UsmPortfolio usmPortfolio = new UsmPortfolio();
		usmPortfolio.setId(2);
		usmPortfolio.setPortfolioName("test");
		usmPortfolio.setDescription("test");
		project.setPortfolioId(usmPortfolio);
		usmModuleOrganisation.setOrganisation(project);
		
		Mockito.when(usmModuleOrganisationRepository.findById(2)).thenReturn(Optional.of(usmModuleOrganisation));
		Mockito.when(usmModuleOrganisationRepository.save(usmModuleOrganisation)).thenReturn(usmModuleOrganisation);
		Page<UsmModuleOrganisation> usmModuleOrganisationPage = new PageImpl<>(Collections.singletonList(usmModuleOrganisation));
		pageable = PageRequest.of(0, 1);
		Mockito.when(usmModuleOrganisationRepository.findAll(pageable)).thenReturn(usmModuleOrganisationPage);
		req = new PageRequestByExample<UsmModuleOrganisation>();
		ExampleMatcher matcher = ExampleMatcher.matching() //
				.withMatcher("module", match -> match.ignoreCase().startsWith());
		Example<UsmModuleOrganisation> example = Example.of(usmModuleOrganisation, matcher);
		req.setExample(usmModuleOrganisation);
		Mockito.when(usmModuleOrganisationRepository.findAll(example, req.toPageable())).thenReturn(usmModuleOrganisationPage);
		Mockito.when(usmModuleOrganisationRepository.findAll(req.toPageable())).thenReturn(usmModuleOrganisationPage);

		UsmModuleOrganisationServiceImpl usmModuleOrganisationService = new UsmModuleOrganisationServiceImpl(usmModuleOrganisationRepository, projectService, usmModuleService);

		usmModuleOrganisationResource = new UsmModuleOrganisationResource(usmModuleOrganisationService);
	}

	/**
	 * Test negative create usm portfolio.
	 */
	@Test
	@Order(1)
	public void testNegativeCreateUsmModule() {
		try {			
			assertEquals(usmModuleOrganisationResource.createUsmModuleOrganisation(new ModelMapper().map(usmModuleOrganisation,UsmModuleOrganisationDTO.class)).getStatusCode(), HttpStatus.BAD_REQUEST);
		} catch (URISyntaxException e) {
			log.error(e.getMessage());
		}
	}
	/**
	 * Test negative create project.
	 */
	@Test
	@Order(1)
	public void testErrorCreateUsmModule() {
		UsmModuleOrganisation usmModuleOrganisation = new UsmModuleOrganisation();
		usmModuleOrganisation.setEnddate(null);
		usmModuleOrganisation.setStartdate(null);
		usmModuleOrganisation.setSubscription("test");
		usmModuleOrganisation.setSubscriptionstatus(false);
		UsmModule usmModule= new UsmModule();
		usmModule.setId(2);
		usmModule.setName("test");
		usmModuleOrganisation.setModule(usmModule);
		Project project = new Project();
		project.setId(1);
		project.setName("Test");
		project.setDefaultrole(true);
		project.setDescription("Test Project");
		UsmPortfolio usmPortfolio = new UsmPortfolio();
		usmPortfolio.setId(2);
		usmPortfolio.setPortfolioName("test");
		usmPortfolio.setDescription("test");
		project.setPortfolioId(usmPortfolio);
		usmModuleOrganisation.setOrganisation(project);
		UsmModuleOrganisationDTO usmModuleOrganisationDTO = new UsmModuleOrganisationDTO();
		ModelMapper modelMapper = new ModelMapper();
		usmModuleOrganisationDTO = modelMapper.map(usmModuleOrganisation, UsmModuleOrganisationDTO.class);
		try {
			Mockito.when(usmModuleOrganisationResource.createUsmModuleOrganisation(usmModuleOrganisationDTO))
			.thenThrow(new DataIntegrityViolationException(null));
			assertEquals(usmModuleOrganisationResource.createUsmModuleOrganisation(usmModuleOrganisationDTO).getStatusCode(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (URISyntaxException e) {
			log.error(e.getMessage());
		}
	}
	/**
	 * Test update usm Module.
	 */
	@Test
	@Order(1)
	public void testUpdateUsmModule() {
	
		try {
			assertEquals(usmModuleOrganisationResource.updateUsmModuleOrganisation(new ModelMapper().map(usmModuleOrganisation,UsmModuleOrganisationDTO.class)).getStatusCode(), HttpStatus.OK);
		} catch (URISyntaxException e) {
			log.error(e.getMessage());
		}
	}

	/**
	 * Test get all usm Module.
	 */
	@Test
	@Order(1)
	public void testGetAllUsmModules() {
		assertEquals(usmModuleOrganisationResource.getAllUsmModuleOrganisations(pageable).getStatusCode(), HttpStatus.OK);
	}

	/**
	 * Test get usm Module.
	 */
	@Test
	public void testGetUsmModule() {
		assertEquals(usmModuleOrganisationResource.getUsmModuleOrganisation(2).getStatusCode(), HttpStatus.OK);
	}

	/**
	 * Test delete usm Module.
	 */
	@Test
	@Order(1)
	public void testDeleteUsmModule() {
		assertEquals(usmModuleOrganisationResource.deleteUsmModuleOrganisation(2).getStatusCode(), HttpStatus.OK);
	}
	
	/**
	 * Test get all Module.
	 *
	 * @throws JsonProcessingException the json processing exception
	 * @throws UnsupportedEncodingException the unsupported encoding exception
	 */
	@Test
	@Order(1)
	public void testGetAllModules() throws JsonProcessingException, UnsupportedEncodingException {
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes());
		assertEquals(usmModuleOrganisationResource.getAllUsmModuleOrganisations(str).getStatusCode(), HttpStatus.OK);
	}
	
	/**
	 * Test negative get Module.
	 */
	@Test
	@Order(2)
	public void testNegativeGetUsmModule() {
		Mockito.when(usmModuleOrganisationResource.getUsmModuleOrganisation(1)).thenThrow(new EntityNotFoundException());
		assertEquals(usmModuleOrganisationResource.getUsmModuleOrganisation(1).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	/**
	 * Test negative update Module exception.
	 */
	@Test
	@Order(2)
	public void testNegativeUpdateModuleException() {
		UsmModuleOrganisationDTO usmModuleOrganisationDTO = new UsmModuleOrganisationDTO();
		ModelMapper modelMapper = new ModelMapper();
		usmModuleOrganisationDTO = modelMapper.map(usmModuleOrganisationDTO, UsmModuleOrganisationDTO.class);
		try {
			Mockito.when(usmModuleOrganisationResource.updateUsmModuleOrganisation(usmModuleOrganisationDTO)).thenThrow(new EntityNotFoundException());
			assertEquals(usmModuleOrganisationResource.updateUsmModuleOrganisation(usmModuleOrganisationDTO).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (URISyntaxException e) {
			log.error(e.getMessage());
		}
	}
	
	/**
	 * Test negative get all Module.
	 */
	@Test
	@Order(2)
	public void testNegativeGetAllModules() {
		Mockito.when(usmModuleOrganisationResource.getAllUsmModuleOrganisations(pageable)).thenThrow(new EntityNotFoundException());
		assertEquals(usmModuleOrganisationResource.getAllUsmModuleOrganisations(pageable).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	/**
	 * Test negative delete Module.
	 */
	@Test
	@Order(2)
	public void testNegativeDeleteModule() {
		Mockito.when(usmModuleOrganisationResource.deleteUsmModuleOrganisation(2)).thenThrow(new EntityNotFoundException());
		assertEquals(usmModuleOrganisationResource.deleteUsmModuleOrganisation(2).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	/**
	 * Test negative get all Module.
	 *
	 * @throws JsonProcessingException the json processing exception
	 * @throws UnsupportedEncodingException the unsupported encoding exception
	 */
	@Test
	@Order(2)
	public void testNegativeGetAllModuless() throws JsonProcessingException, UnsupportedEncodingException {
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes()); 
		Mockito.when(usmModuleOrganisationResource.getAllUsmModuleOrganisations(str)).thenThrow(new EntityNotFoundException());
		assertEquals(usmModuleOrganisationResource.getAllUsmModuleOrganisations(str).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	@Test
	@Order(2)
	public void testCreateUserProjectRolesList() {
		List<UsmModuleOrganisationDTO> usmModuleOrganisationList= new ArrayList<UsmModuleOrganisationDTO>();
		UsmModuleOrganisation usmModuleOrganisation = new UsmModuleOrganisation();
		usmModuleOrganisation.setEnddate(null);
		usmModuleOrganisation.setStartdate(null);
		usmModuleOrganisation.setSubscription("test");
		usmModuleOrganisation.setSubscriptionstatus(false);
		UsmModule usmModule= new UsmModule();
		usmModule.setId(2);
		usmModule.setName("test");
		usmModuleOrganisation.setModule(usmModule);
		Project project = new Project();
		project.setId(1);
		project.setName("Test");
		project.setDefaultrole(true);
		project.setDescription("Test Project");
		UsmPortfolio usmPortfolio = new UsmPortfolio();
		usmPortfolio.setId(2);
		usmPortfolio.setPortfolioName("test");
		usmPortfolio.setDescription("test");
		project.setPortfolioId(usmPortfolio);
		usmModuleOrganisation.setOrganisation(project);
		UsmModuleOrganisationDTO usmModuleOrganisationDTO = new UsmModuleOrganisationDTO();
		ModelMapper modelMapper = new ModelMapper();
		usmModuleOrganisationDTO = modelMapper.map(usmModuleOrganisation, UsmModuleOrganisationDTO.class);
		usmModuleOrganisationList.add(0, usmModuleOrganisationDTO);
		try {
			assertEquals(usmModuleOrganisationResource.createListOfUsmModuleOrganisations(usmModuleOrganisationList).getStatusCode(),
					HttpStatus.CREATED);
		} catch (URISyntaxException e) {
			log.error(e.getMessage());
		}
	}
	/**
	 * Test negative delete project.
	 */

	@Test
	@Order(3)
	public void testNegativeDeleteModules() {
		Mockito.when(usmModuleOrganisationResource.deleteUsmModuleOrganisation(2)).thenThrow(new EmptyResultDataAccessException(1));
		assertEquals(usmModuleOrganisationResource.deleteUsmModuleOrganisation(2).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	/**
	 * Test negative get all Module.
	 *
	 * @throws JsonProcessingException the json processing exception
	 * @throws UnsupportedEncodingException the unsupported encoding exception
	 */
	@Test
	@Order(3)
	public void testNegativeGetallModules() throws JsonProcessingException, UnsupportedEncodingException {
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes());
		Mockito.when(usmModuleOrganisationResource.getAllUsmModuleOrganisations(str)).thenThrow(new ArithmeticException());
		assertEquals(usmModuleOrganisationResource.getAllUsmModuleOrganisations(str).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	

}

