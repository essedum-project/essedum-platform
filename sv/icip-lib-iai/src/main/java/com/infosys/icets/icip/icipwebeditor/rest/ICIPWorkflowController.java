/**
 * @ 2021 - 2022 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.icip.icipwebeditor.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.sql.SQLException;
import java.sql.Timestamp;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.icets.ai.comm.lib.util.ICIPHeaderUtil;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.NameEncoderService;
import com.infosys.icets.icip.icipwebeditor.model.ICIPWorkflow;
import com.infosys.icets.icip.icipwebeditor.model.ICIPWorkflowSpec;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPWorkflowDTO;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPWorkflowSpecDTO;
import com.infosys.icets.icip.icipwebeditor.service.IICIPWorkflowService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Hidden;

// TODO: Auto-generated Javadoc
/**
 * The Class ICIPWorkflowTrainingController.
 */
@RestController
@Timed
@Hidden
@RequestMapping(path = "/${icip.pathPrefix}/workflows")
public class ICIPWorkflowController {

	/** The Constant ENTITY_NAME. */
	private static final String ENTITY_NAME = "wkTrainings";

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPWorkflowController.class);

	/** The workflows service. */
	@Autowired
	private IICIPWorkflowService workflowService;
	
	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;

	@Autowired
	private NameEncoderService ncs;
	
	
	//COMMENTED AS PART OF CODE CLEANUP
	
