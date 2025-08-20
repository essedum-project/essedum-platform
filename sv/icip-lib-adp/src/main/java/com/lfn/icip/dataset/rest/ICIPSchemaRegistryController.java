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

package com.lfn.icip.dataset.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lfn.ai.comm.lib.util.ICIPHeaderUtil;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.lfn.ai.comm.lib.util.exceptions.ApiError;
import com.lfn.ai.comm.lib.util.exceptions.ExceptionUtil;
import com.lfn.icip.dataset.model.ICIPSchemaForm;
import com.lfn.icip.dataset.model.ICIPSchemaRegistry;
import com.lfn.icip.dataset.model.dto.ICIPSchemaFormDTO;
import com.lfn.icip.dataset.model.dto.ICIPSchemaRegistryDTO;
import com.lfn.icip.dataset.model.dto.ICIPSchemaRegistryDTO2;
import com.lfn.icip.dataset.service.IICIPSchemaFormService;
import com.lfn.icip.dataset.service.IICIPSchemaRegistryService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.tags.Tag;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPSchemaRegistryController.
 *
 * @author essedum
 */
@RestController
@Timed
@RequestMapping(path = "/${icip.pathPrefix}/schemaRegistry")
@Tag(name= "schemas")
public class ICIPSchemaRegistryController {

