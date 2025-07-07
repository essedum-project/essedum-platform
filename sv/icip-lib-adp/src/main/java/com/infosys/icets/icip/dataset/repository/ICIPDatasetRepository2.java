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
