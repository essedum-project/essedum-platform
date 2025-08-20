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

package com.lfn.icip.dataset.service;

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
 * @author essedum
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
