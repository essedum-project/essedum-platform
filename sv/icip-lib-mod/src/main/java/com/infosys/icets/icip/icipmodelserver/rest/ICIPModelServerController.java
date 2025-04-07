/**
 * @ 2020 - 2021 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.icip.icipmodelserver.rest;


import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.infosys.icets.icip.icipmodelserver.model.ICIPModelServers;
import com.infosys.icets.icip.icipmodelserver.model.ICIPPipelineModel;
import com.infosys.icets.icip.icipmodelserver.service.impl.ICIPModelServersService;
import com.infosys.icets.icip.icipmodelserver.v2.service.impl.ICIPModelPluginsService;

import io.micrometer.core.annotation.Timed;


// TODO: Auto-generated Javadoc
/**
 * The Class ICIPPipelineModelController.
 *
 * @author icets
 */
@RestController
@Timed
@RequestMapping(path = "/${icip.pathPrefix}/modelserver")
public class ICIPModelServerController {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPModelServerController.class);


	/** The model server service. */
	@Autowired
	private ICIPModelServersService modelServerService;

	
	/**
	 * Gets the model servers.
	 *
	 * @return the model servers
	 */
	@GetMapping("/all")
	public ResponseEntity<List<ICIPModelServers>> getModelServers() {
		logger.info("Getting Model Servers");
		return new ResponseEntity<>(modelServerService.findAll(), new HttpHeaders(), HttpStatus.OK);
	}
	
}