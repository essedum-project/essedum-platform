package com.lfn.icip.icipmodelserver.v2.service;

import org.json.JSONArray;

import com.lfn.icip.icipmodelserver.v2.service.util.IICIPModelServiceUtil;

public interface IICIPModelPluginsService {

	/**
	 * Gets the model service.
	 *
	 * @param datasource the datasource
	 * @return the data source service
	 */
	IICIPModelServiceUtil getModelService(String type);
	
	/**
	 * Gets the groups len by org.
	 *
	 * @param org the org
	 * @return the groups len by org
	 */
	Long getGroupsLenByOrg(String org);

	/**
	 * Gets the ModelService json.
	 *
	 * @param page the page
	 * @param size the size
	 * @return the ModelService json
	 */
	JSONArray getModelServiceJson(int page, int size);

	/**
	 * Gets the ModelService count.
	 *
	 * @return the ModelService count
	 */
	int getModelServiceCount();




}
