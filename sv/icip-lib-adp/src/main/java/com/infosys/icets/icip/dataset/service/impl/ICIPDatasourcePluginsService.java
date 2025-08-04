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

package com.infosys.icets.icip.dataset.service.impl;

import java.util.List;

import org.json.JSONArray;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infosys.icets.icip.dataset.factory.IICIPDataSourceServiceUtilFactory;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;
import com.infosys.icets.icip.dataset.service.IICIPDatasourcePluginsService;
import com.infosys.icets.icip.dataset.service.util.ICIPDataSourceServiceUtilRestAbstract;
import com.infosys.icets.icip.dataset.service.util.IICIPDataSourceServiceUtil;

import net.minidev.json.JSONObject;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPDatasourcePluginsService.
 *
 * @author icets
 */
@Service
public class ICIPDatasourcePluginsService implements IICIPDatasourcePluginsService {

	/** The datasource factory. */
	// @Autowired
	private IICIPDataSourceServiceUtilFactory datasourceFactory;

	/** The data source list. */
	// @Autowired(required = true)
	private List<IICIPDataSourceServiceUtil> dataSourceList;

	ICIPDatasourcePluginsService(IICIPDataSourceServiceUtilFactory datasourceFactory,List<IICIPDataSourceServiceUtil> dataSourceList) {
	    this.datasourceFactory = datasourceFactory;
		this.dataSourceList = dataSourceList;
	}

	/**
	 * Gets the data source service.
	 *
	 * @param datasource the datasource
	 * @return the data source service
	 */
	@Override
	public IICIPDataSourceServiceUtil getDataSourceService(ICIPDatasource datasource) {
		return datasourceFactory.getDataSourceUtil(String.format("%s%s", datasource.getType().toLowerCase(), "source"));
	}
	
	/**
	 * Gets the data source service rest.
	 *
	 * @param datasource the datasource
	 * @return the data source service rest
	 */
	@Override
	public ICIPDataSourceServiceUtilRestAbstract getDataSourceServiceRest(ICIPDatasource datasource) {
		return datasourceFactory.getDataSourceUtilRest(String.format("%s%s", datasource.getType().toLowerCase(), "source"));
	}

	/**
	 * Gets the groups len by org.
	 *
	 * @param org the org
	 * @return the groups len by org
	 */
	@Override
	public Long getGroupsLenByOrg(String org) {
		return (long) dataSourceList.size();
	}

	/**
	 * Gets the data sources json.
	 *
	 * @param page the page
	 * @param size the size
	 * @return the data sources json
	 */
	@Override
	public JSONArray getDataSourcesJson(int page, int size) {
		JSONArray jarr = new JSONArray();
		dataSourceList.stream().forEach(plugin -> jarr.put(plugin.getJson()));
//		JSONArray jarr1 = new JSONArray();
//		JSONObject pluginJson = new JSONObject();
//		for (int i=0;i<jarr.length();i++) {
//			for (String key : jarr.getJSONObject(i).keySet()) {
//				if(key.equals("type") || key.equals("category")) {
//					pluginJson.put(key,jarr.getJSONObject(i).getString(key));
//				}
//	        }
//			jarr1.put(pluginJson);
//		}
		return jarr;
	}

	/**
	 * Gets the datasource count.
	 *
	 * @return the datasource count
	 */
	@Override
	public int getDatasourceCount() {
		return dataSourceList.size();
	}

}
