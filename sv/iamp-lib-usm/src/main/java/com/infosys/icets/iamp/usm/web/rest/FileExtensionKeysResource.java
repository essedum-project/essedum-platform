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
