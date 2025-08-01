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

package com.infosys.icets.icip.icipwebeditor.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;

import com.infosys.icets.icip.icipwebeditor.model.ICIPApps;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface ICIPAppsRepository.
 *
 * @author icets
 */
@SuppressWarnings("unused")
@NoRepositoryBean
public interface ICIPAppsRepository extends JpaRepository<ICIPApps, Integer> {
	

	@Query(value="select * from mlapps where name = ?1 AND organization=?2", nativeQuery = true)
	ICIPApps getByNameAndOrganization(String name, String org);
	
	@Query(value="select * from mlapps where organization=?1", nativeQuery = true)
	List<ICIPApps> getAppsByOrganization(String org);
	

	@Query(value="DELETE FROM mlapps WHERE name=:name AND organization=:org", nativeQuery = true)
	public void deleteByNameAndOrg(@Param("name")String name,@Param("org")String org);

	@Query(value="select distinct scope from mlapps", nativeQuery = true)
	List<String> getAppsType();

	List<ICIPApps> findByOrganization(String organization, Pageable page);

	ICIPApps findByIdAndType(Integer id, String string);
	
	
	ICIPApps customSave(ICIPApps app);

	void deleteApp(ICIPApps app);
	
	Optional<ICIPApps> findByJobName(String pipelineName);
	


	

}
