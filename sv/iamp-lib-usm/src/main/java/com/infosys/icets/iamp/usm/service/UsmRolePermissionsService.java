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
package com.infosys.icets.iamp.usm.service;


import java.sql.SQLException;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mapping.PropertyReferenceException;

import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.domain.UsmRolePermissions;

// TODO: Auto-generated Javadoc
/**
 * Service Interface for managing UsmRolePermissions.
 */
/**
* @author icets
*/
public interface UsmRolePermissionsService {

   /**
    * Save a usm_role_permissions.
    *
    * @param usm_role_permissions the entity to save
    * @return the persisted entity
    */
   UsmRolePermissions save(UsmRolePermissions usm_role_permissions);

   /**
    *  Get all the usm_role_permissionss.
    *
    *  @param pageable the pagination information
    *  @return the list of entities
    */
   Page<UsmRolePermissions> findAll(Pageable pageable);

   /**
    *  Get the "id" usm_role_permissions.
    *
    *  @param id the id of the entity
    *  @return the entity
    */
   UsmRolePermissions findOne(Integer id);

   /**
    *  Delete the "id" usm_role_permissions.
    *
    *  @param id the id of the entity
    */
   void delete(Integer id);


   /**
    *  Get all the usm_role_permissionss with search.
    *
    * @param req the req
    * @return the list of entities
    */
   PageResponse<UsmRolePermissions> getAll(PageRequestByExample<UsmRolePermissions> req);

   /**
    * To DTO.
    *
    * @param usm_role_permissions the usm role permissions
    * @param depth the depth
    * @return the usm role permissions
    */
   public UsmRolePermissions toDTO(UsmRolePermissions usm_role_permissions, int depth);

	/**
 * Gets the permission by role and module.
 *
 * @param role the role
 * @param module the module
 * @return the permission by role and module
 */
List<UsmRolePermissions> getPermissionByRoleAndModule( Integer role, String module);

	/**
	 * Save list.
	 *
	 * @param role_permissions the role permissions
	 * @return the list
	 * @throws SQLException the SQL exception
	 */
	List<UsmRolePermissions> saveList(List<UsmRolePermissions> role_permissions) throws SQLException;
	
	/**
	 * GET UsmRolePermissions PageResponse
	 * @param pageNumber
	 * @param pageSize
	 * @param SortBy 
	 * @param OrderBy
	 * @return PageResponse Of UsmRolePermissions
	 * @throws PropertyReferenceExceptionrows SQLException the SQL exception
	 */
	PageResponse<UsmRolePermissions> getAll(int page, int size, String sortBy, String orderBy) throws PropertyReferenceException;
    
	
	/**
	 * GET UsmRolePermissions Searched PageResponse
	 * @param ModuleName 
	 * @param permissionName
	 * @param pageNumber
	 * @param pageSize
	 * @param SortBy 
	 * @param OrderBy
	 * @return Searched PageResponse Of UsmRolePermissions
	 * @throws PropertyReferenceException
	 */ 
	PageResponse<UsmRolePermissions> findAllUsmRolePermissionsByModuleAndPermission(String module,String permission,int page, int size, String sortBy, String orderBy) throws PropertyReferenceException;
	
	
	/**
	 * GET UsmRolePermissions Searched PageResponse
	 *
	 * @param ModuleName 
	 * @param permissionName
	 * @param roleName
	 * @param pageNumber
	 * @param pageSize
	 * @param SortBy 
	 * @param OrderBy
	 * @return Searched PageResponse Of UsmRolePermissions
	 * @throws PropertyReferenceException 
	 */
	PageResponse<UsmRolePermissions> findAllUsmRolePermissionsByModuleAndPermissionAndRole(String module, String permission,
			String role, int page, int size, String sortBy, String orderBy) throws PropertyReferenceException;
	
	/**
	 * GET UsmRolePermissions Searched PageResponse
	 *
	 * @param ModuleName 
	 * @param pageNumber
	 * @param pageSize
	 * @param SortBy 
	 * @param OrderBy
	 * @return Searched PageResponse Of UsmRolePermissions
	 * @throws PropertyReferenceException 
	 */
	PageResponse<UsmRolePermissions> findAllUsmRolePermissionsByModule(String module, int page, int size, String sortBy, String orderBy) throws PropertyReferenceException;
	
	/**
	 * GET UsmRolePermissions Searched PageResponse
	 * 
	 * @param permissionName
	 * @param pageNumber
	 * @param pageSize
	 * @param SortBy 
	 * @param OrderBy
	 * @return Searched PageResponse Of UsmRolePermissions
	 * @throws PropertyReferenceException 
	 */
	PageResponse<UsmRolePermissions> findAllUsmRolePermissionsByPermission(String permission,int page, int size, String sortBy, String orderBy) throws PropertyReferenceException;
}
