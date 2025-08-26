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

package com.lfn.icip.icipwebeditor.job;

import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.quartz.JobDataMap;
import org.quartz.JobDetail;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.JobKey;
import org.quartz.SchedulerException;
import org.springframework.boot.web.client.RestTemplateBuilder;

import com.lfn.icip.dataset.factory.IICIPDataSetServiceUtilFactory;
import com.lfn.icip.dataset.service.impl.ICIPDatasetService;
import com.lfn.icip.dataset.service.impl.ICIPDatasourceService;
import com.lfn.icip.dataset.service.impl.ICIPSchemaRegistryService;
import com.lfn.icip.icipwebeditor.constants.SetupResources;
import com.lfn.icip.icipwebeditor.file.service.ICIPFileService;
import com.lfn.icip.icipwebeditor.jobmodel.service.ICIPChainJobsService;
import com.lfn.icip.icipwebeditor.jobmodel.service.ICIPJobsService;
import com.lfn.icip.icipwebeditor.model.ICIPJobs;
import com.lfn.icip.icipwebeditor.service.impl.ICIPBinaryFilesService;
import com.lfn.icip.icipwebeditor.service.impl.ICIPDragAndDropService;
import com.lfn.icip.icipwebeditor.service.impl.ICIPNativeScriptService;
import com.lfn.icip.icipwebeditor.service.impl.ICIPPipelinePIDService;
import com.lfn.icip.icipwebeditor.service.impl.ICIPPipelineService;
import com.lfn.icip.icipwebeditor.service.impl.ICIPScriptService;
import com.lfn.icip.icipwebeditor.service.impl.ICIPStreamingServiceService;

public class ICIPNativeServiceJobTest {

	private static ICIPStreamingServiceService streamingService;
	private static ICIPSchemaRegistryService schemaRegistryService;
	private static ICIPDatasourceService datasourceService;
	private static ICIPDatasetService datasetService;
	private static ICIPPipelineService pipelineService;
	private static ICIPNativeServiceJob nativeServiceJob;
	private static ICIPJobsService jobsService;
	private static ICIPChainJobsService chainJobsService;
	private static ICIPPipelinePIDService pipelinePIDService; // testing webhook
	private static ICIPFileService fileService;
	private static ICIPBinaryFilesService binaryService;
	private static ICIPNativeScriptService nativeScriptService;
	private static ICIPScriptService scriptService;
	private static ICIPDragAndDropService dragAndDropService;
	private static IICIPDataSetServiceUtilFactory datasetFactory;

	private static JobExecutionContext jobExecutionContext;
	private static JobDetail jobDetail;
	private static JobDataMap jobDataMap;

	@BeforeAll
	private static void setup() throws SchedulerException, KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
		SetupResources.setup();
		binaryService = new ICIPBinaryFilesService(SetupResources.binaryRepository);
		nativeScriptService = new ICIPNativeScriptService(SetupResources.nativeScriptRepository);
		streamingService = new ICIPStreamingServiceService(SetupResources.streamingServicesRepository,
				nativeScriptService, binaryService, null, null);
//		schemaRegistryService = new ICIPSchemaRegistryService(SetupResources.schemaRegistryRepository, null);
//		datasourceService = new ICIPDatasourceService(null, SetupResources.datasourceRepository, null, null, null);
//		datasetService = new ICIPDatasetService(SetupResources.datasetRepository, SetupResources.datasetRepository2,
//				datasourceService, schemaRegistryService, datasetFactory, null);
		pipelineService = new ICIPPipelineService(Mockito.mock(RestTemplateBuilder.class), null, null, null,
				datasourceService, null, null, binaryService, null, null, null);
		pipelinePIDService = new ICIPPipelinePIDService(SetupResources.pipelinePIDRepository);
		scriptService = new ICIPScriptService(SetupResources.scriptRepository);
		dragAndDropService = new ICIPDragAndDropService(SetupResources.dragAndDropRepository);
		fileService = new ICIPFileService(null, nativeScriptService, scriptService, dragAndDropService, pipelineService,
				null);
		jobsService = new ICIPJobsService();

		jobExecutionContext = Mockito.mock(JobExecutionContext.class);
		jobDetail = Mockito.mock(JobDetail.class);
		jobDataMap = Mockito.mock(JobDataMap.class);

		Mockito.when(jobExecutionContext.getJobDetail()).thenReturn(jobDetail);
		Mockito.when(jobDetail.getKey()).thenReturn(new JobKey(SetupResources.RANDOM_ID1, SetupResources.RANDOM_ID2));
		Mockito.when(jobExecutionContext.getMergedJobDataMap()).thenReturn(jobDataMap);
		Mockito.when(jobDataMap.getString(SetupResources.CNAME_TEXT)).thenReturn(SetupResources.PIPELINENAME1);
		Mockito.when(jobDataMap.getString(SetupResources.ORG_TEXT)).thenReturn(SetupResources.ORG);
		Mockito.when(jobDataMap.getString(SetupResources.SUBMITTEDBY_TEXT)).thenReturn(SetupResources.USER);
		Mockito.when(jobDataMap.getString(SetupResources.CHAIN_TEXT)).thenReturn(String.valueOf(false));
		Mockito.when(jobDataMap.getString(SetupResources.RUNTIME_TEXT)).thenReturn(SetupResources.RUNTIME_DND);

		Mockito.when(SetupResources.jobRepository.save(Mockito.mock(ICIPJobs.class)))
				.thenReturn(SetupResources.icipJobs2);

//		Example<ICIPStreamingServices> example = null;
//		SetupResources.p1.setDeleted(false);
//		SetupResources.p1.setCreatedDate(null);
//		SetupResources.p1.setLastModifiedDate(null);
//		ExampleMatcher matcher = ExampleMatcher.matching().withMatcher("name", match -> match.ignoreCase().exact())
//				.withMatcher("organization", match -> match.ignoreCase().exact());
//		example = Example.of(SetupResources.p1, matcher);
//		Mockito.when(SetupResources.streamingServicesRepository.findOne(example).orElse(null))
//				.thenReturn(SetupResources.p1);
	}

	@Test
	void executeTest() throws JobExecutionException {
		nativeServiceJob.execute(jobExecutionContext);
	}
}
