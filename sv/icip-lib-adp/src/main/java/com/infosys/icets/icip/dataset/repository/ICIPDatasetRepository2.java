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

package com.infosys.icets.icip.dataset.repository;
 
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;

import com.infosys.icets.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.infosys.icets.icip.dataset.model.ICIPDataset;
import com.infosys.icets.icip.dataset.model.ICIPDataset2;
import com.infosys.icets.icip.dataset.model.ICIPMlIntstance;
import com.infosys.icets.icip.dataset.model.dto.ICIPDatasourceSummary;

// TODO: Auto-generated Javadoc
// 
/**
 * Spring Data JPA repository for the ICIPDataset entity.
 */
/**
 * @author icets
 */
@NoRepositoryBean
public interface ICIPDatasetRepository2 extends JpaRepository<ICIPDataset2, Integer> {

	/**
	 * Find by organization and datasource.
	 *
	 * @param organization the organization
	 * @param datasource   the datasource
	 * @param pageable     the pageable
	 * @return the list
	 */
	List<ICIPDataset2> findByOrganizationAndDatasource(String organization, String datasource, Pageable pageable);

	/**
	 * Find dataset by name and organization.
	 *
	 * @param name the name
	 * @param org the org
	 * @return the ICIP dataset 2
	 */
	ICIPDataset2 findDatasetByNameAndOrganization(String name, String org);
	
	/**
	 * Find by id.
	 *
	 * @param id the id
	 * @return the optional
	 */
	Optional<ICIPDataset2> findById(Integer id);

	/**
	 * Find by organization and datasource.
	 *
	 * @param organization the organization
	 * @param datasource   the datasource
	 * @return the list
	 */
	List<ICIPDataset2> findByOrganizationAndDatasource(String organization, String datasource);

	/**
	 * Count by organization and datasource.
	 *
	 * @param organization the organization
	 * @param datasource   the datasource
	 * @return the long
	 */
	Long countByOrganizationAndDatasource(String organization, String datasource);
	
	/**
	 * Find by organization and schema.
	 *
	 * @param organization the organization
	 * @param schema         the schema
	 * @return the list
	 */
	List<ICIPDataset2> findByOrganizationAndSchema(String organization, String schema);

	/**
	 * Gets the names by org and datasource alias.
	 *
	 * @param org the org
	 * @param datasource the datasource
	 * @return the names by org and datasource alias
	 */
	List<NameAndAliasDTO> getNamesByOrgAndDatasourceAlias(String org, String datasource);

	ICIPDataset2 save(ICIPDataset iCIPDataset);
		
	Long countByAlias(String search, String datasource, String org);

	List<ICIPDataset2> findAllDatasets(String org, String datasource, String search, Pageable pageable);

	/**
	 * Find by organization and dataset type.
	 *
	 * @param organization the organization
	 * @param type         the type
	 * @param pageable     the pageable
	 * @return the list
	 */
//	List<ICIPDataset2> findByOrganizationAndDatasetType(String organization, String type, Pageable pageable);
	
	List<ICIPDatasourceSummary> getNavigationDetailsBySchemaNameAndOrganization(String org,String schema);

	List<ICIPDataset2> getDatasetsByDatasetAliasAndAdapterNameAndOrganization(String dsetAlias, String adapterName,
			String org);
	
	List<ICIPDataset2> getDatasetsByAdapterNameAndOrganization(String adapterName,
			String org);

	List<ICIPDataset2> findDataset(String org, String name, String dsetalias);	
	
	List<NameAndAliasDTO> getDatasetBasicDetailsByOrg(String org);

	List<String> listIndexNames(String org);
	
	ICIPDataset2 getDatasetByOrgAndAlias2(String datasetName, String org);
}
