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
package com.infosys.icets.icip.icipwebeditor.service;

import java.util.List;

import com.infosys.icets.icip.icipwebeditor.model.ICIPPipelinePID;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface IICIPPipelinePIDService.
 *
 * @author icets
 */
public interface IICIPPipelinePIDService {

	/**
	 * Save.
	 *
	 * @param pipelinePID the pipeline PID
	 * @return the ICIP pipeline PID
	 */
	ICIPPipelinePID save(ICIPPipelinePID pipelinePID);

	/**
	 * Find by instanceid and status.
	 *
	 * @param instanceid the instanceid
	 * @param status the status
	 * @return the list
	 */
	List<ICIPPipelinePID> findByInstanceidAndStatus(String instanceid, Integer status);

	/**
	 * Find by instanceid and jobid.
	 *
	 * @param instanceid the instanceid
	 * @param jobid the jobid
	 * @return the ICIP pipeline PID
	 */
	ICIPPipelinePID findByInstanceidAndJobid(String instanceid, String jobid);

}
