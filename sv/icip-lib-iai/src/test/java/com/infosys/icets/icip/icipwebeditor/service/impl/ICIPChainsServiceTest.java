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

import java.util.List;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

import com.infosys.icets.icip.icipwebeditor.job.model.ICIPChains;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPChainsRepository;


class ICIPChainsServiceTest {

	@InjectMocks
	ICIPChainsService service;

	@Mock
	ICIPChainsRepository repository;

	static ICIPChains chain;
	static String cname;
	static String org;

	List<ICIPChains> listByOrg;
	Long count;

	@BeforeAll
	static void setUpBeforeAll() throws Exception {
		cname = "TestChain";
		org = "Acme";
		chain = new ICIPChains();
		chain.setId(1);
		chain.setJobName(cname);
		chain.setOrganization(org);
	}

	@BeforeAll
	void setUp() throws Exception {
		MockitoAnnotations.initMocks(this);
		Mockito.when(repository.save(chain)).thenReturn(chain);
	}

	@Test
	void testSave() {
		assertEquals(service.save(chain).getJobName(), cname);
	}

	@Test
	void testGetAllJobs() {
		Mockito.when(repository.findByOrganization(org)).thenReturn(listByOrg);
		assertEquals(service.getAllJobs(org,null), listByOrg);
	}

	@Test
	void testCountByOrganization() {
		Mockito.when(repository.countByOrganization(org)).thenReturn(count);
		assertEquals(service.countByOrganization(org), count);
	}

	@Test
	void testRenameProject() {
		assertTrue(service.renameProject(org, "test"));
	}

	@Test
	void testFindByName() {
		Mockito.when(repository.findByJobName(cname)).thenReturn(chain);
		assertEquals(service.findByName(cname), chain);
	}

	@Test
	void testFindByNameAndOrganization() {
		Mockito.when(repository.findByJobNameAndOrganization(cname, org)).thenReturn(chain);
		assertEquals(service.findByNameAndOrganization(cname, org), chain);
	}

	@Test
	void testCopy() {
		assertTrue(service.copy(null, org, "test"));
	}

}
