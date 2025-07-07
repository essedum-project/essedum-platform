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
