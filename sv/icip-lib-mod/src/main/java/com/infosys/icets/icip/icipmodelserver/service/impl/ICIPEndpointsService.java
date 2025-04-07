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
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.stereotype.Service;

import com.infosys.icets.ai.comm.lib.util.logger.JobLogger;
import com.infosys.icets.icip.dataset.model.ICIPSchemaRegistry;
import com.infosys.icets.icip.icipmodelserver.model.ICIPEndpoints;
import com.infosys.icets.icip.icipmodelserver.repository.ICIPEndpointsRepository;
import com.infosys.icets.icip.icipmodelserver.service.IICIPEndpointsService;

// TODO: Auto-generated Javadoc
/**
 * The Class ICIPPipelineModelService.
 *
 * @author icets
 */
@SuppressWarnings("deprecation")
@Service
@RefreshScope
public class ICIPEndpointsService implements IICIPEndpointsService {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPEndpointsService.class);

	/** The Constant joblog. */
	private static final Logger joblog = LoggerFactory.getLogger(JobLogger.class);

	/** The i CIP pipeline model repository. */
	@Autowired
	private ICIPEndpointsRepository icipEndpointsRepository;

	/**
	 * Find by id.
	 *
	 * @param id the id
	 * @return the ICIP pipeline model
	 */
	@Override
	public ICIPEndpoints findById(Integer id) {
		return icipEndpointsRepository.findById(id).orElse(null);
	}
	
	public ICIPEndpoints save(ICIPEndpoints endpoint) {
		return icipEndpointsRepository.save(endpoint);
	}
	
	@Override
	public void deleteById(Integer endpoint) {
		icipEndpointsRepository.deleteById(endpoint);	
	}}