//	/**
//	 * Gets the all workflows.
//	 *
//	 * @return the all workflows
//	 */
//	@GetMapping(path = "")
//	public ResponseEntity<List<ICIPWorkflow>> getAllWorkflows() {
//		return new ResponseEntity<>(workflowService.getAllWorkflows(), HttpStatus.OK);
//	}
//
//	/**
//	 * Gets the workflows.
//	 *
//	 * @param id the id
//	 * @return the workflows
//	 */
//	@GetMapping("/id/{id}")
//	public ResponseEntity<ICIPWorkflow> getById(@PathVariable(name = "id") Integer id) {
//		logger.info("Fetching workflows by id : {} ", id);
//		return new ResponseEntity<>(workflowService.findOne(id), new HttpHeaders(), HttpStatus.OK);
//	}
//	
//	
//	
//
//	/**
//	 * Gets the workflow by spec id.
//	 *
//	 * @param wkspec the wkspec
//	 * @return the workflow by spec id
//	 */
//	@GetMapping("/specid/{id}")
//	public ResponseEntity<List<ICIPWorkflow>> getWorkflowBySpecId(@PathVariable(name = "id") Integer wkspec) {
//		ICIPWorkflowSpec workflowspec = workflowService.findById(wkspec);
//		logger.info("Fetching workflow by wkspec : {} ", wkspec);
//		return new ResponseEntity<>( workflowService.findByWkspec(workflowspec), new HttpHeaders(), HttpStatus.OK);
//	}
//		
//	/**
//	 * Gets the workflow by spec name.
//	 *
//	 * @param wkspec the wkspec
//	 * @return the workflow by spec name
//	 */
//	@GetMapping("/specname/{name}/{org}")
//	public ResponseEntity<List<ICIPWorkflow>> getWorkflowBySpecName(@PathVariable(name = "name") String wkspec,
//			@PathVariable(name = "org") String org) {
//		logger.info("Fetching workflow by wkspec : {} ", wkspec);
//		return new ResponseEntity<>(workflowService.findByWkspecNameAndOrg(wkspec,org), new HttpHeaders(), HttpStatus.OK);
//	}	
//	
//
//	/**
//	 * Gets the all workflow specs.
//	 *
//	 * @return the all workflow specs
//	 */
//	@GetMapping(path = "/specs")
//	public ResponseEntity<List<ICIPWorkflowSpec>> getAllWorkflowSpecs() {
//		return new ResponseEntity<>(workflowService.getAllWorkflowSpecs(), HttpStatus.OK);
//	}
//	
//	/**
//	 * Gets the workflow spec.
//	 *
//	 * @param name the name
//	 * @return the workflow spec
//	 * the workflows
//	 */
//	@GetMapping("/spec/name/{name}")
//	public ResponseEntity<ICIPWorkflowSpec> getWorkflowSpec(@PathVariable(name = "name") String name) {
//		logger.info("Fetching workflow by name : {} ", name);
//		return new ResponseEntity<>( workflowService.findByName(name), new HttpHeaders(), HttpStatus.OK);
//	}
//
//
//	/**
//	 * Gets the workflow spec.
//	 *
//	 * @param id the id
//	 * @return the workflow spec
//	 */
//	@GetMapping("/spec/id/{id}")
//	public ResponseEntity<ICIPWorkflowSpec> getWorkflowSpecById(@PathVariable(name = "id") Integer id) {
//		return new ResponseEntity<>(workflowService.findById(id), new HttpHeaders(), HttpStatus.OK);
//	}
//
//	/**
//	 * Gets the workflows.
//	 *
//	 * @param name the name
//	 * @param org  the org
//	 * @return the workflows
//	 */
//	@GetMapping("/{name}/{org}")
//	public ResponseEntity<ICIPWorkflow> getByNameAndOrg(@PathVariable(name = "name") String name,
//			@PathVariable(name = "org") String org) {
//		logger.info("Fetching workflows by name : {}-{}", name, org);
//		return new ResponseEntity<>(workflowService.getWorkflow(name, org), new HttpHeaders(), HttpStatus.OK);
//	}
//
//	/**
//	 * Creates the workflow.
//	 *
//	 * @param workflowtrainingDTO the workflow training DTO
//	 * @param org                 the org
//	 * @return the response entity
//	 * @throws URISyntaxException the URI syntax exception
//	 * @throws SQLException       the SQL exception
//	 */
//	@PostMapping("/add")
//	public ResponseEntity<ICIPWorkflow> createWorkflow(@RequestBody ICIPWorkflowDTO workflowtrainingDTO,
//			@RequestAttribute(required = false, name = "organization") String org)
//			throws URISyntaxException, SQLException {
//		logger.info("Creating workflow : {}", workflowtrainingDTO.getAlias());
//		workflowtrainingDTO.setUpdatedBy(ICIPUtils.getUser(claim));
//		workflowtrainingDTO.setUpdatedOn(new Timestamp(System.currentTimeMillis()));
////		workflowtrainingDTO.setAlias(workflowtrainingDTO.getName());
//		workflowtrainingDTO.setName(createName(workflowtrainingDTO.getOrganization(), workflowtrainingDTO.getAlias()));
//		ModelMapper modelmapper = new ModelMapper();
//		ICIPWorkflow streamingServices = modelmapper.map(workflowtrainingDTO, ICIPWorkflow.class);
//		ICIPWorkflow result = workflowService.save(streamingServices);
//		return ResponseEntity.created(new URI("/workflows/" + result.getId()))
//				.headers(ICIPHeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString())).body(result);
//	}
//	
//	public String createName(String org, String alias) {
//		boolean uniqueName = true;
//		String name = null;
//		do {
//			name = ncs.nameEncoder(org, alias);
//			uniqueName = workflowService.countByName(name) == 0;
//		} while (!uniqueName);
//		logger.info(name);
//		return name;
//	}
//	
//	
//	/**
//	 * Creates the workflow Spec.
//	 *
//	 * @param workflowSpecDto the workflow spec DTO
//	 * @return the response entity
//	 * @throws URISyntaxException the URI syntax exception
//	 * @throws SQLException       the SQL exception
//	 */
//	@PostMapping("/addspec")
//	public ResponseEntity<ICIPWorkflowSpec> createWorkflowSpec(@RequestBody ICIPWorkflowSpecDTO workflowSpecDto)
//			throws URISyntaxException, SQLException {
//		logger.info("Creating workflow Spec: {}", workflowSpecDto.getWkname());
//		ModelMapper modelmapper = new ModelMapper();
//		ICIPWorkflowSpec streamingServices = modelmapper.map(workflowSpecDto, ICIPWorkflowSpec.class);
//		ICIPWorkflowSpec result = workflowService.saveSpec(streamingServices);
//		return ResponseEntity.created(new URI("/workflows/" + result.getId()))
//				.headers(ICIPHeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString())).body(result);
//	}
//	
//	/**
//	 * Update workflow training.
//	 *
//	 * @param workflowspecDto the workflow training DTO
//	 * @return the response entity
//	 * @throws URISyntaxException the URI syntax exception
//	 * @throws SQLException       the SQL exception
//	 */
//	@PutMapping("/updatespec")
//	public ResponseEntity<ICIPWorkflowSpec> updateWorkflowSpec(@RequestBody ICIPWorkflowSpecDTO workflowspecDto)
//			throws URISyntaxException, SQLException {
//		if (workflowspecDto.getId() == null) {
//			return createWorkflowSpec(workflowspecDto);
//		}
//		logger.info("Updating workflow : {}", workflowspecDto.getWkname());
//		ModelMapper modelmapper = new ModelMapper();
//		ICIPWorkflowSpec workflowspec = modelmapper.map(workflowspecDto, ICIPWorkflowSpec.class);
//		ICIPWorkflowSpec result = workflowService.updateSpec(workflowspec);
//		return ResponseEntity.ok()
//				.headers(ICIPHeaderUtil.createEntityUpdateAlert(ENTITY_NAME, workflowspec.getId().toString()))
//				.body(result);
//	}
//
//	/**
//	 * Update workflow.
//	 *
//	 * @param workflowtrainingDTO the workflow training DTO
//	 * @param org                 the org
//	 * @return the response entity
//	 * @throws URISyntaxException the URI syntax exception
//	 * @throws SQLException       the SQL exception
//	 */
//	@PutMapping("/update")
//	public ResponseEntity<ICIPWorkflow> updateWorkflow(@RequestBody ICIPWorkflowDTO workflowtrainingDTO,
//			@RequestAttribute(required = false, name = "organization") String org)
//			throws URISyntaxException, SQLException {
//		if (workflowtrainingDTO.getId() == null) {
//			return createWorkflow(workflowtrainingDTO, org);
//		}
//		workflowtrainingDTO.setUpdatedBy(ICIPUtils.getUser(claim));
//		workflowtrainingDTO.setUpdatedOn(new Timestamp(System.currentTimeMillis()));
//		logger.info("Updating workflow : {}", workflowtrainingDTO.getName());
//		ModelMapper modelmapper = new ModelMapper();
//		ICIPWorkflow workflowtraining = modelmapper.map(workflowtrainingDTO, ICIPWorkflow.class);
//		ICIPWorkflow result = workflowService.update(workflowtraining);
//		return ResponseEntity.ok()
//				.headers(ICIPHeaderUtil.createEntityUpdateAlert(ENTITY_NAME, workflowtraining.getId().toString()))
//				.body(result);
//	}
//
//	/**
//	 * Delete workflow.
//	 *
//	 * @param id the id
//	 * @return the response entity
//	 * @throws SQLException the SQL exception
//	 */
//	@DeleteMapping("/delete/{id}")
//	public ResponseEntity<Void> deleteWorkflow(@PathVariable(name = "id") Integer id) throws SQLException {
//		workflowService.delete(id);
//		logger.info("Deleting workflow by Id : {}", id);
//		return ResponseEntity.ok().headers(ICIPHeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString()))
//				.build();
//	}	
//	
//	@DeleteMapping("/deleteWorflowSpec/{id}")
//	public ResponseEntity<Void> deleteWorkflowSpec(@PathVariable(name = "id") Integer id) throws SQLException {
//		workflowService.deleteSpec(id);
//		
//		logger.info("Deleting workflow by Id : {}", id);
//		return ResponseEntity.ok().headers(ICIPHeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString()))
//				.build();
//	}

	
}
