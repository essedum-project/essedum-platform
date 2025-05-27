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

import com.infosys.icets.icip.dataset.model.MlAdapters;
import com.infosys.icets.icip.dataset.repository.MlAdaptersRepository;

@Repository
public interface MlAdaptersRepositoryJPQL extends MlAdaptersRepository {

	/* JPQL Queries */
	@Query("SELECT mladp FROM MlAdapters mladp where LOWER(mladp.name) = LOWER(?1) and mladp.organization=?2 and mladp.isactive='Y'")
	List<MlAdapters> getMlAdapteByNameAndOrganization(String name, String org);

	@Query("SELECT mladp FROM MlAdapters mladp where mladp.organization=?1 and mladp.isactive='Y' ORDER BY mladp.lastmodifiedon DESC")
	List<MlAdapters> getMlAdaptesByOrganization(String org);

	@Query("SELECT mladp FROM MlAdapters mladp where mladp.spectemplatedomainname=?1 and mladp.organization=?2 and mladp.isactive='Y'")
	List<MlAdapters> getMlAdaptersBySpecTemplateDomainNameAndOrg(String spectemplatedomainname,String org);
	
	@Query("SELECT mladp.name FROM MlAdapters mladp where mladp.organization=?1 and mladp.isactive='Y'")
	List<String> getAdapterNamesByOrganization(String org);

	@Query("SELECT count(*) FROM MlAdapters mladp WHERE " +
		       "mladp.isactive = 'Y' AND " +
		       "mladp.organization = :organization AND " +
		       "(:categories IS NULL OR mladp.category IN :categories) AND " +
		       "(:domains IS NULL OR mladp.spectemplatedomainname IN :domains) AND " +
		       "(:connections IS NULL OR mladp.connectionname IN :connections) AND " +
		       "(:name IS NULL OR LOWER(mladp.name) LIKE LOWER(CONCAT('%', :name, '%')))")
	Long getAdaptersCountByOptionalParams(
		    @Param("organization") String organization,
		    @Param("categories") List<String> categories,
		    @Param("domains") List<String> domains,
		    @Param("connections") List<String> connections,
		    @Param("name") String name
		);
	
	
	@Query("SELECT new com.infosys.icets.icip.dataset.model.MlAdapters(" +
		       "mladp.id, mladp.name, mladp.organization, mladp.connectionid, mladp.connectionname, " +
		       "mladp.spectemplatedomainname, mladp.createdby, mladp.createdon, mladp.lastmodifiedby, mladp.lastmodifiedon, " +
		       "null, mladp.description, mladp.isactive, mladp.category, mladp.executiontype, mladp.isChain, mladp.chainName) " +
		       "FROM MlAdapters mladp " +
		       "WHERE mladp.isactive = 'Y' AND " +
		       "mladp.organization = :organization AND " +
		       "(:categories IS NULL OR mladp.category IN :categories) AND " +
		       "(:domains IS NULL OR mladp.spectemplatedomainname IN :domains) AND " +
		       "(:connections IS NULL OR mladp.connectionname IN :connections) AND " +
		       "(:name IS NULL OR LOWER(mladp.name) LIKE LOWER(CONCAT('%', :name, '%'))) ORDER BY mladp.lastmodifiedon DESC")
		Page<MlAdapters> getAdaptersByOptionalParams(
		    @Param("organization") String organization,
		    @Param("categories") List<String> categories,
		    @Param("domains") List<String> domains,
		    @Param("connections") List<String> connections,
		    @Param("name") String name,
		    Pageable page
		);



}
