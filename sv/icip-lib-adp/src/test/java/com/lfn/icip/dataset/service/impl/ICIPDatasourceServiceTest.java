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

package com.lfn.icip.dataset.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.slf4j.Marker;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.repository.ICIPDatasourceRepository;
import com.lfn.icip.dataset.util.DecryptPassword;

public class ICIPDatasourceServiceTest {

	@InjectMocks
	ICIPDatasourceService service;

	@Mock
	ICIPDatasourceRepository datasourceRepository;
	@Mock
	DecryptPassword DecryptPassword;

	Integer id;
	String name;
	String org;
	List<ICIPDatasource> datasources;
	ICIPDatasource dst;
	String type;
	String interfacetype;
	ICIPDatasource iCIPDatasource;
	String group;
	ExampleMatcher matcher;
	Example<ICIPDatasource> example;
	String search;
	int page;
	int size;

	@BeforeAll
	void setUp() throws Exception {
		MockitoAnnotations.initMocks(this);

		id = 10;
		name = "TWBSessResch";
		org = "Acme";
		group = "test";
		type = "mysql";
		search = "TWB";
		page = 1;
		size = 1;
		iCIPDatasource = new ICIPDatasource();
		iCIPDatasource.setId(id);
		iCIPDatasource.setName(name);
		iCIPDatasource.setOrganization(org);
		iCIPDatasource.setType("mysql");
		iCIPDatasource.setConnectionDetails(
				"{\"password\":\"encEVI9TwjOYy6Bc9+1d1RtVibeLGbAtwPfSvl6wBItow==\",\"datasource\":\"\",\"userName\":\"root\",\"url\":\"jdbc:mysql://cvictsecst1:3306/iamp_data_12_1\"}");
		iCIPDatasource.setDescription("Testing MySql Datasource ");
		iCIPDatasource
				.setSalt("4ERQlnuE5q6ALZwky4MqeRiBb+v+xhLaHF9kDZFiPTlmupffsxpyECvuvLHosdtLg0RjwYN9vh6a62xbVYKRVg==");
		;
		datasources = new ArrayList<ICIPDatasource>();
		datasources.add(iCIPDatasource);
		ICIPDatasource ds = new ICIPDatasource();
		ds.setType(type);
		ds.setOrganization(org);
		ds.setName(search);
		matcher = ExampleMatcher.matching().withMatcher("name", match -> match.ignoreCase().contains());
		example = Example.of(ds, matcher);

		Mockito.when(datasourceRepository.save(iCIPDatasource)).thenReturn(iCIPDatasource);
		// Mockito.when(datasourceRepository.findById(id)).thenReturn(datasource);
		Mockito.when(datasourceRepository.searchByName(name, org)).thenReturn(datasources);
		Mockito.when(datasourceRepository.findByNameAndOrganization(name, org)).thenReturn(iCIPDatasource);
		Mockito.when(datasourceRepository.getAllByOrganizationAndName(org, name)).thenReturn(datasources);
		Mockito.when(datasourceRepository.findByOrganizationAndGroups(org, group)).thenReturn(datasources);
		Mockito.when(datasourceRepository.findByOrganization(org)).thenReturn(datasources);
		Mockito.when(datasourceRepository.countByTypeAndOrganization(type, org)).thenReturn((long) 1);
		Mockito.when(datasourceRepository.count(example)).thenReturn((long) 1);
		Mockito.when(datasourceRepository.getDatasourceByNameSearch(name, org, type, PageRequest.of(page, size)))
				.thenReturn(datasources);
		Mockito.when(datasourceRepository.countByTypeAndNameAndOrganization(name, org, type)).thenReturn((long) 1);
	}

	/*
	 * @Test void testgetDatasource() {
	 * assertEquals(service.getDatasource(id).getId(), id); }
	 */

	@Test
	void testsearchDatasources() {
		assertEquals(service.searchDatasources(name, org).get(0).getName(), name);
	}

	@Test
	void testfindByNameAndOrganization() {
		assertEquals(service.getDatasource(name, org).getName(), name);
	}

	@Test
	void testsave() throws NoSuchAlgorithmException {
		assertEquals(service.save(name, iCIPDatasource).getName(), name);
	}

	@Test
	void testgetDatasourcesByOrgAndName() {
		assertEquals(service.getDatasourcesByOrgAndName(org, name).get(0).getName(), name);
	}

	@Test
	void testgetDatasourcesByGroupAndOrg() {
		assertEquals(service.getDatasourcesByGroupAndOrg(org, group).get(0).getName(), name);
	}

