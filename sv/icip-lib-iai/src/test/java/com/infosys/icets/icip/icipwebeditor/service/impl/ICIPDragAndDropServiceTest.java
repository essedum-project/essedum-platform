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

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

import com.infosys.icets.icip.icipwebeditor.model.ICIPDragAndDrop;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPDragAndDropRepository;


class ICIPDragAndDropServiceTest {

	@InjectMocks
	ICIPDragAndDropService service;

	@Mock
	ICIPDragAndDropRepository repository;

	ICIPDragAndDrop file;
	String cname;
	String org;
	String filename;

	@BeforeAll
	void setUp() throws Exception {
		cname = "TestBinary";
		org = "Acme";
		filename = "test.txt";
		MockitoAnnotations.initMocks(this);
		file = new ICIPDragAndDrop();
		file.setCname(cname);
		file.setFilename(filename);
		file.setOrganization(org);
		Mockito.when(repository.save(file)).thenReturn(file);
		Mockito.when(repository.findByCnameAndOrganizationAndFilename(cname, org, filename)).thenReturn(file);
	}

	@Test
	void testSave() {
		assertEquals(service.save(file).getCname(), cname);
	}

	@Test
	void testFindByNameAndOrgAndFile() {
		assertEquals(service.findByNameAndOrgAndFile(cname, org, filename), file);
	}

	@Test
	void testUpdateFile() {
		assertEquals(service.updateFile(cname, org, filename, null), file);
	}

}
