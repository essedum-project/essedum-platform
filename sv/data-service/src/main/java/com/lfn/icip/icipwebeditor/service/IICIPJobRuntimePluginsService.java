package com.lfn.icip.icipwebeditor.service;

import org.json.JSONArray;

public interface IICIPJobRuntimePluginsService {

	/**
	 * Gets the runtime  json.
	 * @return the runtime json
	 */
	JSONArray getJobRuntimeJson();

	/**
	 * Gets the job runtime len.
	 *
	 * @return the runtime  len by 
	 */
	int getJobRuntimeCount();

}
