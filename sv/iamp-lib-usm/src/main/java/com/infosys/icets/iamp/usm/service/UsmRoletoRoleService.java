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
