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

package com.lfn.iamp.usm.repository.mssql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lfn.iamp.usm.dto.UserPartialDTO;
import com.lfn.iamp.usm.dto.UserPartialHierarchyDTO;
import com.lfn.iamp.usm.repository.UsmUsertoUserRepository;

@Profile("mssql")
@Repository
public interface UsmUsertoUserRepositoryMSSQL extends UsmUsertoUserRepository {
	
	@Query(value = "WITH manager_hierarchy(parent_user_id,child_user_id,LEVEL) AS (\r\n"
			+ "SELECT parent_user_id,child_user_id, 0 AS LEVEL FROM usm_user_mapping WHERE parent_user_id=:Usersid \r\n"
			+ "UNION ALL\r\n"
			+ "SELECT t1.parent_user_id,t1.child_user_id,m.level-1 FROM manager_hierarchy m INNER JOIN usm_user_mapping t1 ON m.parent_user_id=t1.child_user_id\r\n"
			+ "WHERE m.level >= :managerHierarchyLevel\r\n"
			+ "),\r\n"
			+ "reportee_hierarchy(parent_user_id,child_user_id,LEVEL) AS (\r\n"
			+ "SELECT parent_user_id,child_user_id, 0 AS LEVEL FROM usm_user_mapping WHERE parent_user_id=:Usersid\r\n"
			+ "UNION ALL\r\n"
			+ "SELECT t2.parent_user_id,t2.child_user_id,r.level+1 FROM reportee_hierarchy r INNER JOIN usm_user_mapping t2 ON r.child_user_id=t2.parent_user_id\r\n"
			+ "WHERE r.level <= :ReporteeHierarchyLevel\r\n"
			+ ")\r\n"
			+ "SELECT t3.id AS reporteeID, t2.id AS managerID, t2.user_f_name AS managerFirstName, t2.user_l_name AS managerLastName, t2.user_email AS managerEmail, \r\n"
			+ "t3.user_f_name AS reporteeFirstName, t3.user_l_name AS reporteeLastName, t3.user_email AS reporteeEmail,\r\n"
			+ "t1.level as level\r\n"
			+ " FROM \r\n"
			+ "(SELECT distinct * FROM manager_hierarchy UNION  SELECT distinct * FROM reportee_hierarchy) t1 \r\n"
			+ "INNER JOIN \r\n"
			+ "usm_users t2 ON t2.id=t1.parent_user_id\r\n"
			+ "INNER JOIN \r\n"
			+ "usm_users t3 ON t3.id=t1.child_user_id\r\n"
			+ "ORDER BY t1.LEVEL",nativeQuery = true)
	List<UserPartialHierarchyDTO> findHierarchyByUser(@Param("Usersid") Integer Usersid,@Param("managerHierarchyLevel") Integer managerHierarchyLevel,@Param("ReporteeHierarchyLevel") Integer ReporteeHierarchyLevel);
	
	@Query(value = "SELECT u.id AS id, u.user_email AS userEmail,u.user_l_name AS userLName,u.user_f_name AS userFName  FROM \r\n"
			+ "(\r\n"
			+ "SELECT \r\n"
			+ "*\r\n"
			+ "FROM usm_users  v\r\n"
			+ "\r\n"
			+ "WHERE v.id IN(SELECT parent_user_id FROM usm_user_mapping UNION SELECT child_user_id FROM usm_user_mapping)\r\n"
			+ ")\r\n"
			+ "u \r\n"
			+ "JOIN (SELECT DISTINCT user_id FROM usm_user_project_role WHERE project_id = :projectID) t2 ON u.id = t2.user_id  \r\n"
			+ " ",nativeQuery = true)
	List<UserPartialDTO> fetchAllocatedUsers(@Param("projectID") Integer projectID);
	
	@Query(value = "SELECT u.id AS id, u.user_email AS userEmail,u.user_l_name AS userLName,u.user_f_name AS userFName  FROM \r\n"
			+ "(\r\n"
			+ "SELECT \r\n"
			+ "*\r\n"
			+ "FROM usm_users  v\r\n"
			+ "\r\n"
			+ "WHERE v.id NOT IN(SELECT parent_user_id FROM usm_user_mapping UNION SELECT child_user_id FROM usm_user_mapping)\r\n"
			+ ")\r\n"
			+ "u \r\n"
			+ "JOIN (SELECT DISTINCT user_id FROM usm_user_project_role WHERE project_id = :projectID ) t2 ON u.id = t2.user_id  \r\n"
			+ " ",nativeQuery = true)
	List<UserPartialDTO> fetchUnallocatedUsers(@Param("projectID") Integer projectID);
	
	@Query(value = "SELECT usm_users.id AS id, usm_users.user_email AS userEmail,usm_users.user_l_name AS userLName,usm_users.user_f_name AS userFName FROM usm_users JOIN usm_user_project_role ON usm_users.id = usm_user_project_role.user_id WHERE usm_user_project_role.project_id = :projectID AND usm_user_project_role.role_id = :roleid",nativeQuery = true)
	List<UserPartialDTO> fetchUsersByProject(@Param("projectID") Integer projectID,@Param("roleid") Integer roleID);
}
