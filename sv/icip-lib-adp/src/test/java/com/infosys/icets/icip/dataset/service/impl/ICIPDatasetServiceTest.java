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

package com.infosys.icets.icip.dataset.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.data.domain.PageRequest;

import com.infosys.icets.icip.dataset.model.ICIPDataset;
import com.infosys.icets.icip.dataset.model.ICIPDataset2;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;
import com.infosys.icets.icip.dataset.model.ICIPSchemaRegistry;
import com.infosys.icets.icip.dataset.repository.ICIPDatasetRepository;
import com.infosys.icets.icip.dataset.repository.ICIPDatasetRepository2;
import com.infosys.icets.icip.dataset.service.IICIPDatasourceService;
import com.infosys.icets.icip.dataset.service.IICIPSchemaRegistryService;

public class ICIPDatasetServiceTest {

	@InjectMocks
	ICIPDatasetService service;

	@Mock
	ICIPDatasetRepository2 datasetRepository2;

	@Mock
	ICIPDatasetRepository datasetRepository;

	@Mock
	IICIPDatasourceService datasourceService;
	@Mock
	IICIPSchemaRegistryService schemaRegistryService;

	List<ICIPDataset> datasets;
	ICIPDataset2 dataset2;

	Integer id;
	String name;
	String org;
	ICIPDataset dataset;
	String datasetType;
	ICIPDatasource ds;
	String query;
	String group;
	String persistenceContext;
	ICIPSchemaRegistry schema;
	private static final Logger logger = LoggerFactory.getLogger(ICIPDatasetServiceTest.class);

	private static final Optional<ICIPDataset> EMPTY = null;
	String fromProjectId;
	String toProjectId;
	int page;
	int size;
	String search;
	List<String> res;

	@BeforeAll
	void setUp() throws Exception {
		MockitoAnnotations.initMocks(this);
		id = 1;
		page = 1;
		size = 1;
		search = "TWB";
		name = "TWBSessResch";
		org = "Acme";
		group = "test";
		datasetType = "mysql";
		persistenceContext = "iampdata";
		res = new ArrayList<>();
		res.add("one");

		fromProjectId = "Acme";
		toProjectId = "Acme";
		ds = new ICIPDatasource();
		ds.setConnectionDetails("");
		ds.setDescription("Testing MySql Datasource ");
		ds.setId(1);
		ds.setName("disrupt");
		ds.setOrganization("Acme");
		ds.setSalt("4ERQlnuE5q6ALZwky4MqeRiBb+v+xhLaHF9kDZFiPTlmupffsxpyECvuvLHosdtLg0RjwYN9vh6a62xbVYKRVg==");
		ds.setType("MySQL");
		query = "query";
		dataset = new ICIPDataset();
		dataset.setId(id);
		dataset.setName(name);
		dataset.setOrganization(org);
		dataset.setAttributes(
				"{\"filter\":\"\",\"mode\":\"query\",\"Query\":\"SELECT configurationItem, GROUP_CONCAT(number SEPARATOR ',') FROM icm_tickets WHERE projectId={projectId} AND configurationItem!='null' AND configurationItem <> '0' AND state ='open'  GROUP BY configurationItem\",\"Cacheable\":\"false\",\"isStreaming\":\"false\",\"writeMode\":\"append\",\"params\":\"{projectId:'1'}\",\"tableName\":\"\"}");
		dataset.setBackingDataset(null);
		dataset.setDatasource(ds);
		dataset.setDescription("Testing Mysql dataset connection");

		schema = new ICIPSchemaRegistry();
		dataset.setSchema(schema);
		datasets = new ArrayList<>();
		datasets.add(dataset);

		dataset2 = new ICIPDataset2();
		dataset2.setId(dataset.getId());
		dataset2.setName(dataset.getName());
		dataset2.setAttributes(dataset.getAttributes());
		dataset2.setBackingDataset(null);
		dataset2.setDatasource(dataset.getDatasource().toString());

		// Mockito.when(datasetRepository.findById(id)).thenReturn(datasets);
		Mockito.when(datasetRepository.findByNameAndOrganization(name, org)).thenReturn(dataset);
		Mockito.when(datasetRepository.findByOrganization(fromProjectId)).thenReturn(datasets);
		Mockito.when(datasetRepository.save(dataset)).thenReturn(dataset);
		Mockito.when(datasetRepository.findByOrganizationByGroups(org, group)).thenReturn(datasets);
//		Mockito.when(datasetRepository.findByOrganizationAndDatasetType(org, group, PageRequest.of(page, size)))
//				.thenReturn(datasets);
		Mockito.when(datasetRepository.searchByName(name, org, PageRequest.of(page, size))).thenReturn(datasets);
		Mockito.when(datasetRepository.countLengthByName(name, org)).thenReturn((long) 1);
		Mockito.when(datasetRepository.getDatasetLenByGroupAndOrg(group, org)).thenReturn((long) 1);
		Mockito.when(datasetRepository.getDatasetLenByGroupAndOrgAndSearch(group, org, search)).thenReturn((long) 1);
//		Mockito.when(datasetRepository.getDatasetLenByTypeAndOrg(datasetType, org)).thenReturn((long) 1);
//		Mockito.when(datasetRepository.getDatasetLenByTypeAndOrgAndSearch(datasetType, org, search))
//				.thenReturn((long) 1);
		Mockito.when(datasetRepository.findByOrganizationByGroups(org, group)).thenReturn(datasets);
		Mockito.when(
				datasetRepository.findByOrganizationByGroupsAndSearch(org, group, search,null, PageRequest.of(page, size)))
				.thenReturn(datasets);
		// Mockito.when(datasetRepository2.save(dataset)).thenReturn(dataset);;
		// Mockito.when(datasetRepository2.save(Mockito.mock(ICIPDataset2.class))).thenReturn(new
		// ICIPDataset2());
	}

