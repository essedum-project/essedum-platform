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
package com.infosys.icets.iamp.usm.repository.postgresql;

import java.sql.SQLException;
import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.iamp.usm.domain.UserProjectRole;
import com.infosys.icets.iamp.usm.repository.UserProjectRoleRepository;

@Profile("postgresql")
@Repository
public interface UserProjectRoleRepositoryPOSTGRESQL extends UserProjectRoleRepository {

	@Query(value="SELECT * from usm_user_project_role WHERE project_id = ?1" ,nativeQuery = true)
	public List<UserProjectRole> findByProjectIdId(Integer id) throws SQLException;
	
	@Query(value="SELECT * from usm_user_project_role WHERE portfolio_id = ?1" ,nativeQuery = true)
	public List<UserProjectRole> findByPortfolioIdId(Integer id) throws SQLException;

	@Query(value="SELECT u.* from usm_user_project_role u inner join usm_users t on u.user_id=t.id WHERE t.user_login = ?1",nativeQuery = true)
	public List<UserProjectRole> findByUserIdUserLogin(String uName);

	@Query(value="SELECT u.* from usm_user_project_role u inner join usm_users t on u.user_id=t.id WHERE u.user_id=?1" ,nativeQuery = true)
	public List<UserProjectRole> findByUserId(Integer userId);

	@Query(value="SELECT role_id FROM usm_user_project_role WHERE user_id = ?1", nativeQuery = true)
	public List<Integer> getMappedRoles(Integer userid);
	
	
	@Query(value="SELECT upr.role_id from usm_user_project_role upr inner join usm_users u on upr.user_id=u.id WHERE u.user_login=?1 and upr.project_id=?2" ,nativeQuery = true)
	public List<Integer> getMappedRolesForUserLoginAndProject(String userName,Integer projectId);
	
	@Query(value = "SELECT upr1 FROM UserProjectRole AS upr1 WHERE upr1.project_id.id = :id")
	public List<UserProjectRole> findByProjectId(@Param("id")Integer id);

	@Query(value = "SELECT upr2 FROM UserProjectRole AS upr2 WHERE upr2.portfolio_id.id = :id")
	public List<UserProjectRole> findByPortfolioId(@Param("id")Integer id);

	@Query(value = "SELECT upr3 FROM UserProjectRole AS upr3 WHERE upr3.role_id.id = :id")
	public List<UserProjectRole> findByRoleId(@Param("id")Integer id);
	
	
	@Query(value = "SELECT uupr.* FROM usm_permissions up,  usm_role_permissions urp, usm_user_project_role uupr WHERE up.permission LIKE CONCAT('%',:permission,'%') AND up.id= urp.permission AND urp.role = uupr.role_id AND uupr.project_id =:projectId AND uupr.portfolio_id =:portfolioId", nativeQuery = true)
	List<UserProjectRole> getUsersWithPermission(@Param("projectId") int projectId, @Param("portfolioId") int portfolioId, @Param("permission") String permission);

	@Query(value="SELECT COUNT(upr.role_id) From usm_user_project_role upr INNER JOIN usm_users u ON upr.user_id=u.id WHERE u.user_login=?1 AND upr.project_id=?2 AND upr.role_id=?3" ,nativeQuery = true)
	public Integer isRoleExistsByUserAndProjectIdAndRoleId(String user, Integer projectId, Integer roleId);
	
	@Query(value="SELECT upr.role_id FROM usm_user_project_role upr INNER JOIN usm_users u ON upr.user_id=u.id INNER JOIN usm_role r ON upr.role_id=r.id WHERE u.user_login=?1 AND upr.project_id=?2 AND r.name=?3",nativeQuery=true)
	public Integer getRoleIdByUserAndProjectIdAndRoleName(String user, Integer projectId, String roleName);

	@Modifying
	@Query(value = "DELETE FROM usm_user_project_role pr WHERE pr.user_id = :userId and pr.project_id = :autoUserProject",nativeQuery=true)
	void deleteByUserRoleId(@Param("userId") Integer userId, @Param("autoUserProject") Integer autoUserProject);
}
