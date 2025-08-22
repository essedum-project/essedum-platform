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

import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Marker;

import com.google.gson.JsonObject;
import com.infosys.icets.icip.dataset.model.ICIPMashups;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface IICIPSchemaRegistryService.
 *
 * @author icets
 */
public interface IICIPMashupService {

	/**
	 * Gets all mashups.
	 *
	 * @param org the org
	 * @return all mashups
	 */
	public List<ICIPMashups> getMashupsByOrg(String organization);


	/**
	 * Gets the mashup.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the mashup
	 */
	public ICIPMashups getMashupByName(String name, String org);
	
	/**
	 * Copy.
	 *
	 * @param marker        the marker
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @param projectId     the project id
	 * @return true, if successful
	 */
	boolean copy(Marker marker, String fromProjectId, String toProjectId, int projectId);


	ICIPMashups save(ICIPMashups mashups);


	public Map<String, String> deleteMashupByName(String name, String org);


	JsonObject export(Marker marker, String source, JSONArray modNames);


	void importData(Marker marker, String target, JSONObject jsonObject);


//	boolean copytemplate(Marker marker, String fromProjectId, String toProjectId, int datasetProjectId);

}
