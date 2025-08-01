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

package com.infosys.icets.iamp.usm.service.impl;


import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.domain.Users;
import com.infosys.icets.iamp.usm.domain.UsertoUser;
import com.infosys.icets.iamp.usm.dto.UserPartialDTO;
import com.infosys.icets.iamp.usm.dto.UserPartialHierarchyDTO;
import com.infosys.icets.iamp.usm.repository.UsmUsertoUserRepository;
import com.infosys.icets.iamp.usm.service.UsersService;
import com.infosys.icets.iamp.usm.service.UsmUsertoUserService;

import org.json.JSONArray;
import org.json.JSONObject;


// TODO: Auto-generated Javadoc
/**
 * Service Implementation for managing UsmRolePermissions.
 */
/**
* @author icets
*/
@Service
@Transactional
public class UsmUsertoUserServiceImpl implements UsmUsertoUserService{
	

    /** The log. */
    private final Logger log = LoggerFactory.getLogger(UsmUsertoUserServiceImpl.class);

    /** The usm role permissions repository. */
    private final UsmUsertoUserRepository usm_user_to_userRepository;
    
    @Autowired
   	private UsersService usersService;
   
    


    /**
     * Instantiates a new usm users  service impl.
     *
     * @param UsmRoletoRoleRepository the usm role to role repository
     */
    public UsmUsertoUserServiceImpl(UsmUsertoUserRepository usm_user_to_userRepository,UsersService usersService) {
        this.usm_user_to_userRepository = usm_user_to_userRepository;
        this.usersService = usersService;
    }

   /**
    * Save a usm_user_to_user.
    *
    * @param usm_user_to_user the entity to save
    * @return the persisted entity
    */
   @Override
   public UsertoUser save(UsertoUser usm_user_to_user) {
       log.debug("Request to save usm_user_to_user : {}", usm_user_to_user);
       return usm_user_to_userRepository.save(usm_user_to_user);
   }

   /**
    *  Get all the UsertoUser.
    *
    *  @param pageable the pagination information
    *  @return the list of entities
    */
   @Override
   @Transactional(readOnly = true)
   public Page<UsertoUser> findAll(Pageable pageable) {
       log.debug("Request to get all User to User Mappings");
       return usm_user_to_userRepository.findAll(pageable);
   }

   /**
    *  Get one UsertoUser by id.
    *
    *  @param id the id of the entity
    *  @return the entity
    */
   @Override
   @Transactional(readOnly = true)
   public UsertoUser findOne(Integer id) {
       log.debug("Request to get UsertoUser : {}", id);
       UsertoUser content = null;
		Optional<UsertoUser> value = usm_user_to_userRepository.findById(id);
		if (value.isPresent()) {
			content = toDTO(value.get(), 1);
		}
		return content;        
   }

   /**
    *  Delete the  UsertoUser by id.
    *
    *  @param id the id of the entity
    */
   @Override
   public void delete(Integer id) {
       log.debug("Request to delete UsertoUser : {}", id);
       usm_user_to_userRepository.deleteById(id);
   }

