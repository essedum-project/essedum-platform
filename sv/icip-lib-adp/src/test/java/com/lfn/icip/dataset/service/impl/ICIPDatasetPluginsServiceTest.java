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

package com.lfn.icip.dataset.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.lucene.index.IndexWriter;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.slf4j.Marker;

import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.icip.dataset.factory.IICIPDataSetServiceUtilFactory;
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.model.dto.ICIPDataAuditResponse;
import com.lfn.icip.dataset.service.util.ICIPDataSetServiceUtilSqlAbstract;
import com.lfn.icip.dataset.service.util.IICIPDataSetServiceUtil;

public class ICIPDatasetPluginsServiceTest {

	@InjectMocks
	ICIPDatasetPluginsService service;

	@Mock
	IICIPDataSetServiceUtilFactory datasetFactory;
	@Mock
	ICIPDatasetService datasetService;
	ICIPDataset dataset;
	ICIPDatasource ds;
	IICIPDataSetServiceUtil datasetUtil;
	IICIPDataSetServiceUtil plugin;
	ICIPDataSetServiceUtilSqlAbstract pluginSql;

	@BeforeAll
	void setUp() throws Exception {
		MockitoAnnotations.initMocks(this);
		dataset = new ICIPDataset();
		ds = new ICIPDatasource();
		ds.setConnectionDetails("");
		ds.setDescription("Testing MySql Datasource ");
		ds.setId(1130);
		ds.setName("disrupt");
		ds.setOrganization("Acme");
		ds.setSalt("4ERQlnuE5q6ALZwky4MqeRiBb+v+xhLaHF9kDZFiPTlmupffsxpyECvuvLHosdtLg0RjwYN9vh6a62xbVYKRVg==");
		ds.setType("MySQL");
		dataset.setName(ds.getName());
		dataset.setDatasource(ds);
		dataset.setBackingDataset(dataset);
		dataset.setAttributes(
				"{\"filter\":\"\",\"mode\":\"query\",\"Query\":\"SELECT configurationItem, GROUP_CONCAT(number SEPARATOR ',') FROM icm_tickets WHERE projectId={projectId} AND configurationItem!='null' AND configurationItem <> '0' AND state ='open'  GROUP BY configurationItem\",\"Cacheable\":\"false\",\"isStreaming\":\"false\",\"writeMode\":\"append\",\"params\":\"{projectId:'1'}\",\"tableName\":\"\"}");
		// datasetUtil = new ICIPDatasetPluginsService();
		Mockito.when(datasetFactory.getDataSetUtil(dataset.getDatasource().getType().toLowerCase() + "ds"))
				.thenReturn(datasetUtil);
		Mockito.when(datasetService.getDataset(dataset.getBackingDataset().getName(), dataset.getOrganization()))
				.thenReturn(dataset);

		plugin = new IICIPDataSetServiceUtil() {
			
			@Override
			public <T> T getDatasetDataAsList(ICIPDataset dataset, SQLPagination pagination, DATATYPE datatype,
					Class<T> clazz) throws SQLException {
				// TODO Auto-generated method stub
				return null;
			}

			
			@Override
			public boolean testConnection(ICIPDataset dataset) {
				// TODO Auto-generated method stub
				return true;
			}

			@Override
			public JSONObject getJson() {
				// TODO Auto-generated method stub
				return null;
			}

			@Override
			public Long getDataCount(ICIPDataset dataset) {
				// TODO Auto-generated method stub
				return null;
			}

			@Override
			public <T> T getDatasetData(ICIPDataset dataset, SQLPagination pagination, DATATYPE datatype,
					Class<T> clazz) {
				// TODO Auto-generated method stub
				return null;
			}

			@Override
			public ICIPDataset updateDataset(ICIPDataset dataset) {
				// TODO Auto-generated method stub
				return dataset;
			}

			@Override
			public void loadDataset(ICIPDataset dataset, Marker marker, List<Map<String, ?>> map, String id,
					int projectId, boolean overwrite, String org) throws Exception {
				// TODO Auto-generated method stub
				
			}

			@Override
			public boolean isTablePresent(ICIPDataset ds, String tableName)
					throws SQLException, NoSuchAlgorithmException {
				// TODO Auto-generated method stub
				return false;
			}

			@Override
			public <T> T getDatasetDataAudit(ICIPDataset dataset, SQLPagination pagination, DATATYPE datatype,
					String id, Class<T> clazz) throws SQLException {
				// TODO Auto-generated method stub
				return null;
			}

			@Override
			public void transformLoad(ICIPDataset outdataset, Marker marker, List<Map<String, ?>> map,
					JSONArray response) {
				// TODO Auto-generated method stub
				
			}

			@Override
			public JSONArray getFileData(ICIPDataset dataset, String fileName) {
				// TODO Auto-generated method stub
				return null;
			}

			@Override
			public void deleteFiledata(ICIPDataset dataset, String fileName) {
				// TODO Auto-generated method stub
				
			}

			@Override
			public JSONArray getFileInfo(ICIPDataset dataset, String value) {
				// TODO Auto-generated method stub
				return null;
			}

			@Override
			public IndexWriter createWriter(String indexPath) throws IOException {
				// TODO Auto-generated method stub
				return null;
			}

			

		};

		pluginSql = new ICIPDataSetServiceUtilSqlAbstract() {

			@Override
			public List<String> extractSchema(ICIPDataset dataset) {
				List<String> schemas = new ArrayList<String>();
				schemas.add("schema");
				// TODO Auto-generated method stub
				return schemas;
			}
			@Override
			public <T> T getDatasetDataAsList(ICIPDataset dataset, SQLPagination pagination, DATATYPE datatype,
					Class<T> clazz) throws SQLException {
				// TODO Auto-generated method stub
				return null;
			}


			@Override
			public boolean testConnection(ICIPDataset dataset) throws EssedumException {
				// TODO Auto-generated method stub
				return false;
			}

			@Override
			public Long getDataCount(ICIPDataset dataset) {
				// TODO Auto-generated method stub
				return null;
			}

			@Override
			public <T> T getDatasetData(ICIPDataset dataset, SQLPagination pagination, DATATYPE datatype,
					Class<T> clazz) throws SQLException {
				// TODO Auto-generated method stub
				return null;
			}

			@Override
			public JSONObject getJson() {
				// TODO Auto-generated method stub
				return null;
			}

			@Override
			public void executeUpdate(ICIPDataset dataset, Marker marker) throws SQLException {
				
			}

			@Override
			public ICIPDataset updateDataset(ICIPDataset dataset) {
				return dataset;
			}

			@Override
			public void loadDataset(ICIPDataset dataset, Marker marker, List<Map<String, ?>> map, String id,
					int projectId, boolean overwrite, String org) {
				// TODO Auto-generated method stub

			}

			@Override
			public ICIPDataAuditResponse addEntry(ICIPDataset dataset, String rowData) {
				// TODO Auto-generated method stub
				return null;
			}

			@Override
			public ICIPDataAuditResponse updateEntry(ICIPDataset dataset, String rowData) {
				// TODO Auto-generated method stub
				return null;
			}

			@Override
			public void createTableIfNotExists(ICIPDataset dataset) throws SQLException {
				// TODO Auto-generated method stub

			}

			@Override
			public void createTableFromCsv(ICIPDataset dataset, List<Map<String, ?>> map)
					throws SQLException, NoSuchAlgorithmException {
				// TODO Auto-generated method stub

			}

			@Override
			protected String appendPaginationValues(SQLPagination pagination, String query) {
				// TODO Auto-generated method stub
				return null;
			}

			public void deleteAllFromTable(ICIPDataset dataset) throws NoSuchAlgorithmException, SQLException {
				// TODO Auto-generated method stub

			}

			@Override
			public void updateBatch(Marker marker, String[] queries, ICIPDataset dataset)
					throws SQLException, NoSuchAlgorithmException {
				// TODO Auto-generated method stub

			}

			@Override
			public boolean isTablePresent(ICIPDataset ds, String tableName)
					throws SQLException, NoSuchAlgorithmException {
				// TODO Auto-generated method stub
				return false;
			}
			@Override
			public void dataAudit(ICIPDataset dataset, String rowdata, String action, String rowId, String user)
					throws SQLException, NoSuchAlgorithmException {
				// TODO Auto-generated method stub
				
			}
			@Override
			public String getcolumnMappings(JSONArray uniqueSchemaArray, boolean approve, boolean inbox) {
				// TODO Auto-generated method stub
				return null;
			}

//			@Override
//			public String searchIndex(String datasetName, String projectName, String size, String page,
//					String sortEvent, String sortOrder, String searchObject) throws SQLException, IOException {
//				// TODO Auto-generated method stub
//				return null;
//			}
//
//			@Override
//			public String totalSearchedIndex(String datasetName, String searchObject) throws IOException {
//				// TODO Auto-generated method stub
//				return null;
//			}

		};

		Mockito.when(datasetFactory.getDataSetUtil(String.format("%s%s", dataset.getDatasource().getType(), "ds")))
				.thenReturn(plugin);

	}

	@Test
	void getDataSetService() {
		assertEquals(service.getDataSetService(dataset), datasetUtil);
	}

	@Test
	public void testTestConnection() throws Exception {
		assertEquals(service.testConnection(dataset), true);
	}

	@Test
	public void testExtractSchema() throws Exception {
		List<String> schemas = new ArrayList<String>();
		schemas.add("schema");
		assertEquals(service.extractSchema(dataset), schemas);
	}

}
