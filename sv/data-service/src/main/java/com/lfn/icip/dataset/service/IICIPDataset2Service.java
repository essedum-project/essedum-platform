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

package com.lfn.icip.dataset.service;

import java.util.List;

import com.lfn.icip.dataset.model.ICIPDataset2;
import com.lfn.icip.dataset.model.dto.ICIPDatasourceSummary;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface IICIPDataset2Service.
 *
 * @author essedum
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
