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

import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

import org.apache.lucene.index.IndexWriter;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Marker;

import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.service.util.IICIPDataSetServiceUtil.DATATYPE;
import com.lfn.icip.dataset.service.util.IICIPDataSetServiceUtil.SQLPagination;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
 
// TODO: Auto-generated Javadoc
/**
 * The Interface IICIPDataSetServiceUtil.
 *
 * @author essedum
 */
public interface IICIPDataSetServiceUtil {

	/**
	 * The Enum DATATYPE.
	 */
	public static enum DATATYPE {
		
		/** The data. */
		DATA, 
		/** The graphdata. */
		GRAPHDATA, 
		/** The jsonheader. */
		JSONHEADER,
		 ALL
	}

	/**
	 * Sets the sort order.
	 */
	
	/**
	 * Sets the sort order.
	 *
	 * @param sortOrder the new sort order
	 */
	
	/**
	 * Sets the sort order.
	 *
	 * @param sortOrder the new sort order
	 */
	@Setter

	/**
	 * Gets the sort order.
	 *
	 * @return the sort order
	 */
	
	/**
	 * Gets the sort order.
	 *
	 * @return the sort order
	 */
	
	/**
	 * Gets the sort order.
	 *
	 * @return the sort order
	 */
	@Getter

	/**
	 * Instantiates a new SQL pagination.
	 *
	 * @param page      the page
	 * @param sortEvent the sort event
	 * @param sortOrder the sort order
	 */
	
	/**
	 * Instantiates a new SQL pagination.
	 *
	 * @param page the page
	 * @param size the size
	 * @param sortEvent the sort event
	 * @param sortOrder the sort order
	 */
	
	/**
	 * Instantiates a new SQL pagination.
	 *
	 * @param page the page
	 * @param size the size
	 * @param sortEvent the sort event
	 * @param sortOrder the sort order
	 */
	@AllArgsConstructor
	public static class SQLPagination {

		/** The page. */
		private int page;

		/** The size. */
		private int size;

		/** The sort event. */
		private String sortEvent;

		/** The sort order. */
		private int sortOrder;

		/**
		 * Instantiates a new SQL pagination.
		 */
		public SQLPagination() {
			this.page = -1;
			this.size = 10;
			this.sortEvent = null;
		}

	}

	/**
	 * Test connection.
	 *
	 * @param dataset the dataset
	 * @return true, if successful
	 * @throws EssedumException the essedum exception
	 */
	public boolean testConnection(ICIPDataset dataset) throws EssedumException;

	/**
	 * Gets the data count.
	 *
	 * @param dataset the dataset
	 * @return the data count
	 */
	public Long getDataCount(ICIPDataset dataset) throws SQLException;

	/**
	 * Gets the dataset data.
	 *
	 * @param <T> the generic type
	 * @param dataset the datasets
	 * @param pagination the pagination
	 * @param datatype the datatype
	 * @param clazz the clazz
	 * @return the dataset data
	 * @throws SQLException the SQL exception
	 */
	public <T> T getDatasetData(ICIPDataset dataset, SQLPagination pagination, DATATYPE datatype, Class<T> clazz) throws SQLException;

	/**
	 * Gets the json.
	 *
	 * @return the json
	 */
	public JSONObject getJson();
	
	/**
	 * Update dataset.
	 *
	 * @param dataset    the dataset
	 * @return updated dataset
	 */
	public ICIPDataset updateDataset(ICIPDataset dataset);
	
	/**
	 * Load dataset.
	 *
	 * @param dataset the dataset
	 * @param marker the marker
	 * @param map the map
	 * @param id the id
	 * @param projectId the project id
	 * @param overwrite the overwrite
	 * @param org the org
	 * @throws Exception the exception
	 */
	public void loadDataset(ICIPDataset dataset, Marker marker, List<Map<String, ?>> map, String id, int projectId,
			boolean overwrite, String org) throws Exception;
	
	/**
	 * Checks if is table present.
	 *
	 * @param ds the ds
	 * @param tableName the table name
	 * @return true, if is table present
	 * @throws SQLException the SQL exception
	 * @throws NoSuchAlgorithmException the no such algorithm exception
	 */
	public boolean isTablePresent(ICIPDataset ds, String tableName) throws SQLException, NoSuchAlgorithmException ;

	public <T> T getDatasetDataAudit(ICIPDataset dataset, SQLPagination pagination, DATATYPE datatype,String id, Class<T> clazz)
			throws SQLException;

	public void transformLoad(ICIPDataset outdataset, Marker marker, List<Map<String, ?>> map, JSONArray response);


	public IndexWriter createWriter(String indexPath) throws IOException;
	
	JSONArray getFileData(ICIPDataset dataset, String fileName);

	void deleteFiledata(ICIPDataset dataset, String fileName);

	JSONArray getFileInfo(ICIPDataset dataset, String value);
	
	public <T> T getDatasetDataAsList(ICIPDataset dataset, SQLPagination pagination, DATATYPE datatype, Class<T> clazz)
			throws SQLException;
	
}
