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

package com.lfn.icip.icipwebeditor.repository;

import java.util.List;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;

import com.lfn.icip.icipwebeditor.model.ICIPPluginDetails;

//TODO: Auto-generated Javadoc
//
/**
* Spring Data JPA repository for the Plugin entity.
*/
/**
* @author essedum
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
