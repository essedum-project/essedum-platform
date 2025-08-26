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

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

import com.lfn.icip.icipwebeditor.model.ICIPDragAndDrop;
import com.lfn.icip.icipwebeditor.repository.ICIPDragAndDropRepository;


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
