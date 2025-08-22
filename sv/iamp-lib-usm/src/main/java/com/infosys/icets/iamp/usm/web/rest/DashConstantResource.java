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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infosys.icets.ai.comm.lib.util.HeaderUtil;
import com.infosys.icets.ai.comm.lib.util.PaginationUtil;
import com.infosys.icets.ai.comm.lib.util.annotation.service.ConstantsService;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.iamp.usm.config.Constants;
import com.infosys.icets.iamp.usm.config.Messages;
import com.infosys.icets.iamp.usm.domain.DashConstant;
import com.infosys.icets.iamp.usm.domain.Project;
import com.infosys.icets.iamp.usm.dto.DashConstantDTO;
import com.infosys.icets.iamp.usm.repository.ProjectRepository;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Parameter;

// TODO: Auto-generated Javadoc
/**
 * REST controller for managing DashConstant.
 */
/**
 * @author icets
 */
@RestController
@Hidden
@RequestMapping("/api")
public class DashConstantResource {

	/** The log. */
	private final Logger log = LoggerFactory.getLogger(DashConstantResource.class);

	/** The Constant ENTITY_NAME. */
	private static final String ENTITY_NAME = "dash_constant";

	/** The dash constant service. */
	private final ConstantsService dash_constantService;
	
	@Autowired
	/** The dash constant repository. */
	private ProjectRepository projectRepository;

	/**
	 * Instantiates a new dash constant resource.
	 *
	 * @param dash_constantService the dash constant service
	 */
	public DashConstantResource(ConstantsService dash_constantService) {
		this.dash_constantService = dash_constantService;
	}

