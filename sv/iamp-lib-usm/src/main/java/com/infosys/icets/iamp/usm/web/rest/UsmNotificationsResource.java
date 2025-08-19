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

import java.io.UnsupportedEncodingException;
import java.net.URISyntaxException;
import java.sql.SQLException;
import java.util.Base64;

import jakarta.persistence.EntityNotFoundException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infosys.icets.ai.comm.lib.util.HeaderUtil;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.iamp.usm.config.Constants;
import com.infosys.icets.iamp.usm.config.Messages;
import com.infosys.icets.iamp.usm.domain.UsmNotifications;
import com.infosys.icets.iamp.usm.dto.UsmNotificationsDTO;
import com.infosys.icets.iamp.usm.service.UsmNotificationsService;

import io.micrometer.core.annotation.Timed;

// TODO: Auto-generated Javadoc
/**
 * REST controller for managing UsmNotifications.
 */
/**
 * @author icets
 */
@RestController
@RequestMapping("/api")
public class UsmNotificationsResource {

	/** The log. */
	private final Logger log = LoggerFactory.getLogger(UsmNotificationsResource.class);

	/** The Constant ENTITY_NAME. */
	private static final String ENTITY_NAME = "usm_notifications";

	/** The usm notifications service. */
	private final UsmNotificationsService usm_notificationsService;

	/**
	 * Instantiates a new usm notifications resource.
	 *
	 * @param usm_notificationsService the usm notifications service
	 */
	public UsmNotificationsResource(UsmNotificationsService usm_notificationsService) {
		this.usm_notificationsService = usm_notificationsService;
	}

	/**
	 * POST /usm-notificationss/page : get all the usm_notificationss.
	 *
	 * @param value the value
	 * @return the ResponseEntity with status 200 (OK) and the list of
	 *         usm_notificationss in body as PageResponse
	 * @throws UnsupportedEncodingException the unsupported encoding exception
	 * @throws JsonMappingException the json mapping exception
	 * @throws JsonProcessingException the json processing exception
	 */
	@GetMapping("/usm-notificationss/page")
	@Timed
	public ResponseEntity<?> getAllUsmNotificationss(
			@RequestHeader("example") String value)
			throws UnsupportedEncodingException, JsonMappingException, JsonProcessingException {
		try {
		log.debug("REST request to get a page of usm-notificationss");
		ObjectMapper objectMapper = new ObjectMapper();
		String body = new String(Base64.getDecoder().decode(value), "UTF-8");
		PageRequestByExample<UsmNotifications> prbe = objectMapper.readValue(body,
				new TypeReference<PageRequestByExample<UsmNotifications>>() {
				});
		return new ResponseEntity<>(usm_notificationsService.getAll(prbe), new HttpHeaders(), HttpStatus.OK);
		}
		catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (ArithmeticException e) {
			// TODO: handle exception
			log.error(new StringBuffer("ArithmeticException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_LAZY_LOAD_EVENT), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * PUT /usm-notificationss : Updates an existing usm_notifications.
	 *
	 * @param usm_notifications_dto the usm notifications dto
	 * @return the ResponseEntity with status 200 (OK) and with body the updated
	 *         usm_notifications, or with status 400 (Bad Request) if the
	 *         usm_notifications is not valid, or with status 500 (Internal Server
	 *         Error) if the usm_notifications couldn't be updated
	 * @throws URISyntaxException if the Location URI syntax is incorrect
	 */
	@PutMapping("/usm-notificationss")
	@Timed
	public ResponseEntity<?> updateUsmNotifications(@RequestBody UsmNotificationsDTO usm_notifications_dto)
			throws URISyntaxException {
		log.info("REST request to update UsmNotifications : {}", usm_notifications_dto);
		if (usm_notifications_dto.getId() == null) {
			log.error("updateUsmNotifications: id is empty");
			return new ResponseEntity<String>("Role entity constraint violated", new HttpHeaders(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
		UsmNotifications result = usm_notificationsService.save(usm_notifications_dto);
		return ResponseEntity.ok().headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, result.getId().toString()))
				.body(result);
	}

	/**
	 * Save usm notifications.
	 *
	 * @param usm_notifications_dto the usm notifications dto
	 * @return the response entity
	 * @throws URISyntaxException the URI syntax exception
	 */
	@PostMapping("/usm-notificationss")
	@Timed
	public ResponseEntity<?> saveUsmNotifications(@RequestBody UsmNotificationsDTO usm_notifications_dto)
			throws URISyntaxException {
		log.info("REST request to save UsmNotifications : {}", usm_notifications_dto);
		if (usm_notifications_dto.getId() != null) {
			log.error("updateUsmNotifications: id is not empty");
			return new ResponseEntity<String>("Role entity constraint violated", new HttpHeaders(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
		UsmNotifications result = usm_notificationsService.save(usm_notifications_dto);
		return ResponseEntity.ok().headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, result.getId().toString()))
				.body(result);
	}
}
