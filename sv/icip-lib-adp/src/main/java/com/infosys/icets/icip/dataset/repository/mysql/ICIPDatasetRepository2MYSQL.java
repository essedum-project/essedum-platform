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

package com.infosys.icets.icip.dataset.repository.mysql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;

import com.infosys.icets.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.infosys.icets.icip.dataset.model.ICIPDataset;
import com.infosys.icets.icip.dataset.model.ICIPDataset2;
import com.infosys.icets.icip.dataset.model.dto.ICIPDatasourceSummary;
import com.infosys.icets.icip.dataset.repository.ICIPDatasetRepository2;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPDatasetRepository2MYSQL.
 */
@Profile("mysql")
@Repository
public interface ICIPDatasetRepository2MYSQL extends ICIPDatasetRepository2 {

	/**
	 * Find dataset by name and organization.
	 *
	 * @param name the name
	 * @param org the org
	 * @return the ICIP dataset 2
	 */
	@Query(value = "SELECT * FROM mldataset ss WHERE ss.organization = :org AND ss.name = :name", nativeQuery = true)
	ICIPDataset2 findDatasetByNameAndOrganization(@Param("name") String name, @Param("org") String org);
	
	@Query(value = "SELECT * FROM mldataset ss WHERE ss.organization = :org AND ss.alias = :datasetName",nativeQuery=true)
	ICIPDataset2 getDatasetByOrgAndAlias2(@Param("datasetName")String datasetName, @Param("org")String org);
	
	@Query(value = "SELECT COUNT(mldataset.id) from mldataset where organization = :org AND datasource = :datasource"
	+ " AND alias LIKE CONCAT('%',:search,'%')", nativeQuery = true)
	Long countByAlias(@Param("search") String search,@Param("datasource") String datasource, @Param("org") String org);
	
	@Query(value = "SELECT * from mldataset where organization = :org AND datasource = :datasource"
			+ " AND alias LIKE CONCAT('%',:search,'%')", nativeQuery = true)
	List<ICIPDataset2> findAllDatasets(@Param("org") String org, @Param("datasource") String datasource, @Param("search") String search,@Param("pageable") Pageable pageable);
	/**
	 * Gets the names by org and datasource alias.
	 *
	 * @param org the org
	 * @param alias the alias
	 * @return the names by org and datasource alias
	 */
	@Query(value = "SELECT * FROM mldataset WHERE ORGANIZATION = :org AND datasource IN (SELECT NAME FROM mldatasource WHERE ORGANIZATION = :org AND alias= :alias)", nativeQuery = true)
	List<NameAndAliasDTO> getNamesByOrgAndDatasourceAlias(@Param("org") String org, @Param("alias") String alias);
	
	/**
	 * Gets the datasetsummary by org and schema.
	 *
	 * @param organization the organization
	 * @param schema the schema
	 * @return the datasetsummary by org and schema
	 */
	
	@Query(value ="SELECT md.alias AS dataSetAlias,ms.alias AS dataSourceAlias,ms.type AS dataSoruceType ,md.name AS dataSetUniqueName,md.datasource AS dataSourceUniqueName,md.dataset_schema AS schemName FROM mldataset md,mldatasource ms WHERE md.dataset_schema=:schema AND md.ORGANIZATION=:org AND md.ORGANIZATION=ms.organization AND md.datasource=ms.name", nativeQuery = true)
	List<ICIPDatasourceSummary> getNavigationDetailsBySchemaNameAndOrganization(@Param("org") String org,@Param("schema") String schema);

	@Query("SELECT dst FROM ICIPDataset2 dst where LOWER(dst.alias) = LOWER(?1) and dst.adaptername = ?2 and dst.organization= ?3 and dst.isadapteractive='Y'")
	List<ICIPDataset2> getDatasetsByDatasetAliasAndAdapterNameAndOrganization(String dsetAlias, String adapterName,
			String org);
	
	@Query("SELECT dst FROM ICIPDataset2 dst where dst.adaptername = ?1 and dst.organization= ?2 and dst.isadapteractive='Y'")
	List<ICIPDataset2> getDatasetsByAdapterNameAndOrganization(String adapterName, String org);

	@Query(value = "SELECT * from mldataset where organization = :org AND datasource = :datasource"
			+ " AND alias = :dsetalias", nativeQuery = true)
	List<ICIPDataset2> findDataset(@Param("org") String org, @Param("datasource") String datasource, @Param("dsetalias") String dsetalias);

	@Query("SELECT dset FROM ICIPDataset2 dset where dset.organization=?1 and (dset.interfacetype is null or dset.interfacetype !='adapter')")
	List<NameAndAliasDTO> getDatasetBasicDetailsByOrg(String org);
	
	@Query("SELECT distinct dset.indexname FROM ICIPDataset2 dset where dset.indexname!=null and dset.organization=?1")
	List<String> listIndexNames(String org);

}
