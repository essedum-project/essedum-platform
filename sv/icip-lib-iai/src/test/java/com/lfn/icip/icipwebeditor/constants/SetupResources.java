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

package com.lfn.icip.icipwebeditor.constants;

import java.sql.Timestamp;
import java.util.Arrays;
import java.util.UUID;

import org.mockito.Mockito;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import com.lfn.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.lfn.icip.dataset.repository.ICIPDatasetRepository;
import com.lfn.icip.dataset.repository.ICIPDatasetRepository2;
import com.lfn.icip.dataset.repository.ICIPDatasourceRepository;
import com.lfn.icip.dataset.repository.ICIPSchemaRegistryRepository;
import com.lfn.icip.icipwebeditor.job.model.ChainObject;
import com.lfn.icip.icipwebeditor.job.model.ICIPChainJobs;
import com.lfn.icip.icipwebeditor.job.model.ICIPChains;
import com.lfn.icip.icipwebeditor.job.model.JobModel;
import com.lfn.icip.icipwebeditor.job.model.JobUpdateParams;
import com.lfn.icip.icipwebeditor.job.model.dto.JobModelDTO;
import com.lfn.icip.icipwebeditor.job.model.dto.JobParamsDTO;
import com.lfn.icip.icipwebeditor.model.ICIPBinaryFiles;
import com.lfn.icip.icipwebeditor.model.ICIPDragAndDrop;
import com.lfn.icip.icipwebeditor.model.ICIPGroupModel;
import com.lfn.icip.icipwebeditor.model.ICIPGroups;
import com.lfn.icip.icipwebeditor.model.ICIPJobs;
import com.lfn.icip.icipwebeditor.model.ICIPNativeScript;
import com.lfn.icip.icipwebeditor.model.ICIPPartialGroups;
import com.lfn.icip.icipwebeditor.model.ICIPPipelinePID;
import com.lfn.icip.icipwebeditor.model.ICIPPlugin;
import com.lfn.icip.icipwebeditor.model.ICIPScript;
import com.lfn.icip.icipwebeditor.model.ICIPStreamingServices;
import com.lfn.icip.icipwebeditor.model.dto.ICIPJobServerResponse;
import com.lfn.icip.icipwebeditor.model.dto.ICIPStreamingServices2DTO;
import com.lfn.icip.icipwebeditor.repository.ICIPBinaryFilesRepository;
import com.lfn.icip.icipwebeditor.repository.ICIPChainJobsRepository;
import com.lfn.icip.icipwebeditor.repository.ICIPChainsRepository;
import com.lfn.icip.icipwebeditor.repository.ICIPDragAndDropRepository;
import com.lfn.icip.icipwebeditor.repository.ICIPGroupModelRepository;
import com.lfn.icip.icipwebeditor.repository.ICIPGroupModelRepository2;
import com.lfn.icip.icipwebeditor.repository.ICIPGroupsRepository;
import com.lfn.icip.icipwebeditor.repository.ICIPJobsRepository;
import com.lfn.icip.icipwebeditor.repository.ICIPNativeScriptRepository;
import com.lfn.icip.icipwebeditor.repository.ICIPPartialGroupsRepository;
import com.lfn.icip.icipwebeditor.repository.ICIPPipelinePIDRepository;
import com.lfn.icip.icipwebeditor.repository.ICIPPluginRepository;
import com.lfn.icip.icipwebeditor.repository.ICIPScriptRepository;
import com.lfn.icip.icipwebeditor.repository.ICIPStreamingServicesRepository;

public class SetupResources {

	public static final String ORG = "ACME";
	public static final String GROUP = "test";
	public static final String USER = "testadmin";

	public static final String EVENTNAME1 = "test1";
	public static final String EVENTPARAMS1 = "test1";
	public static final String PIPELINENAME1 = "test1";
	public static final String JOBNAME1 = "test1";
	public static final String JOBTYPE1 = "pipeline";

	public static final String EVENTNAME2 = "test2";
	public static final String EVENTPARAMS2 = "test2";
	public static final String PIPELINENAME2 = "test2";
	public static final String JOBNAME2 = "test2";
	public static final String JOBTYPE2 = "chain";

