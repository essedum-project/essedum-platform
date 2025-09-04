package com.lfn.icip.dataset.service.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Matchers.anyObject;
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
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.service.util.IICIPDataSetServiceUtil.DATATYPE;
import com.lfn.icip.dataset.service.util.IICIPDataSetServiceUtil.SQLPagination;

public class ICIPDatasetServiceUtilPostgreSQLTest {
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
		
			ICIPDataSetServiceUtilPostgreSQL mockobj=mock(ICIPDataSetServiceUtilPostgreSQL.class);
			String ob = new String();
	        doReturn(ob).when(mockobj).getDatasetData(dst, pagination, datatype, clazz);
	        assertSame(clazz, mockobj.getDatasetData(dst, pagination, datatype, clazz).getClass());
		}catch(NullPointerException e) {
			Assertions.fail(e.getMessage());
		}
	}
	
	@Test
	<T> void getDatasetDataJSONArray() throws SQLException{
		try {
			Class<T> clazz = (Class<T>) JSONArray.class;
			
			ICIPDataSetServiceUtilPostgreSQL mockobj=mock(ICIPDataSetServiceUtilPostgreSQL.class);
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
			ICIPDataSetServiceUtilPostgreSQL mockobj=mock(ICIPDataSetServiceUtilPostgreSQL.class);
	        List<Map<String,Object>> ob = new ArrayList<>();
	        doReturn(ob).when(mockobj).getDatasetData(dst, pagination, datatype, clazz);
	        assertSame(clazz, mockobj.getDatasetData(dst, pagination, datatype, clazz).getClass());
		}catch(Exception e) {
			Assertions.fail(e.getMessage());
		}
	}
}
