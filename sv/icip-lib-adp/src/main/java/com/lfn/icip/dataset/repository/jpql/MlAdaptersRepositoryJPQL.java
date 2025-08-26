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

package com.lfn.icip.dataset.repository.jpql;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lfn.icip.dataset.model.MlAdapters;
import com.lfn.icip.dataset.repository.MlAdaptersRepository;

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
	
	
	@Query("SELECT new com.lfn.icip.dataset.model.MlAdapters(" +
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
