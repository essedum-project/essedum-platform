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
import java.util.List;
import java.util.Map;

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

import com.infosys.icets.ai.comm.lib.util.ICIPHeaderUtil;
import com.infosys.icets.ai.comm.lib.util.exceptions.ApiError;
import com.infosys.icets.ai.comm.lib.util.exceptions.ExceptionUtil;
import com.infosys.icets.icip.dataset.model.ICIPMashups;
//import com.infosys.icets.icip.dataset.service.IICIPMashupService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.tags.Tag;

// TODO: Auto-generated Javadoc
//COMMENTED AS PART OF CODE CLEANUP
// 
/**
 * The Class ICIPSchemaRegistryController.
 *
 * @author icets
 */
//@RestController
//@Timed
//@RequestMapping(path = "/${icip.pathPrefix}/mashups")
//@Tag(name= "mashups")
//public class ICIPMashupsController {
//
//	/** The Constant ENTITY_NAME. */
//	private static final String ENTITY_NAME = "mashups";
//
//	/** The Constant logger. */
//	private static final Logger logger = LoggerFactory.getLogger(ICIPMashupsController.class);
//
//	/** The schema registry service. */
//	@Autowired
//	private IICIPMashupService mashupService;
//	
//	
//	
//	

//    /** The claim. */
//	@Value("${security.claim:#{null}}")
//	private String claim;
//
//	/**
//	 * Gets all mashups.
//	 *
//	 * @param org the org
//	 * @return all mashups
//	 */
//	@GetMapping("/all")
//	public ResponseEntity<List<ICIPMashups>> getMashups(@RequestParam(name = "org") String org) {
//		logger.info("Get all schema of organziation {}", org);
//		return new ResponseEntity<>(mashupService.getMashupsByOrg(org), new HttpHeaders(), HttpStatus.OK);
//	}
//
//	@GetMapping("/all/{org}")
//	public ResponseEntity<List<ICIPMashups>> getMashupsByOrge(@PathVariable(name = "org") String org) {
//		logger.info("Get all schema of organziation {}", org);
//		return new ResponseEntity<>(mashupService.getMashupsByOrg(org), new HttpHeaders(), HttpStatus.OK);
//	}
//
//	
//	/**
//	 * Gets the mashup.
//	 *
//	 * @param name the name
//	 * @param org  the org
//	 * @return the mashup
//	 */
//	@GetMapping("/{nameStr}/{org}")
//	public ResponseEntity<ICIPMashups> getMashupByName(@PathVariable(name = "nameStr") String name,
//			@PathVariable(name = "org") String org) {
//		return new ResponseEntity<>(mashupService.getMashupByName(name, org), new HttpHeaders(), HttpStatus.OK);
//	}
//	
//	@DeleteMapping("/{nameStr}/{org}")
//	public ResponseEntity<Map<String, String>> deleteMashupByName(@PathVariable(name = "nameStr") String name,
//			@PathVariable(name = "org") String org) {
//		return new ResponseEntity<>(mashupService.deleteMashupByName(name, org), new HttpHeaders(), HttpStatus.OK);
//	}
//	
//	@PostMapping("/add")
//	public ResponseEntity<ICIPMashups> createMshup(@RequestBody ICIPMashups mashupDto)
//			throws URISyntaxException, SQLException {
//		logger.info("Creating mashup: {}", mashupDto.getName());
//		ICIPMashups iCIPMashupsFromDB=mashupService.getMashupByName(mashupDto.getName(), mashupDto.getOrganization());
//		if (iCIPMashupsFromDB != null && mashupDto.getId() == null)
//			return new ResponseEntity<>(iCIPMashupsFromDB, new HttpHeaders(), HttpStatus.OK);
//		ModelMapper modelmapper = new ModelMapper();
//		ICIPMashups mashups = modelmapper.map(mashupDto, ICIPMashups.class);
//		ICIPMashups result = mashupService.save(mashups);
//		return ResponseEntity.created(new URI("/mashups/" + result.getId()))
//				.headers(ICIPHeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString())).body(result);
//	}
//	
//	/**
//	 * Handle all.
//	 *
//	 * @param ex the ex
//	 * @return the response entity
//	 */
//	@ExceptionHandler(Exception.class)
//	public ResponseEntity<Object> handleAll(Exception ex) {
//		Throwable rootcause = ExceptionUtil.findRootCause(ex);
//		return new ResponseEntity<>(new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, rootcause.getMessage(), "error occurred").getMessage(), new HttpHeaders(), new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, rootcause.getMessage(), "error occurred").getStatus());
//	}
//	
	

//}