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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.icip.icipwebeditor.job.enums.JobStatus;
import com.infosys.icets.icip.icipwebeditor.jobmodel.service.ICIPJobsService;
import com.infosys.icets.icip.icipwebeditor.model.ICIPJobs;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPJobsRepository;

class ICIPJobsServiceTest {

	@InjectMocks
	ICIPJobsService service;

	@Mock
	ICIPJobsRepository repository;

	ICIPJobs job;
	Pageable pageable;
	String org;
	String cname;
	String jobId;
	List<ICIPJobs> list;
	List<Object> commonList;

	@BeforeAll
	void setUp() throws Exception {
		org = "Acme";
		cname = "Predict Cluster";
		jobId = ICIPUtils.removeSpecialCharacter(UUID.randomUUID().toString());
		pageable = PageRequest.of(0, 1);

		MockitoAnnotations.initMocks(this);

		job = new ICIPJobs();
		job.setJobId(jobId);
		job.setJobStatus(JobStatus.COMPLETED.toString());
		job.setLog("Test Log");
		job.setOrganization(org);
		job.setRuntime("local");
		job.setStreamingService(cname);
		job.setSubmittedBy("testadmin");
		job.setSubmittedOn(new Timestamp(System.currentTimeMillis()));
		job.setType("DragAndDrop");
		job.setHashparams(ICIPUtils.removeSpecialCharacter(UUID.randomUUID().toString()));
		Mockito.when(repository.save(job)).thenReturn(job);
		Mockito.when(repository.findByJobId(jobId)).thenReturn(job);
	}

	@Test
	void testSave() {
		assertEquals(service.save(job).getJobId(), jobId);
	}

	@Test
	void testRenameProject() {
		assertTrue(service.renameProject(org, "test"));
	}

//	@Test
//	void testGetJobsByService() throws Exception {
//		List<ICIPJobs> expected = service.getJobsByService(cname, 0, 1, org);
//		assertEquals(expected, list);
//	}

	@Test
	void testFindByJobId() {
		assertEquals(service.findByJobId(jobId), job);
	}

	@Test
	void testFindByJobIdWithLog() throws IOException {
		assertEquals(service.findByJobIdWithLog(jobId, 0, 0, org, null), job);
	}

//	@Test
//	void testGetAllJobs() {
//		List<ICIPJobs> expected = service.getAllJobs(org, 0, 1);
//		assertEquals(expected, list);
//	}

//	@Test
//	void testCountByStreamingServiceAndOrganization() {
//		assertTrue(service.countByStreamingServiceAndOrganization(cname, org) == 1);
//	}

//	@Test
//	void testCountByOrganization() {
//		assertTrue(service.countByOrganization(org) == 1);
//	}

	@Test
	void testCopy() {
		assertTrue(service.copy(org, "test"));
	}

//	@Test
//	void testGetAllCommonJobs() {
//		List<Object> expected = service.getAllCommonJobs(org, 0, 1);
//		assertEquals(expected, commonList);
//	}

//	@Test
//	void testGetCommonJobsLen() {
//		assertTrue(service.getCommonJobsLen(org) == 1);
//	}

}
