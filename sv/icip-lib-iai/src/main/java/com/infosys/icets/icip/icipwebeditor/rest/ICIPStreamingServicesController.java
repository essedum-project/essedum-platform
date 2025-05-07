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

import java.io.IOException;
import java.sql.SQLException;

import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.api.errors.InvalidRemoteException;
import org.eclipse.jgit.api.errors.TransportException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.icets.ai.comm.lib.util.ICIPHeaderUtil;
import com.infosys.icets.icip.icipwebeditor.service.IICIPStreamingServiceService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Hidden;

// TODO: Auto-generated Javadoc
/**
 * The Class ICIPStreamingServicesController.
 *
 * @author icets
 */
@RestController
@Timed
@Hidden
@RequestMapping(path = "/${icip.pathPrefix}/streamingServices")
public class ICIPStreamingServicesController {

	/** The Constant ENTITY_NAME. */
	private static final String ENTITY_NAME = "streamingServices";

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPStreamingServicesController.class);

	/** The streaming services service. */
	@Autowired
	private IICIPStreamingServiceService streamingServicesService;

	
	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;

	/**
	 * Delete streaming services.
	 *
	 * @param id the id
	 * @return the response entity
	 * @throws SQLException the SQL exception
	 * @throws GitAPIException 
	 * @throws IOException 
	 * @throws TransportException 
	 * @throws InvalidRemoteException 
	 */
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<Void> deleteStreamingServices(@PathVariable(name = "id") Integer id) throws SQLException, InvalidRemoteException, TransportException, IOException, GitAPIException {
		streamingServicesService.delete(id);
		logger.info("Deleting streaming service by Id : {}", id);
		return ResponseEntity.ok().headers(ICIPHeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString()))
				.build();
	}


}