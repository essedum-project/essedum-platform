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
import java.time.ZonedDateTime;
import java.util.Base64;
import java.util.Collections;
import java.util.Optional;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.mockito.Mockito;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.iamp.usm.domain.UsmNotifications;
import com.infosys.icets.iamp.usm.dto.UsmNotificationsDTO;
import com.infosys.icets.iamp.usm.repository.UsmNotificationsRepository;
import com.infosys.icets.iamp.usm.service.impl.UsmNotificationsServiceImpl;
// TODO: Auto-generated Javadoc

/**
 * The Class UsmNotificationsResourceTest.
 *
 * @author icets
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class UsmNotificationsResourceTest {
	
	/** The usm notifications resource. */
	static UsmNotificationsResource usmNotificationsResource;
	
	/** The pageable. */
	static Pageable pageable=null;
	
	/** The req. */
	static PageRequestByExample<UsmNotifications> req = null;
	
	/** The usm notifications. */
	static UsmNotifications usmNotifications = new UsmNotifications();
	/** */
	ObjectMapper Obj = new ObjectMapper();

	/**
	 * Setup.
	 */
	@BeforeAll
	static void setup() {
		UsmNotificationsRepository usmNotificationsRepository = Mockito.mock(UsmNotificationsRepository.class);	
		usmNotifications.setId(2);
		usmNotifications.setMessage("test");
		usmNotifications.setReadFlag(true);
		usmNotifications.setSeverity("test");
		usmNotifications.setSource("test");
		usmNotifications.setDateTime(ZonedDateTime.now());
		usmNotifications.setUserId("1");
		Mockito.when(usmNotificationsRepository.findById(2)).thenReturn(Optional.of(usmNotifications));
		Mockito.when(usmNotificationsRepository.save(usmNotifications)).thenReturn(usmNotifications);
		Page<UsmNotifications> usmNotificationsPage = new PageImpl<>(Collections.singletonList(usmNotifications));
		pageable = PageRequest.of(0, 1);
		req = new PageRequestByExample<UsmNotifications>();
		Mockito.when(usmNotificationsRepository.findAll(req.toPageable())).thenReturn(usmNotificationsPage);
		UsmNotificationsServiceImpl usmNotificationsService = new UsmNotificationsServiceImpl(usmNotificationsRepository);
		usmNotificationsResource = new UsmNotificationsResource(usmNotificationsService);
		
		
	}
	
	/**
	 * Test update usm notifications.
	 */
	@Test
	@Order(1)
	public void testUpdateUsmNotifications() {
		UsmNotificationsDTO usmNotificationsDTO = new UsmNotificationsDTO();
		ModelMapper modelMapper = new ModelMapper();
		usmNotificationsDTO = modelMapper.map(usmNotifications, UsmNotificationsDTO.class);
		try {
			assertEquals(usmNotificationsResource.updateUsmNotifications(usmNotificationsDTO).getStatusCode(),
					HttpStatus.OK);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
		
	}
	
	/**
	 * Test get all usm notifications.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 * @throws JsonMappingException 
	 */
	@Test
	@Order(1)
	public void testGetAllUsmNotifications() throws JsonMappingException, UnsupportedEncodingException, JsonProcessingException {
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes());
		assertEquals(usmNotificationsResource.getAllUsmNotificationss(str).getStatusCode(), HttpStatus.OK);
	}


}
