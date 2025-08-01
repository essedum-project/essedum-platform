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
