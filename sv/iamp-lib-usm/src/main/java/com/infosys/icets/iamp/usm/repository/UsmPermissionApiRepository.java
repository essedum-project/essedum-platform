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

package com.infosys.icets.iamp.usm.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.iamp.usm.common.RoleMappedApiPermission;
import com.infosys.icets.iamp.usm.domain.UsmPermissionApi;
import com.infosys.icets.iamp.usm.domain.UsmPermissions;





@SuppressWarnings("unused")
@NoRepositoryBean
public interface UsmPermissionApiRepository extends JpaRepository<UsmPermissionApi,Integer>{


	@Query("SELECT u from UsmPermissionApi u where u.permissionId=:permission")
	List<UsmPermissionApi> getPermissionApiByPermissionId(@Param("permission") Integer permissionId);
	
	
//	@Query(value="DELETE FROM usm_permission_api WHERE permission_id =:id",nativeQuery=true)
	Long deleteByPermissionId(Integer id);
	
	/**
     *  Find's usm-permission-api by their https requestType and containing api's name  .
     *  @param Api ,Type
     *  @return the a list of UsmPermissionApi
     *   
     */
	public List<UsmPermissionApi> findByApiContainingAndTypeContainingIgnoreCase(String api,String type);
	/**
     *  Find's usm-permission-api by containing api's name  .
     *  @param Api 
     *  @return the a list of UsmPermissionApi  
     */
	public List<UsmPermissionApi> findByApiContainingIgnoreCase(String api);
	/**
     *  Find's usm-permission-api by their https requestType .
     *  @param Type
     *  @return the a list of UsmPermissionApi
     *   
     */
	public List<UsmPermissionApi> findByTypeContainingIgnoreCase(String type);
	

	public List<RoleMappedApiPermission> getRoleMappedApiList();
	
	public List<String> getWhiteListedApi();

}