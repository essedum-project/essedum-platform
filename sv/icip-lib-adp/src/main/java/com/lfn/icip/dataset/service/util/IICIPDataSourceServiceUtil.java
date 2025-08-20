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

package com.lfn.icip.dataset.service.util;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

import javax.net.ssl.SSLContext;

import org.apache.http.client.CredentialsProvider;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Marker;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.gson.JsonArray;
import com.lfn.icip.dataset.model.ICIPDatasource;


// TODO: Auto-generated Javadoc
/**
 * The Interface IICIPDataSourceServiceUtil.
 *
 * @author essedum
 */
public interface IICIPDataSourceServiceUtil {

	/**
	 * Test connection.
	 *
	 * @param datasource the datasource
	 * @return true, if successful
	 */
	public boolean testConnection(ICIPDatasource datasource);

	/**
	 * Gets the json.
	 *
	 * @return the json
	 */
	public JSONObject getJson();

	/**
	 * Sets the hashcode.
	 *
	 * @param isVault the is vault
	 * @param datasource the datasource
	 * @return the ICIP datasource
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 */
	public ICIPDatasource setHashcode(boolean isVault, ICIPDatasource datasource) throws NoSuchAlgorithmException;

	/**
	 * Checks if is upload data supported.
	 *
	 * @param datasource the datasource
	 * @return the JSON object
	 */
	public JSONObject isUploadDataSupported(ICIPDatasource datasource);

	/**
	 * Checks if is macro base supported.
	 *
	 * @param datasource the datasource
	 * @return the JSON object
	 */
	public JSONObject isMacroBaseSupported(ICIPDatasource datasource);

	/**
	 * Checks if is extract schema supported.
	 *
	 * @param datasource the datasource
	 * @return the JSON object
	 */
	public JSONObject isExtractSchemaSupported(ICIPDatasource datasource);

	/**
	 * Checks if is dataset visualization supported.
	 *
	 * @param datasource the datasource
	 * @return the JSON object
	 */
	public JSONObject isDatasetVisualizationSupported(ICIPDatasource datasource);

	/**
	 * Checks if is tabular view supported.
	 *
	 * @param datasource the datasource
	 * @return the JSON object
	 */
	public JSONObject isTabularViewSupported(ICIPDatasource datasource);

	/**
	 * Checks if is table creation using schema supported.
	 *
	 * @param datasource the datasource
	 * @return the JSON object
	 */
	public JSONObject isTableCreationUsingSchemaSupported(ICIPDatasource datasource);
	
	public JSONObject isEtlSupported(ICIPDatasource datasource);

	/**
	 * Gets the docs.
	 *
	 * @param pluginType the plugin type
	 * @return the docs
	 * @throws FileNotFoundException the file not found exception
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public String getDocs(String pluginType) throws FileNotFoundException, IOException;

	/**
	 * Creates the datasets.
	 *
	 * @param datasource the datasource
	 * @param marker the marker
	 * @throws UnsupportedOperationException the unsupported operation exception
	 */
	void createDatasets(ICIPDatasource datasource, Marker marker) throws UnsupportedOperationException;

	String getSyncDatasetJobName(ICIPDatasource datasource) throws UnsupportedOperationException;

	ICIPDatasource updateDatasource(ICIPDatasource datasource);
	
	String uploadFile(ICIPDatasource datasource,String attributes, String uploadFile) throws Exception;

	String downloadFile(ICIPDatasource datasource, String attributes, String downloadFilePath) throws Exception;
  
	

	// String getElasticSearchResponse(ICIPDatasource datasource, String pipelineId, String trailId, Timestamp submitedOn);
	
	
	String getElasticSearchResponse(ICIPDatasource datasource, String pipelineId, String trailId, String formattedDate, String elasticSearchIndex);

	List<Map<String, Object>> getCustomModels(String org, List<ICIPDatasource> connectionsList,Integer page,Integer size,String query);

	Long getAllModelObjectDetailsCount(List<ICIPDatasource> datasources, String searchModelName, String org);


	

	
	

	

	

}
