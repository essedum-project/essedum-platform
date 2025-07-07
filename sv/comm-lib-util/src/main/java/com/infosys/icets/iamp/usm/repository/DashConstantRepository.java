/**
 * @ 2023 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.iamp.usm.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.icets.iamp.usm.domain.DashConstant;
import com.infosys.icets.iamp.usm.domain.DashConstant2;



/**
 * Spring Data JPA repository for the DashConstant entity.
 */
/**
 * @author icets
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