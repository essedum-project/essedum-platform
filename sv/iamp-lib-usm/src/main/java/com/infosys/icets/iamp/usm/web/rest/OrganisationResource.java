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
import com.infosys.icets.iamp.usm.domain.Organisation;
import com.infosys.icets.iamp.usm.dto.OrganisationDTO;
import com.infosys.icets.iamp.usm.service.OrganisationService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.tags.Tag;

// TODO: Auto-generated Javadoc
/**
 * REST controller for managing Organisation.
 */
/**
* @author icets
*/
@RestController
@RequestMapping("/api")
@Tag(name= "User Management", description = "User Management")
public class OrganisationResource {

	/** The log. */
	private final Logger log = LoggerFactory.getLogger(OrganisationResource.class);

	/** The Constant ENTITY_NAME. */
	private static final String ENTITY_NAME = "organisation";

	/** The organisation service. */
	private final OrganisationService organisationService;

	/**
	 * Instantiates a new organisation resource.
	 *
	 * @param organisationService the organisation service
	 */
	public OrganisationResource(OrganisationService organisationService) {
		this.organisationService = organisationService;
	}

	/**
	 * POST /organisations/page : get all the organisations.
	 *
	 * @param value the value
	 * @return the ResponseEntity with status 200 (OK) and the list of organisations
	 *         in body as PageResponse
	 * @throws UnsupportedEncodingException the unsupported encoding exception
	 * @throws JsonMappingException the json mapping exception
	 * @throws JsonProcessingException the json processing exception
	 */
	@GetMapping("/organisations/page")
	@Timed
	public ResponseEntity<?> getAllOrganisations(@RequestHeader("example") String value) throws UnsupportedEncodingException, JsonMappingException, JsonProcessingException {
		try {
			log.info("getAllOrganisations : Request to get list of Organisations");
			ObjectMapper objectMapper = new ObjectMapper();
			String body = new String(Base64.getDecoder().decode(value), "UTF-8");
			PageRequestByExample<Organisation> prbe = objectMapper.readValue(body, new TypeReference<PageRequestByExample<Organisation>>() {
			});
			log.info("getAllOrganisations : Fetched list of Organisations successfully");
			return new ResponseEntity<>(organisationService.getAll(prbe), new HttpHeaders(), HttpStatus.OK);

		} catch (SQLException | EntityNotFoundException e) {
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (ArithmeticException e) {
			// TODO: handle exception
			log.error(new StringBuffer("ArithmeticException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_LAZY_LOAD_EVENT), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * POST /organisations : Create a new organisation.
	 *
	 * @param organisation_dto the organisation dto
	 * @return the ResponseEntity with status 201 (Created) and with body the new
	 *         organisation, or with status 400 (Bad Request) if the organisation
	 *         has already an ID
	 * @throws URISyntaxException if the Location URI syntax is incorrect
	 */
	@PostMapping("/organisations")
	@Timed
	public ResponseEntity<?> createOrganisation(@RequestBody OrganisationDTO organisation_dto)
			throws URISyntaxException {
		try {
			log.info("createOrganisation : Request to Create Organisation with Name: {}",organisation_dto.getName());
			log.debug("REST request to save Organisation : {}", organisation_dto);
			if (organisation_dto.getId() != null) {
				return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "Id exists",
						"A new organisation cannot already have a Id")).body(null);
			}
			ModelMapper modelMapper = new ModelMapper();
			Organisation organisation = modelMapper.map(organisation_dto, Organisation.class);
			Organisation result = organisationService.save(organisation);
			if (result == null) {
				return new ResponseEntity<String>("Organisation could not be created", new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			} else
				log.info("createOrganisation :  Created Organisation successfully with Org ID: {} Name: {}",result.getId(),result.getName());
			return ResponseEntity.created(new URI(new StringBuffer("/api/organisations/").append(result.getId()).toString()))
					.headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString())).body(result);

		} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>("Organisation entity constraint violated", new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * PUT /organisations : Updates an existing organisation.
	 *
	 * @param organisation_dto the organisation dto
	 * @return the ResponseEntity with status 200 (OK) and with body the updated
	 *         organisation, or with status 400 (Bad Request) if the organisation is
	 *         not valid, or with status 500 (Internal Server Error) if the
	 *         organisation couldn't be updated
	 * @throws URISyntaxException if the Location URI syntax is incorrect
	 */
	@PutMapping("/organisations")
	@Timed
	public ResponseEntity<?> updateOrganisation(@RequestBody OrganisationDTO organisation_dto)
			throws URISyntaxException {
		try {
			log.info("updateOrganisation : Request to update Organisation for ID: {} Name: {}",organisation_dto.getId(),organisation_dto.getName() );
			log.debug("REST request to update Organisation : {}", organisation_dto);
			if (organisation_dto.getId() == null) {
				return createOrganisation(organisation_dto);
			}
			ModelMapper modelMapper = new ModelMapper();
			Organisation organisation = modelMapper.map(organisation_dto, Organisation.class);
			Organisation result = organisationService.save(organisation);
				log.info("updateOrganisation :  updated Organisation successfully for ID: {} Name: {}",result.getId(),result.getName() );
			return ResponseEntity.ok()
					.headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, organisation.getId().toString()))
					.body(result);

		} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException|EntityNotFoundException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "Organisation"), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * GET /organisations : get all the organisations.
	 *
	 * @param pageable the pagination information
	 * @return the ResponseEntity with status 200 (OK) and the list of organisations
	 *         in body
	 */
	@GetMapping("/organisations")
	@Timed
	public ResponseEntity<?> getAllOrganisations(Pageable pageable) {
		try {
			log.info("getAllOrganisations : Request to get list of Organisations");
			Page<Organisation> page = organisationService.findAll(pageable);
			log.info("getAllOrganisations : Fetched list of Organisations successfully");
			return new ResponseEntity<>(page.getContent(), PaginationUtil.generatePaginationHttpHeaders(page, "/api/organisations"), HttpStatus.OK);

		} catch (SQLException | EntityNotFoundException e) {
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * GET /organisations/:id : get the "id" organisation.
	 *
	 * @param id the id of the organisation to retrieve
	 * @return the ResponseEntity with status 200 (OK) and with body the
	 *         organisation, or with status 404 (Not Found)
	 */
	@GetMapping("/organisations/{id}")
	@Timed
	public ResponseEntity<?> getOrganisation(@PathVariable Integer id) {
		try {
			log.info("getOrganisation : Request to get Organisation for ID: {}",id);
			Organisation organisation = organisationService.getOne(id);
			if (organisation == null) {
				return new ResponseEntity<String>(new StringBuffer("Orgainsation entity with id ").append(id).append(" does not exists!").toString(), new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			}
			log.info("getOrganisation : Fetched Organisation  successfully for ID: {} Name: {}", organisation.getId(), organisation.getName());
			return new ResponseEntity<>(organisation, new HttpHeaders(), HttpStatus.OK);

		} catch (SQLException | EntityNotFoundException e) {
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * deleteById /organisations/:id : deleteById the "id" organisation.
	 *
	 * @param id the id of the organisation to deleteById
	 * @return the ResponseEntity with status 200 (OK)
	 */
	@DeleteMapping("/organisations/{id}")
	@Timed
	public ResponseEntity<?> deleteOrganisation(@PathVariable Integer id) {
		try {
			log.info("deleteOrganisation: Request to delete Organisation by ID: {} ",id);
			log.debug("REST request to deleteById Organisation : {}", id);
			organisationService.deleteById(id);
			log.info("deleteOrganisation:  deleted Organisation successfully by ID: {} ",id);
			return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString()))
					.build();

		} catch (EmptyResultDataAccessException e) {
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(new StringBuffer("Orgainsation entity with id ").append(id).append(" does not exists!").toString(), new HttpHeaders(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}
}
