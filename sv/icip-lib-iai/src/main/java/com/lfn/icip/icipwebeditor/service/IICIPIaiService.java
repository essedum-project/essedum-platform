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

package com.lfn.icip.icipwebeditor.service;

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
 * @author essedum
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
