package com.lfn.icip.icipwebeditor.service;

import org.json.JSONArray;

public interface IICIPJobsPluginsService {

	/**
	 * Gets the runtime  json.
	 * @return the runtime json
	 */
	JSONArray getJobsJson();

	/**
	 * Gets the job runtime len.
	 *
	 * @return the runtime  len by 
	 */
	int getJobsCount();

}
