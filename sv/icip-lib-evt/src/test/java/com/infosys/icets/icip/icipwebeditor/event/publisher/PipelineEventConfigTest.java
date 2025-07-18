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
package com.infosys.icets.icip.icipwebeditor.event.publisher;
//
//import java.util.List;
//import java.util.concurrent.CompletableFuture;
//
//import org.junit.jupiter.api.BeforeAll;
//import org.junit.jupiter.api.Test;
//import org.mockito.Mockito;
//import org.quartz.ListenerManager;
//import org.quartz.Scheduler;
//import org.quartz.SchedulerException;
//import org.springframework.boot.web.client.RestTemplateBuilder;
//import org.springframework.context.ApplicationEventPublisher;
//import org.springframework.scheduling.quartz.SchedulerFactoryBean;
//import com.infosys.icets.icip.dataset.factory.IICIPDataSetServiceUtilFactory;
//import com.infosys.icets.icip.dataset.service.impl.ICIPDatasetPluginsService;
//import com.infosys.icets.icip.dataset.service.impl.ICIPDatasetService;
//import com.infosys.icets.icip.dataset.service.impl.ICIPDatasourceService;
//import com.infosys.icets.icip.dataset.service.impl.ICIPSchemaRegistryService;
//import com.infosys.icets.icip.dataset.service.util.IICIPDataSetServiceUtil;
//import com.infosys.icets.icip.icipwebeditor.constants.SetupResources;
//import com.infosys.icets.icip.icipwebeditor.event.listener.PipelineEventListener;
//import com.infosys.icets.icip.icipwebeditor.event.model.PipelineEvent;
//import com.infosys.icets.icip.icipwebeditor.job.listener.ICIPJobSchedulerListener;
//import com.infosys.icets.icip.icipwebeditor.job.service.JobScheduleService;
//import com.infosys.icets.icip.icipwebeditor.job.service.impl.JobScheduleServiceImpl;
//import com.infosys.icets.icip.icipwebeditor.service.IICIPChainJobsService;
//import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPAuditService;
//import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPBinaryFilesService;
//import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPChainJobsService;
//import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPChainsService;
//import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPDragAndDropService;
//import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPEventJobMappingService;
//import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPFileService;
//import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPNativeScriptService;
//import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPPipelineService;
//import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPScriptService;
//import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPStreamingServiceService;
//
class PipelineEventConfigTest {
//
//	private static ICIPEventJobMappingService eventMappingService;
//	private static PipelineEventPublisher publisher;
//	private static ICIPStreamingServiceService streamingServices;
//	private static ICIPChainsService chainService;
//	private static ICIPAuditService iICIPAuditServce;
//	private static JobScheduleService jobSchedulerService;
//	private static IICIPChainJobsService chainjobService;
//	private static ICIPFileService fileService;
//	private static ICIPBinaryFilesService binaryService;
//	private static ICIPNativeScriptService nativeScriptService;
//	private static ICIPScriptService scriptService;
//	private static ICIPDragAndDropService dragAndDropService;
//	private static ICIPPipelineService pipelineService;
//	private static PipelineEventListener listener;
//	private static Scheduler scheduler = Mockito.mock(Scheduler.class);
//	private static ICIPSchemaRegistryService schemaService;
//	private static ICIPDatasetService datasetService;
//
//	private static ICIPSchemaRegistryService schemaRegistryService;
//	private static IICIPDataSetServiceUtilFactory datasetFactory;
//	private static List<IICIPDataSetServiceUtil> dataSetList;
//	private static ICIPDatasourceService datasourceService;
//	private static ICIPDatasetPluginsService datasetPluginService;
//
//	@BeforeAll
//	private static void setup() throws SchedulerException {
//		SetupResources.setup();
//		iICIPAuditServce = new ICIPAuditService(SetupResources.iCIPAuditRepository);
//		streamingServices = new ICIPStreamingServiceService(iICIPAuditServce, SetupResources.iCIPAuditRepository,
//				SetupResources.streamingServicesRepository);
//		chainService = new ICIPChainsService(SetupResources.iCIPChainsRepository);
//		eventMappingService = new ICIPEventJobMappingService(SetupResources.icipEventMappingRepositiory,
//				streamingServices, chainService);
//		SchedulerFactoryBean schedulerFactory = Mockito.mock(SchedulerFactoryBean.class);
//		scheduler = Mockito.mock(Scheduler.class);
//		Mockito.when(schedulerFactory.getScheduler()).thenReturn(scheduler);
//		jobSchedulerService = new JobScheduleServiceImpl(schedulerFactory, SetupResources.JOBSPECPATH);
//
//		binaryService = new ICIPBinaryFilesService(SetupResources.binaryRepository);
//		nativeScriptService = new ICIPNativeScriptService(SetupResources.nativeScriptRepository);
//		scriptService = new ICIPScriptService(SetupResources.scriptRepository);
//		dragAndDropService = new ICIPDragAndDropService(SetupResources.dragAndDropRepository);
//		datasetService = new ICIPDatasetService(new String[] {}, SetupResources.datasetRepository,
//				SetupResources.datasetRepository2, datasourceService, schemaRegistryService,
//				SetupResources.iCIPIAMPDataDataRepository);
//		datasetPluginService = new ICIPDatasetPluginsService(datasetFactory, dataSetList, datasetService);
//
//		schemaService = new ICIPSchemaRegistryService(SetupResources.schemaRegistryRepository);
//		pipelineService = new ICIPPipelineService(Mockito.mock(RestTemplateBuilder.class), "sjsPath", 80, "spsAppname",
//				"sjsJarLocation", "sjsScalaContext", "sjsPythonContext", "dagsterHost", 80, "dagsterPath",
//				streamingServices, schemaService, datasetService);
//
//		fileService = new ICIPFileService(SetupResources.JOBSPECPATH, binaryService, nativeScriptService, scriptService,
//				dragAndDropService, pipelineService);
//		chainjobService = new ICIPChainJobsService(SetupResources.JOBSPECPATH, fileService,
//				SetupResources.chainJobRepository);
//
//		publisher = new PipelineEventPublisher();
//		listener = new PipelineEventListener(jobSchedulerService, streamingServices,
//				(ICIPEventJobMappingService) eventMappingService, chainjobService, chainService, schedulerFactory);
//
//	}
//
//	@Test
//	void EventMappingIsValidPipelineTest() {
//
//		Mockito.when(SetupResources.icipEventMappingRepositiory
//				.findByEventnameAndOrganization(SetupResources.EVENTNAME1, SetupResources.ORG)).thenReturn(null);
//		eventMappingService.isValidEvent(SetupResources.EVENTNAME1, SetupResources.ORG);
//
//		Mockito.when(SetupResources.icipEventMappingRepositiory
//				.findByEventnameAndOrganization(SetupResources.EVENTNAME1, SetupResources.ORG))
//				.thenReturn(SetupResources.e1);
//		eventMappingService.isValidEvent(SetupResources.EVENTNAME1, SetupResources.ORG);
//
//		Mockito.when(SetupResources.icipEventMappingRepositiory
//				.findByEventnameAndOrganization(SetupResources.EVENTNAME2, SetupResources.ORG))
//				.thenReturn(SetupResources.e2);
//		Mockito.when(SetupResources.iCIPChainsRepository.findByJobNameAndOrganization(SetupResources.EVENTNAME2,
//				SetupResources.ORG)).thenReturn(SetupResources.c1);
//		eventMappingService.isValidEvent(SetupResources.EVENTNAME2, SetupResources.ORG);
//
//		Mockito.when(SetupResources.iCIPChainsRepository.findByJobNameAndOrganization(SetupResources.EVENTNAME2,
//				SetupResources.ORG)).thenReturn(null);
//		eventMappingService.isValidEvent(SetupResources.EVENTNAME2, SetupResources.ORG);
//	}
//
//	@Test
//	void SchedulerStandByTest() throws Exception {
//		ApplicationEventPublisher applicationEventPublisher = Mockito.mock(ApplicationEventPublisher.class);
//		publisher.setApplicationEventPublisher(applicationEventPublisher);
//
//		PipelineEvent event = new PipelineEvent(this, SetupResources.EVENTNAME1, SetupResources.ORG,
//				SetupResources.EVENTPARAMS1);
//		Mockito.when(scheduler.isInStandbyMode()).thenReturn(true);
//		listener.onApplicationEvent(event);
//	}
//
//	@Test
//	void SchedulerRunningTest() throws Exception {
//		ApplicationEventPublisher applicationEventPublisher = Mockito.mock(ApplicationEventPublisher.class);
//		publisher.setApplicationEventPublisher(applicationEventPublisher);
//
//		Mockito.when(scheduler.isInStandbyMode()).thenReturn(false);
//		ListenerManager listenerManager = Mockito.mock(ListenerManager.class);
//		ICIPJobSchedulerListener jobListener = Mockito.mock(ICIPJobSchedulerListener.class);
//		CompletableFuture<Boolean> jobStatus = Mockito.mock(CompletableFuture.class);
//		Mockito.when(jobListener.getStatus()).thenReturn(jobStatus);
//		jobStatus.complete(true);
//		Mockito.when(listenerManager.getJobListener(Mockito.anyString())).thenReturn(jobListener);
//		Mockito.when(scheduler.getListenerManager()).thenReturn(listenerManager);
//
//		// Pipeline Type
//		Mockito.when(SetupResources.iCIPChainsRepository.findByJobNameAndOrganization(SetupResources.EVENTNAME1,
//				SetupResources.ORG)).thenReturn(SetupResources.c1);
//		PipelineEvent event = new PipelineEvent(this, SetupResources.EVENTNAME1, SetupResources.ORG,
//				SetupResources.EVENTPARAMS1);
//		listener.onApplicationEvent(event);
//
//		// Chain Type
//		Mockito.when(SetupResources.iCIPChainsRepository.findByJobNameAndOrganization(SetupResources.EVENTNAME2,
//				SetupResources.ORG)).thenReturn(SetupResources.c1);
//		event = new PipelineEvent(this, SetupResources.EVENTNAME2, SetupResources.ORG, SetupResources.EVENTPARAMS2);
//		listener.onApplicationEvent(event);
//	}
}
