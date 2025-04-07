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
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.iamp.usm.domain.UsmModule;
import com.infosys.icets.iamp.usm.dto.UsmModuleDTO;
import com.infosys.icets.iamp.usm.repository.UsmModuleRepository;
import com.infosys.icets.iamp.usm.service.impl.UsmModuleServiceImpl;

// TODO: Auto-generated Javadoc
/**
 * The Class UsmModuleResourceTest.
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class UsmModuleResourceTest {
	/** The usmModule. */
	static UsmModuleResource usmModuleResource;
	
	/** The pageable. */
	static Pageable pageable = null;
	
	/** The req. */
	static PageRequestByExample<UsmModule> req = null;
	
	/** The usmModule. */
	static UsmModule usmModule = new UsmModule();
	
	/** The Obj. */
	ObjectMapper Obj = new ObjectMapper();

	/**
	 * Setup.
	 */
	@BeforeAll
	static void setup() {
		UsmModuleRepository usmModuleRepository = Mockito.mock(UsmModuleRepository.class);
		usmModule.setId(2);
		usmModule.setName("test");
		Mockito.when(usmModuleRepository.findById(2)).thenReturn(Optional.of(usmModule));
		Mockito.when(usmModuleRepository.save(usmModule)).thenReturn(usmModule);
		Page<UsmModule> usmModulePage = new PageImpl<>(Collections.singletonList(usmModule));
		pageable = PageRequest.of(0, 1);
		Mockito.when(usmModuleRepository.findAll(pageable)).thenReturn(usmModulePage);
		req = new PageRequestByExample<UsmModule>();
		Mockito.when(usmModuleRepository.findAll(req.toPageable())).thenReturn(usmModulePage);

		UsmModuleServiceImpl usmModuleService = new UsmModuleServiceImpl(usmModuleRepository);

		usmModuleResource = new UsmModuleResource(usmModuleService);
	}

	/**
	 * Test negative create usm portfolio.
	 */
	@Test
	@Order(1)
	public void testNegativeCreateUsmModule() {
		try {			
			assertEquals(usmModuleResource.createUsmModule(new ModelMapper().map(usmModule,UsmModuleDTO.class)).getStatusCode(), HttpStatus.BAD_REQUEST);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
	/**
	 * Test negative create project.
	 */
	@Test
	@Order(1)
	public void testErrorCreateUsmModule() {
		UsmModule usmModule = new UsmModule();
		usmModule.setName("test");
		UsmModuleDTO usmModuleDTO = new UsmModuleDTO();
		ModelMapper modelMapper = new ModelMapper();
		usmModuleDTO = modelMapper.map(usmModule, UsmModuleDTO.class);
		try {
			Mockito.when(usmModuleResource.createUsmModule(usmModuleDTO))
			.thenThrow(new DataIntegrityViolationException(null));
			assertEquals(usmModuleResource.createUsmModule(usmModuleDTO).getStatusCode(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
	/**
	 * Test update usm Module.
	 */
	@Test
	@Order(1)
	public void testUpdateUsmModule() {
	
		try {
			assertEquals(usmModuleResource.updateUsmModule(new ModelMapper().map(usmModule,UsmModuleDTO.class)).getStatusCode(), HttpStatus.OK);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}

	/**
	 * Test get all usm Module.
	 */
	@Test
	@Order(1)
	public void testGetAllUsmModules() {
		assertEquals(usmModuleResource.getAllUsmModules(pageable).getStatusCode(), HttpStatus.OK);
	}

	/**
	 * Test get usm Module.
	 */
	@Test
	public void testGetUsmModule() {
		assertEquals(usmModuleResource.getUsmModule(2).getStatusCode(), HttpStatus.OK);
	}

	/**
	 * Test delete usm Module.
	 */
	@Test
	@Order(1)
	public void testDeleteUsmModule() {
		assertEquals(usmModuleResource.deleteUsmModule(2).getStatusCode(), HttpStatus.OK);
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
		assertEquals(usmModuleResource.getAllUsmModules(str).getStatusCode(), HttpStatus.OK);
	}
	
	/**
	 * Test negative get Module.
	 */
	@Test
	@Order(2)
	public void testNegativeGetUsmModule() {
		Mockito.when(usmModuleResource.getUsmModule(1)).thenThrow(new EntityNotFoundException());
		assertEquals(usmModuleResource.getUsmModule(1).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	/**
	 * Test negative update Module exception.
	 */
	@Test
	@Order(2)
	public void testNegativeUpdateModuleException() {
		UsmModuleDTO usmModuleDTO = new UsmModuleDTO();
		ModelMapper modelMapper = new ModelMapper();
		usmModuleDTO = modelMapper.map(usmModule, UsmModuleDTO.class);
		try {
			Mockito.when(usmModuleResource.updateUsmModule(usmModuleDTO)).thenThrow(new EntityNotFoundException());
			assertEquals(usmModuleResource.updateUsmModule(usmModuleDTO).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * Test negative get all Module.
	 */
	@Test
	@Order(2)
	public void testNegativeGetAllModules() {
		Mockito.when(usmModuleResource.getAllUsmModules(pageable)).thenThrow(new EntityNotFoundException());
		assertEquals(usmModuleResource.getAllUsmModules(pageable).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	/**
	 * Test negative delete Module.
	 */
	@Test
	@Order(2)
	public void testNegativeDeleteModule() {
		Mockito.when(usmModuleResource.deleteUsmModule(2)).thenThrow(new EntityNotFoundException());
		assertEquals(usmModuleResource.deleteUsmModule(2).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
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
		Mockito.when(usmModuleResource.getAllUsmModules(str)).thenThrow(new EntityNotFoundException());
		assertEquals(usmModuleResource.getAllUsmModules(str).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	/**
	 * Test negative delete project.
	 */

	@Test
	@Order(3)
	public void testNegativeDeleteModules() {
		Mockito.when(usmModuleResource.deleteUsmModule(2)).thenThrow(new EmptyResultDataAccessException(1));
		assertEquals(usmModuleResource.deleteUsmModule(2).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
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
		Mockito.when(usmModuleResource.getAllUsmModules(str)).thenThrow(new ArithmeticException());
		assertEquals(usmModuleResource.getAllUsmModules(str).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	

}

