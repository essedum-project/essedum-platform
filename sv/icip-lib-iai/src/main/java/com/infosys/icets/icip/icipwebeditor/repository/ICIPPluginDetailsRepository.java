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

import com.infosys.icets.icip.icipwebeditor.model.ICIPPluginDetails;

//TODO: Auto-generated Javadoc
//
/**
* Spring Data JPA repository for the Plugin entity.
*/
/**
* @author icets
*/

public interface ICIPPluginDetailsRepository extends JpaRepository<ICIPPluginDetails, Integer>{

	//	to get all plugin node of a particular type
	public List<ICIPPluginDetails> getByTypeAndOrg(String type,String org);
	
	// to add new plugin node	
	public ICIPPluginDetails save(ICIPPluginDetails pluginNode);

	// to get pluginNode details for a particular pluginname	
	public ICIPPluginDetails getByPluginnameAndOrg(String pluginname,String org);
	
	public List<ICIPPluginDetails> getByType(String Type);

	public Long countByPluginname(String name);
	
	// to delete pluginNode from mlplugindetails
	@Modifying
	@Transactional
	@Query(value="DELETE FROM mlplugindetails WHERE pluginname=:plugname AND org=:org", nativeQuery = true)
	public void deleteByNameAndOrg(@Param("plugname") String name,@Param("org") String org);
	
	@Modifying
	@Transactional
	@Query(value="DELETE FROM mlplugindetails WHERE type=:type AND org=:org", nativeQuery = true)
	public void deleteAllByTypeAndOrg(@Param("type") String type,@Param("org") String org);

	@Query(value="SELECT count(*) FROM mlplugindetails WHERE type=:type", nativeQuery = true)
	public int fetchPluginCount(@Param("type") String type);
	
	public List<ICIPPluginDetails> getByOrg(String org);
}
