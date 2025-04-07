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
package com.infosys.icets.icip.icipwebeditor.service;

import java.util.List;

import org.slf4j.Marker;

import com.google.gson.JsonObject;

import org.json.JSONObject;
import org.json.JSONArray;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface IICIPIaiService.
 *
 * @author icets
 */
public interface IICIPIaiService {
	
	/**
	 * Copy blueprints.
	 *
	 * @param marker the marker
	 * @param fromProjectName the from project name
	 * @param toProjectName the to project name
	 * @return the boolean
	 * @throws Exception the exception
	 */
	Boolean copyBlueprints(Marker marker, String fromProjectName, String toProjectName) throws Exception;

	/**
	 * Delete project.
	 *
	 * @param marker the marker
	 * @param project the project
	 */
	void deleteProject(Marker marker, String project);

	/**
	 * Copy group models.
	 *
	 * @param marker the marker
	 * @param fromProjectName the from project name
	 * @param toProjectName the to project name
	 * @param datasets the datasets
	 * @return the boolean
	 */
	Boolean copyGroupModels(Marker marker, String fromProjectName, String toProjectName, List<String> datasets);

	/**
	 * Copy pipelines.
	 *
	 * @param marker the marker
	 * @param fromProjectName the from project name
	 * @param toProjectName the to project name
	 * @param pipelines the pipelines
	 * @return the boolean
	 */
	Boolean copyPipelines(Marker marker, String fromProjectName, String toProjectName, List<String> pipelines);

	Boolean copytemplate(Marker marker, String fromProjectName, String toProjectName);
	
	Boolean exportModules(Marker marker, String source, JSONObject modules);

	Boolean importModules(Marker marker, String target, JSONObject data);
}
