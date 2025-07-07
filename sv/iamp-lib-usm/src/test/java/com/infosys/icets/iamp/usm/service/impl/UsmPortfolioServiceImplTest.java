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
import java.time.ZonedDateTime;
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
import com.infosys.icets.iamp.usm.domain.UsmPortfolio;
import com.infosys.icets.iamp.usm.repository.UsmPortfolioRepository;

// TODO: Auto-generated Javadoc
/**
 * The Class UsmPortfolioServiceImplTest.
 *
 * @author icets
 */
public class UsmPortfolioServiceImplTest {
	
	/** The log. */
	private final Logger log = LoggerFactory.getLogger(UsmPortfolioServiceImplTest.class);

	/** The service. */
	static UsmPortfolioServiceImpl service;
	
	/** The pageable. */
	static Pageable pageable = null;
	
	/** The req. */
	static PageRequestByExample<UsmPortfolio> req = null;
	
	/** The usm portfolio. */
	static UsmPortfolio usmPortfolio = new UsmPortfolio();

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
		req = new PageRequestByExample<UsmPortfolio>();
		ExampleMatcher matcher = ExampleMatcher.matching() //
                .withMatcher("portfolioName", match -> match.ignoreCase().startsWith())
                .withMatcher("description", match -> match.ignoreCase().startsWith());
		Example<UsmPortfolio> example = Example.of(usmPortfolio,matcher);
		req.setExample(usmPortfolio);
		Mockito.when(usmPortfolioRepository.findAll(example,req.toPageable())).thenReturn(usmPortfolioPage);
		Mockito.when(usmPortfolioRepository.findAll(req.toPageable())).thenReturn(usmPortfolioPage);
		Mockito.when(usmPortfolioRepository.findAll(pageable)).thenReturn(usmPortfolioPage);
		service = new UsmPortfolioServiceImpl(usmPortfolioRepository);

	}

	/**
	 * Test find by id.
	 */
	@Test
	void testFindById() {
		assertEquals(service.findOne(2).getId(), 2);

	}

	/**
	 * Test save.
	 */
	@Test
	void testSave() {

		assertEquals(service.save(usmPortfolio).getPortfolioName(), "test");

	}

	/**
	 * Test delete by id.
	 */
	@Test
	void testDeleteById() {
		UsmPortfolio usmPortfolio = new UsmPortfolio();
		usmPortfolio.setId(2);

		service.delete(usmPortfolio.getId());
		assertEquals(service.findOne(2).getId(), 2);
	}

	/**
	 * Test find all.
	 *
	 * @throws SQLException the SQL exception
	 */
	@Test
	void testFindAll() throws SQLException {
		Page<UsmPortfolio> usmPortfoliolist = service.findAll(pageable);
		assertEquals(usmPortfoliolist.getTotalElements(), 1);
	}
	
	/**
	 * Test get all.
	 *
	 * @throws SQLException the SQL exception
	 */
	@Test
	void testGetAll() throws SQLException {
		PageResponse<UsmPortfolio> usmPortfoliolist = service.getAll(req);
		assertEquals(usmPortfoliolist.getTotalElements(), 1);
	}
}
