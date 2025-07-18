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
import com.infosys.icets.iamp.usm.repository.ContextRepository;

// TODO: Auto-generated Javadoc
/**
 * The Class ContextServiceImplTest.
 *
 * @author icets
 */
class ContextServiceImplTest {
	
	/** The log. */
	private final Logger log = LoggerFactory.getLogger(ContextServiceImplTest.class);

	/** The service. */
	static ContextServiceImpl service;
	
	/** The pageable. */
	static Pageable pageable = null;
	
	/** The req. */
	static PageRequestByExample<Context> req = null;
	
	/** The context. */
	static Context context = new Context();

	/**
	 * Setup.
	 */
	@BeforeAll
	static void setup() {
		ContextRepository contextRepository = Mockito.mock(ContextRepository.class);
		context.setId(2);
		context.setName("test");
		context.setType("Test Type");
		context.setValue("test value");

		Mockito.when(contextRepository.findById(2)).thenReturn(Optional.of(context));
		Mockito.when(contextRepository.save(context)).thenReturn(context);

		Page<Context> contextPage = new PageImpl<>(Collections.singletonList(context));
		req = new PageRequestByExample<Context>();
		pageable = PageRequest.of(0, 1);
		ExampleMatcher matcher = ExampleMatcher.matching() //
                .withMatcher("name", match -> match.ignoreCase().startsWith())
                .withMatcher("type", match -> match.ignoreCase().startsWith())
                .withMatcher("value", match -> match.ignoreCase().startsWith());
		Example<Context> example = Example.of(context,matcher);
		req.setExample(context);
		Mockito.when(contextRepository.findAll(example,req.toPageable())).thenReturn(contextPage);
		Mockito.when(contextRepository.findAll(req.toPageable())).thenReturn(contextPage);
		Mockito.when(contextRepository.findAll(pageable)).thenReturn(contextPage);

		service = new ContextServiceImpl(contextRepository);

	}

	/**
	 * Test find by id.
	 */
	@Test
	void testFindById() {
		assertEquals(service.getOne(2).getId(), 2);
	}

	/**
	 * Test save.
	 */
	@Test
	void testSave() {
		Context context = new Context();
		context.setId(2);
		context.setName("test");
		context.setType("Test Type");
		context.setValue("Test value");
		assertEquals(service.save(context).getName(), "test");

	}

	/**
	 * Test delete by id.
	 */
	@Test
	void testDeleteById() {
		Context context = new Context();
		context.setId(2);
		service.deleteById(context.getId());
		assertEquals(service.getOne(2).getId(), 2);
	}

	/**
	 * Test find all.
	 *
	 * @throws SQLException the SQL exception
	 */
	@Test
	void testFindAll() throws SQLException {
		Page<Context> contextlist = service.findAll(pageable);
		assertEquals(contextlist.getTotalElements(), 1);
	}

	/**
	 * Test get all.
	 *
	 * @throws SQLException the SQL exception
	 */
	@Test
	void testGetAll() throws SQLException {
		PageResponse<Context> contextlist = service.getAll(req);
		assertEquals(contextlist.getTotalElements(), 1);
	}

}
