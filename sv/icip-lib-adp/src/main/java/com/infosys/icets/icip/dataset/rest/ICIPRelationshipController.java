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
package com.infosys.icets.icip.dataset.rest;

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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.icets.ai.comm.lib.util.ICIPHeaderUtil;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.icip.dataset.model.ICIPRelationship;
import com.infosys.icets.icip.dataset.model.dto.ICIPRelationshipDTO;
import com.infosys.icets.icip.dataset.service.IICIPRelationshipService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Hidden;

//COMMENTED AS PART OF API CLEANUP

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPRelationshipController.
 *
 * @author icets
 */
//@RestController
//@Timed
//@Hidden
//@RequestMapping(path = "/${icip.pathPrefix}/relationship")
//public class ICIPRelationshipController {
//
//	/** The relationship service. */
//	@Autowired
//	private IICIPRelationshipService relationshipService;
	
// COMMENTED AS PART OF CODE CLEANUP
	
//	/** The claim. */
//	@Value("${security.claim:#{null}}")
//	private String claim;
//	
//	/** The Constant ENTITY_NAME. */
//	private static final String ENTITY_NAME = "relationship";
//	
//	/** The Constant logger. */
//	private static final Logger logger = LoggerFactory.getLogger(ICIPRelationshipController.class);
//	
//	
//	/**
//	 * Gets all the relationships.
//	 *
//	 * @return all the relationships
//	 */
//	@GetMapping(path = "")
//	public ResponseEntity<List<ICIPRelationship>> getAllRelationships() {
//		return new ResponseEntity<>(relationshipService.getAllRelationships(), HttpStatus.OK);
//	}
//	
//	@GetMapping("/{org}")
//	public ResponseEntity<List<ICIPRelationship>> getAllRelationshipByOrg(@PathVariable(name = "org") String org) {
//		return new ResponseEntity<>(relationshipService.getAllRelationshipsByOrg(org), HttpStatus.OK);
//	}
//	
//	/**
//	 * Creates the relationship.
//	 *
//	 * @param relationshipDTO the relationship DTO
//	 * @return the response entity
//	 * @throws URISyntaxException the URI syntax exception
//	 * @throws SQLException       the SQL exception
//	 */
//	@PostMapping("/add")
//	public ResponseEntity<ICIPRelationship> createRelationship(@RequestBody ICIPRelationshipDTO relationshipDTO)
//			throws URISyntaxException, SQLException {
//		logger.info("Creating relationship : {}", relationshipDTO.getName());
//		relationshipDTO.setAlias(relationshipDTO.getAlias());
//		relationshipDTO.setLastmodifiedby(ICIPUtils.getUser(claim));
//		relationshipDTO.setLastmodifieddate(new Timestamp(System.currentTimeMillis()));
//		ModelMapper modelmapper = new ModelMapper();
//		ICIPRelationship rel = modelmapper.map(relationshipDTO, ICIPRelationship.class);
//		ICIPRelationship result = relationshipService.save(rel);
//		return ResponseEntity.created(new URI("/relationship/" + result.getId()))
//				.headers(ICIPHeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString())).body(result);
//	}
//	
//	/**
//	 * Update relationship.
//	 *
//	 * @param relationshipDTO the relationship DTO
//	 * @return the response entity
//	 * @throws URISyntaxException the URI syntax exception
//	 * @throws SQLException       the SQL exception
//	 */
//	@PutMapping("/update")
//	public ResponseEntity<ICIPRelationship> updateRelationship(@RequestBody ICIPRelationshipDTO relationshipDTO)
//			throws URISyntaxException, SQLException {
//		if (relationshipDTO.getId() == null) {
//			return createRelationship(relationshipDTO);
//		}
//		relationshipDTO.setLastmodifiedby(ICIPUtils.getUser(claim));
//		relationshipDTO.setLastmodifieddate(new Timestamp(System.currentTimeMillis()));
//		logger.info("Updating relationship : {}", relationshipDTO.getName());
//		ModelMapper modelmapper = new ModelMapper();
//		ICIPRelationship rel = modelmapper.map(relationshipDTO, ICIPRelationship.class);
//		ICIPRelationship result = relationshipService.update(rel);
//		return ResponseEntity.ok()
//				.headers(ICIPHeaderUtil.createEntityUpdateAlert(ENTITY_NAME, rel.getId().toString()))
//				.body(result);
//	}
//	
//	/**
//	 * Delete Relationship.
//	 *
//	 * @param id the id
//	 * @return the response entity
//	 * @throws SQLException the SQL exception
//	 */
//	@DeleteMapping("/delete/{id}")
//	public ResponseEntity<Void> deleteRelationship(@PathVariable(name = "id") Integer id) throws SQLException {
//		relationshipService.delete(id);
//		logger.info("Deleting relationship by Id : {}", id);
//		return ResponseEntity.ok().headers(ICIPHeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString()))
//				.build();
//	}
//	
//	/**
//	 * Gets the relationship.
//	 *
//	 * @param id the id
//	 * @return the relationship
//	 */
//	@GetMapping("/id/{id}")
//	public ResponseEntity<ICIPRelationship> getById(@PathVariable(name = "id") Integer id) {
//		ICIPRelationship rel = relationshipService.findOne(id);
//		logger.info("Fetching relationship by id : {} ", rel.getId());
//		return new ResponseEntity<>(rel, new HttpHeaders(), HttpStatus.OK);
//	}
//
//}