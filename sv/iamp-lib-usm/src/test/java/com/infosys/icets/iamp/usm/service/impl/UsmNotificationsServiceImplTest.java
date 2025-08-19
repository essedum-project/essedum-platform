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
import java.time.ZonedDateTime;
import java.util.Collections;

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
//import org.springframework.test.util.ReflectionTestUtils;

import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.domain.UsmNotifications;
import com.infosys.icets.iamp.usm.dto.UsmNotificationsDTO;
import com.infosys.icets.iamp.usm.repository.UsmNotificationsRepository;



// TODO: Auto-generated Javadoc
/**
 * The Class UsmNotificationsServiceImplTest.
 *
 * @author icets
 */
public class UsmNotificationsServiceImplTest {	
	
	/** The log. */
	private final Logger log = LoggerFactory.getLogger(UsmNotificationsServiceImplTest.class);

	/** The service. */
	static UsmNotificationsServiceImpl service;
	
	/** The pageable. */
	static Pageable pageable=null;
	
	/** The req. */
	static PageRequestByExample<UsmNotifications> req = null;
	
	/** The usm notifications. */
	static UsmNotifications usmNotifications = new UsmNotifications();

	/** The id. */
	static int id =2;
	
	/**
	 * Setup.
	 */
	@BeforeAll
	static void setup() {
		UsmNotificationsRepository usmNotificationsRepository = Mockito.mock(UsmNotificationsRepository.class);	
		usmNotifications.setMessage("test");
		usmNotifications.setReadFlag(true);
		usmNotifications.setSeverity("test");
		usmNotifications.setSource("test");
		usmNotifications.setDateTime(ZonedDateTime.now());
		usmNotifications.setId(id);
		Mockito.when(usmNotificationsRepository.save(usmNotifications)).thenReturn(usmNotifications);
		Page<UsmNotifications> usmNotificationsPage = new PageImpl<>(Collections.singletonList(usmNotifications));
		pageable = PageRequest.of(0, 1);
		req = new PageRequestByExample<UsmNotifications>();
		ExampleMatcher matcher = ExampleMatcher.matching() //
                .withMatcher("userId", match -> match.ignoreCase().startsWith())
                .withMatcher("severity", match -> match.ignoreCase().startsWith())
                .withMatcher("source", match -> match.ignoreCase().startsWith())
                .withMatcher("message", match -> match.ignoreCase().startsWith());
		Example<UsmNotifications> example = Example.of(usmNotifications,matcher);
		req.setExample(usmNotifications);
		Mockito.when(usmNotificationsRepository.findAll(example,req.toPageable())).thenReturn(usmNotificationsPage);
		Mockito.when(usmNotificationsRepository.findAll(req.toPageable())).thenReturn(usmNotificationsPage);
		service = new UsmNotificationsServiceImpl(usmNotificationsRepository);
		
		
	}
	
	/**
	 * Test save usm notifications.
	 */
	@Test
	void testSaveUsmNotifications() {
		UsmNotifications usmNotifications1 =service.save(usmNotifications);
		assertEquals(usmNotifications1.getId(),2);
		 
	}
	
	/**
	 * Test get all.
	 *
	 * @throws SQLException the SQL exception
	 */
	@Test
	void testGetAll() throws SQLException {

		PageResponse<UsmNotificationsDTO> usmNotificationslist = service.getAll(req);
		assertEquals(usmNotificationslist.getTotalElements(), 1);
	}
}
