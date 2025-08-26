package com.lfn.icip.icipwebeditor.service.impl;

import java.util.List;

import org.json.JSONArray;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lfn.icip.icipwebeditor.IICIPJobServiceUtil;
import com.lfn.icip.icipwebeditor.factory.IICIPJobServiceUtilFactory;
import com.lfn.icip.icipwebeditor.service.IICIPJobsPluginsService;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPDatasourcePluginsService.
 *
 * @author essedum
 */
@Service
public class ICIPJobsPluginsService implements IICIPJobsPluginsService {

	/** The plugin factory. */
	@Autowired
	private IICIPJobServiceUtilFactory jobFactory;

	/** The data source list. */
	@Autowired
	private List<IICIPJobServiceUtil> jobList;

	/**
	 * Gets the job runtime len.
	 *
	 * @return the runtime len by
	 */
	@Override
	public int getJobsCount() {
		return jobList.size();
	}

	/**
	 * Gets the runtime json.
	 * 
	 * @return the runtime json
	 */
	@Override
	public JSONArray getJobsJson() {
		JSONArray jarr = new JSONArray();
		jobList.stream().forEach(plugin -> jarr.put(plugin.getClass().getCanonicalName()));
		return jarr;
	}

	public IICIPJobServiceUtil getType(String type) {
		return jobFactory.getJobServiceUtil(type);
	}

}
