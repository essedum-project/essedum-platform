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
import com.infosys.icets.iamp.usm.domain.Users;
import com.infosys.icets.iamp.usm.domain.UsertoUser;
import com.infosys.icets.iamp.usm.dto.UserPartialDTO;
import com.infosys.icets.iamp.usm.dto.UserPartialHierarchyDTO;

import org.json.JSONArray;

// TODO: Auto-generated Javadoc
/**
 * Service Interface for managing user_to_user.
 */
/**
* @author icets
*/
public interface UsmUsertoUserService {

   /**
    * Save a user_to_user.
    *
    * @param user_to_user the entity to save
    * @return the persisted entity
    */
	UsertoUser save(UsertoUser user_to_user);

   /**
    *  Get all the user_to_user.
    *
    *  @param pageable the pagination information
    *  @return the list of entities
    */
   Page<UsertoUser> findAll(Pageable pageable);

   /**
    *  Get the "id" user_to_user.
    *
    *  @param id the id of the entity
    *  @return the entity
    */
   UsertoUser findOne(Integer id);

   /**
    *  Delete the "id" user_to_user.
    *
    *  @param id the id of the entity
    */
   void delete(Integer id);


   /**
    *  Get all the user_to_user with search.
    *
    * @param req the req
    * @return the list of entities
    */
   PageResponse<UsertoUser> getAll(PageRequestByExample<UsertoUser> req);

   /**
    * To DTO.
    *
    * @param user_to_user the usm role
    * @param depth the depth
    * @return the usm role permissions
    */
   public UsertoUser toDTO(UsertoUser user_to_user, int depth);



	/**
	 * Save list.
	 *
	 * @param user_to_user the role
	 * @return the list
	 * @throws SQLException the SQL exception
	 */
	List<UsertoUser> saveList(List<UsertoUser> user_to_user) throws SQLException;

	public List<Users> findAllChildrenOfUserById(Users userval);
	
	public List<UserPartialHierarchyDTO> findHierarchyByUser(Integer id,Integer mhLevel,Integer rhLevel);

	public  JSONArray fetchHierarchy(Integer id,Integer mhLevel,Integer rhLevel);

	public List<UserPartialDTO> fetchAllocatedUsers(Integer projectID);

	public List<UserPartialDTO> fetchunallocatedUsers(Integer projectID);
    
}
