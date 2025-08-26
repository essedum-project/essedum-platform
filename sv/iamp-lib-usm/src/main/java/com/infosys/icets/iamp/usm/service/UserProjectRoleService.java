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
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.infosys.icets.iamp.usm.domain.UsmAuthToken;
import com.infosys.icets.iamp.usm.dto.UsersDTO;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.domain.UsmAuthToken;
import com.infosys.icets.iamp.usm.domain.Project;
import com.infosys.icets.iamp.usm.domain.Role;
import com.infosys.icets.iamp.usm.domain.UserProjectRole;
import com.infosys.icets.iamp.usm.domain.UserProjectRoleSummary;
import com.infosys.icets.iamp.usm.domain.Users;

// TODO: Auto-generated Javadoc
/**
 * Service Interface for managing UserProjectRole.
 */
/**
* @author icets
*/
public interface UserProjectRoleService {

    /**
     * Save a user_project_role.
     *
     * @param user_project_role the entity to save
     * @return the persisted entity
     * @throws SQLException the SQL exception
     */
    UserProjectRole save(UserProjectRole user_project_role) throws SQLException;

    /**
     *  Get all the user_project_roles.
     *
     * @param pageable the pagination information
     * @return the list of entities
     * @throws SQLException the SQL exception
     */
    Page<UserProjectRole> findAll(Pageable pageable) throws SQLException;

    /**
     *  Get the "id" user_project_role.
     *
     * @param id the id of the entity
     * @return the entity
     * @throws SQLException the SQL exception
     */
    UserProjectRole findOne(Integer id) throws SQLException;

    /**
     *  Delete the "id" user_project_role.
     *
     * @param userProjectRole the id of the entity
     * @throws SQLException the SQL exception
     */
    void delete(UserProjectRole userProjectRole) throws SQLException;


    /**
     *  Get all the user_project_roles with search.
     *
     * @param req the req
     * @return the list of entities
     * @throws SQLException the SQL exception
     */
    PageResponse<UserProjectRole> getAll(PageRequestByExample<UserProjectRole> req) throws SQLException;
    
    /**
     * Gets the user project role summary.
     *
     * @param userlogin the userlogin
     * @return the user project role summary
     */
    public Optional<UserProjectRoleSummary> getUserProjectRoleSummary(String userlogin);

    /**
     * To DTO.
     *
     * @param userProjectRole the user project role
     * @param depth the depth
     * @return the user project role
     */
    public UserProjectRole toDTO(UserProjectRole userProjectRole, int depth);

   /**
    *  Get all the Project & Roles of a particular user searched by its userLogin.
    *
    * @param name the userLogin of the user
    * @return the map of projectId & list of associated roles of the user
    * @throws SQLException the SQL exception
    */
	Map<Integer, List<Role>> findByUserIdUserLogin(String name) throws SQLException;

	/**
	 * Creates the user with default mapping.
	 *
	 * @param user the user
	 * @return the user project role summary
	 * @throws SQLException the SQL exception
	 */
	UserProjectRoleSummary createUserWithDefaultMapping(Users user) throws SQLException;

	/**
	 * Creates the user with default mapping.
	 *
	 * @param userName the user name
	 * @return the user project role summary
	 */
	UserProjectRoleSummary createUserWithDefaultMapping(String userName);
	
	/**
	 * Gets the mapped roles.
	 *
	 * @param userName the user name
	 * @return the mapped roles
	 */
	List<Integer> getMappedRoles(String userName);
	
	
	/**
	 * Gets the mapped roles for user loing and project id
	 *
	 * @param userName the user name
	 * @return the mapped roles
	 */
	List<Integer> getMappedRolesForUserLoginAndProject(String userName,Integer projectId);
	
	
	 /**
 	 * Save a user_project_role List.
 	 *
 	 * @param user_project_role_list the user project role list
 	 * @return the persisted entity
 	 * @throws SQLException the SQL exception
 	 */
	 List<UserProjectRole> saveList(List<UserProjectRole> user_project_role_list)  throws SQLException;

	/**
	 * Register userwith default roles.
	 *
	 * @param users the users
	 * @return the user project role summary
	 * @throws SQLException the SQL exception
	 */
	UserProjectRoleSummary registerUserwithDefaultRoles(Users users) throws SQLException;

	/**
	 * Gets the paginated user project roles.
	 *
	 * @param prbe the prbe
	 * @param pageable the pageable
	 * @return the paginated user project roles
	 */
	PageResponse<UserProjectRole> getPaginatedUserProjectRoles(PageRequestByExample<UserProjectRole> prbe,
			Pageable pageable);

	/**
	 * Search.
	 *
	 * @param pageable the pageable
	 * @param prbe the prbe
	 * @return the page response
	 */
	PageResponse<UserProjectRole> search(Pageable pageable, PageRequestByExample<UserProjectRole> prbe);
	
	/**
	 * Gets the project list by user name.
	 *
	 * @param user_name the user name
	 * @return the project list by user name
	 */
	List<Project> getProjectListByUserName(String user_name);
	
	/**
	 * Gets the dataset approvers.
	 *
	 * @param projectId the project id
	 * @param portfolioId the portfolio id
	 * @return the dataset approvers
	 */
	List<UserProjectRole> getUsersWithPermission(Integer projectId, Integer portfolioId, String permission);
	
	List<Map<String,?>> getUsersByRoleId(Integer roleId, Integer projectId) throws SQLException;

	UserProjectRole getUserProjectRole(Integer id);

	public void addInvalidToken(UsmAuthToken token);

	public Boolean isInvalidToken(String token);

	public void deleteExpiredToken();
	
	
	/**
	 * check is any role is present for user
	 *
	 * @param user the project User
	 * @param projectId the project id
	 * @param roleId the role id
	 * @return the boolean
	 */
	public Boolean isRoleExistsByUserAndProjectIdAndRoleId(String user,Integer projectId, Integer roleId);
	
	
	/**
	 * Find roleId for user.
	 *
	 * @param user the project User
	 * @param projectId the project id
	 * @param roleId the role id
	 * @return the boolean
	 */
	public Integer getRoleIdByUserAndProjectIdAndRoleName(String user,Integer projectId, String roleName);

	List<Integer> getMappedRolesForUserLogin(String userName) throws SQLException;

	public void deleteByUserRoleId(UsersDTO usersDTO);
}