	public static final String ACTION1 = "Create";
	public static final String ACTION2 = "Delete";

	public static final String GROUP1 = "testgroup1";
	public static final String GROUP2 = "testgroup2";

	public static final String CSVFILE = "test.csv";
	public static final String XLSXFILE = "test.xlsx";
	public static final String YAMLFILE = "test.yaml";
	public static final String PYTHONFILE = "test.py";
	public static final String JAVASCRIPTFILE = "test.js";
	public static final String JARFILE = "test.jar";
	public static final String TEXTFILE = "test.txt";

	public static final String RANDOM_ID1 = UUID.randomUUID().toString();
	public static final String RANDOM_ID2 = UUID.randomUUID().toString();

	public static final String DATE1 = "2050-10-10";
	public static final String DATE2 = "1050-10-10";

	public static final Pageable PAGEABLE = null;
	public static final String JOBSPECPATH = "D:/";
	public static final String SPARK_HOST = "";
	public static final Integer SPARK_PORT = 0;
	public static final Timestamp CURRENT_TIME = new Timestamp(System.currentTimeMillis());
	public static final String TIME = "10:10";
	public static final String TIMEZONE = "Asia/Kolkata";
	public static final String ENTITY_TYPE = "Pipeline";
	public static final String RUNTIME_DND = "DRAGANDDROP";
	public static final String RUNTIME_SCRIPT = "SCRIPT";
	public static final String RUNTIME_BINARY = "BINARY";
	public static final String RUNTIME_NS = "NATIVESCRIPT";

	public static final String INVALID_FILE_NAME = "Invalid FileName";
	public static final String UNABLE_TO_PROCEED_IN_STANDBY_MODE = "Unable to proceed in standby mode";

	public static final String RUNTIME_TEXT = "runtime";
	public static final String CNAME_TEXT = "cname";
	public static final String ORG_TEXT = "org";
	public static final String PARAMS_TEXT = "params";
	public static final String SUBMITTEDBY_TEXT = "submittedBy";
	public static final String PIPELINENAME_TEXT = "pipelinename";
	public static final String CHAIN_TEXT = "chain";
	public static final String CHAINID_TEXT = "chainId";
	public static final String TOTALCHAINELEMENTS_TEXT = "totalChainNumber";
	public static final String CHAINNUMBER_TEXT = "chainNumber";
	public static final String CHAINNAME_TEXT = "chainName";

	public static ICIPStreamingServicesRepository streamingServicesRepository;
	public static ICIPChainsRepository iCIPChainsRepository;
	public static ICIPChainJobsRepository chainJobRepository;
	public static ICIPNativeScriptRepository nativeScriptRepository;
	public static ICIPScriptRepository scriptRepository;
	public static ICIPDragAndDropRepository dragAndDropRepository;
	public static ICIPDatasetRepository datasetRepository;
	public static ICIPDatasetRepository2 datasetRepository2;
	public static ICIPSchemaRegistryRepository schemaRegistryRepository;
	public static ICIPBinaryFilesRepository binaryRepository;
	public static ICIPGroupModelRepository groupModelRepository;
	public static ICIPGroupModelRepository2 groupModelRepository2;
	public static ICIPGroupsRepository groupsRepository;
	public static ICIPJobsRepository jobRepository;
	public static ICIPPartialGroupsRepository partialGroupsRepository;
	public static ICIPPipelinePIDRepository pipelinePIDRepository;
	public static ICIPPluginRepository pluginRepository;
	public static ICIPDatasourceRepository datasourceRepository;

	public static NameAndAliasDTO p1;
	public static ICIPStreamingServices p2;

	public static ICIPChains c1;
	public static ICIPChains c2;

	public static ChainObject chainObject1;
	public static ChainObject chainObject2;

	public static ICIPBinaryFiles binary1;
	public static ICIPBinaryFiles binary2;

	public static ICIPChainJobs chainJob1;
	public static ICIPChainJobs chainJob2;

	public static ICIPDragAndDrop dragAndDrop1;
	public static ICIPDragAndDrop dragAndDrop2;

