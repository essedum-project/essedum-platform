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

import java.sql.SQLException;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;

import com.infosys.icets.iamp.usm.domain.UserProjectRole;
import com.infosys.icets.iamp.usm.domain.Users;


// TODO: Auto-generated Javadoc
/**
 * Spring Data JPA repository for the UserProjectRole entity.
 */
/**
* @author icets	
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
