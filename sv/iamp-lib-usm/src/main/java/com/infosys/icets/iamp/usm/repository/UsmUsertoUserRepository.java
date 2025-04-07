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
