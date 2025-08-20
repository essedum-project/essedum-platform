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

import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.icipwebeditor.model.ICIPPlugin;

// TODO: Auto-generated Javadoc
// 
/**
 * Spring Data JPA repository for the Plugin entity.
 */
/**
 * @author essedum
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
