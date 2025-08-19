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
import jakarta.validation.ConstraintViolationException;

import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infosys.icets.ai.comm.lib.util.HeaderUtil;
import com.infosys.icets.ai.comm.lib.util.PaginationUtil;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.iamp.usm.config.Constants;
import com.infosys.icets.iamp.usm.config.Messages;
import com.infosys.icets.iamp.usm.domain.OrgUnit;
import com.infosys.icets.iamp.usm.dto.OrgUnitDTO;
import com.infosys.icets.iamp.usm.service.OrgUnitService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.tags.Tag;

// TODO: Auto-generated Javadoc
/**
 * REST controller for managing OrgUnit.
 */
/**
* @author icets
*/
@RestController
@RequestMapping("/api")
@Tag(name= "User Management", description = "User Management")
public class OrgUnitResource {

	/** The log. */
	private final Logger log = LoggerFactory.getLogger(OrgUnitResource.class);

	/** The Constant ENTITY_NAME. */
	private static final String ENTITY_NAME = "org_unit";

	/** The org unit service. */
	private final OrgUnitService orgUnitService;

	/**
	 * Instantiates a new org unit resource.
	 *
	 * @param orgUnitService the org unit service
	 */
	public OrgUnitResource(OrgUnitService orgUnitService) {
		this.orgUnitService = orgUnitService;
	}

