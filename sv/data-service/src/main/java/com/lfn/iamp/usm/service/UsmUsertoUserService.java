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

import com.lfn.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.lfn.ai.comm.lib.util.service.dto.support.PageResponse;
import com.lfn.iamp.usm.domain.Users;
import com.lfn.iamp.usm.domain.UsertoUser;
import com.lfn.iamp.usm.dto.UserPartialDTO;
import com.lfn.iamp.usm.dto.UserPartialHierarchyDTO;

import org.json.JSONArray;

// TODO: Auto-generated Javadoc
/**
 * Service Interface for managing user_to_user.
 */
/**
* @author essedum
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
