/* @ 2021 - 2022 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.icip.dataset.rest;

import java.security.NoSuchAlgorithmException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.icets.icip.dataset.model.ICIPMlIntstance;
import com.infosys.icets.icip.dataset.service.ICIPMlIntstanceService;
import io.micrometer.core.annotation.Timed;
//COMMENTED AS PART OF CODE CLEANUP
/**
 * The Class ICIPSpecTemplatesController.
 *
 * @author icets
 */
//@RestController
//@Timed
//@RequestMapping("/${icip.pathPrefix}/instances")
//@RefreshScope
//public class ICIPMlIntstanceController {
//
//	/** The Constant logger. */
//	private static final Logger logger = LoggerFactory.getLogger(ICIPMlIntstanceController.class);
//
//	@Autowired
//	ICIPMlIntstanceService iCIPMlIntstanceService;
//	
//
//	
//	
//	/* Fetches MlIntstance by Name and Organization */
//	@GetMapping("/{name}/{org}")
//	public ResponseEntity<ICIPMlIntstance> getICIPMlIntstancesByNameAndOrg(@PathVariable("name") String name,
//			@PathVariable("org") String org) {
//		return new ResponseEntity<>(iCIPMlIntstanceService.getICIPMlIntstancesByNameAndOrg(name, org),
//				new HttpHeaders(), HttpStatus.OK);
//	}
//
//	@GetMapping("/searchByAlias/{alias}/{org}")
//	public ResponseEntity<List<ICIPMlIntstance>> getICIPMlIntstancesByAliasAndTypeAndOrg(
//			@PathVariable("alias") String alias, @PathVariable("org") String org) {
//		return new ResponseEntity<>(iCIPMlIntstanceService.getICIPMlIntstancesByAliasAndOrg(alias, org),
//				new HttpHeaders(), HttpStatus.OK);
//	}
//
//	/* Fetches count of MlIntstance by Name */
//	@GetMapping("/count/byName/{name}")
//	public ResponseEntity<Integer> countByName(@PathVariable("name") String name) {
//		return new ResponseEntity<>(iCIPMlIntstanceService.countByName(name), new HttpHeaders(), HttpStatus.OK);
//	}
//
//	@PostMapping("/add")
//	public ResponseEntity<ICIPMlIntstance> createIntstance(@RequestBody ICIPMlIntstance iCIPMlIntstance)
//			throws NoSuchAlgorithmException {
//		logger.info("creating mlintstance:{}", iCIPMlIntstance.getAlias());
//		return new ResponseEntity<>(iCIPMlIntstanceService.save(null, iCIPMlIntstance), new HttpHeaders(),
//				HttpStatus.OK);
//	}
//
//	@DeleteMapping("/delete/{nameStr}/{org}")
//	public ResponseEntity<Void> deleteIntstance(@PathVariable(name = "nameStr") String name,
//			@PathVariable(name = "org") String org) {
//		logger.info("deleting mlintstance:{}", name);
//		iCIPMlIntstanceService.delete(name, org);
//		return ResponseEntity.ok().build();
//	}
//
//}