	/*
	 * @Test void testgetDataset() { assertEquals(service.getDataset(id).getId(),
	 * id); }
	 */
	@Test
	void testgetDatasetbyNameandOrg() {
		assertEquals(service.getDataset(name, org).getName(), name);

	}

	@Test
	void renameProject() {
		// List<String> al = new ArrayList<String>(results.getMetadata().values());
		assertEquals(service.renameProject(fromProjectId, toProjectId), true);
	}
	/*
	 * @Test void copy() { //List<String> al = new
	 * ArrayList<String>(results.getMetadata().values());
	 * assertEquals(service.copy(null, fromProjectId, toProjectId),true); }
	 */

	@Test
	void getDatasetsByOrg() {
		assertEquals(service.getDatasetsByOrg(fromProjectId).get(0).getName(), name);
	}

	@Test
	void getDatasetsByGroupAndOrg() {
		assertEquals(service.getDatasetsByGroupAndOrg(fromProjectId, group).get(0).getName(), name);
	}

	@Test
	void getDatasetsByTypeAndOrg() {
//		assertEquals(service.getDatasetsByTypeAndOrg(group, org, page, size).get(0).getName(), name);
	}

	@Test
	void searchDatasets() {
		assertEquals(service.searchDatasets(name, org, page, size).get(0).getName(), name);
	}

	@Test
	void searchDatasetsLen() {
		assertEquals((long) service.searchDatasetsLen(name, org), (long) 1);
	}

	@Test
	void getDatasetLenByGroupAndOrg() {
		assertEquals((long) service.getDatasetLenByGroupAndOrg(group, org, null), (long) 1);
	}