	/**
	 * POST /org-units/page : get all the org_units.
	 *
	 * @param value the value
	 * @return the ResponseEntity with status 200 (OK) and the list of org_units in
	 *         body as PageResponse
	 * @throws UnsupportedEncodingException the unsupported encoding exception
	 * @throws JsonMappingException the json mapping exception
	 * @throws JsonProcessingException the json processing exception
	 */
	@GetMapping("/org-units/page")
	@Timed
	public ResponseEntity<?> getAllOrgUnits(@RequestHeader("example") String value) throws UnsupportedEncodingException, JsonMappingException, JsonProcessingException {
		try {
			log.info("getAllOrgUnits : Request to get list of OrgUnits");
//			if(prbe.getLazyLoadEvent() ==  null) {
//				return new ResponseEntity<String>("Please provide lazy load event", new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
//			}
			ObjectMapper objectMapper = new ObjectMapper();
			String body = new String(Base64.getDecoder().decode(value), "UTF-8");
			PageRequestByExample<OrgUnit> prbe = objectMapper.readValue(body, new TypeReference<PageRequestByExample<OrgUnit>>() {
			});	
			log.info("getAllOrgUnits : Fetched list of OrgUnits successfully");
			return new ResponseEntity<>(orgUnitService.getAll(prbe), new HttpHeaders(), HttpStatus.OK);

		} catch (SQLException | EntityNotFoundException e) {
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
	 * POST /org-units : Create a new org_unit.
	 *
	 * @param orgUnit_dto the org unit dto
	 * @return the ResponseEntity with status 201 (Created) and with body the new
	 *         org_unit, or with status 400 (Bad Request) if the org_unit has
	 *         already an ID
	 * @throws URISyntaxException if the Location URI syntax is incorrect
	 */
	@PostMapping("/org-units")
	@Timed
	public ResponseEntity<?> createOrgUnit(@RequestBody OrgUnitDTO orgUnit_dto) throws URISyntaxException {
		try {
			log.info("createOrgUnit : Request to create OrgUnit Name: {}",orgUnit_dto.getName());
			log.debug("REST request to save OrgUnit : {}", orgUnit_dto);
			if (orgUnit_dto.getId() != null) {
				return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "Id exists",
						"A new org_unit cannot already have a Id")).body(null);
			}
			ModelMapper modelMapper = new ModelMapper();
			OrgUnit orgUnit = modelMapper.map(orgUnit_dto, OrgUnit.class);
			OrgUnit result = orgUnitService.save(orgUnit);
			if (result == null) {
				return new ResponseEntity<String>("OrgUnit could not be created", new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			} else
				log.info("createOrgUnit :created OrgUnit successfully ID: {} Name: {}", result.getId(),
						result.getName());
			return ResponseEntity.created(new URI(new StringBuffer("/api/org-units/").append(result.getId()).toString()))
					.headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString())).body(result);

		} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException e) {
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "OrgUnit"), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * PUT /org-units : Updates an existing org_unit.
	 *
	 * @param orgUnit_dto the org unit dto
	 * @return the ResponseEntity with status 200 (OK) and with body the updated
	 *         org_unit, or with status 400 (Bad Request) if the org_unit is not
	 *         valid, or with status 500 (Internal Server Error) if the org_unit
	 *         couldn't be updated
	 * @throws URISyntaxException if the Location URI syntax is incorrect
	 */
	@PutMapping("/org-units")
	@Timed
	public ResponseEntity<?> updateOrgUnit(@RequestBody OrgUnitDTO orgUnit_dto) throws URISyntaxException {
		try {
			log.info("updateOrgUnit :Request to Update OrgUnit for ID:{} Name: {} ", orgUnit_dto.getId(),orgUnit_dto.getName());
			log.debug("REST request to update OrgUnit : {}", orgUnit_dto);
			if (orgUnit_dto.getId() == null) {
				return createOrgUnit(orgUnit_dto);
			}
			ModelMapper modelMapper = new ModelMapper();
			OrgUnit orgUnit = modelMapper.map(orgUnit_dto, OrgUnit.class);
			OrgUnit result = orgUnitService.save(orgUnit);
			log.info("updateOrgUnit :Updated OrgUnit successfully for ID: {} Name: {} ", result.getId(),result.getName());
			return ResponseEntity.ok()
					.headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, orgUnit.getId().toString())).body(result);

		} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException |EntityNotFoundException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "OrgUnit"), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * GET /org-units : get all the org_units.
	 *
	 * @param pageable the pagination information
	 * @return the ResponseEntity with status 200 (OK) and the list of org_units in
	 *         body
	 */
	@GetMapping("/org-units")
	@Timed
	public ResponseEntity<?> getAllOrgUnits(Pageable pageable) {
		try {
			log.info("getAllOrgUnits : Request to get list of orgUnits");
			Page<OrgUnit> page = orgUnitService.findAll(pageable);
			log.info("getAllOrgUnits : Fetched list of orgUnits successfully");
			return new ResponseEntity<>(page.getContent(), PaginationUtil.generatePaginationHttpHeaders(page, "/api/org-units"), HttpStatus.OK);

		} catch (SQLException | EntityNotFoundException e) {
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * GET /org-units/:id : get the "id" org_unit.
	 *
	 * @param id the id of the org_unit to retrieve
	 * @return the ResponseEntity with status 200 (OK) and with body the org_unit,
	 *         or with status 404 (Not Found)
	 */
	@GetMapping("/org-units/{id}")
	@Timed
	public ResponseEntity<?> getOrgUnit(@PathVariable Integer id) {
		try {
			log.info("getOrgUnit : Request to get OrgUnit by ID: {} ",id); 
			log.debug("REST request to get OrgUnit : {}", id);
			OrgUnit orgUnit = orgUnitService.getOne(id);
			if (orgUnit == null) {
				return new ResponseEntity<String>(new StringBuffer("Orgunit entity with id ").append(id).append(" does not exists!").toString(), new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			}
			log.info("getOrgUnit : Fetched OrgUnit successfully by ID: {} ",orgUnit.getId());
			return new ResponseEntity<>(orgUnit, new HttpHeaders(), HttpStatus.OK);

		} catch (SQLException | EntityNotFoundException e) {
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * deleteById /org-units/:id : deleteById the "id" org_unit.
	 *
	 * @param id the id of the org_unit to deleteById
	 * @return the ResponseEntity with status 200 (OK)
	 */
	@DeleteMapping("/org-units/{id}")
	@Timed
	public ResponseEntity<?> deleteOrgUnit(@PathVariable Integer id) {
		try {
			log.info("deleteOrgUnit : Request to delete OrgUnit by ID: {}",id);
			orgUnitService.deleteById(id);
			log.info("deleteOrgUnit : Deleted OrgUnit successfully by ID: {}",id);
			return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString()))
					.build();

		}  catch (EmptyResultDataAccessException e) {
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(new StringBuffer("Orgunit entity with id ").append(id).append(" does not exists!").toString(), new HttpHeaders(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}
}
