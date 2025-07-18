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
package com.infosys.icets.icip.dataset.service.util.rest;

import static org.junit.Assert.assertSame;
import static org.mockito.Matchers.anyInt;
import static org.mockito.Matchers.anyObject;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.http.ParseException;
import org.json.JSONArray;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.runner.RunWith;
import org.mockito.runners.MockitoJUnitRunner;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.infosys.icets.icip.dataset.model.ICIPDataset;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;
import com.infosys.icets.icip.dataset.service.util.ICIPDataSetServiceUtilRest;
import com.infosys.icets.icip.dataset.service.util.IICIPDataSetServiceUtil.SQLPagination;

/**
 * @author icets
 */
@RunWith(MockitoJUnitRunner.class)
class ICIPDataSetServiceUtilRESTTest {

	Logger logger = LoggerFactory.getLogger(ICIPDataSetServiceUtilRESTTest.class);


	private static ICIPDataset dst;

	@BeforeAll
	static void setUpBeforeClass() throws Exception {
		ICIPDatasource ds = new ICIPDatasource();
		ds.setConnectionDetails(
				"{\"authUrl\":\"\",\"password\":\"\",\"authParams\":\"{}\",\"auth\":\"BearerToken\",\"authToken\":\"7706189859f2b010b862d1c6262b68756e827265\",\"noProxy\":\"true\",\"url\":\"https://infosysjira.tools.infosysapps.com/rest/api/2/issue/createmeta\",\"username\":\"\",\"auth_vault\":false}");
		ds.setDescription("Testing REST Datasource ");
		ds.setId(1049);
		ds.setName("REST Datasource");
		ds.setOrganization("Acme");
		ds.setSalt("");
		ds.setType("REST");
		dst = new ICIPDataset();
		dst.setAttributes(
				"{\"documentElement\":\"\",\"headers\":\"\",\"Cacheable\":\"false\",\"Request Body\":\"\",\"API Type\":\"GET\",\"params\":\"\",\"EndPoints\":\"\",\"Query Params\":\"\"},\"type\":\"r\",\"datasource\":{\"id\":2,\"name\":\"RESTtest\",\"description\":\"\",\"type\":\"REST\",\"connectionDetails\":\"{\\\"authUrl\\\":\\\"\\\",\\\"password\\\":\\\"\\\",\\\"authParams\\\":\\\"{}\\\",\\\"auth\\\":\\\"BearerToken\\\",\\\"authToken\\\":\\\"7706189859f2b010b862d1c6262b68756e827265\\\",\\\"noProxy\\\":\\\"true\\\",\\\"url\\\":\\\"https://infygithub.ad.infosys.com/api/v3/search/issues?q=is:open&is:issue\\\",\\\"username\\\":\\\"\\\"}");
		dst.setBackingDataset(null);
		dst.setType("REST");
		dst.setDatasource(ds);
		dst.setDescription("Testing dataset connection");
		dst.setId(43142);
		dst.setName("restDatasetSample");
		dst.setOrganization("Acme");
		dst.setType("r");

	}

	@Test
	<T> void getDatasetDataString() throws SQLException, ParseException, IOException {
		Class<T> clazz = (Class<T>) String.class;
		SQLPagination pagination = new SQLPagination(0, 10, null, -1);
		ICIPDataSetServiceUtilRest mockobj = mock(ICIPDataSetServiceUtilRest.class);
		String ob = "";
		doReturn(ob).when(mockobj).getDataAsString(anyObject(), anyObject(), dst, anyInt());
		String act = mockobj.getDataAsString(anyObject(), anyObject(), dst, pagination.getSize());
		assertSame(clazz, act.getClass());
	}

	@Test
	<T> void getDatasetDataList() throws Exception {
		Class<T> clazz = (Class<T>) ArrayList.class;
		SQLPagination pagination = new SQLPagination(0, 10, null, -1);
		ICIPDataSetServiceUtilRest mockobj = mock(ICIPDataSetServiceUtilRest.class);
		List<String> ob = new ArrayList<>();
		doReturn(ob).when(mockobj).getDataWithLimit(anyObject(), anyObject(), anyObject(), anyInt());
		List<Map<String, Object>> act = mockobj.getDataWithLimit(anyObject(), anyObject(), dst, pagination.getSize());
		assertSame(clazz, act.getClass());
	}

	@Test
	<T> void getDatasetDataJSONArray() throws Exception {
		Class<T> clazz = (Class<T>) JSONArray.class;
		SQLPagination pagination = new SQLPagination(0, 10, null, -1);
		ICIPDataSetServiceUtilRest mockobj = mock(ICIPDataSetServiceUtilRest.class);
		JSONArray ob = new JSONArray();
		doReturn(ob).when(mockobj).getDataAsJsonArray(anyObject(), anyObject(), anyObject(), anyInt());
		JSONArray act = mockobj.getDataAsJsonArray(anyObject(), anyObject(), dst, pagination.getSize());
		assertSame(clazz, act.getClass());
	}
}