	@Test
	void getDatasetLenByGroupAndOrgsearch() {
		assertEquals((long) service.getDatasetLenByGroupAndOrg(group, org, search), (long) 1);
	}

//	@Test
//	void getDatasetLenByTypeAndOrg() {
//		assertEquals((long) service.getDatasetLenByTypeAndOrg(datasetType, org, null), (long) 1);
//	}
//
//	@Test
//	void getDatasetLenByTypeAndOrgAndSearch() {
//		assertEquals((long) service.getDatasetLenByTypeAndOrg(datasetType, org, search), (long) 1);
//	}

	@Test
	void getPaginatedDatasetsByGroupAndOrg() {
		assertEquals(service.getPaginatedDatasetsByGroupAndOrg(org, group, null,null, page, size).get(0).getName(), name);
	}

	@Test
	void findByOrganizationByGroupsAndSearch() {
		assertEquals(service.getPaginatedDatasetsByGroupAndOrg(org, group, search,null, page, size).get(0).getName(), name);
	}

	@Test
	void castDynamicClass() throws ParseException {
		assertEquals(service.castDynamicClass("BOOLEAN", "true"), true);
	}

	@Test
	void castDynamicClassNull() throws ParseException {
		assertEquals(service.castDynamicClass("BOOLEAN", null), null);
	}

	@Test
	void castDynamicClassDate() throws ParseException {
		SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
		java.util.Date parsedDate;
		parsedDate = dateFormat.parse("2020-01-01".substring(0, 9).replace("T", " "));
		Timestamp timeStampDate = new Timestamp(parsedDate.getTime());
		assertEquals(service.castDynamicClass("DATE", "2020-01-01"), timeStampDate);
	}

	@Test
	void knownPatterns() throws ParseException {
		SimpleDateFormat dateFormat = new SimpleDateFormat("MM-dd-yyyy");
		java.util.Date parsedDate;
		parsedDate = new Date(dateFormat.parse("01-01-2020").getTime());
		Timestamp timeStampDate = new java.sql.Timestamp(parsedDate.getTime());
		assertEquals(service.knownPatterns("01-01-2020"), timeStampDate);
	}

	@Test
	public void testGetDatasetInteger() throws Exception {
		Mockito.when(datasetRepository.findById(id)).thenReturn(Optional.of(dataset));
		assertEquals(service.getDataset(id), dataset);
	}

	@Test
	public void testSaveStringICIPDatasetLoggerMarker() throws Exception {
		Marker marker = null;
		String id = "1";

		Mockito.when(datasetRepository2.save(dataset2)).thenReturn(dataset2);
		Mockito.when(datasetRepository.findById(dataset2.getId())).thenReturn(Optional.of(dataset));
		assertEquals(service.save(id, dataset, logger, marker, 1, false), dataset);
	}

	@Test
	public void testSaveStringICIPDataset() throws Exception {
		String id = "1";
		Mockito.when(datasetRepository2.save(dataset2)).thenReturn(dataset2);
		Mockito.when(datasetRepository.findById(dataset2.getId())).thenReturn(Optional.of(dataset));
		assertEquals(service.save(id, dataset), dataset);
	}

	@Test
	public void testDeleteStringString() throws Exception {
		Mockito.when(datasetRepository.findByNameAndOrganization(name, org)).thenReturn(dataset);
		service.delete(name, org);
	}

	@Test
	public void testDeleteString() throws Exception {
		service.delete(fromProjectId);
	}

	/*
	 * @Test public void testCopy() throws Exception {
	 * Mockito.when(datasetRepository.findByOrganization(fromProjectId)).thenReturn(
	 * datasets);
	 * Mockito.when(datasourceService.getDatasource(dataset.getDatasource().getName(
	 * ), toProjectId)).thenReturn(ds);
	 * Mockito.when(schemaRegistryService.getSchema(dataset.getSchema().getName(),
	 * toProjectId)).thenReturn(schema); Marker marker = null;
	 * assertEquals(service.copy(marker, fromProjectId, toProjectId),true); }
	 */

	/*
	 * @Test void getPersistenceContext() {
	 * 
	 * assertEquals(service.getPersistenceContext(),null); }
	 */
}