	public static ICIPGroupModel groupModel1;
	public static ICIPGroupModel groupModel2;

	public static ICIPGroups group1;
	public static ICIPGroups group2;

	public static ICIPJobs icipJobs1;
	public static ICIPJobs icipJobs2;

	public static ICIPJobServerResponse jobServerResponse1;
	public static ICIPJobServerResponse jobServerResponse2;

	public static ICIPNativeScript nativeScript1;
	public static ICIPNativeScript nativeScript2;

	public static ICIPPartialGroups partialGroup1;
	public static ICIPPartialGroups partialGroup2;

	public static ICIPPipelinePID pipelinePID1;
	public static ICIPPipelinePID pipelinePID2;

	public static ICIPPlugin plugin1;
	public static ICIPPlugin plugin2;

	public static ICIPScript script1;
	public static ICIPScript script2;


	public static ICIPStreamingServices2DTO partialStreamingServices1;
	public static ICIPStreamingServices2DTO partialStreamingServices2;

	public static ICIPStreamingServices2DTO partialStreamingServices21;
	public static ICIPStreamingServices2DTO partialStreamingServices22;

	public static JobParamsDTO jobCreateParams1;
	public static JobParamsDTO jobCreateParams2;
	public static JobParamsDTO jobCreateParams3;
	public static JobParamsDTO jobCreateParams4;

	public static JobModelDTO jobDataModel1;
	public static JobModelDTO jobDataModel2;

	public static JobModel jobModel1;
	public static JobModel jobModel2;

	public static JobUpdateParams jobUpdateParams1;
	public static JobUpdateParams jobUpdateParams2;

	public static SecurityContextHolder sec;

