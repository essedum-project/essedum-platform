/**
 * @ 2023 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.iamp.usm.web.rest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.icets.ai.comm.lib.util.annotation.service.ConstantsService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping("/api/usm")
public class FileExtensionKeysResource {

	/** The log. */
	private final Logger log = LoggerFactory.getLogger(DashConstantResource.class);

	private final ConstantsService dash_constantService;

	public FileExtensionKeysResource(ConstantsService dash_constantService) {
		this.dash_constantService = dash_constantService;
	}

	/*
	 * For Refreshing the HashMap of com-lib-util with all the keys
	 */
	@GetMapping("/dash-constants/refresh")
	@Timed
	@Operation(summary = "Refresh the Cached usm configuration Map of Keys ", description = "API Will Refresh the Cached HashMap , which is getting used inside com lib util for File Validation. ")
	public ResponseEntity<?> refreshFileExnteionsKeysInUtil() {
		
	
		dash_constantService.refreshConfigKeyMap();
		return new ResponseEntity<>("Configuration Keys Refreshed Successfully", HttpStatus.OK);

	}

	/*
	 * For Refreshing the particular key in the HashMap of com-lib-util
	 */
//	@GetMapping("/dash-constants/refresh/value/")
//	@Timed
//	public ResponseEntity<?> refreshFileExnteionsKeys(@RequestHeader(value = "startKey") String key) {
//		return null;
//
//	}
}
