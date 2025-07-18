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
package com.infosys.icets.iamp.usm.service;

import java.sql.SQLException;
import java.util.List;

import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.domain.Users;
import com.infosys.icets.iamp.usm.dto.UserPartialDTO;

// TODO: Auto-generated Javadoc
/**
 * Service Interface for managing Users.
 */
/**
* @author icets
*/
public interface UsersService {

	/**
	 * Save a users.
	 *
	 * @param users the entity to save
	 * @return the persisted entity
	 * @throws SQLException the SQL exception
	 */
	Users save(Users users) throws SQLException;

	/**
	 * Get all the userss.
	 *
	 * @param pageable the pagination information
	 * @return the list of entities
	 * @throws SQLException the SQL exception
	 */
	List<Users> findAll() throws SQLException;
	
	/**
	 * Get all the userss.
	 *
	 * @param pageable the pagination information
	 * @return the list of entities
	 * @throws SQLException the SQL exception
	 */
	Page<Users> findAll(Pageable pageable) throws SQLException;

	/**
	 * Get the "id" users.
	 *
	 * @param id the id of the entity
	 * @return the entity
	 * @throws SQLException the SQL exception
	 */
	Users findOne(Integer id) throws SQLException;

	/**
	 * Delete the "id" users.
	 *
	 * @param user the id of the entity
	 * @throws SQLException the SQL exception
	 */
	void delete(Users user) throws SQLException;

	/**
	 * Get all the userss with search.
	 *
	 * @param req the req
	 * @return the list of entities
	 * @throws SQLException the SQL exception
	 */
	PageResponse<Users> getAll(PageRequestByExample<Users> req) throws SQLException;

	/**
	 * To DTO.
	 *
	 * @param users the users
	 * @param depth the depth
	 * @return the users
	 */
	public Users toDTO(Users users, int depth);

	/**
	 * Authorize user.
	 *
	 * @param users the users
	 * @param orgName the org name
	 * @return the users
	 */
	Users authorizeUser(Users users, String orgName);

	/**
	 * Authenticate user.
	 *
	 * @param user the user
	 * @param orgName the org name
	 * @return the users
	 */
	Users authenticateUser(Users user, String orgName);

	/**
	 * Find by user login.
	 *
	 * @param example the example
	 * @return the users
	 */
	Users findByUserLogin(Example<Users> example);

	/**
	 * Find by user login.
	 *
	 * @param userLogin the user login
	 * @return the users
	 */
	Users findByUserLogin(String userLogin);

	/**
	 * Creates the user with default mapping.
	 *
	 * @param userName the user name
	 * @param userFirstname the user firstname
	 * @param userLastname the user lastname
	 * @param userEmail the user email
	 * @return the users
	 */
	public Users createUserWithDefaultMapping(String userName, String userFirstname,String userLastname, String userEmail);

	/**
	 * Update.
	 *
	 * @param users the users
	 * @return the users
	 * @throws SQLException the SQL exception
	 */
	Users update(Users users) throws SQLException;

	/**
	 * Reset .
	 *
	 * @param users the users
	 * @return the users
	 * @throws SQLException the SQL exception
	 */
	Users resetPassword(Users users) throws SQLException;
	
	/**
	 * Find email.
	 *
	 * @param email the email
	 * @return the user details
	 * @throws LeapException the leap exception
	 */
    Integer findEmail(String email) throws LeapException;

	/**
	 * Gets the paginated users list.
	 *
	 * @param pageable the pageable
	 * @return the paginated users list
	 */
	public PageResponse<Users> getPaginatedUsersList(Pageable pageable) throws SQLException;

	/**
	 * Search.
	 *
	 * @param pageable the pageable
	 * @param prbe the prbe
	 * @return the page response
	 */
	PageResponse<Users> search(Pageable pageable, PageRequestByExample<Users> prbe) throws SQLException;

	/**
	 * Gets the users list according to portfolio and project.
	 *
	 * @param text the text
	 * @param projectId the project id
	 * @param portfolioId the portfolio id
	 * @return the users list
	 * @throws SQLException the SQL exception
	 */
	List<Users> onKeyupUsersForExperiments(String text, Integer projectId, Integer portfolioId) throws SQLException;
	
	public List<Users> findUsersByPortfolio(Integer portfolioId) ;
	
	public Users revokeAccess(String userEmail) throws SQLException, LeapException;

	public List<UserPartialDTO> findUserDetailsIds(Integer[] fetchAllocatedUsers);

	public List<String> getProjectNameForUser(String email); 

	public List<String> getPortfolioNameForUser(String email); 
	
	public List<String> getActiveModules();

	public Users findUserDataByEmail(String email) throws LeapException;

	public PageResponse<Users> getProjectUsersList(Pageable pageable, Boolean portfolio, Integer Id) throws SQLException;

	public List<Users> getProjectOrPortUsersList(Boolean portfolio, Integer id) throws SQLException;

	public PageResponse<Users> searchProjectPortfolioUsers(Pageable pageable, PageRequestByExample<Users> prbe, Boolean portfolio,
			Integer id) throws SQLException;

	

}
