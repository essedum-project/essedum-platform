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
package com.infosys.icets.iamp.usm.repository.mssql;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.iamp.usm.domain.Users;
import com.infosys.icets.iamp.usm.repository.UsersRepository;

@Profile("mssql")
@Repository
public interface UsersRepositoryMSSQL extends UsersRepository {

	@Query(value= "SELECT * from usm_users WHERE user_login = ?1 AND activated = 1" ,nativeQuery = true)
	public Users findByUserLogin(String userLogin);

	@Query(value="SELECT * from usm_users WHERE user_email = ?1 AND activated = 1" ,nativeQuery = true)
	public Users findByUserEmail(String user_email);

	@Query(value="SELECT * FROM usm_users WHERE id IN (SELECT DISTINCT(user_id) FROM usm_user_project_role WHERE portfolio_id= ?3 AND project_id= ?2) AND ( LOWER(user_f_name) like CONCAT('%',?1,'%') OR LOWER(user_m_name) like CONCAT('%',?1,'%') OR LOWER(user_l_name) like CONCAT('%',?1,'%')) AND activated = 1", nativeQuery = true)
	public List<Users> onKeyupUsersForExperiments(String text, Integer projectId, Integer portfolioId);


	@Query(value = "SELECT * from usm_users u WHERE u.id in :values AND u.activated = 1", nativeQuery = true)
	List<Users> findUserByIds(@Param("values")int[] ids);

	@Query(value = "SELECT distinct u.* from usm_user_project_role up inner join usm_users u on u.id = up.user_id where up.portfolio_id=:portfolioId AND u.activated = 1",nativeQuery = true)
	List<Users> getUsersByPortfolio(@Param("portfolioId") Integer portfolioId);
	
	@Query(value = "SELECT * FROM usm_users where user_email = ?1 AND user_act_ind = 0 AND activated= 1", nativeQuery = true)
	List<Users> getUsers (String userEmailid);

    @Query(value= "SELECT * from usm_users WHERE user_login = ?1", nativeQuery = true)
	public Users findUser(String userLogin);

}
