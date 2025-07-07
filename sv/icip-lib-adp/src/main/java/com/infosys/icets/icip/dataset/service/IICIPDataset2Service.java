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
package com.infosys.icets.icip.dataset.service;

import java.util.List;

import com.infosys.icets.icip.dataset.model.ICIPDataset2;
import com.infosys.icets.icip.dataset.model.dto.ICIPDatasourceSummary;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface IICIPDataset2Service.
 *
 * @author icets
 */
public interface IICIPDataset2Service {

	/**
	 * Gets the datasets by org and datasource.
	 *
	 * @param organization the organization
	 * @param datasource the datasource
	 * @return the datasets by org and datasource
	 */
	List<ICIPDataset2> getDatasetsByOrgAndDatasource(String organization, String datasource);

	/**
	 * Gets the datasets len by org and datasource and search.
	 *
	 * @param organization the organization
	 * @param datasource the datasource
	 * @param search the search
	 * @return the datasets len by org and datasource and search
	 */
	Long getDatasetsLenByOrgAndDatasourceAndSearch(String organization, String datasource, String search);

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
	List<ICIPDataset2> getDatasetsByOrgAndType(String organization, String type, String search, int page, int size);

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
	List<ICIPDataset2> getPaginatedDatasetsByOrgAndDatasource(String org, String datasource, String search, int page,
			int size);
	
	/**
	 * Gets the datasets by org and schema.
	 *
	 * @param organization the organization
	 * @param schema the schema
	 * @return the datasets by org and schema
	 */
	List<ICIPDataset2> getDatasetsByOrgAndSchema(String organization, String schema);
	

	/**
     * @param schemaName
     * @return list of ICIPDatasourceSummary
     */  
	
	List<ICIPDatasourceSummary> getNavigationDetailsBySchemaNameAndOrganization(String nodeName,String org);
	
	List<ICIPDataset2> getDatasetsByDatasetAliasAndAdapterNameAndOrganization(String dsetAlias, String adapterName, String org );
}
