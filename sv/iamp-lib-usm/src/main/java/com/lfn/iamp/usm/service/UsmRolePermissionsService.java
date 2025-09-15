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

package com.lfn.iamp.usm.service;


import java.sql.SQLException;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mapping.PropertyReferenceException;

import com.lfn.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.lfn.ai.comm.lib.util.service.dto.support.PageResponse;
import com.lfn.iamp.usm.domain.UsmRolePermissions;

// TODO: Auto-generated Javadoc
/**
 * Service Interface for managing UsmRolePermissions.
 */
/**
* @author essedum
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
