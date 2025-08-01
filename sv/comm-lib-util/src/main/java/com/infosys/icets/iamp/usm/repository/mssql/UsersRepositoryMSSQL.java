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
