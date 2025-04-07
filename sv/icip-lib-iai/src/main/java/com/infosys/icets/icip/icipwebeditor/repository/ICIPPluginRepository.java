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
package com.infosys.icets.icip.icipwebeditor.repository;

import java.util.List;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;

import com.infosys.icets.icip.dataset.model.ICIPDataset;
import com.infosys.icets.icip.icipwebeditor.model.ICIPPlugin;

// TODO: Auto-generated Javadoc
// 
/**
 * Spring Data JPA repository for the Plugin entity.
 */
/**
 * @author icets
 */
@NoRepositoryBean
public interface ICIPPluginRepository extends JpaRepository<ICIPPlugin, Integer> {

	public List<ICIPPlugin> getByType(String type);
	
//	@Query(value="SELECT * FROM mlplugin WHERE type=:type", nativeQuery = true)
	public ICIPPlugin getByTypeAndOrg(String type, String org);
	
	@Modifying
	@Transactional
	@Query(value="DELETE FROM mlplugin WHERE name=:name AND org=:org", nativeQuery = true)
	public void deleteByNameAndOrg(@Param("name")String name,@Param("org") String org);

	@Query(value="SELECT config FROM mlplugin WHERE type=:type AND org=:org", nativeQuery = true)
	public String getConfigByTypeAndOrg(@Param("type") String type,@Param("org") String org);
	
	@Query(value="SELECT editortype FROM mlplugin WHERE type=:type AND org=:org", nativeQuery = true)
	public String getEditortypeByTypeAndOrg(@Param("type") String type,@Param("org") String org);

	public List<ICIPPlugin> findByOrg(String org);

	@Query(value="SELECT DISTINCT(org) FROM mlplugin", nativeQuery = true)
	public List<String> getAllType();

	public List<ICIPPlugin> getByTypeDistinct(String type);
	
	public ICIPPlugin findByNameAndOrg(String name, String org);
	
	@Query(value="SELECT type FROM mlplugin WHERE name=:name AND org=:org", nativeQuery = true)
	public String getByNameAndOrg(@Param("name") String name,@Param("org") String org);
	
	@Query(value="SELECT count(*) FROM mlplugin WHERE type=:type AND org=:org", nativeQuery = true)
	public int getCountByTypeAndOrg(@Param("type") String type, @Param("org") String org);
	
	@Query(value="SELECT count(*) FROM mlplugin WHERE name=:name AND org=:org", nativeQuery = true)
	public int getCountByNameAndOrg(@Param("name")String name, @Param("org") String org);

}
