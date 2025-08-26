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

package com.infosys.icets.iamp.usm.service;


import java.sql.SQLException;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.domain.Role;
import com.infosys.icets.iamp.usm.domain.RoletoRole;

// TODO: Auto-generated Javadoc
/**
 * Service Interface for managing UsmRolePermissions.
 */
/**
* @author icets
*/
public interface UsmRoletoRoleService {

   /**
    * Save a role_to_role.
    *
    * @param role_to_role the entity to save
    * @return the persisted entity
    */
	RoletoRole save(RoletoRole role_to_role);

   /**
    *  Get all the role_to_role.
    *
    *  @param pageable the pagination information
    *  @return the list of entities
    */
   Page<RoletoRole> findAll(Pageable pageable);

   /**
    *  Get the "id" role_to_role.
    *
    *  @param id the id of the entity
    *  @return the entity
    */
   RoletoRole findOne(Integer id);

   /**
    *  Delete the "id" role_to_role.
    *
    *  @param id the id of the entity
    */
   void delete(Integer id);


   /**
    *  Get all the role_to_role with search.
    *
    * @param req the req
    * @return the list of entities
    */
   PageResponse<RoletoRole> getAll(PageRequestByExample<RoletoRole> req);

   /**
    * To DTO.
    *
    * @param role_to_role the usm role
    * @param depth the depth
    * @return the usm role permissions
    */
   public RoletoRole toDTO(RoletoRole role_to_role, int depth);



	/**
	 * Save list.
	 *
	 * @param role_to_role the role
	 * @return the list
	 * @throws SQLException the SQL exception
	 */
	List<RoletoRole> saveList(List<RoletoRole> role_to_role) throws SQLException;
	
	List<RoletoRole> getChildRoles(Role role) throws SQLException;
    
}
