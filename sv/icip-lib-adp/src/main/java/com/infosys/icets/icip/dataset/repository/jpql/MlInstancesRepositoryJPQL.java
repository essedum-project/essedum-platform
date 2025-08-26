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
