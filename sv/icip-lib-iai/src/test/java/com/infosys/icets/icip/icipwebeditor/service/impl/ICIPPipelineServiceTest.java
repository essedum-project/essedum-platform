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
package com.infosys.icets.icip.icipwebeditor.service.impl;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.HashSet;
import java.util.Set;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.quartz.SchedulerException;
import org.springframework.boot.web.client.RestTemplateBuilder;

import com.infosys.icets.icip.dataset.factory.IICIPDataSetServiceUtilFactory;
import com.infosys.icets.icip.dataset.service.impl.ICIPDatasetService;
import com.infosys.icets.icip.dataset.service.impl.ICIPDatasourceService;
import com.infosys.icets.icip.dataset.service.impl.ICIPSchemaRegistryService;
import com.infosys.icets.icip.icipwebeditor.constants.SetupResources;
import com.infosys.icets.icip.icipwebeditor.job.enums.RuntimeType;

public class ICIPPipelineServiceTest {

	private static ICIPPipelineService pipelineService;
	private static ICIPStreamingServiceService streamingServicesService;
	private static ICIPSchemaRegistryService schemaRegistryService;
	private static ICIPDatasetService datasetService;
	private static ICIPDatasourceService datasourceService;
	private static ICIPNativeScriptService nativeScriptService;
	private static ICIPBinaryFilesService binaryFilesService;
	private static IICIPDataSetServiceUtilFactory datasetFactory;

	private static final String key = "test-key";

	private static Set<String> requiredJars = new HashSet<>();

	@BeforeAll
	private static void setup() throws SchedulerException {
		SetupResources.setup();
		nativeScriptService = new ICIPNativeScriptService(SetupResources.nativeScriptRepository);
		binaryFilesService = new ICIPBinaryFilesService(SetupResources.binaryRepository);
		streamingServicesService = new ICIPStreamingServiceService(SetupResources.streamingServicesRepository,
				nativeScriptService, binaryFilesService,  null, null);
//		schemaRegistryService = new ICIPSchemaRegistryService(SetupResources.schemaRegistryRepository,null);
//		datasourceService = new ICIPDatasourceService(key, SetupResources.datasourceRepository, null, null,null);
//		datasetService = new ICIPDatasetService(SetupResources.datasetRepository, SetupResources.datasetRepository2,
//				datasourceService, schemaRegistryService, datasetFactory,null);
		pipelineService = new ICIPPipelineService(new RestTemplateBuilder(), streamingServicesService,
				schemaRegistryService, datasetService, datasourceService, null, null, binaryFilesService, null, null, null);
		requiredJars.add(SetupResources.GROUP1);
		requiredJars.add(SetupResources.GROUP2);
	}

	@Test
	void copyTest() {
		assertTrue(pipelineService.copy(null, SetupResources.ORG, SetupResources.GROUP));
	}

	@Test
	void attachContextTest() {
		pipelineService.attachContext(RuntimeType.DRAGANDDROP, "{}");
	}

	@Test
	void getRequiredJarsTest() throws Exception {
		pipelineService.getRequiredJars("{}", SetupResources.ORG);
	}

	@Test
	void getRequiredJarWithLocationTest() {
		pipelineService.getRequiredJarWithLocation(requiredJars);
	}

	@Test
	void getVersionTest() {
		pipelineService.getVersion(SetupResources.PIPELINENAME1, SetupResources.ORG);
	}

	@Test
	void getJsonTest() {
		pipelineService.getJson(SetupResources.PIPELINENAME1, SetupResources.ORG);
	}

	@Test
	void populateAttributeDetailsTest() {
		pipelineService.populateAttributeDetails("{}", "");
	}

	@Test
	void populateDatasetDetailsTest() {
		pipelineService.populateDatasetDetails("{}", SetupResources.ORG);
	}

	@Test
	void populateSchemaDetailsTest() {
		pipelineService.populateSchemaDetails("{}", SetupResources.ORG);
	}

}
