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
package com.infosys.icets.icip.icipwebeditor.service.impl;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.infosys.icets.icip.icipwebeditor.model.ICIPPipelinePID;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPPipelinePIDRepository;
import com.infosys.icets.icip.icipwebeditor.service.IICIPPipelinePIDService;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPPipelinePIDService.
 *
 * @author icets
 */
@Service
public class ICIPPipelinePIDService implements IICIPPipelinePIDService {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPPipelinePIDService.class);

	/** The pipeline pid repository. */
	private ICIPPipelinePIDRepository pipelinePidRepository;

	/**
	 * Instantiates a new ICIP pipeline PID service.
	 *
	 * @param pipelinePidRepository the pipeline pid repository
	 */
	public ICIPPipelinePIDService(ICIPPipelinePIDRepository pipelinePidRepository) {
		this.pipelinePidRepository = pipelinePidRepository;
	}

	/**
	 * Save.
	 *
	 * @param pipelinePID the pipeline PID
	 * @return the ICIP pipeline PID
	 */
	@Override
	public ICIPPipelinePID save(ICIPPipelinePID pipelinePID) {
		logger.info("saving pipeline pid");
		return pipelinePidRepository.save(pipelinePID);
	}

	/**
	 * Find by instanceid and status.
	 *
	 * @param instanceid the instanceid
	 * @param status the status
	 * @return the list
	 */
	@Override
	public List<ICIPPipelinePID> findByInstanceidAndStatus(String instanceid, Integer status) {
//		logger.debug("finding pipeline pid by instance id and status : {} - {}", instanceid, status);
		return pipelinePidRepository.findByInstanceidAndStatus(instanceid, status);
	}

	/**
	 * Find by instanceid and jobid.
	 *
	 * @param instanceid the instanceid
	 * @param jobid the jobid
	 * @return the ICIP pipeline PID
	 */
	@Override
	public ICIPPipelinePID findByInstanceidAndJobid(String instanceid, String jobid) {
		return pipelinePidRepository.findByJobidAndInstanceid(jobid, instanceid);
	}

}