	public static void setup() {
		streamingServicesRepository = Mockito.mock(ICIPStreamingServicesRepository.class);
		iCIPChainsRepository = Mockito.mock(ICIPChainsRepository.class);
		chainJobRepository = Mockito.mock(ICIPChainJobsRepository.class);
		binaryRepository = Mockito.mock(ICIPBinaryFilesRepository.class);
		nativeScriptRepository = Mockito.mock(ICIPNativeScriptRepository.class);
		dragAndDropRepository = Mockito.mock(ICIPDragAndDropRepository.class);
		datasetRepository = Mockito.mock(ICIPDatasetRepository.class);
		datasetRepository2 = Mockito.mock(ICIPDatasetRepository2.class);
		schemaRegistryRepository = Mockito.mock(ICIPSchemaRegistryRepository.class);
		groupModelRepository = Mockito.mock(ICIPGroupModelRepository.class);
		groupModelRepository2 = Mockito.mock(ICIPGroupModelRepository2.class);
		groupsRepository = Mockito.mock(ICIPGroupsRepository.class);
		jobRepository = Mockito.mock(ICIPJobsRepository.class);
		partialGroupsRepository = Mockito.mock(ICIPPartialGroupsRepository.class);
		pipelinePIDRepository = Mockito.mock(ICIPPipelinePIDRepository.class);
		pluginRepository = Mockito.mock(ICIPPluginRepository.class);
		scriptRepository = Mockito.mock(ICIPScriptRepository.class);
		datasourceRepository = Mockito.mock(ICIPDatasourceRepository.class);



		c1 = new ICIPChains();
		c1.setId(1);
		c1.setOrganization(ORG);
		c1.setJobName(JOBNAME1);
		c1.setJsonContent(getJsonContent(DATE1, true));
		c2 = new ICIPChains();
		c2.setId(2);
		c2.setOrganization(ORG);
		c2.setJobName(JOBNAME2);
		c2.setJsonContent(getJsonContent(DATE2, false));

		Mockito.when(iCIPChainsRepository.findByOrganization(ORG))
				.thenReturn(Arrays.asList(new ICIPChains[] { c1, c2 }));
		Mockito.when(iCIPChainsRepository.findByOrganization(ORG, PAGEABLE))
				.thenReturn(new PageImpl<>(Arrays.asList(new ICIPChains[] { c1, c2 })));
		Mockito.when(iCIPChainsRepository.countByOrganization(ORG)).thenReturn(2L);
		Mockito.when(iCIPChainsRepository.findByJobName(JOBNAME1)).thenReturn(c1);
		Mockito.when(iCIPChainsRepository.findByJobNameAndOrganization(JOBNAME1, ORG)).thenReturn(c1);

		chainObject1 = new ChainObject();
		chainObject1.setJobName(JOBNAME1);
		chainObject1.setOrg(ORG);
		chainObject2 = new ChainObject();
		chainObject2.setJobName(JOBNAME2);
		chainObject2.setOrg(ORG);

		binary1 = new ICIPBinaryFiles();
		binary1.setId(1);
		binary1.setCname(PIPELINENAME1);
		binary1.setOrganization(ORG);
		binary1.setFilename(JARFILE);
		binary2 = new ICIPBinaryFiles();
		binary2.setId(2);
		binary2.setCname(PIPELINENAME2);
		binary2.setOrganization(ORG);
		binary2.setFilename(JARFILE);

		Mockito.when(binaryRepository.findByCnameAndOrganizationAndFilename(PIPELINENAME1, ORG, JARFILE))
				.thenReturn(binary1);
		Mockito.when(binaryRepository.findByCnameAndOrganizationAndFilename(PIPELINENAME2, ORG, JARFILE))
				.thenReturn(binary2);

		chainJob1 = new ICIPChainJobs();
		chainJob1.setId(1);
		chainJob1.setJobId(RANDOM_ID1);
		chainJob1.setJobName(JOBNAME1);
		chainJob1.setOrganization(ORG);
		chainJob1.setSubmittedBy(USER);
		chainJob1.setSubmittedOn(CURRENT_TIME);
		chainJob2 = new ICIPChainJobs();
		chainJob2.setId(2);
		chainJob2.setJobId(RANDOM_ID2);
		chainJob2.setJobName(JOBNAME2);
		chainJob2.setOrganization(ORG);
		chainJob2.setSubmittedBy(USER);
		chainJob2.setSubmittedOn(CURRENT_TIME);

		Mockito.when(chainJobRepository.findByJobId(RANDOM_ID1)).thenReturn(chainJob1);
		Mockito.when(chainJobRepository.findByJobName(JOBNAME1, PAGEABLE))
				.thenReturn(new PageImpl<>(Arrays.asList(new ICIPChainJobs[] { chainJob1, chainJob2 })));
		Mockito.when(chainJobRepository.findByJobNameAndOrganization(JOBNAME1, ORG, PAGEABLE))
				.thenReturn(new PageImpl<>(Arrays.asList(new ICIPChainJobs[] { chainJob1, chainJob2 })));
		Mockito.when(chainJobRepository.countByJobName(JOBNAME2)).thenReturn(null);
		Mockito.when(chainJobRepository.countByJobNameAndOrganization(JOBNAME2, ORG)).thenReturn(null);

		dragAndDrop1 = new ICIPDragAndDrop();
		dragAndDrop1.setId(1);
		dragAndDrop1.setCname(PIPELINENAME1);
		dragAndDrop1.setOrganization(ORG);
		dragAndDrop1.setFilename(YAMLFILE);
		dragAndDrop2 = new ICIPDragAndDrop();
		dragAndDrop2.setId(2);
		dragAndDrop2.setCname(PIPELINENAME2);
		dragAndDrop2.setOrganization(ORG);
		dragAndDrop2.setFilename(YAMLFILE);

		Mockito.when(dragAndDropRepository.findByCnameAndOrganizationAndFilename(PIPELINENAME1, ORG, YAMLFILE))
				.thenReturn(dragAndDrop1);
		Mockito.when(dragAndDropRepository.findByCnameAndOrganizationAndFilename(PIPELINENAME2, ORG, YAMLFILE))
				.thenReturn(dragAndDrop2);

		groupModel1 = new ICIPGroupModel();
		groupModel1.setId(1);
		groupModel1.setOrganization(ORG);
		groupModel1.setEntity(PIPELINENAME1);
		groupModel1.setEntityType(ENTITY_TYPE);
		groupModel1.setGroups(Mockito.mock(ICIPGroups.class));
		groupModel2 = new ICIPGroupModel();
		groupModel2.setId(2);
		groupModel2.setOrganization(ORG);
		groupModel2.setEntity(PIPELINENAME2);
		groupModel2.setEntityType(ENTITY_TYPE);
		groupModel2.setGroups(Mockito.mock(ICIPGroups.class));

		Mockito.when(groupModelRepository.findByEntityAndEntityTypeAndGroups_name(PIPELINENAME1, ENTITY_TYPE, GROUP1))
				.thenReturn(Arrays.asList(new ICIPGroupModel[] { groupModel1, groupModel2 }));
		Mockito.when(groupModelRepository.findByEntityTypeAndGroups_nameAndOrganization(ENTITY_TYPE, GROUP1, ORG))
				.thenReturn(Arrays.asList(new ICIPGroupModel[] { groupModel1, groupModel2 }));
		Mockito.when(groupModelRepository.findByGroups_nameAndOrganization(GROUP1, ORG))
				.thenReturn(Arrays.asList(new ICIPGroupModel[] { groupModel1, groupModel2 }));
		Mockito.when(groupModelRepository.getEntityByOrganizationAndEntityType(ORG, ENTITY_TYPE))
				.thenReturn(Arrays.asList(new ICIPGroupModel[] { groupModel1, groupModel2 }));
		Mockito.when(groupModelRepository.findByOrganization(ORG))
				.thenReturn(Arrays.asList(new ICIPGroupModel[] { groupModel1, groupModel2 }));

		group1 = new ICIPGroups();
		group1.setId(1);
		group1.setName(GROUP1);
		group1.setOrganization(ORG);
		group2 = new ICIPGroups();
		group2.setId(1);
		group2.setName(GROUP2);
		group2.setOrganization(ORG);

		Mockito.when(groupsRepository.findByOrganization(ORG))
				.thenReturn(Arrays.asList(new ICIPGroups[] { group1, group2 }));
		Mockito.when(groupsRepository.findByOrganizationAndGroupsModel_EntityAndGroupsModel_EntityType(ORG, GROUP2,
				ENTITY_TYPE)).thenReturn(Arrays.asList(new ICIPGroups[] { group1, group2 }));

//		internalJob1 = new ICIPInternalJobs();
//		internalJob1.setId(1);
//		internalJob1.setJobId(RANDOM_ID1);
//		internalJob1.setJobName(JOBNAME1);
//		internalJob1.setOrganization(ORG);
//		internalJob1.setSubmittedOn(CURRENT_TIME);
//		internalJob1.setSubmittedBy(USER);
//		internalJob2 = new ICIPInternalJobs();
//		internalJob2.setId(2);
//		internalJob2.setJobId(RANDOM_ID2);
//		internalJob2.setJobName(JOBNAME2);
//		internalJob2.setOrganization(ORG);
//		internalJob2.setSubmittedOn(CURRENT_TIME);
//		internalJob2.setSubmittedBy(USER);

//		Mockito.when(internalJobRepository.findByJobId(RANDOM_ID1)).thenReturn(internalJob1);
//		Mockito.when(internalJobRepository.findByJobId(RANDOM_ID2)).thenReturn(internalJob2);

		icipJobs1 = new ICIPJobs();
		icipJobs1.setId(1);
		icipJobs1.setJobId(RANDOM_ID1);
		icipJobs1.setStreamingService(PIPELINENAME1);
		icipJobs1.setOrganization(ORG);
		icipJobs1.setSubmittedBy(USER);
		icipJobs1.setSubmittedOn(CURRENT_TIME);
		icipJobs2 = new ICIPJobs();
		icipJobs2.setId(2);
		icipJobs2.setJobId(RANDOM_ID2);
		icipJobs2.setStreamingService(PIPELINENAME2);
		icipJobs2.setOrganization(ORG);
		icipJobs2.setSubmittedBy(USER);
		icipJobs2.setSubmittedOn(CURRENT_TIME);

		Mockito.when(jobRepository.findByJobId(RANDOM_ID1)).thenReturn(icipJobs1);
		Mockito.when(jobRepository.findByOrganization(ORG, PAGEABLE))
				.thenReturn(new PageImpl<>(Arrays.asList(new ICIPJobs[] { icipJobs1, icipJobs2 })));

		jobServerResponse1 = new ICIPJobServerResponse();
		jobServerResponse1.setJobId(RANDOM_ID1);
		jobServerResponse2 = new ICIPJobServerResponse();
		jobServerResponse2.setJobId(RANDOM_ID2);

		nativeScript1 = new ICIPNativeScript();
		nativeScript1.setId(1);
		nativeScript1.setCname(PIPELINENAME1);
		nativeScript1.setOrganization(ORG);
		nativeScript1.setFilename(JAVASCRIPTFILE);
		nativeScript2 = new ICIPNativeScript();
		nativeScript2.setId(2);
		nativeScript2.setCname(PIPELINENAME2);
		nativeScript2.setOrganization(ORG);
		nativeScript2.setFilename(PYTHONFILE);

		Mockito.when(nativeScriptRepository.findByCnameAndOrganizationAndFilename(PIPELINENAME1, ORG, JAVASCRIPTFILE))
				.thenReturn(nativeScript1);
		Mockito.when(nativeScriptRepository.findByCnameAndOrganizationAndFilename(PIPELINENAME2, ORG, PYTHONFILE))
				.thenReturn(nativeScript2);

		partialGroup1 = new ICIPPartialGroups();
		partialGroup1.setId(1);
		partialGroup1.setName(GROUP1);
		partialGroup1.setOrganization(ORG);
		partialGroup2 = new ICIPPartialGroups();
		partialGroup2.setId(2);
		partialGroup2.setName(GROUP2);
		partialGroup2.setOrganization(ORG);

		Mockito.when(partialGroupsRepository.findByOrganization(ORG))
				.thenReturn(Arrays.asList(new ICIPPartialGroups[] { partialGroup1, partialGroup2 }));
		Mockito.when(partialGroupsRepository.findByOrganization(ORG, PageRequest.of(0, 10)))
				.thenReturn(Arrays.asList(new ICIPPartialGroups[] { partialGroup1, partialGroup2 }));
		Mockito.when(partialGroupsRepository.findFeaturedByOrganization(ORG))
				.thenReturn(Arrays.asList(new ICIPPartialGroups[] { partialGroup1, partialGroup2 }));
		Mockito.when(partialGroupsRepository.findByOrganizationAndEntityPipelines(ORG, GROUP, PageRequest.of(0, 10)))
				.thenReturn(Arrays.asList(new ICIPPartialGroups[] { partialGroup1, partialGroup2 }));
		Mockito.when(partialGroupsRepository.findByOrganizationAndEntityDatasources(ORG, GROUP, PageRequest.of(0, 10)))
				.thenReturn(Arrays.asList(new ICIPPartialGroups[] { partialGroup1, partialGroup2 }));
		Mockito.when(partialGroupsRepository.findByOrganizationAndEntityDatasets(ORG, GROUP, PageRequest.of(0, 10)))
				.thenReturn(Arrays.asList(new ICIPPartialGroups[] { partialGroup1, partialGroup2 }));
		Mockito.when(partialGroupsRepository.findByOrganizationAndEntitySchemas(ORG, GROUP, PageRequest.of(0, 10)))
				.thenReturn(Arrays.asList(new ICIPPartialGroups[] { partialGroup1, partialGroup2 }));

		pipelinePID1 = new ICIPPipelinePID();
		pipelinePID1.setSno(1);
		pipelinePID2 = new ICIPPipelinePID();
		pipelinePID2.setSno(2);

		Mockito.when(pipelinePIDRepository.save(Mockito.mock(ICIPPipelinePID.class))).thenReturn(pipelinePID1);

		plugin1 = new ICIPPlugin();
		plugin1.setId(1);
		plugin1.setType(ENTITY_TYPE);
		plugin1.setName(PIPELINENAME1);
		plugin2 = new ICIPPlugin();
		plugin2.setId(2);
		plugin2.setType(ENTITY_TYPE);
		plugin2.setName(PIPELINENAME2);

		Mockito.when(pluginRepository.getByType(ENTITY_TYPE))
				.thenReturn(Arrays.asList(new ICIPPlugin[] { plugin1, plugin2 }));

		script1 = new ICIPScript();
		script1.setId(1);
		script1.setCname(PIPELINENAME1);
		script1.setOrganization(ORG);
		script1.setFilename(YAMLFILE);
		script2 = new ICIPScript();
		script2.setId(2);
		script2.setCname(PIPELINENAME2);
		script2.setOrganization(ORG);
		script2.setFilename(YAMLFILE);

		Mockito.when(scriptRepository.findByCnameAndOrganizationAndFilename(PIPELINENAME1, ORG, YAMLFILE))
				.thenReturn(script1);
		Mockito.when(scriptRepository.findByOrganization(ORG))
				.thenReturn(Arrays.asList(new ICIPScript[] { script1, script2 }));

		jobCreateParams1 = new JobParamsDTO();
		jobCreateParams1.setOrg(ORG);
		jobCreateParams1.setIsNative(String.valueOf(true));
		jobCreateParams1.setMyDate(DATE1);
		jobCreateParams1.setMyTime(TIME);
		jobCreateParams1.setTimeZone(TIMEZONE);
		jobCreateParams2 = new JobParamsDTO();
		jobCreateParams2.setOrg(ORG);
		jobCreateParams2.setIsNative(String.valueOf(true));
		jobCreateParams2.setMyDate(DATE2);
		jobCreateParams2.setMyTime(TIME);
		jobCreateParams2.setTimeZone(TIMEZONE);
		jobCreateParams3 = new JobParamsDTO();
		jobCreateParams3.setOrg(ORG);
		jobCreateParams3.setIsNative(String.valueOf(false));
		jobCreateParams3.setMyDate(DATE1);
		jobCreateParams3.setMyTime(TIME);
		jobCreateParams3.setTimeZone(TIMEZONE);
		jobCreateParams4 = new JobParamsDTO();
		jobCreateParams4.setOrg(ORG);
		jobCreateParams4.setIsNative(String.valueOf(false));
		jobCreateParams4.setMyDate(DATE2);
		jobCreateParams4.setMyTime(TIME);
		jobCreateParams4.setTimeZone(TIMEZONE);

		jobDataModel1 = new JobModelDTO();
		jobDataModel1.setCname(PIPELINENAME1);
		jobDataModel2 = new JobModelDTO();
		jobDataModel2.setCname(PIPELINENAME2);

		jobUpdateParams1 = new JobUpdateParams();
		jobUpdateParams1.setDate(DATE1);
		jobUpdateParams1.setTime(TIME);
		jobUpdateParams1.setTimezone(TIMEZONE);
		jobUpdateParams2 = new JobUpdateParams();
		jobUpdateParams2.setDate(DATE2);
		jobUpdateParams2.setTime(TIME);
		jobUpdateParams2.setTimezone(TIMEZONE);

		jobModel1 = new JobModel();
		jobModel1.setCname(PIPELINENAME1);
		jobModel1.setOrg(ORG);
//		jobModel1.setIsNative(String.valueOf(true));
		jobModel2 = new JobModel();
		jobModel2.setCname(PIPELINENAME2);
		jobModel2.setOrg(ORG);
//		jobModel2.setIsNative(String.valueOf(false));

		Authentication authentication = Mockito.mock(Authentication.class);
		// Mockito.whens() for your authorization object
		SecurityContext securityContext = Mockito.mock(SecurityContext.class);
		Mockito.when(securityContext.getAuthentication()).thenReturn(authentication);
		SecurityContextHolder.setContext(securityContext);
	}

	private static String getJsonContent(String date, boolean runNow) {
		String jsonContent = "{\"myDate\":\"" + date + "\",\"myTime\":\"" + TIME + "\",\"timeZone\":\"" + TIMEZONE
				+ "\",\"runNow\":" + String.valueOf(runNow) + "}";
		return jsonContent;
	}
}
