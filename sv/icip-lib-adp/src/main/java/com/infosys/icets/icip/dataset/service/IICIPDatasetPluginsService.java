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

import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.SortedMap;

import org.json.JSONArray;
import org.json.JSONObject;

import com.google.gson.JsonArray;
import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.icip.dataset.model.ICIPDataset;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;
import com.infosys.icets.icip.dataset.service.util.ICIPDataSetServiceUtilSqlAbstract;
import com.infosys.icets.icip.dataset.service.util.IICIPDataSetServiceUtil;
import com.infosys.icets.icip.dataset.service.util.IICIPMlopsServiceUtil;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface IICIPDatasetPluginsService.
 */
public interface IICIPDatasetPluginsService {

	/**
	 * List all plugins.F
	 *
	 * @return the JSON array
	 */
	JSONArray listAllPlugins();

	/**
	 * Test connection.
	 *
	 * @param dataset the dataset
	 * @return true, if successful
	 * @throws LeapException the leap exception
	 */
	boolean testConnection(ICIPDataset dataset) throws LeapException;

	/**
	 * Gets the data set service.
	 *
	 * @param dataset the dataset
	 * @return the data set service
	 */
	IICIPDataSetServiceUtil getDataSetService(ICIPDataset dataset);
	
	/**
	 * Gets the data set service sql.
	 *
	 * @param dataset the dataset
	 * @return the data set service sql
	 */
	ICIPDataSetServiceUtilSqlAbstract getDataSetServiceSql(ICIPDataset dataset);

	/**
	 * Extract schema.
	 *
	 * @param dataset the dataset
	 * @return the list
	 */
	List<String> extractSchema(ICIPDataset dataset);

	/**
	 * Gets the all objects.
	 *
	 * @param datasetName the dataset name
	 * @param schemaName the schema name
	 * @param projectName the project name
	 * @param size the size
	 * @param page the page
	 * @param sortEvent the sort event
	 * @param sortOrder the sort order
	 * @return the all objects
	 * @throws NumberFormatException the number format exception
	 * @throws SQLException the SQL exception
	 */
	List<Object> getAllObjects(String datasetName, String schemaName, String projectName, 
			String size, String page, String sortEvent, String sortOrder) throws NumberFormatException, SQLException;

	/**
	 * Gets the objects count.
	 *
	 * @param datasetName the dataset name
	 * @param projectName the project name
	 * @return the objects count
	 * @throws SQLException 
	 */
	String getObjectsCount(String datasetName, String projectName) throws SQLException;
	
	/**
	 * Gets the searched objects.
	 *
	 * @param datasetName the dataset name
	 * @param projectName the project name
	 * @param size the size
	 * @param page the page
	 * @param sortEvent the sort event
	 * @param sortOrder the sort order
	 * @param searchParams the search params
	 * @param extraParms the extra parms
	 * @return the searched objects
	 * @throws NumberFormatException the number format exception
	 * @throws SQLException the SQL exception
	 */
	List<Object> getSearchedObjects(ICIPDataset datasetName, String projectName, String size, 
			String page, String sortEvent, String sortOrder, String searchParams, JSONObject extraParms) throws NumberFormatException, SQLException;

	/**
	 * Gets the search data count.
	 *
	 * @param datasetName the dataset name
	 * @param projectName the project name
	 * @param searchParams the search params
	 * @return the search data count
	 */
	String getSearchDataCount(ICIPDataset dataset, String projectName, String searchParams, JSONObject extraParams) throws SQLException;
	
	/**
	 * Gets the download csv.
	 *
	 * @param datasetName the dataset name
	 * @param projectName the project name
	 * @param chunkSize the chunk size
	 * @param apiCount the api count
	 * @param sortEvent the sort event
	 * @param sortOrder the sort order
	 * @param searchParams the search params
	 * @param fieldsToDownload the fields to download
	 * @return the download csv
	 */
	String getDownloadCsv(String datasetName, String projectName, String chunkSize, String apiCount, String sortEvent, String sortOrder, String searchParams, String fieldsToDownload);

	/**
	 * Tag details.
	 *
	 * @param datasetName the dataset name
	 * @param projectName the project name
	 * @param data the data
	 * @return the string
	 */
	String tagDetails(String datasetName, String projectName, String data);

	/**
	 * Gets the tickets for range.
	 *
	 * @param datasetName the dataset name
	 * @param projectName the project name
	 * @param size the size
	 * @param page the page
	 * @param sortEvent the sort event
	 * @param sortOrder the sort order
	 * @param searchParams the search params
	 * @param dbResp the db resp
	 * @param columnName the column name
	 * @param dateFilter the date filter
	 * @return the tickets for range
	 * @throws NumberFormatException the number format exception
	 * @throws SQLException the SQL exception
	 */
	SortedMap<String,Integer> getTicketsForRange(String datasetName, String projectName, 
			String size, String page, String sortEvent, String sortOrder, String searchParams, String dbResp,String columnName,String dateFilter) throws NumberFormatException, SQLException;

	/**
	 * Save entry.
	 *
	 * @param rowData the row data
	 * @param action the action
	 * @param datasetName the dataset name
	 * @param projectName the project name
	 * @return the string
	 */
	String saveEntry(String rowData, String action, String datasetName, String projectName);
	
	/**
	 * getDatasetForSchemaAlias
	 * 
	 * @param schemaAlias
	 * @param projectName
	 * @return list of ICIPDataset
	 */
	List<ICIPDataset> getDatasetForSchemaAlias(String schemaAlias, String projectName);

	JSONArray getRowExtras(String propertyDetails, String unqId, String datasetName, String organization);

	String searchDatasetData(ICIPDataset dataset, String projectName, String size, String page, String sortEvent,
			String sortOrder, String searchParams, JSONObject extraParams) throws SQLException;

	List<Object> getSearchedData(ICIPDataset dataset, String projectName, String size,
			String page, String sortEvent, String sortOrder, String searchParams, JSONObject extraParams)
			throws SQLException;

	IICIPMlopsServiceUtil getDataSetService(ICIPDatasource datasource);
	
	List<Object> getS3FileData(ICIPDataset dataset, String fileName);
	
	String deleteS3file(ICIPDataset dataset, String fileName);
	
}
