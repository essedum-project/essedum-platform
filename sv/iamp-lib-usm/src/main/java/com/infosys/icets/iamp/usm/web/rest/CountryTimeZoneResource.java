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
import java.net.URI;
import java.net.URISyntaxException;
import java.sql.SQLException;
import java.util.Base64;

import jakarta.persistence.EntityNotFoundException;

import org.hibernate.exception.ConstraintViolationException;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infosys.icets.ai.comm.lib.util.HeaderUtil;
import com.infosys.icets.ai.comm.lib.util.PaginationUtil;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.config.Constants;
import com.infosys.icets.iamp.usm.config.Messages;
import com.infosys.icets.iamp.usm.domain.CountryTimeZone;
import com.infosys.icets.iamp.usm.dto.CountryTimeZoneDTO;
import com.infosys.icets.iamp.usm.service.CountryTimeZoneService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Parameter;

@RestController
@Hidden
@RequestMapping("/api")
public class CountryTimeZoneResource {
	
	private final Logger log = LoggerFactory.getLogger(CountryTimeZoneResource.class);
	
	private static final String ENTITY_NAME = "CountryTimeZone";
	
	@Autowired
	private CountryTimeZoneService countryTimeZoneService;
	
	@GetMapping("/countryTimeZones/page")
	@Timed
	public ResponseEntity<?> getAllCountryTimeZones(@RequestHeader(value = "example") String requestkey)
			throws UnsupportedEncodingException, JsonMappingException, JsonProcessingException {
		log.info("getAllCountryTimeZones : REST request to get a page of CountryTimeZones");
		try {

			String decodedvalue = new String(Base64.getDecoder().decode(requestkey), "UTF-8");
			ObjectMapper objectMapper = new ObjectMapper();
			objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
			PageRequestByExample<CountryTimeZone> prbe = objectMapper.readValue(decodedvalue,
					new TypeReference<PageRequestByExample<CountryTimeZone>>() {
					});
			if (prbe.getLazyLoadEvent() == null) {
				return new ResponseEntity<String>("Please provide lazy load event", new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			}

			PageResponse<CountryTimeZone> pageResponse = countryTimeZoneService.getAll(prbe);
			log.info("getAllCountryTimeZones : Page of CountryTimeZones fetched successfully");
			return new ResponseEntity<>(pageResponse, new HttpHeaders(), HttpStatus.OK);
		} catch (SQLException | EntityNotFoundException e) {
			log.error(new StringBuffer("Exception ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (ArithmeticException e) {
			log.error(new StringBuffer("ArithmeticException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_LAZY_LOAD_EVENT), new HttpHeaders(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	@PostMapping("/countryTimeZone")
	@Timed
	public ResponseEntity<?> createCountryTimeZone(@RequestBody CountryTimeZoneDTO countryTimeZoneDTO) throws URISyntaxException {
		try {
			log.info("createCountryTimeZone : REST request to save CountryTimeZone with Id: {}", countryTimeZoneDTO.getId());
			log.debug("REST request to save CountryTimeZone : {}", countryTimeZoneDTO);
			if (countryTimeZoneDTO.getId() != null) {
				return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "Id exists",
						"A new CountryTimeZone cannot already have an Id")).body(null);
			}
			ModelMapper modelMapper = new ModelMapper();
			CountryTimeZone countryTimeZone = modelMapper.map(countryTimeZoneDTO, CountryTimeZone.class);
			CountryTimeZone result = countryTimeZoneService.save(countryTimeZone);
			if (result == null) {
				return new ResponseEntity<String>("CountryTimeZone could not be created", new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			} else
				log.info("createCountryTimeZone : CountryTimeZone saved successfully with ID: {}", result.getId()
						);
			return ResponseEntity.created(new URI(new StringBuffer("/api/countryTimeZone/").append(result.getId()).toString()))
					.headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString())).body(result);

		} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException e) {
			log.error(new StringBuffer("Exception ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "CountryTimeZone"), new HttpHeaders(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	@PutMapping("/countryTimeZone")
	@Timed
	public ResponseEntity<?> updateCountryTimeZone(@RequestBody CountryTimeZoneDTO countryTimeZoneDTO) throws URISyntaxException {
		try {
			log.info("updateCountryTimeZone : REST request to update CountryTimeZone for ID: {} ", countryTimeZoneDTO.getId());
			log.debug("REST request to update CountryTimeZone : {}", countryTimeZoneDTO);
			if (countryTimeZoneDTO.getId() == null) {
				return createCountryTimeZone(countryTimeZoneDTO);
			}
			ModelMapper modelMapper = new ModelMapper();
			CountryTimeZone countryTimeZone = modelMapper.map(countryTimeZoneDTO, CountryTimeZone.class);
			CountryTimeZone result = countryTimeZoneService.save(countryTimeZone);
			if (result == null) {
				return new ResponseEntity<String>("CountryTimeZone could not be updated", new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			} else
				log.info("updateCountryTimeZone : CountryTimeZone Updated successfully for ID: {} ", result.getId());
			return ResponseEntity.ok()
					.headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, countryTimeZone.getId().toString())).body(result);

		} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException
				| EntityNotFoundException e) {
			log.error(new StringBuffer("Exception ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "CountryTimeZone"), new HttpHeaders(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	
	@GetMapping("/countryTimeZones")
	@Timed
	public ResponseEntity<?> getAllCountryTimeZones(@Parameter Pageable pageable) {
		try {
			log.info("getAllCountryTimeZones : REST request to get a page of CountryTimeZones");
			log.debug("REST request to get a page of CountryTimeZones");
			Page<CountryTimeZone> page = countryTimeZoneService.findAll(pageable);
			HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/countryTimeZones");
			log.info("getAllCountryTimeZones : Page of CountryTimeZones fetched successfully");
			return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
		} catch (SQLException | EntityNotFoundException e) {
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	@GetMapping("/countryTimeZone/{id}")
	@Timed
	public ResponseEntity<?> getCountryTimeZone(@PathVariable Integer id) {
		try {
			log.info("getCountryTimeZone : REST request to get CountryTimeZone by ID: {} ", id);
			log.debug("REST request to get CountryTimeZone : {}", id);
			CountryTimeZone countryTimeZone = countryTimeZoneService.findOne(id);

			if (countryTimeZone == null) {
				return new ResponseEntity<String>(new StringBuffer("CountryTimeZone entity with id ").append(id).append(" does not exists!").toString(),
						new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
			} else
				log.info("getCountryTimeZone : REST request to get CountryTimeZone successfull for ID: {} ", countryTimeZone.getId());
			return new ResponseEntity<>(countryTimeZone, new HttpHeaders(), HttpStatus.OK);

		} catch (SQLException | ArithmeticException e) {
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@DeleteMapping("/countryTimeZone/{id}")
	@Timed
	public ResponseEntity<?> deleteCountryTimeZone(@PathVariable Integer id) {
		try {
			log.info("deleteCountryTimeZone : REST request to delete CountryTimeZone by ID: {} ", id);
			log.debug("REST request to delete CountryTimeZone : {}", id);
			countryTimeZoneService.delete(id);
			log.info("deleteCountryTimeZone : CountryTimeZone deleted successfully by ID: {} ", id);
			return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString()))
					.build();

		} catch (EmptyResultDataAccessException e) {
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(new StringBuffer("CountryTimeZone entity with id ").append(id).append(" does not exists!").toString(), 
					new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (SQLException e) {
			log.error(new StringBuffer("Exception ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}
}
