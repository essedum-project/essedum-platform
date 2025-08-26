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

package com.lfn.iamp.usm.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.lfn.iamp.usm.domain.DashConstant;
import com.lfn.iamp.usm.domain.DashConstant2;



/**
 * Spring Data JPA repository for the DashConstant entity.
 */
/**
 * @author essedum
 */
@SuppressWarnings("unused")
@Repository
public interface DashConstantRepository extends JpaRepository<DashConstant, Integer> {

	@Query(value = "SELECT c from DashConstant c WHERE c.project_id.id=?1")
	public List<DashConstant> findByProjectId(Integer id);

	@Query(value = "SELECT c from DashConstant c WHERE c.project_id.id = ?1 OR (c.keys like '%default' AND c.project_name= 'Core')")
	public List<DashConstant> findAllDashConstants(Integer projectId, String likeDefault);


	@Query(value = "SELECT c from DashConstant c WHERE c.keys = ?1 AND c.project_name=?2")
	public DashConstant findByKeys(String key, String project);

	@Query(value = "SELECT c.value from DashConstant c WHERE c.keys like CONCAT(?1,'%') AND c.project_name=?2")
	public List<String> findByKeyArrays(String key, String project);
	
	@Query(value = "SELECT c from DashConstant c WHERE (c.portfolio_id.id = ?2 OR c.project_name = ?1) AND (c.keys like '%Side' OR c.keys like '%SideConfigurations')")
	public List<DashConstant> findAllDashConstantsSides(String project, Integer portfolioId, String likeside);

	
	@Query(value = "SELECT c from DashConstant c WHERE c.keys like CONCAT( ?1 ,'%') AND c.project_name= ?2 ")
	public List<DashConstant> findAllDashConstantsbyItemAndProject(String item, String project_name);
		
	
	@Query(value = "SELECT c from DashConstant c WHERE c.keys = ?1 AND (c.project_id.id = ?2 or c.project_name= 'Core')" )
	public List<DashConstant> findExtensionKey(String key,Integer projectId);
	@Query(value = "SELECT c from DashConstant c WHERE c.keys in ?1 AND c.project_name= ?2 ")
	public List<DashConstant> findAllDashConstantsForProcess(List<String> constants, String project_name);
	
	@Transactional
	@Modifying
	@Query(value = "UPDATE usm_constant SET item_value  = :id WHERE item = :autoUserProjectKey",nativeQuery = true)
	public int updateAutoUserProject(@Param("id") Integer id, @Param("autoUserProjectKey") String autoUserProject);

}