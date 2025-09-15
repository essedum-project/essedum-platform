package com.lfn.icip.icipwebeditor.service.impl;

import java.util.List;

import org.json.JSONArray;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lfn.icip.icipwebeditor.IICIPJobRuntimeServiceUtil;
import com.lfn.icip.icipwebeditor.factory.IICIPJobRuntimeServiceUtilFactory;
import com.lfn.icip.icipwebeditor.service.IICIPJobRuntimePluginsService;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPDatasourcePluginsService.
 *
 * @author essedum
 */
@Service
public class ICIPJobRuntimePluginsService implements IICIPJobRuntimePluginsService {

	/** The datasource factory. */
	@Autowired
	private IICIPJobRuntimeServiceUtilFactory jobRuntimeFactory;

	/** The data source list. */
	@Autowired
	private List<IICIPJobRuntimeServiceUtil> jobRuntimeList;

	/**
	 * Gets the job runtime len.
	 *
	 * @return the runtime len by
	 */
	@Override
	public int getJobRuntimeCount() {
		return jobRuntimeList.size();
	}

	/**
	 * Gets the runtime json.
	 * 
	 * @return the runtime json
	 */
	@Override
	public JSONArray getJobRuntimeJson() {
		JSONArray jarr = new JSONArray();
		jobRuntimeList.stream().forEach(plugin -> jarr.put(plugin.getJson()));
		return jarr;
	}

	public Class<? extends IICIPJobRuntimeServiceUtil> getClassType(String runtime) {
		return jobRuntimeFactory.getJobRuntimeServiceUtil(runtime).getClass();
	}

}
