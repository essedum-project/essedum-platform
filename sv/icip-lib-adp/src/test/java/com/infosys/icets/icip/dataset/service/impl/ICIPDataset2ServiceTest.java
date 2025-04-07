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
package com.infosys.icets.icip.dataset.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.function.Function;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.infosys.icets.icip.dataset.model.ICIPDataset2;
import com.infosys.icets.icip.dataset.repository.ICIPDatasetRepository2;

public class ICIPDataset2ServiceTest {
	
	@InjectMocks
	ICIPDataset2Service iCIPDataset2Service;
	
	@Mock
	ICIPDatasetRepository2 datasetRepository2;
	
	String organization;
	String datasource;
	ICIPDataset2 dtst;
	List<ICIPDataset2> datasets;
	//Page<ICIPDataset2> value;
	String search;
	String type;
	int page;
	int size;
	@BeforeAll
	void setUp() throws Exception {
		MockitoAnnotations.initMocks(this);
		organization="Acme";
		datasource="test";
		search="te";
		type="mysql";
		page=1;
		size=1;		
		dtst = new ICIPDataset2();
		dtst.setDatasource(datasource);
		dtst.setOrganization(organization);
		dtst.setName(search);
		ExampleMatcher matcher = ExampleMatcher.matching().withMatcher("name",
				match -> match.ignoreCase().contains());
		Example<ICIPDataset2> example = Example.of(dtst, matcher);
		datasets = new ArrayList<ICIPDataset2>();
		datasets.add(dtst);
		Mockito.when(datasetRepository2.findByOrganizationAndDatasource(organization, datasource)).thenReturn(datasets);
		Mockito.when(datasetRepository2.countByOrganizationAndDatasource(organization, datasource)).thenReturn((long)1);		
		Mockito.when(datasetRepository2.count(example)).thenReturn((long)1);	
//		Mockito.when(datasetRepository2.findByOrganizationAndDatasetType(organization, type, PageRequest.of(page, size))).thenReturn(datasets);
		Mockito.when(datasetRepository2.findByOrganizationAndDatasource(organization, datasource, PageRequest.of(page, size))).thenReturn(datasets);
		Page<ICIPDataset2> rolePage = new PageImpl<>(Collections.singletonList(dtst));	
		Mockito.when(datasetRepository2.findAll(example, PageRequest.of(page, size))).thenReturn(rolePage);
	}
	
	@Test
	void getDatasetsByOrgAndDatasource() {	
		assertEquals(iCIPDataset2Service.getDatasetsByOrgAndDatasource(organization, datasource), datasets);
	}
	
	@Test
	void getDatasetsLenByOrgAndDatasourceAnd() {	
		assertEquals((long)iCIPDataset2Service.getDatasetsLenByOrgAndDatasourceAndSearch(organization, datasource,null), (long)1);
	}
	@Test
	void getDatasetsLenByOrgAndDatasourceAndSearch() {	
		assertEquals((long)iCIPDataset2Service.getDatasetsLenByOrgAndDatasourceAndSearch(organization, datasource,search), (long)1);
	}
	
	@Test
	void getDatasetsByOrgAndType() {	
		assertEquals(iCIPDataset2Service.getDatasetsByOrgAndType(organization, type,null,page,size),datasets);
	}
	
	@Test
	void getPaginatedDatasetsByOrgAndDatasource() {	
		assertEquals(iCIPDataset2Service.getPaginatedDatasetsByOrgAndDatasource(organization, datasource,null,page,size),datasets);
	}
	@Test
	void getDatasetsByOrgAndTypeSearch() {	
		assertEquals(iCIPDataset2Service.getDatasetsByOrgAndType(organization, type,search,page,size),datasets);
	}

	@Test
	public void testGetPaginatedDatasetsByOrgAndDatasource() throws Exception {
		assertEquals(iCIPDataset2Service.getPaginatedDatasetsByOrgAndDatasource(organization, datasource,search,page,size),datasets);
	}
}