	@Test
	void testfindByOrganizationg() {
		assertEquals(service.findByOrganization(org).get(0).getName(), name);
	}

	@Test
	void testgetDatasourceCountByType() {
		assertEquals((long) service.getDatasourceCountByType(type, org, null), (long) 1);
	}

	@Test
	void testgetDatasourceCountByTypeSearch() {
		assertEquals((long) service.getDatasourceCountByType(type, org, search), (long) 1);
	}

	@Test
	void testgetDatasourceByNameSearch() {
		assertEquals(service.getDatasourceByNameSearch(name, org, type, page, size).get(0).getName(), name);
	}

	@Test
	void testgetDatasourceCountByNameAndType() {
		assertEquals((long) service.getDatasourceCountByNameAndType(name, type, org), (long) 1);
	}

	@Test
	public void testGetDatasourceInteger() throws Exception {
		Mockito.when(datasourceRepository.findById(id)).thenReturn(Optional.of(iCIPDatasource));
		assertEquals(service.getDatasource(id), iCIPDatasource);
	}

	@Test
	public void testGetDatasourceByType() throws Exception {
		Mockito.when(datasourceRepository.findByTypeAndOrganization(type, org)).thenReturn(datasources);
		assertEquals(service.getDatasourceByType(type, org), datasources);
	}

//	@Test
//	public void testGetPaginatedDatasourceByTypeAndSearch() throws Exception {
//		Mockito.when(datasourceRepository.findByTypeAndOrganization(type, org, PageRequest.of(page, size))).thenReturn(datasources);
//		assertEquals(service.getPaginatedDatasourceByTypeAndSearch(type,org,null,page,size),datasources);
//	}
//	
	@Test
	public void testGetPaginatedDatasourceByTypeAndSearch2() throws Exception {
		ICIPDatasource ds = new ICIPDatasource();
		ds.setType(type);
		ds.setOrganization(org);
		ds.setName(search);
		ds.setInterfacetype(interfacetype);
		ExampleMatcher matcher = ExampleMatcher.matching().withMatcher("name", match -> match.ignoreCase().contains());
		Example<ICIPDatasource> example = Example.of(ds, matcher);
		Page<ICIPDatasource> Pdatasources = new PageImpl<>(Collections.singletonList(iCIPDatasource));
		Mockito.when(datasourceRepository.findAll(example, PageRequest.of(page, size))).thenReturn(Pdatasources);
		assertEquals(service.getPaginatedDatasourceByTypeAndSearch(type, org,interfacetype, search, page, size), datasources);
	}

	@Test
	public void testDeleteStringString() throws Exception {
		Mockito.when(datasourceRepository.findByNameAndOrganization(name, org)).thenReturn(iCIPDatasource);
		service.delete(name, org);
	}

	@Test
	public void testRenameProject() throws Exception {
		Mockito.when(datasourceRepository.findByOrganization(org)).thenReturn(datasources);
		assertEquals(service.renameProject(org, org), true);
	}

	@Test
	public void testCopy() throws Exception {
		Mockito.when(datasourceRepository.findByOrganization(org)).thenReturn(datasources);
		Marker marker = null;
		assertEquals(service.copy(marker, org, org), true);
	}

	@Test
	public void testFindByOrganization() throws Exception {
		Mockito.when(datasourceRepository.findByOrganization(org)).thenReturn(datasources);
		assertEquals(service.findByOrganization(org), datasources);
	}

	@Test
	public void testGetDatasourceCountByType() throws Exception {
		Mockito.when(datasourceRepository.countByTypeAndOrganization(type, org)).thenReturn((long) 1);
		assertEquals((long) service.getDatasourceCountByType(type, org, null), (long) 1);
	}

	@Test
	public void testGetDatasourceCountByType2() throws Exception {
		ICIPDatasource ds = new ICIPDatasource();
		ds.setType(type);
		ds.setOrganization(org);
		ds.setName(search);
		ExampleMatcher matcher = ExampleMatcher.matching().withMatcher("name", match -> match.ignoreCase().contains());
		Example<ICIPDatasource> example = Example.of(ds, matcher);
		Mockito.when(datasourceRepository.count(example)).thenReturn((long) 1);
		assertEquals((long) service.getDatasourceCountByType(type, org, search), (long) 1);
	}

	@Test
	public void testDeleteString() throws Exception {
		service.delete(org);
	}
}
