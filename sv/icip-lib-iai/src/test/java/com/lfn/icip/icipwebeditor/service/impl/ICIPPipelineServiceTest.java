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

package com.lfn.icip.icipwebeditor.service.impl;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.util.HashSet;
import java.util.Set;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.quartz.SchedulerException;
import org.springframework.boot.web.client.RestTemplateBuilder;

import com.lfn.icip.dataset.factory.IICIPDataSetServiceUtilFactory;
import com.lfn.icip.dataset.service.impl.ICIPDatasetService;
import com.lfn.icip.dataset.service.impl.ICIPDatasourceService;
import com.lfn.icip.dataset.service.impl.ICIPSchemaRegistryService;
import com.lfn.icip.icipwebeditor.constants.SetupResources;
import com.lfn.icip.icipwebeditor.job.enums.RuntimeType;

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
	private static void setup() throws SchedulerException, KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
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
