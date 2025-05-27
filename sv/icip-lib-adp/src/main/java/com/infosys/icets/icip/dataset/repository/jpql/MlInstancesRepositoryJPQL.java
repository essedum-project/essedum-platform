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
package com.infosys.icets.icip.dataset.repository.jpql;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.icip.dataset.model.MlInstance;
import com.infosys.icets.icip.dataset.repository.MlInstancesRepository;

@Repository
public interface MlInstancesRepositoryJPQL extends MlInstancesRepository {

	/* JPQL Queries */
	@Query("SELECT mlins FROM MlInstance mlins where LOWER(mlins.name) = LOWER(?1) and mlins.organization=?2")
	MlInstance getMlInstanceByNameAndOrganization(String name, String org);

	@Query("SELECT mlins FROM MlInstance mlins where mlins.organization=?1 ORDER BY mlins.lastmodifiedon DESC")
	List<MlInstance> getMlInstanceByOrganization(String org);

	@Query("SELECT count(*) FROM MlInstance mlins " +
		       "WHERE mlins.organization = :organization AND " +
		       "(:adapterNames IS NULL OR mlins.adaptername IN :adapterNames) AND " +
		       "(:connections IS NULL OR mlins.connectionname IN :connections) AND " +
		       "(:name IS NULL OR LOWER(mlins.name) LIKE LOWER(CONCAT('%', :name, '%')))")
	Long getMlInstanceCountByOptionalParams(
			@Param("organization") String organization,
	        @Param("adapterNames") List<String> adapterNames, 
	        @Param("connections") List<String> connections, 
	        @Param("name") String name);
			
	@Query("SELECT mlins FROM MlInstance mlins " +
		       "WHERE mlins.organization = :organization AND " +
		       "(:adapterNames IS NULL OR mlins.adaptername IN :adapterNames) AND " +
		       "(:connections IS NULL OR mlins.connectionname IN :connections) AND " +
		       "(:name IS NULL OR LOWER(mlins.name) LIKE LOWER(CONCAT('%', :name, '%'))) ORDER BY mlins.lastmodifiedon DESC")
	Page<MlInstance> getMlInstanceByOptionalParams(
	    @Param("organization") String organization,
        @Param("adapterNames") List<String> adapterNames, 
        @Param("connections") List<String> connections, 
        @Param("name") String name, 
        Pageable pageable);
	
	@Query("SELECT mlins.name FROM MlInstance mlins where mlins.adaptername = ?1 and mlins.organization=?2")
	List<String> getMlInstanceByAdapterNameAndOrganization(String adapterName, String org);
	
	@Query("SELECT mlins.name FROM MlInstance mlins where mlins.organization=?1")
	List<String> getMlInstanceNamesByOrganization(String org);

	@Query("SELECT mlins FROM MlInstance mlins WHERE LOWER(mlins.spectemplatedomainname) = LOWER(?1) AND mlins.organization = ?2 AND mlins.orderpriority = ?3")
	List<MlInstance> getMlInstanceBySpectemplatedomainnameAndOrganizationAndOrderPriority(String spectemplatedomainname,
			String org, Integer orderpriority);

	@Query("SELECT mlins FROM MlInstance mlins WHERE mlins.spectemplatedomainname = ?1 AND mlins.organization = ?2")
	List<MlInstance> getMlInstanceBySpecTemDomNameAndOrg(String spectemplatedomainname, String org);
	

}
