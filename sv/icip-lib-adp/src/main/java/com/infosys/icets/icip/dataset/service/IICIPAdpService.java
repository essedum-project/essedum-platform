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

import java.sql.SQLException;
import java.util.List;

import org.slf4j.Marker;

import com.google.gson.JsonObject;

import org.json.JSONObject;
import org.json.JSONArray;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface IICIPAdpService.
 *
 * @author icets
 */
public interface IICIPAdpService {

	/**
	 * Copy blueprints.
	 *
	 * @param marker          the marker
	 * @param fromProjectName the from project name
	 * @param toProjectName   the to project name
	 * @param projectId       the project id
	 * @return the boolean
	 */
	Boolean copyBlueprints(Marker marker, String fromProjectName, String toProjectName, int projectId);

	/**
	 * Delete project.
	 *
	 * @param marker  the marker
	 * @param project the project
	 */
	void deleteProject(Marker marker, String project);
	/**
	 * Bulk copy datasets.
	 *
	 * @param marker          the marker
	 * @param fromProjectName the from project name
	 * @param toProjectName   the to project name
	 * @param projectId       the project id
	 * @param datasets        the datasets
	 * @param toDatasource the to datasource
	 * @return the boolean
	 */
	Boolean bulkCopyDatasets(Marker marker, String fromProjectName, String toProjectName, int projectId,
			List<String> datasets, String toDatasource);

	/**
	 * Test datasources.
	 *
	 * @param marker the marker
	 * @param zoneid the zoneid
	 * @param org the org
	 * @return the boolean
	 * @throws SQLException the SQL exception
	 */
	Boolean testDatasources(Marker marker, String zoneid, String org) throws SQLException;

	void copytemplate(Marker marker, String fromProjectName, String toProjectName, int datasetProjectId);
	
	Boolean exportModules(Marker marker, String source, JSONObject modules);

	Boolean importModules(Marker marker, String target, JSONObject data);
}
