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