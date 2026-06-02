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

package com.lfn.iamp.usm.repository;

import java.sql.SQLException;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;

import com.lfn.iamp.usm.domain.UserProjectRole;
import com.lfn.iamp.usm.domain.Users;


// TODO: Auto-generated Javadoc
/**
 * Spring Data JPA repository for the UserProjectRole entity.
 */
/**
* @author essedum	
*/
@SuppressWarnings("unused")
//@Repository("usmUserProjectRoleRepository")
@NoRepositoryBean
public interface UserProjectRoleRepository extends JpaRepository<UserProjectRole,Integer> {
	
	/** The Constant MAPPEDROLES. */
	public static final String MAPPEDROLES = "SELECT role_id FROM usm_user_project_role WHERE user_id = :userid";
	
	/**
	 * Find by project id id.
	 *
	 * @param id the id
	 * @return the list
	 * @throws SQLException the SQL exception
	 */
//	@Query(value = "SELECT * from usm_user_project_role WHERE project_id = ?1 ", nativeQuery = true)
	public List<UserProjectRole> findByProjectIdId(Integer id) throws SQLException;
	
	/**
	 * Find by portfolio id id.
	 *
	 * @param id the id
	 * @return the list
	 * @throws SQLException the SQL exception
	 */
	public List<UserProjectRole> findByPortfolioIdId(Integer id) throws SQLException;
	
	/**
	 * Find by user id user login.
	 *
	 * @param uName the u name
	 * @return the list
	 */
//	@Query(value = "SELECT u.* from usm_user_project_role u inner join usm_users t on u.user_id=t.id WHERE t.user_login = :uName", nativeQuery = true)
	public List<UserProjectRole> findByUserIdUserLogin(String uName);
	
/**
 * Find by user id.
 *
 * @param userId the user id
 * @return the list
 */
//	@EntityGraph(attributePaths = {"project_id"})
//	@Query(value = "SELECT u.* from usm_user_project_role u inner join usm_users t on u.user_id=t.id WHERE u.user_id=?1", nativeQuery = true)
    public List<UserProjectRole> findByUserId(Integer userId);
	
	/**
	 * Gets the mapped roles.
	 *
	 * @param userid the userid
	 * @return the mapped roles
	 */
//	@Query(value = MAPPEDROLES, nativeQuery = true)
	public List<Integer> getMappedRoles( @Param("userid") Integer userid);
	
	/**
	 * Gets the mapped roles for user loing and project id
	 *
	 * @param userName the user name
	 * @return the mapped roles
	 */
	
	@Query(value="SELECT upr.role_id FROM Users u JOIN UserProjectRole upr ON u.id = upr.user_id.id WHERE u.user_login =?1 AND upr.project_id.id =?2")
	public List<Integer> getMappedRolesForUserLoginAndProject(String userName,Integer projectId);
	

	//@Query(value = "SELECT upr1 FROM UserProjectRole AS upr1 WHERE upr1.project_id.id = :id")
	public List<UserProjectRole> findByProjectId(@Param("project_id")Integer id);

	//@Query(value = "SELECT upr2 FROM UserProjectRole AS upr2 WHERE upr2.portfolio_id.id = :id")
	public List<UserProjectRole> findByPortfolioId(Integer id);

	//@Query(value = "SELECT upr3 FROM UserProjectRole AS upr3 WHERE upr3.role_id.id = :id")
	public List<UserProjectRole> findByRoleId(@Param("role_id")Integer id);
	
	List<UserProjectRole> getUsersWithPermission(@Param("projectId") int projectId, @Param("portfolio_id") int portfolioId, @Param("permission") String permission);
	
	@Query(value="SELECT u.id , u.user_f_name, u.user_login FROM Users u JOIN UserProjectRole upr ON u.id = upr.user_id.id WHERE upr.role_id.id =?1 AND upr.project_id.id =?2")
	List<Object[]> getUsersByRoleId(Integer roleId, Integer projectId);
	
	/**
	 * check is any role is present for user
	 *
	 * @param user the project User
	 * @param projectId the project id
	 * @param roleId the role id
	 * @return the boolean
	 */
	
	public Integer isRoleExistsByUserAndProjectIdAndRoleId(String user, Integer projectId, Integer roleId);
	
	
	/**
	 * Find roleId .
	 *
	 * @param user the project User
	 * @param projectId the project id
	 * @param roleId the role id
	 * @return the boolean
	 */
	
	public Integer getRoleIdByUserAndProjectIdAndRoleName(String user, Integer projectId, String roleName);

	
	@Query(value="SELECT role_id FROM usm_user_project_role WHERE user_id = :userid", nativeQuery = true)
	public List<Integer> getMappedRolesForUserId( @Param("userid") Integer userid);
	
	public void deleteByUserRoleId(Integer userId, Integer autoUserProject);

}