    /**
     *  Get all the UsertoUser.
     *
     * @param req the req
     * @return the list of entities
     */
   @Override
   @Transactional(readOnly = true)
   public PageResponse<UsertoUser> getAll(PageRequestByExample<UsertoUser> req) {
       log.debug("Request to get all UsertoUser");
       Example<UsertoUser> example = null;
       UsertoUser usm_user_to_user = req.getExample();

       if (usm_user_to_user != null) {
           ExampleMatcher matcher = ExampleMatcher.matching();

           example = Example.of(usm_user_to_user, matcher);
       }

       Page<UsertoUser> page;
       if (example != null) {
           page =  usm_user_to_userRepository.findAll(example, req.toPageable());
       } else {
           page =  usm_user_to_userRepository.findAll(req.toPageable());
       }

       return new PageResponse<>(page.getTotalPages(), page.getTotalElements(), page.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
   }

   /**
    * To DTO.
    *
    * @param UsertoUser the usm user UsertoUser
    * @return the usm user UsertoUser
    */
   public UsertoUser toDTO(UsertoUser usm_user_to_user) {
       return toDTO(usm_user_to_user, 1);
   }

   /**
    * Converts the passed UsertoUser to a DTO. The depth is used to control the
    * amount of association you want. It also prevents potential infinite serialization cycles.
    *
    * @param UsertoUser the UsertoUser
    * @param depth the depth of the serialization. A depth equals to 0, means no x-to-one association will be serialized.
    *              A depth equals to 1 means that xToOne associations will be serialized. 2 means, xToOne associations of
    *              xToOne associations will be serialized, etc.
    * @return the usm  UsertoUser
    */
   public UsertoUser toDTO(UsertoUser usm_user_to_user, int depth) {
       if (usm_user_to_user == null) {
           return null;
       }

       UsertoUser dto = new UsertoUser();

           dto.setId(usm_user_to_user.getId());
           
           
//        if (depth-- > 0) {
      	 dto.setParentUserId(usersService.toDTO(usm_user_to_user.getParentUserId(), depth));
      	 dto.setChildUserId(usersService.toDTO(usm_user_to_user.getChildUserId(), depth));
//       }
       return dto;
   }



	/**
	 * Save list.
	 *
	 * @param UsertoUser the UsertoUser
	 * @return the list
	 * @throws SQLException the SQL exception
	 */
	@Override
	public List<UsertoUser> saveList(List<UsertoUser> user_to_user) throws SQLException {
		log.debug("Request to save UsertoUser : {}", user_to_user);
		List<UsertoUser> usmUsertoUserMappingList = new ArrayList<UsertoUser>();	
		usmUsertoUserMappingList = usm_user_to_userRepository.saveAll(user_to_user);
		log.debug("content size : {}", usmUsertoUserMappingList.size());
		
		return usmUsertoUserMappingList;
	}
	
	@Override
	public List<Users> findAllChildrenOfUserById(Users userval){
		log.debug("Request to get All child users under userid : {}", userval);
		return usm_user_to_userRepository.findAllChildrenOfUserById(userval);

	}
	
	@Override
	public List<UserPartialHierarchyDTO> findHierarchyByUser(Integer id,Integer mhLevel,Integer rhLevel) {
		return usm_user_to_userRepository.findHierarchyByUser(id,(-1*mhLevel)+1,rhLevel-2);
	}
	
	@Override
	public JSONArray fetchHierarchy(Integer id,Integer mhLevel,Integer rhLevel){
		List<UserPartialHierarchyDTO> users = findHierarchyByUser(id,mhLevel,rhLevel);
		JSONObject userObj = new JSONObject();
		if(users.size() > 0) {
			JSONArray finList = nestChildren(users,users.get(0).getmanagerEmail());
			UserPartialHierarchyDTO user = users.get(0);
			userObj.put("type", "user");
			userObj.put("expanded", true);
			userObj.put("email", user.getmanagerEmail());
			userObj.put("id", user.getManagerID());
			userObj.put("name", user.getmanagerFirstName());
			userObj.put("lname",(user.getmanagerLastName() == null)?"":user.getmanagerLastName());
			userObj.put("children", finList);
		}
		return new JSONArray().put(userObj);
	}
	
	public JSONArray nestChildren(List<UserPartialHierarchyDTO> users,String managerEmail) {
		Map<String,UserPartialHierarchyDTO> userMap = users.stream().collect(Collectors.toMap(user -> {return user.getreporteeEmail();},u->u,(u,v)->u));
		return nestedChildrenHelper(users,userMap,new HashMap<>(),managerEmail);
	}
	private JSONArray nestedChildrenHelper(List<UserPartialHierarchyDTO> users,
			Map<String, UserPartialHierarchyDTO> userMap, Map<String,JSONArray> memo, String managerEmail) {
		if(memo.containsKey(managerEmail)) {
			return memo.get(managerEmail);
		}
		JSONArray result = new JSONArray();
		users.stream()
		.filter(user->user.getmanagerEmail().equals(managerEmail))
		.forEach(user->{
			JSONArray children = nestedChildrenHelper(users,userMap,memo,user.getreporteeEmail());
			JSONObject userObj = new JSONObject();
			userObj.put("type", "user");
			userObj.put("expanded", true);
			userObj.put("email", user.getreporteeEmail());
			userObj.put("name", user.getreporteeFirstName());
			userObj.put("lname",(user.getreporteeLastName() == null)?"":user.getreporteeLastName());
			userObj.put("children", children);
			userObj.put("id", user.getReporteeID());
			result.put(userObj);
		});
		memo.put(managerEmail, result);
		return result;
	}
	
	@Override
	public  List<UserPartialDTO> fetchAllocatedUsers(Integer projectID){
		return usm_user_to_userRepository.fetchAllocatedUsers(projectID);	
	}
	
	@Override
	public  List<UserPartialDTO> fetchunallocatedUsers(Integer projectID){
		return usm_user_to_userRepository.fetchUnallocatedUsers(projectID); 
	}
	
	public  JSONArray fetchUsersByProject(Integer projectID,Integer roleId) throws Exception{
		try{
			List<UserPartialDTO> users =  usm_user_to_userRepository.fetchUsersByProject(projectID,roleId) ;
			//List<UserPartialDTO> users =  usm_user_to_userRepository.fetchUnallocatedUsers(projectID) ;
			
			JSONArray usersList = new JSONArray();
			if(users.size() > 0) {
				users.forEach(a -> {
					String userid = a.getId();
					String userEmail = a.getUserEmail();
					String userFname = a.getUserFName();
					usersList.put(new JSONObject().put("userFName", a.getUserFName()).put("userId", a.getId()).put("userEmail", a.getUserEmail()));
				});
			}
			
			return usersList;
		}catch(Exception e) {
			throw new Exception(e.getMessage()); 
		}
	}
}