	/** The Constant ENTITY_NAME. */
	private static final String ENTITY_NAME = "schemaRegistry";

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPSchemaRegistryController.class);

	/** The schema registry service. */
	@Autowired
	private IICIPSchemaRegistryService schemaRegistryService;
	
	/** The schema registry service. */
	@Autowired
	private IICIPSchemaFormService schemaFormService;
	
	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;

	/**
	 * Gets the schemas.
	 *
	 * @param org the org
	 * @return the schemas
	 */
	@GetMapping("/schemas")
	public ResponseEntity<List<NameAndAliasDTO>> getSchemas(@RequestParam(name = "org") String org) {
		logger.info("Get all schema of organziation {}", org);
		return new ResponseEntity<>(schemaRegistryService.getSchemaNamesByOrg(org), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the schemas.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the schemas
	 */
	@GetMapping("/search/{name}")
	public ResponseEntity<List<ICIPSchemaRegistry>> getSchemas(@PathVariable("name") String name,
			@RequestParam(name = "org", required = true) String org) {
		return new ResponseEntity<>(schemaRegistryService.searchSchemas(name, org), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the all schemas.
	 *
	 * @param org the org
	 * @return the all schemas
	 */
	@GetMapping("/schemas/all")
	public ResponseEntity<List<ICIPSchemaRegistry>> getAllSchemas(
			@RequestParam(name = "org", required = true) String org) {
		return new ResponseEntity<>(schemaRegistryService.fetchAllByOrg(org), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the schemas by group.
	 *
	 * @param group  the group
	 * @param org    the org
	 * @param page   the page
	 * @param size   the size
	 * @param search the search
	 * @return the schemas by group
	 */
	@GetMapping("/schemas/all/{group}")
	public ResponseEntity<List<ICIPSchemaRegistryDTO2>> getSchemasByGroup(@PathVariable(name = "group") String group,
			@RequestParam(name = "org", required = true) String org,
			@RequestParam(name = "page", defaultValue = "0", required = false) String page,
			@RequestParam(name = "size", defaultValue = "12", required = false) String size,
			@RequestParam(name = "search", required = false) String search) {
		return new ResponseEntity<>(schemaRegistryService.getSchemasByGroupAndOrg(org, group, search,
				Integer.parseInt(page), Integer.parseInt(size)), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the schema registry iai.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the schema registry iai
	 */
	@GetMapping("/schemas/{nameStr}/{org}")
	public ResponseEntity<ICIPSchemaRegistry> getSchemaByName(@PathVariable(name = "nameStr") String name,
			@PathVariable(name = "org") String org) {
		return new ResponseEntity<>(schemaRegistryService.getSchemaByName(name, org), new HttpHeaders(), HttpStatus.OK);
	}
	
	/**
	 * Gets the schema registry iai.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the schema registry iai
	 */
	@GetMapping("/alias/{alias}/{org}")
	public ResponseEntity<ICIPSchemaRegistry> getSchemaByAlias(@PathVariable(name = "alias") String alias,
			@PathVariable(name = "org") String org) {
		return new ResponseEntity<>(schemaRegistryService.getSchemaByAlias(alias, org), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the schema form template.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the schema form template
	 */
	@GetMapping("/schemaFormTemplate/{templatename}/{nameStr}/{org}")
	public ResponseEntity<ICIPSchemaForm> getSchemaFormTemplate(@PathVariable(name = "templatename") String templatename,@PathVariable(name = "nameStr") String name,
			@PathVariable(name = "org") String org) {
		return new ResponseEntity<>(schemaFormService.fetchSchemaFormTemplate(templatename,name, org), new HttpHeaders(),
				HttpStatus.OK);
	}
	
	@GetMapping("/schemaFormTemplate/{templatename}/{org}")
	public ResponseEntity<ICIPSchemaForm> getSchemaFormTemplateByName(@PathVariable(name = "templatename")String templatename,
			@PathVariable(name = "org") String org) {
		return new ResponseEntity<ICIPSchemaForm>(schemaFormService.fetchSchemaFormTemplateByNameAndOrg(templatename,org) ,
				new HttpHeaders(), HttpStatus.OK);
	}
	
	@GetMapping("/schemaForms/{schema}/{org}")
	public ResponseEntity<List<ICIPSchemaForm>> getSchemaForms(@PathVariable(name = "schema") String schema,
			@PathVariable(name = "org") String org) {
		return new ResponseEntity<>(schemaFormService.fetchSchemaForm(schema, org), new HttpHeaders(),
				HttpStatus.OK);
	}

	/**
	 * Create Schema Name.
	 *
	 * @param org  the org
	 * @param alias the alias
	 * @return the schemas
	 */
	@GetMapping("/createName/{org}/{alias}")
	public ResponseEntity<String> createSchemaName(@PathVariable(name = "org") String org,
			@PathVariable("alias") String alias) {
		String name = schemaRegistryService.createName(org, alias);
		return new ResponseEntity<>(name, new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Creates the schema registry.
	 *
	 * @param name      the name
	 * @param org the org
	 * @param schemaDTO the schema DTO
	 * @return the response entity
	 * @throws URISyntaxException the URI syntax exception
	 */
	@PostMapping("/add/{nameStr}/{org}")
	public ResponseEntity<ICIPSchemaRegistry> createSchemaRegistry(@PathVariable(name = "nameStr") String name,
			@PathVariable(name = "org") String org, @RequestBody ICIPSchemaRegistryDTO schemaDTO)
			throws URISyntaxException {
		ModelMapper modelmapper = new ModelMapper();
		schemaDTO.setLastmodifiedby(ICIPUtils.getUser(claim));
		schemaDTO.setLastmodifieddate(Timestamp.from(Instant.now()));
		schemaDTO.setAlias(schemaDTO.getAlias());
		schemaDTO.setOrganization(org);
		ICIPSchemaRegistry schema = modelmapper.map(schemaDTO, ICIPSchemaRegistry.class);
		schema = schemaRegistryService.save(name, org, schema);
		logger.info("creating schema registry");
		return ResponseEntity.created(new URI("/schemaRegistry/add" + schema.getId()))
				.headers(ICIPHeaderUtil.createEntityCreationAlert(ENTITY_NAME, schema.getId().toString())).body(schema);
	}
	
	@PostMapping("/add/schemaForm")
	public ResponseEntity<ICIPSchemaForm> createSchemaFormTemplate(@RequestBody ICIPSchemaFormDTO schemaForm)
			throws URISyntaxException {
		ModelMapper modelmapper = new ModelMapper();
//		schemaDTO.setLastmodifiedby(ICIPUtils.getUser(claim));
//		schemaDTO.setLastmodifieddate(Timestamp.from(Instant.now()));
//		schemaDTO.setAlias(schemaDTO.getAlias());
//		schemaDTO.setOrganization(org);
		if(schemaForm.getName() == null && schemaForm.getName().isEmpty() || schemaForm.getName().isBlank()) {
			String name = schemaRegistryService.createName(schemaForm.getOrganization(),schemaForm.getAlias());
			schemaForm.setName(name);
		}
		ICIPSchemaForm schema = modelmapper.map(schemaForm, ICIPSchemaForm.class);
		schema = schemaFormService.save(schema);
		logger.info("creating schema form");
		return ResponseEntity.created(new URI("/schemaRegistry/add/schemaForm" + schema.getId()))
				.headers(ICIPHeaderUtil.createEntityCreationAlert(ENTITY_NAME, schema.getId().toString())).body(schema);
	}

	/**
	 * Gets the schema len by group.
	 *
	 * @param group  the group
	 * @param org    the org
	 * @param search the search
	 * @return the schema len by group
	 */
	@GetMapping("/all/len/{group}/{org}")
	public ResponseEntity<Long> getSchemaLenByGroup(@PathVariable(name = "group") String group,
			@PathVariable(name = "org") String org, @RequestParam(name = "search", required = false) String search) {
		Long len = schemaRegistryService.getSchemaLenByGroupAndOrg(group, org, search);
		logger.info("Gets the schema len by group");
		return new ResponseEntity<>(len, new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Delete schema registry.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the response entity
	 */
	@DeleteMapping("/delete/{nameStr}/{org}")
	public ResponseEntity<Void> deleteSchemaRegistry(@PathVariable(name = "nameStr") String name,
			@PathVariable(name = "org") String org) {
		logger.info("deleting schema ");
		schemaRegistryService.delete(name, org);
		return ResponseEntity.ok().headers(ICIPHeaderUtil.createEntityDeletionAlert(ENTITY_NAME, name)).build();
	}
	
	@DeleteMapping("/deleteFormtemplate/{id}")
	public ResponseEntity<Void> deleteSchemaRegistry(@PathVariable(name = "id") Integer id) {
		logger.info("deleting schema ");
		schemaFormService.delete(id);
		return ResponseEntity.ok().headers(ICIPHeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
	}
	
	/**
	 * Gets the name and alias.
	 *
	 * @param groupName the group name
	 * @param org the org
	 * @return the name and alias
	 */
	@GetMapping("/groupings/{group}/{org}")
	public ResponseEntity<List<NameAndAliasDTO>> getNameAndAlias(@PathVariable("groupname") String groupName, @PathVariable("org") String org){
		return new ResponseEntity<>(schemaRegistryService.getNameAndAlias(groupName, org), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Handle all.
	 *
	 * @param ex the ex
	 * @return the response entity
	 */
	@ExceptionHandler(Exception.class)
	public ResponseEntity<Object> handleAll(Exception ex) {
		Throwable rootcause = ExceptionUtil.findRootCause(ex);
		return new ResponseEntity<>(new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, rootcause.getMessage(), "error occurred").getMessage(), new HttpHeaders(), new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, rootcause.getMessage(), "error occurred").getStatus());
	}
	
	

}