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
package com.infosys.icets.icip.icipmodelserver.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.icets.icip.icipmodelserver.service.IICIPModService;

// TODO: Auto-generated Javadoc
/**
 * The Class ICIPModService.
 *
 * @author icets
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
