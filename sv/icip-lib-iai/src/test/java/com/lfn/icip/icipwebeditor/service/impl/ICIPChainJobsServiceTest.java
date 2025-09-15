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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

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

import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.icip.icipwebeditor.job.enums.JobStatus;
import com.lfn.icip.icipwebeditor.job.model.ICIPChainJobs;
import com.lfn.icip.icipwebeditor.jobmodel.service.ICIPChainJobsService;
import com.lfn.icip.icipwebeditor.repository.ICIPChainJobsRepository;

class ICIPChainJobsServiceTest {

	@InjectMocks
	ICIPChainJobsService service;

	@Mock
	ICIPChainJobsRepository repository;

	List<ICIPChainJobs> listByOrg;
	List<ICIPChainJobs> listByName;
	List<ICIPChainJobs> listByNameOrg;
	Long countByName;
	Long countByNameOrg;

	static ICIPChainJobs chainJob;
	static String jobId;
	static Pageable pageable;
	static String cname;
	static String org;
	static int page;
	static int size;

	@BeforeAll
	static void setUpBeforeAll() throws Exception {
		jobId = ICIPUtils.removeSpecialCharacter(UUID.randomUUID().toString());
		cname = "TestChainJob";
		org = "Acme";
		page = 0;
		size = 1;
		pageable = PageRequest.of(page, size);
		chainJob = new ICIPChainJobs();
		chainJob.setId(1);
		chainJob.setJobId(jobId);
		chainJob.setJobName(cname);
		chainJob.setJobStatus(JobStatus.COMPLETED.toString());
		chainJob.setLog("Test Log");
		chainJob.setOrganization(org);
		chainJob.setSubmittedBy("testadmin");
		chainJob.setSubmittedOn(new Timestamp(System.currentTimeMillis()));
	}

	@BeforeAll
	void setUp() throws Exception {
		MockitoAnnotations.initMocks(this);
		Mockito.when(repository.save(chainJob)).thenReturn(chainJob);
		Mockito.when(repository.findByJobId(jobId)).thenReturn(chainJob);
		Mockito.when(repository.countByJobName(cname)).thenReturn(countByName);
		Mockito.when(repository.countByJobNameAndOrganization(cname, org)).thenReturn(countByNameOrg);
	}

	@Test
	void testSave() {
		assertEquals(service.save(chainJob).getJobId(), jobId);
	}

	@Test
	void testFindByJobId() {
		assertEquals(service.findByJobId(jobId), chainJob);
	}

	@Test
	void testFindByOrg() {
		assertEquals(service.findByOrg(org, page, size), listByOrg);
	}

	@Test
	void testFindByJobName() {
		assertEquals(service.findByJobName(cname), listByName);
	}

	@Test
	void testFindByJobNameAndOrganization() {
		assertEquals(service.findByJobNameAndOrganization(cname, org), listByNameOrg);
	}

	@Test
	void testCountByName() {
		assertTrue(service.countByName(cname) == countByName);
	}

	@Test
	void testCountByNameAndOrganization() {
		assertTrue(service.countByNameAndOrganization(cname, org) == countByNameOrg);
	}

	@Test
	void testCopy() {
		assertTrue(service.copy(org, "test"));
	}

}
