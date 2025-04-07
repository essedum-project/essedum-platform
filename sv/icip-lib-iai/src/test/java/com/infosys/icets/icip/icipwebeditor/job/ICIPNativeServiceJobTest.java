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
package com.infosys.icets.icip.icipwebeditor.job;

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

import com.infosys.icets.icip.dataset.factory.IICIPDataSetServiceUtilFactory;
import com.infosys.icets.icip.dataset.service.impl.ICIPDatasetService;
import com.infosys.icets.icip.dataset.service.impl.ICIPDatasourceService;
import com.infosys.icets.icip.dataset.service.impl.ICIPSchemaRegistryService;
import com.infosys.icets.icip.icipwebeditor.constants.SetupResources;
import com.infosys.icets.icip.icipwebeditor.file.service.ICIPFileService;
import com.infosys.icets.icip.icipwebeditor.jobmodel.service.ICIPChainJobsService;
import com.infosys.icets.icip.icipwebeditor.jobmodel.service.ICIPJobsService;
import com.infosys.icets.icip.icipwebeditor.model.ICIPJobs;
import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPBinaryFilesService;
import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPDragAndDropService;
import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPNativeScriptService;
import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPPipelinePIDService;
import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPPipelineService;
import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPScriptService;
import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPStreamingServiceService;

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
	private static void setup() throws SchedulerException {
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
