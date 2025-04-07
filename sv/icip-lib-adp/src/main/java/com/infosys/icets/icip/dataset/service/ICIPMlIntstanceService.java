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
package com.infosys.icets.icip.dataset.service;

import java.security.NoSuchAlgorithmException;
import java.util.List;

import com.infosys.icets.icip.dataset.model.ICIPMlIntstance;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface ICIPMlIntstanceService.
 *
 * @author icets
 */
public interface ICIPMlIntstanceService {

	/**
	 * Save.
	 *
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 */
	ICIPMlIntstance save(String name, ICIPMlIntstance iCIPMlIntstance) throws NoSuchAlgorithmException;

	/**
	 * Gets the mlintstances by org and name.
	 *
	 * @param org  the org
	 * @param name the name
	 * @return the mlintstances by org and name
	 */
	ICIPMlIntstance getICIPMlIntstancesByNameAndOrg(String name, String org);

	/**
	 * Creates the name.
	 *
	 * @param org   the org
	 * @param alias the alias
	 * @return the string
	 */
	String createName(String org, String alias);

	/**
	 * Count by name.
	 *
	 * @param name the name
	 * @return the long
	 */

	public int countByName(String name);

	void delete(String name, String org);

	List<ICIPMlIntstance> getICIPMlIntstancesByAliasAndOrg(String alias, String org);
	
	List<ICIPMlIntstance> getICIPMlIntstancesByOrg(String org);

}
