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
