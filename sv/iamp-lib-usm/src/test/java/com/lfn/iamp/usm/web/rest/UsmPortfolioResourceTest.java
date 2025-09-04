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

package com.lfn.iamp.usm.web.rest;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.io.UnsupportedEncodingException;
import java.net.URISyntaxException;
import java.time.ZonedDateTime;
import java.util.Base64;
import java.util.Collections;
import java.util.Optional;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lfn.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.lfn.iamp.usm.domain.UsmPortfolio;
import com.lfn.iamp.usm.dto.UsmPortfolioDTO;
import com.lfn.iamp.usm.repository.UsmPortfolioRepository;
import com.lfn.iamp.usm.service.impl.UsmPortfolioServiceImpl;

// TODO: Auto-generated Javadoc
/**
 * The Class UsmPortfolioResourceTest.
 *
 * @author essedum
 */
public class UsmPortfolioResourceTest {
	
	/** The usm portfolio resource. */
	static UsmPortfolioResource usmPortfolioResource;
	
	/** The pageable. */
	static Pageable pageable = null;
	
	/** The req. */
	static PageRequestByExample<UsmPortfolio> req = null;
	
	/** The usm portfolio. */
	static UsmPortfolio usmPortfolio = new UsmPortfolio();
	/** */
	ObjectMapper Obj = new ObjectMapper();

	/**
	 * Setup.
	 */
	@BeforeAll
	static void setup() {
		UsmPortfolioRepository usmPortfolioRepository = Mockito.mock(UsmPortfolioRepository.class);
		usmPortfolio.setId(2);
		usmPortfolio.setPortfolioName("test");
		usmPortfolio.setDescription("test description");
		usmPortfolio.setLastUpdated(ZonedDateTime.now());
		Mockito.when(usmPortfolioRepository.findById(2)).thenReturn(Optional.of(usmPortfolio));
		Mockito.when(usmPortfolioRepository.save(usmPortfolio)).thenReturn(usmPortfolio);
		Page<UsmPortfolio> usmPortfolioPage = new PageImpl<>(Collections.singletonList(usmPortfolio));
		pageable = PageRequest.of(0, 1);
		Mockito.when(usmPortfolioRepository.findAll(pageable)).thenReturn(usmPortfolioPage);
		req = new PageRequestByExample<UsmPortfolio>();
		ExampleMatcher matcher = ExampleMatcher.matching() //
				.withMatcher("portfolioName", match -> match.ignoreCase().startsWith())
				.withMatcher("description", match -> match.ignoreCase().startsWith());
		Example<UsmPortfolio> example = Example.of(usmPortfolio, matcher);
		req.setExample(usmPortfolio);
		Mockito.when(usmPortfolioRepository.findAll(example, req.toPageable())).thenReturn(usmPortfolioPage);
		Mockito.when(usmPortfolioRepository.findAll(req.toPageable())).thenReturn(usmPortfolioPage);

		UsmPortfolioServiceImpl usmPortfolioService = new UsmPortfolioServiceImpl(usmPortfolioRepository);

		usmPortfolioResource = new UsmPortfolioResource(usmPortfolioService);
	}

	/**
	 * Test negative create usm portfolio.
	 */
	@Test
	public void testNegativeCreateUsmPortfolio() {
		try {			
			assertEquals(usmPortfolioResource.createUsmPortfolio(new ModelMapper().map(usmPortfolio,UsmPortfolioDTO.class)).getStatusCode(), HttpStatus.BAD_REQUEST);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}

	/**
	 * Test update usm portfolio.
	 */
	@Test
	public void testUpdateUsmPortfolio() {
	
		try {
			assertEquals(usmPortfolioResource.updateUsmPortfolio(new ModelMapper().map(usmPortfolio,UsmPortfolioDTO.class)).getStatusCode(), HttpStatus.OK);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}

	/**
	 * Test get all usm portfolio.
	 */
	@Test
	public void testGetAllUsmPortfolio() {
		assertEquals(usmPortfolioResource.getAllUsmPortfolios(pageable).getStatusCode(), HttpStatus.OK);
	}

	/**
	 * Test get usm portfolio.
	 */
	@Test
	public void testGetUsmPortfolio() {
		assertEquals(usmPortfolioResource.getUsmPortfolio(2).getStatusCode(), HttpStatus.OK);
	}

	/**
	 * Test delete usm portfolio.
	 */
	@Test
	public void testDeleteUsmPortfolio() {
		assertEquals(usmPortfolioResource.deleteUsmPortfolio(2).getStatusCode(), HttpStatus.OK);
	}
	
	/**
	 * Test get all portfolios.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 */
	@Test
	@Order(1)
	public void testGetAllPortfolios() throws JsonProcessingException, UnsupportedEncodingException {
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes());
		assertEquals(usmPortfolioResource.getAllUsmPortfolios(str).getStatusCode(), HttpStatus.OK);
	}
	/**
	 * Test get all Portfolios.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 * @throws JsonMappingException 
	 */
	@Test
	@Order(1)
	public void testFetchAllPortfolios() throws JsonProcessingException, UnsupportedEncodingException {
		pageable = PageRequest.of(0, 1);
		assertEquals(usmPortfolioResource.getPaginatedUsmPortfolioList(pageable).getStatusCode(), HttpStatus.OK);
	}
	
	/**
	 * Test  Search Portfolios.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 * @throws URISyntaxException 
	 * @throws JsonMappingException 
	 */
	@Test
	@Order(1)
	public void testSearchPortfolios() throws JsonProcessingException, UnsupportedEncodingException, URISyntaxException {
		pageable = PageRequest.of(0, 1);
		req = new PageRequestByExample<UsmPortfolio>();
		assertEquals(usmPortfolioResource.searchUsmPortfolios(pageable, req).getStatusCode(), HttpStatus.OK);
	}
	
	/**
	 * Test Search Portfolioss.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 * @throws URISyntaxException 
	 * @throws JsonMappingException 
	 */
	@Test
	@Order(1)
	public void testSearchPortfolioss() throws JsonProcessingException, UnsupportedEncodingException, URISyntaxException {
		pageable = PageRequest.of(0, 1);
		PageRequestByExample<UsmPortfolio> req = new PageRequestByExample<UsmPortfolio>();
		assertEquals(usmPortfolioResource.searchUsmPortfolios(pageable, req).getStatusCode(), HttpStatus.OK);
	}
	

}