	/**
	 * GET /dash-constants/page : get all the dash_constants.
	 *
	 * @param requestkey the requestkey
	 * @return the ResponseEntity with status 200 (OK) and the list of
	 *         dash_constants in body as PageResponse
	 * @throws UnsupportedEncodingException the unsupported encoding exception
	 * @throws JsonMappingException         the json mapping exception
	 * @throws JsonProcessingException      the json processing exception
	 */
	@GetMapping("/dash-constants/page")
	@Timed
	public ResponseEntity<?> getAllDashConstants(@RequestHeader(value = "example") String requestkey)
			throws UnsupportedEncodingException, JsonMappingException, JsonProcessingException {
		log.info("getAllDashConstants : REST request to get a page of dash-constants");
		log.debug("REST request to get a page of dash-constants");
		try {

			String decodedvalue = new String(Base64.getDecoder().decode(requestkey), "UTF-8");
			ObjectMapper objectMapper = new ObjectMapper();
			objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
			PageRequestByExample<DashConstant> prbe = objectMapper.readValue(decodedvalue,
					new TypeReference<PageRequestByExample<DashConstant>>() {
					});
			if (prbe.getLazyLoadEvent() == null) {
				return new ResponseEntity<String>("Please provide lazy load event", new HttpHeaders(),
						HttpStatus.BAD_REQUEST);
			}

			log.info("getAllDashConstants : Page of dash-constants fetched successfully");
			return new ResponseEntity<>(dash_constantService.getAll(prbe), new HttpHeaders(), HttpStatus.OK);
		} catch (SQLException | EntityNotFoundException e) {
			log.error(new StringBuffer("Exception ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.BAD_REQUEST);
		} catch (ArithmeticException e) {
			// TODO: handle exception
			log.error(new StringBuffer("ArithmeticException ").append(e.getClass().getName()).append(": ").append(e)
					.toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.CCL_MSG_LAZY_LOAD_EVENT), new HttpHeaders(),
					HttpStatus.BAD_REQUEST);
		}

	}

	/**
	 * POST /dash-constants : Create a new dash_constant.
	 *
	 * @param dash_constant_dto the dash constant dto
	 * @return the ResponseEntity with status 201 (Created) and with body the new
	 *         dash_constant, or with status 400 (Bad Request) if the dash_constant
	 *         has already an ID
	 * @throws URISyntaxException if the Location URI syntax is incorrect
	 */
	@PostMapping("/dash-constants")
	@Timed
	public ResponseEntity<?> createDashConstant(@RequestBody DashConstantDTO dash_constant_dto)
			throws URISyntaxException {

		try {
			log.info("createDashConstant : REST request to save DashConstant with Key Name: {}",
					dash_constant_dto.getKeys());
			log.debug("REST request to save DashConstant : {}", dash_constant_dto);
			if (dash_constant_dto.getId() != null) {
				return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "Id exists",
						"A new dash_constant cannot already have a Id")).body(null);
			}
			ModelMapper modelMapper = new ModelMapper();
			DashConstant dash_constant = modelMapper.map(dash_constant_dto, DashConstant.class);
			DashConstant result = dash_constantService.save(dash_constant);
			dash_constantService.refreshConfigKeyMap();
			if (result == null) {
				return new ResponseEntity<String>("Dash constant could not be created", new HttpHeaders(),
						HttpStatus.BAD_REQUEST);
			} else
				log.info("createDashConstant : DashConstant created Successfully with Key ID: {} Name: {}",
						result.getId(), result.getKeys());
			return ResponseEntity
					.created(new URI(new StringBuffer("/api/dash-constants/").append(result.getId()).toString()))
					.headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString())).body(result);

		} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException e) {
			log.error(new StringBuffer("Exception ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_LAZY_LOAD_EVENT), new HttpHeaders(),
					HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * PUT /dash-constants : Updates an existing dash_constant.
	 *
	 * @param dash_constant_dto the dash constant dto
	 * @return the ResponseEntity with status 200 (OK) and with body the updated
	 *         dash_constant, or with status 400 (Bad Request) if the dash_constant
	 *         is not valid, or with status 500 (Internal Server Error) if the
	 *         dash_constant couldn't be updated
	 * @throws URISyntaxException if the Location URI syntax is incorrect
	 */
	@PutMapping("/dash-constants")
	@Timed
	public ResponseEntity<?> updateDashConstant(@RequestBody DashConstantDTO dash_constant_dto)
			throws URISyntaxException {
		try {
			log.info("updateDashConstant : REST request to update DashConstant for Key ID: {} Name: {}",
					dash_constant_dto.getId(), dash_constant_dto.getKeys());
			log.debug("REST request to update DashConstant : {}", dash_constant_dto);
			if (dash_constant_dto.getId() == null) {
				return createDashConstant(dash_constant_dto);
			}
			ModelMapper modelMapper = new ModelMapper();
			DashConstant dash_constant = modelMapper.map(dash_constant_dto, DashConstant.class);
			DashConstant result = dash_constantService.save(dash_constant);
			dash_constantService.refreshConfigKeyMap();
			if (result == null) {
				return new ResponseEntity<String>("DashConstant could not be updated", new HttpHeaders(),
						HttpStatus.BAD_REQUEST);
			} else
				log.info("updateDashConstant : DashConstant Updated Successfully for Key ID: {} Name: {}",
						result.getId(), result.getKeys());
			return ResponseEntity.ok()
					.headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, dash_constant.getId().toString()))
					.body(result);

		} catch (SQLException | ConstraintViolationException | DataIntegrityViolationException
				| EntityNotFoundException e) {
			log.error(new StringBuffer("Exception ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED), new HttpHeaders(),
					HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * GET /dash-constants : get all the dash_constants.
	 *
	 * @param pageable the pagination information
	 * @return the ResponseEntity with status 200 (OK) and the list of
	 *         dash_constants in body
	 */
	@GetMapping("/dash-constants")
	@Timed
	public ResponseEntity<?> getAllDashConstants(@Parameter Pageable pageable) {
		try {
			log.info("getAllDashConstants : REST request to get a page of DashConstants");
			log.debug("REST request to get a page of DashConstants");
			Page<DashConstant> page = dash_constantService.findAll(pageable);
			log.info("getAllDashConstants : Page of DashConstants fetched successfully");
			return new ResponseEntity<>(page.getContent(),
					PaginationUtil.generatePaginationHttpHeaders(page, "/api/dash-constants"), HttpStatus.OK);

		} catch (SQLException | EntityNotFoundException e) {
			log.error(
					new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.BAD_REQUEST);
		}

	}

	/**
	 * GET /dash-constants/:id : get the "id" dash_constant.
	 *
	 * @param id the id of the dash_constant to retrieve
	 * @return the ResponseEntity with status 200 (OK) and with body the
	 *         dash_constant, or with status 404 (Not Found)
	 */
	@GetMapping("/dash-constants/{id}")
	@Timed
	public ResponseEntity<?> getDashConstant(@PathVariable("id") Integer id) {
		try {
			log.info("getDashConstant : REST request to get DashConstant for key ID: {}", id);
			log.debug("REST request to get DashConstant : {}", id);
			DashConstant dash_constant = dash_constantService.findOne(id);

			if (dash_constant == null) {
				return new ResponseEntity<String>(new StringBuffer("DashConstant entity with id ").append(id)
						.append(" does not exists!").toString(), new HttpHeaders(), HttpStatus.BAD_REQUEST);
			} else
				log.info("getDashConstant : REST request to get DashConstant successfull for key ID: {} Name: {}",
						dash_constant.getId(), dash_constant.getKeys());
			return new ResponseEntity<>(dash_constant, new HttpHeaders(), HttpStatus.OK);

		} catch (SQLException | EntityNotFoundException e) {
			log.error(
					new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.BAD_REQUEST);
		}

	}

	/**
	 * DELETE /dash-constants/:id : delete the "id" dash_constant.
	 *
	 * @param id the id of the dash_constant to delete
	 * @return the ResponseEntity with status 200 (OK)
	 */
	@DeleteMapping("/dash-constants/{id}")
	@Timed
	public ResponseEntity<?> deleteDashConstant(@PathVariable("id") Integer id) {
		try {
			log.info("deleteDashConstant : REST request to delete DashConstant for key ID: {}", id);
			log.debug("REST request to delete DashConstant : {}", id);
			dash_constantService.delete(id);
			dash_constantService.refreshConfigKeyMap();
			log.info("deleteDashConstant : DashConstant deleted successfully for key ID: {}", id);
			return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString()))
					.build();

		} catch (EmptyResultDataAccessException e) {
			log.error(
					new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(
					new StringBuffer("DashConstant entity with id ").append(id).append(" does not exists!").toString(),
					new HttpHeaders(), HttpStatus.BAD_REQUEST);
		} catch (SQLException e) {
			log.error(new StringBuffer("Exception ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.BAD_REQUEST);
		}

	}

	/**
	 * Gets the dash constants.
	 *
	 * @param projectId the project id
	 * @return the dash constants
	 */
	@GetMapping("/get-dash-constants")
	public ResponseEntity<?> getDashConstants(@Parameter @RequestParam(required = false, name = "projectId") Integer projectId,@RequestParam(required = false, name = "portfolioId") Integer portfolioId) {
		try {
//			log.info("getDashConstants : REST request to get all dash constants : {}", projectId);
//			log.debug("REST request to get all dash constants");
//			log.info("getDashConstants : Dash Constants fetched successfully");
			if(portfolioId == null) {
				Optional<Project> projectDetails = 	projectRepository.findById(projectId);
				portfolioId = projectDetails.get().getPortfolioId().getId();
			} 
			return new ResponseEntity<>(dash_constantService.findAllDashConstants(projectId, portfolioId), new HttpHeaders(),
					HttpStatus.OK);
		} catch (EntityNotFoundException e) {
			log.error(new StringBuffer("Exception ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Gets the value of allowed extension key.
	 *
	 * @param projectId the project id
	 * @param key       the allowed extension key whose value to retrieve
	 * @return the value of allowed extension key
	 */
	@GetMapping("/get-extension-key")
	public ResponseEntity<?> getExtensionKey(@Parameter @RequestParam(required = false, name = "projectId") Integer projectId,@Parameter @RequestParam(required = false, name = "key") String key) {
		try {
			log.info("getExtensionKey : REST request to get extension key for project id : {}", projectId);
			log.debug("REST request to get extension key");
			log.info("getExtensionKey: Extension Key fetched successfully");
			return new ResponseEntity<>(dash_constantService.findExtensionKey(projectId, key), new HttpHeaders(),
					HttpStatus.OK);
		} catch (EntityNotFoundException e) {
			log.error(new StringBuffer("Exception ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.BAD_REQUEST);
		}
	}

	@GetMapping("/get-startup-constants/{key}/{project}")
	public ResponseEntity<?> getDashConstantsByKey(@PathVariable("key") String key, @PathVariable("project") String project) {
		try {
//			log.info("getDashConstants : REST request to get dash constant : {}", key);
//			log.info("getDashConstants : Dash Constants fetched successfully");
			return new ResponseEntity<>(dash_constantService.findByKeys(key, project), new HttpHeaders(),
					HttpStatus.OK);
		} catch (EntityNotFoundException e) {
			log.error(new StringBuffer("Exception ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.BAD_REQUEST);
		}
	}

	@GetMapping("/get-startup-constants/array/{key}/{project}")
	public ResponseEntity<?> getDashConstantsByKeyArray(@PathVariable String key, @PathVariable String project) {
		try {
			log.info("getDashConstants : REST request to get dash constants array: {}", key);
			return new ResponseEntity<>(dash_constantService.findByKeyArray(key, project), new HttpHeaders(),
					HttpStatus.OK);
		} catch (EntityNotFoundException e) {
			log.error(new StringBuffer("Exception ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.BAD_REQUEST);
		}
	}

	@GetMapping("/get-startup-constants")
	public ResponseEntity<?> getDashConstantsByKeys(@RequestParam("keys") List<String> keys, @RequestHeader("ProjectName") String project) {
    try {
//        log.info("getDashConstants : REST request to get dash constants : {}", keys);
        Map<String, Object> result = new HashMap<>();
        for (String key : keys) {
            result.put(key, dash_constantService.findByKeys(key, project));
        }
//        log.info("getDashConstants : Dash Constants fetched successfully");
        return new ResponseEntity<>(result, new HttpHeaders(), HttpStatus.OK);
		} catch (EntityNotFoundException e) {
			log.error(new StringBuffer("Exception ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.BAD_REQUEST);
		}
	}
	@GetMapping("/get-startup-constants/id/{key}/{project}")
	public ResponseEntity<?> getDashConstantsByKeyAndProject(@PathVariable("key") String key, @PathVariable("project") String project) {
		try {
//			log.info("getDashConstants : REST request to get dash constant : {}", key);
//			log.info("getDashConstants : Dash Constants fetched successfully");
			return new ResponseEntity<>(dash_constantService.getByKeys(key, project), new HttpHeaders(),
					HttpStatus.OK);
		} catch (EntityNotFoundException e) {
			log.error(new StringBuffer("Exception ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.BAD_REQUEST);
		}
	}

}
