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
