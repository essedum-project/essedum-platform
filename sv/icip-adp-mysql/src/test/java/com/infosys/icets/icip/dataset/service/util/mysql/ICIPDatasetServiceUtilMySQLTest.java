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
