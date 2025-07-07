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
/**
 * 
 */
package com.infosys.icets.icip.dataset.service.aspect;

import org.aspectj.lang.JoinPoint;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.infosys.icets.icip.dataset.model.ICIPDataset;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;
import com.infosys.icets.icip.dataset.service.IICIPDatasourceService;

/**
 * @author janikiramreddy.a
 *
 */
public class DecryptionAspectTest {

	@InjectMocks
	DecryptionAspect aspect;
	@Mock
	IICIPDatasourceService iICIPDatasourceService;

	private static String password = "leap$%123";
	JoinPoint joinPoint;
	ICIPDatasource ds;
	ICIPDataset dst;
	Integer id;

	/**
	 * @throws java.lang.Exception
	 */
	@BeforeAll
	public void setUp() throws Exception {

		MockitoAnnotations.initMocks(this);
		id = 1;
		joinPoint = null;
		ds = new ICIPDatasource();
		ds.setConnectionDetails(
				"{\"password\":\"encADFgYWC00Zqeo6K/r2FCcGc3llvvf8R3b4d5\",\"datasource\":\"\",\"userName\":\"AutomationSA\",\"url\":\"jdbc:sqlserver://BRSDMCT297049D;DatabaseName=DemoDb\"}");
		ds.setDescription("Testing MSSQL Datasource ");
		ds.setId(id);
		ds.setName("MSSQLSource");
		ds.setOrganization("Acme");
		ds.setSalt("Us9i94098+Ux4p9V/NqVk7FgwPWcIZ13cvaijQttEOLSkiS9inqEbST7u5hXgRZTBi80Zp5Ju2TqML/Q37Knlg==");
		ds.setType("MSSQL");

		dst = new ICIPDataset();
		dst.setAttributes(
				"{\"filter\":\"\",\"mode\":\"query\",\"Query\":\"SELECT TOP (5) [State]  ,[Count]   FROM [DemoDb].[dbo].[Statistics]\",\"Cacheable\":\"false\",\"isStreaming\":\"false\",\"writeMode\":\"append\",\"params\":\"{}\",\"tableName\":\"\"}");
		dst.setBackingDataset(null);
		dst.setDatasource(ds);
		dst.setDescription("Testing dataset connection");
		dst.setId(ds.getId());
		dst.setName("MSSQLSET");
		dst.setOrganization("Acme");
		dst.setSchema(null);
		dst.setType("r");

		// Mockito.when(iICIPDatasourceService.getDatasource(dst.getDatasource().getId())).thenReturn(ds);
	}

	@Test
	public void testBeforeAdviceJoinPointICIPDatasource() throws Exception {

		new DecryptionAspect(null, password).beforeAdvice(null, ds);
	}

	/*
	 * @Test public void testBeforeAdviceJoinPointICIPDataset() throws Exception {
	 * ds = new ICIPDatasource(); ds.setConnectionDetails(
	 * "{\"password\":\"encADFgYWC00Zqeo6K/r2FCcGc3llvvf8R3b4d5\",\"datasource\":\"\",\"userName\":\"AutomationSA\",\"url\":\"jdbc:sqlserver://BRSDMCT297049D;DatabaseName=DemoDb\"}"
	 * ); ds.setDescription("Testing MSSQL Datasource "); ds.setId(id);
	 * ds.setName("MSSQLSource"); ds.setOrganization("Acme"); ds.setSalt(
	 * "Us9i94098+Ux4p9V/NqVk7FgwPWcIZ13cvaijQttEOLSkiS9inqEbST7u5hXgRZTBi80Zp5Ju2TqML/Q37Knlg=="
	 * ); ds.setType("MSSQL");
	 * Mockito.when(iICIPDatasourceService.getDatasource(1)).thenReturn(ds); new
	 * DecryptionAspect(null, password).beforeAdvice(null, dst); }
	 */

}
