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
