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

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.infosys.icets.icip.dataset.model.ICIPDataset2;
import com.infosys.icets.icip.dataset.model.dto.ICIPDatasourceSummary;
import com.infosys.icets.icip.dataset.repository.ICIPDatasetRepository2;
import com.infosys.icets.icip.dataset.service.IICIPDataset2Service;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPDataset2Service.
 *
 * @author icets
 */
@Service
public class ICIPDataset2Service implements IICIPDataset2Service {

	/** The dataset repository 2. */
	@Autowired
	private ICIPDatasetRepository2 datasetRepository2;

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPDataset2Service.class);

	/**
	 * Gets the datasets by org and datasource.
	 *
	 * @param organization the organization
	 * @param datasource the datasource
	 * @return the datasets by org and datasource
	 */
	@Override
	public List<ICIPDataset2> getDatasetsByOrgAndDatasource(String organization, String datasource) {
		logger.debug("getting datasets by org : {} and datasource  : {}", organization, datasource);
		return datasetRepository2.findByOrganizationAndDatasource(organization, datasource);
	}

	/**
	 * Gets the datasets len by org and datasource and search.
	 *
	 * @param organization the organization
	 * @param datasource the datasource
	 * @param search the search
	 * @return the datasets len by org and datasource and search
	 */
	@Override
	public Long getDatasetsLenByOrgAndDatasourceAndSearch(String organization, String datasource, String search) {
		logger.debug("getting datasets length by org : {} and datasource  : {}", organization, datasource);
		if (search == null || search.trim().isEmpty()) {
			return datasetRepository2.countByOrganizationAndDatasource(organization, datasource);
		} else {
			ICIPDataset2 ds = new ICIPDataset2();
			ds.setDatasource(datasource);
			ds.setOrganization(organization);
			ds.setAlias(search);
	        Long count = datasetRepository2.countByAlias(search,datasource,organization);
			return count;
		}
	}

	/**
	 * Gets the datasets by org and type.
	 *
	 * @param organization the organization
	 * @param type the type
	 * @param search the search
	 * @param page the page
	 * @param size the size
	 * @return the datasets by org and type
	 */
	@Override
	public List<ICIPDataset2> getDatasetsByOrgAndType(String organization, String type, String search, int page,
			int size) {
		logger.debug("getting datasets by org : {} and type  : {}", organization, type);
//		if (search == null || search.trim().isEmpty()) {
//			return datasetRepository2.findByOrganizationAndDatasetType(organization, type, PageRequest.of(page, size));
//		} else {
			ICIPDataset2 ds = new ICIPDataset2();
			ds.setOrganization(organization);
			ds.setAlias(search);
			ExampleMatcher matcher = ExampleMatcher.matching().withMatcher("alias",
					match -> match.ignoreCase().contains());
			Example<ICIPDataset2> example = Example.of(ds, matcher);
			List<ICIPDataset2> datasets = datasetRepository2.findAll(example, PageRequest.of(page, size)).toList();
			return datasets;
//		}
	}

	/**
	 * Gets the paginated datasets by org and datasource.
	 *
	 * @param org the org
	 * @param datasource the datasource
	 * @param search the search
	 * @param page the page
	 * @param size the size
	 * @return the paginated datasets by org and datasource
	 */
	@Override
	public List<ICIPDataset2> getPaginatedDatasetsByOrgAndDatasource(String org, String datasource, String search,
			int page, int size) {
		if (search == null || search.trim().isEmpty()) {
			return datasetRepository2.findByOrganizationAndDatasource(org, datasource, PageRequest.of(page, size));
		} else {
			ICIPDataset2 ds = new ICIPDataset2();
			ds.setDatasource(datasource);
			ds.setOrganization(org);
			ds.setAlias(search);
			List<ICIPDataset2> datasets = datasetRepository2.findAllDatasets(org,datasource,search, PageRequest.of(page, size));
			return datasets;
		}
	}
	
	/**
	 * Gets the datasets by org and schema.
	 *
	 * @param organization the organization
	 * @param schema the schema
	 * @return the datasets by org and schema
	 */
	@Override
	public List<ICIPDataset2> getDatasetsByOrgAndSchema(String organization, String schema) {
		logger.debug("getting datasets by org : {} and schema  : {}", organization, schema);
		return datasetRepository2.findByOrganizationAndSchema(organization, schema);

	}
	
	/**
	 * Gets the datasetsummary by org and schema.
	 *
	 * @param organization the organization
	 * @param schema the schema
	 * @return the datasetsummary by org and schema
	 */
	@Override
	public List<ICIPDatasourceSummary> getNavigationDetailsBySchemaNameAndOrganization(String schema,String org){
		logger.info("Inside getNavigationDetailsBySchemaNameAndOrganization");
		return datasetRepository2.getNavigationDetailsBySchemaNameAndOrganization(org,schema);
	}

	@Override
	public List<ICIPDataset2> getDatasetsByDatasetAliasAndAdapterNameAndOrganization(String dsetAlias, String adapterName, String org ){
		return datasetRepository2.getDatasetsByDatasetAliasAndAdapterNameAndOrganization(dsetAlias, adapterName, org );
	}
}
