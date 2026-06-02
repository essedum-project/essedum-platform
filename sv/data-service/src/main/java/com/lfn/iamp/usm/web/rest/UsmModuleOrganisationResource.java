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

import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

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
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lfn.ai.comm.lib.util.HeaderUtil;
import com.lfn.ai.comm.lib.util.PaginationUtil;
import com.lfn.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.lfn.iamp.usm.config.Constants;
import com.lfn.iamp.usm.config.Messages;
import com.lfn.iamp.usm.domain.UsmModuleOrganisation;
import com.lfn.iamp.usm.dto.UsmModuleOrganisationDTO;
import com.lfn.iamp.usm.service.UsmModuleOrganisationService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Parameter;

// TODO: Auto-generated Javadoc
/**
 * REST controller for managing UsmModuleOrganisation.
 */
@RestController
@RequestMapping("/api")
public class UsmModuleOrganisationResource {

    /** The log. */
    private final Logger log = LoggerFactory.getLogger(UsmModuleOrganisationResource.class);

    /** The Constant ENTITY_NAME. */
    private static final String ENTITY_NAME = "usm_module_organisation";

    /** The usm module organisation service. */
    private final UsmModuleOrganisationService usm_module_organisationService;

    /**
     * Instantiates a new usm module organisation resource.
     *
     * @param usm_module_organisationService the usm module organisation service
     */
    public UsmModuleOrganisationResource(UsmModuleOrganisationService usm_module_organisationService) {
        this.usm_module_organisationService = usm_module_organisationService;
    }
    
    /**
     * GET  /usm-module-organisations/page : get all the usm_module_organisations.
     *
     * @param value the value
     * @return the ResponseEntity with status 200 (OK) and the list of usm_module_organisations in body as PageResponse
     * @throws UnsupportedEncodingException the unsupported encoding exception
     * @throws JsonMappingException the json mapping exception
     * @throws JsonProcessingException the json processing exception
     */
    @GetMapping("/usm-module-organisations/page")
    @Timed
    public ResponseEntity<?> getAllUsmModuleOrganisations(@RequestHeader("example") String value) throws UnsupportedEncodingException, JsonMappingException, JsonProcessingException{
        log.debug("REST request to get a page of usm-module-organisations");
        try {
			log.info("getAllUsmModuleOrganisations: Request to get List of UsmModuleOrganisations");
			ObjectMapper objectMapper = new ObjectMapper();
			objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
			String body = new String(Base64.getDecoder().decode(value), "UTF-8");
			PageRequestByExample<UsmModuleOrganisation> prbe = objectMapper.readValue(body, new TypeReference<PageRequestByExample<UsmModuleOrganisation>>() {
			});
			log.info("getAllUsmModuleOrganisations : Fetched usm_module_organisation List Successfully");
			return new ResponseEntity<>(usm_module_organisationService.getAll(prbe), new HttpHeaders(), HttpStatus.OK);
		}catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (ArithmeticException e) {
			// TODO: handle exception
			log.error(new StringBuffer("ArithmeticException ").append(e.getClass().getName()).append(": ").append(e).toString() );
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_LAZY_LOAD_EVENT), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
}

    /**
     * POST  /usm-module-organisations : Create a new usm_module_organisation.
     *
     * @param usm_module_organisation_dto the usm module organisation dto
     * @return the ResponseEntity with status 201 (Created) and with body the new usm_module_organisation, or with status 400 (Bad Request) if the usm_module_organisation has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/usm-module-organisations")
    @Timed
    public ResponseEntity<?> createUsmModuleOrganisation(@RequestBody UsmModuleOrganisationDTO usm_module_organisation_dto) throws URISyntaxException {
       try {
    	log.debug("REST request to save UsmModuleOrganisation : {}", usm_module_organisation_dto);
        if (usm_module_organisation_dto.getId() != null) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "Id exists", "A new usm_module_organisation cannot already have a Id")).body(null);
        }
        ModelMapper modelMapper = new ModelMapper();
        UsmModuleOrganisation usm_module_organisation = modelMapper.map(usm_module_organisation_dto, UsmModuleOrganisation.class);
        UsmModuleOrganisation result = usm_module_organisationService.save(usm_module_organisation);
        if (result == null) {
			return new ResponseEntity<String>("UsmModuleOrganisation could not be created", new HttpHeaders(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		} else {
			log.info("createUsmModuleOrganisation : created Usm module Organisation  successfully with ID: {} Module: {}", result.getId(),result.getModule());
			return ResponseEntity.created(new URI("/api/usm-module-organisations/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
		}
       } catch (SQLException | ConstraintViolationException | DataIntegrityViolationException e) {
				// TODO: handle exception
				log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
				return new ResponseEntity<String>("UsmModuleOrganisation entity constraint violated", new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
			}
    }

    /**
     * PUT  /usm-module-organisations : Updates an existing usm_module_organisation.
     *
     * @param usm_module_organisation_dto the usm module organisation dto
     * @return the ResponseEntity with status 200 (OK) and with body the updated usm_module_organisation,
     * or with status 400 (Bad Request) if the usm_module_organisation is not valid,
     * or with status 500 (Internal Server Error) if the usm_module_organisation couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/usm-module-organisations")
    @Timed
    public ResponseEntity<?> updateUsmModuleOrganisation(@RequestBody UsmModuleOrganisationDTO usm_module_organisation_dto) throws URISyntaxException {
        try {
        	log.debug("REST request to update UsmModuleOrganisation : {}", usm_module_organisation_dto);
        
        if (usm_module_organisation_dto.getId() == null) {
            return createUsmModuleOrganisation(usm_module_organisation_dto);
        }
        ModelMapper modelMapper = new ModelMapper();
        UsmModuleOrganisation usm_module_organisation = modelMapper.map(usm_module_organisation_dto, UsmModuleOrganisation.class);
        UsmModuleOrganisation result = usm_module_organisationService.save(usm_module_organisation);
		log.info("updateUsmModuleOrganisation: UsmModuleOrganisation Updated Successfully for ID: {} Module: {}", result.getId(),result.getModule());
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, usm_module_organisation.getId().toString()))
            .body(result);
        }catch (SQLException | ConstraintViolationException | DataIntegrityViolationException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>("UsmModuleOrganisation entity constraint violated", new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
    }

    /**
     * GET  /usm-module-organisations : get all the usm_module_organisations.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of usm_module_organisations in body
     */
    @GetMapping("/usm-module-organisations")
    @Timed
    public ResponseEntity<?> getAllUsmModuleOrganisations(@Parameter Pageable pageable) {
    	try {
        log.debug("REST request to get a page of UsmModuleOrganisations");
        log.info("REST request to get a page of UsmModuleOrganisations");
        Page<UsmModuleOrganisation> page = usm_module_organisationService.findAll(pageable);
        log.info("getAllUserss: Fetched List of UsmModuleOrganisations Successfully");
        return new ResponseEntity<>(page.getContent(), PaginationUtil.generatePaginationHttpHeaders(page, "/api/usm-module-organisations"), HttpStatus.OK);
    	}
        catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
		
    }

