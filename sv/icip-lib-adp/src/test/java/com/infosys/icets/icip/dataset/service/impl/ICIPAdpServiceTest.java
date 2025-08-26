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

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.slf4j.Logger;
import org.slf4j.Marker;


public class ICIPAdpServiceTest {
	@Mock
	private ICIPDatasetService datasetService;

	@Mock
	private ICIPDatasourceService datasourceService;

	@Mock
	private Logger log;

	@Mock
	private ICIPSchemaRegistryService schemaRegistryService;

	@Mock
	private ICIPSchemaRegistryService schemaService;
	@InjectMocks
	private ICIPAdpService iCIPAdpService;

	Marker marker;
	String fromProjectName;
	String toProjectName;
	
	@BeforeAll
	public void setUp() throws Exception {
		MockitoAnnotations.initMocks(this);
		marker = null;
		fromProjectName =  "Acme";
		toProjectName = "Acme";
		
		
		/*Mockito.when(schemaService.copy(marker, fromProjectName, toProjectName));
		Mockito.when(datasourceService.copy(marker, fromProjectName, toProjectName));
		Mockito.when(datasetService.copy(marker, fromProjectName, toProjectName));*/
	}

	@Test
	public void testCopyBlueprints() throws Exception {
		assertEquals(iCIPAdpService.copyBlueprints(marker, fromProjectName, toProjectName, 1),true);
	}

	@Test
	public void testDeleteProject() throws Exception {
		iCIPAdpService.deleteProject(marker, fromProjectName);
	}

}
