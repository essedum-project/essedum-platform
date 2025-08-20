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

package com.lfn.icip.icipmodelserver.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lfn.icip.icipmodelserver.service.IICIPModService;

// TODO: Auto-generated Javadoc
/**
 * The Class ICIPModService.
 *
 * @author essedum
 */
@Service
@Transactional
public class ICIPModService implements IICIPModService {

	/** The Constant log. */
	private static final Logger log = LoggerFactory.getLogger(ICIPModService.class);

	/** The i CIP pipeline model service. */
	@Autowired
	private ICIPPipelineModelService iCIPPipelineModelService;

	/**
	 * Copy blueprints.
	 *
	 * @param fromProjectName the from project name
	 * @param toProjectName   the to project name
	 * @return the boolean
	 */
	@Override
	public Boolean copyBlueprints(String fromProjectName, String toProjectName) {
		log.info("ICIP Adp data is getting copied");
		try {
			iCIPPipelineModelService.copy(fromProjectName, toProjectName);
		} catch (DataIntegrityViolationException e) {
			log.info("Proceeding with copy {}", e.getMessage());
		}
		log.info("ICIP Adp data copied");
		return true;
	}

}
