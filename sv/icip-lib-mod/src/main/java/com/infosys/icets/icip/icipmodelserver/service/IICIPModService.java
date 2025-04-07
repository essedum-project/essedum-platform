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
package com.infosys.icets.icip.icipmodelserver.service;


// TODO: Auto-generated Javadoc
/**
 * The Interface IICIPModService.
 *
 * @author icets
 */
public interface IICIPModService {
	
	/**
	 * Copy blueprints.
	 *
	 * @param fromProjectName the from project name
	 * @param toProjectName the to project name
	 * @return the boolean
	 * @throws Exception the exception
	 */
	Boolean copyBlueprints(String fromProjectName, String toProjectName) throws Exception;

}
