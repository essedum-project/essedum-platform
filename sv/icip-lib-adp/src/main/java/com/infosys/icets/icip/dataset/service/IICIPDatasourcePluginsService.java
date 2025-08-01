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
