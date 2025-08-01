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
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infosys.icets.ai.comm.lib.util.HeaderUtil;
import com.infosys.icets.ai.comm.lib.util.PaginationUtil;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.iamp.usm.config.Constants;
import com.infosys.icets.iamp.usm.config.Messages;
import com.infosys.icets.iamp.usm.domain.UsmModule;
import com.infosys.icets.iamp.usm.dto.UsmModuleDTO;
import com.infosys.icets.iamp.usm.service.UsmModuleService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Parameter;

// TODO: Auto-generated Javadoc
/**
 * REST controller for managing UsmModule.
 */
@RestController
@RequestMapping("/api")
public class UsmModuleResource {

    /** The log. */
    private final Logger log = LoggerFactory.getLogger(UsmModuleResource.class);

    /** The Constant ENTITY_NAME. */
    private static final String ENTITY_NAME = "usm_module";

    /** The usm module service. */
    private final UsmModuleService usm_moduleService;

    /**
     * Instantiates a new usm module resource.
     *
     * @param usm_moduleService the usm module service
     */
    public UsmModuleResource(UsmModuleService usm_moduleService) {
        this.usm_moduleService = usm_moduleService;
    }
    
    /**
     * POST  /usm-modules/page : get all the usm_modules.
     *
     * @param value the value
     * @return the ResponseEntity with status 200 (OK) and the list of usm_modules in body as PageResponse
     * @throws UnsupportedEncodingException the unsupported encoding exception
     * @throws JsonMappingException the json mapping exception
     * @throws JsonProcessingException the json processing exception
     */
    @GetMapping("/usm-modules/page")
    @Timed
    public ResponseEntity<?> getAllUsmModules(@RequestHeader("example") String value) throws UnsupportedEncodingException, JsonMappingException, JsonProcessingException{
    	log.debug("REST request to get a page of usm-module-organisations");
        try {
			log.info("getAllUsmModules: Request to get List of UsmModules");
			ObjectMapper objectMapper = new ObjectMapper();
			objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
			String body = new String(Base64.getDecoder().decode(value), "UTF-8");
			PageRequestByExample<UsmModule> prbe = objectMapper.readValue(body, new TypeReference<PageRequestByExample<UsmModule>>() {
			});
			log.info("getAllUsmModules : Fetched usm_modules List Successfully");
			return new ResponseEntity<>(usm_moduleService.getAll(prbe), new HttpHeaders(), HttpStatus.OK);
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
     * POST  /usm-modules : Create a new usm_module.
     *
     * @param usm_module_dto the usm module dto
     * @return the ResponseEntity with status 201 (Created) and with body the new usm_module, or with status 400 (Bad Request) if the usm_module has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/usm-modules")
    @Timed
    public ResponseEntity<?> createUsmModule(@RequestBody UsmModuleDTO usm_module_dto) throws URISyntaxException {
    	try {
        	log.debug("REST request to save UsmModules: {}", usm_module_dto);
            if (usm_module_dto.getId() != null) {
                return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "Id exists", "A new usm_module cannot already have a Id")).body(null);
            }
            ModelMapper modelMapper = new ModelMapper();
            UsmModule usm_module = modelMapper.map(usm_module_dto, UsmModule.class);
            UsmModule result = usm_moduleService.save(usm_module);
            if (result == null) {
    			return new ResponseEntity<String>("UsmModule could not be created", new HttpHeaders(),
    					HttpStatus.INTERNAL_SERVER_ERROR);
    		} else {
    			log.info("createUsmModule : created Usm module  successfully with ID: {} Name: {}", result.getId(),result.getName());
    			return ResponseEntity.created(new URI("/api/usm-modules/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
                .body(result);
    		}
           } catch (SQLException | ConstraintViolationException | DataIntegrityViolationException e) {
    				// TODO: handle exception
    				log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
    				return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "UsmModule"), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
    			}
    }

    /**
     * PUT  /usm-modules : Updates an existing usm_module.
     *
     * @param usm_module_dto the usm module dto
     * @return the ResponseEntity with status 200 (OK) and with body the updated usm_module,
     * or with status 400 (Bad Request) if the usm_module is not valid,
     * or with status 500 (Internal Server Error) if the usm_module couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/usm-modules")
    @Timed
    public ResponseEntity<?> updateUsmModule(@RequestBody UsmModuleDTO usm_module_dto) throws URISyntaxException {
    	  try {
          	log.debug("REST request to update UsmModule : {}", usm_module_dto);
          
          if (usm_module_dto.getId() == null) {
              return createUsmModule(usm_module_dto);
          }
          ModelMapper modelMapper = new ModelMapper();
          UsmModule usm_module = modelMapper.map(usm_module_dto, UsmModule.class);
          UsmModule result = usm_moduleService.save(usm_module);
  		log.info("updateUsmModule: UsmModule Updated Successfully for ID: {} Name: {}", result.getId(),result.getName());
          return ResponseEntity.ok()
              .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, result.getId().toString()))
              .body(result);
          }catch (SQLException | ConstraintViolationException | DataIntegrityViolationException | EntityNotFoundException e) {
  			// TODO: handle exception
  			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
  			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "UsmModule"), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
  		}
    }

    /**
     * GET  /usm-modules : get all the usm_modules.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of usm_modules in body
     */
    @GetMapping("/usm-modules")
    @Timed
    public ResponseEntity<?> getAllUsmModules(@Parameter Pageable pageable) {
    	try {
            log.debug("REST request to get a page of UsmModules");
            log.info("REST request to get a page of UsmModules");
            Page<UsmModule> page = usm_moduleService.findAll(pageable);
            log.info("getAllUsmModules: Fetched List of UsmModules Successfully");
            // return new ResponseEntity<>(page.getContent(), PaginationUtil.generatePaginationHttpHeaders(page, "/api/usm-modules"), HttpStatus.OK);
            return new ResponseEntity<>(usm_moduleService.getPaginatedUsmModulesList(pageable), new HttpHeaders(), HttpStatus.OK);
        	}
            catch (SQLException | EntityNotFoundException e) {
    			// TODO: handle exception
    			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
    			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
    		}
    }

    /**
     * GET  /usm-modules/:id : get the "id" usm_module.
     *
     * @param id the id of the usm_module to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the usm_module, or with status 404 (Not Found)
     */
    @GetMapping("/usm-modules/{id}")
    @Timed
    public ResponseEntity<?> getUsmModule(@PathVariable Integer id) {
    	try {
        	log.debug("REST request to get UsmModule: {}", id);
			log.info("getUsmModule: Request to get UsmModule by ID: {}", id);
			UsmModule usm_module= usm_moduleService.findOne(id);
			if (usm_module == null) {
				return new ResponseEntity<String>(new StringBuffer("usm_module entity with id ").append(id).append(" does not exists!").toString(), new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			} else
			log.info("getUsmModuleOrganisation: Fetched UsmModule Successfully by ID: {} Name: {}", usm_module.getId(), usm_module.getName());
			return new ResponseEntity<>(usm_module, new HttpHeaders(), HttpStatus.OK);
			
		}catch (SQLException | EntityNotFoundException e) {
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
    }

    /**
     * DELETE  /usm-modules/:id : delete the "id" usm_module.
     *
     * @param id the id of the usm_module to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/usm-modules/{id}")
    @Timed
    public ResponseEntity<?> deleteUsmModule(@PathVariable Integer id) {
    	try {
            log.debug("REST request to delete UsmModule : {}", id);
            usm_moduleService.delete(id);
        	}
            catch (EmptyResultDataAccessException e) {
    			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
    			return new ResponseEntity<String>(new StringBuffer("UsmModule entity with id ").append(id).append(" does not exists!").toString(), new HttpHeaders(),
    					HttpStatus.INTERNAL_SERVER_ERROR);
    		} catch (SQLException | EntityNotFoundException e) {
    			// TODO: handle exception
    			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
    			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
    		}
    		log.info("deleteUsmModuleOrganisation: UsmModule deleted Successfully by ID:{}",id);
    		return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

    @PostMapping("/search/usm-modules/page")
	@Timed
	public ResponseEntity<?> searchUsmModules(@Parameter Pageable pageable,@RequestBody PageRequestByExample<UsmModule> prbe) throws  URISyntaxException  {
		log.info("searchUsmModules : Request to get list of UsmPermissions");
		log.info("searchUsmModules : Fetched  list of UsmPermissions successftully");
		return new ResponseEntity<>(usm_moduleService.search(pageable, prbe), new HttpHeaders(), HttpStatus.OK);
		
		}
}
