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
package com.infosys.icets.icip.dataset.factory;

import com.infosys.icets.icip.dataset.service.util.ICIPDataSourceServiceUtilRestAbstract;
import com.infosys.icets.icip.dataset.service.util.IICIPDataSourceServiceUtil;

// TODO: Auto-generated Javadoc
// 
/**
 * A factory for creating IICIPDataSourceServiceUtil objects.
 *
 * @author icets
 */
public interface IICIPDataSourceServiceUtilFactory {
	
	/**
	 * Gets the data source util.
	 *
	 * @param name the name
	 * @return the data source util
	 */
	IICIPDataSourceServiceUtil getDataSourceUtil(String name);
	
	/**
	 * Gets the data source util rest.
	 *
	 * @param name the name
	 * @return the data source util rest
	 */
	ICIPDataSourceServiceUtilRestAbstract getDataSourceUtilRest(String name);
}
