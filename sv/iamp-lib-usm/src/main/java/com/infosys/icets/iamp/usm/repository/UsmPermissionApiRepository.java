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