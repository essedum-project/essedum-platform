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
package com.infosys.icets.icip.dataset.service.util.mysql;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import com.infosys.icets.icip.dataset.model.ICIPDataset;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;
import com.infosys.icets.icip.dataset.service.util.ICIPDataSetServiceUtilMySQL;
import com.infosys.icets.icip.dataset.service.util.IICIPDataSetServiceUtil.DATATYPE;
import com.infosys.icets.icip.dataset.service.util.IICIPDataSetServiceUtil.SQLPagination;

public class ICIPDatasetServiceUtilMySQLTest {
	private static final SQLPagination pagination = new SQLPagination(0, 10 , null, -1);
	private static final DATATYPE datatype = DATATYPE.GRAPHDATA;
	private static ICIPDatasource ds;
	private static ICIPDataset dst;

	@BeforeAll
	static void setUpBeforeClass() throws Exception {
		ds = new ICIPDatasource();
		dst = new ICIPDataset();
	}

	@Test
	<T> void getDatasetDataString() throws SQLException{
		try {
			Class<T> clazz = (Class<T>) String.class;
		
			ICIPDataSetServiceUtilMySQL mockobj=mock(ICIPDataSetServiceUtilMySQL.class);
			String ob = new String();
	        doReturn(ob).when(mockobj).getDatasetData(dst, pagination, datatype, clazz);
	        assertSame(clazz, mockobj.getDatasetData(dst, pagination, datatype, clazz).getClass());
		}catch(RuntimeException | Error e) {
			Assertions.fail(e.getMessage());
		}
	}
	
	@Test
	<T> void getDatasetDataJSONArray() throws SQLException{
		try {
			Class<T> clazz = (Class<T>) JSONArray.class;
			
			ICIPDataSetServiceUtilMySQL mockobj=mock(ICIPDataSetServiceUtilMySQL.class);
			JSONArray ob = new JSONArray();
	        doReturn(ob).when(mockobj).getDatasetData(dst, pagination, datatype, clazz);
	        assertSame(clazz, mockobj.getDatasetData(dst, pagination, datatype, clazz).getClass());
		}catch(Exception e) {
			Assertions.fail(e.getMessage());
		}
	}
	
	@Test
	<T> void getDatasetDataList() throws SQLException{
		try {
			Class<T> clazz = (Class<T>) ArrayList.class;
			ICIPDataSetServiceUtilMySQL mockobj=mock(ICIPDataSetServiceUtilMySQL.class);
	        List<Map<String,Object>> ob = new ArrayList<>();
	        doReturn(ob).when(mockobj).getDatasetData(dst, pagination, datatype, clazz);
	        assertSame(clazz, mockobj.getDatasetData(dst, pagination, datatype, clazz).getClass());
		}catch(Exception e) {
			Assertions.fail(e.getMessage());
		}
	}
}
