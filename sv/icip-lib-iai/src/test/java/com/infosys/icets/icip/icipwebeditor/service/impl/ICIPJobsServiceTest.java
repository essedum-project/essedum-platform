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
