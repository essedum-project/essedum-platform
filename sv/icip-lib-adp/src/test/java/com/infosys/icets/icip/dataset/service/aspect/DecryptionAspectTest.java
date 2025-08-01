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