    /**
     * GET  /usm-module-organisations/:id : get the "id" usm_module_organisation.
     *
     * @param id the id of the usm_module_organisation to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the usm_module_organisation, or with status 404 (Not Found)
     */
    @GetMapping("/usm-module-organisations/{id}")
    @Timed
    public ResponseEntity<?> getUsmModuleOrganisation(@PathVariable Integer id) {
        try {
        	log.debug("REST request to get UsmModuleOrganisation : {}", id);
			log.info("getUsmModuleOrganisation: Request to get UsmModuleOrganisation by ID: {}", id);
			UsmModuleOrganisation usm_module_organisation= usm_module_organisationService.findOne(id);
			if (usm_module_organisation == null) {
				return new ResponseEntity<String>(new StringBuffer("usm_module_organisation entity with id ").append(id).append(" does not exists!").toString(), new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			} else
			log.info("getUsmModuleOrganisation: Fetched UsmModuleOrganisation Successfully by ID: {} Module: {}", usm_module_organisation.getId(), usm_module_organisation.getModule());
			return new ResponseEntity<>(usm_module_organisation, new HttpHeaders(), HttpStatus.OK);
			
		}catch (SQLException | EntityNotFoundException e) {
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
      
    }

    /**
     * DELETE  /usm-module-organisations/:id : delete the "id" usm_module_organisation.
     *
     * @param id the id of the usm_module_organisation to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/usm-module-organisations/{id}")
    @Timed
    public ResponseEntity<?> deleteUsmModuleOrganisation(@PathVariable Integer id){
    	try {
        log.debug("REST request to delete UsmModuleOrganisation : {}", id);
        usm_module_organisationService.delete(id);
    	}
        catch (EmptyResultDataAccessException e) {
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(new StringBuffer("UsmModuleOrganisation entity with id ").append(id).append(" does not exists!").toString(), new HttpHeaders(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
		log.info("deleteUsmModuleOrganisation: UsmModuleOrganisation deleted Successfully by ID:{}",id);
		return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
    
    /**
     * Creates the list of Usm Module Organisations.
     *
     * @param usm_module_organisation_dto the usm module organisation dto
     * @return the response entity
     * @throws URISyntaxException the URI syntax exception
     */
    @PostMapping("/usm-module-organisations-list")
	@Timed
	public ResponseEntity<?> createListOfUsmModuleOrganisations(@RequestBody List<UsmModuleOrganisationDTO> usm_module_organisation_dto)
			throws URISyntaxException {

		List<UsmModuleOrganisation> usm_module_organisation = new ArrayList<UsmModuleOrganisation>();
		try {
			log.debug("REST request to save usm_module_organisations : {}",usm_module_organisation_dto );
			if (usm_module_organisation_dto.size() == 0) {
				return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "List is empty",
						"A list of usm_module_organisations cannot be empty.")).body(null);
			}
			ModelMapper modelMapper = new ModelMapper();
			// save list of usm_module_organisations
			usm_module_organisation = usm_module_organisation_dto.stream()
					.map(source -> modelMapper.map(source, UsmModuleOrganisation.class)).collect(Collectors.toList());
			List<UsmModuleOrganisation> result = usm_module_organisationService.saveList(usm_module_organisation);
			return new ResponseEntity<>(result, new HttpHeaders(), HttpStatus.CREATED);

		} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>("UsmModuleOrganisation entity constraint violated", new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

}
