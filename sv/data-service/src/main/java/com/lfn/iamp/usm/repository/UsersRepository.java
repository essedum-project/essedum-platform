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

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;

import com.lfn.iamp.usm.domain.Users;
import com.lfn.iamp.usm.dto.UserPartialDTO;


// TODO: Auto-generated Javadoc
/**
 * Spring Data JPA repository for the Users entity.
 */
/**
* @author essedum
*/
@SuppressWarnings("unused")
//@Repository("usmUsersRepository")
@NoRepositoryBean
public interface UsersRepository extends JpaRepository<Users, Integer> {
	
	/**
	 * Find by user login.
	 *
	 * @param userLogin the user login
	 * @return the users
	 */
//	@Query(value = "SELECT * from usm_users WHERE user_login = ?1", nativeQuery = true)
	public Users findByUserLogin(String userLogin);

	/**
	 * Find by user email.
	 *
	 * @param user_email the user email
	 * @return the users
	 */
//	@Query(value = "SELECT * from usm_users WHERE user_email = ?1", nativeQuery = true)
	public Users findByUserEmail(String user_email);
	
	/**
	 * On keyup users for experiments.
	 *
	 * @param text the text
	 * @param projectId the project id
	 * @param portfolioId the portfolio id
	 * @return the list
	 */
//	@Query(value = "SELECT * FROM usm_users WHERE id IN "
//			+ "(SELECT DISTINCT(user_id) FROM usm_user_project_role WHERE portfolio_id= :portfolioId AND project_id= :projectId) "
//			+ "AND ( LOWER(user_f_name) like CONCAT('%',:text,'%') "
//			+ "OR LOWER(user_m_name) like CONCAT('%',:text,'%') "
//			+ "OR LOWER(user_l_name) like CONCAT('%',:text,'%') "
//			+ ")"
//			, nativeQuery = true)
    public List<Users> onKeyupUsersForExperiments(@Param("text") String text, @Param("projectId") Integer projectId, @Param("portfolioId") Integer portfolioId);
	
	/**
	 * Find user by ids.
	 *
	 * @param ids the ids
	 * @return the list
	 */
	@Query(value = "SELECT u from Users u WHERE u.id in :values AND u.activated = true")
	List<Users> findUserByIds(@Param("values")int[] ids);

	@Query(value = "SELECT distinct u.* from usm_user_project_role up inner join usm_users u on u.id = up.user_id where up.portfolio_id=:portfolioId AND u.activated = true",nativeQuery = true)
	List<Users> getUsersByPortfolio(@Param("portfolioId") Integer portfolioId);
	
	List<Users> getUsers (String userEmailid);
	
	@Query(value = "SELECT u.id as id,u.user_email as userEmail,u.user_l_name as userLName,u.user_f_name as userFName from Users u WHERE u.id in :values AND u.activated = true")
	List<UserPartialDTO> findUserDetailsById(@Param("values")Integer[] ids);

	@Query(value="SELECT PORTFOLIO_ID, name FROM usm_project u where u.PORTFOLIO_ID in (SELECT PORTFOLIO_ID FROM USM_USER_PROJECT_ROLE u2 where u2.USER_ID =(SELECT id FROM USM_USERS u3  WHERE u3.USER_EMAIL= :email)) AND u.activated = true" ,nativeQuery = true)
	public  List<String> getPermissionForModulesnew(@Param("email")String email);
	
	@Query(value="SELECT id, PORTFOLIO_NAME FROM USM_PORTFOLIO u where u.id in (SELECT PORTFOLIO_ID FROM USM_USER_PROJECT_ROLE u2 where u2.USER_ID =(SELECT id FROM USM_USERS u3  WHERE u3.USER_EMAIL= :email)) AND u.activated = true" ,nativeQuery = true)
	public  List<String> getPortfolioNameForUser(@Param("email")String email); 
	
	@Query(value="Select display_name FROM usm_module u where u.url != ''" ,nativeQuery = true)
	public  List<String> getActiveModules();

	public Users findUser(String userLogin);
}
