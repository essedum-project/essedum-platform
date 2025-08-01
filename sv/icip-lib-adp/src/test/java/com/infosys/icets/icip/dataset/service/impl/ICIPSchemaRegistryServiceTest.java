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

package com.infosys.icets.icip.dataset.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.slf4j.Marker;

import com.infosys.icets.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.infosys.icets.icip.dataset.model.ICIPSchemaRegistry;
import com.infosys.icets.icip.dataset.model.dto.ICIPSchemaRegistryDTO2;
import com.infosys.icets.icip.dataset.repository.ICIPSchemaRegistryRepository;

public class ICIPSchemaRegistryServiceTest {

	@InjectMocks
	ICIPSchemaRegistryService service;

	@Mock
	ICIPSchemaRegistryRepository schemaRegistryRepository;

	String name;
	String org;
	NameAndAliasDTO schema;
	ICIPSchemaRegistryDTO2 schema2;
	String groupName;
	int page;
	int size;
	ICIPSchemaRegistry schemaRegistry;
	List<ICIPSchemaRegistry> schemaRegistryList;
	List<NameAndAliasDTO> schemas;
	List<ICIPSchemaRegistryDTO2> schemas2;
	String search;

	@BeforeAll
	void setUp() throws Exception {
		MockitoAnnotations.initMocks(this);
		name = "schema";
		org = "Acme";
		schema = null;
		groupName = "test";
		search = "sc";
		page = 1;
		size = 1;
		schemaRegistry = new ICIPSchemaRegistry();
		schemaRegistry.setOrganization(org);
		schemaRegistryList = new ArrayList<>();
		schemaRegistryList.add(schemaRegistry);
		schemas = new ArrayList<>();
		schemas.add(schema);
//		Mockito.when(schemaRegistryRepository.getSchemaByNameAndOrg(name, org)).thenReturn(schemaRegistry);
		Mockito.when(schemaRegistryRepository.findByNameAndOrganization(name, org)).thenReturn(schemaRegistry);
		Mockito.when(schemaRegistryRepository.searchByName(name, org)).thenReturn(schemaRegistryList);
		Mockito.when(schemaRegistryRepository.save(schemaRegistry)).thenReturn(schemaRegistry);
		Mockito.when(schemaRegistryRepository.findAllByOrganization(org)).thenReturn(schemaRegistryList);
		Mockito.when(schemaRegistryRepository.getSchemasByOrg(org)).thenReturn(schemas);
//		Mockito.when(schemaRegistryRepository.findByOrganizationAndGroups(org, groupName, page * size, size))
//				.thenReturn(schemas);
//		Mockito.when(schemaRegistryRepository.findByOrganizationAndGroupsAndSearch(org, groupName, search, page * size,
//				size)).thenReturn(schemas);
		Mockito.when(schemaRegistryRepository.countByGroupAndOrganization(groupName, org)).thenReturn((long) 1);
		Mockito.when(schemaRegistryRepository.countByGroupAndOrganizationAndSearch(groupName, org, search))
				.thenReturn((long) 1);
		Mockito.when(schemaRegistryRepository.findByOrganization(org)).thenReturn(schemaRegistryList);

	}

	@Test
	void copy() {
		Marker marker = null;
		assertEquals(service.copy(marker, org, org), true);
	}

	@Test
	void renameProject() {
		assertEquals(service.renameProject(org, org), true);
	}

	@Test
	void getSchemaLenByGroupAndOrg() {
		assertEquals((long) service.getSchemaLenByGroupAndOrg(groupName, org, null), (long) 1);
	}

	@Test
	void getSchemaLenByGroupAndOrgSearch() {
		assertEquals((long) service.getSchemaLenByGroupAndOrg(groupName, org, search), (long) 1);
	}

	@Test
	void getSchemasByGroupAndOrg() {
		assertEquals(service.getSchemasByGroupAndOrg(org, groupName, null, page, size), schemas);
	}

	@Test
	void getSchemasByGroupAndOrgSearch() {
		assertEquals(service.getSchemasByGroupAndOrg(org, groupName, search, page, size), schemas);
	}

	@Test
	void fetchSchemaValue() {
		assertEquals(service.fetchSchemaValue(name, org), schema);
	}

	@Test
	void getSchema() {
		assertEquals(service.getSchema(name, org), schemaRegistry);
	}

	@Test
	void save() {
		assertEquals(service.save(name, org, schemaRegistry), schemaRegistry);
	}

	@Test
	void searchSchemas() {
		assertEquals(service.searchSchemas(name, org), schemaRegistryList);
	}

	@Test
	void fetchAllByOrg() {
		assertEquals(service.fetchAllByOrg(org), schemaRegistryList);
	}

	@Test
	void getSchemaNamesByOrg() {
		assertEquals(service.getSchemaNamesByOrg(org), schemas);
	}

}
