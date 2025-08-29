package com.lfn.icip.icipmodelserver.v2.service.impl;

import java.util.List;

import org.json.JSONArray;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lfn.icip.icipmodelserver.v2.factory.IICIPModelServiceUtilFactory;
import com.lfn.icip.icipmodelserver.v2.service.IICIPModelPluginsService;
import com.lfn.icip.icipmodelserver.v2.service.util.IICIPModelServiceUtil;

// 
/**
 * The Class ICIPDatasourcePluginsService.
 *
 * @author essedum
 */
@Service
public class ICIPModelPluginsService implements IICIPModelPluginsService {

	/** The model factory. */
	@Autowired
	private IICIPModelServiceUtilFactory modelFactory;
	
	/** The model service list. */
	@Autowired
	private List<IICIPModelServiceUtil> modelPluginList;

	/**
	 * Gets the model service.
	 *
	 * @param datasource the datasource
	 * @return the data source service
	 */
	@Override
	public IICIPModelServiceUtil getModelService(String type) {
		return modelFactory.getModelServiceUtil(String.format("%s%s", type.toLowerCase(), "modelservice"));
	}
	
	/**
	 * Gets the groups len by org.
	 *
	 * @param org the org
	 * @return the groups len by org
	 */
	@Override
	public Long getGroupsLenByOrg(String org) {
		return (long) modelPluginList.size();
	}

	/**
	 * Gets the ModelService json.
	 *
	 * @param page the page
	 * @param size the size
	 * @return the ModelService json
	 */
	@Override
	public JSONArray getModelServiceJson(int page, int size) {
		JSONArray jarr = new JSONArray();
		modelPluginList.stream().forEach(plugin -> jarr.put(plugin.getJson()));
		return jarr;
	}

	
	
	/**
	 * Gets the ModelService count.
	 *
	 * @return the ModelService count
	 */
	@Override
	public int getModelServiceCount() {
		return modelPluginList.size();
	}


}
