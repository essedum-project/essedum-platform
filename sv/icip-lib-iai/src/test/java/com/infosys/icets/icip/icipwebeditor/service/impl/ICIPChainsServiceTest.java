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
