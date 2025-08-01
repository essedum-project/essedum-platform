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

import com.infosys.icets.iamp.usm.domain.Users;
import com.infosys.icets.iamp.usm.domain.UsertoUser;
import com.infosys.icets.iamp.usm.dto.UserPartialDTO;
import com.infosys.icets.iamp.usm.dto.UserPartialHierarchyDTO;

// TODO: Auto-generated Javadoc
/**
 */
/**
* @author icets
*/
@SuppressWarnings("unused")
@NoRepositoryBean
public interface UsmUsertoUserRepository extends JpaRepository<UsertoUser,Integer> {

	@Query(value = "SELECT u.childUserId FROM UsertoUser u WHERE u.parentUserId= :userval")
	List<Users> findAllChildrenOfUserById(@Param("userval") Users user);
	
	List<UserPartialHierarchyDTO> findHierarchyByUser(@Param("Usersid") Integer Usersid,@Param("managerHierarchyLevel") Integer managerHierarchyLevel,@Param("ReporteeHierarchyLevel") Integer ReporteeHierarchyLevel);
	
	List<UserPartialDTO> fetchAllocatedUsers(@Param("projectID") Integer projectID);
	
	List<UserPartialDTO> fetchUnallocatedUsers(@Param("projectID") Integer projectID);
	
	List<UserPartialDTO> fetchUsersByProject(@Param("projectID") Integer projectID,@Param("roleid") Integer roleID);
}
