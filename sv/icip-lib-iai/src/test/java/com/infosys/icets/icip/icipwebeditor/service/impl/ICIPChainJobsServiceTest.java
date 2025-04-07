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
import com.infosys.icets.icip.icipwebeditor.job.model.ICIPChainJobs;
import com.infosys.icets.icip.icipwebeditor.jobmodel.service.ICIPChainJobsService;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPChainJobsRepository;

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
