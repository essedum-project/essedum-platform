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

import org.json.JSONArray;

import com.infosys.icets.icip.dataset.model.ICIPDatasource;
import com.infosys.icets.icip.dataset.service.util.ICIPDataSourceServiceUtilRestAbstract;
import com.infosys.icets.icip.dataset.service.util.IICIPDataSourceServiceUtil;

// TODO: Auto-generated Javadoc
/**
 * The Interface IICIPDatasourcePluginsService.
 */
public interface IICIPDatasourcePluginsService {

	/**
	 * Gets the data source service.
	 *
	 * @param datasource the datasource
	 * @return the data source service
	 */
	IICIPDataSourceServiceUtil getDataSourceService(ICIPDatasource datasource);
	
	/**
	 * Gets the data source service rest.
	 *
	 * @param datasource the datasource
	 * @return the data source service rest
	 */
	ICIPDataSourceServiceUtilRestAbstract getDataSourceServiceRest(ICIPDatasource datasource);

	/**
	 * Gets the groups len by org.
	 *
	 * @param org the org
	 * @return the groups len by org
	 */
	Long getGroupsLenByOrg(String org);

	/**
	 * Gets the data sources json.
	 *
	 * @param page the page
	 * @param size the size
	 * @return the data sources json
	 */
	JSONArray getDataSourcesJson(int page, int size);

	/**
	 * Gets the datasource count.
	 *
	 * @return the datasource count
	 */
	int getDatasourceCount();

}
